[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$contract = Get-Content -Raw -LiteralPath (Join-Path $root "Oracle.Stage5R2CleanHostContract.json") | ConvertFrom-Json
$fixture = Join-Path $root ([string]$contract.cleanHostFixture.executable)
if (-not (Test-Path -LiteralPath $fixture -PathType Leaf)) { throw "Precompiled clean-host fixture is absent." }
$port = 55431
$process = Start-Process -FilePath $fixture -ArgumentList @("--port", "$port") -PassThru -WindowStyle Hidden
try {
  $deadline = [DateTime]::UtcNow.AddSeconds(15)
  do {
    try { $health = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health" -Method Get -TimeoutSec 2; break } catch { Start-Sleep -Milliseconds 100 }
  } while ([DateTime]::UtcNow -lt $deadline)
  if ($null -eq $health -or [string]$health.result -cne "passed") { throw "Fixture health admission failed." }
  $preflight = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$port/auth/v1/token?grant_type=password" -Method Options -Headers @{
    Origin = "http://127.0.0.1:4545"
    "Access-Control-Request-Method" = "POST"
    "Access-Control-Request-Headers" = "apikey,content-type,x-client-info,x-supabase-api-version"
  }
  $allowedHeaders = ([string]$preflight.Headers["Access-Control-Allow-Headers"]).Split(',') | ForEach-Object { $_.Trim().ToLowerInvariant() }
  foreach ($requiredHeader in @("apikey", "content-type", "x-client-info", "x-supabase-api-version")) {
    if ($allowedHeaders -cnotcontains $requiredHeader) { throw "Fixture preflight omitted required browser header: $requiredHeader" }
  }  $body = @{ email = [string]$contract.cleanHostFixture.fixtureEmail; password = [string]$contract.cleanHostFixture.fixturePassword } | ConvertTo-Json
  $session = Invoke-RestMethod -Uri "http://127.0.0.1:$port/auth/v1/token?grant_type=password" -Method Post -ContentType "application/json" -Body $body
  if ([string]::IsNullOrWhiteSpace([string]$session.access_token) -or [string]$session.user.email_confirmed_at -eq "") { throw "Fixture confirmed session was not returned." }
  $user = Invoke-RestMethod -Uri "http://127.0.0.1:$port/auth/v1/user" -Headers @{ Authorization = "Bearer $($session.access_token)" } -Method Get
  if ([string]$user.id -cne [string]$session.user.id) { throw "Fixture user identity differs." }
  $badCredentialRejected = $false
  try { Invoke-RestMethod -Uri "http://127.0.0.1:$port/auth/v1/token?grant_type=password" -Method Post -ContentType "application/json" -Body (@{email="wrong@example.invalid";password="wrong"}|ConvertTo-Json) | Out-Null } catch { $badCredentialRejected = $true }
  if (-not $badCredentialRejected) { throw "Fixture accepted unbound credentials." }
  $unsupportedRejected = $false
  try { Invoke-RestMethod -Uri "http://127.0.0.1:$port/storage/v1/object" -Method Get | Out-Null } catch { $unsupportedRejected = $true }
  if (-not $unsupportedRejected) { throw "Fixture did not fail closed for unsupported endpoint." }
  [ordered]@{ result="passed"; classification="NON-QUALIFICATION ENGINEERING VALIDATION"; loopbackOnly=$true; browserPreflightPassed=$true; confirmedSession=$true; badCredentialRejected=$true; unsupportedEndpointRejected=$true } | ConvertTo-Json
} finally {
  if ($null -ne $process -and -not $process.HasExited) { Stop-Process -Id $process.Id -Force -ErrorAction Stop; $process.WaitForExit() }
}
