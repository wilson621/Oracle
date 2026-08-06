[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$TransferRoot,
  [Parameter(Mandatory=$true)][string]$ExpectedManifestSha256,
  [Parameter(Mandatory=$true)][string]$ExpectedCustodySha256,
  [Parameter(Mandatory=$true)][string]$ExpectedVerificationSha256,
  [Parameter(Mandatory=$true)][string]$ReturnRoot,
  [string]$LocalAttemptParent='C:\OracleQualification\Stage4R5\Attempts',
  [string]$LocalAuthorityParent='C:\OracleQualification\Stage4R5\Authorities'
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5LifecyclePolicy.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5JourneyPolicy.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5ProviderHostPolicy.ps1')
$contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R5ExecutionContract.json')|ConvertFrom-Json
Assert-OracleStage4R5Administrator
$transfer=Assert-OracleStage4R5Transfer $TransferRoot $ExpectedManifestSha256 $ExpectedCustodySha256 $ExpectedVerificationSha256
$return=[IO.Path]::GetFullPath($ReturnRoot);if(-not(Test-Path -LiteralPath $return -PathType Container)){throw 'Governed R5 return root is absent.'}
$requestPath=Join-Path $return 'provider-start-request.json';$authorityReturnPath=Join-Path $return 'authority-record.json';$providerAdmissionPath=Join-Path $return 'provider-admission.json';$handoffPath=Join-Path $return 'provider-secret-handoff.json'
foreach($path in @($requestPath,$authorityReturnPath,$providerAdmissionPath,$handoffPath)){if(-not(Test-Path -LiteralPath $path -PathType Leaf)){throw "Qualification input is absent: $path"}}
$request=Get-Content -Raw -LiteralPath $requestPath|ConvertFrom-Json;$authority=Get-Content -Raw -LiteralPath $authorityReturnPath|ConvertFrom-Json
if([string]$request.transferId-cne[string]$transfer.transferId-or[string]$authority.transferId-cne[string]$transfer.transferId-or-not[bool]$authority.consumed-or[string]$request.authorityId-cne[string]$authority.authorityId-or[string]$request.attemptId-cne[string]$authority.attemptId-or[string]$request.authoritySha256-cne(Get-OracleStage4R5Sha256 $authorityReturnPath)){throw 'Consumed authority binding differs.'}
$localAuthorityPath=Join-Path ([IO.Path]::GetFullPath($LocalAuthorityParent)) (([string]$authority.authorityId)+'.json');if((-not (Test-Path -LiteralPath $localAuthorityPath -PathType Leaf)) -or ((Get-OracleStage4R5Sha256 $localAuthorityPath) -cne (Get-OracleStage4R5Sha256 $authorityReturnPath))){throw 'Local authority continuity differs.'}
$attemptRoot=Join-Path ([IO.Path]::GetFullPath($LocalAttemptParent)) ([string]$authority.attemptId);if(-not(Test-Path -LiteralPath $attemptRoot -PathType Container)){throw 'Caller-owned qualification attempt root is absent.'}
$terminalPath=Join-Path $return 'qualification-terminal.json';if(Test-Path -LiteralPath $terminalPath){throw 'Qualification terminal record already exists; retry is prohibited.'}
$failurePath=Join-Path $attemptRoot 'failure.json';$completionPath=Join-Path $attemptRoot 'qualification-host-completion.json';if((Test-Path -LiteralPath $failurePath) -or (Test-Path -LiteralPath $completionPath)){throw 'Qualification attempt is already terminal.'}
$currentHost=Get-OracleStage4R5CleanHostAdmission $contract
$providerAdmission=Get-Content -Raw -LiteralPath $providerAdmissionPath|ConvertFrom-Json;[void](Assert-OracleStage4R5ProviderAdmission $providerAdmission $contract)
if([string]$providerAdmission.authorityId-cne[string]$authority.authorityId-or[string]$providerAdmission.attemptId-cne[string]$authority.attemptId-or[string]$providerAdmission.transferId-cne[string]$transfer.transferId-or[string]$providerAdmission.providerIdentity-cne[string]$request.providerIdentity){throw 'Provider admission authority binding differs.'}
$handoff=Get-Content -Raw -LiteralPath $handoffPath|ConvertFrom-Json;[void](Assert-OracleStage4R5SecretHandoffShape $handoff ([string]$request.providerIdentity));if($handoff.PSObject.Properties.Name-cnotcontains'webSessionSecret'-or[string]::IsNullOrWhiteSpace([string]$handoff.webSessionSecret)){throw 'Provider Web-session handoff is absent.'}
$knownSecrets=@([string]$handoff.anonymousKey,[string]$handoff.serviceKey,[string]$handoff.webSessionSecret)
$state=New-OracleStage4R5LifecycleState;$index=0;$primaryFailure=$null;$qualificationPassed=$false;$cleanupFailures=[Collections.Generic.List[string]]::new();$relayCreated=$false
function Publish-OracleStage4R5Lifecycle([string]$Phase,$Details){$script:index++;$path=Join-Path $attemptRoot ("lifecycle\{0:d3}-{1}.json"-f$script:index,$Phase);Write-OracleStage4R5CreateOnlyJson $path ([ordered]@{contract='oracle.sprint-30-5.stage-4-r5-lifecycle';authorityId=[string]$authority.authorityId;attemptId=[string]$authority.attemptId;phase=$Phase;recordedAtUtc=[DateTime]::UtcNow.ToString('o');details=$Details});[void](Move-OracleStage4R5Lifecycle $state $Phase)}
function Publish-OracleStage4R5QualificationHostReturn {
  $destination=Join-Path $return 'qualification-host-attempt'
  [void](Copy-OracleStage4R5DirectoryCreateOnly $attemptRoot $destination)
  $items=@(Get-OracleStage4R5Inventory $destination)
  $manifestPath=Join-Path $return 'qualification-host-return-manifest.json'
  Write-OracleStage4R5CreateOnlyJson $manifestPath ([ordered]@{contract='oracle.sprint-30-5.stage-4-r5-qualification-host-return';result=if(Test-Path -LiteralPath $failurePath){'failed'}else{'passed-awaiting-provider-teardown'};authorityId=[string]$authority.authorityId;attemptId=[string]$authority.attemptId;files=$items;recordedAtUtc=[DateTime]::UtcNow.ToString('o')})
  Get-OracleStage4R5Sha256 $manifestPath
}
try{
  Publish-OracleStage4R5Lifecycle 'authority-consumed' @{authorityId=[string]$authority.authorityId;founderGrantId=[string]$authority.founderGrantId}
  Publish-OracleStage4R5Lifecycle 'baseline-verified' @{acceptedPreparationCommit=[string]$contract.acceptedPreparation.commit;executionCommit=[string]$authority.executionCommit;transferId=[string]$transfer.transferId;manifestSha256=[string]$transfer.manifestSha256;custodySha256=[string]$transfer.custodySha256;verificationSha256=[string]$transfer.verificationSha256}
  Publish-OracleStage4R5Lifecycle 'zero-state-verified' @{packages=0;certificates=0;runtimeConfigurations=0;relays=0;activeDefaultRoutes=0;host=$currentHost.computerName}
  $netsh=Join-Path $env:SystemRoot 'System32\netsh.exe';foreach($relay in @($contract.network.qualificationRelays)){& $netsh interface portproxy add v4tov4 "listenaddress=$([string]$relay.listenAddress)" "listenport=$([int]$relay.listenPort)" "connectaddress=$([string]$relay.connectAddress)" "connectport=$([int]$relay.connectPort)";if($LASTEXITCODE-ne0){throw "Qualification relay creation failed: $($relay.listenPort)"}}
  $relayCreated=$true;$observed=@(Get-OracleStage4R5RelayEntries|Where-Object{$_.listenAddress-ceq'127.0.0.1'-and$_.listenPort-in@(54321,54324)});[void](Assert-OracleStage4R5RelayPlan $observed ([string]$contract.hosts.provider.address))
  $apiHealth=Invoke-WebRequest -Uri 'http://127.0.0.1:54321/auth/v1/health' -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop;if([int]$apiHealth.StatusCode-ne200){throw 'Relayed provider API health failed.'}
  $mailHealth=Invoke-WebRequest -Uri 'http://127.0.0.1:54324/api/v1/info' -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop;if([int]$mailHealth.StatusCode-ne200){throw 'Relayed Mailpit health failed.'}
  Publish-OracleStage4R5Lifecycle 'provider-admitted' @{providerIdentity=[string]$request.providerIdentity;providerAdmissionSha256=Get-OracleStage4R5Sha256 $providerAdmissionPath;relays=2;publishedPorts=@(54321,54324)}
  $journeyPath=Join-Path $attemptRoot 'evidence\live-journey.json';$env:ORACLE_STAGE4_ATTEMPT_ROOT=$attemptRoot;$env:ORACLE_STAGE4_JOURNEY_OUTPUT=$journeyPath;$env:ORACLE_STAGE4_TRANSFER_ROOT=[IO.Path]::GetFullPath($TransferRoot);$env:ORACLE_STAGE4_AUTHORITY_RECORD=$localAuthorityPath;$env:ORACLE_STAGE4_PROVIDER_URL='http://127.0.0.1:54321';$env:ORACLE_STAGE4_MAILPIT_URL='http://127.0.0.1:54324';$env:ORACLE_STAGE4_ANON_KEY=[string]$handoff.anonymousKey;$env:SUPABASE_SECRET_KEY=[string]$handoff.serviceKey;$env:ORACLE_WEB_SESSION_SECRET=[string]$handoff.webSessionSecret
  & (Join-Path $PSScriptRoot 'Invoke-OracleStage4R5InstalledPackageJourney.ps1')
  if($LASTEXITCODE-ne0){throw "Installed package controller exited $LASTEXITCODE."}
  $installedPath=Join-Path $attemptRoot 'logs\installed-package-result.json';if(-not(Test-Path -LiteralPath $installedPath -PathType Leaf)){throw 'Installed package result is absent.'};$installed=Get-Content -Raw -LiteralPath $installedPath|ConvertFrom-Json
  if([string]$installed.result-cne'passed'-or-not[bool]$installed.zeroResidue-or[bool]$installed.secretValuesRecorded-or[string]$installed.packageSha256-cne[string]$contract.package.sha256){throw 'Installed package lifecycle did not pass with zero residue.'}
  $journeyText=Get-Content -Raw -LiteralPath $journeyPath;Assert-OracleStage4R5SecretFreeText $journeyText $knownSecrets;$journey=$journeyText|ConvertFrom-Json;[void](Assert-OracleStage4R5JourneyRecord $journey)
  $installedPhases=@($installed.phases|ForEach-Object{[string]$_.phase})
  foreach($phase in @('trust-established','package-installed','runtime-configuration-created','package-activated','installed-server-admitted')){if($installedPhases-cnotcontains$phase){throw "Installed lifecycle phase is absent: $phase"};Publish-OracleStage4R5Lifecycle $phase @{installedResultSha256=Get-OracleStage4R5Sha256 $installedPath}}
  Publish-OracleStage4R5Lifecycle 'anonymous-boundaries-passed' @{}
  Publish-OracleStage4R5Lifecycle 'account-created-unverified' @{accountCount=2}
  Publish-OracleStage4R5Lifecycle 'email-verified' @{}
  Publish-OracleStage4R5Lifecycle 'authenticated-rendering-passed' $journey.rendering
  Publish-OracleStage4R5Lifecycle 'isolation-passed' $journey.isolation
  Publish-OracleStage4R5Lifecycle 'session-invalidated' @{}
  foreach($phase in @('package-removed','trust-removed')){if($installedPhases-cnotcontains$phase){throw "Installed teardown phase is absent: $phase"};Publish-OracleStage4R5Lifecycle $phase @{remaining=0}}
  $qualificationPassed=$true
}catch{$primaryFailure=$_}
finally{
  foreach($name in @('ORACLE_STAGE4_ATTEMPT_ROOT','ORACLE_STAGE4_JOURNEY_OUTPUT','ORACLE_STAGE4_TRANSFER_ROOT','ORACLE_STAGE4_AUTHORITY_RECORD','ORACLE_STAGE4_PROVIDER_URL','ORACLE_STAGE4_MAILPIT_URL','ORACLE_STAGE4_ANON_KEY','SUPABASE_SECRET_KEY','ORACLE_WEB_SESSION_SECRET','ORACLE_STAGE4_WEB_ORIGIN')){[Environment]::SetEnvironmentVariable($name,$null,'Process')}
  if($relayCreated){foreach($relay in @($contract.network.qualificationRelays)){try{& (Join-Path $env:SystemRoot 'System32\netsh.exe') interface portproxy delete v4tov4 "listenaddress=$([string]$relay.listenAddress)" "listenport=$([int]$relay.listenPort)"|Out-Null;if($LASTEXITCODE-ne0){throw "netsh exited $LASTEXITCODE"}}catch{$cleanupFailures.Add("relay-remove-$($relay.listenPort): $($_.Exception.Message)")}}}
  try{$remaining=@(Get-OracleStage4R5RelayEntries|Where-Object{$_.listenAddress-ceq'127.0.0.1'-and$_.listenPort-in@(54321,54324)});if($remaining.Count-ne0){throw 'Qualification relay residue remains.'}}catch{$cleanupFailures.Add($_.Exception.Message)}
  try{if(Test-Path -LiteralPath $handoffPath){Remove-Item -LiteralPath $handoffPath -Force -ErrorAction Stop};if(Test-Path -LiteralPath $handoffPath){throw 'Secret handoff residue remains.'}}catch{$cleanupFailures.Add("secret-handoff-remove: $($_.Exception.Message)")}
}
if($null-ne$primaryFailure-or$cleanupFailures.Count-ne0){$message=if($null-ne$primaryFailure){$primaryFailure.Exception.Message}else{'Qualification cleanup failed.'};foreach($secret in $knownSecrets){if(-not[string]::IsNullOrEmpty($secret)){$message=$message.Replace($secret,'[REDACTED]')}};if(-not(Test-Path -LiteralPath $failurePath)){Write-OracleStage4R5CreateOnlyJson $failurePath ([ordered]@{result='failed';primaryFailure=$message;cleanupFailures=@($cleanupFailures);completedLifecycle=@($state.completed);retryAuthorised=$false;recordedAtUtc=[DateTime]::UtcNow.ToString('o')})};$returnManifestSha256=Publish-OracleStage4R5QualificationHostReturn;Write-OracleStage4R5CreateOnlyJson $terminalPath ([ordered]@{result='failed-awaiting-provider-teardown';authorityId=[string]$authority.authorityId;attemptId=[string]$authority.attemptId;failureSha256=Get-OracleStage4R5Sha256 $failurePath;qualificationHostReturnManifestSha256=$returnManifestSha256;retryAuthorised=$false;recordedAtUtc=[DateTime]::UtcNow.ToString('o')});throw "Stage 4 R5 qualification failed permanently: $message"}
if(-not$qualificationPassed){throw 'Qualification did not reach its passed state.'}
Write-OracleStage4R5CreateOnlyJson $completionPath ([ordered]@{result='passed-awaiting-provider-teardown';authorityId=[string]$authority.authorityId;attemptId=[string]$authority.attemptId;transferId=[string]$transfer.transferId;completedLifecycle=@($state.completed);journeySha256=Get-OracleStage4R5Sha256 (Join-Path $attemptRoot 'evidence\live-journey.json');installedResultSha256=Get-OracleStage4R5Sha256 (Join-Path $attemptRoot 'logs\installed-package-result.json');packageResidue=0;trustResidue=0;relayResidue=0;retryAuthorised=$false;completedAtUtc=[DateTime]::UtcNow.ToString('o')})
$returnManifestSha256=Publish-OracleStage4R5QualificationHostReturn
Write-OracleStage4R5CreateOnlyJson $terminalPath ([ordered]@{result='passed-awaiting-provider-teardown';authorityId=[string]$authority.authorityId;attemptId=[string]$authority.attemptId;qualificationHostCompletionSha256=Get-OracleStage4R5Sha256 $completionPath;qualificationHostReturnManifestSha256=$returnManifestSha256;retryAuthorised=$false;recordedAtUtc=[DateTime]::UtcNow.ToString('o')})
[pscustomobject][ordered]@{result='passed-awaiting-provider-teardown';authorityId=[string]$authority.authorityId;attemptId=[string]$authority.attemptId;attemptRoot=$attemptRoot;returnRoot=$return;retryAuthorised=$false}|ConvertTo-Json -Depth 8
