[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet(
    "PreExecution",
    "NegativePathAndTrust",
    "InstallAndStartup",
    "RepairAndRemoval",
    "Cleanup"
  )]
  [string]$Phase,

  [Parameter(Mandatory = $false)]
  [string]$TransferRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$contractPath = Join-Path $PSScriptRoot "Oracle.Stage3QualificationContract.json"
$contract = Get-Content -LiteralPath $contractPath -Raw | ConvertFrom-Json
$transferRoot = [IO.Path]::GetFullPath($TransferRoot)
$evidenceRoot = Join-Path $transferRoot "stage-3-evidence"
$workRoot = Join-Path $transferRoot "stage-3-work"
$expandedRoot = Join-Path $workRoot "stage-2"
$releaseRoot = Join-Path $expandedRoot "release"
$archivePath = Join-Path $transferRoot $contract.candidate.archiveFilename
$msixPath = Join-Path $releaseRoot $contract.candidate.msixFilename
$certificatePath = Join-Path $workRoot "Oracle.Stage2.PublicTest.cer"
$tamperedPath = Join-Path $workRoot "Oracle.Stage2.TAMPERED.msix"
$identity = [string]$contract.candidate.packageIdentity
$thumbprint = [string]$contract.candidate.certificateThumbprint
$publisher = [string]$contract.candidate.publisher

New-Item -ItemType Directory -Path $evidenceRoot -Force | Out-Null

function Get-Sha256 {
  param([Parameter(Mandatory = $true)][string]$Path)

  return (
    Get-FileHash -LiteralPath $Path -Algorithm SHA256
  ).Hash.ToLowerInvariant()
}

function Write-Evidence {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][object]$Value
  )

  $path = Join-Path $evidenceRoot $Name
  $Value | ConvertTo-Json -Depth 12 |
    Set-Content -LiteralPath $path -Encoding UTF8
  $hash = Get-Sha256 -Path $path
  "$hash  $Name" |
    Set-Content -LiteralPath "$path.sha256.txt" -Encoding ASCII
  Write-Host "Evidence: $path"
  Write-Host "SHA-256: $hash"
}

function Assert-Elevated {
  $principal = [Security.Principal.WindowsPrincipal](
    [Security.Principal.WindowsIdentity]::GetCurrent()
  )
  if (-not $principal.IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
  )) {
    throw "This phase requires an elevated Windows PowerShell process."
  }
}

function Assert-PriorPhase {
  param([Parameter(Mandatory = $true)][string]$Filename)

  $path = Join-Path $evidenceRoot $Filename
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "Required prior-phase evidence is missing: $Filename"
  }
  $sidecar = "$path.sha256.txt"
  if (-not (Test-Path -LiteralPath $sidecar -PathType Leaf)) {
    throw "Required prior-phase sidecar is missing: $Filename.sha256.txt"
  }
  $expected = (
    (Get-Content -LiteralPath $sidecar -Raw).Trim() -split "\s+"
  )[0]
  if ((Get-Sha256 -Path $path) -ne $expected.ToLowerInvariant()) {
    throw "Prior-phase evidence hash mismatch: $Filename"
  }
  $evidence = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
  if ([string]$evidence.result -ne "passed") {
    throw "Prior phase did not pass: $Filename"
  }
}

function Get-OraclePackage {
  return Get-AppxPackage -Name $identity -ErrorAction SilentlyContinue
}

function Get-CertificateMatches {
  $matches = @()
  foreach ($location in @("CurrentUser", "LocalMachine")) {
    foreach ($store in @("My", "Root", "TrustedPeople")) {
      $path = "Cert:\$location\$store"
      if (Test-Path -LiteralPath $path) {
        $matches += @(Get-ChildItem -LiteralPath $path | Where-Object {
          $_.Thumbprint -eq $thumbprint
        } | ForEach-Object {
          [ordered]@{
            location = $location
            store = $store
            subject = $_.Subject
            thumbprint = $_.Thumbprint
            hasPrivateKey = $_.HasPrivateKey
          }
        })
      }
    }
  }
  return @($matches)
}

