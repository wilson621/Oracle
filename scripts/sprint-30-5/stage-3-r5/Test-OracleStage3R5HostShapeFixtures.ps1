[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Oracle.Stage3R5InstalledSoftwarePolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R5PreflightPolicy.ps1")

function Assert-True([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}

$fixtures = Get-Content -LiteralPath (
  Join-Path $PSScriptRoot "Oracle.Stage3R5HostShapeFixtures.json"
) -Raw | ConvertFrom-Json
if ($fixtures.classification -cne "development-fixture-not-host-evidence") {
  throw "Host-shape fixture classification is unsafe."
}

$softwareRecords = @($fixtures.installedSoftware | ForEach-Object { $_.record })
$software = @(ConvertTo-OracleStage3R5InstalledSoftwareInventory `
  -RegistryEntries $softwareRecords)
$expectedSoftwareCount = @($fixtures.installedSoftware | Where-Object {
  $_.included -eq $true
}).Count
Assert-True (
  $software.Count -eq $expectedSoftwareCount
) "Host-shape software policy result differs."

foreach ($member in @("Manufacturer", "Model")) {
  [void](Get-OracleStage3R5RequiredPropertyValue `
    $fixtures.computerSystem.normal $member "fixture computer system")
}
$missingComputerMemberRejected = $false
try {
  [void](Get-OracleStage3R5RequiredPropertyValue `
    $fixtures.computerSystem.missingMandatory "Manufacturer" "fixture computer system")
} catch { $missingComputerMemberRejected = $_.Exception.Message -match "mandatory" }
Assert-True $missingComputerMemberRejected "Missing mandatory CIM member was accepted."

$missingTpmMemberRejected = $false
try {
  [void](Get-OracleStage3R5RequiredPropertyValue `
    $fixtures.tpm.missingMandatory "TpmReady" "fixture TPM")
} catch { $missingTpmMemberRejected = $_.Exception.Message -match "mandatory" }
Assert-True $missingTpmMemberRejected "Missing mandatory TPM member was accepted."

$missingDefenderMemberRejected = $false
try {
  [void](Get-OracleStage3R5RequiredPropertyValue `
    $fixtures.defender.missingMandatory "RealTimeProtectionEnabled" "fixture Defender")
} catch { $missingDefenderMemberRejected = $_.Exception.Message -match "mandatory" }
Assert-True $missingDefenderMemberRejected "Missing mandatory Defender member was accepted."

Assert-True (
  @($fixtures.packageCardinality | Where-Object {
    $_.count -eq 0 -and $_.preflight -ceq "accepted"
  }).Count -eq 1
) "Package preflight cardinality policy differs."
Assert-True (
  @($fixtures.packageCardinality | Where-Object {
    $_.count -eq 1 -and $_.installedPhase -ceq "accepted"
  }).Count -eq 1
) "Installed package cardinality policy differs."
Assert-True (
  @($fixtures.certificateCardinality | Where-Object {
    $_.count -eq 1 -and $_.trustedPhase -ceq "accepted"
  }).Count -eq 1
) "Trusted certificate cardinality policy differs."
Assert-True (
  @($fixtures.nativeWindow.multiResult).Count -eq 2
) "Multiple native-window fixture is unavailable."

$missingContinuityMemberRejected = $false
try {
  [void](Get-OracleStage3R5RequiredPropertyValue `
    $fixtures.continuity.missingMandatory "contract" "fixture continuity")
} catch { $missingContinuityMemberRejected = $_.Exception.Message -match "mandatory" }
Assert-True $missingContinuityMemberRejected "Malformed continuity was accepted."

[ordered]@{
  result = "passed"
  classification = $fixtures.classification
  installedSoftwareCases = @($fixtures.installedSoftware).Count
  installedSoftwareIncluded = $software.Count
  missingComputerMemberRejected = $missingComputerMemberRejected
  missingTpmMemberRejected = $missingTpmMemberRejected
  missingDefenderMemberRejected = $missingDefenderMemberRejected
  missingContinuityMemberRejected = $missingContinuityMemberRejected
  packageCardinalityCases = @($fixtures.packageCardinality).Count
  certificateCardinalityCases = @($fixtures.certificateCardinality).Count
  nativeWindowMultiResultCount = @($fixtures.nativeWindow.multiResult).Count
} | ConvertTo-Json -Depth 10
