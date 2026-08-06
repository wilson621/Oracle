[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9a-f]{64}$')][string]$ExpectedManifestSha256,
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9a-f]{64}$')][string]$ExpectedCustodySha256,
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9a-f]{64}$')][string]$ExpectedVerificationSha256,
  [Parameter(Mandatory = $true)][string]$FounderGrantId,
  [string]$LocalTransferParent = 'C:\OracleQualification\Stage2R8\Transfers',
  [string]$LocalExecutionParent = 'C:\OracleQualification\Stage2R8\Attempts',
  [Parameter(Mandatory = $true)][string]$ReturnRoot
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$sourceTransferRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$manifestPath = Join-Path $sourceTransferRoot 'Oracle.Stage2R8TransferManifest.json'
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) { throw 'R8 transfer manifest is absent.' }
$actualManifestSha256 = (Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actualManifestSha256 -cne $ExpectedManifestSha256.ToLowerInvariant()) { throw 'R8 bootstrap manifest hash differs.' }
$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
if ([string]$manifest.founderGrantId -cne $FounderGrantId) { throw 'R8 bootstrap Founder grant identity differs.' }
foreach ($relativePath in @(
  'harness/Oracle.Stage2R8CleanHostCore.ps1',
  'harness/Invoke-OracleStage2R8Qualification.ps1',
  'harness/Invoke-OracleStage2R8FounderHandoff.ps1',
  'harness/Oracle.Stage2RequalificationR8Contract.json'
)) {
  $entries = @($manifest.files | Where-Object { [string]$_.path -ceq $relativePath })
  if ($entries.Count -ne 1) { throw "R8 bootstrap payload entry differs: $relativePath" }
  $file = Join-Path (Join-Path $sourceTransferRoot 'payload') ($relativePath.Replace('/', '\'))
  if ((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$entries[0].sha256) { throw "R8 bootstrap payload hash differs: $relativePath" }
}
. (Join-Path $PSScriptRoot 'Oracle.Stage2R8CleanHostCore.ps1')
$sourceAdmission = Assert-OracleStage2R8Transfer -TransferRoot $sourceTransferRoot -ExpectedManifestSha256 $ExpectedManifestSha256 -ExpectedCustodySha256 $ExpectedCustodySha256 -ExpectedVerificationSha256 $ExpectedVerificationSha256
$sourceContract = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage2RequalificationR8Contract.json') | ConvertFrom-Json
if ([string]$sourceContract.replacementMission.transferId -cne [string]$sourceAdmission.transferId -or [string]$sourceContract.replacementMission.founderGrantId -cne $FounderGrantId -or [string]$sourceAdmission.manifest.replacesTransferId -cne [string]$sourceContract.replacementMission.replacesTransferId) { throw 'R8 source contract mission binding differs.' }

$localTransferParentPath = [IO.Path]::GetFullPath($LocalTransferParent)
$localExecutionParentPath = [IO.Path]::GetFullPath($LocalExecutionParent)
$returnRootPath = [IO.Path]::GetFullPath($ReturnRoot)
foreach ($parent in @($localTransferParentPath,$localExecutionParentPath)) {
  if (-not (Test-Path -LiteralPath $parent -PathType Container)) { [IO.Directory]::CreateDirectory($parent) | Out-Null }
}
if (-not (Test-Path -LiteralPath $returnRootPath -PathType Container)) { throw 'Governed R8 return root is absent.' }
$localTransferRoot = Join-Path $localTransferParentPath ([string]$sourceAdmission.transferId)
if (Test-Path -LiteralPath $localTransferRoot) { throw 'Create-only local R8 transfer root already exists.' }
[IO.Directory]::CreateDirectory($localTransferRoot) | Out-Null
$sourcePrefix = $sourceTransferRoot.TrimEnd('\')
foreach ($directory in Get-ChildItem -LiteralPath $sourceTransferRoot -Recurse -Directory -Force | Sort-Object FullName) {
  if (($directory.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'R8 source transfer contains a reparse directory.' }
  $relative = $directory.FullName.Substring($sourcePrefix.Length).TrimStart('\')
  [IO.Directory]::CreateDirectory((Join-Path $localTransferRoot $relative)) | Out-Null
}
foreach ($file in Get-ChildItem -LiteralPath $sourceTransferRoot -Recurse -File -Force | Sort-Object FullName) {
  if (($file.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'R8 source transfer contains a reparse file.' }
  $relative = $file.FullName.Substring($sourcePrefix.Length).TrimStart('\')
  [IO.File]::Copy($file.FullName,(Join-Path $localTransferRoot $relative),$false)
}
$localAdmission = Assert-OracleStage2R8Transfer -TransferRoot $localTransferRoot -ExpectedManifestSha256 $ExpectedManifestSha256 -ExpectedCustodySha256 $ExpectedCustodySha256 -ExpectedVerificationSha256 $ExpectedVerificationSha256
if ([string]$localAdmission.transferId -cne [string]$sourceAdmission.transferId) { throw 'Local R8 transfer admission differs.' }
$qualificationPath = Join-Path $localTransferRoot 'payload\harness\Invoke-OracleStage2R8Qualification.ps1'
& $qualificationPath -TransferRoot $localTransferRoot -ExpectedManifestSha256 $ExpectedManifestSha256 -ExpectedCustodySha256 $ExpectedCustodySha256 -ExpectedVerificationSha256 $ExpectedVerificationSha256 -FounderGrantId $FounderGrantId -LocalExecutionParent $localExecutionParentPath -ReturnRoot $returnRootPath
