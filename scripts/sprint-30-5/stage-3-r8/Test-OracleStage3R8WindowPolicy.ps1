[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage3R8WindowPolicy.ps1")

$json = @'
[
  {"handle":"123","title":"Oracle","processId":9808,"processName":"Oracle","visible":true,"minimized":false,"x":0,"y":0,"width":800,"height":600},
  {"handle":"456","title":"Other","processId":42,"processName":"Other","visible":true,"minimized":false,"x":0,"y":0,"width":640,"height":480}
]
'@
$windows = @(ConvertFrom-OracleStage3R8WindowDiscoveryJson -Json $json)
if (
  $windows.Count -ne 2 -or
  $windows[0] -is [Array] -or
  -not (Test-OracleStage3R8QualifyingWindow $windows[0]) -or
  (Test-OracleStage3R8QualifyingWindow $windows[1])
) { throw "Multi-window discovery JSON was not normalized deterministically." }

$empty = @(ConvertFrom-OracleStage3R8WindowDiscoveryJson -Json "[]")
if ($empty.Count -ne 0) { throw "Empty discovery array changed shape." }

foreach ($invalid in @(
  '{"handle":"1"}',
  '[[{"handle":"1"}]]',
  '[{"handle":["1"],"title":"Oracle","processId":9808,"processName":"Oracle","visible":true,"minimized":false,"x":0,"y":0,"width":1,"height":1}]'
)) {
  $failed = $false
  try {
    $values = @(ConvertFrom-OracleStage3R8WindowDiscoveryJson -Json $invalid)
    foreach ($value in $values) {
      [void](Test-OracleStage3R8QualifyingWindow $value)
    }
  } catch { $failed = $true }
  if (-not $failed) { throw "Malformed discovery fixture passed." }
}

$expectedFamily = "Oracle.Platform.LocalCertification_fixture"
$ownership = Assert-OracleStage3R8ProcessPackageOwnership `
  -ProcessId 9808 -ExpectedPackageFamilyName $expectedFamily `
  -Resolver { param($ProcessId) $expectedFamily.ToUpperInvariant() }
if (
  $ownership.matched -ne $true -or
  [int]$ownership.processId -ne 9808 -or
  [string]$ownership.comparison -cne "ordinal-ignore-case"
) { throw "Exact AppModel package ownership fixture differs." }

$wrongOwnerFailed = $false
try {
  [void](Assert-OracleStage3R8ProcessPackageOwnership `
    -ProcessId 9808 -ExpectedPackageFamilyName $expectedFamily `
    -Resolver { param($ProcessId) "Different.Package_family" })
} catch { $wrongOwnerFailed = $true }
if (-not $wrongOwnerFailed) { throw "Wrong AppModel package owner passed." }

$missingOwnerFailed = $false
try {
  [void](Assert-OracleStage3R8ProcessPackageOwnership `
    -ProcessId 9808 -ExpectedPackageFamilyName $expectedFamily `
    -Resolver { param($ProcessId) $null })
} catch { $missingOwnerFailed = $true }
if (-not $missingOwnerFailed) { throw "Missing AppModel package owner passed." }

[ordered]@{
  result = "passed"
  powershell = $PSVersionTable.PSVersion.ToString()
  multiWindowArrayFlattened = $true
  malformedShapesRejected = $true
  exactAppModelOwnershipRequired = $true
  wrongAndMissingOwnershipRejected = $true
  evidencePid = 9808
} | ConvertTo-Json -Depth 6
