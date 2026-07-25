$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$release = Join-Path $root ".tmp-sprint-29\release"
$baseline = Join-Path $release "Oracle_0.0.9.0_x64_LOCAL_TEST_ONLY.msix"
$candidate = Join-Path $release "Oracle_0.1.0.0_x64_LOCAL_TEST_ONLY.msix"
$certificatePath = Join-Path $release "oracle-local-test-signing.cer"
$tampered = Join-Path $release "Oracle_0.1.0.0_TAMPERED_REJECTION_FIXTURE.msix"
$identityName = "Oracle.Platform.LocalCertification"
$expectedPublisher = "CN=Oracle Local Test Signing - NOT PRODUCTION"
$steps = [System.Collections.Generic.List[object]]::new()
$certificate = $null
$isAdministrator = (
  [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdministrator) {
  throw "MSIX lifecycle certification requires a UAC-elevated process for temporary LocalMachine test-root trust."
}
Remove-Item -LiteralPath (Join-Path $release "lifecycle-error.log") -Force -ErrorAction SilentlyContinue

function Add-Step {
  param(
    [string]$Name,
    [string]$Status,
    [string]$Evidence
  )
  $steps.Add([ordered]@{
    name = $Name
    status = $Status
    evidence = $Evidence
  })
}

function Get-OracleTestPackage {
  return Get-AppxPackage -Name $identityName -ErrorAction SilentlyContinue
}

function Assert-PackageVersion {
  param([string]$Expected)
  $package = Get-OracleTestPackage
  if ($null -eq $package) {
    throw "Oracle local-certification package is not installed."
  }
  if ([string]$package.Version -ne $Expected) {
    throw "Expected package version $Expected but found $($package.Version)."
  }
  return $package
}

try {
  foreach ($path in @($baseline, $candidate, $certificatePath)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
      throw "Required local certification artifact is missing: $path"
    }
  }

  $existing = Get-OracleTestPackage
  if ($null -ne $existing) {
    Remove-AppxPackage -Package $existing.PackageFullName -Confirm:$false
  }

  $certificate = Import-Certificate `
    -FilePath $certificatePath `
    -CertStoreLocation "Cert:\LocalMachine\Root"
  if ($certificate.Subject -ne $expectedPublisher) {
    throw "The imported certificate does not use the explicit local-test publisher."
  }
  Add-Step "isolated-test-trust" "passed" "Only the two-day Sprint-local public certificate was trusted in the machine root store for this bounded test."

  Add-AppxPackage -Path $baseline
  $installed = Assert-PackageVersion "0.0.9.0"
  Add-Step "install" "passed" "Baseline MSIX 0.0.9.0 installed under the explicit local-certification identity."

  Copy-Item -LiteralPath $candidate -Destination $tampered -Force
  [byte[]]$bytes = [System.IO.File]::ReadAllBytes($tampered)
  $index = [Math]::Max(0, $bytes.Length - 512)
  $bytes[$index] = $bytes[$index] -bxor 1
  [System.IO.File]::WriteAllBytes($tampered, $bytes)
  $tamperedRejected = $false
  try {
    Add-AppxPackage -Path $tampered -ErrorAction Stop
  }
  catch {
    $tamperedRejected = $true
  }
  if (-not $tamperedRejected) {
    throw "Windows accepted the tampered MSIX rejection fixture."
  }
  $null = Assert-PackageVersion "0.0.9.0"
  Add-Step "failed-update-recovery" "passed" "A signature-invalid package was rejected and the installed baseline remained intact."

  Add-AppxPackage -Path $candidate
  $installed = Assert-PackageVersion "0.1.0.0"
  Add-Step "update" "passed" "Windows transactionally replaced baseline 0.0.9.0 with candidate 0.1.0.0."

  Start-Process explorer.exe -ArgumentList "shell:AppsFolder\$($installed.PackageFamilyName)!Oracle"
  $deadline = [DateTime]::UtcNow.AddSeconds(15)
  $process = $null
  while ([DateTime]::UtcNow -lt $deadline -and $null -eq $process) {
    Start-Sleep -Milliseconds 250
    $process = Get-Process -Name "Oracle" -ErrorAction SilentlyContinue | Select-Object -First 1
  }
  if ($null -eq $process) {
    throw "The installed Oracle package did not start."
  }
  Stop-Process -Id $process.Id -Force
  Add-Step "packaged-startup" "passed" "The installed package launched its sandboxed local-certification shell and was then stopped."

  Reset-AppxPackage -Package $installed.PackageFullName
  if ($null -eq (Get-OracleTestPackage)) {
    Add-AppxPackage -Path $candidate
  }
  $null = Assert-PackageVersion "0.1.0.0"
  Add-Step "repair-reset" "passed" "Windows reset the package and the same signed candidate was re-registered when full-trust reset removed registration."

  Add-AppxPackage -Path $baseline -ForceUpdateFromAnyVersion
  $null = Assert-PackageVersion "0.0.9.0"
  Add-Step "authorised-rollback" "passed" "The explicitly declared signed rollback target 0.0.9.0 was restored."

  Remove-AppxPackage -Package (Get-OracleTestPackage).PackageFullName -Confirm:$false
  if ($null -ne (Get-OracleTestPackage)) {
    throw "Oracle local-certification package remained registered after uninstall."
  }
  Add-Step "uninstall" "passed" "The local-certification package and packaged binaries were removed."
}
catch {
  $_ |
    Format-List * -Force |
    Out-String |
    Set-Content -LiteralPath (Join-Path $release "lifecycle-error.log") -Encoding utf8
  throw
}
finally {
  $remaining = Get-OracleTestPackage
  if ($null -ne $remaining) {
    Remove-AppxPackage -Package $remaining.PackageFullName -Confirm:$false -ErrorAction SilentlyContinue
  }
  Remove-Item -LiteralPath $tampered -Force -ErrorAction SilentlyContinue
  if ($null -ne $certificate) {
    Remove-Item -LiteralPath "Cert:\LocalMachine\Root\$($certificate.Thumbprint)" -Force -ErrorAction SilentlyContinue
  }
}

if ($null -ne (Get-OracleTestPackage)) {
  throw "Lifecycle cleanup did not remove the Oracle local-certification package."
}
if (
  $null -ne $certificate -and
  (
    Test-Path -LiteralPath "Cert:\LocalMachine\Root\$($certificate.Thumbprint)"
  )
) {
  throw "Lifecycle cleanup did not remove the local test certificate."
}
Add-Step "cleanup" "passed" "No Oracle test package or Sprint-local trusted certificate remains."

$evidence = [ordered]@{
  status = "passed"
  environment = "current Windows host"
  cleanMachine = $false
  cleanMachineStatus = "deferred-required-windows-vm-or-sandbox-unavailable"
  identity = $identityName
  publisher = $expectedPublisher
  steps = $steps
  productionTrusted = $false
  published = $false
  externallyDistributed = $false
  deployed = $false
  limitation = "Local test signing proves packaging and distribution mechanics only. It must never be interpreted as production publisher trust, public release readiness, operational certification, deployment authority or permission to distribute Oracle externally."
}
$evidence |
  ConvertTo-Json -Depth 8 |
  Set-Content -LiteralPath (Join-Path $release "lifecycle-certification.json") -Encoding utf8
$evidence | ConvertTo-Json -Depth 8
