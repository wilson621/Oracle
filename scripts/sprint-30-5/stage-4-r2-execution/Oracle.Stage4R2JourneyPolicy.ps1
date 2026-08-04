Set-StrictMode -Version Latest

function Get-OracleStage4R2OptionalMember([object]$Object,[string]$Name) {
  if($null -eq $Object){ return $null }
  $property=$Object.PSObject.Properties[$Name]
  if($null -eq $property){ return $null }
  $property.Value
}
function Get-OracleStage4R2MandatoryMember([object]$Object,[string]$Name,[string]$Context) {
  $property=if($null -eq $Object){$null}else{$Object.PSObject.Properties[$Name]}
  if($null -eq $property){ throw "$Context missing mandatory member: $Name" }
  $property.Value
}
function Get-OracleStage4R2RequiredJourneys {
  $contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot "Oracle.Stage4R2Contract.json") | ConvertFrom-Json
  @($contract.requiredJourneys)
}
function Assert-OracleStage4R2JourneyRecord([object]$Record,[switch]$DevelopmentRehearsal) {
  if($null -eq $Record){ throw "Journey record is absent." }
  foreach($name in @("contract","result","classification","provider","journeys","rendering","isolation","secretsRetained")){[void](Get-OracleStage4R2MandatoryMember $Record $name "Journey record")}
  $expectedContract=if($DevelopmentRehearsal){"oracle.sprint-30-5.stage-4-r2-development-rehearsal"}else{"oracle.sprint-30-5.stage-4-r2-journey"}
  if([string]$Record.contract -cne $expectedContract){throw "Journey contract mismatch."}
  if([string]$Record.result -cne "passed"){throw "Journey did not pass."}
  if($DevelopmentRehearsal){
    $expectedClassification=@("NON-QUALIFICATION","NON-AUTHORITY","NON-EVIDENCE","DEVELOPMENT REHEARSAL")
    if((@($Record.classification) -join "|") -cne ($expectedClassification -join "|")){throw "Development rehearsal classification mismatch."}
  } elseif([string]$Record.classification -cne "GOVERNED-STAGE-4-R2-QUALIFICATION"){throw "Journey classification mismatch."}
  if([bool]$Record.secretsRetained){throw "Journey evidence retains secrets."}
  $provider=$Record.provider
  foreach($name in @("classification","productionEndpoint","externalEmail")){[void](Get-OracleStage4R2MandatoryMember $provider $name "Provider record")}
  if([bool]$provider.productionEndpoint -or [bool]$provider.externalEmail -or [string]$provider.classification -cne "disposable-local-non-production"){throw "Provider boundary failed."}
  $journeys=@($Record.journeys);$expected=@(Get-OracleStage4R2RequiredJourneys)
  if($journeys.Count -ne $expected.Count){throw "Journey inventory count mismatch."}
  foreach($journey in $journeys){foreach($name in @("id","result")){[void](Get-OracleStage4R2MandatoryMember $journey $name "Journey result")}}
  foreach($id in $expected){$matches=@($journeys|Where-Object{[string]$_.id -ceq $id});if($matches.Count -ne 1 -or [string]$matches[0].result -cne "passed"){throw "Required journey missing, duplicated or failed: $id"}}
  $unexpected=@($journeys|Where-Object{[string]$_.id -cnotin $expected});if($unexpected.Count -ne 0){throw "Unexpected journey result: $([string]$unexpected[0].id)"}
  $isolation=$Record.isolation;$rendering=$Record.rendering
  foreach($name in @("accountCount","crossAccountLeaks","distinctAuthenticatedPrincipals","distinctOperators","rlsBindingsPerPrincipal")){[void](Get-OracleStage4R2MandatoryMember $isolation $name "Isolation record")}
  foreach($name in @("protectedStatus","mainLandmarks","levelOneHeadings","method")){[void](Get-OracleStage4R2MandatoryMember $rendering $name "Rendering record")}
  if([int]$isolation.accountCount -ne 2 -or [int]$isolation.crossAccountLeaks -ne 0 -or -not[bool]$isolation.distinctAuthenticatedPrincipals -or -not[bool]$isolation.distinctOperators){throw "Two-account isolation was not proven."}
  $bindings=@($isolation.rlsBindingsPerPrincipal);if($bindings.Count -ne 2 -or @($bindings|Where-Object{[int]$_ -ne 1}).Count -ne 0){throw "Per-principal RLS binding cardinality failed."}
  if([int]$rendering.protectedStatus -ne 200 -or [int]$rendering.mainLandmarks -lt 1 -or [int]$rendering.levelOneHeadings -lt 1 -or [string]$rendering.method -cne "authenticated-production-server-render"){throw "Protected rendering was not proven."}
  $Record
}
function Assert-OracleStage4R2SecretFreeText([string]$Text,[string[]]$KnownSecrets) {
  foreach($secret in $KnownSecrets){if(-not[string]::IsNullOrEmpty($secret) -and $Text.Contains($secret)){throw "Known secret appears in evidence."}}
  if($Text -match 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'){throw "JWT-like value appears in evidence."}
  if($Text -match '(?i)(service_role|refresh_token|access_token)\s*[=:]\s*[^\s"\}]+' ){throw "Credential-like field appears in evidence."}
}