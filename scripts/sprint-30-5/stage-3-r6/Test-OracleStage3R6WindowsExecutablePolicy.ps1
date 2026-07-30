[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage3R6WindowsExecutablePolicy.ps1")

$root = Join-Path $env:TEMP (
  "oracle-stage3-r6-windows-executable-" + [Guid]::NewGuid().ToString("N")
)
$windowsDirectory = Join-Path $root "Windows"
$systemDirectory = Join-Path $windowsDirectory "System32"
[void](New-Item -ItemType Directory -Path $systemDirectory)
try {
  foreach ($path in @(
    (Join-Path $windowsDirectory "explorer.exe"),
    (Join-Path $systemDirectory "certutil.exe"),
    (Join-Path $systemDirectory "reagentc.exe")
  )) {
    [IO.File]::WriteAllBytes($path, [byte[]]@(77, 90))
  }

  $explorer = Get-OracleStage3R6WindowsExecutablePath `
    -Name "explorer.exe" `
    -WindowsDirectory $windowsDirectory `
    -SystemDirectory $systemDirectory
  $certutil = Get-OracleStage3R6WindowsExecutablePath `
    -Name "certutil.exe" `
    -WindowsDirectory $windowsDirectory `
    -SystemDirectory $systemDirectory
  $reagentc = Get-OracleStage3R6WindowsExecutablePath `
    -Name "reagentc.exe" `
    -WindowsDirectory $windowsDirectory `
    -SystemDirectory $systemDirectory

  if (
    $explorer -cne [IO.Path]::GetFullPath(
      (Join-Path $windowsDirectory "explorer.exe")
    ) -or
    $certutil -cne [IO.Path]::GetFullPath(
      (Join-Path $systemDirectory "certutil.exe")
    ) -or
    $reagentc -cne [IO.Path]::GetFullPath(
      (Join-Path $systemDirectory "reagentc.exe")
    )
  ) { throw "Windows executable locations differ from the governed mapping." }

  $incorrectSystem32Explorer = Join-Path $systemDirectory "explorer.exe"
  if (Test-Path -LiteralPath $incorrectSystem32Explorer) {
    throw "Founder-QA-01 fixture unexpectedly contains System32 explorer.exe."
  }
  $missingExplorerRejected = $false
  Remove-Item -LiteralPath $explorer
  try {
    [void](Get-OracleStage3R6WindowsExecutablePath `
      -Name "explorer.exe" `
      -WindowsDirectory $windowsDirectory `
      -SystemDirectory $systemDirectory)
  } catch {
    $missingExplorerRejected = $true
  }
  if (-not $missingExplorerRejected) {
    throw "Missing Windows-root Explorer was not rejected."
  }
  $nonCanonicalNameRejected = $false
  try {
    [void](Get-OracleStage3R6WindowsExecutablePath `
      -Name "Explorer.exe" `
      -WindowsDirectory $windowsDirectory `
      -SystemDirectory $systemDirectory)
  } catch {
    $nonCanonicalNameRejected = $true
  }
  if (-not $nonCanonicalNameRejected) {
    throw "Non-canonical executable spelling was not rejected."
  }

  [ordered]@{
    result = "passed"
    founderQa01Shape = [ordered]@{
      windowsDirectory = "C:\Windows"
      systemDirectory = "C:\Windows\System32"
      system32ExplorerExists = $false
      windowsExplorerExists = $true
    }
    explorerUsesWindowsDirectory = $true
    systemToolsUseSystemDirectory = $true
    missingExplorerRejected = $missingExplorerRejected
    nonCanonicalNameRejected = $nonCanonicalNameRejected
  } | ConvertTo-Json -Depth 8
} finally {
  if (Test-Path -LiteralPath $root) {
    Remove-Item -LiteralPath $root -Recurse -Force
  }
}