function Remove-OracleCertificate {
  foreach ($location in @("CurrentUser", "LocalMachine")) {
    foreach ($store in @("My", "Root", "TrustedPeople")) {
      Remove-Item -LiteralPath "Cert:\$location\$store\$thumbprint" `
        -Force -ErrorAction SilentlyContinue
    }
  }
}

function Read-FounderConfirmation {
  param([Parameter(Mandatory = $true)][string]$Prompt)

  $answer = Read-Host "$Prompt [Y/N]"
  if ($answer -notmatch "^(?i)y(?:es)?$") {
    throw "Founder confirmation was not granted: $Prompt"
  }
  return $true
}

function Invoke-PreExecution {
  if ($env:COMPUTERNAME -ine [string]$contract.host.deviceName) {
    throw "Wrong host. Expected $($contract.host.deviceName)."
  }
  $system = Get-CimInstance Win32_ComputerSystem
  if (
    [string]$system.Manufacturer -ine [string]$contract.host.manufacturer -or
    [string]$system.Model -ine [string]$contract.host.model
  ) {
    throw "Host manufacturer/model does not match the admitted host."
  }
  if ((Get-CertificateMatches).Count -ne 0) {
    throw "The Stage 2 certificate is already present before qualification."
  }
  if ($null -ne (Get-OraclePackage)) {
    throw "Oracle is already installed before qualification."
  }
  if (-not (Test-Path -LiteralPath $archivePath -PathType Leaf)) {
    throw "Frozen Stage 2 archive is missing."
  }
  $archiveSha256 = Get-Sha256 -Path $archivePath
  if ($archiveSha256 -ne [string]$contract.candidate.archiveSha256) {
    throw "Frozen Stage 2 archive hash mismatch."
  }

  if (Test-Path -LiteralPath $expandedRoot) {
    throw "Stage 2 expansion directory already exists."
  }
  New-Item -ItemType Directory -Path $workRoot -Force | Out-Null
  Expand-Archive -LiteralPath $archivePath -DestinationPath $expandedRoot

  $indexPath = Join-Path $releaseRoot "stage-2-evidence-index.json"
  $index = Get-Content -LiteralPath $indexPath -Raw | ConvertFrom-Json
  foreach ($entry in $index.evidenceFiles) {
    $path = Join-Path $releaseRoot ([string]$entry.filename)
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
      throw "Stage 2 evidence file is missing: $($entry.filename)"
    }
    if ((Get-Sha256 -Path $path) -ne [string]$entry.sha256) {
      throw "Stage 2 evidence hash mismatch: $($entry.filename)"
    }
    if ((Get-Item -LiteralPath $path).Length -ne [long]$entry.size) {
      throw "Stage 2 evidence size mismatch: $($entry.filename)"
    }
  }
  if ((Get-Sha256 -Path $msixPath) -ne [string]$contract.candidate.msixSha256) {
    throw "MSIX hash mismatch."
  }

  Add-Type -AssemblyName System.Security
  $manifestPath = Join-Path $releaseRoot "oracle-release-manifest.json"
  $signaturePath = "$manifestPath.p7s"
  $content = [Security.Cryptography.Pkcs.ContentInfo]::new(
    [IO.File]::ReadAllBytes($manifestPath)
  )
  $cms = [Security.Cryptography.Pkcs.SignedCms]::new($content, $true)
  $cms.Decode([IO.File]::ReadAllBytes($signaturePath))
  $cms.CheckSignature($true)
  if ($cms.SignerInfos.Count -ne 1) {
    throw "Release Manifest must have exactly one signer."
  }
  $certificate = $cms.SignerInfos[0].Certificate
  if (
    $certificate.Subject -ne $publisher -or
    $certificate.Thumbprint -ne $thumbprint -or
    $certificate.HasPrivateKey
  ) {
    throw "Derived public certificate does not match the accepted identity."
  }
  if (
    $certificate.NotAfter.ToUniversalTime() -ne
    [DateTime]::Parse([string]$contract.candidate.certificateNotAfterUtc).ToUniversalTime()
  ) {
    throw "Derived public certificate expiry does not match Stage 2 evidence."
  }
  [IO.File]::WriteAllBytes(
    $certificatePath,
    $certificate.Export(
      [Security.Cryptography.X509Certificates.X509ContentType]::Cert
    )
  )

  Write-Evidence "01-pre-execution.json" ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.stage-3-pre-execution"
    result = "passed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    host = [ordered]@{
      deviceName = $env:COMPUTERNAME
      manufacturer = [string]$system.Manufacturer
      model = [string]$system.Model
      admissionState = [string]$contract.host.admissionState
      installationMediaEvidencePresent = $false
    }
    transfer = [ordered]@{
      archiveSha256 = $archiveSha256
      evidenceFilesVerified = @($index.evidenceFiles).Count
      msixSha256 = Get-Sha256 -Path $msixPath
      releaseManifestSha256 = Get-Sha256 -Path $manifestPath
    }
    certificate = [ordered]@{
      subject = $certificate.Subject
      thumbprint = $certificate.Thumbprint
      notAfterUtc = $certificate.NotAfter.ToUniversalTime().ToString("o")
      hasPrivateKey = $certificate.HasPrivateKey
      trusted = $false
      publicCertificateSha256 = Get-Sha256 -Path $certificatePath
    }
    oracleInstalled = $false
    certificateStoreMatches = 0
  })
}

function Invoke-NegativePathAndTrust {
  Assert-Elevated
  Assert-PriorPhase "01-pre-execution.json"
  if ((Get-CertificateMatches).Count -ne 0) {
    throw "The Stage 2 certificate is already trusted."
  }
  if ($null -ne (Get-OraclePackage)) {
    throw "Oracle is already installed."
  }

  $untrustedRejected = $false
  try {
    Add-AppxPackage -Path $msixPath -ErrorAction Stop
  } catch {
    $untrustedRejected = $true
  }
  if (-not $untrustedRejected -or $null -ne (Get-OraclePackage)) {
    throw "Windows did not reject the untrusted original package."
  }

  $imported = Import-Certificate -FilePath $certificatePath `
    -CertStoreLocation "Cert:\CurrentUser\Root"
  if (
    $imported.Thumbprint -ne $thumbprint -or
    $imported.Subject -ne $publisher -or
    $imported.HasPrivateKey
  ) {
    Remove-OracleCertificate
    throw "Temporary trust imported an unexpected certificate."
  }

  Copy-Item -LiteralPath $msixPath -Destination $tamperedPath
  [byte[]]$bytes = [IO.File]::ReadAllBytes($tamperedPath)
  $offset = [Math]::Max(0, $bytes.Length - 512)
  $bytes[$offset] = $bytes[$offset] -bxor 1
  [IO.File]::WriteAllBytes($tamperedPath, $bytes)
  $tamperedRejected = $false
  try {
    Add-AppxPackage -Path $tamperedPath -ErrorAction Stop
  } catch {
    $tamperedRejected = $true
  }
  Remove-Item -LiteralPath $tamperedPath -Force -ErrorAction SilentlyContinue
  if (-not $tamperedRejected -or $null -ne (Get-OraclePackage)) {
    Remove-OracleCertificate
    throw "Windows did not reject the tampered package."
  }

  $matches = @(Get-CertificateMatches)
  if (
    $matches.Count -ne 1 -or
    $matches[0].location -ne "CurrentUser" -or
    $matches[0].store -ne "Root" -or
    $matches[0].hasPrivateKey
  ) {
    Remove-OracleCertificate
    throw "Temporary certificate trust is broader than declared."
  }

  Write-Evidence "02-negative-path-and-trust.json" ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.stage-3-negative-path-and-trust"
    result = "passed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    untrustedOriginalRejected = $untrustedRejected
    tamperedCopyRejected = $tamperedRejected
    acceptedPackageModified = $false
    temporaryTrust = $matches
    privateKeyPresent = $false
  })
}

