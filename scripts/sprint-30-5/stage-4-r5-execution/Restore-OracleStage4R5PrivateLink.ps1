[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$StatePath)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')
Assert-OracleStage4R5Administrator
$stateFull=[IO.Path]::GetFullPath($StatePath);if(-not(Test-Path -LiteralPath $stateFull -PathType Leaf)){throw 'Private-link state record is absent.'}
$state=Get-Content -Raw -LiteralPath $stateFull|ConvertFrom-Json
if([string]$state.contract-cne'oracle.sprint-30-5.stage-4-r5-private-link-state'-or-not[string]::Equals([string]$state.computerName,[string]$env:COMPUTERNAME,[StringComparison]::OrdinalIgnoreCase)){throw 'Private-link state record is inadmissible.'}
$index=[int]$state.interfaceIndex
Get-NetIPAddress -InterfaceIndex $index -AddressFamily IPv4 -ErrorAction SilentlyContinue|Where-Object{$_.IPAddress-ceq[string]$state.targetAddress}|Remove-NetIPAddress -Confirm:$false -ErrorAction Stop
if([string]$state.priorDhcp-ceq'Enabled'){Set-NetIPInterface -InterfaceIndex $index -AddressFamily IPv4 -Dhcp Enabled -ErrorAction Stop}else{foreach($address in @($state.priorAddresses)){if([string]$address.ipAddress-notmatch'^169\.254\.'){New-NetIPAddress -InterfaceIndex $index -IPAddress ([string]$address.ipAddress) -PrefixLength ([int]$address.prefixLength) -AddressFamily IPv4 -Type Unicast -ErrorAction Stop|Out-Null}}}
Remove-Item -LiteralPath $stateFull -Force
if(Test-Path -LiteralPath $stateFull){throw 'Private-link state record removal failed.'}
[pscustomobject][ordered]@{result='restored';interfaceIndex=$index;stateRemoved=$true}|ConvertTo-Json -Depth 4
