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
function Assert-OracleStage4R1NoReparseTraversal([string]$Path,[string]$Boundary) {
  $full=[IO.Path]::GetFullPath($Path);$root=[IO.Path]::GetFullPath($Boundary).TrimEnd('\')
  if(-not($full -eq $root -or $full.StartsWith($root+'\',[StringComparison]::OrdinalIgnoreCase))){throw 'Path escapes its governed boundary.'}
  $current=$root;if(Test-Path -LiteralPath $current){if((Get-Item -LiteralPath $current -Force).Attributes -band [IO.FileAttributes]::ReparsePoint){throw "Governed path traverses a reparse point: $current"}}
  $relative=$full.Substring($root.Length).TrimStart('\');foreach($part in @($relative.Split('\')|Where-Object{$_})){ $current=Join-Path $current $part;if(Test-Path -LiteralPath $current){if((Get-Item -LiteralPath $current -Force).Attributes -band [IO.FileAttributes]::ReparsePoint){throw "Governed path traverses a reparse point: $current"}}}
  $full
}
function Resolve-OracleStage4R1Tool([string]$Name) {
  $commands=@(Get-Command $Name -CommandType Application -ErrorAction SilentlyContinue)
  if($commands.Count -ne 1){throw "Required tool did not resolve uniquely: $Name"}
  $path=[IO.Path]::GetFullPath([string]$commands[0].Source);if(-not(Test-Path -LiteralPath $path -PathType Leaf)){throw "Resolved tool is absent: $Name"}
  $path
}
function Invoke-OracleStage4R1PreAuthorityChecks([string]$Root,[object]$Contract,[string]$PreparationCommit,[string]$PreparationTree) {
  $rootFull=[IO.Path]::GetFullPath($Root);$processEvidence=New-Object Collections.Generic.List[object]
  if($PSVersionTable.PSEdition -cne [string]$Contract.toolchain.powershellEdition -or $PSVersionTable.PSVersion.Major -ne [int]$Contract.toolchain.powershellMajor -or -not[Environment]::Is64BitProcess){throw 'Windows PowerShell 5.1 x64 is required.'}
  $git=Resolve-OracleStage4R1Tool 'git.exe';$node=Resolve-OracleStage4R1Tool 'node.exe';$npm=Resolve-OracleStage4R1Tool 'npm.cmd';$docker=Resolve-OracleStage4R1Tool 'docker.exe';$powershell=Resolve-OracleStage4R1Tool 'powershell.exe'
  $npmCli=Join-Path (Split-Path -Parent $npm) 'node_modules\npm\bin\npm-cli.js';if(-not(Test-Path -LiteralPath $npmCli -PathType Leaf)){throw 'Shell-free npm CLI is absent.'}
  $supabaseCli=Join-Path $rootFull 'node_modules\supabase\dist\supabase.js';if(-not(Test-Path -LiteralPath $supabaseCli -PathType Leaf)){throw 'Repository-locked Supabase CLI is absent.'}
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
  foreach($spec in @(@('node',$node,@('--version'),[string]$Contract.toolchain.node),@('npm',$node,@($npmCli,'--version'),[string]$Contract.toolchain.npm),@('supabaseCli',$node,@($supabaseCli,'--version'),[string]$Contract.toolchain.supabaseCli))){$record=Invoke-OracleStage4R1NativeProcess ([string]$spec[1]) @($spec[2]) $rootFull;$processEvidence.Add($record);$observed=$record.stdout.Trim().TrimStart('v');if($observed -cne [string]$spec[3]){throw "Tool version mismatch: $($spec[0]) $observed"};$versions[$spec[0]]=$observed}
  $dockerVersion=Invoke-OracleStage4R1NativeProcess $docker @('version','--format','{{json .}}') $rootFull;$processEvidence.Add($dockerVersion);$dockerInfo=$dockerVersion.stdout|ConvertFrom-Json
  if([string]$dockerInfo.Client.Version -cne [string]$Contract.toolchain.dockerClient -or [string]$dockerInfo.Server.Version -cne [string]$Contract.toolchain.dockerServer){throw 'Docker client/server version mismatch.'}
  foreach($service in $Contract.provider.services.PSObject.Properties.Value){$record=Invoke-OracleStage4R1NativeProcess $docker @('image','inspect','--format','{{json .RepoDigests}}',[string]$service.image) $rootFull;$processEvidence.Add($record);$digests=@($record.stdout|ConvertFrom-Json);$repository=([string]$service.image)-replace ':[^/:]+$','';if($digests -cnotcontains "$repository@$($service.digest)"){throw "Provider image digest mismatch: $($service.image)"}}
  foreach($port in @($Contract.provider.requiredLoopbackPorts)){if(@(Get-NetTCPConnection -LocalPort ([int]$port) -State Listen -ErrorAction SilentlyContinue).Count -ne 0){throw "Required disposable port is already in use: $port"}}
  $defaultRoutes=@(Get-NetRoute -ErrorAction Stop|Where-Object{$_.DestinationPrefix -in @('0.0.0.0/0','::/0') -and $_.State -eq 'Alive' -and $_.RouteMetric -lt 4294967295})
  if($defaultRoutes.Count -ne 0){throw 'Stage 4 qualification requires host network isolation: an active IPv4 or IPv6 default route remains.'}
  foreach($probe in @(@('ps','-a','--filter','name=oracle-stage4-r1-disposable','--format','{{.ID}}'),@('volume','ls','--filter','name=oracle-stage4-r1-disposable','--format','{{.Name}}'),@('network','ls','--filter','name=oracle-stage4-r1-disposable','--format','{{.Name}}'))){$record=Invoke-OracleStage4R1NativeProcess $docker $probe $rootFull;$processEvidence.Add($record);if(-not[string]::IsNullOrWhiteSpace($record.stdout)){throw 'Pre-existing Stage 4 provider state detected.'}}
  [pscustomobject][ordered]@{branch=$branch;preparationCommit=$head;preparationTree=$tree;acceptedCandidateCommit=$Contract.repository.acceptedCandidateCommit;acceptedCandidateTree=$Contract.repository.acceptedCandidateTree;productDrift=@($productDrift);tools=[ordered]@{git=$git;node=$node;npm=$npm;npmCli=$npmCli;supabaseCli=$supabaseCli;docker=$docker;powershell=$powershell};versions=$versions;docker=[ordered]@{client=$dockerInfo.Client.Version;server=$dockerInfo.Server.Version};historicalBindingsVerified=$Contract.historicalEvidenceBindings.Count;providerImagesVerified=$true;portsAvailable=$true;networkIsolated=$true;providerResidue=0;processEvidence=@($processEvidence)}
}