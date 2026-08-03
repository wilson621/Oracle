[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Oracle.Stage3R11LifecyclePolicy.ps1")

function Assert-True([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}

$phases = @(Get-OracleStage3R11LifecyclePhases)
$success = New-OracleStage3R11LifecycleState
foreach ($phase in $phases) {
  [void](Move-OracleStage3R11Lifecycle -State $success -Phase $phase)
}
Assert-True ($success.terminal -eq $true) "Complete lifecycle did not become terminal."
Assert-True ($success.completed.Count -eq $phases.Count) "A lifecycle phase was lost."

$skipRejected = $false
try {
  $state = New-OracleStage3R11LifecycleState
  [void](Move-OracleStage3R11Lifecycle -State $state -Phase $phases[1])
} catch { $skipRejected = $_.Exception.Message -match "skipped" }
Assert-True $skipRejected "Skipped phase was accepted."

$repeatRejected = $false
try {
  $state = New-OracleStage3R11LifecycleState
  [void](Move-OracleStage3R11Lifecycle -State $state -Phase $phases[0])
  [void](Move-OracleStage3R11Lifecycle -State $state -Phase $phases[0])
} catch { $repeatRejected = $_.Exception.Message -match "repeated|out of order" }
Assert-True $repeatRejected "Repeated phase was accepted."

$failureResults = [Collections.Generic.List[object]]::new()
for ($failureIndex = 0; $failureIndex -lt $phases.Count; $failureIndex++) {
  $state = New-OracleStage3R11LifecycleState
  for ($index = 0; $index -lt $failureIndex; $index++) {
    [void](Move-OracleStage3R11Lifecycle -State $state -Phase $phases[$index])
  }
  $obligations = Get-OracleStage3R11TeardownObligations `
    -CompletedPhases @($state.completed)
  Assert-True $obligations.stopForwardExecution "Failure did not stop forward execution."
  Assert-True $obligations.preserveAttempt "Failure did not preserve the attempt."
  Assert-True $obligations.retryProhibited "Failure allowed a retry."
  $expectedTrust = @($state.completed) -ccontains "trust-established"
  $expectedPackage = @($state.completed) -ccontains "package-installed"
  Assert-True (
    $obligations.removeExactMachineTrust -eq $expectedTrust
  ) "Trust teardown obligation differs at $($phases[$failureIndex])."
  Assert-True (
    $obligations.removeExactPackage -eq $expectedPackage
  ) "Package teardown obligation differs at $($phases[$failureIndex])."
  Assert-True (
    $obligations.removeExactRuntimeConfiguration -eq $expectedPackage
  ) "Runtime-configuration teardown obligation differs at $($phases[$failureIndex])."
  Assert-True $obligations.verifyZeroRuntimeConfigurationResidue `
    "Runtime-configuration zero-residue verification was weakened."
  $failureResults.Add([ordered]@{
    failedBeforePhase = $phases[$failureIndex]
    completedPhases = @($state.completed)
    teardown = $obligations
  })
}

[ordered]@{
  result = "passed"
  classification = @(
    "NON-QUALIFICATION",
    "NON-AUTHORITY",
    "NON-EVIDENCE",
    "DEVELOPMENT REHEARSAL"
  )
  successPathPhases = @($success.completed)
  skipRejected = $skipRejected
  repeatRejected = $repeatRejected
  failureInjectionCount = $failureResults.Count
  failures = $failureResults
} | ConvertTo-Json -Depth 20
