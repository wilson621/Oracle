[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$ExpectedTransferManifestSha256,
  [Parameter(Mandatory = $true)][string]$ExpectedTransferCustodySha256,
  [Parameter(Mandatory = $true)][string]$ExpectedHarnessCommit,
  [Parameter(Mandatory = $true)][string]$HostContinuityPath,
  [Parameter(Mandatory = $true)][string]$ExpectedHostContinuitySha256,
  [Parameter(Mandatory = $true)][string]$TransferRoot,
  [Parameter(Mandatory = $true)][string]$EvidenceReturnRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$scriptPath = $MyInvocation.MyCommand.Path
$scriptRoot = Split-Path -Parent $scriptPath

function Get-Sha256([string]$Path) {
  (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

$manifestPath = Join-Path $TransferRoot "Oracle.Stage3R9TransferManifest.json"
$custodyPath = Join-Path $TransferRoot "Oracle.Stage3R9TransferCustody.json"
$manifestSidecarPath = "$manifestPath.sha256.txt"
$custodySidecarPath = "$custodyPath.sha256.txt"
if (
  -not (Test-Path -LiteralPath $manifestPath -PathType Leaf) -or
  -not (Test-Path -LiteralPath $custodyPath -PathType Leaf) -or
  -not (Test-Path -LiteralPath $manifestSidecarPath -PathType Leaf) -or
  -not (Test-Path -LiteralPath $custodySidecarPath -PathType Leaf) -or
  $ExpectedTransferManifestSha256 -cnotmatch '^[0-9a-f]{64}$' -or
  $ExpectedTransferCustodySha256 -cnotmatch '^[0-9a-f]{64}$' -or
  $ExpectedHarnessCommit -cnotmatch '^[0-9a-f]{40}$' -or
  (Get-Sha256 $manifestPath) -cne $ExpectedTransferManifestSha256 -or
  (Get-Sha256 $custodyPath) -cne $ExpectedTransferCustodySha256
) { throw "Pre-authority transfer manifest or custody binding differs." }
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$custody = Get-Content -LiteralPath $custodyPath -Raw | ConvertFrom-Json
$manifestSidecarHash = (
  Get-Content -LiteralPath $manifestSidecarPath -Raw
).Trim().Split(" ")[0].ToLowerInvariant()
$custodySidecarHash = (
  Get-Content -LiteralPath $custodySidecarPath -Raw
).Trim().Split(" ")[0].ToLowerInvariant()
if (
  $manifestSidecarHash -cne $ExpectedTransferManifestSha256 -or
  $custodySidecarHash -cne $ExpectedTransferCustodySha256 -or
  [string]$manifest.contract -cne
    "oracle.sprint-30-5.stage-3-r9-transfer" -or
  [string]$manifest.programmeIdentity -cne
    "Sprint 30.5 Stage 3 Qualification R9" -or
  [string]$manifest.revision -cne "R9" -or
  [string]$manifest.preparation.harnessCommit -cne $ExpectedHarnessCommit -or
  [string]$manifest.preparation.harnessTree -cnotmatch '^[0-9a-f]{40}$' -or
  [string]$custody.contract -cne
    "oracle.sprint-30-5.stage-3-r9-transfer-custody" -or
  [string]$custody.transferId -cne [string]$manifest.transferId -or
  [string]$custody.manifest.sha256 -cne $ExpectedTransferManifestSha256
) { throw "Pre-authority transfer identity differs." }
$expectedTransferRootEntries = @(
  "Oracle.Stage3R9TransferCustody.json",
  "Oracle.Stage3R9TransferCustody.json.sha256.txt",
  "Oracle.Stage3R9TransferManifest.json",
  "Oracle.Stage3R9TransferManifest.json.sha256.txt",
  "payload"
) | Sort-Object
$actualTransferRootEntries = @(
  Get-ChildItem -LiteralPath $TransferRoot -Force |
    ForEach-Object { $_.Name } |
    Sort-Object
)
if (
  $actualTransferRootEntries.Count -ne $expectedTransferRootEntries.Count -or
  @(Compare-Object -ReferenceObject $expectedTransferRootEntries `
    -DifferenceObject $actualTransferRootEntries -CaseSensitive).Count -ne 0
) { throw "Pre-authority transfer root contains missing or unexpected entries." }
$payloadEntries = @($manifest.payload)
$payloadPaths = @($payloadEntries | ForEach-Object { [string]$_.path })
if (
  $payloadEntries.Count -eq 0 -or
  @($payloadPaths | Select-Object -Unique).Count -ne $payloadEntries.Count
) { throw "Pre-authority transfer payload inventory is empty or duplicated." }
foreach ($entry in $payloadEntries) {
  $path = Join-Path $TransferRoot ([string]$entry.path)
  if (
    [string]$entry.path -cnotmatch '^payload/[^/\\]+$' -or
    [string]$entry.sha256 -cnotmatch '^[0-9a-f]{64}$' -or
    [int64]$entry.size -lt 0 -or
    -not (Test-Path -LiteralPath $path -PathType Leaf) -or
    (Get-Sha256 $path) -cne [string]$entry.sha256 -or
    (Get-Item -LiteralPath $path).Length -ne [int64]$entry.size
  ) { throw "Pre-authority transfer payload differs: $($entry.path)" }
}
$actualPayloadPaths = @(
  Get-ChildItem -LiteralPath (Join-Path $TransferRoot "payload") -File -Force |
    ForEach-Object { "payload/$($_.Name)" } |
    Sort-Object
)
if (
  $actualPayloadPaths.Count -ne $payloadPaths.Count -or
  @(Compare-Object -ReferenceObject @($payloadPaths | Sort-Object) `
    -DifferenceObject $actualPayloadPaths -CaseSensitive).Count -ne 0
) { throw "Pre-authority transfer payload contains missing or unexpected files." }

$runningScriptRelativePath = "payload/Invoke-OracleStage3R9PreAuthorityPreflight.ps1"
$runningScriptEntry = @($payloadEntries | Where-Object {
  [string]$_.path -ceq $runningScriptRelativePath
})
$contractRelativePath = "payload/Oracle.Stage3R9Contract.json"
$contractEntry = @($payloadEntries | Where-Object {
  [string]$_.path -ceq $contractRelativePath
})
if (
  $runningScriptEntry.Count -ne 1 -or $contractEntry.Count -ne 1 -or
  -not [StringComparer]::OrdinalIgnoreCase.Equals(
    [IO.Path]::GetFullPath($scriptPath),
    [IO.Path]::GetFullPath((Join-Path $TransferRoot $runningScriptRelativePath))
  ) -or
  (Get-Sha256 $scriptPath) -cne [string]$runningScriptEntry[0].sha256
) { throw "Pre-authority probe is not the exact transfer-bound script." }
$contractPath = Join-Path $TransferRoot $contractRelativePath
if ((Get-Sha256 $contractPath) -cne [string]$contractEntry[0].sha256) {
  throw "Pre-authority contract bytes differ from the transfer manifest."
}
$contract = Get-Content -LiteralPath $contractPath -Raw | ConvertFrom-Json
if (
  [string]$manifest.acceptedStage2.msixSha256 -cne
    [string]$contract.stage2.msixSha256 -or
  [string]$manifest.acceptedStage2.candidateCommit -cne
    [string]$contract.stage2.candidateCommit -or
  [string]$manifest.acceptedStage2.candidateTree -cne
    [string]$contract.stage2.candidateTree
) { throw "Pre-authority accepted Stage 2 R2 binding differs." }

. (Join-Path $scriptRoot "Oracle.Stage3R9IdentityPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R9ActivationPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R9CertificateTrustPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R9InstalledSoftwarePolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R9WindowPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R9WindowsExecutablePolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R9PreflightPolicy.ps1")
Assert-OracleStage3R9ApplicationActivationContract -Contract $contract
Assert-OracleStage3R9CertificateTrustContract -Contract $contract
Initialize-OracleStage3R9AppModelProcessIdentity

$getCertificateMatches = {
  @(
    @(Get-OracleStage3R9PhysicalCertificateMatches `
      -Thumbprint $contract.stage2.certificateThumbprint)
    @(Get-OracleStage3R9LogicalCertificateViews `
      -Thumbprint $contract.stage2.certificateThumbprint)
  )
}

$result = Get-OracleStage3R9PreAuthorityObservation `
  -Contract $contract `
  -TransferRoot $TransferRoot `
  -EvidenceReturnRoot $EvidenceReturnRoot `
  -HostContinuityPath $HostContinuityPath `
  -ExpectedHostContinuitySha256 $ExpectedHostContinuitySha256 `
  -GetSha256 ${function:Get-Sha256} `
  -GetCertificateMatches $getCertificateMatches
$result | ConvertTo-Json -Depth 30
