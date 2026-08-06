Set-StrictMode -Version Latest

function Get-OracleStage3R13RequiredWindowMember {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][object]$InputObject,
    [Parameter(Mandatory = $true)][string]$Name
  )

  if ($InputObject -is [Array]) {
    throw "Window discovery entry '$Name' is nested instead of an object."
  }
  $property = $InputObject.PSObject.Properties[$Name]
  if ($null -eq $property) {
    throw "Window discovery entry is missing mandatory member '$Name'."
  }
  if ($property.Value -is [Array]) {
    throw "Window discovery member '$Name' must be scalar."
  }
  $property.Value
}

function ConvertFrom-OracleStage3R13WindowDiscoveryJson {
  [CmdletBinding()]
  param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Json)

  if ([string]::IsNullOrWhiteSpace($Json)) {
    throw "Window discovery returned empty JSON."
  }
  try {
    $decoded = $Json | ConvertFrom-Json -ErrorAction Stop
  } catch {
    throw "Window discovery returned invalid JSON: $($_.Exception.Message)"
  }
  if ($null -eq $decoded -or -not ($decoded -is [Array])) {
    throw "Window discovery JSON root must be an array."
  }

  foreach ($entry in $decoded) {
    if ($null -eq $entry -or $entry -is [Array]) {
      throw "Window discovery JSON contains a null or nested-array entry."
    }
    foreach ($member in @(
      "handle", "title", "processId", "processName", "visible", "minimized",
      "x", "y", "width", "height"
    )) {
      [void](Get-OracleStage3R13RequiredWindowMember $entry $member)
    }
    $entry
  }
}

function Test-OracleStage3R13QualifyingWindow {
  [CmdletBinding()]
  param([Parameter(Mandatory = $true)][object]$Window)

  $handle = 0L
  $processId = 0
  $width = 0
  $height = 0
  if (
    -not [Int64]::TryParse(
      [string](Get-OracleStage3R13RequiredWindowMember $Window "handle"),
      [Globalization.NumberStyles]::Integer,
      [Globalization.CultureInfo]::InvariantCulture,
      [ref]$handle
    ) -or
    -not [Int32]::TryParse(
      [string](Get-OracleStage3R13RequiredWindowMember $Window "processId"),
      [Globalization.NumberStyles]::Integer,
      [Globalization.CultureInfo]::InvariantCulture,
      [ref]$processId
    ) -or
    -not [Int32]::TryParse(
      [string](Get-OracleStage3R13RequiredWindowMember $Window "width"),
      [Globalization.NumberStyles]::Integer,
      [Globalization.CultureInfo]::InvariantCulture,
      [ref]$width
    ) -or
    -not [Int32]::TryParse(
      [string](Get-OracleStage3R13RequiredWindowMember $Window "height"),
      [Globalization.NumberStyles]::Integer,
      [Globalization.CultureInfo]::InvariantCulture,
      [ref]$height
    )
  ) {
    throw "Window discovery contains a malformed numeric identity or bound."
  }

  (
    [string](Get-OracleStage3R13RequiredWindowMember $Window "processName") -ceq
      "Oracle" -and
    (Get-OracleStage3R13RequiredWindowMember $Window "visible") -eq $true -and
    (Get-OracleStage3R13RequiredWindowMember $Window "minimized") -eq $false -and
    $handle -gt 0 -and $processId -gt 0 -and $width -ge 1 -and $height -ge 1
  )
}

function Initialize-OracleStage3R13AppModelProcessIdentity {
  if ("Oracle.Stage3R13.AppModelProcessIdentity" -as [type]) { return }
  Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;

namespace Oracle.Stage3R13
{
    public sealed class ProcessOpenException : Win32Exception
    {
        public uint ProcessId { get; private set; }

        public ProcessOpenException(uint processId, int nativeError)
            : base(nativeError, "OpenProcess failed.")
        {
            ProcessId = processId;
        }
    }

    public static class AppModelProcessIdentity
    {
        private const uint ProcessQueryLimitedInformation = 0x1000;
        private const int ErrorInsufficientBuffer = 122;

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern IntPtr OpenProcess(
            uint desiredAccess, bool inheritHandle, uint processId);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool CloseHandle(IntPtr handle);

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
        private static extern int GetPackageFamilyName(
            IntPtr process, ref uint length, StringBuilder familyName);

        public static string QueryPackageFamilyName(uint processId)
        {
            IntPtr process = OpenProcess(
                ProcessQueryLimitedInformation, false, processId);
            if (process == IntPtr.Zero)
                throw new ProcessOpenException(
                    processId, Marshal.GetLastWin32Error());
            try
            {
                uint length = 0;
                int result = GetPackageFamilyName(process, ref length, null);
                if (result != ErrorInsufficientBuffer || length < 2)
                    throw new Win32Exception(
                        result, "GetPackageFamilyName size query failed.");
                StringBuilder value = new StringBuilder((int)length);
                result = GetPackageFamilyName(process, ref length, value);
                if (result != 0)
                    throw new Win32Exception(
                        result, "GetPackageFamilyName query failed.");
                return value.ToString();
            }
            finally
            {
                CloseHandle(process);
            }
        }
    }
}
'@
}

