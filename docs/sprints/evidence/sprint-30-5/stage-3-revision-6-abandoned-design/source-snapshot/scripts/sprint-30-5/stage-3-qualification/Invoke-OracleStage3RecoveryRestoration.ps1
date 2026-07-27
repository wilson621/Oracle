[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("VerifyOnly", "Restore")]
  [string]$Operation,

  [Parameter(Mandatory = $true)]
  [string]$TransferRoot,

  [Parameter(Mandatory = $false)]
  [string]$FounderAuthorityId
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$transferRoot = [IO.Path]::GetFullPath($TransferRoot)
$kitRoot = $PSScriptRoot
$contractPath = Join-Path $kitRoot "Oracle.Stage3QualificationContract.json"
$contract = Get-Content -LiteralPath $contractPath -Raw | ConvertFrom-Json
$archivePath = Join-Path $transferRoot $contract.candidate.archiveFilename
$workRoot = Join-Path $transferRoot "stage-3-recovery-work"
$expandedRoot = Join-Path $workRoot "stage-2"
$releaseRoot = Join-Path $expandedRoot "release"
$msixPath = Join-Path $releaseRoot $contract.candidate.msixFilename
$certificatePath = Join-Path $workRoot "Oracle.Stage2.PublicTest.cer"
$evidenceRoot = Join-Path $transferRoot "stage-3-evidence"
$restorationEvidence = Join-Path $evidenceRoot "00a-recovery-restoration.json"
$thumbprint = [string]$contract.candidate.certificateThumbprint
$publisher = [string]$contract.candidate.publisher

function Get-Sha256 {
  param([Parameter(Mandatory = $true)][string]$Path)
  return (
    Get-FileHash -LiteralPath $Path -Algorithm SHA256
  ).Hash.ToLowerInvariant()
}

function Assert-Elevated {
  $principal = [Security.Principal.WindowsPrincipal](
    [Security.Principal.WindowsIdentity]::GetCurrent()
  )
  if (-not $principal.IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
  )) {
    throw "Recovery restoration requires elevated Windows PowerShell."
  }
}

function Assert-CreateOnlyPath {
  param([Parameter(Mandatory = $true)][string]$Path)
  if (
    (Test-Path -LiteralPath $Path) -or
    (Test-Path -LiteralPath "$Path.sha256.txt")
  ) {
    throw "Recovery restoration evidence already exists. Refusing overwrite."
  }
}

