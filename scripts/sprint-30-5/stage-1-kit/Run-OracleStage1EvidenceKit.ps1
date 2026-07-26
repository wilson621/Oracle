$ErrorActionPreference = "Stop"
$kitRoot = [IO.Path]::GetFullPath($PSScriptRoot)
$parent = Split-Path -Parent $kitRoot
$manifestPath = Join-Path $kitRoot "kit-manifest.json"
$sourceRecordPath = Join-Path $parent "Oracle.Stage1EvidenceKit.transfer-source.json"
$archivePath = Join-Path $parent "Oracle.Stage1EvidenceKit.zip"
$outputDirectory = Join-Path $kitRoot "evidence-output"

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "The kit manifest is missing."
}
if (-not (Test-Path -LiteralPath $sourceRecordPath)) {
  throw "Keep Oracle.Stage1EvidenceKit.transfer-source.json beside the extracted kit folder."
}
if (-not (Test-Path -LiteralPath $archivePath)) {
  throw "Keep Oracle.Stage1EvidenceKit.zip beside the extracted kit folder."
}
if (Test-Path -LiteralPath $outputDirectory) {
  throw "Evidence output already exists. Use a fresh extraction for each run."
}

$principal = [Security.Principal.WindowsPrincipal](
  [Security.Principal.WindowsIdentity]::GetCurrent()
)
if (-not $principal.IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)) {
  throw "Run Start-OracleStage1EvidenceKit.cmd and approve the Windows administrator prompt."
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$manifestFailures = @()
foreach ($file in $manifest.files) {
  $candidate = [IO.Path]::GetFullPath((Join-Path $kitRoot $file.path))
  if (-not $candidate.StartsWith($kitRoot + [IO.Path]::DirectorySeparatorChar)) {
    $manifestFailures += "$($file.path): outside kit"
    continue
  }
  if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
    $manifestFailures += "$($file.path): missing"
    continue
  }
  $actual = (Get-FileHash -LiteralPath $candidate -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actual -ne $file.sha256) {
    $manifestFailures += "$($file.path): hash mismatch"
  }
}
if ($manifestFailures.Count -gt 0) {
  throw "Kit integrity verification failed: $($manifestFailures -join '; ')"
}

$sourceRecord = Get-Content -LiteralPath $sourceRecordPath -Raw | ConvertFrom-Json
$archiveHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($archiveHash -ne $sourceRecord.sha256) {
  throw "Transferred archive hash does not match the development-PC source hash."
}

$transferMethod = Read-Host "How was the kit transferred? (for example: USB drive)"
$developmentPcIPv4 = Read-Host "Enter the development PC IPv4 address shown by Codex"
if ([string]::IsNullOrWhiteSpace($transferMethod)) {
  throw "A transfer method is required."
}
if ($developmentPcIPv4 -notmatch "^(\d{1,3}\.){3}\d{1,3}$") {
  throw "A valid development-PC IPv4 address is required."
}

New-Item -ItemType Directory -Path $outputDirectory | Out-Null
$baselinePath = Join-Path $outputDirectory "windows-baseline.json"
$gpuPath = Join-Path $outputDirectory "electron-gpu-admission.json"
$networkPath = Join-Path $outputDirectory "laptop-route-admission.json"

function Invoke-EvidenceProcess {
  param([string]$FilePath, [string[]]$Arguments)
  $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments `
    -Wait -PassThru -NoNewWindow
  return $process.ExitCode
}

$baselineExit = Invoke-EvidenceProcess "powershell.exe" @(
  "-NoProfile", "-ExecutionPolicy", "Bypass",
  "-File", "`"$(Join-Path $kitRoot 'Collect-OracleStage1Baseline.ps1')`"",
  "-OutputPath", "`"$baselinePath`""
)
$gpuExit = Invoke-EvidenceProcess `
  (Join-Path $kitRoot "gpu-probe\OracleStage1GpuProbe.exe") `
  @("`"--output=$gpuPath`"")
$networkExit = Invoke-EvidenceProcess "powershell.exe" @(
  "-NoProfile", "-ExecutionPolicy", "Bypass",
  "-File", "`"$(Join-Path $kitRoot 'Test-OracleStage1LaptopRoute.ps1')`"",
  "-DevelopmentPcIPv4", $developmentPcIPv4,
  "-OutputPath", "`"$networkPath`""
)

$gpuEvidencePresent = (
  (Test-Path -LiteralPath $gpuPath -PathType Leaf) -and
  (Test-Path -LiteralPath "$gpuPath.sha256.txt" -PathType Leaf)
)

$executionResult = if (
  $baselineExit -eq 0 -and
  $gpuExit -eq 0 -and
  $gpuEvidencePresent -and
  $networkExit -eq 0
) { "passed" } else { "failed" }

$transferEvidence = [ordered]@{
  schemaVersion = 1
  contract = "oracle.sprint-30-5.artifact-transfer"
  contractVersion = 1
  collectedAt = (Get-Date).ToUniversalTime().ToString("o")
  result = $executionResult
  source = [ordered]@{
    filename = $sourceRecord.filename
    sha256 = $sourceRecord.sha256
  }
  transferMethod = $transferMethod
  destination = [ordered]@{
    filename = Split-Path -Leaf $archivePath
    sha256 = $archiveHash
    matchesSource = $archiveHash -eq $sourceRecord.sha256
  }
  kitManifestVerified = $true
  execution = [ordered]@{
    baselineExitCode = $baselineExit
    gpuExitCode = $gpuExit
    gpuEvidencePresent = $gpuEvidencePresent
    networkExitCode = $networkExit
  }
  removal = "pending-confirmation-script"
}
$transferPath = Join-Path $outputDirectory "artifact-transfer.json"
$transferEvidence | ConvertTo-Json -Depth 8 |
  Set-Content -LiteralPath $transferPath -Encoding UTF8

$returnArchive = Join-Path $parent "Oracle.Stage1EvidenceReturn.zip"
if (Test-Path -LiteralPath $returnArchive) {
  Remove-Item -LiteralPath $returnArchive -Force
}
Compress-Archive -Path (Join-Path $outputDirectory "*") `
  -DestinationPath $returnArchive -CompressionLevel Optimal
$returnHash = (Get-FileHash -LiteralPath $returnArchive -Algorithm SHA256).Hash.ToLowerInvariant()
"$returnHash  $(Split-Path -Leaf $returnArchive)" |
  Set-Content -LiteralPath "$returnArchive.sha256.txt" -Encoding ASCII

Copy-Item -LiteralPath (Join-Path $kitRoot "Confirm-OracleStage1Removal.ps1") `
  -Destination (Join-Path $parent "Confirm-OracleStage1Removal.ps1") -Force
Copy-Item -LiteralPath (Join-Path $kitRoot "Confirm-OracleStage1Removal.cmd") `
  -Destination (Join-Path $parent "Confirm-OracleStage1Removal.cmd") -Force

Write-Host ""
Write-Host "Evidence collection result: $executionResult"
Write-Host "Return file: $returnArchive"
Write-Host "Return SHA-256: $returnHash"
Write-Host "Transfer the return ZIP and hash file back to the development PC."
Write-Host "Then run Confirm-OracleStage1Removal.cmd."
if ($executionResult -ne "passed") { exit 1 }
