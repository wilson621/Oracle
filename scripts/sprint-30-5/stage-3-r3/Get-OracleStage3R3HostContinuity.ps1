[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$contract = Get-Content -LiteralPath (
  Join-Path $scriptRoot "Oracle.Stage3R3Contract.json"
) -Raw | ConvertFrom-Json
. (Join-Path $scriptRoot "Oracle.Stage3R3IdentityPolicy.ps1")

function Invoke-ReadOnlyProcess([string]$Executable, [string[]]$Arguments) {
  if (-not (Test-Path -LiteralPath $Executable -PathType Leaf)) {
    throw "Read-only continuity tool is missing: $Executable"
  }
  $info = [Diagnostics.ProcessStartInfo]::new()
  $info.FileName = $Executable
  $info.Arguments = (($Arguments | ForEach-Object { '"' + $_ + '"' }) -join " ")
  $info.UseShellExecute = $false
  $info.CreateNoWindow = $true
  $info.RedirectStandardOutput = $true
  $info.RedirectStandardError = $true
  $process = [Diagnostics.Process]::new()
  $process.StartInfo = $info
  try {
    if (-not $process.Start()) { throw "Read-only continuity tool did not start." }
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    $process.WaitForExit()
    $result = [ordered]@{
      executable = $Executable
      arguments = $Arguments
      stdout = $stdoutTask.GetAwaiter().GetResult()
      stderr = $stderrTask.GetAwaiter().GetResult()
      exitCode = $process.ExitCode
    }
  } finally {
    $process.Dispose()
  }
  if ($result.exitCode -ne 0) {
    throw "Read-only continuity tool failed with exit code $($result.exitCode)."
  }
  $result
}

if (Test-Path -LiteralPath $OutputPath) {
  throw "Host-continuity evidence is create-only."
}
$parent = Split-Path -Parent ([IO.Path]::GetFullPath($OutputPath))
if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
  throw "Host-continuity output parent must already exist."
}
$cursor = $parent
while ($cursor) {
  if (
    (Test-Path -LiteralPath $cursor) -and
    (((Get-Item -LiteralPath $cursor -Force).Attributes -band
      [IO.FileAttributes]::ReparsePoint) -ne 0)
  ) { throw "Host-continuity output traverses a reparse point: $cursor" }
  $next = Split-Path -Parent $cursor
  if ($next -eq $cursor) { break }
  $cursor = $next
}

$system = Get-CimInstance Win32_ComputerSystem
$operatingSystem = Get-CimInstance Win32_OperatingSystem
$computerProduct = Get-CimInstance Win32_ComputerSystemProduct
$secureBoot = Confirm-SecureBootUEFI
$tpm = Get-Tpm
$defender = Get-MpComputerStatus
$activation = @(Get-CimInstance SoftwareLicensingProduct | Where-Object {
  $_.PartialProductKey -and $_.LicenseStatus -eq 1
})
$recovery = Invoke-ReadOnlyProcess (
  Join-Path ([Environment]::SystemDirectory) "reagentc.exe"
) @("/info")
$developmentTools = @("node", "npm", "git", "python", "docker", "dotnet", "msbuild") |
  ForEach-Object {
    [ordered]@{
      name = $_
      available = $null -ne (Get-Command $_ -ErrorAction SilentlyContinue)
    }
  }
$packages = @(Get-AppxPackage -Name $contract.package.identity -ErrorAction SilentlyContinue)
$certificateMatches = @()
foreach ($location in @("CurrentUser", "LocalMachine")) {
  foreach ($store in @("My", "Root", "TrustedPeople")) {
    $certificate = Get-Item -LiteralPath (
      "Cert:\$location\$store\$($contract.stage2.certificateThumbprint)"
    ) -ErrorAction SilentlyContinue
    if ($null -ne $certificate) {
      $certificateMatches += "$location\$store"
    }
  }
}
$issues = @()
if (
  -not (Test-OracleWindowsComputerName (
    [string]$env:COMPUTERNAME
  ) ([string]$contract.host.deviceName))
) { $issues += "device-name" }
if ([string]$system.Manufacturer -cne $contract.host.manufacturer) { $issues += "manufacturer" }
if ([string]$system.Model -cne $contract.host.model) { $issues += "model" }
if (-not $secureBoot) { $issues += "secure-boot" }
if (-not $tpm.TpmPresent -or -not $tpm.TpmReady) { $issues += "tpm" }
if (-not $defender.AntivirusEnabled -or -not $defender.RealTimeProtectionEnabled) {
  $issues += "defender"
}
if ($activation.Count -eq 0) { $issues += "activation" }
if ($recovery.stdout -notmatch '(?im)Windows RE status:\s+Enabled') {
  $issues += "recovery"
}
if (@($developmentTools | Where-Object { $_.available }).Count -ne 0) {
  $issues += "development-tools"
}
if ($packages.Count -ne 0) { $issues += "oracle-package" }
if ($certificateMatches.Count -ne 0) { $issues += "oracle-certificate" }

$record = [ordered]@{
  schemaVersion = "1.0.0"
  contract = "oracle.sprint-30-5.stage-3-r3-host-continuity"
  programmeIdentity = $contract.programmeIdentity
  recordedAtUtc = [DateTime]::UtcNow.ToString("o")
  result = if ($issues.Count -eq 0) { "passed" } else { "failed" }
  issues = $issues
  host = [ordered]@{
    deviceName = $env:COMPUTERNAME
    manufacturer = [string]$system.Manufacturer
    model = [string]$system.Model
    systemUuid = [string]$computerProduct.UUID
    windowsCaption = [string]$operatingSystem.Caption
    windowsVersion = [string]$operatingSystem.Version
    windowsBuild = [string]$operatingSystem.BuildNumber
  }
  security = [ordered]@{
    secureBoot = $secureBoot
    tpmPresent = $tpm.TpmPresent
    tpmReady = $tpm.TpmReady
    defenderAntivirusEnabled = $defender.AntivirusEnabled
    defenderRealTimeProtectionEnabled = $defender.RealTimeProtectionEnabled
    activatedProductCount = $activation.Count
    recovery = $recovery
  }
  developmentTools = $developmentTools
  oraclePackageCount = $packages.Count
  certificateMatches = $certificateMatches
  historicalAdmissionSha256 = $contract.host.hostAdmissionSha256
  installationMediaEvidencePresent = $false
}
$temporary = "$OutputPath.partial-$PID"
if (Test-Path -LiteralPath $temporary) { throw "Continuity temporary path exists." }
try {
  $json = $record | ConvertTo-Json -Depth 32
  [IO.File]::WriteAllText($temporary, "$json`n", [Text.UTF8Encoding]::new($false))
  [IO.File]::Move($temporary, $OutputPath)
} finally {
  if (Test-Path -LiteralPath $temporary) {
    Remove-Item -LiteralPath $temporary -ErrorAction SilentlyContinue
  }
}
if ($issues.Count -ne 0) {
  throw "Host continuity failed closed: $($issues -join ', ')."
}
