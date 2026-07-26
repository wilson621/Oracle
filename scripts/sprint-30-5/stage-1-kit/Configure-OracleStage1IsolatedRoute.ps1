param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("Start", "VerifyNegative", "Stop")]
  [string]$Action,
  [ValidatePattern("^(\d{1,3}\.){3}\d{1,3}$")]
  [string]$QualificationLaptopIPv4,
  [string]$EvidenceDirectory = ".artifacts\sprint-30-5\stage-1\network"
)

$ErrorActionPreference = "Stop"
$group = "Oracle Sprint 30.5 Stage 1 Temporary Isolation"
$evidenceRoot = [IO.Path]::GetFullPath($EvidenceDirectory)
New-Item -ItemType Directory -Path $evidenceRoot -Force | Out-Null

function Assert-Administrator {
  $principal = [Security.Principal.WindowsPrincipal](
    [Security.Principal.WindowsIdentity]::GetCurrent()
  )
  if (-not $principal.IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
  )) {
    throw "Run PowerShell as Administrator."
  }
}

function ConvertTo-IPv4Number {
  param([string]$Address)
  $bytes = [Net.IPAddress]::Parse($Address).GetAddressBytes()
  return (
    ([uint64]$bytes[0] -shl 24) -bor
    ([uint64]$bytes[1] -shl 16) -bor
    ([uint64]$bytes[2] -shl 8) -bor
    [uint64]$bytes[3]
  )
}

function ConvertFrom-IPv4Number {
  param([uint64]$Value)
  return "{0}.{1}.{2}.{3}" -f (
    ($Value -shr 24) -band 255
  ), (
    ($Value -shr 16) -band 255
  ), (
    ($Value -shr 8) -band 255
  ), (
    $Value -band 255
  )
}

function Write-Evidence {
  param([string]$Name, [hashtable]$Body)
  $file = Join-Path $evidenceRoot $Name
  $Body | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $file -Encoding UTF8
  $hash = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  $Name" | Set-Content -LiteralPath "$file.sha256.txt" -Encoding ASCII
}

Assert-Administrator

if ($Action -eq "Start") {
  if ([string]::IsNullOrWhiteSpace($QualificationLaptopIPv4)) {
    throw "QualificationLaptopIPv4 is required for Start."
  }
  if (Get-NetFirewallRule -Group $group -ErrorAction SilentlyContinue) {
    throw "Temporary Stage 1 firewall rules already exist."
  }

  $allowed = ConvertTo-IPv4Number $QualificationLaptopIPv4
  $blockedRanges = @()
  if ($allowed -gt 0) {
    $blockedRanges += "0.0.0.0-$(ConvertFrom-IPv4Number ($allowed - 1))"
  }
  if ($allowed -lt [uint64]::MaxValue -and $allowed -lt 4294967295) {
    $blockedRanges += "$(ConvertFrom-IPv4Number ($allowed + 1))-255.255.255.255"
  }

  New-NetFirewallRule -DisplayName "Oracle Stage 1 Auth allow laptop" `
    -Group $group -Direction Inbound -Action Allow -Protocol TCP `
    -LocalPort 54321 -RemoteAddress $QualificationLaptopIPv4 `
    -Profile Any -EdgeTraversalPolicy Block | Out-Null
  New-NetFirewallRule -DisplayName "Oracle Stage 1 Auth block other IPv4" `
    -Group $group -Direction Inbound -Action Block -Protocol TCP `
    -LocalPort 54321 -RemoteAddress $blockedRanges `
    -Profile Any -EdgeTraversalPolicy Block | Out-Null
  New-NetFirewallRule -DisplayName "Oracle Stage 1 Auth block IPv6" `
    -Group $group -Direction Inbound -Action Block -Protocol TCP `
    -LocalPort 54321 -RemoteAddress "::/0" `
    -Profile Any -EdgeTraversalPolicy Block | Out-Null
  New-NetFirewallRule -DisplayName "Oracle Stage 1 DB and Mailpit block" `
    -Group $group -Direction Inbound -Action Block -Protocol TCP `
    -LocalPort 54322,54324 -RemoteAddress Any `
    -Profile Any -EdgeTraversalPolicy Block | Out-Null

  $rules = @(Get-NetFirewallRule -Group $group)
  Write-Evidence "firewall-start.json" ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.temporary-firewall"
    contractVersion = 1
    action = "start"
    collectedAt = (Get-Date).ToUniversalTime().ToString("o")
    result = if ($rules.Count -eq 4) { "passed" } else { "failed" }
    qualificationLaptopIPv4 = $QualificationLaptopIPv4
    authPort = 54321
    blockedPorts = @(54322, 54324)
    rulesCreated = $rules.Count
  })
  Write-Host "Temporary rules active. Run the laptop evidence kit now."
  exit
}

if ($Action -eq "VerifyNegative") {
  if (-not (Get-NetFirewallRule -Group $group -ErrorAction SilentlyContinue)) {
    throw "Temporary Stage 1 firewall rules are not active."
  }
  $result = & docker run --rm curlimages/curl:8.17.0 `
    --connect-timeout 4 --fail --silent `
    http://host.docker.internal:54321/auth/v1/health 2>&1
  $blocked = $LASTEXITCODE -ne 0
  Write-Evidence "non-allowlisted-route.json" ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.non-allowlisted-route"
    contractVersion = 1
    collectedAt = (Get-Date).ToUniversalTime().ToString("o")
    result = if ($blocked) { "passed" } else { "failed" }
    source = "disposable-docker-bridge"
    authReachable = -not $blocked
    commandOutput = [string]$result
  })
  if (-not $blocked) { throw "A non-allowlisted Docker source reached Auth." }
  Write-Host "Non-allowlisted route was blocked."
  exit
}

if ($Action -eq "Stop") {
  Get-NetFirewallRule -Group $group -ErrorAction SilentlyContinue |
    Remove-NetFirewallRule
  $remaining = @(Get-NetFirewallRule -Group $group -ErrorAction SilentlyContinue)
  Write-Evidence "firewall-stop.json" ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.temporary-firewall"
    contractVersion = 1
    action = "stop"
    collectedAt = (Get-Date).ToUniversalTime().ToString("o")
    result = if ($remaining.Count -eq 0) { "passed" } else { "failed" }
    rulesRemaining = $remaining.Count
  })
  if ($remaining.Count -ne 0) { throw "Temporary firewall rules remain." }
  Write-Host "Temporary Stage 1 firewall rules removed."
}
