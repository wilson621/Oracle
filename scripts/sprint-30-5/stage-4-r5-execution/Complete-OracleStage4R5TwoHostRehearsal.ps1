[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$TransferRoot,
  [Parameter(Mandatory=$true)][string]$ExpectedManifestSha256,
  [Parameter(Mandatory=$true)][string]$ExpectedCustodySha256,
  [Parameter(Mandatory=$true)][string]$ExpectedVerificationSha256,
  [Parameter(Mandatory=$true)][string]$RehearsalRoot,
  [Parameter(Mandatory=$true)][string]$OutputPath
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5JourneyPolicy.ps1')
$transfer=Assert-OracleStage4R5Transfer $TransferRoot $ExpectedManifestSha256 $ExpectedCustodySha256 $ExpectedVerificationSha256
$root=[IO.Path]::GetFullPath($RehearsalRoot)
$required=@('provider-start-request.json','provider-admission.json','qualification-terminal.json','qualification-host-rehearsal-manifest.json','provider-teardown.json')
foreach($name in $required){if(-not(Test-Path -LiteralPath (Join-Path $root $name) -PathType Leaf)){throw "Two-host rehearsal record is absent: $name"}}
if(Test-Path -LiteralPath (Join-Path $root 'provider-secret-handoff.json')){throw 'Two-host rehearsal secret handoff residue remains.'}
$request=Get-Content -Raw -LiteralPath (Join-Path $root 'provider-start-request.json')|ConvertFrom-Json
$terminal=Get-Content -Raw -LiteralPath (Join-Path $root 'qualification-terminal.json')|ConvertFrom-Json
$returnedManifest=Get-Content -Raw -LiteralPath (Join-Path $root 'qualification-host-rehearsal-manifest.json')|ConvertFrom-Json
$teardown=Get-Content -Raw -LiteralPath (Join-Path $root 'provider-teardown.json')|ConvertFrom-Json
if([string]$request.contract-cne'oracle.sprint-30-5.stage-4-r5-provider-rehearsal-request'-or[string]$request.transferId-cne[string]$transfer.transferId-or[bool]$request.authorityCreated-or[bool]$request.attemptCreated){throw 'Two-host rehearsal request is inadmissible.'}
if([string]$terminal.result-cne'passed-awaiting-provider-teardown'-or[string]$terminal.rehearsalId-cne[string]$request.rehearsalId-or[bool]$terminal.authorityCreated-or[bool]$terminal.attemptCreated){throw 'Qualification-host rehearsal terminal record differs.'}
if([string]$returnedManifest.result-cne'passed-awaiting-provider-teardown'-or[string]$returnedManifest.rehearsalId-cne[string]$request.rehearsalId-or[bool]$returnedManifest.authorityCreated-or[bool]$returnedManifest.attemptCreated){throw 'Qualification-host rehearsal manifest differs.'}
if([string]$teardown.result-cne'passed'-or-not[bool]$teardown.zeroResidue-or[string]$teardown.attemptId-cne[string]$request.rehearsalId-or[string]$teardown.providerIdentity-cne[string]$request.providerIdentity-or[int]$teardown.providerContainers-ne0-or[int]$teardown.providerVolumes-ne0-or[int]$teardown.providerNetworks-ne0-or[int]$teardown.providerRelays-ne0-or[int]$teardown.firewallRules-ne0-or[bool]$teardown.providerWorkRootPresent){throw 'Provider rehearsal teardown did not establish zero residue.'}
$returned=Join-Path $root 'qualification-host-rehearsal';$actual=@(Get-OracleStage4R5Inventory $returned);$expected=@($returnedManifest.files)
if($actual.Count-ne$expected.Count){throw 'Qualification-host rehearsal inventory count differs.'}
for($i=0;$i-lt$expected.Count;$i++){if([string]$actual[$i].path-cne[string]$expected[$i].path-or[long]$actual[$i].bytes-ne[long]$expected[$i].bytes-or[string]$actual[$i].sha256-cne[string]$expected[$i].sha256){throw "Qualification-host rehearsal inventory differs at index $i."}}
$completionPath=Join-Path $returned 'completion.json';$installedPath=Join-Path $returned 'logs\installed-package-result.json';$journeyPath=Join-Path $returned 'evidence\live-journey.json'
foreach($path in @($completionPath,$installedPath,$journeyPath)){if(-not(Test-Path -LiteralPath $path -PathType Leaf)){throw "Required returned rehearsal record is absent: $path"}}
$completion=Get-Content -Raw -LiteralPath $completionPath|ConvertFrom-Json;$installed=Get-Content -Raw -LiteralPath $installedPath|ConvertFrom-Json;$journey=Get-Content -Raw -LiteralPath $journeyPath|ConvertFrom-Json
if([string]$completion.result-cne'passed-awaiting-provider-teardown'-or[bool]$completion.authorityCreated-or[bool]$completion.attemptCreated-or[int]$completion.packageResidue-ne0-or[int]$completion.trustResidue-ne0){throw 'Returned rehearsal completion differs.'}
if([string]$installed.result-cne'passed'-or-not[bool]$installed.zeroResidue-or(@($installed.classification)-cnotcontains'NON-QUALIFICATION')-or(@($installed.classification)-cnotcontains'NON-AUTHORITY')-or(@($installed.classification)-cnotcontains'NON-EVIDENCE')){throw 'Installed rehearsal result is inadmissible.'}
foreach($prohibited in @('qualificationEvidence','authorityId','attemptId')){if($installed.PSObject.Properties.Name-ccontains$prohibited){throw "Installed rehearsal result contains prohibited governed state: $prohibited"}}
[void](Assert-OracleStage4R5JourneyRecord $journey -DevelopmentRehearsal)
$record=[ordered]@{schemaVersion='1.0.0';contract='oracle.sprint-30-5.stage-4-r5-two-host-rehearsal-completion';result='passed';classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','TWO-HOST DEVELOPMENT REHEARSAL');transferId=[string]$transfer.transferId;rehearsalId=[string]$request.rehearsalId;providerIdentity=[string]$request.providerIdentity;executionCommit=[string]$transfer.manifest.preparation.executionCommit;qualificationHostManifestSha256=Get-OracleStage4R5Sha256 (Join-Path $root 'qualification-host-rehearsal-manifest.json');qualificationTerminalSha256=Get-OracleStage4R5Sha256 (Join-Path $root 'qualification-terminal.json');providerTeardownSha256=Get-OracleStage4R5Sha256 (Join-Path $root 'provider-teardown.json');journeysPassed=@($journey.journeys).Count;providerZeroResidue=$true;qualificationZeroResidue=$true;authorityCreated=$false;attemptCreated=$false;completedAtUtc=[DateTime]::UtcNow.ToString('o')}
Write-OracleStage4R5CreateOnlyJson $OutputPath $record
[pscustomobject][ordered]@{result='passed';outputPath=[IO.Path]::GetFullPath($OutputPath);sha256=Get-OracleStage4R5Sha256 $OutputPath;authorityCreated=$false;attemptCreated=$false}|ConvertTo-Json -Depth 6
