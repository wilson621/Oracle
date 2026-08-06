[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage3R13ProcessPolicy.ps1")

$records = [Collections.Generic.List[object]]::new()
$counts = @{}
$writeRecord = {
  param($Path, $Value)
  $records.Add([pscustomobject][ordered]@{
    path = $Path
    value = $Value
  })
}

function New-FixtureEnvelope(
  $ExitCode,
  $Signal,
  $ProcessError,
  [string]$Stdout = "",
  [string]$Stderr = ""
) {
  [pscustomobject][ordered]@{
    executable = "C:\Windows\System32\fixture.exe"
    arguments = @("path with spaces")
    startedAtUtc = "2026-07-30T00:00:00.000Z"
    completedAtUtc = "2026-07-30T00:00:01.000Z"
    stdout = $Stdout
    stderr = $Stderr
    exitCode = $ExitCode
    signal = $Signal
    processError = $ProcessError
  }
}

$cases = @(
  @{ name = "startup-error"; envelope = New-FixtureEnvelope $null $null "ENOENT" },
  @{ name = "signal"; envelope = New-FixtureEnvelope $null "SIGTERM" $null },
  @{ name = "null-status"; envelope = New-FixtureEnvelope $null $null $null },
  @{ name = "nonzero"; envelope = New-FixtureEnvelope 7 $null $null "out" "err" }
)
foreach ($case in $cases) {
  $failed = $false
  try {
    [void](Invoke-OracleStage3R13GovernedProcess `
      -Name $case.name `
      -Executable "C:\Windows\System32\fixture.exe" `
      -Arguments @("path with spaces") `
      -LogsRoot "C:\fixture logs" `
      -ProcessEvidenceCounts $counts `
      -WriteCreateOnlyJson $writeRecord `
      -ProcessRunner { $case.envelope })
  } catch {
    $failed = $true
  }
  if (-not $failed) { throw "Process failure fixture passed: $($case.name)" }
}

$success = Invoke-OracleStage3R13GovernedProcess `
  -Name "success" `
  -Executable "C:\Windows\System32\fixture.exe" `
  -Arguments @("path with spaces") `
  -LogsRoot "C:\fixture logs" `
  -ProcessEvidenceCounts $counts `
  -WriteCreateOnlyJson $writeRecord `
  -ProcessRunner { New-FixtureEnvelope 0 $null $null "ok" "" }
if ([int]$success.exitCode -ne 0 -or [string]$success.stdout -cne "ok") {
  throw "Successful process fixture differs."
}
if ($records.Count -ne 5) {
  throw "Every governed process result must be captured before classification."
}
if (
  [string]$records[0].value.processError -cne "ENOENT" -or
  [string]$records[1].value.signal -cne "SIGTERM" -or
  $null -ne $records[2].value.exitCode -or
  [int]$records[3].value.exitCode -ne 7 -or
  [string]$records[3].value.stdout -cne "out" -or
  [string]$records[3].value.stderr -cne "err"
) { throw "Governed process evidence lost a failure field." }

[ordered]@{
  result = "passed"
  strictMode = "Latest"
  startupErrorCaptured = $true
  signalCaptured = $true
  nullStatusRejected = $true
  nonzeroRejected = $true
  stdoutAndStderrPreserved = $true
  pathWithSpacesPreserved = $true
  evidenceRecords = $records.Count
} | ConvertTo-Json -Depth 8
