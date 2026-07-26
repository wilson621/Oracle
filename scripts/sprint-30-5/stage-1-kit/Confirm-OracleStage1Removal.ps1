$ErrorActionPreference = "Stop"
$parent = [IO.Path]::GetFullPath($PSScriptRoot)
$kitDirectory = Join-Path $parent "Oracle.Stage1EvidenceKit"
$expectedParent = [IO.Path]::GetFullPath((Split-Path -Parent $kitDirectory))
if ($expectedParent -ne $parent) {
  throw "Cleanup target escaped the transfer directory."
}
if ((Split-Path -Leaf $kitDirectory) -ne "Oracle.Stage1EvidenceKit") {
  throw "Unexpected cleanup target."
}

Get-Process -Name "OracleStage1GpuProbe" -ErrorAction SilentlyContinue |
  Stop-Process -Force
if (Test-Path -LiteralPath $kitDirectory) {
  Remove-Item -LiteralPath $kitDirectory -Recurse -Force
}
$removed = -not (Test-Path -LiteralPath $kitDirectory)
$evidence = [ordered]@{
  schemaVersion = 1
  contract = "oracle.sprint-30-5.artifact-removal"
  contractVersion = 1
  collectedAt = (Get-Date).ToUniversalTime().ToString("o")
  result = if ($removed) { "passed" } else { "failed" }
  kitDirectory = $kitDirectory
  kitDirectoryRemoved = $removed
  gpuProbeProcessRunning = [bool](Get-Process -Name "OracleStage1GpuProbe" -ErrorAction SilentlyContinue)
  developmentToolsInstalledByKit = $false
  oracleInstalledByKit = $false
}
$output = Join-Path $parent "Oracle.Stage1Cleanup.json"
$evidence | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $output -Encoding UTF8
$hash = (Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash.ToLowerInvariant()
"$hash  $(Split-Path -Leaf $output)" |
  Set-Content -LiteralPath "$output.sha256.txt" -Encoding ASCII
Write-Host "Cleanup result: $($evidence.result)"
Write-Host "Transfer Oracle.Stage1Cleanup.json and its hash file back to the development PC."
if (-not $removed) { exit 1 }
