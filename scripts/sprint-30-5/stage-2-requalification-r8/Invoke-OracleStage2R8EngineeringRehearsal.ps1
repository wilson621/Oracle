[CmdletBinding()]
param([Parameter(Mandatory = $true)][string]$ResultPath)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage2RequalificationR8Contract.json')|ConvertFrom-Json
. (Join-Path $PSScriptRoot 'Oracle.Stage2R8CleanHostCore.ps1')
if([string]$contract.status-cne'engineering-freeze-accepted-transfer-barred'-or[bool]$contract.futureTransfer.creationPermitted-or[bool]$contract.authority.authorityCreationPermitted-or[bool]$contract.authority.attemptCreationPermitted){throw 'R8 engineering rehearsal authority boundary differs.'}
$repository=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))
$result=[IO.Path]::GetFullPath($ResultPath)
$approved=[IO.Path]::GetFullPath((Join-Path $repository '.artifacts\sprint-30-5\stage-2-r8-development-rehearsal')).TrimEnd('\')+'\'
if(-not$result.StartsWith($approved,[StringComparison]::OrdinalIgnoreCase)){throw 'Rehearsal result escapes its non-evidence root.'}
if(Test-Path -LiteralPath $result){throw 'Rehearsal result is create-only.'}
[IO.Directory]::CreateDirectory((Split-Path -Parent $result))|Out-Null
$work=$result+'.work'
if(Test-Path -LiteralPath $work){throw 'Rehearsal work root is create-only.'}
[IO.Directory]::CreateDirectory($work)|Out-Null
$primary=$null
$verification=$null
try{
  $freezeRoot=[IO.Path]::GetFullPath((Join-Path $repository ([string]$contract.engineeringFreeze.root)))
  $freezePath=Join-Path $freezeRoot 'Oracle.Stage2R8EngineeringCandidateFreeze.json'
  if((Get-OracleStage2R8Sha256 $freezePath)-cne[string]$contract.engineeringFreeze.freezeSha256){throw 'Engineering freeze hash differs.'}
  $freeze=Get-Content -Raw -LiteralPath $freezePath|ConvertFrom-Json
  if((Get-OracleStage2R8Sha256 (Join-Path $freezeRoot ('release\'+[string]$freeze.package.fileName)))-cne[string]$contract.engineeringFreeze.packageSha256){throw 'Frozen package hash differs.'}
  if(@(Get-AppxPackage -Name ([string]$contract.package.identity) -ErrorAction SilentlyContinue).Count-ne0){throw 'Oracle package pre-state is not zero.'}
  $verification=Invoke-OracleStage2R8CandidateVerification -Contract $contract -PayloadRoot $freezeRoot -WorkRoot $work
}catch{$primary=$_.Exception}
finally{
  if(Test-Path -LiteralPath $work){Remove-Item -LiteralPath $work -Recurse -Force -ErrorAction SilentlyContinue}
}
$subject=[string]$contract.package.publisherSubjectPrefix
$residue=@(Get-ChildItem -LiteralPath 'Cert:\CurrentUser\Root','Cert:\CurrentUser\My'|Where-Object{$_.Subject-ceq$subject}).Count
$record=[ordered]@{result=if($null-eq$primary-and$residue-eq0){'passed'}else{'failed'};classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-ATTEMPT','ENGINEERING REHEARSAL');candidateVerification=$verification;certificateResidue=$residue;transferCreated=$false;authorityCreated=$false;attemptCreated=$false;qualificationEvidence=$false;error=if($null-ne$primary){$primary.Message}else{$null}}
Write-OracleStage2R8CreateOnlyJson -Path $result -Value $record
if([string]$record.result-cne'passed'){throw "R8 engineering rehearsal failed: $($record.error)"}
$record|ConvertTo-Json -Depth 20