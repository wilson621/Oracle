[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')

$script:addresses=@()
$script:newCalls=0
$script:removeCalls=0
$script:raceOnCreate=$false
$script:failCreate=$false

function Get-NetIPAddress {
  [CmdletBinding()]
  param([int]$InterfaceIndex,[string]$AddressFamily,[string]$IPAddress)
  @($script:addresses|Where-Object{(-not$PSBoundParameters.ContainsKey('IPAddress'))-or[string]$_.IPAddress-ceq$IPAddress})
}

function Remove-NetIPAddress {
  [CmdletBinding(SupportsShouldProcess=$true)]
  param([Parameter(ValueFromPipeline=$true)]$InputObject)
  process{
    $script:removeCalls++
    $candidate=$InputObject
    $script:addresses=@($script:addresses|Where-Object{$_-ne$candidate})
  }
}

function New-NetIPAddress {
  [CmdletBinding()]
  param([int]$InterfaceIndex,[string]$IPAddress,[int]$PrefixLength,[string]$AddressFamily,[string]$Type)
  $script:newCalls++
  if($script:raceOnCreate){
    $script:addresses+=,[pscustomobject]@{InterfaceIndex=$InterfaceIndex;IPAddress=$IPAddress;PrefixLength=$PrefixLength}
    throw 'Instance MSFT_NetIPAddress already exists'
  }
  if($script:failCreate){throw 'Address creation failed'}
  $created=[pscustomobject]@{InterfaceIndex=$InterfaceIndex;IPAddress=$IPAddress;PrefixLength=$PrefixLength}
  $script:addresses+=,$created
  $created
}

function Reset-Fixture([object[]]$Addresses){
  $script:addresses=@($Addresses)
  $script:newCalls=0
  $script:removeCalls=0
  $script:raceOnCreate=$false
  $script:failCreate=$false
}

function New-FixtureAddress([string]$Address,[int]$PrefixLength){
  [pscustomobject]@{InterfaceIndex=12;IPAddress=$Address;PrefixLength=$PrefixLength}
}

function Assert-Rejected([scriptblock]$Action,[string]$Pattern){
  try{&$Action;throw 'Hostile fixture was accepted.'}catch{if($_.Exception.Message-ceq'Hostile fixture was accepted.'-or$_.Exception.Message-cnotmatch$Pattern){throw}}
}

Reset-Fixture @((New-FixtureAddress '192.168.70.2' 24),(New-FixtureAddress '169.254.1.2' 16))
[void](Invoke-OracleStage4R5PrivateLinkAddressReconciliation -InterfaceIndex 12 -TargetAddress '192.168.70.2' -TargetPrefixLength 30)
if($script:newCalls-ne1-or$script:removeCalls-ne2-or$script:addresses.Count-ne1-or[int]$script:addresses[0].PrefixLength-ne30){throw 'Mismatched-prefix reconciliation differs.'}

Reset-Fixture @((New-FixtureAddress '192.168.70.2' 30))
[void](Invoke-OracleStage4R5PrivateLinkAddressReconciliation -InterfaceIndex 12 -TargetAddress '192.168.70.2' -TargetPrefixLength 30)
if($script:newCalls-ne0-or$script:removeCalls-ne0-or$script:addresses.Count-ne1){throw 'Idempotent exact-address reconciliation differs.'}

Reset-Fixture @()
$script:raceOnCreate=$true
[void](Invoke-OracleStage4R5PrivateLinkAddressReconciliation -InterfaceIndex 12 -TargetAddress '192.168.70.2' -TargetPrefixLength 30)
if($script:newCalls-ne1-or$script:addresses.Count-ne1){throw 'Concurrent exact-address creation was not reconciled.'}

Reset-Fixture @((New-FixtureAddress '192.168.70.2' 30),(New-FixtureAddress '192.168.70.2' 30))
Assert-Rejected {Invoke-OracleStage4R5PrivateLinkAddressReconciliation -InterfaceIndex 12 -TargetAddress '192.168.70.2' -TargetPrefixLength 30} 'ambiguous'

Reset-Fixture @()
$script:failCreate=$true
Assert-Rejected {Invoke-OracleStage4R5PrivateLinkAddressReconciliation -InterfaceIndex 12 -TargetAddress '192.168.70.2' -TargetPrefixLength 30} 'Address creation failed'

[pscustomobject][ordered]@{
  result='passed'
  classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','PRIVATE-LINK ADDRESS RECONCILIATION TEST')
  mismatchedPrefixReconciled=$true
  exactAddressIdempotent=$true
  concurrentExactCreationAcceptedAfterVerification=$true
  duplicateExactAddressRejected=$true
  unverifiedCreationFailureRejected=$true
  authorityCreated=$false
  attemptCreated=$false
}|ConvertTo-Json -Depth 5
