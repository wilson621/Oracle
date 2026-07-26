param(
  [string]$KitRoot = $PSScriptRoot
)

$ErrorActionPreference = "Stop"
$resolvedKitRoot = [IO.Path]::GetFullPath($KitRoot)
$outputDirectory = Join-Path $resolvedKitRoot "evidence-output"
$expectedGpuPath = Join-Path $outputDirectory "electron-gpu-admission.json"
$parent = Split-Path -Parent $resolvedKitRoot
$recoveryDirectory = Join-Path $parent "Oracle.Stage1GpuEvidenceRecovery"
$recoveryArchive = Join-Path $parent "Oracle.Stage1GpuEvidenceRecovery.zip"

function Get-FileSha256 {
  param([string]$Path)
  return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-RecordedSha256 {
  param([string]$Path)
  $content = Get-Content -LiteralPath $Path -Raw
  $match = [regex]::Match($content, "(?i)[a-f0-9]{64}")
  if (-not $match.Success) {
    throw "No SHA-256 value was found in $(Split-Path -Leaf $Path)."
  }
  return $match.Value.ToLowerInvariant()
}

$candidates = [ordered]@{
  "expected-output" = $expectedGpuPath
}
$whitespace = [regex]::Match($expectedGpuPath, "\s")
if ($whitespace.Success) {
  $candidates["truncated-output"] = $expectedGpuPath.Substring(
    0,
    $whitespace.Index
  )
}
$candidates["probe-default"] = Join-Path (
  Join-Path $resolvedKitRoot "gpu-probe"
) "gpu-admission.json"

$validCandidate = $null
$candidateClass = $null
foreach ($entry in $candidates.GetEnumerator()) {
  $candidate = [IO.Path]::GetFullPath($entry.Value)
  $candidateHash = "$candidate.sha256.txt"
  if (
    -not (Test-Path -LiteralPath $candidate -PathType Leaf) -or
    -not (Test-Path -LiteralPath $candidateHash -PathType Leaf)
  ) {
    continue
  }

  $evidence = Get-Content -LiteralPath $candidate -Raw | ConvertFrom-Json
  if (
    $evidence.contract -ne "oracle.sprint-30-5.electron-gpu-admission" -or
    $evidence.contractVersion -ne 1 -or
    $evidence.versions.electron -ne "39.8.10" -or
    $evidence.result -ne "passed"
  ) {
    continue
  }

  $actualHash = Get-FileSha256 $candidate
  $recordedHash = Get-RecordedSha256 $candidateHash
  if ($actualHash -ne $recordedHash) {
    throw "A GPU evidence candidate was found, but its SHA-256 does not match."
  }

  $validCandidate = $candidate
  $candidateClass = $entry.Key
  break
}

if (-not $validCandidate) {
  Write-Host "No valid recoverable GPU evidence was found."
  Write-Host "Do not rerun the full Stage 1 evidence kit."
  exit 2
}

if (Test-Path -LiteralPath $recoveryDirectory) {
  throw "A GPU recovery directory already exists. Stop and report this to Codex."
}
if (Test-Path -LiteralPath $recoveryArchive) {
  throw "A GPU recovery archive already exists. Stop and report this to Codex."
}

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
Copy-Item -LiteralPath $validCandidate -Destination $expectedGpuPath
$gpuHash = Get-FileSha256 $expectedGpuPath
"$gpuHash  electron-gpu-admission.json" |
  Set-Content -LiteralPath "$expectedGpuPath.sha256.txt" -Encoding ASCII

New-Item -ItemType Directory -Path $recoveryDirectory | Out-Null
Copy-Item -LiteralPath $expectedGpuPath -Destination (
  Join-Path $recoveryDirectory "electron-gpu-admission.json"
)
Copy-Item -LiteralPath "$expectedGpuPath.sha256.txt" -Destination (
  Join-Path $recoveryDirectory "electron-gpu-admission.json.sha256.txt"
)

$recoveryRecord = [ordered]@{
  schemaVersion = 1
  contract = "oracle.sprint-30-5.gpu-evidence-recovery"
  contractVersion = 1
  collectedAt = (Get-Date).ToUniversalTime().ToString("o")
  result = "passed"
  recoveryMethod = $candidateClass
  gpuEvidence = [ordered]@{
    contract = "oracle.sprint-30-5.electron-gpu-admission"
    contractVersion = 1
    result = "passed"
    electronVersion = "39.8.10"
    sha256 = $gpuHash
  }
  rerunPerformed = $false
  preservedEvidence = @(
    "windows-baseline.json",
    "laptop-route-admission.json",
    "artifact-transfer.json"
  )
}
$recoveryRecordPath = Join-Path $recoveryDirectory "gpu-evidence-recovery.json"
$recoveryRecord | ConvertTo-Json -Depth 8 |
  Set-Content -LiteralPath $recoveryRecordPath -Encoding UTF8
$recoveryRecordHash = Get-FileSha256 $recoveryRecordPath
"$recoveryRecordHash  gpu-evidence-recovery.json" |
  Set-Content -LiteralPath "$recoveryRecordPath.sha256.txt" -Encoding ASCII

Compress-Archive -Path (Join-Path $recoveryDirectory "*") `
  -DestinationPath $recoveryArchive -CompressionLevel Optimal
$archiveHash = Get-FileSha256 $recoveryArchive
"$archiveHash  Oracle.Stage1GpuEvidenceRecovery.zip" |
  Set-Content -LiteralPath "$recoveryArchive.sha256.txt" -Encoding ASCII

Write-Host ""
Write-Host "GPU evidence recovered without rerunning any qualification."
Write-Host "Return file: $recoveryArchive"
Write-Host "Return SHA-256: $archiveHash"
