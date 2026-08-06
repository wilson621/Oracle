[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptRoot "Oracle.Stage3R13CertificateTrustPolicy.ps1")

$contract = Get-Content -LiteralPath (
  Join-Path $scriptRoot "Oracle.Stage3R13Contract.json"
) -Raw | ConvertFrom-Json
Assert-OracleStage3R13CertificateTrustContract -Contract $contract
$invalidContract = $contract | ConvertTo-Json -Depth 20 | ConvertFrom-Json
$invalidContract.temporaryTrust.physicalLocation = "CurrentUser"
$contractMismatchRejected = $false
try {
  Assert-OracleStage3R13CertificateTrustContract -Contract $invalidContract
} catch {
  $contractMismatchRejected = $true
}
if (-not $contractMismatchRejected) {
  throw "A changed temporary-trust contract was not rejected."
}

$thumbprint = "A01F08EB5A07308FEAB3812692516C667D50EA56"
$subject = "CN=Oracle Stage 2 Requalification R8 Local Test Signing - NOT PRODUCTION"
$raw = [byte[]]@(1, 2, 3, 4)
$rawBase64 = [Convert]::ToBase64String($raw)
function New-FixtureCertificate([bool]$PrivateKey = $false) {
  [pscustomobject][ordered]@{
    Thumbprint = $thumbprint
    Subject = $subject
    RawData = $raw
    HasPrivateKey = $PrivateKey
  }
}
function New-FixtureMatch([string]$Location, [string]$Store) {
  [pscustomobject][ordered]@{
    Location = $Location
    Store = $Store
    Certificate = New-FixtureCertificate
  }
}
function Assert-Rejected([scriptblock]$Action, [string]$Name) {
  $rejected = $false
  try { & $Action } catch { $rejected = $true }
  if (-not $rejected) { throw "Fixture was not rejected: $Name" }
}

$pathWithSpaces = "C:\Stage 3 R13\attempt certificate.cer"
$importArguments = @(Get-OracleStage3R13TrustImportArguments $pathWithSpaces)
if (
  $importArguments.Count -ne 3 -or
  $importArguments[0] -cne "-addstore" -or
  $importArguments[1] -cne "TrustedPeople" -or
  $importArguments[2] -cne [IO.Path]::GetFullPath($pathWithSpaces) -or
  $importArguments -contains "-user" -or $importArguments -contains "-f"
) { throw "Machine trust import arguments are not exact." }
$removalArguments = @(Get-OracleStage3R13TrustRemovalArguments $thumbprint)
if (
  $removalArguments.Count -ne 3 -or
  $removalArguments[0] -cne "-delstore" -or
  $removalArguments[1] -cne "TrustedPeople" -or
  $removalArguments[2] -cne $thumbprint -or
  $removalArguments -contains "-user" -or $removalArguments -contains "-f"
) { throw "Machine trust removal arguments are not exact." }

Assert-OracleStage3R13NoCertificateResidue @() @()
Assert-Rejected {
  Assert-OracleStage3R13NoCertificateResidue @(
    New-FixtureMatch "CurrentUser" "Root"
  ) @()
} "pre-existing physical certificate"
Assert-Rejected {
  Assert-OracleStage3R13NoCertificateResidue @() @(
    New-FixtureMatch "CurrentUser" "TrustedPeople"
  )
} "pre-existing logical certificate"

$physical = @(New-FixtureMatch "LocalMachine" "TrustedPeople")
$logical = @(
  New-FixtureMatch "LocalMachine" "TrustedPeople"
  New-FixtureMatch "CurrentUser" "TrustedPeople"
)
Assert-OracleStage3R13TemporaryTrustState `
  -PhysicalMatches $physical -LogicalViews $logical `
  -Thumbprint $thumbprint -Subject $subject -RawBase64 $rawBase64
Assert-OracleStage3R13ExactRemovalTarget `
  -PhysicalMatches $physical -LogicalViews @() `
  -Thumbprint $thumbprint -Subject $subject -RawBase64 $rawBase64

Assert-Rejected {
  Assert-OracleStage3R13TemporaryTrustState `
    -PhysicalMatches @(New-FixtureMatch "CurrentUser" "Root") `
    -LogicalViews @(New-FixtureMatch "CurrentUser" "Root") `
    -Thumbprint $thumbprint -Subject $subject -RawBase64 $rawBase64
} "CurrentUser Root"
Assert-Rejected {
  Assert-OracleStage3R13TemporaryTrustState `
    -PhysicalMatches @($physical[0], $physical[0]) -LogicalViews $logical `
    -Thumbprint $thumbprint -Subject $subject -RawBase64 $rawBase64
} "duplicate physical trust"
Assert-Rejected {
  $private = New-FixtureMatch "LocalMachine" "TrustedPeople"
  $private.Certificate = New-FixtureCertificate $true
  Assert-OracleStage3R13TemporaryTrustState `
    -PhysicalMatches @($private) -LogicalViews $logical `
    -Thumbprint $thumbprint -Subject $subject -RawBase64 $rawBase64
} "private key"
Assert-Rejected {
  Assert-OracleStage3R13TemporaryTrustState `
    -PhysicalMatches $physical -LogicalViews $logical `
    -Thumbprint $thumbprint -Subject $subject -RawBase64 "AA=="
} "raw bytes"
Assert-Rejected {
  Assert-OracleStage3R13TemporaryTrustState `
    -PhysicalMatches $physical -LogicalViews $logical `
    -Thumbprint $thumbprint -Subject "CN=Wrong" -RawBase64 $rawBase64
} "subject"

[pscustomobject][ordered]@{
  result = "passed"
  realCertificateStoreMutation = $false
  importStore = "LocalMachine\TrustedPeople"
  removalStore = "LocalMachine\TrustedPeople"
  exactThumbprintOnly = $true
  inheritedLogicalProjectionAccepted = $true
  partialImportCleanupTargetAccepted = $true
  unexpectedPhysicalOrLogicalTrustRejected = $true
  contractMismatchRejected = $contractMismatchRejected
} | ConvertTo-Json -Depth 10
