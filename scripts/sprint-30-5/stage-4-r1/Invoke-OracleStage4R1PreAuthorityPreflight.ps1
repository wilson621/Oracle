[CmdletBinding()]param(
  [Parameter(Mandatory=$true)][string]$PreparationCommit,
  [Parameter(Mandatory=$true)][string]$PreparationTree,
  [Parameter(Mandatory=$true)][string]$OutputPath
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R1PreflightPolicy.ps1')
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))
$contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R1Contract.json')|ConvertFrom-Json
if([string]$contract.status -cne 'ready-for-founder-execution-decision'){throw 'Stage 4 R1 preparation is not admitted for an execution decision.'}
$output=[IO.Path]::GetFullPath($OutputPath);$approved=[IO.Path]::GetFullPath((Join-Path $root ([string]$contract.paths.preflightRoot)))
[void](Assert-OracleStage4R1NoReparseTraversal $output $approved)
$sidecar="$output.sha256.txt";[void](Assert-OracleStage4R1NoReparseTraversal $sidecar $approved)
if(Test-Path -LiteralPath $output){throw 'Preflight output is create-only.'};if(Test-Path -LiteralPath $sidecar){throw 'Preflight sidecar is create-only.'}
$checks=Invoke-OracleStage4R1PreAuthorityChecks $root $contract $PreparationCommit $PreparationTree
$record=[ordered]@{schemaVersion='1.3.0';contract='oracle.sprint-30-5.stage-4-r1-pre-authority-preflight';classification=@($contract.preflight.classification);result='passed';collectedAtUtc=(Get-Date).ToUniversalTime().ToString('o');branch=$checks.branch;preparationCommit=$checks.preparationCommit;preparationTree=$checks.preparationTree;acceptedCandidateCommit=$checks.acceptedCandidateCommit;acceptedCandidateTree=$checks.acceptedCandidateTree;productDrift=@($checks.productDrift);executionRoute='host-network-isolation-required-and-verified';tools=$checks.tools;toolIdentities=$checks.toolIdentities;versions=$checks.versions;docker=$checks.docker;historicalBindingsVerified=$checks.historicalBindingsVerified;providerImagesVerified=$checks.providerImagesVerified;portsAvailable=$checks.portsAvailable;networkIsolated=$checks.networkIsolated;providerResidue=$checks.providerResidue;supabaseOfflineTelemetry=$checks.supabaseOfflineTelemetry;processEvidence=@($checks.processEvidence);authorityCreated=$false;attemptCreated=$false;hostMutation=$false;qualificationEvidence=$false}
$parent=Split-Path -Parent $output;[IO.Directory]::CreateDirectory($parent)|Out-Null;[void](Assert-OracleStage4R1NoReparseTraversal $parent $approved)
$json=$record|ConvertTo-Json -Depth 20;$bytes=[Text.UTF8Encoding]::new($false).GetBytes("$json`n");$stream=[IO.File]::Open($output,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);try{$stream.Write($bytes,0,$bytes.Length);$stream.Flush($true)}finally{$stream.Dispose()}
$hash=(Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash.ToLowerInvariant();$sideBytes=[Text.Encoding]::ASCII.GetBytes("$hash  $(Split-Path -Leaf $output)`n");$side=[IO.File]::Open($sidecar,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);try{$side.Write($sideBytes,0,$sideBytes.Length);$side.Flush($true)}finally{$side.Dispose()}
$record|ConvertTo-Json -Depth 20
