[CmdletBinding()]param(
  [Parameter(Mandatory=$true)][string]$PreparationCommit,
  [Parameter(Mandatory=$true)][string]$PreparationTree,
  [Parameter(Mandatory=$true)][string]$OutputPath,
  [Parameter(Mandatory=$true)][string]$TransferRoot,
  [Parameter(Mandatory=$true)][string]$TransferManifestSha256,
  [Parameter(Mandatory=$true)][string]$TransferCustodySha256,
  [Parameter(Mandatory=$true)][string]$TransferVerificationSha256
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R4PreflightPolicy.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage5R1TransferPolicy.ps1')
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))
$contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage5R1Contract.json')|ConvertFrom-Json
if([string]$contract.status -cne 'founder-authorised-execution-enabled'){throw 'Stage 5 R1 preparation is not admitted for an execution decision.'}
$output=[IO.Path]::GetFullPath($OutputPath);$approved=[IO.Path]::GetFullPath((Join-Path $root ([string]$contract.paths.preflightRoot)))
[void](Assert-OracleStage4R4NoReparseTraversal $output $approved)
$sidecar="$output.sha256.txt";[void](Assert-OracleStage4R4NoReparseTraversal $sidecar $approved)
if(Test-Path -LiteralPath $output){throw 'Preflight output is create-only.'};if(Test-Path -LiteralPath $sidecar){throw 'Preflight sidecar is create-only.'}
$transferAdmission=Assert-OracleStage5R1Transfer -RepositoryRoot $root -Contract $contract -TransferRoot $TransferRoot -ExpectedManifestSha256 $TransferManifestSha256 -ExpectedCustodySha256 $TransferCustodySha256 -ExpectedVerificationSha256 $TransferVerificationSha256 -ExecutionCommit $PreparationCommit -ExecutionTree $PreparationTree
$checks=Invoke-OracleStage4R4PreAuthorityChecks $root $contract $PreparationCommit $PreparationTree
$computer=Get-CimInstance Win32_ComputerSystem -ErrorAction Stop
if([string]$env:COMPUTERNAME -cne [string]$contract.host.requiredIdentity){throw "Stage 5 qualification host identity differs."}
if([string]$computer.Model -cne [string]$contract.host.model){throw "Stage 5 qualification host model differs."}
if(-not[Environment]::Is64BitOperatingSystem -or [Environment]::OSVersion.Version.Build -lt 22000){throw "Windows 11 x64 host admission failed."}
$video=@(Get-CimInstance Win32_VideoController -ErrorAction Stop)
if($video.Count-lt1 -or @($video|Where-Object{[string]$_.Name-match'(?i)Microsoft Basic Render'}).Count-ne0 -or @($video|Where-Object{[string]$_.Name-match'(?i)(Intel|NVIDIA)'}).Count-lt1){throw "Accepted hardware GPU adapter admission failed."}
$display=@($video|Where-Object{[int]$_.CurrentHorizontalResolution-gt0 -and [int]$_.CurrentVerticalResolution-gt0}|Sort-Object CurrentHorizontalResolution -Descending|Select-Object -First 1)
if($display.Count-ne1 -or [int]$display[0].CurrentHorizontalResolution-lt[int]$contract.host.minimumDisplay.width -or [int]$display[0].CurrentVerticalResolution-lt[int]$contract.host.minimumDisplay.height){throw "Stage 5 minimum display admission failed."}
$logPixels=[int](Get-ItemPropertyValue -LiteralPath 'HKCU:\Control Panel\Desktop' -Name LogPixels -ErrorAction SilentlyContinue);if($logPixels-le0){$logPixels=96};$scaling=[int][Math]::Round(($logPixels/96.0)*100)
if([int[]]$contract.host.permittedScalingPercent -notcontains $scaling){throw "Stage 5 display scaling admission failed."}
$edgeCandidates=@([string[]]$contract.host.browserInspection.permittedCanonicalPaths|Where-Object{Test-Path -LiteralPath $_ -PathType Leaf})
if($edgeCandidates.Count-ne1){throw "Exactly one permitted Edge browser identity is required."}
$edgePath=[IO.Path]::GetFullPath($edgeCandidates[0]);$edgeItem=Get-Item -LiteralPath $edgePath -Force
if(($edgeItem.Attributes-band[IO.FileAttributes]::ReparsePoint)-ne0){throw "Edge browser identity is a reparse point."}
$edgeSha256=(Get-FileHash -LiteralPath $edgePath -Algorithm SHA256).Hash.ToLowerInvariant()
$gpuCounter=Get-Counter '\GPU Engine(*)\Utilization Percentage' -MaxSamples 1 -ErrorAction Stop
if(@($gpuCounter.CounterSamples).Count-lt1){throw "Windows GPU-engine measurement is unavailable."}
$checks|Add-Member hostAdmission ([pscustomobject][ordered]@{identity=[string]$env:COMPUTERNAME;model=[string]$computer.Model;os=[Environment]::OSVersion.VersionString;display=[ordered]@{width=[int]$display[0].CurrentHorizontalResolution;height=[int]$display[0].CurrentVerticalResolution;scalingPercent=$scaling};videoAdapters=@($video|ForEach-Object{[ordered]@{name=[string]$_.Name;driverVersion=[string]$_.DriverVersion}});browser=[ordered]@{path=$edgePath;sha256=$edgeSha256;fileVersion=[string]$edgeItem.VersionInfo.FileVersion};gpuCounterAvailable=$true;browserPort=[int]$contract.host.browserInspection.remoteDebuggingLoopbackPort})
$record=[ordered]@{schemaVersion='2.0.0';contract='oracle.sprint-30-5.stage-4-r4-pre-authority-preflight';classification=@($contract.preflight.classification);result='passed';collectedAtUtc=(Get-Date).ToUniversalTime().ToString('o');branch=$checks.branch;preparationCommit=$checks.preparationCommit;preparationTree=$checks.preparationTree;acceptedCandidateCommit=$checks.acceptedCandidateCommit;acceptedCandidateTree=$checks.acceptedCandidateTree;transfer=$transferAdmission;productDrift=@($checks.productDrift);executionRoute='host-network-isolation-required-and-verified';tools=$checks.tools;toolIdentities=$checks.toolIdentities;versions=$checks.versions;docker=$checks.docker;historicalBindingsVerified=$checks.historicalBindingsVerified;providerImagesVerified=$checks.providerImagesVerified;portsAvailable=$checks.portsAvailable;networkIsolated=$checks.networkIsolated;providerResidue=$checks.providerResidue;packageState=$checks.packageState;certificateState=$checks.certificateState;runtimeConfigurationState=$checks.runtimeConfigurationState;msixSha256=$checks.msixSha256;publicCertificateSha256=$checks.publicCertificateSha256;elevated=$checks.elevated;supabaseOfflineTelemetry=$checks.supabaseOfflineTelemetry;processEvidence=@($checks.processEvidence);hostAdmission=$checks.hostAdmission;authorityCreated=$false;attemptCreated=$false;hostMutation=$false;qualificationEvidence=$false}
$parent=Split-Path -Parent $output;[IO.Directory]::CreateDirectory($parent)|Out-Null;[void](Assert-OracleStage4R4NoReparseTraversal $parent $approved)
$json=$record|ConvertTo-Json -Depth 20;$bytes=[Text.UTF8Encoding]::new($false).GetBytes("$json`n");$stream=[IO.File]::Open($output,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);try{$stream.Write($bytes,0,$bytes.Length);$stream.Flush($true)}finally{$stream.Dispose()}
$hash=(Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash.ToLowerInvariant();$sideBytes=[Text.Encoding]::ASCII.GetBytes("$hash  $(Split-Path -Leaf $output)`n");$side=[IO.File]::Open($sidecar,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);try{$side.Write($sideBytes,0,$sideBytes.Length);$side.Flush($true)}finally{$side.Dispose()}
$record|ConvertTo-Json -Depth 20