function Get-OracleStage3R13ProcessOpenFailure {
  [CmdletBinding()]
  param([Parameter(Mandatory = $true)][object]$ErrorRecord)

  $exception = $ErrorRecord.Exception
  while ($null -ne $exception) {
    if (
      $exception.GetType().FullName -ceq
        "Oracle.Stage3R13.ProcessOpenException"
    ) { return $exception }
    $exception = $exception.InnerException
  }
  $null
}

function Test-OracleStage3R13ProcessExists {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][ValidateRange(1, [int]::MaxValue)]
    [int]$ProcessId,
    [scriptblock]$ProcessQuery
  )

  $query = if ($null -eq $ProcessQuery) {
    {
      param($Id)
      Get-Process -Id $Id -ErrorAction Stop
    }
  } else {
    $ProcessQuery
  }
  try {
    $matches = @(& $query $ProcessId)
  } catch {
    if (
      $_.Exception.GetType().FullName -ceq
        "Microsoft.PowerShell.Commands.ProcessCommandException" -and
      $_.FullyQualifiedErrorId -ceq (
        "NoProcessFoundForGivenId," +
        "Microsoft.PowerShell.Commands.GetProcessCommand"
      ) -and
      $_.CategoryInfo.Category -eq
        [Management.Automation.ErrorCategory]::ObjectNotFound -and
      [string]$_.CategoryInfo.TargetName -ceq [string]$ProcessId
    ) {
      return $false
    }
    throw
  }
  if ($matches.Count -ne 1) {
    throw "Process query returned unexpected cardinality for PID $ProcessId."
  }
  if ([int]$matches[0].Id -ne $ProcessId) {
    throw "Process query returned a different PID than requested."
  }
  -not [bool]$matches[0].HasExited
}

function Resolve-OracleStage3R13TeardownProcessOwnership {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][ValidateRange(1, [int]::MaxValue)]
    [int]$ProcessId,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()]
    [string]$ExpectedPackageFamilyName,
    [scriptblock]$OwnershipResolver,
    [scriptblock]$ProcessExists
  )

  $exists = if ($null -eq $ProcessExists) {
    { param($Id) Test-OracleStage3R13ProcessExists -ProcessId $Id }
  } else {
    $ProcessExists
  }
  try {
    $ownership = Assert-OracleStage3R13ProcessPackageOwnership `
      -ProcessId $ProcessId `
      -ExpectedPackageFamilyName $ExpectedPackageFamilyName `
      -Resolver $OwnershipResolver
    return [ordered]@{
      processId = $ProcessId
      classification = "owned-live-process"
      ownership = $ownership
      safeToStop = $true
    }
  } catch {
    $queryFailure = $_
    $openFailure = Get-OracleStage3R13ProcessOpenFailure $queryFailure
    if ($null -eq $openFailure) {
      throw
    }
    if ([int]$openFailure.NativeErrorCode -ne 87) {
      throw (
        "AppModel ownership OpenProcess failed with non-exit error " +
        "$([int]$openFailure.NativeErrorCode) for process ${ProcessId}: " +
        $queryFailure.Exception.Message
      )
    }
    $stillExists = [bool](& $exists $ProcessId)
    if ($stillExists) {
      throw (
        "AppModel ownership OpenProcess failed for live process " +
        "${ProcessId}: $($queryFailure.Exception.Message)"
      )
    }
    return [ordered]@{
      processId = $ProcessId
      classification = "exited-before-ownership-query"
      ownership = $null
      safeToStop = $false
    }
  }
}

function Get-OracleStage3R13ProcessPackageFamilyName {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][ValidateRange(1, [int]::MaxValue)]
    [int]$ProcessId,
    [scriptblock]$Resolver
  )

  $familyName = if ($null -ne $Resolver) {
    & $Resolver $ProcessId
  } else {
    Initialize-OracleStage3R13AppModelProcessIdentity
    [Oracle.Stage3R13.AppModelProcessIdentity]::QueryPackageFamilyName(
      [uint32]$ProcessId
    )
  }
  if ([string]::IsNullOrWhiteSpace([string]$familyName)) {
    throw "Process $ProcessId has no usable AppModel package-family identity."
  }
  [string]$familyName
}

function Assert-OracleStage3R13ProcessPackageOwnership {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][ValidateRange(1, [int]::MaxValue)]
    [int]$ProcessId,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()]
    [string]$ExpectedPackageFamilyName,
    [scriptblock]$Resolver
  )

  $observed = Get-OracleStage3R13ProcessPackageFamilyName `
    -ProcessId $ProcessId -Resolver $Resolver
  if (-not [StringComparer]::OrdinalIgnoreCase.Equals(
    $observed, $ExpectedPackageFamilyName
  )) {
    throw "Process $ProcessId is not owned by the governed package family."
  }
  [ordered]@{
    processId = $ProcessId
    expectedPackageFamilyName = $ExpectedPackageFamilyName
    observedPackageFamilyName = $observed
    comparison = "ordinal-ignore-case"
    matched = $true
  }
}
