[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$AcceptedPackagePath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage3R11InstalledSoftwarePolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11ActivationPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11WindowsExecutablePolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11PreflightPolicy.ps1")

if (
  $PSVersionTable.PSEdition -cne "Desktop" -or
  $PSVersionTable.PSVersion.Major -ne 5 -or
  $PSVersionTable.PSVersion.Minor -ne 1 -or
  -not [Environment]::Is64BitProcess
) { throw "Development compatibility probe requires Windows PowerShell 5.1 x64." }
if (-not (Test-Path -LiteralPath $AcceptedPackagePath -PathType Leaf)) {
  throw "Accepted package is unavailable to the development compatibility probe."
}

$inventory = @(Get-OracleStage3R11InstalledSoftwareInventory)
$commands = @(Assert-OracleStage3R11CommandSurface)
$windowsExecutables = [ordered]@{
  certutil = Get-OracleStage3R11WindowsExecutablePath -Name "certutil.exe"
  reagentc = Get-OracleStage3R11WindowsExecutablePath -Name "reagentc.exe"
}
$applicationActivation = Test-OracleStage3R11ApplicationActivationApi
if (-not $applicationActivation.available) {
  throw "Direct application activation API is unavailable."
}
$contract = Get-Content -LiteralPath (
  Join-Path $PSScriptRoot "Oracle.Stage3R11Contract.json"
) -Raw | ConvertFrom-Json
$signature = Get-AuthenticodeSignature `
  -LiteralPath $AcceptedPackagePath -ErrorAction Stop
$releaseRoot = Split-Path -Parent $AcceptedPackagePath
$fixtureRoot = Join-Path $env:TEMP (
  "oracle-stage3-r11-compatibility-" + [Guid]::NewGuid().ToString("N")
)
[void](New-Item -ItemType Directory -Path (Join-Path $fixtureRoot "payload"))
try {
  foreach ($name in @(
    [string]$contract.package.releaseManifestFileName,
    "$([string]$contract.package.releaseManifestFileName).p7s"
  )) {
    [IO.File]::WriteAllBytes(
      (Join-Path (Join-Path $fixtureRoot "payload") $name),
      [IO.File]::ReadAllBytes((Join-Path $releaseRoot $name))
    )
  }
  $detachedSigner = Get-OracleStage3R11AcceptedPublicCertificate `
    -Contract $contract -TransferRoot $fixtureRoot
} finally {
  if (Test-Path -LiteralPath $fixtureRoot) {
    Remove-Item -LiteralPath $fixtureRoot -Recurse
  }
}
$connections = @(Get-NetTCPConnection -ErrorAction Stop)
foreach ($connection in $connections) {
  foreach ($member in @("OwningProcess", "State", "RemoteAddress")) {
    [void](Get-OracleStage3R11RequiredPropertyValue (
      $connection
    ) $member "Get-NetTCPConnection")
  }
}

[ordered]@{
  result = "passed"
  classification = "NON-QUALIFICATION DEVELOPMENT-MACHINE COMPATIBILITY; NOT HOST ADMISSION"
  powershellEdition = $PSVersionTable.PSEdition
  powershellVersion = $PSVersionTable.PSVersion.ToString()
  is64BitProcess = [Environment]::Is64BitProcess
  installedSoftwareCount = $inventory.Count
  requiredCommandCount = $commands.Count
  windowsExecutables = $windowsExecutables
  applicationActivation = $applicationActivation
  compressArchiveLiteralPath = (
    Get-Command Compress-Archive -ErrorAction Stop
  ).Parameters.ContainsKey("LiteralPath")
  acceptedPackageSignatureStatus = [string]$signature.Status
  untrustedMsixSignerExposed = $null -ne $signature.SignerCertificate
  detachedSignerThumbprint = $detachedSigner.Thumbprint
  tcpConnectionCount = $connections.Count
  hostAdmissionInferred = $false
} | ConvertTo-Json -Depth 12
