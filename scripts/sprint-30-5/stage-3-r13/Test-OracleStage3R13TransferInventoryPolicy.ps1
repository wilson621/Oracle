[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage3R13TransferInventoryPolicy.ps1")

$root = Join-Path $env:TEMP (
  "oracle-stage3-r13-transfer-inventory-" + [Guid]::NewGuid().ToString("N")
)
$payloadRoot = Join-Path $root "payload"

function Get-FixtureSha256([string]$Path) {
  (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function New-FixtureEntry([string]$Name) {
  $path = Join-Path $payloadRoot $Name
  [pscustomobject]@{
    path = "payload/$Name"
    size = (Get-Item -LiteralPath $path).Length
    sha256 = Get-FixtureSha256 $path
  }
}

try {
  [IO.Directory]::CreateDirectory($payloadRoot) | Out-Null
  [IO.File]::WriteAllText(
    (Join-Path $payloadRoot "required.ps1"),
    "required",
    [Text.UTF8Encoding]::new($false)
  )
  [IO.File]::WriteAllText(
    (Join-Path $payloadRoot "governed-additional.md"),
    "governed additional record",
    [Text.UTF8Encoding]::new($false)
  )
  $contract = [pscustomobject]@{
    transferPayload = [pscustomobject]@{
      inventoryAuthority = "founder-bound-transfer-manifest"
      actualDirectoryMustMatchManifest = $true
      requiredSubsetMustBePresent = $true
      requiredFileNames = @("required.ps1")
    }
  }
  $manifest = [pscustomobject]@{
    payload = @(
      New-FixtureEntry "required.ps1"
      New-FixtureEntry "governed-additional.md"
    )
  }
  $getSha256 = { param([string]$Path) Get-FixtureSha256 $Path }
  $passing = Assert-OracleStage3R13TransferPayloadInventory `
    -Manifest $manifest `
    -Contract $contract `
    -TransferRoot $root `
    -GetSha256 $getSha256
  if (
    $passing.manifestEntryCount -ne 2 -or
    $passing.requiredEntryCount -ne 1 -or
    -not $passing.actualDirectoryMatched
  ) { throw "Manifest-authoritative inventory fixture did not pass exactly." }

  $unmanifestedRejected = $false
  $unmanifestedPath = Join-Path $payloadRoot "unmanifested.txt"
  [IO.File]::WriteAllText($unmanifestedPath, "unexpected")
  try {
    Assert-OracleStage3R13TransferPayloadInventory `
      -Manifest $manifest -Contract $contract -TransferRoot $root `
      -GetSha256 $getSha256
  } catch {
    $unmanifestedRejected = $_.Exception.Message -match "directory differs"
  }
  [IO.File]::Delete($unmanifestedPath)

  $missingRequiredRejected = $false
  $missingRequiredContract = [pscustomobject]@{
    transferPayload = [pscustomobject]@{
      inventoryAuthority = "founder-bound-transfer-manifest"
      actualDirectoryMustMatchManifest = $true
      requiredSubsetMustBePresent = $true
      requiredFileNames = @("missing.ps1")
    }
  }
  try {
    Assert-OracleStage3R13TransferPayloadInventory `
      -Manifest $manifest -Contract $missingRequiredContract `
      -TransferRoot $root -GetSha256 $getSha256
  } catch {
    $missingRequiredRejected = $_.Exception.Message -match "required payload"
  }

  $duplicateRejected = $false
  $duplicateManifest = [pscustomobject]@{
    payload = @($manifest.payload) + @($manifest.payload[0])
  }
  try {
    Assert-OracleStage3R13TransferPayloadInventory `
      -Manifest $duplicateManifest -Contract $contract -TransferRoot $root `
      -GetSha256 $getSha256
  } catch {
    $duplicateRejected = $_.Exception.Message -match "malformed or duplicated"
  }

  $caseAliasRejected = $false
  $caseAlias = [pscustomobject]@{
    path = "payload/REQUIRED.ps1"
    size = $manifest.payload[0].size
    sha256 = $manifest.payload[0].sha256
  }
  $caseAliasManifest = [pscustomobject]@{
    payload = @($manifest.payload) + @($caseAlias)
  }
  try {
    Assert-OracleStage3R13TransferPayloadInventory `
      -Manifest $caseAliasManifest -Contract $contract -TransferRoot $root `
      -GetSha256 $getSha256
  } catch {
    $caseAliasRejected = $_.Exception.Message -match "malformed or duplicated"
  }

  $tamperRejected = $false
  $requiredPath = Join-Path $payloadRoot "required.ps1"
  [IO.File]::AppendAllText($requiredPath, "tampered")
  try {
    Assert-OracleStage3R13TransferPayloadInventory `
      -Manifest $manifest -Contract $contract -TransferRoot $root `
      -GetSha256 $getSha256
  } catch {
    $tamperRejected = $_.Exception.Message -match "payload bytes differ"
  }

  if (
    -not $unmanifestedRejected -or
    -not $missingRequiredRejected -or
    -not $duplicateRejected -or
    -not $caseAliasRejected -or
    -not $tamperRejected
  ) { throw "Transfer inventory adversarial fixture did not fail closed." }

  [pscustomobject][ordered]@{
    contract = "oracle.sprint-30-5.stage-3-r13-transfer-inventory-policy-test"
    governedAdditionalManifestEntryAccepted = $true
    unmanifestedFileRejected = $unmanifestedRejected
    missingRequiredFileRejected = $missingRequiredRejected
    duplicateManifestEntryRejected = $duplicateRejected
    caseAliasDuplicateRejected = $caseAliasRejected
    tamperedPayloadRejected = $tamperRejected
    result = "pass"
  } | ConvertTo-Json -Depth 5
} finally {
  if (Test-Path -LiteralPath $root) {
    Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue
  }
}
