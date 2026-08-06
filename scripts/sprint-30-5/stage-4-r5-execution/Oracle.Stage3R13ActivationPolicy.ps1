Set-StrictMode -Version Latest

function Assert-OracleStage3R13ApplicationActivationContract {
  [CmdletBinding()]
  param([Parameter(Mandatory = $true)]$Contract)

  $property = $Contract.PSObject.Properties["applicationActivation"]
  if ($null -eq $property) {
    throw "The contract does not define application activation."
  }
  $activation = $property.Value
  $expected = [ordered]@{
    api = "IApplicationActivationManager.ActivateApplication"
    classId = "45BA127D-10A8-46EA-8AB7-56EA9078943C"
    interfaceId = "2E941141-7F97-4756-BA1D-9DECDE894A3D"
    classContext = "CLSCTX_LOCAL_SERVER"
    activateOptions = "AO_NOERRORUI"
    successHresult = "0x00000000"
  }
  foreach ($name in $expected.Keys) {
    $member = $activation.PSObject.Properties[$name]
    if ($null -eq $member -or [string]$member.Value -cne $expected[$name]) {
      throw "The application-activation contract differs at $name."
    }
  }
  if (
    $activation.requiresNonzeroProcessId -ne $true -or
    $activation.explorerExitCodeIsQualificationEvidence -ne $false -or
    @($activation.runtimeProof).Count -ne 2 -or
    @($activation.runtimeProof) -cnotcontains "Oracle.WindowDiscovery" -or
    @($activation.runtimeProof) -cnotcontains "Oracle.WindowObserver"
  ) {
    throw "The application-activation success contract differs."
  }
}

function Initialize-OracleStage3R13ActivationApi {
  if ($null -ne ("Oracle.Stage3R13.ApplicationActivation" -as [type])) {
    return
  }

  Add-Type -Language CSharp -ErrorAction Stop -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace Oracle.Stage3R13
{
    [ComImport]
    [Guid("2E941141-7F97-4756-BA1D-9DECDE894A3D")]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IApplicationActivationManager
    {
        [PreserveSig]
        int ActivateApplication(
            [MarshalAs(UnmanagedType.LPWStr)] string appUserModelId,
            [MarshalAs(UnmanagedType.LPWStr)] string arguments,
            uint options,
            out uint processId);

        [PreserveSig]
        int ActivateForFile(
            [MarshalAs(UnmanagedType.LPWStr)] string appUserModelId,
            IntPtr itemArray,
            [MarshalAs(UnmanagedType.LPWStr)] string verb,
            out uint processId);

        [PreserveSig]
        int ActivateForProtocol(
            [MarshalAs(UnmanagedType.LPWStr)] string appUserModelId,
            IntPtr itemArray,
            out uint processId);
    }

    public sealed class ActivationNativeResult
    {
        public string HResult { get; set; }
        public uint ProcessId { get; set; }
    }

    public static class ApplicationActivation
    {
        private const uint CLSCTX_LOCAL_SERVER = 0x4;
        private static readonly Guid ClassId =
            new Guid("45BA127D-10A8-46EA-8AB7-56EA9078943C");
        private static readonly Guid InterfaceId =
            new Guid("2E941141-7F97-4756-BA1D-9DECDE894A3D");

        [DllImport("ole32.dll")]
        private static extern int CoCreateInstance(
            ref Guid classId,
            IntPtr outer,
            uint classContext,
            ref Guid interfaceId,
            out IntPtr instance);

        private static string FormatHResult(int value)
        {
            return String.Format(
                System.Globalization.CultureInfo.InvariantCulture,
                "0x{0:X8}",
                unchecked((uint)value));
        }

        private static int CreateManager(
            out IApplicationActivationManager manager)
        {
            manager = null;
            IntPtr pointer = IntPtr.Zero;
            Guid classId = ClassId;
            Guid interfaceId = InterfaceId;
            int result = CoCreateInstance(
                ref classId,
                IntPtr.Zero,
                CLSCTX_LOCAL_SERVER,
                ref interfaceId,
                out pointer);
            if (result < 0)
            {
                return result;
            }
            try
            {
                manager = (IApplicationActivationManager)
                    Marshal.GetObjectForIUnknown(pointer);
                return 0;
            }
            finally
            {
                if (pointer != IntPtr.Zero)
                {
                    Marshal.Release(pointer);
                }
            }
        }

        public static ActivationNativeResult Probe()
        {
            IApplicationActivationManager manager;
            int result = CreateManager(out manager);
            try
            {
                return new ActivationNativeResult
                {
                    HResult = FormatHResult(result),
                    ProcessId = 0
                };
            }
            finally
            {
                if (manager != null)
                {
                    Marshal.FinalReleaseComObject(manager);
                }
            }
        }

        public static ActivationNativeResult Activate(
            string appUserModelId,
            string arguments,
            uint options)
        {
            IApplicationActivationManager manager;
            int result = CreateManager(out manager);
            uint processId = 0;
            try
            {
                if (result >= 0)
                {
                    result = manager.ActivateApplication(
                        appUserModelId,
                        arguments,
                        options,
                        out processId);
                }
                return new ActivationNativeResult
                {
                    HResult = FormatHResult(result),
                    ProcessId = processId
                };
            }
            finally
            {
                if (manager != null)
                {
                    Marshal.FinalReleaseComObject(manager);
                }
            }
        }
    }
}
'@
}

