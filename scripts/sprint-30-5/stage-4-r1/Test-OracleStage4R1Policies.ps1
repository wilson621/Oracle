[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R1LifecyclePolicy.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R1JourneyPolicy.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R1PreflightPolicy.ps1')
$fixture=(Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R1Fixtures.json')|ConvertFrom-Json).validJourney
[void](Assert-OracleStage4R1JourneyRecord $fixture)
foreach($mutation in @('missing','duplicate','unexpected','failed','production','external-email','leak','rendering','secret','missing-nested')){
  $copy=$fixture|ConvertTo-Json -Depth 20|ConvertFrom-Json
  switch($mutation){
    'missing'{$copy.journeys=@($copy.journeys|Select-Object -Skip 1)}
    'duplicate'{$copy.journeys=@($copy.journeys)+@($copy.journeys[0])}
    'unexpected'{$copy.journeys[0].id='unexpected'}
    'failed'{$copy.journeys[0].result='failed'}
    'production'{$copy.provider.productionEndpoint=$true}
    'external-email'{$copy.provider.externalEmail=$true}
    'leak'{$copy.isolation.crossAccountLeaks=1}
    'rendering'{$copy.rendering.protectedStatus=500}
    'secret'{$copy.secretsRetained=$true}
    'missing-nested'{$copy.isolation.PSObject.Properties.Remove('distinctOperators')}
  }
  try{[void](Assert-OracleStage4R1JourneyRecord $copy);throw "Mutation accepted: $mutation"}catch{if($_.Exception.Message -eq "Mutation accepted: $mutation"){throw}}
}
$optional=[pscustomobject]@{present='value'};if((Get-OracleStage4R1OptionalMember $optional 'absent') -ne $null){throw 'Absent optional member was not null.'};if((Get-OracleStage4R1OptionalMember $optional 'present') -cne 'value'){throw 'Present optional member changed.'}
try{[void](Get-OracleStage4R1MandatoryMember $optional 'absent' 'fixture');throw 'Missing mandatory member accepted.'}catch{if($_.Exception.Message -eq 'Missing mandatory member accepted.'){throw}}
$quoted=ConvertTo-OracleStage4R1WindowsArgument 'C:\Program Files\Oracle\value"quoted';if($quoted -notmatch '^".*"$'){throw 'Windows argument quoting failed.'}
$success=Invoke-OracleStage4R1NativeProcess (Join-Path $env:SystemRoot 'System32\cmd.exe') @('/d','/c','exit 0') $PSScriptRoot;if($success.exitCode -ne 0){throw 'Process success fixture failed.'}
try{[void](Invoke-OracleStage4R1NativeProcess (Join-Path $env:SystemRoot 'System32\cmd.exe') @('/d','/c','echo failure 1>&2 & exit 7') $PSScriptRoot);throw 'Nonzero process fixture accepted.'}catch{if($_.Exception.Message -eq 'Nonzero process fixture accepted.'){throw};$record=$_.Exception.Data['OracleStage4R1ProcessRecord'];if($null-eq$record -or $record.exitCode-ne 7 -or [string]::IsNullOrWhiteSpace([string]$record.stderr)){throw 'Process failure envelope was not preserved.'}}
$state=New-OracleStage4R1LifecycleState;foreach($phase in @(Get-OracleStage4R1LifecyclePhases)){[void](Move-OracleStage4R1Lifecycle $state $phase)};if(-not$state.terminal){throw 'Lifecycle did not terminate.'}
try{[void](Move-OracleStage4R1Lifecycle $state 'evidence-frozen');throw 'Repeat accepted.'}catch{if($_.Exception.Message -eq 'Repeat accepted.'){throw}}
$early=Get-OracleStage4R1TeardownObligations @('authority-consumed');if(-not$early.verifyZeroResidue -or -not$early.retryProhibited -or -not$early.preserveAttempt){throw 'Early teardown invariants failed.'}
Write-Output 'Stage 4 R1 PowerShell policy tests passed.'