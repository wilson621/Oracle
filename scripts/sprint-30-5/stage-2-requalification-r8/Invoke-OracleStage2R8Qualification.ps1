[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$TransferRoot,
  [Parameter(Mandatory = $true)][string]$ExpectedManifestSha256,
  [Parameter(Mandatory = $true)][string]$ExpectedCustodySha256,
  [Parameter(Mandatory = $true)][string]$ExpectedVerificationSha256,
  [Parameter(Mandatory = $true)][string]$FounderGrantId,
  [Parameter(Mandatory = $true)][string]$LocalExecutionParent,
  [Parameter(Mandatory = $true)][string]$ReturnRoot
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$contractPath = Join-Path $PSScriptRoot 'Oracle.Stage2RequalificationR8Contract.json'
$contract = Get-Content -Raw -LiteralPath $contractPath | ConvertFrom-Json
. (Join-Path $PSScriptRoot 'Oracle.Stage2R8CleanHostCore.ps1')

if (
  [string]$contract.status -cne 'founder-authorised-replacement-execution-enabled' -or
  -not [bool]$contract.futureTransfer.creationPermitted -or
  -not [bool]$contract.authority.authorityCreationPermitted -or
  -not [bool]$contract.authority.attemptCreationPermitted -or
  -not [bool]$contract.authority.qualificationExecutionPermitted -or
  [int]$contract.replacementMission.maximumTransfers -ne 1 -or
  [int]$contract.replacementMission.maximumAuthorities -ne 1 -or
  [int]$contract.replacementMission.maximumAttempts -ne 1 -or
  -not [bool]$contract.replacementMission.createAuthorityOnlyAfterAllPreAuthorityGates -or
  [bool]$contract.replacementMission.retryAfterConsumedAuthority -or
  [bool]$contract.replacementMission.stage3Authorised -or
  [string]$contract.replacementMission.founderGrantId -cne $FounderGrantId
) {
  throw 'R8 qualification execution is not authorised by this exact mission contract.'
}

$transfer = Assert-OracleStage2R8Transfer -TransferRoot $TransferRoot -ExpectedManifestSha256 $ExpectedManifestSha256 -ExpectedCustodySha256 $ExpectedCustodySha256 -ExpectedVerificationSha256 $ExpectedVerificationSha256
if ([string]$transfer.transferId -cne [string]$contract.replacementMission.transferId -or [string]$transfer.manifest.founderGrantId -cne $FounderGrantId -or [string]$transfer.manifest.replacesTransferId -cne [string]$contract.replacementMission.replacesTransferId) { throw 'R8 admitted transfer mission binding differs.' }
$hostAdmission = Get-OracleStage2R8HostAdmission -Contract $contract
$localParent = [IO.Path]::GetFullPath($LocalExecutionParent)
$return = [IO.Path]::GetFullPath($ReturnRoot)
if (-not (Test-Path -LiteralPath $localParent -PathType Container)) { throw 'Approved local execution parent is absent.' }
if (-not (Test-Path -LiteralPath $return -PathType Container)) { throw 'Approved return root is absent.' }
[void](Assert-OracleStage2R8NoReparseTraversal -Path $localParent -Root $localParent)
[void](Assert-OracleStage2R8NoReparseTraversal -Path $return -Root $return)
$continuity = [ordered]@{
  schemaVersion='1.0.0'
  contract='oracle.sprint-30-5.stage-2-r8-host-continuity'
  transferId=[string]$transfer.transferId
  replacesTransferId=[string]$transfer.manifest.replacesTransferId
  founderGrantId=$FounderGrantId
  host=$hostAdmission
  localExecutionParentAdmitted=$true
  returnRootAdmitted=$true
  allPreAuthorityGatesPassed=$true
  authorityCreated=$false
  attemptCreated=$false
  recordedAtUtc=[DateTime]::UtcNow.ToString('o')
}
$continuityPath = Join-Path $return ("Oracle.Stage2R8HostContinuity-$($transfer.transferId).json")
Write-OracleStage2R8CreateOnlyJson -Path $continuityPath -Value $continuity

$futureIdentity = New-OracleStage2R8AuthorityIdentity
$attemptRoot = Join-Path $localParent ([string]$futureIdentity.attemptId)
$returnAttemptRoot = Join-Path $return ([string]$futureIdentity.attemptId)
if (Test-Path -LiteralPath $attemptRoot) { throw 'Create-only local attempt root already exists.' }
if (Test-Path -LiteralPath $returnAttemptRoot) { throw 'Create-only return attempt root already exists.' }
[IO.Directory]::CreateDirectory($attemptRoot) | Out-Null
$authorityPath = Join-Path $attemptRoot 'single-attempt-authority.json'
$authority = [ordered]@{
  schemaVersion='1.0.0'
  contract='oracle.sprint-30-5.stage-2-r8-single-attempt-authority'
  founderGrantId=$FounderGrantId
  authorityId=[string]$futureIdentity.authorityId
  attemptId=[string]$futureIdentity.attemptId
  transferId=[string]$transfer.transferId
  replacesTransferId=[string]$transfer.manifest.replacesTransferId
  state='consumed'
  attemptsAuthorised=1
  attemptsConsumed=1
  createdAfterTransferContinuityHostAndPreAuthorityAdmission=$true
  createdAtUtc=[DateTime]::UtcNow.ToString('o')
}
Write-OracleStage2R8CreateOnlyJson -Path $authorityPath -Value $authority
$attemptRecordPath = Join-Path $attemptRoot 'attempt.json'
Write-OracleStage2R8CreateOnlyJson -Path $attemptRecordPath -Value ([ordered]@{schemaVersion='1.0.0';contract='oracle.sprint-30-5.stage-2-r8-attempt';authorityId=[string]$futureIdentity.authorityId;attemptId=[string]$futureIdentity.attemptId;transferId=[string]$transfer.transferId;replacesTransferId=[string]$transfer.manifest.replacesTransferId;state='running';startedAtUtc=[DateTime]::UtcNow.ToString('o')})

$work = Join-Path $attemptRoot 'work'
$evidence = Join-Path $attemptRoot 'evidence'
[IO.Directory]::CreateDirectory($work) | Out-Null
[IO.Directory]::CreateDirectory($evidence) | Out-Null
$primary = $null
$verification = $null
$finalAdmission = $null
try {
  $verification = Invoke-OracleStage2R8CandidateVerification -Contract $contract -PayloadRoot ([string]$transfer.payloadRoot) -WorkRoot $work
} catch {
  $primary = $_.Exception
}
try {
  $finalAdmission = Get-OracleStage2R8HostAdmission -Contract $contract
} catch {
  if ($null -eq $primary) { $primary = $_.Exception } else { $primary = [AggregateException]::new('Candidate verification and final host admission failed.', @($primary,$_.Exception)) }
}
$zeroResidue = $null -ne $finalAdmission -and [int]$finalAdmission.packagesPresent -eq 0 -and [int]$finalAdmission.certificatesPresent -eq 0
$outcome = [ordered]@{
  schemaVersion='1.0.0'
  contract='oracle.sprint-30-5.stage-2-r8-qualification-outcome'
  result=if($null -eq $primary -and $zeroResidue){'passed-awaiting-founder-review'}else{'failed'}
  authorityId=[string]$futureIdentity.authorityId
  attemptId=[string]$futureIdentity.attemptId
  transferId=[string]$transfer.transferId
  replacesTransferId=[string]$transfer.manifest.replacesTransferId
  candidateVerification=$verification
  finalHostAdmission=$finalAdmission
  zeroResidue=$zeroResidue
  error=if($null -ne $primary){$primary.Message}else{$null}
  completedAtUtc=[DateTime]::UtcNow.ToString('o')
  retryAuthorised=$false
}
Write-OracleStage2R8CreateOnlyJson -Path (Join-Path $evidence 'qualification-outcome.json') -Value $outcome
Copy-Item -LiteralPath $authorityPath -Destination (Join-Path $evidence 'single-attempt-authority.json')
Copy-Item -LiteralPath $continuityPath -Destination (Join-Path $evidence 'host-continuity.json')
Copy-Item -LiteralPath $contractPath -Destination (Join-Path $evidence 'execution-contract.json')
$manifestFiles = @(Get-OracleStage2R8PayloadInventory -PayloadRoot $evidence)
$manifest = [ordered]@{schemaVersion='1.0.0';contract='oracle.sprint-30-5.stage-2-r8-final-evidence-manifest';authorityId=[string]$futureIdentity.authorityId;attemptId=[string]$futureIdentity.attemptId;transferId=[string]$transfer.transferId;replacesTransferId=[string]$transfer.manifest.replacesTransferId;result=[string]$outcome.result;files=$manifestFiles}
Write-OracleStage2R8CreateOnlyJson -Path (Join-Path $attemptRoot 'final-evidence-manifest.json') -Value $manifest
Write-OracleStage2R8CreateOnlyJson -Path (Join-Path $attemptRoot 'attempt-completion.json') -Value ([ordered]@{schemaVersion='1.0.0';contract='oracle.sprint-30-5.stage-2-r8-attempt-completion';authorityId=[string]$futureIdentity.authorityId;attemptId=[string]$futureIdentity.attemptId;state=if($null -eq $primary -and $zeroResidue){'completed'}else{'failed-permanently'};result=[string]$outcome.result;retryAuthorised=$false;completedAtUtc=[DateTime]::UtcNow.ToString('o')})
Copy-Item -LiteralPath $attemptRoot -Destination $returnAttemptRoot -Recurse
if ($null -ne $primary -or -not $zeroResidue) { throw "Stage 2 R8 qualification failed permanently: $($outcome.error)" }
$outcome | ConvertTo-Json -Depth 20
