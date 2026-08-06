[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$rehearsalOnly=@('Invoke-OracleStage4R5TwoHostRehearsal.ps1','Invoke-OracleStage4R5ProviderMission.ps1','New-OracleStage4R5TwoHostRehearsalRequest.ps1','Complete-OracleStage4R5TwoHostRehearsal.ps1','Invoke-OracleStage4R5ProviderPreAuthority.ps1')
foreach($name in $rehearsalOnly){$text=Get-Content -LiteralPath (Join-Path $PSScriptRoot $name)-Raw;if(-not$text.Contains('EngineeringRehearsalBundle')){throw "Rehearsal bundle mode is absent: $name"}}
foreach($name in @('Invoke-OracleStage4R5FounderHandoff.ps1','Invoke-OracleStage4R5Qualification.ps1','Complete-OracleStage4R5Mission.ps1')){$text=Get-Content -LiteralPath (Join-Path $PSScriptRoot $name)-Raw;if($text.Contains('EngineeringRehearsalBundle')){throw "Qualification lifecycle accepts engineering rehearsal bundle mode: $name"}}
$core=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')-Raw
foreach($required in @('qualificationExecutionPermitted','qualificationEvidence','NON-TRANSFER-')){if(-not$core.Contains($required)){throw "Rehearsal-bundle fail-closed control is absent: $required"}}
[pscustomobject][ordered]@{result='passed';classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','ENGINEERING REHEARSAL BOUNDARY TEST');rehearsalEntryPoints=5;qualificationEntryPointsRejectBundleMode=3;transferCreated=$false;authorityCreated=$false;attemptCreated=$false}|ConvertTo-Json -Depth 5
