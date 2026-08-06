[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][ValidateSet('Provider','Qualification')][string]$Role,
  [Parameter(Mandatory=$true)][string]$StatePath
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R5ExecutionContract.json')|ConvertFrom-Json
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')
Assert-OracleStage4R5Administrator
$stateFull=[IO.Path]::GetFullPath($StatePath);if(Test-Path -LiteralPath $stateFull){throw 'Create-only private-link state record already exists.'}
$expected=if($Role-ceq'Provider'){$contract.hosts.provider}else{$contract.hosts.qualification}
if(-not[string]::Equals([string]$env:COMPUTERNAME,[string]$expected.computerName,[StringComparison]::OrdinalIgnoreCase)){throw 'Private-link host identity differs.'}
if($Role-ceq'Provider'){$adapters=@(Get-NetAdapter -Physical -Name ([string]$expected.adapterName) -ErrorAction Stop|Where-Object{[string]::Equals([string]$_.MacAddress,[string]$expected.adapterMac,[StringComparison]::OrdinalIgnoreCase)})}else{$adapters=@(Get-NetAdapter -Physical -ErrorAction Stop|Where-Object{$_.Status-ceq'Up'-and$_.HardwareInterface-and$_.Name-cnotmatch'Wi-?Fi|Wireless'})}
if($adapters.Count-ne1){throw 'Exactly one admissible private-link Ethernet adapter was not found.'}
$adapter=$adapters[0];$priorAddresses=@(Get-NetIPAddress -InterfaceIndex ([int]$adapter.ifIndex) -AddressFamily IPv4 -ErrorAction SilentlyContinue|ForEach-Object{[ordered]@{ipAddress=[string]$_.IPAddress;prefixLength=[int]$_.PrefixLength;prefixOrigin=[string]$_.PrefixOrigin;suffixOrigin=[string]$_.SuffixOrigin}})
$priorDhcp=[string](Get-NetIPInterface -InterfaceIndex ([int]$adapter.ifIndex) -AddressFamily IPv4 -ErrorAction Stop).Dhcp
$record=[ordered]@{schemaVersion='1.0.0';contract='oracle.sprint-30-5.stage-4-r5-private-link-state';role=$Role;computerName=[string]$env:COMPUTERNAME;interfaceIndex=[int]$adapter.ifIndex;interfaceAlias=[string]$adapter.Name;macAddress=[string]$adapter.MacAddress;priorDhcp=$priorDhcp;priorAddresses=$priorAddresses;targetAddress=[string]$expected.address;targetPrefixLength=[int]$expected.prefixLength;createdAtUtc=[DateTime]::UtcNow.ToString('o')}
Write-OracleStage4R5CreateOnlyJson $stateFull $record
Set-NetIPInterface -InterfaceIndex ([int]$adapter.ifIndex) -AddressFamily IPv4 -Dhcp Disabled -ErrorAction Stop
Get-NetIPAddress -InterfaceIndex ([int]$adapter.ifIndex) -AddressFamily IPv4 -ErrorAction SilentlyContinue|Where-Object{$_.IPAddress-cne[string]$expected.address}|Remove-NetIPAddress -Confirm:$false -ErrorAction Stop
$target=@(Get-NetIPAddress -InterfaceIndex ([int]$adapter.ifIndex) -AddressFamily IPv4 -IPAddress ([string]$expected.address) -ErrorAction SilentlyContinue|Where-Object{[int]$_.PrefixLength-eq[int]$expected.prefixLength})
if($target.Count-eq0){New-NetIPAddress -InterfaceIndex ([int]$adapter.ifIndex) -IPAddress ([string]$expected.address) -PrefixLength ([int]$expected.prefixLength) -AddressFamily IPv4 -Type Unicast -ErrorAction Stop|Out-Null}
$routes=@(Get-NetRoute -DestinationPrefix @('0.0.0.0/0','::/0') -ErrorAction SilentlyContinue|Where-Object{$_.State-ceq'Alive'})
if($routes.Count-ne0){throw 'Private-link initialization completed, but an active default route remains. Disconnect all Internet-bearing links before continuing.'}
[pscustomobject][ordered]@{result='passed';role=$Role;interfaceAlias=[string]$adapter.Name;address=[string]$expected.address;prefixLength=[int]$expected.prefixLength;activeDefaultRoutes=0;statePath=$stateFull}|ConvertTo-Json -Depth 6
