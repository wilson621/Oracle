[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$FounderAuthorityToken,
  [Parameter(Mandatory = $true)][string]$FounderGrantId,
  [Parameter(Mandatory = $true)][string]$ExecutionCommit,
  [Parameter(Mandatory = $true)][string]$ExecutionTree,
  [Parameter(Mandatory = $true)][string]$PreflightRecord,
  [Parameter(Mandatory = $true)][string]$PreflightSha256,
  [Parameter(Mandatory = $true)][string]$TransferRoot,
  [Parameter(Mandatory = $true)][string]$TransferManifestSha256,
  [Parameter(Mandatory = $true)][string]$TransferCustodySha256,
  [Parameter(Mandatory = $true)][string]$TransferVerificationSha256
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage4R4PreflightPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage5R1TransferPolicy.ps1")
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
$contract = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot "Oracle.Stage5R1Contract.json") | ConvertFrom-Json
if ([string]$contract.status -cne "founder-authorised-execution-enabled" -or -not [bool]$contract.executionAuthority.founderAuthorisedQualificationExecution -or -not [bool]$contract.authorityBoundary.qualificationExecutionPermitted) { throw "Stage 5 qualification execution is not Founder-authorised." }
if ($FounderAuthorityToken -cne [string]$contract.executionAuthority.requiredFutureToken) { throw "Exact Founder execution authority token is absent." }
if ($FounderGrantId -cnotmatch [string]$contract.identity.founderGrantPattern) { throw "Founder grant identity is malformed." }
$transfer = Assert-OracleStage5R1Transfer -RepositoryRoot $root -Contract $contract -TransferRoot $TransferRoot -ExpectedManifestSha256 $TransferManifestSha256 -ExpectedCustodySha256 $TransferCustodySha256 -ExpectedVerificationSha256 $TransferVerificationSha256 -ExecutionCommit $ExecutionCommit -ExecutionTree $ExecutionTree
$preflightPath = [IO.Path]::GetFullPath($PreflightRecord)
$preflightRoot = [IO.Path]::GetFullPath((Join-Path $root ([string]$contract.paths.preflightRoot)))
[void](Assert-OracleStage4R4NoReparseTraversal $preflightPath $preflightRoot)
if (-not (Test-Path -LiteralPath $preflightPath -PathType Leaf) -or -not (Test-Path -LiteralPath "$preflightPath.sha256.txt" -PathType Leaf)) { throw "Bound preflight record is absent." }
$observedPreflight = (Get-FileHash -LiteralPath $preflightPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($observedPreflight -cne $PreflightSha256.ToLowerInvariant()) { throw "Preflight hash mismatch." }
$preflight = Get-Content -Raw -LiteralPath $preflightPath | ConvertFrom-Json
$collected = [DateTime]::ParseExact([string]$preflight.collectedAtUtc, "o", [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::RoundtripKind).ToUniversalTime()
if (([DateTime]::UtcNow - $collected).TotalMinutes -gt [double]$contract.preflight.maximumAgeMinutes) { throw "Preflight record is stale." }
if ([string]$preflight.result -cne "passed" -or [bool]$preflight.authorityCreated -or [bool]$preflight.attemptCreated -or [string]$preflight.preparationCommit -cne $ExecutionCommit -or [string]$preflight.preparationTree -cne $ExecutionTree -or [string]$preflight.transfer.transferId -cne [string]$transfer.transferId) { throw "Preflight admission failed." }
$current = Invoke-OracleStage4R4PreAuthorityChecks $root $contract $ExecutionCommit $ExecutionTree
$edgePath = [IO.Path]::GetFullPath([string]$preflight.hostAdmission.browser.path)
$edgeSha256 = (Get-FileHash -LiteralPath $edgePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($edgeSha256 -cne [string]$preflight.hostAdmission.browser.sha256 -or [string]$env:COMPUTERNAME -cne [string]$preflight.hostAdmission.identity) { throw "Host or browser state differs from preflight." }
$identity = $FounderGrantId.Substring("founder-stage5-r1-grant-".Length)
$attemptId = "stage5-r1-$identity"; $authorityId = "authority-stage5-r1-$identity"
if ($attemptId -cnotmatch [string]$contract.identity.attemptPattern -or $authorityId -cnotmatch [string]$contract.identity.authorityPattern) { throw "Derived Stage 5 identity is malformed." }
$artifactRoot = [IO.Path]::GetFullPath((Join-Path $root ([string]$contract.paths.artifactRoot)))
$attemptRoot = Join-Path $artifactRoot $attemptId; $authorityRoot = Join-Path $artifactRoot "authorities"; $authorityPath = Join-Path $authorityRoot "$authorityId.json"
$repositoryEvidence = Join-Path ([IO.Path]::GetFullPath((Join-Path $root ([string]$contract.paths.evidenceRoot)))) $attemptId
foreach ($path in @($attemptRoot, $authorityPath)) { [void](Assert-OracleStage4R4NoReparseTraversal $path $artifactRoot) }
if (Test-Path -LiteralPath $attemptRoot) { throw "Create-only Stage 5 attempt already exists." }
if (Test-Path -LiteralPath $authorityPath) { throw "Founder grant identity was already consumed." }
if (Test-Path -LiteralPath $repositoryEvidence) { throw "Create-only Stage 5 repository evidence already exists." }
function Write-CreateOnlyJson([string]$Path, $Value) { $parent=Split-Path -Parent $Path;[IO.Directory]::CreateDirectory($parent)|Out-Null;$bytes=[Text.UTF8Encoding]::new($false).GetBytes((($Value|ConvertTo-Json -Depth 40)+"`n"));$stream=[IO.File]::Open($Path,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);try{$stream.Write($bytes,0,$bytes.Length);$stream.Flush($true)}finally{$stream.Dispose()} }
function Get-Inventory([string]$Base,[string[]]$Excluded=@()) { $baseFull=[IO.Path]::GetFullPath($Base);@((Get-ChildItem -LiteralPath $baseFull -Recurse -File|Sort-Object FullName -CaseSensitive)|ForEach-Object{$relative=$_.FullName.Substring($baseFull.Length).TrimStart('\').Replace('\','/');if($Excluded-cnotcontains$relative){[ordered]@{path=$relative;size=[int64]$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}}}) }
[IO.Directory]::CreateDirectory($authorityRoot)|Out-Null
$timestamp=[DateTime]::UtcNow.ToString("o")
Write-CreateOnlyJson $authorityPath ([ordered]@{contract="oracle.sprint-30-5.stage-5-r1-authority";founderGrantId=$FounderGrantId;authorityId=$authorityId;attemptId=$attemptId;timestampUtc=$timestamp;preflightSha256=$observedPreflight;executionCommit=$ExecutionCommit;executionTree=$ExecutionTree;transferId=$transfer.transferId;consumed=$true;maximumAttempts=1;retryPermitted=$false})
[IO.Directory]::CreateDirectory($attemptRoot)|Out-Null;[IO.Directory]::CreateDirectory((Join-Path $attemptRoot "logs"))|Out-Null;[IO.Directory]::CreateDirectory((Join-Path $attemptRoot "lifecycle"))|Out-Null
$phaseIndex=0
function Publish-Phase([string]$Phase,$Details) { $script:phaseIndex++;Write-CreateOnlyJson (Join-Path $attemptRoot ("lifecycle\{0:d3}-{1}.json" -f $script:phaseIndex,$Phase)) ([ordered]@{contract="oracle.sprint-30-5.stage-5-r1-lifecycle";authorityId=$authorityId;attemptId=$attemptId;phase=$Phase;recordedAtUtc=[DateTime]::UtcNow.ToString("o");details=$Details}) }
$failure=$null;$activeCycleRoot=$null
try {
  try {
    Publish-Phase "authority-consumed" @{authorityId=$authorityId;founderGrantId=$FounderGrantId}
    Publish-Phase "baseline-and-transfer-verified" @{commit=$ExecutionCommit;tree=$ExecutionTree;transferId=$transfer.transferId;preflightSha256=$observedPreflight}
    $cyclesRoot=Join-Path $attemptRoot "cycles";[IO.Directory]::CreateDirectory($cyclesRoot)|Out-Null
    for($cycle=1;$cycle-le[int]$contract.qualificationProtocol.independentCycles;$cycle++) {
      $cycleRoot=Join-Path $cyclesRoot "cycle-$cycle";$activeCycleRoot=$cycleRoot
      [IO.Directory]::CreateDirectory($cycleRoot)|Out-Null;[IO.Directory]::CreateDirectory((Join-Path $cycleRoot "logs"))|Out-Null
      Write-CreateOnlyJson (Join-Path $cycleRoot "logs\transfer-admission.json") $transfer
      $env:ORACLE_STAGE4_EXECUTION_MODE="qualification";$env:ORACLE_STAGE4_ATTEMPT_ROOT=$cycleRoot;$env:ORACLE_STAGE4_JOURNEY_OUTPUT=Join-Path $cycleRoot "evidence\live-journey.json"
      $env:ORACLE_STAGE4_DOCKER_PATH=[string]$current.tools.docker;$env:ORACLE_STAGE4_NPM_CLI_PATH=[string]$current.tools.npmCli;$env:ORACLE_STAGE4_NODE_PATH=[string]$current.tools.node;$env:ORACLE_STAGE4_AUTHORITY_RECORD=$authorityPath;$env:ORACLE_STAGE4_POWERSHELL_PATH=[string]$current.tools.powershell;$env:ORACLE_STAGE4_TASKKILL_PATH=[string]$current.tools.taskkill;$env:ORACLE_STAGE4_TRANSFER_ROOT=[string]$transfer.transferRoot;$env:ORACLE_STAGE4_NETWORK_ISOLATION_ADMITTED="1"
      $env:ORACLE_STAGE5_QUALIFICATION_CYCLE="1";$env:ORACLE_STAGE5_QUALIFICATION_CYCLE_INDEX=[string]$cycle;$env:ORACLE_STAGE5_QUALIFICATION_ATTEMPT_ID=$attemptId;$env:ORACLE_STAGE5_EDGE_PATH=$edgePath;$env:ORACLE_STAGE5_EDGE_SHA256=$edgeSha256
      Publish-Phase "cycle-$cycle-started" @{freshPackageAndTrustLifecycle=$true}
      try { $controller=Invoke-OracleStage4R4NativeProcess ([string]$current.tools.node) @((Join-Path $PSScriptRoot "execute-observed-environment.mjs")) $root;Write-CreateOnlyJson (Join-Path $cycleRoot "logs\live-controller-process.json") $controller } catch { $processRecord=$_.Exception.Data["OracleStage4R4ProcessRecord"];if($null-ne$processRecord){Write-CreateOnlyJson (Join-Path $cycleRoot "logs\live-controller-process.json") $processRecord};throw }
      $environment=Get-Content -Raw -LiteralPath (Join-Path $cycleRoot "logs\environment-result.json")|ConvertFrom-Json
      $installed=Get-Content -Raw -LiteralPath (Join-Path $cycleRoot "logs\installed-package-result.json")|ConvertFrom-Json
      if([string]$environment.result-cne"passed" -or -not[bool]$environment.zeroResidue -or [string]$installed.result-cne"passed" -or -not[bool]$installed.zeroResidue){throw "Stage 5 cycle $cycle did not prove successful teardown."}
      Publish-Phase "cycle-$cycle-passed" @{zeroResidue=$true;samples=@((Get-Content -Raw -LiteralPath (Join-Path $cycleRoot "logs\stage5-observation.json")|ConvertFrom-Json).samples).Count}
      $activeCycleRoot=$null
    }
    $missionEvaluation=Join-Path $attemptRoot "mission-evaluation.json"
    $evaluation=Invoke-OracleStage4R4NativeProcess ([string]$current.tools.node) @((Join-Path $PSScriptRoot "evaluate-qualified-mission.mjs"),"--attempt-root",$attemptRoot,"--attempt-id",$attemptId,"--output",$missionEvaluation) $root
    Write-CreateOnlyJson (Join-Path $attemptRoot "logs\mission-evaluation-process.json") $evaluation
    $mission=Get-Content -Raw -LiteralPath $missionEvaluation|ConvertFrom-Json;if([string]$mission.result-cne"passed"){throw "Stage 5 mission evaluation failed."}
    Publish-Phase "two-cycle-acceptance-passed" @{cycles=2;packageSha256=[string]$contract.package.sha256}
    $payloadRoot=Join-Path $attemptRoot "immutable-evidence";[IO.Directory]::CreateDirectory($payloadRoot)|Out-Null
    foreach($name in @("cycles","lifecycle","logs","mission-evaluation.json")){Copy-Item -LiteralPath (Join-Path $attemptRoot $name) -Destination (Join-Path $payloadRoot $name) -Recurse -ErrorAction Stop}
    $payloadItems=@(Get-Inventory $payloadRoot);Write-CreateOnlyJson (Join-Path $payloadRoot "payload-manifest.json") ([ordered]@{contract="oracle.sprint-30-5.stage-5-r1-payload-manifest";authorityId=$authorityId;attemptId=$attemptId;files=$payloadItems})
    $archive=Join-Path $attemptRoot "Oracle.Sprint30.5.Stage5R1QualificationEvidence.zip";Add-Type -AssemblyName System.IO.Compression.FileSystem;[IO.Compression.ZipFile]::CreateFromDirectory($payloadRoot,$archive,[IO.Compression.CompressionLevel]::Optimal,$false)
    $archiveHash=(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant();$archiveSidecar="$archive.sha256.txt";$archiveBytes=[Text.Encoding]::ASCII.GetBytes("$archiveHash  $(Split-Path -Leaf $archive)`n");$archiveStream=[IO.File]::Open($archiveSidecar,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);try{$archiveStream.Write($archiveBytes,0,$archiveBytes.Length);$archiveStream.Flush($true)}finally{$archiveStream.Dispose()}
    Publish-Phase "evidence-frozen" @{archiveSha256=$archiveHash}
    Write-CreateOnlyJson (Join-Path $attemptRoot "completion.json") ([ordered]@{result="passed-awaiting-founder-review";authorityId=$authorityId;attemptId=$attemptId;archiveSha256=$archiveHash;stage6Started=$false;productionChanged=$false})
    $finalItems=@(Get-Inventory $attemptRoot @("final-evidence-manifest.json"));Write-CreateOnlyJson (Join-Path $attemptRoot "final-evidence-manifest.json") ([ordered]@{contract="oracle.sprint-30-5.stage-5-r1-final-evidence-manifest";result="passed-awaiting-founder-review";authorityId=$authorityId;attemptId=$attemptId;files=$finalItems})
    $publishing="$repositoryEvidence.publishing-$($identity.Substring($identity.Length-8))";[IO.Directory]::CreateDirectory((Split-Path -Parent $publishing))|Out-Null;Copy-Item -LiteralPath $attemptRoot -Destination $publishing -Recurse -ErrorAction Stop
    if((@(Get-Inventory $attemptRoot)|ConvertTo-Json -Depth 8 -Compress)-cne(@(Get-Inventory $publishing)|ConvertTo-Json -Depth 8 -Compress)){throw "Repository evidence copy reconciliation failed."};Move-Item -LiteralPath $publishing -Destination $repositoryEvidence
  } catch { $failure=$_ }
  if($null-ne$failure) {
    $safetyFailure=$null
    if($null-ne$activeCycleRoot) { try { $safety=Invoke-OracleStage4R4NativeProcess ([string]$current.tools.node) @((Join-Path $PSScriptRoot "execute-observed-environment.mjs"),"--teardown-only") $root;Write-CreateOnlyJson (Join-Path $activeCycleRoot "logs\safety-controller-process.json") $safety } catch { $safetyFailure=$_ } }
    Write-CreateOnlyJson (Join-Path $attemptRoot "failure.json") ([ordered]@{result="failed";primaryFailure=$failure.Exception.Message;safetyFailure=if($null-ne$safetyFailure){$safetyFailure.Exception.Message}else{$null};retryProhibited=$true;authorityConsumed=$true})
    if($null-ne$safetyFailure){throw "Stage 5 qualification and safety teardown failed. Primary: $($failure.Exception.Message). Teardown: $($safetyFailure.Exception.Message)"};throw $failure
  }
} finally {
  foreach($name in @("ORACLE_STAGE4_EXECUTION_MODE","ORACLE_STAGE4_ATTEMPT_ROOT","ORACLE_STAGE4_JOURNEY_OUTPUT","ORACLE_STAGE4_DOCKER_PATH","ORACLE_STAGE4_NPM_CLI_PATH","ORACLE_STAGE4_NODE_PATH","ORACLE_STAGE4_AUTHORITY_RECORD","ORACLE_STAGE4_POWERSHELL_PATH","ORACLE_STAGE4_TASKKILL_PATH","ORACLE_STAGE4_NETWORK_ISOLATION_ADMITTED","ORACLE_STAGE4_TRANSFER_ROOT","ORACLE_STAGE5_QUALIFICATION_CYCLE","ORACLE_STAGE5_QUALIFICATION_CYCLE_INDEX","ORACLE_STAGE5_QUALIFICATION_ATTEMPT_ID","ORACLE_STAGE5_EDGE_PATH","ORACLE_STAGE5_EDGE_SHA256")){Remove-Item "Env:$name" -ErrorAction SilentlyContinue}
}
$finalManifest=Join-Path $attemptRoot "final-evidence-manifest.json"
[pscustomobject]@{result="passed-awaiting-founder-review";authorityId=$authorityId;attemptId=$attemptId;attemptRoot=$attemptRoot;repositoryEvidence=$repositoryEvidence;archiveSha256=$archiveHash;finalEvidenceManifestSha256=(Get-FileHash -LiteralPath $finalManifest -Algorithm SHA256).Hash.ToLowerInvariant();transferId=$transfer.transferId}|ConvertTo-Json -Depth 8
