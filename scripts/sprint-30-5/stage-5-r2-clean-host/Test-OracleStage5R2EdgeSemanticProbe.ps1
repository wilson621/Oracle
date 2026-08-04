[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$site = Join-Path $root "Oracle.Stage5SemanticProbeFixtureSite.exe"
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
if ([string]::IsNullOrWhiteSpace([string]$edge)) { throw "Engineering Edge executable is absent." }
$output = Join-Path ([IO.Path]::GetTempPath()) ("oracle-stage5-r2-semantic-" + [Guid]::NewGuid().ToString("N") + ".json")
$process = Start-Process -FilePath $site -ArgumentList @("--port", "55432") -PassThru -WindowStyle Hidden
try {
  $deadline=[DateTime]::UtcNow.AddSeconds(10);do{try{$response=Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:55432/auth" -TimeoutSec 1;break}catch{Start-Sleep -Milliseconds 100}}while([DateTime]::UtcNow-lt$deadline)
  if($null-eq$response-or[int]$response.StatusCode-ne200){throw "Semantic self-test site did not start."}
  & (Join-Path $root "Invoke-OracleStage5R2EdgeSemanticProbe.ps1") -EdgePath $edge -WebOrigin "http://127.0.0.1:55432/" -OutputPath $output -DebugPort 55433 | Out-Null
  if (-not (Test-Path -LiteralPath $output -PathType Leaf)) { throw "Windows-only semantic probe failed." }
  $record = Get-Content -Raw -LiteralPath $output | ConvertFrom-Json
  if ([string]$record.result -cne "passed" -or @($record.routes).Count -ne 8) { throw "Semantic probe result is incomplete." }
  [ordered]@{ result="passed"; classification="NON-QUALIFICATION ENGINEERING VALIDATION"; routeCount=@($record.routes).Count; nodeUsed=$false; repositoryUsed=$false } | ConvertTo-Json
} finally {
  if ($null-ne$process-and-not$process.HasExited){Stop-Process -Id $process.Id -Force -ErrorAction Stop;$process.WaitForExit()}
  if (Test-Path -LiteralPath $output) { Remove-Item -LiteralPath $output -Force -ErrorAction Stop }
}
