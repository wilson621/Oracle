[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$AppUserModelId,
  [Parameter(Mandatory = $true)][string]$ExpectedProcessName,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptRoot "Oracle.Stage3R13ActivationPolicy.ps1")

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
try {
  $principal = [Security.Principal.WindowsPrincipal]::new($identity)
  if (-not $principal.IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
  )) {
    throw "The positive integration test requires an elevated process."
  }
} finally {
  $identity.Dispose()
}
if (Test-Path -LiteralPath $OutputPath) {
  throw "The integration-test output path already exists."
}
if ($ExpectedProcessName -cnotmatch '^[A-Za-z0-9._-]+$') {
  throw "The expected process name is malformed."
}
$preExistingProcesses = @(
  Get-Process -Name $ExpectedProcessName -ErrorAction SilentlyContinue
)
if ($preExistingProcesses.Count -ne 0) {
  throw "The target application is already running; safe ownership is ambiguous."
}

$availability = Test-OracleStage3R13ApplicationActivationApi
if (-not $availability.available) {
  throw "IApplicationActivationManager is unavailable: $($availability.hresult)"
}
$activation = Invoke-OracleStage3R13ApplicationActivation `
  -AppUserModelId $AppUserModelId
Assert-OracleStage3R13ApplicationActivationSucceeded -Result $activation

$processObserved = $false
$processIdentityMatched = $false
$processStopped = $false
try {
  $process = Get-Process -Id $activation.processId -ErrorAction Stop
  $processObserved = $true
  $processIdentityMatched = (
    [StringComparer]::OrdinalIgnoreCase.Equals(
      [string]$process.ProcessName,
      $ExpectedProcessName
    )
  )
  if (-not $processIdentityMatched) {
    throw "The activated process identity differs from the expected process."
  }
  Stop-Process -Id $activation.processId -Force -ErrorAction Stop
  for ($index = 0; $index -lt 150; $index += 1) {
    if (
      @(Get-Process -Id $activation.processId -ErrorAction SilentlyContinue).
        Count -eq 0
    ) {
      break
    }
    Start-Sleep -Milliseconds 100
  }
  $processStopped = (
    @(Get-Process -Id $activation.processId -ErrorAction SilentlyContinue).
      Count -eq 0
  )
} finally {
  $record = [ordered]@{
    classification = @(
      "NON-QUALIFICATION",
      "NON-AUTHORITY",
      "NON-EVIDENCE",
      "DEVELOPMENT INTEGRATION"
    )
    computerName = $env:COMPUTERNAME
    elevated = $true
    appUserModelId = $AppUserModelId
    expectedProcessName = $ExpectedProcessName
    preExistingProcessCount = $preExistingProcesses.Count
    availability = $availability
    activation = $activation
    processObserved = $processObserved
    processIdentityMatched = $processIdentityMatched
    processStopped = $processStopped
    oraclePackageInstalled = @(
      Get-AppxPackage -Name "Oracle.Platform.LocalCertification" `
        -ErrorAction SilentlyContinue
    ).Count -ne 0
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
  }
  $json = "$($record | ConvertTo-Json -Depth 20)`n"
  $stream = [IO.File]::Open(
    [IO.Path]::GetFullPath($OutputPath),
    [IO.FileMode]::CreateNew,
    [IO.FileAccess]::Write,
    [IO.FileShare]::None
  )
  try {
    $bytes = [Text.UTF8Encoding]::new($false).GetBytes($json)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush($true)
  } finally {
    $stream.Dispose()
  }
}
if (-not $processObserved -or -not $processIdentityMatched -or -not $processStopped) {
  throw "The positive integration activation process was not observed and stopped."
}
