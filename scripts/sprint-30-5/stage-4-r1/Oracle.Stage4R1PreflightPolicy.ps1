Set-StrictMode -Version Latest

function ConvertTo-OracleStage4R1WindowsArgument([string]$Value) {
  if($null -eq $Value -or $Value.Length -eq 0){return '""'}
  if($Value -notmatch '[\s"]'){return $Value}
  $builder=New-Object Text.StringBuilder;[void]$builder.Append('"');$slashes=0
  foreach($character in $Value.ToCharArray()){
    if($character -eq '\'){$slashes++;continue}
    if($character -eq '"'){[void]$builder.Append(('\' * (($slashes * 2) + 1)));[void]$builder.Append('"');$slashes=0;continue}
    if($slashes){[void]$builder.Append(('\' * $slashes));$slashes=0};[void]$builder.Append($character)
  }
  if($slashes){[void]$builder.Append(('\' * ($slashes * 2)))};[void]$builder.Append('"');$builder.ToString()
}
function Invoke-OracleStage4R1NativeProcess([string]$Executable,[string[]]$Arguments,[string]$WorkingDirectory) {
  $started=(Get-Date).ToUniversalTime();$processError=$null;$exitCode=$null;$stdout='';$stderr=''
  try{
    $info=New-Object Diagnostics.ProcessStartInfo
    $info.FileName=$Executable
    $quotedArguments=@()
    foreach($argument in @($Arguments)){$quotedArguments+=ConvertTo-OracleStage4R1WindowsArgument ([string]$argument)}
    $info.Arguments=($quotedArguments -join ' ')
    $info.WorkingDirectory=$WorkingDirectory;$info.UseShellExecute=$false;$info.CreateNoWindow=$true;$info.RedirectStandardOutput=$true;$info.RedirectStandardError=$true
    $process=New-Object Diagnostics.Process;$process.StartInfo=$info
    if(-not $process.Start()){throw 'Process.Start returned false.'}
    $stdout=$process.StandardOutput.ReadToEnd();$stderr=$process.StandardError.ReadToEnd();$process.WaitForExit();$exitCode=$process.ExitCode;$process.Dispose()
  }catch{$processError=$_.Exception.Message}
  $record=[pscustomobject][ordered]@{executable=$Executable;arguments=@($Arguments);startedAtUtc=$started.ToString('o');completedAtUtc=(Get-Date).ToUniversalTime().ToString('o');stdout=$stdout;stderr=$stderr;exitCode=$exitCode;signal=$null;processError=$processError}
  $failureMessage=$null
  if($null -ne $processError){$failureMessage="Process startup or execution failed: $processError"}
  elseif($null -eq $exitCode){$failureMessage='Process exit status is null or undefined.'}
  elseif([int]$exitCode -ne 0){$failureMessage="Process exited with status $exitCode. stderr: $stderr"}
  if($null -ne $failureMessage){$exception=New-Object -TypeName System.InvalidOperationException -ArgumentList $failureMessage;$exception.Data['OracleStage4R1ProcessRecord']=$record;throw $exception}
  $record
}
function ConvertTo-OracleStage4R1ProcessEvidenceArray([Collections.Generic.List[object]]$Evidence) {
  if($null -eq $Evidence){throw 'Process evidence collection is absent.'}
  ,$Evidence.ToArray()
}
function Assert-OracleStage4R1NoReparseTraversal([string]$Path,[string]$Boundary) {
  $full=[IO.Path]::GetFullPath($Path);$boundaryFull=[IO.Path]::GetFullPath($Boundary);$root=$boundaryFull.TrimEnd('\')
  if(-not($full -eq $root -or $full.StartsWith($root+'\',[StringComparison]::OrdinalIgnoreCase))){throw 'Path escapes its governed boundary.'}
  $current=$boundaryFull;if(Test-Path -LiteralPath $current){if((Get-Item -LiteralPath $current -Force).Attributes -band [IO.FileAttributes]::ReparsePoint){throw "Governed path traverses a reparse point: $current"}}
  $relative=$full.Substring($root.Length).TrimStart('\');foreach($part in @($relative.Split('\')|Where-Object{$_})){ $current=Join-Path $current $part;if(Test-Path -LiteralPath $current){if((Get-Item -LiteralPath $current -Force).Attributes -band [IO.FileAttributes]::ReparsePoint){throw "Governed path traverses a reparse point: $current"}}}
  $full
}
function Resolve-OracleStage4R1BoundTool([object]$Specification,[string]$Name) {
  foreach($member in @('path','realPath','sha256')){if($null-eq$Specification.PSObject.Properties[$member] -or [string]::IsNullOrWhiteSpace([string]$Specification.$member)){throw "Approved tool identity is incomplete: $Name.$member"}}
  $path=[IO.Path]::GetFullPath([string]$Specification.path)
  if(-not $path.Equals([string]$Specification.path,[StringComparison]::OrdinalIgnoreCase)){throw "Approved tool path is not canonical: $Name"}
  [void](Assert-OracleStage4R1NoReparseTraversal $path ([IO.Path]::GetPathRoot($path)))
  if(-not(Test-Path -LiteralPath $path -PathType Leaf)){throw "Approved tool is absent or not a regular file: $Name"}
  $item=Get-Item -LiteralPath $path -Force
  if($item.PSIsContainer -or (($item.Attributes-band[IO.FileAttributes]::Directory)-ne 0) -or (($item.Attributes-band[IO.FileAttributes]::ReparsePoint)-ne 0)){throw "Approved tool is not a non-reparse regular file: $Name"}
  $realPath=[IO.Path]::GetFullPath([string]$item.FullName)
  if(-not $realPath.Equals([string]$Specification.realPath,[StringComparison]::OrdinalIgnoreCase)){throw "Approved tool real-path mismatch: $Name"}
  $hash=(Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
  if($hash -cne [string]$Specification.sha256){throw "Approved tool SHA-256 mismatch: $Name"}
  $expectedFileVersion=if($null-ne$Specification.PSObject.Properties['fileVersion']){[string]$Specification.fileVersion}else{$null}
  $observedFileVersion=[string]$item.VersionInfo.FileVersion
  if(-not[string]::IsNullOrWhiteSpace($expectedFileVersion) -and $observedFileVersion -cne $expectedFileVersion){throw "Approved tool file-version mismatch: $Name"}
  [pscustomobject][ordered]@{name=$Name;path=$path;realPath=$realPath;sha256=$hash;fileVersion=$observedFileVersion;regularFile=$true;reparsePoint=$false;ancestryReparseFree=$true}
}function Invoke-OracleStage4R1PreAuthorityChecks([string]$Root,[object]$Contract,[string]$PreparationCommit,[string]$PreparationTree) {
  $rootFull=[IO.Path]::GetFullPath($Root);$processEvidence=New-Object Collections.Generic.List[object]
  if($PSVersionTable.PSEdition -cne [string]$Contract.toolchain.powershellEdition -or $PSVersionTable.PSVersion.Major -ne [int]$Contract.toolchain.powershellMajor -or -not[Environment]::Is64BitProcess){throw 'Windows PowerShell 5.1 x64 is required.'}
  $approved=$Contract.toolchain.approvedTools;$toolIdentities=[ordered]@{}
  foreach($name in @('git','node','npmCli','supabaseCli','docker','powershell','taskkill')){$toolIdentities[$name]=Resolve-OracleStage4R1BoundTool $approved.$name $name}
  $git=$toolIdentities.git.path;$node=$toolIdentities.node.path;$npmCli=$toolIdentities.npmCli.path;$supabaseCli=$toolIdentities.supabaseCli.path;$docker=$toolIdentities.docker.path;$powershell=$toolIdentities.powershell.path;$taskkill=$toolIdentities.taskkill.path
  $currentPowerShell=[IO.Path]::GetFullPath([Diagnostics.Process]::GetCurrentProcess().MainModule.FileName)
  if(-not$currentPowerShell.Equals($powershell,[StringComparison]::OrdinalIgnoreCase)){throw 'Pre-authority gate is not running under the approved PowerShell executable.'}
  $branchRecord=Invoke-OracleStage4R1NativeProcess $git @('-C',$rootFull,'branch','--show-current') $rootFull;$processEvidence.Add($branchRecord);$branch=$branchRecord.stdout.Trim()
  $headRecord=Invoke-OracleStage4R1NativeProcess $git @('-C',$rootFull,'rev-parse','HEAD') $rootFull;$processEvidence.Add($headRecord);$head=$headRecord.stdout.Trim()
  $treeRecord=Invoke-OracleStage4R1NativeProcess $git @('-C',$rootFull,'show','-s','--format=%T','HEAD') $rootFull;$processEvidence.Add($treeRecord);$tree=$treeRecord.stdout.Trim()
  $statusRecord=Invoke-OracleStage4R1NativeProcess $git @('-C',$rootFull,'status','--porcelain=v1','-uall') $rootFull;$processEvidence.Add($statusRecord)
  if($branch -cne [string]$Contract.repository.branch -or $head -cne $PreparationCommit -or $tree -cne $PreparationTree -or -not[string]::IsNullOrWhiteSpace($statusRecord.stdout)){throw 'Repository preflight failed.'}
  $driftArguments=@('-C',$rootFull,'diff','--name-only',[string]$Contract.repository.acceptedCandidateCommit,'HEAD','--')+@($Contract.repository.productPaths)
  $driftRecord=Invoke-OracleStage4R1NativeProcess $git $driftArguments $rootFull;$processEvidence.Add($driftRecord);$productDrift=@($driftRecord.stdout -split '\r?\n'|Where-Object{$_})
  if($productDrift.Count -ne 0){throw "Accepted product source has drifted: $($productDrift -join ', ')"}
  if(Test-Path -LiteralPath (Join-Path $rootFull '.next')){throw 'Pre-existing Web build output is prohibited.'}
  foreach($binding in @($Contract.historicalEvidenceBindings)){ $bindingPath=Join-Path $rootFull ([string]$binding.path);if(-not(Test-Path -LiteralPath $bindingPath -PathType Leaf)){throw "Historical binding is absent: $($binding.path)"};$hash=(Get-FileHash -LiteralPath $bindingPath -Algorithm SHA256).Hash.ToLowerInvariant();if($hash -cne [string]$binding.sha256){throw "Historical binding mismatch: $($binding.path)"} }
  $versions=[ordered]@{}
  $gitVersion=Invoke-OracleStage4R1NativeProcess $git @('--version') $rootFull;$processEvidence.Add($gitVersion);if($gitVersion.stdout.Trim() -cne [string]$approved.git.commandVersion){throw 'Git command version mismatch.'};$versions.git=$gitVersion.stdout.Trim()
  foreach($spec in @(@('node',$node,@('--version'),[string]$Contract.toolchain.node),@('npm',$node,@($npmCli,'--version'),[string]$Contract.toolchain.npm),@('supabaseCli',$node,@($supabaseCli,'--version'),[string]$Contract.toolchain.supabaseCli))){$record=Invoke-OracleStage4R1NativeProcess ([string]$spec[1]) @($spec[2]) $rootFull;$processEvidence.Add($record);$observed=$record.stdout.Trim().TrimStart('v');if($observed -cne [string]$spec[3]){throw "Tool version mismatch: $($spec[0]) $observed"};$versions[$spec[0]]=$observed}
  $dockerVersion=Invoke-OracleStage4R1NativeProcess $docker @('version','--format','{{json .}}') $rootFull;$processEvidence.Add($dockerVersion);$dockerInfo=$dockerVersion.stdout|ConvertFrom-Json
  if([string]$dockerInfo.Client.Version -cne [string]$Contract.toolchain.dockerClient -or [string]$dockerInfo.Server.Version -cne [string]$Contract.toolchain.dockerServer){throw 'Docker client/server version mismatch.'}
  foreach($service in $Contract.provider.services.PSObject.Properties.Value){$record=Invoke-OracleStage4R1NativeProcess $docker @('image','inspect','--format','{{json .RepoDigests}}',[string]$service.image) $rootFull;$processEvidence.Add($record);$parsedDigests=$record.stdout|ConvertFrom-Json;$digests=@();foreach($digest in $parsedDigests){$digests+=[string]$digest};$repository=([string]$service.image)-replace ':[^/:]+$','';if($digests -cnotcontains "$repository@$($service.digest)"){throw "Provider image digest mismatch: $($service.image)"}}
  foreach($port in @($Contract.provider.requiredLoopbackPorts)){if(@(Get-NetTCPConnection -LocalPort ([int]$port) -State Listen -ErrorAction SilentlyContinue).Count -ne 0){throw "Required disposable port is already in use: $port"}}
  $defaultRoutes=@(Get-NetRoute -ErrorAction Stop|Where-Object{$_.DestinationPrefix -in @('0.0.0.0/0','::/0') -and $_.State -eq 'Alive' -and $_.RouteMetric -lt 4294967295})
  if($defaultRoutes.Count -ne 0){throw 'Stage 4 qualification requires host network isolation: an active IPv4 or IPv6 default route remains.'}
  foreach($probe in @(@('ps','-a','--filter','name=oracle-stage4-r1-disposable','--format','{{.ID}}'),@('volume','ls','--filter','name=oracle-stage4-r1-disposable','--format','{{.Name}}'),@('network','ls','--filter','name=oracle-stage4-r1-disposable','--format','{{.Name}}'))){$record=Invoke-OracleStage4R1NativeProcess $docker $probe $rootFull;$processEvidence.Add($record);if(-not[string]::IsNullOrWhiteSpace($record.stdout)){throw 'Pre-existing Stage 4 provider state detected.'}}
  $processEvidenceArray=ConvertTo-OracleStage4R1ProcessEvidenceArray $processEvidence
  [pscustomobject][ordered]@{branch=$branch;preparationCommit=$head;preparationTree=$tree;acceptedCandidateCommit=$Contract.repository.acceptedCandidateCommit;acceptedCandidateTree=$Contract.repository.acceptedCandidateTree;productDrift=@($productDrift);tools=[ordered]@{git=$git;node=$node;npmCli=$npmCli;supabaseCli=$supabaseCli;docker=$docker;powershell=$powershell;taskkill=$taskkill};toolIdentities=$toolIdentities;versions=$versions;docker=[ordered]@{client=$dockerInfo.Client.Version;server=$dockerInfo.Server.Version};historicalBindingsVerified=$Contract.historicalEvidenceBindings.Count;providerImagesVerified=$true;portsAvailable=$true;networkIsolated=$true;providerResidue=0;processEvidence=$processEvidenceArray}
}
