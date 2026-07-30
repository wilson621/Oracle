[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage3R7WindowsExecutablePolicy.ps1")

$root = Join-Path $env:TEMP (
  "oracle-stage3-r7-windows-executable-" + [Guid]::NewGuid().ToString("N")
)
$systemDirectory = Join-Path $root "System32"
[void](New-Item -ItemType Directory -Path $systemDirectory)
try {
  foreach ($path in @(
    (Join-Path $systemDirectory "certutil.exe"),
    (Join-Path $systemDirectory "reagentc.exe")
  )) {
    [IO.File]::WriteAllBytes($path, [byte[]]@(77, 90))
  }

  $certutil = Get-OracleStage3R7WindowsExecutablePath `
    -Name "certutil.exe" `
    -SystemDirectory $systemDirectory
  $reagentc = Get-OracleStage3R7WindowsExecutablePath `
    -Name "reagentc.exe" `
    -SystemDirectory $systemDirectory

  if (
    $certutil -cne [IO.Path]::GetFullPath(
      (Join-Path $systemDirectory "certutil.exe")
    ) -or
    $reagentc -cne [IO.Path]::GetFullPath(
      (Join-Path $systemDirectory "reagentc.exe")
    )
  ) { throw "Windows executable locations differ from the governed mapping." }

  $explorerRejected = $false
  try {
    [void](Get-OracleStage3R7WindowsExecutablePath `
      -Name "explorer.exe" `
      -SystemDirectory $systemDirectory)
  } catch {
    $explorerRejected = $true
  }
  if (-not $explorerRejected) {
    throw "Explorer remained part of the governed executable policy."
  }
  $nonCanonicalNameRejected = $false
  try {
    [void](Get-OracleStage3R7WindowsExecutablePath `
      -Name "Explorer.exe" `
      -SystemDirectory $systemDirectory)
  } catch {
    $nonCanonicalNameRejected = $true
  }
  if (-not $nonCanonicalNameRejected) {
    throw "Non-canonical executable spelling was not rejected."
  }

  [ordered]@{
    result = "passed"
    explorerExcluded = $explorerRejected
    systemToolsUseSystemDirectory = $true
    nonCanonicalNameRejected = $nonCanonicalNameRejected
  } | ConvertTo-Json -Depth 8
} finally {
  if (Test-Path -LiteralPath $root) {
    Remove-Item -LiteralPath $root -Recurse -Force
  }
}
