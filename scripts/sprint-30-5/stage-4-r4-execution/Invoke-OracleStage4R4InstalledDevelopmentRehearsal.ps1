[CmdletBinding()]
param([Parameter(Mandatory = $true)][string]$ResultPath)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
trap {
  try {
    $failurePath = [IO.Path]::GetFullPath($ResultPath)
    if (-not (Test-Path -LiteralPath $failurePath)) {
      [IO.Directory]::CreateDirectory((Split-Path -Parent $failurePath)) | Out-Null
      [IO.File]::WriteAllText(
        $failurePath,
        ("WRAPPER FAILURE`n" + ($_ | Out-String)),
        [Text.UTF8Encoding]::new($false)
      )
    }
  } catch {}
  exit 1
}
$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
$contract = Get-Content -Raw -LiteralPath (
  Join-Path $PSScriptRoot "Oracle.Stage4R4Contract.json"
) | ConvertFrom-Json
$rehearsalRoot = [IO.Path]::GetFullPath((
  Join-Path $repositoryRoot ([string]$contract.paths.rehearsalRoot)
))
$result = [IO.Path]::GetFullPath($ResultPath)
if (-not $result.StartsWith(
  $rehearsalRoot.TrimEnd('\') + '\',
  [StringComparison]::OrdinalIgnoreCase
)) {
  throw "Installed rehearsal result path escapes its non-evidence root."
}
if (Test-Path -LiteralPath $result) {
  throw "Installed rehearsal result path already exists."
}
$principal = [Security.Principal.WindowsPrincipal]::new(
  [Security.Principal.WindowsIdentity]::GetCurrent()
)
if (-not $principal.IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)) {
  throw "Installed Stage 4 R4 development rehearsal requires elevation."
}

[IO.Directory]::CreateDirectory((Split-Path -Parent $result)) | Out-Null
$node = [string]$contract.toolchain.approvedTools.node.path
$runner = Join-Path $PSScriptRoot "run-live-installed-development-rehearsal.mjs"
$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$output = & $node $runner 2>&1 | Out-String
$exitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference
$bytes = [Text.UTF8Encoding]::new($false).GetBytes($output)
$stream = [IO.FileStream]::new(
  $result,
  [IO.FileMode]::CreateNew,
  [IO.FileAccess]::Write,
  [IO.FileShare]::None
)
try {
  $stream.Write($bytes, 0, $bytes.Length)
  $stream.Flush($true)
} finally {
  $stream.Dispose()
}
if ($exitCode -ne 0) {
  throw "Installed Stage 4 R4 development rehearsal failed with exit code $exitCode."
}
Write-Output $output
