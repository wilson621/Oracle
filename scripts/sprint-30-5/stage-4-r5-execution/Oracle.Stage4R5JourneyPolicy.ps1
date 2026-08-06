Set-StrictMode -Version Latest

function Get-OracleStage4R5JourneyMandatoryMember {
  param([object]$Object, [string]$Name, [string]$Context)
  $property = if ($null -eq $Object) { $null } else { $Object.PSObject.Properties[$Name] }
  if ($null -eq $property) { throw "$Context missing mandatory member: $Name" }
  $property.Value
}

function Get-OracleStage4R5RequiredJourneys {
  $contract = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot "Oracle.Stage4R5ExecutionContract.json") | ConvertFrom-Json
  @($contract.requiredJourneys)
}

function Assert-OracleStage4R5JourneyRecord {
  param([Parameter(Mandatory = $true)]$Record, [switch]$DevelopmentRehearsal)
  foreach ($name in @("contract", "result", "classification", "provider", "journeys", "rendering", "isolation", "secretsRetained")) { [void](Get-OracleStage4R5JourneyMandatoryMember $Record $name "Journey record") }
  $expectedContract = if ($DevelopmentRehearsal) { "oracle.sprint-30-5.stage-4-r5-development-rehearsal" } else { "oracle.sprint-30-5.stage-4-r5-journey" }
  if ([string]$Record.contract -cne $expectedContract) { throw "Journey contract mismatch." }
  if ([string]$Record.result -cne "passed") { throw "Journey did not pass." }
  if ($DevelopmentRehearsal) {
    $expected = @("NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "DEVELOPMENT REHEARSAL")
    if ((@($Record.classification) -join "|") -cne ($expected -join "|")) { throw "Development rehearsal classification mismatch." }
  } elseif ([string]$Record.classification -cne "GOVERNED-STAGE-4-R5-QUALIFICATION") { throw "Journey classification mismatch." }
  if ([bool]$Record.secretsRetained) { throw "Journey evidence retains secrets." }
  foreach ($name in @("classification", "implementation", "productionEndpoint", "externalEmail", "splitHost")) { [void](Get-OracleStage4R5JourneyMandatoryMember $Record.provider $name "Provider record") }
  if (
    [string]$Record.provider.classification -cne "disposable-local-non-production" -or
    [string]$Record.provider.implementation -cne "accepted-r4-supabase-stack-on-engineering-provider-host" -or
    [bool]$Record.provider.productionEndpoint -or
    [bool]$Record.provider.externalEmail -or
    -not [bool]$Record.provider.splitHost
  ) { throw "Provider boundary failed." }
  $journeys = @($Record.journeys)
  $required = @(Get-OracleStage4R5RequiredJourneys)
  if ($journeys.Count -ne $required.Count) { throw "Journey inventory count mismatch." }
  foreach ($id in $required) {
    $matches = @($journeys | Where-Object { [string]$_.id -ceq $id })
    if ($matches.Count -ne 1 -or [string]$matches[0].result -cne "passed") { throw "Required journey missing, duplicated or failed: $id" }
  }
  if (@($journeys | Where-Object { [string]$_.id -cnotin $required }).Count -ne 0) { throw "Unexpected journey result." }
  $isolation = $Record.isolation
  if (
    [int]$isolation.accountCount -ne 2 -or
    [int]$isolation.crossAccountLeaks -ne 0 -or
    -not [bool]$isolation.distinctAuthenticatedPrincipals -or
    -not [bool]$isolation.distinctOperators -or
    @($isolation.rlsBindingsPerPrincipal).Count -ne 2 -or
    @($isolation.rlsBindingsPerPrincipal | Where-Object { [int]$_ -ne 1 }).Count -ne 0
  ) { throw "Two-principal row-level isolation was not proven." }
  if (
    [int]$Record.rendering.protectedStatus -ne 200 -or
    [int]$Record.rendering.mainLandmarks -lt 1 -or
    [int]$Record.rendering.levelOneHeadings -lt 1 -or
    [string]$Record.rendering.method -cne "authenticated-installed-package-server-render"
  ) { throw "Protected installed rendering was not proven." }
  $Record
}

function Assert-OracleStage4R5SecretFreeText {
  param([Parameter(Mandatory = $true)][string]$Text, [string[]]$KnownSecrets = @())
  foreach ($secret in $KnownSecrets) { if (-not [string]::IsNullOrEmpty($secret) -and $Text.Contains($secret)) { throw "Known secret appears in evidence." } }
  if ($Text -match 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+') { throw "JWT-like value appears in evidence." }
  if ($Text -match '(?i)"?(service_role|refresh_token|access_token)"?\s*[=:]\s*"?[A-Za-z0-9_\-]+' ) { throw "Credential-like field appears in evidence." }
}
