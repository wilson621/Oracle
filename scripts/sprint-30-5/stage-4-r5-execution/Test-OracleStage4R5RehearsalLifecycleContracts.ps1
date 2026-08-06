[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5JourneyPolicy.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage3R13InstalledRuntimeConfigurationPolicy.ps1')

$rehearsalId='rehearsal-stage4-r5-20260806T220325990Z-a1dbfc39'
$transferId='NON-TRANSFER-engineering-rehearsal-stage4-r5-20260806T220249959Z-a1dbfc39'
$providerIdentity='provider-stage4-r5-20260806T220325990Z-a1dbfc39'
$identity=Get-OracleStage4R5RehearsalRuntimeIdentity $rehearsalId
if(
  [string]$identity.configurationId-cne'runtime-stage4-r5-20260806T220325990Z-a1dbfc39'-or
  [string]$identity.founderGrantId-cne'founder-stage4-r5-grant-20260806T220325990Z-a1dbfc39'-or
  [string]$identity.authorityId-cne'authority-stage4-r5-20260806T220325990Z-a1dbfc39'-or
  [string]$identity.attemptId-cne'stage4-r5-20260806T220325990Z-a1dbfc39'-or
  [bool]$identity.authorityCreated-or[bool]$identity.attemptCreated
){throw 'Rehearsal runtime compatibility identity differs.'}
Assert-OracleInstalledRuntimeIdentity `
  -ConfigurationId ([string]$identity.configurationId) `
  -FounderGrantId ([string]$identity.founderGrantId) `
  -AuthorityId ([string]$identity.authorityId) `
  -AttemptId ([string]$identity.attemptId)

$malformedRejected=0
foreach($candidate in @(
  'stage4-r5-20260806T220325990Z-a1dbfc39',
  'rehearsal-stage4-r5-20260806T220325990Z-A1DBFC39',
  'rehearsal-stage4-r5-20260806T220325990Z-a1dbfc39-extra'
)){
  try{Get-OracleStage4R5RehearsalRuntimeIdentity $candidate|Out-Null}catch{$malformedRejected++}
}
if($malformedRejected-ne3){throw 'Malformed rehearsal identities were not rejected.'}

$request=[pscustomobject]@{rehearsalId=$rehearsalId;providerIdentity=$providerIdentity}
function New-Terminal([string]$Result){
  [pscustomobject]@{contract='oracle.sprint-30-5.stage-4-r5-rehearsal-terminal';result=$Result;transferId=$transferId;rehearsalId=$rehearsalId;providerIdentity=$providerIdentity;authorityCreated=$false;attemptCreated=$false}
}
function New-Manifest([string]$Result){
  [pscustomobject]@{result=$Result;rehearsalId=$rehearsalId;authorityCreated=$false;attemptCreated=$false}
}
$passed=Assert-OracleStage4R5RehearsalTerminalRecords $request (New-Terminal 'passed-awaiting-provider-teardown') (New-Manifest 'passed-awaiting-provider-teardown') $transferId
$failed=Assert-OracleStage4R5RehearsalTerminalRecords $request (New-Terminal 'failed-awaiting-provider-teardown') (New-Manifest 'failed-awaiting-provider-teardown') $transferId
if($passed-cne'passed-awaiting-provider-teardown'-or$failed-cne'failed-awaiting-provider-teardown'){throw 'Terminal result admission differs.'}

$mismatchRejected=$false
try{Assert-OracleStage4R5RehearsalTerminalRecords $request (New-Terminal 'failed-awaiting-provider-teardown') (New-Manifest 'passed-awaiting-provider-teardown') $transferId|Out-Null}catch{$mismatchRejected=$true}
if(-not$mismatchRejected){throw 'Terminal/manifest result mismatch was not rejected.'}
$governedState=New-Terminal 'passed-awaiting-provider-teardown';$governedState.authorityCreated=$true
$governedStateRejected=$false
try{Assert-OracleStage4R5RehearsalTerminalRecords $request $governedState (New-Manifest 'passed-awaiting-provider-teardown') $transferId|Out-Null}catch{$governedStateRejected=$true}
if(-not$governedStateRejected){throw 'Governed state in a rehearsal terminal was not rejected.'}

$installed=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Invoke-OracleStage4R5InstalledPackageJourney.ps1')
$completion=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Complete-OracleStage4R5TwoHostRehearsal.ps1')
foreach($required in @('Get-OracleStage4R5RehearsalRuntimeIdentity','-FounderGrantId $runtimeFounderGrantId','-AuthorityId $runtimeAuthorityId','-AttemptId $runtimeAttemptId')){if(-not$installed.Contains($required)){throw "Installed rehearsal identity binding is absent: $required"}}
if($installed.Contains('NO-AUTHORITY-DEVELOPMENT-REHEARSAL')-or$installed.Contains('NO-FOUNDER-GRANT-DEVELOPMENT-REHEARSAL')){throw 'Invalid sentinel runtime identities remain.'}
$terminalIndex=$completion.IndexOf('Assert-OracleStage4R5RehearsalTerminalRecords',[StringComparison]::Ordinal)
$teardownIndex=$completion.IndexOf('Provider rehearsal teardown did not establish zero residue.',[StringComparison]::Ordinal)
$failureIndex=$completion.IndexOf("if(`$terminalResult-ceq'failed-awaiting-provider-teardown')",[StringComparison]::Ordinal)
if($terminalIndex-lt0-or$teardownIndex-lt$terminalIndex-or$failureIndex-lt$teardownIndex){throw 'Failure-terminal processing is not ordered after terminal admission and verified teardown.'}

[pscustomobject][ordered]@{
  result='passed'
  classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','REHEARSAL LIFECYCLE CONTRACT TEST')
  runtimeCompatibilityIdentityAccepted=$true
  malformedRuntimeIdentitiesRejected=$malformedRejected
  passedTerminalAccepted=$true
  failedTerminalAccepted=$true
  terminalManifestMismatchRejected=$true
  governedTerminalStateRejected=$true
  failureReportedAfterVerifiedTeardown=$true
  authorityCreated=$false
  attemptCreated=$false
}|ConvertTo-Json -Depth 6
