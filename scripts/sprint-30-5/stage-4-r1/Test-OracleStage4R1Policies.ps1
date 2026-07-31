[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R1LifecyclePolicy.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R1JourneyPolicy.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R1PreflightPolicy.ps1')
$contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R1Contract.json')|ConvertFrom-Json
$approvedGit=Resolve-OracleStage4R1BoundTool $contract.toolchain.approvedTools.git 'git'
if(-not$approvedGit.regularFile -or $approvedGit.reparsePoint -or -not$approvedGit.ancestryReparseFree -or $approvedGit.path -cne 'C:\Program Files\Git\cmd\git.exe'){throw 'Approved Git identity was not proven.'}
function Assert-ToolIdentityRejected([object]$Specification,[string]$Fixture){try{[void](Resolve-OracleStage4R1BoundTool $Specification $Fixture);throw "Tool fixture accepted: $Fixture"}catch{if($_.Exception.Message -eq "Tool fixture accepted: $Fixture"){throw}}}
$wrongPath=$contract.toolchain.approvedTools.git|ConvertTo-Json -Depth 5|ConvertFrom-Json;$wrongPath.path='C:\Users\wilso.DESKTOP-M3H22E4\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe';Assert-ToolIdentityRejected $wrongPath 'wrong-path'
$wrongHash=$contract.toolchain.approvedTools.git|ConvertTo-Json -Depth 5|ConvertFrom-Json;$wrongHash.sha256='0000000000000000000000000000000000000000000000000000000000000000';Assert-ToolIdentityRejected $wrongHash 'wrong-hash'
$fixtureRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..\.tmp-stage4-r1-tool-reparse-fixture'));if(-not$fixtureRoot.StartsWith([IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..')),[StringComparison]::OrdinalIgnoreCase)){throw 'Tool fixture root escaped the repository.'};New-Item -ItemType Directory -Path $fixtureRoot -ErrorAction Stop|Out-Null
$junction=Join-Path $fixtureRoot 'redirect'
try{New-Item -ItemType Junction -Path $junction -Target 'C:\Program Files\Git\cmd' -ErrorAction Stop|Out-Null;$reparse=$contract.toolchain.approvedTools.git|ConvertTo-Json -Depth 5|ConvertFrom-Json;$reparse.path=Join-Path $junction 'git.exe';Assert-ToolIdentityRejected $reparse 'reparse-ancestry'}finally{if(Test-Path -LiteralPath $junction){[IO.Directory]::Delete($junction)};if(Test-Path -LiteralPath $fixtureRoot){[IO.Directory]::Delete($fixtureRoot)}}$fixture=(Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R1Fixtures.json')|ConvertFrom-Json).validJourney
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