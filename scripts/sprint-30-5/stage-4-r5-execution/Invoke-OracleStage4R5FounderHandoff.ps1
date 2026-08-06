[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$ExpectedManifestSha256,
  [Parameter(Mandatory=$true)][string]$ExpectedCustodySha256,
  [Parameter(Mandatory=$true)][string]$ExpectedVerificationSha256,
  [Parameter(Mandatory=$true)][string]$ProviderPreflightPath,
  [Parameter(Mandatory=$true)][string]$ExpectedProviderPreflightSha256,
  [Parameter(Mandatory=$true)][string]$RehearsalCompletionPath,
  [Parameter(Mandatory=$true)][string]$ExpectedRehearsalCompletionSha256,
  [Parameter(Mandatory=$true)][string]$ReturnRoot,
  [string]$LocalTransferParent='C:\OracleQualification\Stage4R5\Transfers',
  [string]$LocalAttemptParent='C:\OracleQualification\Stage4R5\Attempts',
  [string]$LocalAuthorityParent='C:\OracleQualification\Stage4R5\Authorities'
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')
$contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R5ExecutionContract.json')|ConvertFrom-Json
if([string]$contract.status-cne'founder-authorised-execution-enabled'-or-not[bool]$contract.executionAuthority.authorityCreationPermittedAfterAllPreAuthorityGates){throw 'Stage 4 R5 execution contract is not authority-enabled.'}
$sourceTransferRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$source=Assert-OracleStage4R5Transfer $sourceTransferRoot $ExpectedManifestSha256 $ExpectedCustodySha256 $ExpectedVerificationSha256
if([string]$source.manifest.preparation.acceptedCommit-cne[string]$contract.acceptedPreparation.commit){throw 'Accepted R5 preparation binding differs.'}

$providerPath=[IO.Path]::GetFullPath($ProviderPreflightPath)
if(-not(Test-Path -LiteralPath $providerPath -PathType Leaf)){throw 'Provider-host pre-authority record is absent.'}
if((Get-OracleStage4R5Sha256 $providerPath)-cne$ExpectedProviderPreflightSha256.ToLowerInvariant()){throw 'Provider-host pre-authority hash differs.'}
$provider=Get-Content -Raw -LiteralPath $providerPath|ConvertFrom-Json
if([string]$provider.contract-cne'oracle.sprint-30-5.stage-4-r5-provider-pre-authority'-or[string]$provider.result-cne'passed'-or[bool]$provider.authorityCreated-or[bool]$provider.attemptCreated-or[bool]$provider.providerStateCreated-or[bool]$provider.relayStateCreated){throw 'Provider-host pre-authority record is inadmissible.'}
if([string]$provider.transferId-cne[string]$source.transferId-or[string]$provider.executionCommit-cne[string]$source.manifest.preparation.executionCommit-or[string]$provider.computerName-cne[string]$contract.hosts.provider.computerName-or[string]$provider.privateAddress-cne[string]$contract.hosts.provider.address-or[int]$provider.activeDefaultRoutes-ne0-or[int]$provider.providerContainers-ne0-or[int]$provider.providerVolumes-ne0-or[int]$provider.providerNetworks-ne0-or[int]$provider.providerRelays-ne0){throw 'Provider-host continuity, isolation, or zero state differs.'}
$rehearsalPath=[IO.Path]::GetFullPath($RehearsalCompletionPath)
if(-not(Test-Path -LiteralPath $rehearsalPath -PathType Leaf)){throw 'Two-host rehearsal completion record is absent.'}
$rehearsalSha=Get-OracleStage4R5Sha256 $rehearsalPath
if($rehearsalSha-cne$ExpectedRehearsalCompletionSha256.ToLowerInvariant()-or[string]$provider.rehearsalCompletionSha256-cne$rehearsalSha){throw 'Two-host rehearsal completion binding differs.'}
$rehearsal=Get-Content -Raw -LiteralPath $rehearsalPath|ConvertFrom-Json
if([string]$rehearsal.contract-cne'oracle.sprint-30-5.stage-4-r5-two-host-rehearsal-completion'-or[string]$rehearsal.result-cne'passed'-or[string]$rehearsal.transferId-cne[string]$source.transferId-or[string]$rehearsal.executionCommit-cne[string]$source.manifest.preparation.executionCommit-or-not[bool]$rehearsal.providerZeroResidue-or-not[bool]$rehearsal.qualificationZeroResidue-or[bool]$rehearsal.authorityCreated-or[bool]$rehearsal.attemptCreated){throw 'Two-host rehearsal completion is inadmissible.'}
$collected=[DateTime]::ParseExact([string]$provider.collectedAtUtc,'o',[Globalization.CultureInfo]::InvariantCulture,[Globalization.DateTimeStyles]::RoundtripKind).ToUniversalTime();$age=[DateTime]::UtcNow-$collected
if($age.TotalSeconds-lt-5-or$age.TotalMinutes-gt15){throw 'Provider-host pre-authority record is stale or future-dated.'}

$hostAdmission=Get-OracleStage4R5CleanHostAdmission $contract
$localTransferRoot=Copy-OracleStage4R5TransferCreateOnly $sourceTransferRoot ([IO.Path]::GetFullPath($LocalTransferParent))
$local=Assert-OracleStage4R5Transfer $localTransferRoot $ExpectedManifestSha256 $ExpectedCustodySha256 $ExpectedVerificationSha256
if([string]$local.transferId-cne[string]$source.transferId){throw 'Local transfer admission differs.'}

$return=[IO.Path]::GetFullPath($ReturnRoot)
if(Test-Path -LiteralPath $return){throw 'Create-only Stage 4 R5 return root already exists.'}
[IO.Directory]::CreateDirectory($return)|Out-Null
foreach($parent in @($LocalAttemptParent,$LocalAuthorityParent)){if(-not(Test-Path -LiteralPath $parent -PathType Container)){[IO.Directory]::CreateDirectory($parent)|Out-Null}}
if(@(Get-ChildItem -LiteralPath $LocalAuthorityParent -Force).Count-ne0-or@(Get-ChildItem -LiteralPath $LocalAttemptParent -Force).Count-ne0){throw 'Stage 4 R5 local authority or attempt namespace is not fresh.'}

$grant=[string]$source.founderGrantId;$identity=$grant.Substring('founder-stage4-r5-grant-'.Length);$authorityId="authority-stage4-r5-$identity";$attemptId="stage4-r5-$identity"
if($authorityId-cnotmatch[string]$contract.identity.authorityPattern-or$attemptId-cnotmatch[string]$contract.identity.attemptPattern){throw 'Derived R5 authority or attempt identity is malformed.'}
$authorityPath=Join-Path $LocalAuthorityParent ($authorityId+'.json');$attemptRoot=Join-Path $LocalAttemptParent $attemptId
if((Test-Path -LiteralPath $authorityPath) -or (Test-Path -LiteralPath $attemptRoot)){throw 'R5 authority or attempt identity was already used.'}
[IO.Directory]::CreateDirectory($attemptRoot)|Out-Null
foreach($name in @('evidence','lifecycle','logs')){[IO.Directory]::CreateDirectory((Join-Path $attemptRoot $name))|Out-Null}
$continuity=[ordered]@{contract='oracle.sprint-30-5.stage-4-r5-host-continuity';result='passed';transferId=[string]$source.transferId;founderGrantId=$grant;providerPreflightSha256=Get-OracleStage4R5Sha256 $providerPath;twoHostRehearsalCompletionSha256=$rehearsalSha;sourceManifestSha256=[string]$source.manifestSha256;localManifestSha256=[string]$local.manifestSha256;sourceAndLocalParity=$true;host=$hostAdmission;authorityCreated=$false;attemptCreated=$false;collectedAtUtc=[DateTime]::UtcNow.ToString('o')}
$continuityPath=Join-Path $attemptRoot 'logs\host-continuity.json';Write-OracleStage4R5CreateOnlyJson $continuityPath $continuity;$continuitySha=Get-OracleStage4R5Sha256 $continuityPath
$preflight=[ordered]@{contract='oracle.sprint-30-5.stage-4-r5-pre-authority';result='passed';transferId=[string]$source.transferId;founderGrantId=$grant;executionCommit=[string]$source.manifest.preparation.executionCommit;providerPreflightSha256=Get-OracleStage4R5Sha256 $providerPath;twoHostRehearsalCompletionSha256=$rehearsalSha;twoHostRehearsalGatePassed=$true;hostContinuitySha256=$continuitySha;allTransferGatesPassed=$true;continuityGatePassed=$true;hostAdmissionGatePassed=$true;providerHostGatePassed=$true;networkIsolationGatePassed=$true;zeroStateGatePassed=$true;returnRootGatePassed=$true;authorityCreated=$false;attemptCreated=$false;collectedAtUtc=[DateTime]::UtcNow.ToString('o')}
$preflightPath=Join-Path $attemptRoot 'logs\pre-authority.json';Write-OracleStage4R5CreateOnlyJson $preflightPath $preflight;$preflightSha=Get-OracleStage4R5Sha256 $preflightPath
$authority=[ordered]@{contract='oracle.sprint-30-5.stage-4-r5-single-attempt-authority';founderGrantId=$grant;authorityId=$authorityId;attemptId=$attemptId;transferId=[string]$source.transferId;executionCommit=[string]$source.manifest.preparation.executionCommit;manifestSha256=[string]$source.manifestSha256;custodySha256=[string]$source.custodySha256;verificationSha256=[string]$source.verificationSha256;providerPreflightSha256=Get-OracleStage4R5Sha256 $providerPath;twoHostRehearsalCompletionSha256=$rehearsalSha;twoHostRehearsalGatePassed=$true;hostContinuitySha256=$continuitySha;preflightSha256=$preflightSha;maximumAttempts=1;retryAuthorised=$false;consumed=$true;consumedAtUtc=[DateTime]::UtcNow.ToString('o')}
Write-OracleStage4R5CreateOnlyJson $authorityPath $authority;$authoritySha=Get-OracleStage4R5Sha256 $authorityPath
$request=[ordered]@{contract='oracle.sprint-30-5.stage-4-r5-provider-start-request';state='authority-consumed-awaiting-provider';transferId=[string]$source.transferId;founderGrantId=$grant;authorityId=$authorityId;attemptId=$attemptId;authoritySha256=$authoritySha;preflightSha256=$preflightSha;executionCommit=[string]$source.manifest.preparation.executionCommit;providerIdentity=('provider-'+$attemptId);providerAddress=[string]$contract.hosts.provider.address;qualificationAddress=[string]$contract.hosts.qualification.address;createdAtUtc=[DateTime]::UtcNow.ToString('o')}
Write-OracleStage4R5CreateOnlyJson (Join-Path $return 'provider-start-request.json') $request
Write-OracleStage4R5CreateOnlyJson (Join-Path $return 'authority-record.json') $authority
Write-OracleStage4R5CreateOnlyJson (Join-Path $return 'host-continuity.json') $continuity
Write-OracleStage4R5CreateOnlyJson (Join-Path $return 'pre-authority.json') $preflight
[pscustomobject][ordered]@{result='authority-consumed-awaiting-provider-start';transferId=[string]$source.transferId;founderGrantId=$grant;authorityId=$authorityId;attemptId=$attemptId;authoritySha256=$authoritySha;attemptRoot=$attemptRoot;localTransferRoot=$localTransferRoot;returnRoot=$return;retryAuthorised=$false}|ConvertTo-Json -Depth 8
