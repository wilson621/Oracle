Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-OracleStage4R5Sha256 {
  param([Parameter(Mandatory=$true)][string]$Path)
  (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Write-OracleStage4R5CreateOnlyJson {
  param([Parameter(Mandatory=$true)][string]$Path,[Parameter(Mandatory=$true)]$Value)
  $parent=Split-Path -Parent $Path
  if(-not(Test-Path -LiteralPath $parent -PathType Container)){[IO.Directory]::CreateDirectory($parent)|Out-Null}
  $bytes=[Text.UTF8Encoding]::new($false).GetBytes((($Value|ConvertTo-Json -Depth 40)+[Environment]::NewLine))
  $stream=[IO.File]::Open($Path,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
  try{$stream.Write($bytes,0,$bytes.Length);$stream.Flush($true)}finally{$stream.Dispose()}
}

function Assert-OracleStage4R5NoReparseTraversal {
  param([Parameter(Mandatory=$true)][string]$Path,[Parameter(Mandatory=$true)][string]$Root)
  $target=[IO.Path]::GetFullPath($Path);$boundary=[IO.Path]::GetFullPath($Root).TrimEnd('\')
  if($target-cne$boundary-and-not$target.StartsWith($boundary+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Path escapes governed root.'}
  $current=$target
  while($current.Length-ge$boundary.Length){if(Test-Path -LiteralPath $current){$item=Get-Item -LiteralPath $current -Force;if(($item.Attributes-band[IO.FileAttributes]::ReparsePoint)-ne0){throw "Reparse traversal is prohibited: $current"}};if($current-ceq$boundary){break};$current=[IO.Path]::GetDirectoryName($current)}
  $target
}

function Get-OracleStage4R5Inventory {
  param([Parameter(Mandatory=$true)][string]$Root)
  $base=[IO.Path]::GetFullPath($Root).TrimEnd('\')
  @(
    Get-ChildItem -LiteralPath $base -Recurse -File -Force|Sort-Object FullName|ForEach-Object{
      [void](Assert-OracleStage4R5NoReparseTraversal $_.FullName $base)
      [pscustomobject][ordered]@{path=$_.FullName.Substring($base.Length).TrimStart('\').Replace('\','/');bytes=[int64]$_.Length;sha256=Get-OracleStage4R5Sha256 $_.FullName}
    }
  )
}

function Assert-OracleStage4R5Transfer {
  param(
    [Parameter(Mandatory=$true)][string]$TransferRoot,
    [Parameter(Mandatory=$true)][string]$ExpectedManifestSha256,
    [Parameter(Mandatory=$true)][string]$ExpectedCustodySha256,
    [Parameter(Mandatory=$true)][string]$ExpectedVerificationSha256
  )
  $root=[IO.Path]::GetFullPath($TransferRoot);[void](Assert-OracleStage4R5NoReparseTraversal $root $root)
  $manifestPath=Join-Path $root 'Oracle.Stage4R5TransferManifest.json';$custodyPath=Join-Path $root 'Oracle.Stage4R5TransferCustody.json';$verificationPath=Join-Path $root 'Oracle.Stage4R5TransferVerification.json'
  foreach($path in @($manifestPath,$custodyPath,$verificationPath)){if(-not(Test-Path -LiteralPath $path -PathType Leaf)){throw "Transfer record is absent: $path"}}
  if((Get-OracleStage4R5Sha256 $manifestPath)-cne$ExpectedManifestSha256.ToLowerInvariant()){throw 'Transfer manifest hash differs.'}
  if((Get-OracleStage4R5Sha256 $custodyPath)-cne$ExpectedCustodySha256.ToLowerInvariant()){throw 'Transfer custody hash differs.'}
  if((Get-OracleStage4R5Sha256 $verificationPath)-cne$ExpectedVerificationSha256.ToLowerInvariant()){throw 'Transfer verification hash differs.'}
  $manifest=Get-Content -Raw -LiteralPath $manifestPath|ConvertFrom-Json;$custody=Get-Content -Raw -LiteralPath $custodyPath|ConvertFrom-Json;$verification=Get-Content -Raw -LiteralPath $verificationPath|ConvertFrom-Json
  if([string]$manifest.contract-cne'oracle.sprint-30-5.stage-4-r5-transfer-manifest'-or-not[bool]$manifest.founderAuthorisedQualificationExecution-or-not[bool]$manifest.singleAttemptOnly-or[int]$manifest.maximumAuthorities-ne1-or[int]$manifest.maximumAttempts-ne1-or[bool]$manifest.retryAuthorised){throw 'Transfer execution authority differs.'}
  if([string]$custody.transferId-cne[string]$manifest.transferId-or[string]$custody.founderGrantId-cne[string]$manifest.founderGrantId-or-not[bool]$custody.createOnly-or-not[bool]$custody.independentVerificationRequired){throw 'Transfer custody differs.'}
  if([string]$verification.result-cne'passed'-or[string]$verification.transferId-cne[string]$manifest.transferId-or[string]$verification.manifestSha256-cne(Get-OracleStage4R5Sha256 $manifestPath)-or[string]$verification.custodySha256-cne(Get-OracleStage4R5Sha256 $custodyPath)-or[bool]$verification.authorityCreated-or[bool]$verification.attemptCreated){throw 'Independent transfer verification differs.'}
  $payloadRoot=Join-Path $root 'payload';$actual=@(Get-OracleStage4R5Inventory $payloadRoot);$expected=@($manifest.payload)
  if($actual.Count-ne$expected.Count){throw 'Transfer payload count differs.'}
  $map=[Collections.Generic.Dictionary[string,object]]::new([StringComparer]::Ordinal)
  foreach($item in $actual){$path='payload/'+[string]$item.path;if($map.ContainsKey($path)){throw 'Transfer payload path is duplicated.'};$map.Add($path,$item)}
  foreach($item in $expected){$path=[string]$item.path;if(-not$map.ContainsKey($path)){throw "Transfer payload path is absent: $path"};$observed=$map[$path];if([int64]$observed.bytes-ne[int64]$item.bytes-or[string]$observed.sha256-cne[string]$item.sha256){throw "Transfer payload differs: $path"}}
  [pscustomobject][ordered]@{result='passed';transferId=[string]$manifest.transferId;founderGrantId=[string]$manifest.founderGrantId;manifest=$manifest;payloadRoot=$payloadRoot;transferRoot=$root;manifestSha256=Get-OracleStage4R5Sha256 $manifestPath;custodySha256=Get-OracleStage4R5Sha256 $custodyPath;verificationSha256=Get-OracleStage4R5Sha256 $verificationPath}
}

function Assert-OracleStage4R5EngineeringRehearsalBundle {
  param([Parameter(Mandatory=$true)][string]$BundleRoot,[Parameter(Mandatory=$true)][string]$ExpectedManifestSha256)
  $root=[IO.Path]::GetFullPath($BundleRoot);[void](Assert-OracleStage4R5NoReparseTraversal $root $root)
  $manifestPath=Join-Path $root 'Oracle.Stage4R5EngineeringRehearsalBundle.json'
  if(-not(Test-Path -LiteralPath $manifestPath -PathType Leaf)){throw 'Engineering rehearsal-bundle manifest is absent.'}
  if((Get-OracleStage4R5Sha256 $manifestPath)-cne$ExpectedManifestSha256.ToLowerInvariant()){throw 'Engineering rehearsal-bundle manifest hash differs.'}
  $manifest=Get-Content -Raw -LiteralPath $manifestPath|ConvertFrom-Json
  if([string]$manifest.contract-cne'oracle.sprint-30-5.stage-4-r5-engineering-rehearsal-bundle'-or[string]$manifest.bundleId-cnotmatch'^engineering-rehearsal-stage4-r5-[0-9]{8}T[0-9]{9}Z-[a-f0-9]{8}$'){throw 'Engineering rehearsal-bundle identity differs.'}
  if([bool]$manifest.transferCreated-or[bool]$manifest.qualificationExecutionPermitted-or[bool]$manifest.authorityCreated-or[bool]$manifest.attemptCreated-or[bool]$manifest.qualificationEvidence){throw 'Engineering rehearsal bundle contains governed execution state.'}
  $payloadRoot=Join-Path $root 'payload';$actual=@(Get-OracleStage4R5Inventory $payloadRoot);$expected=@($manifest.payload)
  if($actual.Count-ne$expected.Count){throw 'Engineering rehearsal-bundle payload count differs.'}
  for($index=0;$index-lt$expected.Count;$index++){if([string]$actual[$index].path-cne[string]$expected[$index].path-or[long]$actual[$index].bytes-ne[long]$expected[$index].bytes-or[string]$actual[$index].sha256-cne[string]$expected[$index].sha256){throw "Engineering rehearsal-bundle payload differs at index $index."}}
  [pscustomobject][ordered]@{
    result='passed';transferId=('NON-TRANSFER-'+[string]$manifest.bundleId);founderGrantId='NO-FOUNDER-GRANT-ENGINEERING-REHEARSAL';manifest=$manifest
    payloadRoot=$payloadRoot;transferRoot=$root;manifestSha256=Get-OracleStage4R5Sha256 $manifestPath
    custodySha256='NO-CUSTODY-NON-TRANSFER';verificationSha256='NO-TRANSFER-VERIFICATION'
  }
}

function Assert-OracleStage4R5Administrator {
  $principal=[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
  if(-not$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){throw 'Stage 4 R5 clean-host execution requires elevated Windows PowerShell.'}
}

function Invoke-OracleStage4R5PrivateLinkAddressReconciliation {
  param(
    [Parameter(Mandatory=$true)][int]$InterfaceIndex,
    [Parameter(Mandatory=$true)][string]$TargetAddress,
    [Parameter(Mandatory=$true)][int]$TargetPrefixLength
  )
  $current=@(Get-NetIPAddress -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue)
  $exact=@($current|Where-Object{[string]$_.IPAddress-ceq$TargetAddress-and[int]$_.PrefixLength-eq$TargetPrefixLength})
  if($exact.Count-gt1){throw 'Exact private-link address is ambiguous.'}

  @(
    $current|Where-Object{
      [string]$_.IPAddress-cne$TargetAddress-or[int]$_.PrefixLength-ne$TargetPrefixLength
    }
  )|Remove-NetIPAddress -Confirm:$false -ErrorAction Stop

  $exact=@(Get-NetIPAddress -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -IPAddress $TargetAddress -ErrorAction SilentlyContinue|Where-Object{[int]$_.PrefixLength-eq$TargetPrefixLength})
  if($exact.Count-gt1){throw 'Exact private-link address is ambiguous.'}
  if($exact.Count-eq0){
    try{
      New-NetIPAddress -InterfaceIndex $InterfaceIndex -IPAddress $TargetAddress -PrefixLength $TargetPrefixLength -AddressFamily IPv4 -Type Unicast -ErrorAction Stop|Out-Null
    }catch{
      $creationFailure=$_
      $exact=@(Get-NetIPAddress -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -IPAddress $TargetAddress -ErrorAction SilentlyContinue|Where-Object{[int]$_.PrefixLength-eq$TargetPrefixLength})
      if($exact.Count-ne1){throw $creationFailure}
    }
  }

  $final=@(Get-NetIPAddress -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -IPAddress $TargetAddress -ErrorAction SilentlyContinue|Where-Object{[int]$_.PrefixLength-eq$TargetPrefixLength})
  if($final.Count-ne1){throw 'Exact private-link address reconciliation failed.'}
  [pscustomobject][ordered]@{result='passed';interfaceIndex=$InterfaceIndex;address=$TargetAddress;prefixLength=$TargetPrefixLength;exactAddressCount=1}
}

function Restore-OracleStage4R5PrivateLinkAddresses {
  param(
    [Parameter(Mandatory=$true)][int]$InterfaceIndex,
    [Parameter(Mandatory=$true)][string]$TargetAddress,
    [Parameter(Mandatory=$true)][ValidateSet('Enabled','Disabled')][string]$PriorDhcp,
    [object[]]$PriorAddresses=@()
  )
  @(Get-NetIPAddress -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -IPAddress $TargetAddress -ErrorAction SilentlyContinue)|Remove-NetIPAddress -Confirm:$false -ErrorAction Stop
  if($PriorDhcp-ceq'Enabled'){
    Set-NetIPInterface -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -Dhcp Enabled -ErrorAction Stop
    $targetResidue=@(Get-NetIPAddress -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -IPAddress $TargetAddress -ErrorAction SilentlyContinue)
    if($targetResidue.Count-ne0){throw 'Private-link target address remains after DHCP restoration.'}
    return [pscustomobject][ordered]@{result='restored';dhcp='Enabled';staticAddresses=0}
  }
  Set-NetIPInterface -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -Dhcp Disabled -ErrorAction Stop
  $desired=[Collections.Generic.Dictionary[string,object]]::new([StringComparer]::Ordinal)
  foreach($address in @($PriorAddresses)){
    if([string]$address.ipAddress-cmatch'^169\.254\.'){continue}
    $key="$([string]$address.ipAddress)/$([int]$address.prefixLength)"
    if($desired.ContainsKey($key)){throw 'Prior private-link address snapshot is ambiguous.'}
    $desired.Add($key,$address)
  }
  $current=@(Get-NetIPAddress -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue)
  @($current|Where-Object{[string]$_.IPAddress-cnotmatch'^169\.254\.'-and-not$desired.ContainsKey("$([string]$_.IPAddress)/$([int]$_.PrefixLength)")})|Remove-NetIPAddress -Confirm:$false -ErrorAction Stop
  foreach($entry in $desired.GetEnumerator()){
    $address=$entry.Value
    $exact=@(Get-NetIPAddress -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -IPAddress ([string]$address.ipAddress) -ErrorAction SilentlyContinue|Where-Object{[int]$_.PrefixLength-eq[int]$address.prefixLength})
    if($exact.Count-gt1){throw 'Restored private-link address is ambiguous.'}
    if($exact.Count-eq0){
      try{New-NetIPAddress -InterfaceIndex $InterfaceIndex -IPAddress ([string]$address.ipAddress) -PrefixLength ([int]$address.prefixLength) -AddressFamily IPv4 -Type Unicast -ErrorAction Stop|Out-Null}
      catch{$creationFailure=$_;$exact=@(Get-NetIPAddress -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -IPAddress ([string]$address.ipAddress) -ErrorAction SilentlyContinue|Where-Object{[int]$_.PrefixLength-eq[int]$address.prefixLength});if($exact.Count-ne1){throw $creationFailure}}
    }
  }
  $final=@(Get-NetIPAddress -InterfaceIndex $InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue|Where-Object{[string]$_.IPAddress-cnotmatch'^169\.254\.'})
  $finalKeys=@($final|ForEach-Object{"$([string]$_.IPAddress)/$([int]$_.PrefixLength)"}|Sort-Object)
  $desiredKeys=@($desired.Keys|Sort-Object)
  if(($finalKeys-join"`n")-cne($desiredKeys-join"`n")){throw 'Private-link static address restoration differs from the captured state.'}
  [pscustomobject][ordered]@{result='restored';dhcp='Disabled';staticAddresses=$desired.Count}
}
function Get-OracleStage4R5DefaultRoutes {
  @(
    Get-NetRoute -ErrorAction Stop|Where-Object{$_.DestinationPrefix-in@('0.0.0.0/0','::/0')-and[string]$_.State-cne'Unreachable'}|ForEach-Object{
      [pscustomobject]@{destinationPrefix=[string]$_.DestinationPrefix;state='active';interfaceIndex=[int]$_.InterfaceIndex;nextHop=[string]$_.NextHop}
    }
  )
}

function Get-OracleStage4R5RelayEntries {
  $netsh=Join-Path $env:SystemRoot 'System32\netsh.exe'
  $text=& $netsh interface portproxy show v4tov4 2>&1|Out-String
  if($LASTEXITCODE-ne0){throw 'Unable to inspect Windows portproxy state.'}
  @($text -split "`r?`n"|Where-Object{$_-match'^\s*(\S+)\s+(\d+)\s+(\S+)\s+(\d+)\s*$'}|ForEach-Object{[pscustomobject]@{listenAddress=$matches[1];listenPort=[int]$matches[2];connectAddress=$matches[3];connectPort=[int]$matches[4]}})
}

function Get-OracleStage4R5CleanHostAdmission {
  param([Parameter(Mandatory=$true)]$Contract)
  Assert-OracleStage4R5Administrator
  if(-not[string]::Equals([string]$env:COMPUTERNAME,[string]$Contract.hosts.qualification.computerName,[StringComparison]::OrdinalIgnoreCase)){throw 'Qualification host identity differs.'}
  if(Test-Path -LiteralPath 'C:\Dev\project-meta'){throw 'Development repository is prohibited on the qualification host.'}
  $present=@();foreach($name in @($Contract.hosts.qualification.prohibitedDependencies)){if($null-ne(Get-Command ($name+'.exe') -ErrorAction SilentlyContinue)-or($name-ceq'npm'-and$null-ne(Get-Command 'npm.cmd' -ErrorAction SilentlyContinue))){$present+=$name}}
  if($present.Count-ne0){throw "Development tooling is prohibited on the qualification host: $($present-join', ')"}
  $system=Get-CimInstance Win32_ComputerSystem -ErrorAction Stop
  if([string]$system.Manufacturer-cne[string]$Contract.hosts.qualification.manufacturer-or[string]$system.Model-cne[string]$Contract.hosts.qualification.model){throw 'Qualification host hardware identity differs.'}
  $addresses=@(Get-NetIPAddress -AddressFamily IPv4 -IPAddress ([string]$Contract.hosts.qualification.address) -ErrorAction SilentlyContinue|Where-Object{[int]$_.PrefixLength-eq[int]$Contract.hosts.qualification.prefixLength})
  if($addresses.Count-ne1){throw 'Exact qualification-host private-link address is absent or ambiguous.'}
  $routes=@(Get-OracleStage4R5DefaultRoutes);if($routes.Count-ne0){throw 'Qualification host has an active IPv4 or IPv6 default route.'}
  $relays=@(Get-OracleStage4R5RelayEntries|Where-Object{$_.listenAddress-ceq'127.0.0.1'-and$_.listenPort-in@(54321,54324)})
  if($relays.Count-ne0){throw 'Qualification-host R5 relay pre-state is not zero.'}
  $packages=@(Get-AppxPackage -Name ([string]$Contract.package.identity) -ErrorAction SilentlyContinue)
  $certificates=@(Get-ChildItem -LiteralPath ([string]$Contract.package.trustStore) -ErrorAction Stop|Where-Object{$_.Thumbprint-ceq[string]$Contract.package.certificateThumbprint})
  $runtime=Join-Path $env:LOCALAPPDATA 'Oracle\runtime-configuration'
  if($packages.Count-ne0-or$certificates.Count-ne0-or(Test-Path -LiteralPath $runtime)){throw 'Qualification package, trust, or runtime-configuration pre-state is not zero.'}
  [pscustomobject][ordered]@{result='passed';computerName=[string]$env:COMPUTERNAME;manufacturer=[string]$system.Manufacturer;model=[string]$system.Model;privateAddress=[string]$Contract.hosts.qualification.address;prefixLength=[int]$Contract.hosts.qualification.prefixLength;interfaceIndex=[int]$addresses[0].InterfaceIndex;activeDefaultRoutes=0;repositoryPresent=$false;developmentToolsPresent=@();packagesPresent=0;certificatesPresent=0;runtimeConfigurationPresent=$false;relaysPresent=0;admittedAtUtc=[DateTime]::UtcNow.ToString('o')}
}

function Copy-OracleStage4R5TransferCreateOnly {
  param([string]$Source,[string]$DestinationParent)
  if(-not(Test-Path -LiteralPath $DestinationParent -PathType Container)){[IO.Directory]::CreateDirectory($DestinationParent)|Out-Null}
  $destination=Join-Path $DestinationParent (Split-Path -Leaf $Source);if(Test-Path -LiteralPath $destination){throw 'Create-only local transfer root already exists.'}
  [IO.Directory]::CreateDirectory($destination)|Out-Null;$sourceRoot=[IO.Path]::GetFullPath($Source).TrimEnd('\')
  foreach($directory in Get-ChildItem -LiteralPath $sourceRoot -Recurse -Directory -Force|Sort-Object FullName){if(($directory.Attributes-band[IO.FileAttributes]::ReparsePoint)-ne0){throw 'Source transfer contains a reparse directory.'};$relative=$directory.FullName.Substring($sourceRoot.Length).TrimStart('\');[IO.Directory]::CreateDirectory((Join-Path $destination $relative))|Out-Null}
  foreach($file in Get-ChildItem -LiteralPath $sourceRoot -Recurse -File -Force|Sort-Object FullName){if(($file.Attributes-band[IO.FileAttributes]::ReparsePoint)-ne0){throw 'Source transfer contains a reparse file.'};$relative=$file.FullName.Substring($sourceRoot.Length).TrimStart('\');[IO.File]::Copy($file.FullName,(Join-Path $destination $relative),$false)}
  $destination
}

function Copy-OracleStage4R5DirectoryCreateOnly {
  param([Parameter(Mandatory=$true)][string]$Source,[Parameter(Mandatory=$true)][string]$Destination)
  $sourceRoot=[IO.Path]::GetFullPath($Source).TrimEnd('\');$destinationRoot=[IO.Path]::GetFullPath($Destination)
  if(-not(Test-Path -LiteralPath $sourceRoot -PathType Container)){throw 'Create-only copy source is absent.'}
  if(Test-Path -LiteralPath $destinationRoot){throw 'Create-only copy destination exists.'}
  [IO.Directory]::CreateDirectory($destinationRoot)|Out-Null
  foreach($directory in Get-ChildItem -LiteralPath $sourceRoot -Recurse -Directory -Force|Sort-Object FullName){if(($directory.Attributes-band[IO.FileAttributes]::ReparsePoint)-ne0){throw 'Create-only copy contains a reparse directory.'};$relative=$directory.FullName.Substring($sourceRoot.Length).TrimStart('\');[IO.Directory]::CreateDirectory((Join-Path $destinationRoot $relative))|Out-Null}
  foreach($file in Get-ChildItem -LiteralPath $sourceRoot -Recurse -File -Force|Sort-Object FullName){if(($file.Attributes-band[IO.FileAttributes]::ReparsePoint)-ne0){throw 'Create-only copy contains a reparse file.'};$relative=$file.FullName.Substring($sourceRoot.Length).TrimStart('\');[IO.File]::Copy($file.FullName,(Join-Path $destinationRoot $relative),$false)}
  $destinationRoot
}
