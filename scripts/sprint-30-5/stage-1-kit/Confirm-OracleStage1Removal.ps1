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

$expectedGpuPath = Join-Path $kitDirectory (
  "evidence-output\electron-gpu-admission.json"
)
$whitespace = [regex]::Match($expectedGpuPath, "\s")
$misplacedGpuPath = if ($whitespace.Success) {
  $expectedGpuPath.Substring(0, $whitespace.Index)
} else {
  $null
}
$misplacedGpuFound = $false
$misplacedGpuRemoved = $true
if (
  $misplacedGpuPath -and
  (Test-Path -LiteralPath $misplacedGpuPath -PathType Leaf)
) {
  $misplacedGpuFound = $true
  $misplacedHashPath = "$misplacedGpuPath.sha256.txt"
  if (-not (Test-Path -LiteralPath $misplacedHashPath -PathType Leaf)) {
    throw "The misplaced GPU evidence hash is missing; refusing cleanup."
  }
  $misplacedEvidence = Get-Content -LiteralPath $misplacedGpuPath -Raw |
    ConvertFrom-Json
  if (
    $misplacedEvidence.contract -ne
      "oracle.sprint-30-5.electron-gpu-admission" -or
    $misplacedEvidence.contractVersion -ne 1
  ) {
    throw "The deterministic misplaced file is not Oracle GPU evidence."
  }
  $actualHash = (
    Get-FileHash -LiteralPath $misplacedGpuPath -Algorithm SHA256
  ).Hash.ToLowerInvariant()
  $hashText = Get-Content -LiteralPath $misplacedHashPath -Raw
  $recordedHash = (
    [regex]::Match($hashText, "(?i)[a-f0-9]{64}")
  ).Value.ToLowerInvariant()
  if ($actualHash -ne $recordedHash) {
    throw "The misplaced GPU evidence hash does not match; refusing cleanup."
  }
  Remove-Item -LiteralPath $misplacedGpuPath -Force
  Remove-Item -LiteralPath $misplacedHashPath -Force
  $misplacedGpuRemoved = (
    -not (Test-Path -LiteralPath $misplacedGpuPath) -and
    -not (Test-Path -LiteralPath $misplacedHashPath)
  )
}

Get-Process -Name "OracleStage1GpuProbe" -ErrorAction SilentlyContinue |
  Stop-Process -Force
if (Test-Path -LiteralPath $kitDirectory) {
  Remove-Item -LiteralPath $kitDirectory -Recurse -Force
}
$removed = -not (Test-Path -LiteralPath $kitDirectory)
$gpuProbeRunning = [bool](
  Get-Process -Name "OracleStage1GpuProbe" -ErrorAction SilentlyContinue
)
$result = if (
  $removed -and
  -not $gpuProbeRunning -and
  $misplacedGpuRemoved
) { "passed" } else { "failed" }
$evidence = [ordered]@{
  schemaVersion = 1
  contract = "oracle.sprint-30-5.artifact-removal"
  contractVersion = 1
  collectedAt = (Get-Date).ToUniversalTime().ToString("o")
  result = $result
  kitDirectory = $kitDirectory
  kitDirectoryRemoved = $removed
  gpuProbeProcessRunning = $gpuProbeRunning
  misplacedGpuEvidenceFound = $misplacedGpuFound
  misplacedGpuEvidenceRemoved = $misplacedGpuRemoved
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
if ($result -ne "passed") { exit 1 }