function Write-CreateOnlyEvidence {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][object]$Value
  )
  Assert-CreateOnlyPath -Path $Path
  New-Item -ItemType Directory -Path (Split-Path -Parent $Path) -Force |
    Out-Null
  $name = Split-Path -Leaf $Path
  $token = [Guid]::NewGuid().ToString("N")
  $temporaryPath = Join-Path (Split-Path -Parent $Path) ".$name.$token.tmp"
  $temporarySidecar = "$temporaryPath.sha256.tmp"
  try {
    $encoding = New-Object System.Text.UTF8Encoding($true)
    [IO.File]::WriteAllText(
      $temporaryPath,
      (($Value | ConvertTo-Json -Depth 12) + [Environment]::NewLine),
      $encoding
    )
    $hash = Get-Sha256 -Path $temporaryPath
    [IO.File]::WriteAllText(
      $temporarySidecar,
      "$hash  $name$([Environment]::NewLine)",
      [Text.Encoding]::ASCII
    )
    Assert-CreateOnlyPath -Path $Path
    [IO.File]::Move($temporarySidecar, "$Path.sha256.txt")
    try {
      [IO.File]::Move($temporaryPath, $Path)
    } catch {
      Remove-Item -LiteralPath "$Path.sha256.txt" `
        -Force -ErrorAction SilentlyContinue
      throw
    }
  } finally {
    Remove-Item -LiteralPath $temporaryPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $temporarySidecar -Force -ErrorAction SilentlyContinue
  }
}

function Get-PhysicalCertificateMatches {
  $matches = @()
  $store = New-Object System.Security.Cryptography.X509Certificates.X509Store(
    "TrustedPeople",
    [Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine
  )
  try {
    $store.Open(
      [Security.Cryptography.X509Certificates.OpenFlags]::ReadOnly
    )
    $matches = @(
      $store.Certificates |
        Where-Object { $_.Thumbprint -eq $thumbprint }
    )
  } finally {
    $store.Close()
  }
  return $matches
}

function Assert-HistoricalEvidence {
  param(
    [Parameter(Mandatory = $true)][string]$Directory,
    [Parameter(Mandatory = $true)][string]$Filename,
    [Parameter(Mandatory = $true)][string]$ExpectedSha256
  )
  $path = Join-Path `
    (Join-Path $transferRoot "immutable-history\$Directory") `
    $Filename
  $sidecar = "$path.sha256.txt"
  if (
    -not (Test-Path -LiteralPath $path -PathType Leaf) -or
    -not (Test-Path -LiteralPath $sidecar -PathType Leaf)
  ) {
    throw "Required immutable historical evidence is missing: $Filename"
  }
  $actual = Get-Sha256 -Path $path
  $declared = (
    (Get-Content -LiteralPath $sidecar -Raw).Trim() -split "\s+"
  )[0].ToLowerInvariant()
  if (
    $actual -ne $declared -or
    $actual -ne $ExpectedSha256.ToLowerInvariant()
  ) {
    throw "Immutable historical evidence binding is invalid: $Filename"
  }
}

if ($env:COMPUTERNAME -ine [string]$contract.host.deviceName) {
  throw "Wrong host for the governed recovery restoration."
}
$system = Get-CimInstance Win32_ComputerSystem
if (
  [string]$system.Manufacturer -ine [string]$contract.host.manufacturer -or
  [string]$system.Model -ine [string]$contract.host.model
) {
  throw "Recovery restoration host manufacturer/model is invalid."
}
Assert-HistoricalEvidence `
  -Directory "revision-4" `
  -Filename ([string]$contract.recovery.requiredRevision4Evidence.filename) `
  -ExpectedSha256 (
    [string]$contract.recovery.requiredRevision4Evidence.sha256
  )
Assert-HistoricalEvidence `
  -Directory "revision-5-failed-attempt" `
  -Filename ([string]$contract.recovery.revision5Evidence.preExecutionFilename) `
  -ExpectedSha256 (
    [string]$contract.recovery.revision5Evidence.preExecutionSha256
  )
Assert-HistoricalEvidence `
  -Directory "revision-5-failed-attempt" `
  -Filename ([string]$contract.recovery.revision5Evidence.diagnosticFilename) `
  -ExpectedSha256 (
    [string]$contract.recovery.revision5Evidence.diagnosticSha256
  )
if (-not (Test-Path -LiteralPath $archivePath -PathType Leaf)) {
  throw "Frozen Stage 2 archive is missing."
}
if ((Get-Sha256 -Path $archivePath) -ne [string]$contract.candidate.archiveSha256) {
  throw "Frozen Stage 2 archive hash mismatch."
}
if ($null -ne (Get-AppxPackage -Name $contract.candidate.packageIdentity -ErrorAction SilentlyContinue)) {
  throw "Oracle is already installed. Restoration refuses ambiguous state."
}
if (@(Get-PhysicalCertificateMatches).Count -ne 0) {
  throw "The approved certificate is already trusted. Restoration refuses ambiguous state."
}
Assert-CreateOnlyPath -Path $restorationEvidence

if ($Operation -eq "VerifyOnly") {
  Write-Host "RECOVERY RESTORATION VERIFY-ONLY PRECHECK PASSED"
  exit 0
}

Assert-Elevated
if (
  [string]::IsNullOrWhiteSpace($FounderAuthorityId) -or
  $FounderAuthorityId -ne
    [string]$contract.recovery.restoration.requiredFounderAuthorityId
) {
  throw "The exact separate Founder restoration authority is required."
}
if (Test-Path -LiteralPath $workRoot) {
  throw "Recovery work directory already exists. Refusing overwrite."
}

$record = [ordered]@{
  schemaVersion = 1
  contract = "oracle.sprint-30-5.stage-3-recovery-restoration"
  revision = 6
  result = "failed"
  recordedAtUtc = [DateTime]::UtcNow.ToString("o")
  founderAuthorityId = $FounderAuthorityId
  archiveSha256 = Get-Sha256 -Path $archivePath
  certificateImported = $false
  packageInstalled = $false
  automaticRestoration = $false
  failureMessage = $null
}

function Invoke-RestorationRollback {
  $restoredPackage = Get-AppxPackage `
    -Name $contract.candidate.packageIdentity `
    -ErrorAction SilentlyContinue
  if ($null -ne $restoredPackage) {
    Remove-AppxPackage -Package $restoredPackage.PackageFullName `
      -ErrorAction SilentlyContinue
  }
  $store = New-Object System.Security.Cryptography.X509Certificates.X509Store(
    "TrustedPeople",
    [Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine
  )
  try {
    $store.Open(
      [Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite
    )
    @(
      $store.Certificates |
        Where-Object { $_.Thumbprint -eq $thumbprint }
    ) | ForEach-Object { $store.Remove($_) }
  } finally {
    $store.Close()
  }
  return [ordered]@{
    packagePresent = $null -ne (
      Get-AppxPackage `
        -Name $contract.candidate.packageIdentity `
        -ErrorAction SilentlyContinue
    )
    certificatePhysicalMatchCount = @(Get-PhysicalCertificateMatches).Count
  }
}

$operationError = $null
try {
  New-Item -ItemType Directory -Path $workRoot | Out-Null
  Expand-Archive -LiteralPath $archivePath -DestinationPath $expandedRoot
  if ((Get-Sha256 -Path $msixPath) -ne [string]$contract.candidate.msixSha256) {
    throw "Frozen MSIX hash mismatch."
  }

  Add-Type -AssemblyName System.Security
  $manifestPath = Join-Path $releaseRoot "oracle-release-manifest.json"
  $content = [Security.Cryptography.Pkcs.ContentInfo]::new(
    [IO.File]::ReadAllBytes($manifestPath)
  )
  $cms = [Security.Cryptography.Pkcs.SignedCms]::new($content, $true)
  $cms.Decode([IO.File]::ReadAllBytes("$manifestPath.p7s"))
  $cms.CheckSignature($true)
  if ($cms.SignerInfos.Count -ne 1) {
    throw "Release Manifest must have exactly one signer."
  }
  $certificate = $cms.SignerInfos[0].Certificate
  if (
    $certificate.Subject -ne $publisher -or
    $certificate.Thumbprint -ne $thumbprint -or
    $certificate.HasPrivateKey -or
    (
      $certificate.NotAfter.ToUniversalTime() - [DateTime]::UtcNow
    ).TotalMinutes -lt
      [int]$contract.startupObservation.minimumCertificateMinutesRemaining
  ) {
    throw "Derived public certificate identity or validity is invalid."
  }
  [IO.File]::WriteAllBytes(
    $certificatePath,
    $certificate.Export(
      [Security.Cryptography.X509Certificates.X509ContentType]::Cert
    )
  )

  $store = New-Object System.Security.Cryptography.X509Certificates.X509Store(
    "TrustedPeople",
    [Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine
  )
  try {
    $store.Open(
      [Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite
    )
    $store.Add($certificate)
  } finally {
    $store.Close()
  }
  $record.certificateImported = $true
  if (@(Get-PhysicalCertificateMatches).Count -ne 1) {
    throw "Bounded certificate trust was not established exactly once."
  }

  Add-AppxPackage -Path $msixPath
  $package = Get-AppxPackage `
    -Name $contract.candidate.packageIdentity `
    -ErrorAction SilentlyContinue
  if (
    $null -eq $package -or
    [string]$package.PackageFullName -ne
      [string]$contract.candidate.packageFullName -or
    [string]$package.Status -ine "Ok"
  ) {
    throw "Exact frozen package restoration could not be verified."
  }
  $executablePath = Join-Path `
    ([string]$package.InstallLocation) `
    ([string]$contract.candidate.installedExecutable)
  if (
    -not (Test-Path -LiteralPath $executablePath -PathType Leaf) -or
    (Get-Sha256 -Path $executablePath) -ne
      [string]$contract.candidate.installedExecutableSha256
  ) {
    throw "Restored Oracle executable binding is invalid."
  }
  $signature = Get-AuthenticodeSignature -LiteralPath $executablePath
  if (
    [string]$signature.Status -ne "Valid" -or
    $null -eq $signature.SignerCertificate -or
    [string]$signature.SignerCertificate.Subject -ne $publisher -or
    [string]$signature.SignerCertificate.Thumbprint -ne $thumbprint
  ) {
    throw "Restored Oracle executable signature is invalid."
  }
  $record.packageInstalled = $true
  $record.result = "passed"
} catch {
  $record.failureMessage = [string]$_.Exception.Message
  $record.rollback = Invoke-RestorationRollback
  $operationError = $_
}

try {
  Write-CreateOnlyEvidence -Path $restorationEvidence -Value $record
} catch {
  if ([string]$record.result -eq "passed") {
    Invoke-RestorationRollback | Out-Null
  }
  throw
}
if ($null -ne $operationError) {
  throw $operationError.Exception
}
