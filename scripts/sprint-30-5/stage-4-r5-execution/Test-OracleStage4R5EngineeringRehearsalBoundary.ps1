[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')
$rehearsalOnly=@('Invoke-OracleStage4R5TwoHostRehearsal.ps1','Invoke-OracleStage4R5ProviderMission.ps1','New-OracleStage4R5TwoHostRehearsalRequest.ps1','Complete-OracleStage4R5TwoHostRehearsal.ps1','Invoke-OracleStage4R5ProviderPreAuthority.ps1')
foreach($name in $rehearsalOnly){$text=Get-Content -LiteralPath (Join-Path $PSScriptRoot $name)-Raw;if(-not$text.Contains('EngineeringRehearsalBundle')){throw "Rehearsal bundle mode is absent: $name"}}
foreach($name in @('Invoke-OracleStage4R5FounderHandoff.ps1','Invoke-OracleStage4R5Qualification.ps1','Complete-OracleStage4R5Mission.ps1')){$text=Get-Content -LiteralPath (Join-Path $PSScriptRoot $name)-Raw;if($text.Contains('EngineeringRehearsalBundle')){throw "Qualification lifecycle accepts engineering rehearsal bundle mode: $name"}}
$coreText=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')-Raw
foreach($required in @('qualificationExecutionPermitted','qualificationEvidence','NON-TRANSFER-')){if(-not$coreText.Contains($required)){throw "Rehearsal-bundle fail-closed control is absent: $required"}}

$testRoot=Join-Path ([IO.Path]::GetTempPath()) ('oracle-stage4-r5-bundle-test-'+[Guid]::NewGuid().ToString('N'))
try{
  [IO.Directory]::CreateDirectory($testRoot)|Out-Null
  foreach($fixture in @('accepted','hostile')){[IO.Directory]::CreateDirectory((Join-Path $testRoot "$fixture\payload"))|Out-Null}
  $record=[ordered]@{schemaVersion='1.0.0';contract='oracle.sprint-30-5.stage-4-r5-engineering-rehearsal-bundle';bundleId='engineering-rehearsal-stage4-r5-20260806T220000000Z-deadbeef';classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','NON-TRANSFER');transferCreated=$false;qualificationExecutionPermitted=$false;authorityCreated=$false;attemptCreated=$false;qualificationEvidence=$false;preparation=[ordered]@{executionCommit='fixture';executionTree='fixture'};payload=@()}
  $acceptedManifest=Join-Path $testRoot 'accepted\Oracle.Stage4R5EngineeringRehearsalBundle.json';Write-OracleStage4R5CreateOnlyJson $acceptedManifest $record
  [void](Assert-OracleStage4R5EngineeringRehearsalBundle (Join-Path $testRoot 'accepted') (Get-OracleStage4R5Sha256 $acceptedManifest))
  $record.authorityCreated=$true
  $hostileManifest=Join-Path $testRoot 'hostile\Oracle.Stage4R5EngineeringRehearsalBundle.json';Write-OracleStage4R5CreateOnlyJson $hostileManifest $record
  try{[void](Assert-OracleStage4R5EngineeringRehearsalBundle (Join-Path $testRoot 'hostile') (Get-OracleStage4R5Sha256 $hostileManifest));throw 'Governed state in a rehearsal bundle was accepted.'}catch{if($_.Exception.Message-ceq'Governed state in a rehearsal bundle was accepted.'-or$_.Exception.Message-cnotmatch'governed execution state'){throw}}
}finally{if(Test-Path -LiteralPath $testRoot){Remove-Item -LiteralPath $testRoot -Recurse -Force}}

[pscustomobject][ordered]@{result='passed';classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','ENGINEERING REHEARSAL BOUNDARY TEST');rehearsalEntryPoints=5;qualificationEntryPointsRejectBundleMode=3;validNonTransferBundleAccepted=$true;governedStateRejected=$true;transferCreated=$false;authorityCreated=$false;attemptCreated=$false}|ConvertTo-Json -Depth 5
