[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern("^[0-9A-F]{40}$")]
  [string]$Thumbprint,

  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$ExpectedSubject,

  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"
$ConfirmPreference = "None"
Set-StrictMode -Version Latest

function Assert-CreateOnlyOutputPath {
  param([Parameter(Mandatory = $true)][string]$Path)

  $repositoryRoot = [IO.Path]::GetFullPath(
    (Join-Path $PSScriptRoot "..\..\..")
  )
  $resolved = [IO.Path]::GetFullPath($Path)
  $repositoryPrefix = $repositoryRoot.TrimEnd("\") + "\"
  if (
    -not $resolved.StartsWith(
      $repositoryPrefix,
      [StringComparison]::OrdinalIgnoreCase
    )
  ) {
    throw "Cleanup evidence must remain inside the repository."
  }
  $relative = $resolved.Substring($repositoryPrefix.Length).Replace("\", "/")

  $namespace = $null
  $identityPattern = $null
  foreach ($candidate in @(
    [pscustomobject]@{
      prefix = ".artifacts/sprint-30-5/stage-2-r8-engineering-freeze/"
      identity = "^candidate-r8-\d{8}T\d{9}Z-[0-9a-f]{8}$"
    },
    [pscustomobject]@{
      prefix = ".artifacts/sprint-30-5/stage-2-requalification-r8/"
      identity = "^stage2-r8-\d{8}T\d{9}Z-[0-9a-f]{8}$"
    }
  )) {
    if ($relative.StartsWith([string]$candidate.prefix, [StringComparison]::OrdinalIgnoreCase)) {
      $namespace = [string]$candidate.prefix
      $identityPattern = [string]$candidate.identity
      break
    }
  }
  if (
    $null -eq $namespace -or
    $relative.Contains("/../") -or
    $relative.EndsWith("/..", [StringComparison]::Ordinal)
  ) {
    throw "Cleanup evidence must be inside an admitted R8 engineering-freeze or attempt root."
  }
  $identity = $relative.Substring($namespace.Length).Split("/")[0]
  if ($identity -notmatch $identityPattern) {
    throw "Cleanup evidence does not identify a valid immutable R8 lifecycle root."
  }

  $cursor = $repositoryRoot
  foreach ($segment in $relative.Split("/")) {
    $cursor = Join-Path $cursor $segment
    if (
      (Test-Path -LiteralPath $cursor) -and
      (
        (
          Get-Item -LiteralPath $cursor -Force
        ).Attributes -band [IO.FileAttributes]::ReparsePoint
      )
    ) {
      throw "Cleanup evidence path traverses a reparse point."
    }
  }

  foreach ($protected in @(
    ".artifacts/sprint-30-5/stage-2/",
    "docs/sprints/evidence/sprint-30-5/stage-2/",
    "docs/sprints/evidence/sprint-30-5/stage-3"
  )) {
    if ($relative.StartsWith($protected, [StringComparison]::OrdinalIgnoreCase)) {
      throw "Cleanup evidence cannot target historical qualification data."
    }
  }

  if (Test-Path -LiteralPath $resolved) {
    throw "Cleanup evidence already exists; overwrite is forbidden."
  }
  return $resolved
}

function Get-ExactCertificateMatches {
  $matches = [Collections.Generic.List[object]]::new()
  foreach ($location in @("CurrentUser", "LocalMachine")) {
    foreach ($store in @("My", "Root", "TrustedPeople")) {
      $storePath = "Cert:\$location\$store"
      if (-not (Test-Path -LiteralPath $storePath)) {
        continue
      }
      $certificate = Get-ChildItem -LiteralPath $storePath |
        Where-Object { $_.Thumbprint -ceq $Thumbprint }
      foreach ($item in @($certificate)) {
        $matches.Add([pscustomobject]@{
          Location = $location
          Store = $store
          Certificate = $item
        })
      }
    }
  }
  return @($matches)
}

function Assert-ExactCertificateIdentity {
  param(
    [Parameter(Mandatory = $true)]
    [object]$Match,

    [Parameter(Mandatory = $true)]
    [string]$ExpectedRawData,

    [Parameter(Mandatory = $true)]
    [bool]$RequirePrivateKey
  )

  if ($Match.Certificate.Thumbprint -cne $Thumbprint) {
    throw "Exact certificate match has an unexpected thumbprint."
  }
  if ([string]$Match.Certificate.Subject -cne $ExpectedSubject) {
    throw (
      "Exact thumbprint exists with an unexpected subject in " +
      "$($Match.Location)\$($Match.Store)."
    )
  }
  if (
    [Convert]::ToBase64String($Match.Certificate.RawData) -cne
    $ExpectedRawData
  ) {
    throw (
      "Exact thumbprint has unexpected certificate bytes in " +
      "$($Match.Location)\$($Match.Store)."
    )
  }
  if (
    $RequirePrivateKey -and
    -not [bool]$Match.Certificate.HasPrivateKey
  ) {
    throw "The CurrentUser\My signing certificate has no private key."
  }
  if (
    -not $RequirePrivateKey -and
    [bool]$Match.Certificate.HasPrivateKey
  ) {
    throw "The CurrentUser\Root trust certificate unexpectedly has a private key."
  }
}

function Invoke-ExactRootRemoval {
  $certUtilPath = Join-Path ([Environment]::SystemDirectory) "certutil.exe"
  if (-not (Test-Path -LiteralPath $certUtilPath -PathType Leaf)) {
    throw "The Windows System32 CertUtil executable is unavailable."
  }

  $certUtilArguments = @(
    "-user",
    "-delstore",
    "Root",
    $Thumbprint
  )
  if ($certUtilArguments -contains "-f") {
    throw "CertUtil force behaviour is forbidden."
  }

  $startInfo = [Diagnostics.ProcessStartInfo]::new()
  $startInfo.FileName = $certUtilPath
  $startInfo.Arguments = (
    $certUtilArguments |
      ForEach-Object {
        '"' + $_ + '"'
      }
  ) -join " "
  $startInfo.UseShellExecute = $false
  $startInfo.CreateNoWindow = $true
  $startInfo.RedirectStandardOutput = $true
  $startInfo.RedirectStandardError = $true

  $startedAt = [DateTime]::UtcNow
  $completedAt = $null
  $exitCode = $null
  $signal = $null
  $processError = $null
  $stdout = ""
  $stderr = ""
  $process = [Diagnostics.Process]::new()
  $process.StartInfo = $startInfo

  try {
    if (-not $process.Start()) {
      throw "CertUtil did not start."
    }
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    $process.WaitForExit()
    $stdout = $stdoutTask.GetAwaiter().GetResult()
    $stderr = $stderrTask.GetAwaiter().GetResult()
    $exitCode = $process.ExitCode
  }
  catch {
    $processError = $_.Exception.Message
  }
  finally {
    $completedAt = [DateTime]::UtcNow
    $process.Dispose()
  }

  $processEvidence = [ordered]@{
    invoked = $true
    executable = $certUtilPath
    arguments = $certUtilArguments
    startedAt = $startedAt.ToString("o")
    completedAt = $completedAt.ToString("o")
    stdout = $stdout
    stderr = $stderr
    exitCode = $exitCode
    signal = $signal
    processError = $processError
  }

  if (
    $null -ne $processError -or
    $null -ne $signal -or
    $null -eq $exitCode -or
    $exitCode -ne 0
  ) {
    $compactEvidence = $processEvidence | ConvertTo-Json -Compress -Depth 5
    throw "Exact CurrentUser\Root removal failed. Evidence=$compactEvidence"
  }

  return $processEvidence
}

$resolvedOutput = Assert-CreateOnlyOutputPath -Path $OutputPath
$matches = @(Get-ExactCertificateMatches)

if ($matches.Count -eq 0) {
  throw "The exact generated R8 certificate thumbprint was not found."
}

$myMatches = @(
  $matches |
    Where-Object {
      $_.Location -ceq "CurrentUser" -and
      $_.Store -ceq "My"
    }
)
$rootMatches = @(
  $matches |
    Where-Object {
      $_.Location -ceq "CurrentUser" -and
      $_.Store -ceq "Root"
    }
)
$unexpectedMatches = @(
  $matches |
    Where-Object {
      -not (
        $_.Location -ceq "CurrentUser" -and
        ($_.Store -ceq "My" -or $_.Store -ceq "Root")
      )
    }
)

if ($myMatches.Count -ne 1) {
  throw "Expected exactly one CurrentUser\My signing certificate."
}
if ($rootMatches.Count -gt 1) {
  throw "More than one CurrentUser\Root trust certificate was found."
}
if ($unexpectedMatches.Count -ne 0) {
  throw "The exact attempt certificate exists in an unexpected governed store."
}

$expectedRawData = [Convert]::ToBase64String(
  $myMatches[0].Certificate.RawData
)
Assert-ExactCertificateIdentity `
  -Match $myMatches[0] `
  -ExpectedRawData $expectedRawData `
  -RequirePrivateKey $true

if ($rootMatches.Count -eq 1) {
  Assert-ExactCertificateIdentity `
    -Match $rootMatches[0] `
    -ExpectedRawData $expectedRawData `
    -RequirePrivateKey $false
}

$removed = [Collections.Generic.List[object]]::new()
$rootRemoval = [ordered]@{
  invoked = $false
  executable = $null
  arguments = @()
  startedAt = $null
  completedAt = $null
  stdout = ""
  stderr = ""
  exitCode = $null
  signal = $null
  processError = $null
}

if ($rootMatches.Count -eq 1) {
  $rootTarget = "Cert:\CurrentUser\Root\$Thumbprint"
  if ($PSCmdlet.ShouldProcess($rootTarget, "Remove exact R8 Root trust")) {
    $rootRemoval = Invoke-ExactRootRemoval
    [Console]::Error.WriteLine(
      "ORACLE_R8_ROOT_REMOVAL_PROCESS=" +
      (
        $rootRemoval |
          ConvertTo-Json -Compress -Depth 5
      )
    )
    $afterRootRemoval = @(Get-ExactCertificateMatches)
    $remainingRootMatches = @(
      $afterRootRemoval |
        Where-Object {
          $_.Location -ceq "CurrentUser" -and
          $_.Store -ceq "Root"
        }
    )
    $remainingMyMatches = @(
      $afterRootRemoval |
        Where-Object {
          $_.Location -ceq "CurrentUser" -and
          $_.Store -ceq "My"
        }
    )
    $unexpectedAfterRootRemoval = @(
      $afterRootRemoval |
        Where-Object {
          -not (
            $_.Location -ceq "CurrentUser" -and
            $_.Store -ceq "My"
          )
        }
    )
    if ($remainingRootMatches.Count -ne 0) {
      throw "The exact CurrentUser\Root trust certificate remains after removal."
    }
    if (
      $remainingMyMatches.Count -ne 1 -or
      $unexpectedAfterRootRemoval.Count -ne 0
    ) {
      throw "Certificate-store state changed unexpectedly during Root removal."
    }
    Assert-ExactCertificateIdentity `
      -Match $remainingMyMatches[0] `
      -ExpectedRawData $expectedRawData `
      -RequirePrivateKey $true

    $removed.Add([ordered]@{
      location = "CurrentUser"
      store = "Root"
      thumbprint = $Thumbprint
      subject = [string]$rootMatches[0].Certificate.Subject
      hadPrivateKey = [bool]$rootMatches[0].Certificate.HasPrivateKey
      certificateBytesMatched = $true
    })
  }
}

$myTarget = "Cert:\CurrentUser\My\$Thumbprint"
if ($PSCmdlet.ShouldProcess($myTarget, "Remove exact R8 signing certificate")) {
  $myBeforeRemoval = @(
    Get-ExactCertificateMatches |
      Where-Object {
        $_.Location -ceq "CurrentUser" -and
        $_.Store -ceq "My"
      }
  )
  if ($myBeforeRemoval.Count -ne 1) {
    throw "CurrentUser\My signing-certificate state changed before removal."
  }
  Assert-ExactCertificateIdentity `
    -Match $myBeforeRemoval[0] `
    -ExpectedRawData $expectedRawData `
    -RequirePrivateKey $true

  Remove-Item -LiteralPath $myTarget -Force -ErrorAction Stop
  $removed.Add([ordered]@{
    location = "CurrentUser"
    store = "My"
    thumbprint = $Thumbprint
    subject = [string]$myBeforeRemoval[0].Certificate.Subject
    hadPrivateKey = [bool]$myBeforeRemoval[0].Certificate.HasPrivateKey
    certificateBytesMatched = $true
  })
}

$remaining = @(Get-ExactCertificateMatches)
if ($remaining.Count -ne 0) {
  throw "Exact R8 certificate thumbprint remains after cleanup."
}

$evidence = [ordered]@{
  schemaVersion = "1.0.0"
  contract = "oracle.sprint-30-5.stage-2-requalification-r8-certificate-cleanup"
  programmeIdentity = "Sprint 30.5 Stage 2 Requalification R8"
  completedAt = [DateTime]::UtcNow.ToString("o")
  status = "passed"
  expectedSubject = $ExpectedSubject
  exactThumbprint = $Thumbprint
  removed = @($removed)
  rootRemoval = $rootRemoval
  remainingExactThumbprintMatches = 0
  subjectWideRemovalUsed = $false
  trustRemoved = $true
}

$parent = Split-Path -Parent $resolvedOutput
if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
  throw "The governed R8 attempt directory does not exist."
}

$temporary = Join-Path $parent (
  "." + [IO.Path]::GetFileName($resolvedOutput) +
  ".tmp-" + [guid]::NewGuid().ToString("N")
)
$utf8NoBom = [Text.UTF8Encoding]::new($false)
try {
  $json = $evidence | ConvertTo-Json -Depth 8
  $stream = [IO.File]::Open(
    $temporary,
    [IO.FileMode]::CreateNew,
    [IO.FileAccess]::Write,
    [IO.FileShare]::None
  )
  try {
    $writer = [IO.StreamWriter]::new($stream, $utf8NoBom)
    try {
      $writer.Write($json + [Environment]::NewLine)
      $writer.Flush()
    }
    finally {
      $writer.Dispose()
    }
  }
  finally {
    if ($null -ne $stream) {
      $stream.Dispose()
    }
  }
  if (Test-Path -LiteralPath $resolvedOutput) {
    throw "Cleanup evidence target appeared before atomic finalisation."
  }
  [IO.File]::Move($temporary, $resolvedOutput)
}
finally {
  if (Test-Path -LiteralPath $temporary) {
    Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue
  }
}

$evidence | ConvertTo-Json -Depth 8
