[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$AcceptedPackagePath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage3R13InstalledSoftwarePolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R13ActivationPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R13WindowsExecutablePolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R13PreflightPolicy.ps1")

if (
  $PSVersionTable.PSEdition -cne "Desktop" -or
  $PSVersionTable.PSVersion.Major -ne 5 -or
  $PSVersionTable.PSVersion.Minor -ne 1 -or
  -not [Environment]::Is64BitProcess
) { throw "Development compatibility probe requires Windows PowerShell 5.1 x64." }
if (-not (Test-Path -LiteralPath $AcceptedPackagePath -PathType Leaf)) {
  throw "Accepted package is unavailable to the development compatibility probe."
}

$inventory = @(Get-OracleStage3R13InstalledSoftwareInventory)
$commands = @(Assert-OracleStage3R13CommandSurface)
$windowsExecutables = [ordered]@{
  certutil = Get-OracleStage3R13WindowsExecutablePath -Name "certutil.exe"
  reagentc = Get-OracleStage3R13WindowsExecutablePath -Name "reagentc.exe"
}
$applicationActivation = Test-OracleStage3R13ApplicationActivationApi
if (-not $applicationActivation.available) {
  throw "Direct application activation API is unavailable."
}
$contract = Get-Content -LiteralPath (
  Join-Path $PSScriptRoot "Oracle.Stage3R13Contract.json"
) -Raw | ConvertFrom-Json
$signature = Get-AuthenticodeSignature `
  -LiteralPath $AcceptedPackagePath -ErrorAction Stop
$releaseRoot = Split-Path -Parent $AcceptedPackagePath
$fixtureRoot = Join-Path $env:TEMP (
  "oracle-stage3-r13-compatibility-" + [Guid]::NewGuid().ToString("N")
)
[void](New-Item -ItemType Directory -Path (Join-Path $fixtureRoot "payload"))
try {
  foreach ($name in @(
    [string]$contract.package.releaseManifestFileName,
    "$([string]$contract.package.releaseManifestFileName).p7s",
    [string]$contract.package.publicCertificateFileName
  )) {
    [IO.File]::WriteAllBytes(
      (Join-Path (Join-Path $fixtureRoot "payload") $name),
      [IO.File]::ReadAllBytes((Join-Path $releaseRoot $name))
    )
  }
  $detachedSigner = Get-OracleStage3R13AcceptedPublicCertificate `
    -Contract $contract -TransferRoot $fixtureRoot
} finally {
  if (Test-Path -LiteralPath $fixtureRoot) {
    Remove-Item -LiteralPath $fixtureRoot -Recurse
  }
}
$connections = @(Get-NetTCPConnection -ErrorAction Stop)
foreach ($connection in $connections) {
  foreach ($member in @("OwningProcess", "State", "RemoteAddress")) {
    [void](Get-OracleStage3R13RequiredPropertyValue (
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
