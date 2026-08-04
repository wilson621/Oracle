Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$contract = Get-Content -Raw -LiteralPath (Join-Path $root "Oracle.Stage5R2CleanHostContract.json") | ConvertFrom-Json

if ([string]$contract.status -cne "engineering-preparation-qualification-barred") { throw "Preparation is not qualification-barred." }
foreach ($name in @("transferCreationPermitted", "authorityCreationPermitted", "qualificationAttemptPermitted", "qualificationExecutionPermitted")) {
  if ([bool]$contract.authorityBoundary.$name) { throw "Forbidden authority flag enabled: $name" }
}
if ([int]$contract.authorityBoundary.maximumTransfers -ne 0 -or [int]$contract.authorityBoundary.maximumAuthorities -ne 0 -or [int]$contract.authorityBoundary.maximumAttempts -ne 0) {
  throw "Preparation count boundary is not zero."
}
if ([bool]$contract.claimPartition.fixtureEquivalenceClaimed -or [bool]$contract.claimPartition.fixtureSecurityQualificationClaimed) {
  throw "Fixture claim boundary is weakened."
}
$requiredAbsent = @([string[]]$contract.host.requiredAbsentDevelopmentTools)
foreach ($name in @("git", "node", "npm", "supabase", "docker")) {
  if ($requiredAbsent -cnotcontains $name) { throw "Clean-host absence contract omits $name." }
}
if ([bool]$contract.host.repositoryPermitted -or [bool]$contract.host.developmentToolInstallationPermitted) {
  throw "Clean-host repository/tool boundary is weakened."
}
if (@($contract.historicalTransfers).Count -ne 2 -or @($contract.historicalTransfers | Where-Object { $_.disposition -cne "immutable-pre-authority-engineering-failure-prohibited" }).Count -ne 0) {
  throw "Historical failed-transfer boundary differs."
}
if ([string]$contract.package.sha256 -cne "492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430") {
  throw "Accepted R6 package binding differs."
}
[ordered]@{ result = "passed"; qualificationEvidence = $false; transferCreated = $false; authorityCreated = $false; attemptCreated = $false } | ConvertTo-Json