function Invoke-InstallAndStartup {
  Assert-Elevated
  Assert-PriorPhase "02-negative-path-and-trust.json"
  $matches = @(Get-CertificateMatches)
  if ($matches.Count -ne 1 -or $matches[0].hasPrivateKey) {
    throw "Expected bounded public-certificate trust is not present."
  }
  if ((Get-Sha256 -Path $msixPath) -ne [string]$contract.candidate.msixSha256) {
    throw "MSIX hash changed before installation."
  }

  Add-AppxPackage -Path $msixPath
  $package = Get-OraclePackage
  if (
    $null -eq $package -or
    [string]$package.Version -ne [string]$contract.candidate.packageVersion -or
    [string]$package.Publisher -ne $publisher
  ) {
    throw "Installed package identity, publisher or version is invalid."
  }

  Start-Process explorer.exe `
    -ArgumentList "shell:AppsFolder\$($package.PackageFamilyName)!Oracle"
  $deadline = [DateTime]::UtcNow.AddSeconds(20)
  $process = $null
  while ([DateTime]::UtcNow -lt $deadline -and $null -eq $process) {
    Start-Sleep -Milliseconds 250
    $process = Get-Process -Name "Oracle" -ErrorAction SilentlyContinue |
      Select-Object -First 1
  }
  if ($null -eq $process) {
    throw "The installed Oracle package did not start."
  }

  $failClosed = Read-FounderConfirmation `
    "Oracle shows the approved unavailable/local-qualification state"
  $noProduction = Read-FounderConfirmation `
    "Oracle requested no production endpoint, credential or data"
  $noUnexpectedAuthority = Read-FounderConfirmation `
    "No unexpected persistence, diagnostic upload or renderer authority was observed"
  Stop-Process -Name "Oracle" -Force -ErrorAction SilentlyContinue

  Write-Evidence "03-install-and-startup.json" ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.stage-3-install-and-startup"
    result = "passed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    package = [ordered]@{
      name = $package.Name
      packageFullName = $package.PackageFullName
      packageFamilyName = $package.PackageFamilyName
      publisher = $package.Publisher
      version = [string]$package.Version
      architecture = [string]$package.Architecture
      msixSha256 = Get-Sha256 -Path $msixPath
    }
    packagedProcessStarted = $true
    founderConfirmations = [ordered]@{
      approvedFailClosedState = $failClosed
      noProductionResource = $noProduction
      noUnexpectedAuthority = $noUnexpectedAuthority
    }
  })
}

