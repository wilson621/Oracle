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
$adapters=@(Get-NetAdapter -InterfaceIndex $index -ErrorAction Stop)
if($adapters.Count-ne1-or-not[string]::Equals([string]$adapters[0].MacAddress,[string]$state.macAddress,[StringComparison]::OrdinalIgnoreCase)-or-not[string]::Equals([string]$adapters[0].Name,[string]$state.interfaceAlias,[StringComparison]::OrdinalIgnoreCase)){throw 'Private-link adapter ownership differs from the captured state.'}
$restoration=Restore-OracleStage4R5PrivateLinkAddresses -InterfaceIndex $index -TargetAddress ([string]$state.targetAddress) -PriorDhcp ([string]$state.priorDhcp) -PriorAddresses @($state.priorAddresses)
Remove-Item -LiteralPath $stateFull -Force
if(Test-Path -LiteralPath $stateFull){throw 'Private-link state record removal failed.'}
[pscustomobject][ordered]@{result='restored';interfaceIndex=$index;dhcp=[string]$restoration.dhcp;staticAddresses=[int]$restoration.staticAddresses;stateRemoved=$true}|ConvertTo-Json -Depth 4
