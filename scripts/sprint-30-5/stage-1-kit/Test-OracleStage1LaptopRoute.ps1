param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern("^(\d{1,3}\.){3}\d{1,3}$")]
  [string]$DevelopmentPcIPv4,
  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"

function Test-TcpPort {
  param([string]$Address, [int]$Port, [int]$TimeoutMilliseconds = 2500)
  $client = [Net.Sockets.TcpClient]::new()
  try {
    $operation = $client.ConnectAsync($Address, $Port)
    if (-not $operation.Wait($TimeoutMilliseconds)) { return $false }
    return $client.Connected
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

$authReachable = Test-TcpPort $DevelopmentPcIPv4 54321
$postgresReachable = Test-TcpPort $DevelopmentPcIPv4 54322
$mailpitReachable = Test-TcpPort $DevelopmentPcIPv4 54324
$healthStatus = $null
if ($authReachable) {
  try {
    $response = Invoke-WebRequest `
      -Uri "http://${DevelopmentPcIPv4}:54321/auth/v1/health" `
      -UseBasicParsing -TimeoutSec 5
    $healthStatus = [int]$response.StatusCode
  } catch {
    $healthStatus = 0
  }
}

$result = if (
  $authReachable -and
  $healthStatus -eq 200 -and
  -not $postgresReachable -and
  -not $mailpitReachable
) { "passed" } else { "failed" }

$evidence = [ordered]@{
  schemaVersion = 1
  contract = "oracle.sprint-30-5.laptop-route-admission"
  contractVersion = 1
  collectedAt = (Get-Date).ToUniversalTime().ToString("o")
  result = $result
  developmentPcIPv4 = $DevelopmentPcIPv4
  auth = [ordered]@{
    port = 54321
    reachable = $authReachable
    healthStatus = $healthStatus
  }
  postgres = [ordered]@{
    port = 54322
    reachable = $postgresReachable
    expected = "inaccessible"
  }
  mailpit = [ordered]@{
    port = 54324
    reachable = $mailpitReachable
    expected = "inaccessible"
  }
  productionUsed = $false
}

$file = [IO.Path]::GetFullPath($OutputPath)
New-Item -ItemType Directory -Path (Split-Path -Parent $file) -Force | Out-Null
$evidence | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $file -Encoding UTF8
$hash = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()
"$hash  $(Split-Path -Leaf $file)" |
  Set-Content -LiteralPath "$file.sha256.txt" -Encoding ASCII
if ($result -ne "passed") { exit 1 }