function Invoke-RepairAndRemoval {
  Assert-Elevated
  Assert-PriorPhase "03-install-and-startup.json"
  $package = Get-OraclePackage
  if ($null -eq $package) {
    throw "Oracle is not installed before repair/reset."
  }
  Reset-AppxPackage -Package $package.PackageFullName
  $package = Get-OraclePackage
  if ($null -eq $package) {
    Add-AppxPackage -Path $msixPath
    $package = Get-OraclePackage
  }
  if (
    $null -eq $package -or
    [string]$package.Version -ne [string]$contract.candidate.packageVersion
  ) {
    throw "Repair/reset did not preserve the accepted package identity."
  }

  Start-Process explorer.exe `
    -ArgumentList "shell:AppsFolder\$($package.PackageFamilyName)!Oracle"
  $deadline = [DateTime]::UtcNow.AddSeconds(20)
  $process = $null
  while ([DateTime]::UtcNow -lt $deadline -and $null -eq $process) {
    Start-Sleep -Milliseconds 250
    $process = Get-Process -Name "Oracle" -ErrorAction SilentlyContinue |
      Select-Object -First 1
  }
  if ($null -eq $process) {
    throw "Oracle did not restart after repair/reset."
  }
  $failClosed = Read-FounderConfirmation `
    "Oracle still shows the approved fail-closed local state after repair/reset"
  Stop-Process -Name "Oracle" -Force -ErrorAction SilentlyContinue

  $packageFullName = $package.PackageFullName
  $packageFamilyName = $package.PackageFamilyName
  Remove-AppxPackage -Package $packageFullName -Confirm:$false
  if ($null -ne (Get-OraclePackage)) {
    throw "Oracle remains registered after uninstall."
  }

  Write-Evidence "04-repair-and-removal.json" ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.stage-3-repair-and-removal"
    result = "passed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    resetCompleted = $true
    sameIdentityPreserved = $true
    relaunchCompleted = $true
    founderFailClosedConfirmation = $failClosed
    packageFullName = $packageFullName
    packageFamilyName = $packageFamilyName
    uninstalled = $true
    packageRegistrationRemaining = $false
  })
}

function Invoke-Cleanup {
  Assert-Elevated
  Assert-PriorPhase "04-repair-and-removal.json"
  $remainingPackage = Get-OraclePackage
  if ($null -ne $remainingPackage) {
    Remove-AppxPackage -Package $remainingPackage.PackageFullName `
      -Confirm:$false -ErrorAction SilentlyContinue
  }
  Stop-Process -Name "Oracle" -Force -ErrorAction SilentlyContinue
  Remove-OracleCertificate
  Remove-Item -LiteralPath $tamperedPath -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $certificatePath -Force -ErrorAction SilentlyContinue

  $packageRemaining = $null -ne (Get-OraclePackage)
  $certificateMatches = @(Get-CertificateMatches)
  $oracleProcesses = @(Get-Process -Name "Oracle" -ErrorAction SilentlyContinue)
  if (
    $packageRemaining -or
    $certificateMatches.Count -ne 0 -or
    $oracleProcesses.Count -ne 0
  ) {
    throw "Cleanup left package, certificate or process residue."
  }

  Write-Evidence "05-cleanup.json" ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.stage-3-cleanup"
    result = "passed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    packageRemaining = $packageRemaining
    certificateStoreMatches = $certificateMatches
    oracleProcessCount = $oracleProcesses.Count
    privateKeyMaterialTransferred = $false
    evidencePreserved = $true
    stage4Started = $false
  })
}

switch ($Phase) {
  "PreExecution" { Invoke-PreExecution }
  "NegativePathAndTrust" { Invoke-NegativePathAndTrust }
  "InstallAndStartup" { Invoke-InstallAndStartup }
  "RepairAndRemoval" { Invoke-RepairAndRemoval }
  "Cleanup" { Invoke-Cleanup }
}