function Test-OracleStage3R13ApplicationActivationApi {
  [CmdletBinding()]
  param([scriptblock]$ProbeRunner)

  $startedAtUtc = [DateTime]::UtcNow
  $hresult = $null
  $errorMessage = $null
  try {
    $native = if ($null -ne $ProbeRunner) {
      & $ProbeRunner
    } else {
      Initialize-OracleStage3R13ActivationApi
      [Oracle.Stage3R13.ApplicationActivation]::Probe()
    }
    if (
      $null -eq $native -or
      $null -eq $native.PSObject.Properties["HResult"]
    ) {
      throw "The application-activation probe returned an incomplete result."
    }
    $hresult = [string]$native.HResult
  } catch {
    $errorMessage = $_.Exception.Message
    $hresult = "0x$(
      [Convert]::ToString(
        ($_.Exception.HResult -band 0xffffffff), 16
      ).PadLeft(8, '0').ToUpperInvariant()
    )"
  }
  [pscustomobject][ordered]@{
    api = "IApplicationActivationManager"
    classId = "45BA127D-10A8-46EA-8AB7-56EA9078943C"
    interfaceId = "2E941141-7F97-4756-BA1D-9DECDE894A3D"
    classContext = "CLSCTX_LOCAL_SERVER"
    startedAtUtc = $startedAtUtc.ToString("o")
    completedAtUtc = [DateTime]::UtcNow.ToString("o")
    hresult = $hresult
    error = $errorMessage
    available = ($null -eq $errorMessage -and $hresult -ceq "0x00000000")
  }
}

function Invoke-OracleStage3R13ApplicationActivation {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][string]$AppUserModelId,
    [string]$Arguments = "",
    [scriptblock]$ActivationRunner
  )

  if (
    [string]::IsNullOrWhiteSpace($AppUserModelId) -or
    $AppUserModelId.Length -gt 130 -or
    $AppUserModelId -cnotmatch '^[^!\s]+![^!\s]+$'
  ) {
    throw "The AppUserModelId is malformed."
  }
  if ($Arguments.Contains([char]0)) {
    throw "Activation arguments contain a null character."
  }

  $startedAtUtc = [DateTime]::UtcNow
  $hresult = $null
  $processId = [uint32]0
  $errorMessage = $null
  try {
    $native = if ($null -ne $ActivationRunner) {
      & $ActivationRunner $AppUserModelId $Arguments
    } else {
      Initialize-OracleStage3R13ActivationApi
      [Oracle.Stage3R13.ApplicationActivation]::Activate(
        $AppUserModelId,
        $Arguments,
        [uint32]2
      )
    }
    if (
      $null -eq $native -or
      $null -eq $native.PSObject.Properties["HResult"] -or
      $null -eq $native.PSObject.Properties["ProcessId"]
    ) {
      throw "The application-activation API returned an incomplete result."
    }
    $hresult = [string]$native.HResult
    $processId = [uint32]$native.ProcessId
  } catch {
    $errorMessage = $_.Exception.Message
    $hresult = "0x$(
      [Convert]::ToString(
        ($_.Exception.HResult -band 0xffffffff), 16
      ).PadLeft(8, '0').ToUpperInvariant()
    )"
  }

  [pscustomobject][ordered]@{
    api = "IApplicationActivationManager.ActivateApplication"
    classId = "45BA127D-10A8-46EA-8AB7-56EA9078943C"
    interfaceId = "2E941141-7F97-4756-BA1D-9DECDE894A3D"
    classContext = "CLSCTX_LOCAL_SERVER"
    appUserModelId = $AppUserModelId
    arguments = $Arguments
    activateOptions = "AO_NOERRORUI"
    startedAtUtc = $startedAtUtc.ToString("o")
    completedAtUtc = [DateTime]::UtcNow.ToString("o")
    hresult = $hresult
    processId = $processId
    error = $errorMessage
  }
}

function Assert-OracleStage3R13ApplicationActivationSucceeded {
  [CmdletBinding()]
  param([Parameter(Mandatory = $true)]$Result)

  foreach ($name in @(
    "api", "classId", "interfaceId", "classContext", "appUserModelId",
    "arguments", "activateOptions", "startedAtUtc", "completedAtUtc",
    "hresult", "processId", "error"
  )) {
    if ($null -eq $Result.PSObject.Properties[$name]) {
      throw "Activation result is missing mandatory member '$name'."
    }
  }
  if (
    $null -ne $Result.error -or
    [string]$Result.hresult -cne "0x00000000" -or
    [uint32]$Result.processId -eq 0 -or
    [string]$Result.api -cne
      "IApplicationActivationManager.ActivateApplication" -or
    [string]$Result.classId -cne
      "45BA127D-10A8-46EA-8AB7-56EA9078943C" -or
    [string]$Result.interfaceId -cne
      "2E941141-7F97-4756-BA1D-9DECDE894A3D" -or
    [string]$Result.classContext -cne "CLSCTX_LOCAL_SERVER" -or
    [string]$Result.activateOptions -cne "AO_NOERRORUI"
  ) {
    throw (
      "Direct AppX activation failed: HRESULT=$($Result.hresult); " +
      "PID=$($Result.processId); error=$($Result.error)"
    )
  }
}
