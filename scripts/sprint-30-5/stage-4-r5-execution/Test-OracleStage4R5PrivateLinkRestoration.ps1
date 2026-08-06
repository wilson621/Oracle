[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')

$script:addresses=@();$script:dhcp=$null;$script:newCalls=0;$script:removeCalls=0;$script:raceOnCreate=$false
function Get-NetIPAddress {
  [CmdletBinding()]param([int]$InterfaceIndex,[string]$AddressFamily,[string]$IPAddress)
  @($script:addresses|Where-Object{(-not$PSBoundParameters.ContainsKey('IPAddress'))-or[string]$_.IPAddress-ceq$IPAddress})
}
function Remove-NetIPAddress {
  [CmdletBinding(SupportsShouldProcess=$true)]param([Parameter(ValueFromPipeline=$true)]$InputObject)
  process{$script:removeCalls++;$candidate=$InputObject;$script:addresses=@($script:addresses|Where-Object{$_-ne$candidate})}
}
function Set-NetIPInterface {[CmdletBinding()]param([int]$InterfaceIndex,[string]$AddressFamily,[string]$Dhcp);$script:dhcp=$Dhcp}
function New-NetIPAddress {
  [CmdletBinding()]param([int]$InterfaceIndex,[string]$IPAddress,[int]$PrefixLength,[string]$AddressFamily,[string]$Type)
  $script:newCalls++;$created=[pscustomobject]@{InterfaceIndex=$InterfaceIndex;IPAddress=$IPAddress;PrefixLength=$PrefixLength};$script:addresses+=,$created;if($script:raceOnCreate){throw 'Instance already exists'};$created
}
function New-Address([string]$Address,[int]$Prefix){[pscustomobject]@{InterfaceIndex=12;IPAddress=$Address;PrefixLength=$Prefix}}
function Reset-Fixture([object[]]$Addresses){$script:addresses=@($Addresses);$script:dhcp=$null;$script:newCalls=0;$script:removeCalls=0;$script:raceOnCreate=$false}
function Assert-Rejected([scriptblock]$Action,[string]$Pattern){try{&$Action;throw 'Hostile restoration fixture was accepted.'}catch{if($_.Exception.Message-ceq'Hostile restoration fixture was accepted.'-or$_.Exception.Message-cnotmatch$Pattern){throw}}}

Reset-Fixture @((New-Address '192.168.70.2' 30),(New-Address '10.0.0.4' 24))
$result=Restore-OracleStage4R5PrivateLinkAddresses -InterfaceIndex 12 -TargetAddress '192.168.70.2' -PriorDhcp Enabled -PriorAddresses @()
if($result.dhcp-cne'Enabled'-or$script:addresses.Count-ne1-or[string]$script:addresses[0].IPAddress-cne'10.0.0.4'){throw 'DHCP restoration differs.'}

$prior=@([pscustomobject]@{ipAddress='10.0.0.5';prefixLength=24})
Reset-Fixture @((New-Address '192.168.70.2' 30),(New-Address '10.0.0.99' 24))
$result=Restore-OracleStage4R5PrivateLinkAddresses -InterfaceIndex 12 -TargetAddress '192.168.70.2' -PriorDhcp Disabled -PriorAddresses $prior
if($result.staticAddresses-ne1-or$script:addresses.Count-ne1-or[string]$script:addresses[0].IPAddress-cne'10.0.0.5'){throw 'Static restoration differs.'}

Reset-Fixture @((New-Address '192.168.70.2' 30));$script:raceOnCreate=$true
[void](Restore-OracleStage4R5PrivateLinkAddresses -InterfaceIndex 12 -TargetAddress '192.168.70.2' -PriorDhcp Disabled -PriorAddresses $prior)
if($script:newCalls-ne1-or$script:addresses.Count-ne1){throw 'Concurrent static restoration was not reconciled.'}

$duplicate=@([pscustomobject]@{ipAddress='10.0.0.5';prefixLength=24},[pscustomobject]@{ipAddress='10.0.0.5';prefixLength=24})
Reset-Fixture @((New-Address '192.168.70.2' 30))
Assert-Rejected {Restore-OracleStage4R5PrivateLinkAddresses -InterfaceIndex 12 -TargetAddress '192.168.70.2' -PriorDhcp Disabled -PriorAddresses $duplicate} 'ambiguous'

[pscustomobject][ordered]@{
  result='passed'
  classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','PRIVATE-LINK RESTORATION TEST')
  dhcpRestored=$true
  staticSnapshotRestored=$true
  extraneousAddressRemoved=$true
  concurrentCreationAcceptedAfterVerification=$true
  ambiguousSnapshotRejected=$true
  authorityCreated=$false
  attemptCreated=$false
}|ConvertTo-Json -Depth 5
