[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$TransferRoot,
  [Parameter(Mandatory=$true)][string]$ExpectedManifestSha256,
  [Parameter(Mandatory=$true)][string]$ExpectedCustodySha256,
  [Parameter(Mandatory=$true)][string]$ExpectedVerificationSha256,
  [Parameter(Mandatory=$true)][string]$ExpectedExecutionCommit,
  [string]$RehearsalCompletionPath,
  [string]$ExpectedRehearsalCompletionSha256,
  [switch]$RehearsalReadiness,
  [Parameter(Mandatory=$true)][string]$OutputPath
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$scriptRoot=$PSScriptRoot;$repositoryRoot=[IO.Path]::GetFullPath((Join-Path $scriptRoot '..\..\..'))
$contract=Get-Content -Raw -LiteralPath (Join-Path $scriptRoot 'Oracle.Stage4R5ExecutionContract.json')|ConvertFrom-Json
. (Join-Path $scriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')
. (Join-Path $scriptRoot 'Oracle.Stage4R5NetworkPolicy.ps1')
. (Join-Path $scriptRoot 'Oracle.Stage4R5ProviderHostPolicy.ps1')
Assert-OracleStage4R5Administrator
if(-not[string]::Equals([string]$env:COMPUTERNAME,[string]$contract.hosts.provider.computerName,[StringComparison]::OrdinalIgnoreCase)){throw 'Provider host identity differs.'}
$git=[string]$contract.toolchain.git.path;$head=(& $git -C $repositoryRoot rev-parse HEAD).Trim();if($LASTEXITCODE-ne0-or$head-cne$ExpectedExecutionCommit){throw 'Provider-host execution HEAD differs.'}
$branch=(& $git -C $repositoryRoot branch --show-current).Trim();$status=(& $git -C $repositoryRoot status --porcelain=v1 --untracked-files=all|Out-String).Trim();if($LASTEXITCODE-ne0-or$branch-cne[string]$contract.requiredBranch-or-not[string]::IsNullOrEmpty($status)){throw 'Provider-host repository is not clean on the required branch.'}
$transfer=Assert-OracleStage4R5Transfer $TransferRoot $ExpectedManifestSha256 $ExpectedCustodySha256 $ExpectedVerificationSha256
$rehearsalCompletionSha=$null
if(-not$RehearsalReadiness){
  if([string]::IsNullOrWhiteSpace($RehearsalCompletionPath)-or[string]::IsNullOrWhiteSpace($ExpectedRehearsalCompletionSha256)){throw 'Final provider pre-authority requires the completed two-host rehearsal binding.'}
  $rehearsalPath=[IO.Path]::GetFullPath($RehearsalCompletionPath)
  if(-not(Test-Path -LiteralPath $rehearsalPath -PathType Leaf)){throw 'Two-host rehearsal completion record is absent.'}
  $rehearsalCompletionSha=Get-OracleStage4R5Sha256 $rehearsalPath
  if($rehearsalCompletionSha-cne$ExpectedRehearsalCompletionSha256.ToLowerInvariant()){throw 'Two-host rehearsal completion hash differs.'}
  $rehearsal=Get-Content -Raw -LiteralPath $rehearsalPath|ConvertFrom-Json
  if([string]$rehearsal.contract-cne'oracle.sprint-30-5.stage-4-r5-two-host-rehearsal-completion'-or[string]$rehearsal.result-cne'passed'-or[string]$rehearsal.transferId-cne[string]$transfer.transferId-or[string]$rehearsal.executionCommit-cne$ExpectedExecutionCommit-or-not[bool]$rehearsal.providerZeroResidue-or-not[bool]$rehearsal.qualificationZeroResidue-or[bool]$rehearsal.authorityCreated-or[bool]$rehearsal.attemptCreated){throw 'Two-host rehearsal completion is inadmissible.'}
}
if([string]$transfer.manifest.preparation.executionCommit-cne$head){throw 'Transfer execution commit differs.'}
$toolRecords=@();foreach($property in $contract.toolchain.PSObject.Properties){$name=[string]$property.Name;$expected=$property.Value;$path=[string]$expected.path;if(-not(Test-Path -LiteralPath $path -PathType Leaf)){throw "Provider tool is absent: $name"};$hash=Get-OracleStage4R5Sha256 $path;if($hash-cne[string]$expected.sha256){throw "Provider tool hash differs: $name"};$version=if($expected.PSObject.Properties.Name-ccontains'version'){[string]$expected.version}else{$null};$toolRecords+=[pscustomobject][ordered]@{name=$name;path=$path;sha256=$hash;version=$version}}
$adapter=@(Get-NetAdapter -Physical -Name ([string]$contract.hosts.provider.adapterName) -ErrorAction Stop|Where-Object{$_.Status-ceq'Up'-and[string]$_.MacAddress-ceq[string]$contract.hosts.provider.adapterMac});if($adapter.Count-ne1){throw 'Exact provider private-link adapter is not up.'}
$addresses=@(Get-NetIPAddress -InterfaceIndex ([int]$adapter[0].ifIndex) -AddressFamily IPv4 -IPAddress ([string]$contract.hosts.provider.address) -ErrorAction SilentlyContinue|Where-Object{[int]$_.PrefixLength-eq[int]$contract.hosts.provider.prefixLength});if($addresses.Count-ne1){throw 'Exact provider private-link address is absent or ambiguous.'}
$routes=@(Get-OracleStage4R5DefaultRoutes);if($routes.Count-ne0){throw 'Provider host has an active IPv4 or IPv6 default route.'}
$existingRelays=@(Get-OracleStage4R5RelayEntries|Where-Object{$_.listenPort-in@(54321,54324)-or$_.connectPort-in@(54321,54324)});if($existingRelays.Count-ne0){throw 'Provider R5 publication pre-state is not zero.'}
$docker=[string]$contract.toolchain.docker.path;$serverText=(& $docker version --format '{{json .Server}}' 2>&1|Out-String).Trim();if($LASTEXITCODE-ne0-or[string]::IsNullOrEmpty($serverText)){throw 'Docker server is unavailable.'};$server=$serverText|ConvertFrom-Json;if([string]$server.Version-cne[string]$contract.toolchain.docker.version){throw 'Docker server version differs.'}
$images=@();foreach($service in $contract.provider.services.PSObject.Properties){$item=$service.Value;$text=(& $docker image inspect --format '{{json .}}' ([string]$item.image) 2>&1|Out-String).Trim();if($LASTEXITCODE-ne0){throw "Required provider image is absent: $($item.image)"};$image=$text|ConvertFrom-Json;if([string]$image.Id-cne[string]$item.digest){throw "Provider image ID differs: $($item.image)"};$repository=([string]$item.image)-replace':[^/:]+$','';if(@($image.RepoDigests)-cnotcontains($repository+'@'+[string]$item.digest)){throw "Provider image repository digest differs: $($item.image)"};$images+=[pscustomobject][ordered]@{image=[string]$item.image;digest=[string]$item.digest}}
$prefix=[string]$contract.provider.projectIdPrefix;$containers=@(& $docker ps -a --filter "name=$prefix" --format '{{.ID}}'|Where-Object{$_});$volumes=@(& $docker volume ls --filter "name=$prefix" --format '{{.Name}}'|Where-Object{$_});$networks=@(& $docker network ls --filter "name=$prefix" --format '{{.Name}}'|Where-Object{$_});if($containers.Count-ne0-or$volumes.Count-ne0-or$networks.Count-ne0){throw 'Provider container, volume, or network pre-state is not zero.'}
$record=[ordered]@{schemaVersion='1.0.0';contract=if($RehearsalReadiness){'oracle.sprint-30-5.stage-4-r5-provider-rehearsal-readiness'}else{'oracle.sprint-30-5.stage-4-r5-provider-pre-authority'};result='passed';classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','READ-ONLY');rehearsalCompletionSha256=$rehearsalCompletionSha;transferId=[string]$transfer.transferId;founderGrantId=[string]$transfer.founderGrantId;executionCommit=$head;executionTree=[string]$transfer.manifest.preparation.executionTree;computerName=[string]$env:COMPUTERNAME;adapterName=[string]$adapter[0].Name;adapterMac=[string]$adapter[0].MacAddress;privateAddress=[string]$addresses[0].IPAddress;prefixLength=[int]$addresses[0].PrefixLength;activeDefaultRoutes=0;internetReachable=$false;tools=$toolRecords;images=$images;providerContainers=0;providerVolumes=0;providerNetworks=0;providerRelays=0;authorityCreated=$false;attemptCreated=$false;providerStateCreated=$false;relayStateCreated=$false;collectedAtUtc=[DateTime]::UtcNow.ToString('o')}
Write-OracleStage4R5CreateOnlyJson $OutputPath $record
[pscustomobject][ordered]@{result='passed';outputPath=[IO.Path]::GetFullPath($OutputPath);sha256=Get-OracleStage4R5Sha256 $OutputPath;transferId=[string]$transfer.transferId;authorityCreated=$false;attemptCreated=$false;providerStateCreated=$false}|ConvertTo-Json -Depth 8
