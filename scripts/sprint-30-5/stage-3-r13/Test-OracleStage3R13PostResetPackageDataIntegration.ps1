[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$classification = @("NON-QUALIFICATION", "NON-AUTHORITY", "ENGINEERING-INTEGRATION")
$principal = [Security.Principal.WindowsPrincipal]::new(
  [Security.Principal.WindowsIdentity]::GetCurrent()
)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "R13 engineering integration requires an elevated Windows PowerShell process."
}
$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
$contract = Get-Content -LiteralPath (
  Join-Path $PSScriptRoot "Oracle.Stage3R13Contract.json"
) -Raw | ConvertFrom-Json
. (Join-Path $PSScriptRoot "Oracle.Stage3R13InstalledRuntimeConfigurationPolicy.ps1")

$attemptRoot = Join-Path $repositoryRoot (
  ".tmp-stage3-r13-post-reset-integration-" + [Guid]::NewGuid().ToString("N")
)
$stage2Root = Join-Path $repositoryRoot ([string]$contract.stage2.engineeringFreezeRoot)
$msixPath = Join-Path $stage2Root ("release\" + [string]$contract.package.fileName)
$certificatePath = Join-Path $stage2Root (
  "release\" + [string]$contract.package.publicCertificateFileName
)
$thumbprint = [string]$contract.stage2.certificateThumbprint
$package = $null

$result = $null

function Get-ExactMachineCertificate {
  @(
    Get-ChildItem -LiteralPath "Cert:\LocalMachine\TrustedPeople" -ErrorAction Stop |
      Where-Object { $_.Thumbprint -ceq $thumbprint }
  )
}

function Assert-ZeroPreState {
  $existingPackages = @(
    Get-AppxPackage -Name ([string]$contract.package.identity) -ErrorAction SilentlyContinue
  )
  $existingCertificates = @(Get-ExactMachineCertificate)
  if ($existingPackages.Count -ne 0 -or $existingCertificates.Count -ne 0) {
    throw (
      "R13 engineering integration requires zero Oracle package and trust pre-state; " +
      "packages=$($existingPackages.Count); certificates=$($existingCertificates.Count)."
    )
  }
}

try {
  Assert-ZeroPreState
  if (
    -not (Test-Path -LiteralPath $msixPath -PathType Leaf) -or
    (Get-FileHash -LiteralPath $msixPath -Algorithm SHA256).Hash.ToLowerInvariant() -cne
      [string]$contract.stage2.msixSha256
  ) {
    throw "Accepted R8 MSIX binding differs."
  }
  $certificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new(
    $certificatePath
  )
  if ($certificate.Thumbprint -cne $thumbprint -or $certificate.HasPrivateKey) {
    throw "Accepted R8 public certificate binding differs."
  }

  [IO.Directory]::CreateDirectory($attemptRoot) | Out-Null
  $import = Import-Certificate -FilePath $certificatePath `
    -CertStoreLocation "Cert:\LocalMachine\TrustedPeople"
  if ($import.Thumbprint -cne $thumbprint) {
    throw "Engineering integration certificate import differs."
  }


  Add-AppxPackage -Path $msixPath -ErrorAction Stop
  $packages = @(Get-AppxPackage -Name $contract.package.identity -ErrorAction Stop)
  if (
    $packages.Count -ne 1 -or
    [string]$packages[0].Version -cne [string]$contract.package.version
  ) {
    throw "Engineering integration package registration differs."
  }
  $package = $packages[0]
  $packageFamilyName = [string]$package.PackageFamilyName
  $packageFullName = [string]$package.PackageFullName
  $packageRoot = Join-Path $env:LOCALAPPDATA (
    "Packages\" + $packageFamilyName
  )
  $preResetApplicationData =
    [Windows.Management.Core.ApplicationDataManager, Windows.Management.Core, ContentType=WindowsRuntime]::CreateForPackageFamily(
      $packageFamilyName
    )
  try {
    $preResetLocalState = [IO.Path]::GetFullPath(
      [string]$preResetApplicationData.LocalFolder.Path
    )
    if (
      $preResetLocalState -cne
        [IO.Path]::GetFullPath((Join-Path $packageRoot "LocalState"))
    ) {
      throw "Pre-reset managed LocalState path differs."
    }
    [IO.File]::WriteAllText(
      (Join-Path $preResetLocalState "pre-reset-probe.txt"),
      "post-reset lifecycle probe",
      [Text.UTF8Encoding]::new($false)
    )
  } finally {
    if ($preResetApplicationData -is [IDisposable]) {
      $preResetApplicationData.Dispose()
    }
  }

  Reset-AppxPackage -Package $packageFullName
  if (Test-Path -LiteralPath $packageRoot) {
    throw "Reset-AppxPackage did not remove the package-data root."
  }

  $initialization = Initialize-OracleInstalledRuntimePackageData `
    -PackageIdentity ([string]$contract.package.identity) `
    -PackageFamilyName $packageFamilyName `
    -ExpectedPackageFamilyName $packageFamilyName `
    -PackageFullName $packageFullName `
    -ExpectedPackageFullName $packageFullName `
    -LocalAppDataRoot $env:LOCALAPPDATA
  if (
    -not $initialization.packageRootPresentAfter -or
    -not $initialization.localStatePathMatched -or
    [int]$initialization.registrationPolls -lt 1
  ) {
    throw "Real post-reset package-data initialization record differs."
  }
  $result = [ordered]@{
    result = "passed"
    classification = $classification
    packageFamilyName = $packageFamilyName
    packageFullName = $packageFullName
    resetRemovedPackageDataRoot = $true
    preResetManagedLocalState = $true
    api = [string]$initialization.api
    exactLocalStateRecreated = $true
    unconfiguredProductActivation = $false
  }
} finally {
  $cleanupFailures = [Collections.Generic.List[string]]::new()
  try {
    $installed = @(Get-AppxPackage -Name $contract.package.identity -ErrorAction SilentlyContinue)
    foreach ($entry in $installed) {
      Remove-AppxPackage -Package ([string]$entry.PackageFullName) -Confirm:$false
    }
  } catch { $cleanupFailures.Add("package: $($_.Exception.Message)") }
  try {
    foreach ($entry in @(Get-ExactMachineCertificate)) {
      Remove-Item -LiteralPath $entry.PSPath -Force -ErrorAction Stop
    }
  } catch { $cleanupFailures.Add("certificate: $($_.Exception.Message)") }
  try {
    if (Test-Path -LiteralPath $attemptRoot) {
      Remove-Item -LiteralPath $attemptRoot -Recurse -Force -ErrorAction Stop
    }
  } catch { $cleanupFailures.Add("attempt-root: $($_.Exception.Message)") }

  $remainingPackages = @(Get-AppxPackage -Name $contract.package.identity -ErrorAction SilentlyContinue)
  $remainingCertificates = @(Get-ExactMachineCertificate)
  if (
    $cleanupFailures.Count -ne 0 -or
    $remainingPackages.Count -ne 0 -or
    $remainingCertificates.Count -ne 0
  ) {
    throw (
      "R13 engineering integration cleanup failed: " +
      [string]::Join("; ", @($cleanupFailures)) +
      "; packages=$($remainingPackages.Count); certificates=$($remainingCertificates.Count)"
    )
  }
}

if ($null -eq $result) {
  throw "R13 engineering integration produced no passing result."
}
$result.zeroPackageResidue = $true
$result.zeroLocalMachineTrustResidue = $true
$result.zeroTemporaryWorkResidue = $true
[pscustomobject]$result | ConvertTo-Json -Depth 6
