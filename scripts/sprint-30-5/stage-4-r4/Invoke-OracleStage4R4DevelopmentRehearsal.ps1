[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"
$classification=@("NON-QUALIFICATION","NON-AUTHORITY","NON-EVIDENCE","DEVELOPMENT REHEARSAL")
. (Join-Path $PSScriptRoot "Oracle.Stage4R4LifecyclePolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage4R4JourneyPolicy.ps1")
$fixtures=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot "Oracle.Stage4R4Fixtures.json") | ConvertFrom-Json
[void](Assert-OracleStage4R4JourneyRecord $fixtures.validJourney)
$invalid=$fixtures.validJourney | ConvertTo-Json -Depth 20 | ConvertFrom-Json
$invalid.journeys[0].result="failed"
try{[void](Assert-OracleStage4R4JourneyRecord $invalid);throw "Invalid journey was accepted."}catch{if($_.Exception.Message -eq "Invalid journey was accepted."){throw}}
Assert-OracleStage4R4SecretFreeText -Text '{"result":"passed"}' -KnownSecrets @("fixture-secret")
try{Assert-OracleStage4R4SecretFreeText -Text 'access_token=secret' -KnownSecrets @();throw "Credential evidence was accepted."}catch{if($_.Exception.Message -eq "Credential evidence was accepted."){throw}}
function Invoke-FixtureLifecycle([string]$FailurePhase){
  $state=New-OracleStage4R4LifecycleState;$failure=$null
  try{foreach($phase in @(Get-OracleStage4R4LifecyclePhases)){Assert-OracleStage4R4NextLifecyclePhase $state $phase;if($phase -ceq $FailurePhase){throw "Injected failure: $phase"};[void](Move-OracleStage4R4Lifecycle $state $phase)}}catch{$failure=$_}
  $teardown=Get-OracleStage4R4TeardownObligations @($state.completed)
  if(-not $teardown.verifyZeroResidue -or -not $teardown.retryProhibited){throw "Teardown invariants weakened."}
  [pscustomobject]@{state=$state;failure=$failure;teardown=$teardown}
}
$success=Invoke-FixtureLifecycle ""
if($null -ne $success.failure -or -not $success.state.terminal){throw "Success rehearsal failed."}
foreach($phase in @(Get-OracleStage4R4LifecyclePhases)){$result=Invoke-FixtureLifecycle $phase;if($null -eq $result.failure){throw "Failure injection did not stop at $phase"}}
$state=New-OracleStage4R4LifecycleState
try{[void](Move-OracleStage4R4Lifecycle $state "provider-admitted");throw "Out-of-order phase accepted."}catch{if($_.Exception.Message -eq "Out-of-order phase accepted."){throw}}
[pscustomobject][ordered]@{result="passed";classification=$classification;phases=@(Get-OracleStage4R4LifecyclePhases);failureInjectionCount=@(Get-OracleStage4R4LifecyclePhases).Count;authorityCreated=$false;attemptCreated=$false;hostMutation=$false;qualificationEvidence=$false} | ConvertTo-Json -Depth 8
