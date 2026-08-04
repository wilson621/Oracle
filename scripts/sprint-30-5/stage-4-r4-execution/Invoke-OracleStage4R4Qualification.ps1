[CmdletBinding()]param(
  [Parameter(Mandatory=$true)][string]$FounderAuthorityToken,
  [Parameter(Mandatory=$true)][string]$FounderGrantId,
  [Parameter(Mandatory=$true)][string]$PreparationCommit,
  [Parameter(Mandatory=$true)][string]$PreparationTree,
  [Parameter(Mandatory=$true)][string]$PreflightRecord,
  [Parameter(Mandatory=$true)][string]$PreflightSha256,
  [Parameter(Mandatory=$true)][string]$TransferRoot,
  [Parameter(Mandatory=$true)][string]$TransferManifestSha256,
  [Parameter(Mandatory=$true)][string]$TransferCustodySha256,
  [Parameter(Mandatory=$true)][string]$TransferVerificationSha256
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R4LifecyclePolicy.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R4JourneyPolicy.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R4PreflightPolicy.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R4TransferPolicy.ps1')
$contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R4Contract.json')|ConvertFrom-Json
if([string]$contract.status -cne 'founder-authorised-execution-enabled' -or -not[bool]$contract.executionAuthority.founderAuthorisedQualificationExecution -or -not[bool]$contract.executionAuthority.authorityCreationPermitted -or -not[bool]$contract.executionAuthority.qualificationAttemptPermitted){throw 'Stage 4 R4 qualification execution is not Founder-authorised by the bound contract.'}
if($FounderAuthorityToken -cne [string]$contract.executionAuthority.requiredFutureToken){throw 'Exact Founder execution authority token is absent.'}
if($FounderGrantId -cnotmatch [string]$contract.identity.founderGrantPattern){throw 'Founder grant identity is malformed.'}
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))
$transferAdmission=Assert-OracleStage4R4Transfer -RepositoryRoot $root -Contract $contract -TransferRoot $TransferRoot -ExpectedManifestSha256 $TransferManifestSha256 -ExpectedCustodySha256 $TransferCustodySha256 -ExpectedVerificationSha256 $TransferVerificationSha256 -ExecutionCommit $PreparationCommit -ExecutionTree $PreparationTree
$preflightRoot=[IO.Path]::GetFullPath((Join-Path $root ([string]$contract.paths.preflightRoot)))
$preflightPath=[IO.Path]::GetFullPath($PreflightRecord);[void](Assert-OracleStage4R4NoReparseTraversal $preflightPath $preflightRoot)
if(-not(Test-Path -LiteralPath $preflightPath -PathType Leaf)){throw 'Bound preflight record is absent.'}
$preflightSidecar="$preflightPath.sha256.txt";if(-not(Test-Path -LiteralPath $preflightSidecar -PathType Leaf)){throw 'Bound preflight sidecar is absent.'}
$observedPreflight=(Get-FileHash -LiteralPath $preflightPath -Algorithm SHA256).Hash.ToLowerInvariant();if($observedPreflight -cne $PreflightSha256.ToLowerInvariant()){throw 'Preflight hash mismatch.'}
$sidecarText=(Get-Content -Raw -LiteralPath $preflightSidecar).Trim();if($sidecarText -cne "$observedPreflight  $(Split-Path -Leaf $preflightPath)"){throw 'Preflight sidecar binding mismatch.'}
$preflight=Get-Content -Raw -LiteralPath $preflightPath|ConvertFrom-Json
if([string]$preflight.result -cne 'passed' -or (@($preflight.classification)-join '|') -cne (@($contract.preflight.classification)-join '|') -or [string]$preflight.preparationCommit -cne $PreparationCommit -or [string]$preflight.preparationTree -cne $PreparationTree -or [bool]$preflight.authorityCreated -or [bool]$preflight.attemptCreated -or [bool]$preflight.hostMutation -or [bool]$preflight.qualificationEvidence -or [string]$preflight.transfer.transferId -cne [string]$transferAdmission.transferId -or [string]$preflight.transfer.manifestSha256 -cne [string]$transferAdmission.manifestSha256 -or [string]$preflight.transfer.custodySha256 -cne [string]$transferAdmission.custodySha256 -or [string]$preflight.transfer.verificationSha256 -cne [string]$transferAdmission.verificationSha256){throw 'Preflight admission failed.'}
$collected=[DateTime]::ParseExact([string]$preflight.collectedAtUtc,'o',[Globalization.CultureInfo]::InvariantCulture,[Globalization.DateTimeStyles]::RoundtripKind).ToUniversalTime();$age=[DateTime]::UtcNow-$collected
if($age.TotalSeconds -lt -5 -or $age.TotalMinutes -gt [double]$contract.preflight.maximumAgeMinutes){throw 'Preflight record is stale or future-dated.'}
$current=Invoke-OracleStage4R4PreAuthorityChecks $root $contract $PreparationCommit $PreparationTree
$transferAdmission=Assert-OracleStage4R4Transfer -RepositoryRoot $root -Contract $contract -TransferRoot $TransferRoot -ExpectedManifestSha256 $TransferManifestSha256 -ExpectedCustodySha256 $TransferCustodySha256 -ExpectedVerificationSha256 $TransferVerificationSha256 -ExecutionCommit $PreparationCommit -ExecutionTree $PreparationTree
if((($current.toolIdentities|ConvertTo-Json -Depth 10 -Compress) -cne ($preflight.toolIdentities|ConvertTo-Json -Depth 10 -Compress)) -or [string]$current.acceptedCandidateCommit -cne [string]$preflight.acceptedCandidateCommit){throw 'Current pre-authority tool or candidate state differs from the bound preflight.'}
$identity=$FounderGrantId.Substring('founder-stage4-r4-grant-'.Length);$attemptId="stage4-r4-$identity";$authorityId="authority-stage4-r4-$identity"
if($attemptId -cnotmatch [string]$contract.identity.attemptPattern -or $authorityId -cnotmatch [string]$contract.identity.authorityPattern){throw 'Derived authority or attempt identity is malformed.'}
$artifactRoot=[IO.Path]::GetFullPath((Join-Path $root ([string]$contract.paths.artifactRoot)));$authorityRoot=Join-Path $artifactRoot 'authorities';$attemptRoot=Join-Path $artifactRoot $attemptId
$evidenceRoot=[IO.Path]::GetFullPath((Join-Path $root ([string]$contract.paths.evidenceRoot)));$repositoryEvidence=Join-Path $evidenceRoot $attemptId
foreach($path in @($authorityRoot,$attemptRoot)){[void](Assert-OracleStage4R4NoReparseTraversal $path $artifactRoot)};[void](Assert-OracleStage4R4NoReparseTraversal $repositoryEvidence $evidenceRoot)
if(Test-Path -LiteralPath $attemptRoot){throw "Create-only Stage 4 attempt already exists: $attemptRoot"};if(Test-Path -LiteralPath $repositoryEvidence){throw "Create-only Stage 4 evidence already exists: $repositoryEvidence"}
[IO.Directory]::CreateDirectory($authorityRoot)|Out-Null;[void](Assert-OracleStage4R4NoReparseTraversal $authorityRoot $artifactRoot)
$authorityPath=Join-Path $authorityRoot "$authorityId.json";if(Test-Path -LiteralPath $authorityPath){throw 'Founder grant or authority identity was already consumed.'}
function Write-CreateOnlyJson([string]$Path,$Value){$parent=Split-Path -Parent $Path;[IO.Directory]::CreateDirectory($parent)|Out-Null;$json=$Value|ConvertTo-Json -Depth 40;$bytes=[Text.UTF8Encoding]::new($false).GetBytes("$json`n");$stream=[IO.File]::Open($Path,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);try{$stream.Write($bytes,0,$bytes.Length);$stream.Flush($true)}finally{$stream.Dispose()}}
function Get-Inventory([string]$Base,[string[]]$Excluded=@()){$baseFull=[IO.Path]::GetFullPath($Base);$items=@();foreach($file in @(Get-ChildItem -LiteralPath $baseFull -Recurse -File|Sort-Object FullName -CaseSensitive)){if(($file.Attributes-band[IO.FileAttributes]::ReparsePoint)-ne 0){throw "Reparse point in evidence: $($file.FullName)"};$relative=$file.FullName.Substring($baseFull.Length).TrimStart('\').Replace('\','/');if($Excluded-ccontains$relative){continue};$items+=[ordered]@{path=$relative;size=[int64]$file.Length;sha256=(Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}};$items}
$timestamp=(Get-Date).ToUniversalTime().ToString('o')
Write-CreateOnlyJson $authorityPath ([ordered]@{contract='oracle.sprint-30-5.stage-4-r4-authority';founderGrantId=$FounderGrantId;authorityId=$authorityId;attemptId=$attemptId;timestampUtc=$timestamp;preflightSha256=$observedPreflight;preparationCommit=$PreparationCommit;preparationTree=$PreparationTree;transferId=$transferAdmission.transferId;transferManifestSha256=$transferAdmission.manifestSha256;transferCustodySha256=$transferAdmission.custodySha256;transferVerificationSha256=$transferAdmission.verificationSha256;consumed=$true})
New-Item -ItemType Directory -Path $attemptRoot -ErrorAction Stop|Out-Null
New-Item -ItemType Directory -Path (Join-Path $attemptRoot 'logs') -ErrorAction Stop|Out-Null
$state=New-OracleStage4R4LifecycleState;$failure=$null;$index=0
function Publish-Lifecycle([string]$Phase,$Details){$script:index++;Write-CreateOnlyJson (Join-Path $attemptRoot ("lifecycle\{0:d3}-{1}.json" -f $script:index,$Phase)) ([ordered]@{contract='oracle.sprint-30-5.stage-4-r4-lifecycle';authorityId=$authorityId;attemptId=$attemptId;phase=$Phase;recordedAtUtc=(Get-Date).ToUniversalTime().ToString('o');details=$Details});[void](Move-OracleStage4R4Lifecycle $state $Phase)}
$journeyPath=Join-Path $attemptRoot 'evidence\live-journey.json';$controllerLog=Join-Path $attemptRoot 'logs\live-controller-process.json'
$env:ORACLE_STAGE4_EXECUTION_MODE='qualification';$env:ORACLE_STAGE4_ATTEMPT_ROOT=$attemptRoot;$env:ORACLE_STAGE4_JOURNEY_OUTPUT=$journeyPath;$env:ORACLE_STAGE4_DOCKER_PATH=[string]$current.tools.docker;$env:ORACLE_STAGE4_NPM_CLI_PATH=[string]$current.tools.npmCli;$env:ORACLE_STAGE4_NODE_PATH=[string]$current.tools.node;$env:ORACLE_STAGE4_AUTHORITY_RECORD=$authorityPath;$env:ORACLE_STAGE4_POWERSHELL_PATH=[string]$current.tools.powershell;$env:ORACLE_STAGE4_TASKKILL_PATH=[string]$current.tools.taskkill;$env:ORACLE_STAGE4_TRANSFER_ROOT=[string]$transferAdmission.transferRoot;$env:ORACLE_STAGE4_NETWORK_ISOLATION_ADMITTED=$(if([bool]$current.networkIsolated){'1'}else{throw 'Current host network isolation was not admitted.'})
try{
  try{
    Publish-Lifecycle 'authority-consumed' @{authorityId=$authorityId;founderGrantId=$FounderGrantId}
    Publish-Lifecycle 'baseline-verified' @{commit=$PreparationCommit;tree=$PreparationTree;preflightSha256=$observedPreflight;acceptedCandidateCommit=$contract.repository.acceptedCandidateCommit;acceptedCandidateTree=$contract.repository.acceptedCandidateTree;transferId=$transferAdmission.transferId;transferManifestSha256=$transferAdmission.manifestSha256;transferCustodySha256=$transferAdmission.custodySha256;transferVerificationSha256=$transferAdmission.verificationSha256}
    Write-CreateOnlyJson (Join-Path $attemptRoot 'logs\transfer-admission.json') $transferAdmission
    try{$controller=Invoke-OracleStage4R4NativeProcess ([string]$current.tools.node) @((Join-Path $PSScriptRoot 'execute-live-environment.mjs')) $root;Write-CreateOnlyJson $controllerLog $controller}catch{$record=$_.Exception.Data['OracleStage4R4ProcessRecord'];if($null-ne$record -and -not(Test-Path -LiteralPath $controllerLog)){Write-CreateOnlyJson $controllerLog $record};throw}
    $environmentPath=Join-Path $attemptRoot 'logs\environment-result.json';if(-not(Test-Path -LiteralPath $environmentPath -PathType Leaf)){throw 'Live environment result is absent.'};$environment=Get-Content -Raw -LiteralPath $environmentPath|ConvertFrom-Json
    if([string]$environment.mode -cne 'qualification' -or [string]$environment.result -cne 'passed' -or -not[bool]$environment.zeroResidue -or @($environment.cleanupFailures).Count-ne 0){throw 'Live environment teardown was not affirmatively proven.'}
    $journeyText=Get-Content -Raw -LiteralPath $journeyPath;Assert-OracleStage4R4SecretFreeText -Text $journeyText -KnownSecrets @();$journey=$journeyText|ConvertFrom-Json;[void](Assert-OracleStage4R4JourneyRecord $journey)
    $installedPath=Join-Path $attemptRoot 'logs\installed-package-result.json';if(-not(Test-Path -LiteralPath $installedPath -PathType Leaf)){throw 'Installed-package result is absent.'};$installed=Get-Content -Raw -LiteralPath $installedPath|ConvertFrom-Json
    if([string]$installed.result-cne'passed' -or -not[bool]$installed.zeroResidue -or [bool]$installed.secretValuesRecorded -or [string]$installed.packageSha256-cne[string]$contract.stage2.msixSha256){throw 'Installed-package result is not admissible.'}
    $installedPhases=@($installed.phases|ForEach-Object{[string]$_.phase})
    foreach($required in @('zero-state-verified','trust-established','package-installed','runtime-configuration-created','package-activated','installed-server-admitted','package-removed','trust-removed')){if($installedPhases-cnotcontains$required){throw "Installed lifecycle phase is absent: $required"}}
    Publish-Lifecycle 'zero-state-verified' @{packages=0;certificates=0;runtimeConfigurations=0}
    Publish-Lifecycle 'provider-admitted' @{classification=$journey.provider.classification;route='network-isolated-host-runtime-verified'}
    Publish-Lifecycle 'trust-established' @{thumbprint=$contract.stage2.certificateThumbprint}
    Publish-Lifecycle 'package-installed' @{packageFullName=$contract.package.fullName;msixSha256=$contract.stage2.msixSha256}
    Publish-Lifecycle 'runtime-configuration-created' @{contract=$contract.installedRuntime.configurationContract;secretValuesRecorded=$false}
    Publish-Lifecycle 'package-activated' @{api=$contract.applicationActivation.api}
    Publish-Lifecycle 'installed-server-admitted' @{ownership=$contract.installedRuntime.loopbackServerDiscovery}
    Publish-Lifecycle 'anonymous-boundaries-passed' @{}
    Publish-Lifecycle 'account-created-unverified' @{accountCount=2}
    Publish-Lifecycle 'email-verified' @{}
    Publish-Lifecycle 'authenticated-rendering-passed' $journey.rendering
    Publish-Lifecycle 'isolation-passed' $journey.isolation
    Publish-Lifecycle 'session-invalidated' @{}
    Publish-Lifecycle 'package-removed' @{remaining=0}
    Publish-Lifecycle 'trust-removed' @{remaining=0}
    Publish-Lifecycle 'provider-torn-down' @{environmentResult='passed'}
    Publish-Lifecycle 'cleanup-passed' @{zeroResidue=$true}
    $payloadRoot=Join-Path $attemptRoot 'immutable-evidence';New-Item -ItemType Directory -Path $payloadRoot -ErrorAction Stop|Out-Null
    foreach($name in @('evidence','lifecycle','logs')){Copy-Item -LiteralPath (Join-Path $attemptRoot $name) -Destination (Join-Path $payloadRoot $name) -Recurse -ErrorAction Stop}
    $payloadItems=@(Get-Inventory $payloadRoot);Write-CreateOnlyJson (Join-Path $payloadRoot 'payload-manifest.json') ([ordered]@{contract='oracle.sprint-30-5.stage-4-r4-payload-manifest';authorityId=$authorityId;attemptId=$attemptId;files=$payloadItems})
    $archive=Join-Path $attemptRoot 'Oracle.Sprint30.5.Stage4R4QualificationEvidence.zip';Add-Type -AssemblyName System.IO.Compression.FileSystem;[IO.Compression.ZipFile]::CreateFromDirectory($payloadRoot,$archive,[IO.Compression.CompressionLevel]::Optimal,$false)
    $zip=[IO.Compression.ZipFile]::OpenRead($archive);try{$entries=@($zip.Entries|Where-Object{-not[string]::IsNullOrEmpty($_.Name)});if($entries.Count-ne($payloadItems.Count+1)-or @($entries|Group-Object FullName|Where-Object Count -gt 1).Count-ne 0){throw 'Qualification archive inventory mismatch.'}}finally{$zip.Dispose()}
    $archiveHash=(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant();$sidecar="$archive.sha256.txt";$sideBytes=[Text.Encoding]::ASCII.GetBytes("$archiveHash  $(Split-Path -Leaf $archive)`n");$side=[IO.File]::Open($sidecar,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);try{$side.Write($sideBytes,0,$sideBytes.Length);$side.Flush($true)}finally{$side.Dispose()}
    Publish-Lifecycle 'evidence-frozen' @{archive=(Split-Path -Leaf $archive);archiveSha256=$archiveHash;archiveFiles=$entries.Count}
    if(-not$state.terminal){throw 'Lifecycle did not reach its terminal state.'}
    Write-CreateOnlyJson (Join-Path $attemptRoot 'completion.json') ([ordered]@{result='passed-awaiting-founder-review';authorityId=$authorityId;attemptId=$attemptId;archiveSha256=$archiveHash;stage5Started=$false;productionChanged=$false})
    $finalItems=@(Get-Inventory $attemptRoot @('final-evidence-manifest.json'));Write-CreateOnlyJson (Join-Path $attemptRoot 'final-evidence-manifest.json') ([ordered]@{contract='oracle.sprint-30-5.stage-4-r4-final-evidence-manifest';result='passed-awaiting-founder-review';authorityId=$authorityId;attemptId=$attemptId;files=$finalItems})
    $publishing="$repositoryEvidence.publishing-$($identity.Substring($identity.Length-8))";if(Test-Path -LiteralPath $publishing){throw 'Evidence publication staging path exists.'};[IO.Directory]::CreateDirectory((Split-Path -Parent $publishing))|Out-Null;New-Item -ItemType Directory -Path $publishing -ErrorAction Stop|Out-Null
    foreach($item in Get-ChildItem -LiteralPath $attemptRoot -Force){Copy-Item -LiteralPath $item.FullName -Destination $publishing -Recurse -ErrorAction Stop}
    $source=@(Get-Inventory $attemptRoot);$copy=@(Get-Inventory $publishing);if(($source|ConvertTo-Json -Depth 8 -Compress)-cne($copy|ConvertTo-Json -Depth 8 -Compress)){throw 'Repository evidence copy reconciliation failed.'};Move-Item -LiteralPath $publishing -Destination $repositoryEvidence
  }catch{$failure=$_}
  if($null-ne$failure){
    $environmentPath=Join-Path $attemptRoot 'logs\environment-result.json';$environment=if(Test-Path -LiteralPath $environmentPath){Get-Content -Raw -LiteralPath $environmentPath|ConvertFrom-Json}else{$null};$safetyFailure=$null
    if($null-eq$environment -or -not[bool]$environment.zeroResidue){try{try{$safety=Invoke-OracleStage4R4NativeProcess ([string]$current.tools.node) @((Join-Path $PSScriptRoot 'execute-live-environment.mjs'),'--teardown-only') $root;Write-CreateOnlyJson (Join-Path $attemptRoot 'logs\safety-controller-process.json') $safety}catch{$record=$_.Exception.Data['OracleStage4R4ProcessRecord'];if($null-ne$record){Write-CreateOnlyJson (Join-Path $attemptRoot 'logs\safety-controller-process.json') $record};throw}}catch{$safetyFailure=$_}}
    $obligations=Get-OracleStage4R4TeardownObligations @($state.completed);Write-CreateOnlyJson (Join-Path $attemptRoot 'failure.json') ([ordered]@{result='failed';primaryFailure=$failure.Exception.Message;safetyFailure=if($null-ne$safetyFailure){$safetyFailure.Exception.Message}else{$null};completed=@($state.completed);environment=$environment;teardown=$obligations;retryProhibited=$true})
    if($null-ne$safetyFailure){throw "Stage 4 qualification failed and safety teardown also failed. Primary: $($failure.Exception.Message). Teardown: $($safetyFailure.Exception.Message)"};throw $failure
  }
}finally{foreach($name in @('ORACLE_STAGE4_EXECUTION_MODE','ORACLE_STAGE4_ATTEMPT_ROOT','ORACLE_STAGE4_JOURNEY_OUTPUT','ORACLE_STAGE4_DOCKER_PATH','ORACLE_STAGE4_NPM_CLI_PATH','ORACLE_STAGE4_NODE_PATH','ORACLE_STAGE4_AUTHORITY_RECORD','ORACLE_STAGE4_POWERSHELL_PATH','ORACLE_STAGE4_TASKKILL_PATH','ORACLE_STAGE4_NETWORK_ISOLATION_ADMITTED','ORACLE_STAGE4_TRANSFER_ROOT')){Remove-Item "Env:$name" -ErrorAction SilentlyContinue}}
$finalManifest=Join-Path $attemptRoot 'final-evidence-manifest.json';$finalManifestHash=(Get-FileHash -LiteralPath $finalManifest -Algorithm SHA256).Hash.ToLowerInvariant()
[pscustomobject]@{result='passed-awaiting-founder-review';authorityId=$authorityId;attemptId=$attemptId;attemptRoot=$attemptRoot;repositoryEvidence=$repositoryEvidence;archiveSha256=$archiveHash;finalEvidenceManifestSha256=$finalManifestHash;transferId=$transferAdmission.transferId;transferManifestSha256=$transferAdmission.manifestSha256;transferCustodySha256=$transferAdmission.custodySha256;transferVerificationSha256=$transferAdmission.verificationSha256}|ConvertTo-Json -Depth 8