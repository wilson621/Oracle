[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$TransferRoot,
  [Parameter(Mandatory=$true)][string]$ExpectedManifestSha256,
  [Parameter(Mandatory=$true)][string]$ExpectedCustodySha256,
  [Parameter(Mandatory=$true)][string]$ExpectedVerificationSha256,
  [Parameter(Mandatory=$true)][string]$RehearsalId,
  [Parameter(Mandatory=$true)][string]$ProviderIdentity,
  [Parameter(Mandatory=$true)][string]$RehearsalRoot,
  [switch]$EngineeringRehearsalBundle,
  [string]$ExpectedEngineeringRehearsalBundleSha256
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')
$contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R5ExecutionContract.json')|ConvertFrom-Json
if(-not[bool]$contract.executionAuthority.twoHostDevelopmentRehearsalPermitted-or[int]$contract.executionAuthority.maximumTwoHostRehearsals-ne1){throw 'Two-host rehearsal is not admitted.'}
if($RehearsalId-cnotmatch[string]$contract.identity.rehearsalPattern-or$ProviderIdentity-cnotmatch[string]$contract.identity.providerPattern){throw 'Rehearsal or provider identity is malformed.'}
$transfer=if($EngineeringRehearsalBundle){Assert-OracleStage4R5EngineeringRehearsalBundle $TransferRoot $ExpectedEngineeringRehearsalBundleSha256}else{Assert-OracleStage4R5Transfer $TransferRoot $ExpectedManifestSha256 $ExpectedCustodySha256 $ExpectedVerificationSha256}
$root=[IO.Path]::GetFullPath($RehearsalRoot);if(Test-Path -LiteralPath $root){throw 'Create-only two-host rehearsal root exists.'};[IO.Directory]::CreateDirectory($root)|Out-Null
$request=[ordered]@{schemaVersion='1.0.0';contract='oracle.sprint-30-5.stage-4-r5-provider-rehearsal-request';classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','TWO-HOST DEVELOPMENT REHEARSAL');transferId=[string]$transfer.transferId;founderGrantId=[string]$transfer.founderGrantId;rehearsalId=$RehearsalId;providerIdentity=$ProviderIdentity;executionCommit=[string]$transfer.manifest.preparation.executionCommit;providerAddress=[string]$contract.hosts.provider.address;qualificationAddress=[string]$contract.hosts.qualification.address;authorityCreated=$false;attemptCreated=$false;createdAtUtc=[DateTime]::UtcNow.ToString('o')}
$requestPath=Join-Path $root 'provider-start-request.json';Write-OracleStage4R5CreateOnlyJson $requestPath $request
[pscustomobject][ordered]@{result='rehearsal-request-created';rehearsalId=$RehearsalId;providerIdentity=$ProviderIdentity;requestPath=$requestPath;requestSha256=Get-OracleStage4R5Sha256 $requestPath;authorityCreated=$false;attemptCreated=$false}|ConvertTo-Json -Depth 6
