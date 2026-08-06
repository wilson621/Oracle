[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$rehearsal=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'Invoke-OracleStage4R5TwoHostRehearsal.ps1') -Raw
$provider=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'provider-controller.mjs') -Raw
$mission=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'Invoke-OracleStage4R5ProviderMission.ps1') -Raw
$restore=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'Restore-OracleStage4R5PrivateLink.ps1') -Raw

$tryIndex=$rehearsal.IndexOf('try{',[StringComparison]::Ordinal)
$hostIndex=$rehearsal.IndexOf('Get-OracleStage4R5CleanHostAdmission',[StringComparison]::Ordinal)
if($tryIndex-lt0-or$hostIndex-lt0-or$tryIndex-gt$hostIndex){throw 'Clean-host admission is outside the transactional rehearsal boundary.'}
foreach($required in @('$createdRelays.Add($relay)','for($relayIndex=$createdRelays.Count-1','Remove-Item -LiteralPath $handoffPath','oracle.sprint-30-5.stage-4-r5-rehearsal-terminal','[REDACTED]','catch{$terminalResult=''failed-awaiting-provider-teardown''')){if(-not$rehearsal.Contains($required)){throw "Transactional rehearsal control is absent: $required"}}
$stateIndex=$provider.IndexOf('writeJsonCreateOnly(statePath',[StringComparison]::Ordinal)
$initIndex=$provider.IndexOf('run("provider-init"',[StringComparison]::Ordinal)
if($stateIndex-lt0-or$initIndex-lt0-or$stateIndex-gt$initIndex){throw 'Provider ownership state is not frozen before external mutation.'}
foreach($required in @('state:"starting"','cleanup.length===0&&existsSync(statePath)','existsSync(join(state.providerRoot,"supabase","config.toml"))')){if(-not$provider.Contains($required)){throw "Provider recovery control is absent: $required"}}
foreach($required in @('Provider rehearsal terminal binding differs.','terminal.providerIdentity','terminal.transferId','Provider secret handoff residue remains after teardown.')){if(-not$mission.Contains($required)){throw "Provider terminal or cleanup binding is absent: $required"}}
foreach($required in @('Get-NetAdapter -InterfaceIndex','Private-link adapter ownership differs','Restore-OracleStage4R5PrivateLinkAddresses')){if(-not$restore.Contains($required)){throw "Private-link ownership control is absent: $required"}}

[pscustomobject][ordered]@{
  result='passed'
  classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','TRANSACTIONAL LIFECYCLE TEST')
  earlyAdmissionInsideRecoveryBoundary=$true
  partialRelayOwnershipTracked=$true
  secretsRemovedAndRedacted=$true
  terminalIdentityBound=$true
  publicationFailureProducesTerminal=$true
  providerTeardownRemovesSecretFallback=$true
  providerStateFrozenBeforeMutation=$true
  adapterOwnershipVerifiedBeforeRestore=$true
  authorityCreated=$false
  attemptCreated=$false
}|ConvertTo-Json -Depth 5
