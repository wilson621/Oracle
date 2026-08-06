Set-StrictMode -Version Latest

function Get-OracleStage4R5MandatoryMember {
  param([object]$Object, [string]$Name, [string]$Context)
  $property = if ($null -eq $Object) { $null } else { $Object.PSObject.Properties[$Name] }
  if ($null -eq $property) { throw "$Context missing mandatory member: $Name" }
  $property.Value
}

function Test-OracleStage4R5PrivateIpv4Address {
  param([Parameter(Mandatory = $true)][string]$Address)
  $parsed = $null
  if (-not [Net.IPAddress]::TryParse($Address, [ref]$parsed) -or $parsed.AddressFamily -ne [Net.Sockets.AddressFamily]::InterNetwork) { return $false }
  $bytes = $parsed.GetAddressBytes()
  ($bytes[0] -eq 10) -or
    ($bytes[0] -eq 172 -and $bytes[1] -ge 16 -and $bytes[1] -le 31) -or
    ($bytes[0] -eq 192 -and $bytes[1] -eq 168)
}

function Assert-OracleStage4R5NoDefaultRoutes {
  param([Parameter(Mandatory = $true)][object[]]$Routes, [Parameter(Mandatory = $true)][string]$HostRole)
  $active = @($Routes | Where-Object {
    ([string](Get-OracleStage4R5MandatoryMember $_ "destinationPrefix" "$HostRole route") -in @("0.0.0.0/0", "::/0")) -and
    [string](Get-OracleStage4R5MandatoryMember $_ "state" "$HostRole route") -ceq "active"
  })
  if ($active.Count -ne 0) { throw "$HostRole has an active IPv4 or IPv6 default route." }
  [pscustomobject][ordered]@{ hostRole = $HostRole; activeDefaultRoutes = 0; result = "passed" }
}

function Assert-OracleStage4R5PrivateLink {
  param(
    [Parameter(Mandatory = $true)][string]$ProviderAddress,
    [Parameter(Mandatory = $true)][string]$QualificationAddress,
    [Parameter(Mandatory = $true)][int]$PrefixLength
  )
  if (-not (Test-OracleStage4R5PrivateIpv4Address $ProviderAddress) -or -not (Test-OracleStage4R5PrivateIpv4Address $QualificationAddress)) { throw "Both qualification-cell addresses must be private IPv4 addresses." }
  if ($ProviderAddress -ceq $QualificationAddress) { throw "Provider and qualification hosts must have distinct addresses." }
  if ($PrefixLength -lt 24 -or $PrefixLength -gt 30) { throw "Qualification-cell prefix length is outside the admitted /24-/30 boundary." }
  $provider = [Net.IPAddress]::Parse($ProviderAddress).GetAddressBytes()
  $qualification = [Net.IPAddress]::Parse($QualificationAddress).GetAddressBytes()
  $mask = [uint32]::MaxValue -shl (32 - $PrefixLength)
  [Array]::Reverse($provider); [Array]::Reverse($qualification)
  $providerNetwork = [BitConverter]::ToUInt32($provider, 0) -band $mask
  $qualificationNetwork = [BitConverter]::ToUInt32($qualification, 0) -band $mask
  if ($providerNetwork -ne $qualificationNetwork) { throw "Provider and qualification hosts are not on the same admitted private link." }
  [pscustomobject][ordered]@{ result = "passed"; providerAddress = $ProviderAddress; qualificationAddress = $QualificationAddress; prefixLength = $PrefixLength }
}

function Assert-OracleStage4R5RelayPlan {
  param([Parameter(Mandatory = $true)][object[]]$Relays, [Parameter(Mandatory = $true)][string]$ProviderAddress)
  if (-not (Test-OracleStage4R5PrivateIpv4Address $ProviderAddress)) { throw "Relay provider address is not private IPv4." }
  $expected = @(
    "127.0.0.1|54321|$ProviderAddress|54321",
    "127.0.0.1|54324|$ProviderAddress|54324"
  )
  $actual = @($Relays | ForEach-Object {
    $listenAddress = [string](Get-OracleStage4R5MandatoryMember $_ "listenAddress" "Relay")
    $listenPort = [int](Get-OracleStage4R5MandatoryMember $_ "listenPort" "Relay")
    $connectAddress = [string](Get-OracleStage4R5MandatoryMember $_ "connectAddress" "Relay")
    $connectPort = [int](Get-OracleStage4R5MandatoryMember $_ "connectPort" "Relay")
    "$listenAddress|$listenPort|$connectAddress|$connectPort"
  } | Sort-Object)
  if (($actual -join "`n") -cne (($expected | Sort-Object) -join "`n")) { throw "Qualification-host relay plan differs from the exact provider and Mailpit mappings." }
  [pscustomobject][ordered]@{ result = "passed"; relayCount = 2; providerAddress = $ProviderAddress }
}

function Assert-OracleStage4R5CleanHostShape {
  param([Parameter(Mandatory = $true)]$Record, [Parameter(Mandatory = $true)]$Contract)
  foreach ($name in @("computerName", "model", "repositoryPresent", "developmentToolsPresent")) { [void](Get-OracleStage4R5MandatoryMember $Record $name "Clean-host record") }
  if (-not [string]::Equals([string]$Record.computerName, [string]$Contract.hostArchitecture.qualificationHost.identity, [StringComparison]::OrdinalIgnoreCase)) { throw "Qualification host identity differs." }
  if ([string]$Record.model -cne [string]$Contract.hostArchitecture.qualificationHost.model) { throw "Qualification host model differs." }
  if ([bool]$Record.repositoryPresent) { throw "Qualification host contains a development repository." }
  if (@($Record.developmentToolsPresent).Count -ne 0) { throw "Qualification host contains prohibited development tooling." }
  [pscustomobject][ordered]@{ result = "passed"; computerName = [string]$Record.computerName; model = [string]$Record.model }
}
