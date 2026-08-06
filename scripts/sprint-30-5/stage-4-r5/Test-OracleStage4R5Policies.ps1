[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$contract = Get-Content -Raw -LiteralPath (Join-Path $root "Oracle.Stage4R5Contract.json") | ConvertFrom-Json
. (Join-Path $root "Oracle.Stage4R5LifecyclePolicy.ps1")
. (Join-Path $root "Oracle.Stage4R5NetworkPolicy.ps1")
. (Join-Path $root "Oracle.Stage4R5JourneyPolicy.ps1")
. (Join-Path $root "Oracle.Stage4R5ProviderHostPolicy.ps1")

function Assert-Rejected {
  param([Parameter(Mandatory = $true)][scriptblock]$Action, [Parameter(Mandatory = $true)][string]$Name)
  try { & $Action; throw "Hostile fixture was accepted: $Name" }
  catch { if ($_.Exception.Message -ceq "Hostile fixture was accepted: $Name") { throw } }
}

if (@($contract.requiredJourneys).Count -ne 10 -or @($contract.requiredLifecycle).Count -ne 20) { throw "R4 acceptance inventory was not retained." }
if ([bool]$contract.authorityBoundary.providerStateCreationPermitted -or [bool]$contract.authorityBoundary.transferCreationPermitted -or [bool]$contract.authorityBoundary.authorityCreationPermitted -or [bool]$contract.authorityBoundary.qualificationAttemptPermitted -or [bool]$contract.authorityBoundary.qualificationExecutionPermitted) { throw "Engineering preparation permits governed execution state." }
if (-not [bool]$contract.claimPreservation.realSupabaseProviderRequired -or [bool]$contract.claimPreservation.providerFixtureEquivalencePermitted -or [bool]$contract.claimPreservation.mainPcQualificationExceptionPermitted) { throw "Stage 4 claims were weakened." }

$state = New-OracleStage4R5LifecycleState
foreach ($phase in @($contract.requiredLifecycle)) { [void](Move-OracleStage4R5Lifecycle -State $state -Phase $phase) }
if (-not $state.terminal -or @($state.completed).Count -ne 20) { throw "R5 lifecycle did not terminate exactly." }
Assert-Rejected { $bad = New-OracleStage4R5LifecycleState; [void](Move-OracleStage4R5Lifecycle -State $bad -Phase "baseline-verified") } "out-of-order-lifecycle"
$obligations = Get-OracleStage4R5TeardownObligations -CompletedPhases @("authority-consumed", "baseline-verified", "zero-state-verified", "provider-admitted", "trust-established", "package-installed", "runtime-configuration-created", "package-activated", "account-created-unverified")
if (-not $obligations.removeQualificationHostRelays -or -not $obligations.removeDisposableProvider -or -not $obligations.verifyBothHostsZeroResidue -or -not $obligations.retryProhibited) { throw "Cross-host teardown obligations are incomplete." }

$noDefault = @([pscustomobject]@{ destinationPrefix = "192.168.70.0/24"; state = "active" })
[void](Assert-OracleStage4R5NoDefaultRoutes -Routes $noDefault -HostRole "qualification-host")
Assert-Rejected { Assert-OracleStage4R5NoDefaultRoutes -Routes @([pscustomobject]@{ destinationPrefix = "0.0.0.0/0"; state = "active" }) -HostRole "qualification-host" } "ipv4-default-route"
Assert-Rejected { Assert-OracleStage4R5NoDefaultRoutes -Routes @([pscustomobject]@{ destinationPrefix = "::/0"; state = "active" }) -HostRole "provider-host" } "ipv6-default-route"
[void](Assert-OracleStage4R5PrivateLink -ProviderAddress "192.168.70.1" -QualificationAddress "192.168.70.2" -PrefixLength 30)
Assert-Rejected { Assert-OracleStage4R5PrivateLink -ProviderAddress "8.8.8.8" -QualificationAddress "192.168.70.2" -PrefixLength 30 } "public-provider-address"
Assert-Rejected { Assert-OracleStage4R5PrivateLink -ProviderAddress "192.168.70.1" -QualificationAddress "192.168.70.1" -PrefixLength 30 } "same-host-address"
Assert-Rejected { Assert-OracleStage4R5PrivateLink -ProviderAddress "192.168.70.1" -QualificationAddress "192.168.70.2" -PrefixLength 16 } "invalid-private-prefix"
Assert-Rejected { Assert-OracleStage4R5PrivateLink -ProviderAddress "192.168.70.1" -QualificationAddress "192.168.71.2" -PrefixLength 24 } "different-private-network"
$relays = @(
  [pscustomobject]@{ listenAddress = "127.0.0.1"; listenPort = 54321; connectAddress = "192.168.70.1"; connectPort = 54321 },
  [pscustomobject]@{ listenAddress = "127.0.0.1"; listenPort = 54324; connectAddress = "192.168.70.1"; connectPort = 54324 }
)
[void](Assert-OracleStage4R5RelayPlan -Relays $relays -ProviderAddress "192.168.70.1")
Assert-Rejected { Assert-OracleStage4R5RelayPlan -Relays @($relays[0]) -ProviderAddress "192.168.70.1" } "missing-mail-relay"
Assert-Rejected { $bad = @($relays | ForEach-Object { $_ | Select-Object * }); $bad[1].connectPort = 54321; Assert-OracleStage4R5RelayPlan -Relays $bad -ProviderAddress "192.168.70.1" } "misdirected-relay"

$hostRecord = [pscustomobject]@{ computerName = "FOUNDER-QA-01"; model = "MEDION ERAZER P6605 MD61596"; repositoryPresent = $false; developmentToolsPresent = @() }
[void](Assert-OracleStage4R5CleanHostShape -Record $hostRecord -Contract $contract)
Assert-Rejected { $bad = $hostRecord | Select-Object *; $bad.repositoryPresent = $true; Assert-OracleStage4R5CleanHostShape -Record $bad -Contract $contract } "clean-host-repository"
Assert-Rejected { $bad = $hostRecord | Select-Object *; $bad.developmentToolsPresent = @("node"); Assert-OracleStage4R5CleanHostShape -Record $bad -Contract $contract } "clean-host-tool"

$journeys = @($contract.requiredJourneys | ForEach-Object { [pscustomobject]@{ id = [string]$_; result = "passed" } })
$journeyRecord = [pscustomobject][ordered]@{
  contract = "oracle.sprint-30-5.stage-4-r5-development-rehearsal"
  result = "passed"
  classification = @("NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "DEVELOPMENT REHEARSAL")
  provider = [pscustomobject]@{ classification = "disposable-local-non-production"; implementation = "accepted-r4-supabase-stack-on-engineering-provider-host"; productionEndpoint = $false; externalEmail = $false; splitHost = $true }
  journeys = $journeys
  rendering = [pscustomobject]@{ protectedStatus = 200; mainLandmarks = 1; levelOneHeadings = 1; method = "authenticated-installed-package-server-render" }
  isolation = [pscustomobject]@{ accountCount = 2; crossAccountLeaks = 0; distinctAuthenticatedPrincipals = $true; distinctOperators = $true; rlsBindingsPerPrincipal = @(1, 1) }
  secretsRetained = $false
}
[void](Assert-OracleStage4R5JourneyRecord -Record $journeyRecord -DevelopmentRehearsal)
foreach ($mutation in @("missing", "duplicate", "failed")) {
  Assert-Rejected {
    $bad = $journeyRecord | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    if ($mutation -ceq "missing") { $bad.journeys = @($bad.journeys | Select-Object -Skip 1) }
    elseif ($mutation -ceq "duplicate") { $bad.journeys = @($bad.journeys) + @($bad.journeys[0]) }
    else { $bad.journeys[0].result = "failed" }
    Assert-OracleStage4R5JourneyRecord -Record $bad -DevelopmentRehearsal
  } "journey-$mutation"
}
Assert-Rejected { $bad = $journeyRecord | ConvertTo-Json -Depth 10 | ConvertFrom-Json; $bad.provider.implementation = "fixture"; Assert-OracleStage4R5JourneyRecord -Record $bad -DevelopmentRehearsal } "provider-fixture-substitution"
Assert-Rejected { $bad = $journeyRecord | ConvertTo-Json -Depth 10 | ConvertFrom-Json; $bad.isolation.crossAccountLeaks = 1; Assert-OracleStage4R5JourneyRecord -Record $bad -DevelopmentRehearsal } "cross-account-leak"
Assert-Rejected { Assert-OracleStage4R5SecretFreeText -Text '{"access_token":"secret"}' } "credential-field"
Assert-Rejected { Assert-OracleStage4R5SecretFreeText -Text 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature' } "jwt"

$providerRecord = [pscustomobject][ordered]@{
  contract = "oracle.sprint-30-5.stage-4-r5-provider-admission"
  result = "passed"
  providerHost = "DESKTOP-M3H22E4"
  providerIdentity = "provider-stage4-r5-20260806T180000000Z-a1b2c3d4"
  network = [pscustomobject]@{ activeDefaultRoutes = 0; privateOnLinkOnly = $true; internetReachable = $false; postgresPublished = $false; publishedPorts = @(54321, 54324) }
  provider = [pscustomobject]@{ classification = "disposable-local-non-production"; implementation = "accepted-r4-supabase-stack-on-engineering-provider-host"; productionEndpoint = $false; externalEmail = $false }
  images = @($contract.provider.services.PSObject.Properties | ForEach-Object { [pscustomobject]@{ image = [string]$_.Value.image; digest = [string]$_.Value.digest } })
  migrations = @($contract.provider.requiredMigrations)
  secretValuesRecorded = $false
}
[void](Assert-OracleStage4R5ProviderAdmission -Record $providerRecord -Contract $contract)
Assert-Rejected { $bad = $providerRecord | ConvertTo-Json -Depth 10 | ConvertFrom-Json; $bad.network.publishedPorts = @(54321, 54322, 54324); Assert-OracleStage4R5ProviderAdmission -Record $bad -Contract $contract } "postgres-publication"
Assert-Rejected { $bad = $providerRecord | ConvertTo-Json -Depth 10 | ConvertFrom-Json; $bad.images[0].digest = "sha256:00"; Assert-OracleStage4R5ProviderAdmission -Record $bad -Contract $contract } "image-digest"
Assert-Rejected { Assert-OracleStage4R5ProviderPublicRecordSecretFree -Text '{"serviceKey":"secret"}' } "provider-secret-field"

[pscustomobject][ordered]@{
  result = "passed"
  classification = @("NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "ENGINEERING POLICY TEST")
  requiredJourneys = 10
  requiredLifecyclePhases = 20
  providerStateCreated = $false
  relayStateCreated = $false
  transferCreated = $false
  authorityCreated = $false
  attemptCreated = $false
} | ConvertTo-Json -Depth 5
