[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage3R13WindowPolicy.ps1")

$json = @'
[
  {"handle":"123","title":"Oracle","processId":9808,"processName":"Oracle","visible":true,"minimized":false,"x":0,"y":0,"width":800,"height":600},
  {"handle":"456","title":"Other","processId":42,"processName":"Other","visible":true,"minimized":false,"x":0,"y":0,"width":640,"height":480}
]
'@
$windows = @(ConvertFrom-OracleStage3R13WindowDiscoveryJson -Json $json)
if (
  $windows.Count -ne 2 -or
  $windows[0] -is [Array] -or
  -not (Test-OracleStage3R13QualifyingWindow $windows[0]) -or
  (Test-OracleStage3R13QualifyingWindow $windows[1])
) { throw "Multi-window discovery JSON was not normalized deterministically." }

$empty = @(ConvertFrom-OracleStage3R13WindowDiscoveryJson -Json "[]")
if ($empty.Count -ne 0) { throw "Empty discovery array changed shape." }

foreach ($invalid in @(
  '{"handle":"1"}',
  '[[{"handle":"1"}]]',
  '[{"handle":["1"],"title":"Oracle","processId":9808,"processName":"Oracle","visible":true,"minimized":false,"x":0,"y":0,"width":1,"height":1}]'
)) {
  $failed = $false
  try {
    $values = @(ConvertFrom-OracleStage3R13WindowDiscoveryJson -Json $invalid)
    foreach ($value in $values) {
      [void](Test-OracleStage3R13QualifyingWindow $value)
    }
  } catch { $failed = $true }
  if (-not $failed) { throw "Malformed discovery fixture passed." }
}

$expectedFamily = "Oracle.Platform.LocalCertification_fixture"
$ownership = Assert-OracleStage3R13ProcessPackageOwnership `
  -ProcessId 9808 -ExpectedPackageFamilyName $expectedFamily `
  -Resolver { param($ProcessId) $expectedFamily.ToUpperInvariant() }
if (
  $ownership.matched -ne $true -or
  [int]$ownership.processId -ne 9808 -or
  [string]$ownership.comparison -cne "ordinal-ignore-case"
) { throw "Exact AppModel package ownership fixture differs." }

$wrongOwnerFailed = $false
try {
  [void](Assert-OracleStage3R13ProcessPackageOwnership `
    -ProcessId 9808 -ExpectedPackageFamilyName $expectedFamily `
    -Resolver { param($ProcessId) "Different.Package_family" })
} catch { $wrongOwnerFailed = $true }
if (-not $wrongOwnerFailed) { throw "Wrong AppModel package owner passed." }

$missingOwnerFailed = $false
try {
  [void](Assert-OracleStage3R13ProcessPackageOwnership `
    -ProcessId 9808 -ExpectedPackageFamilyName $expectedFamily `
    -Resolver { param($ProcessId) $null })
} catch { $missingOwnerFailed = $true }
if (-not $missingOwnerFailed) { throw "Missing AppModel package owner passed." }

Initialize-OracleStage3R13AppModelProcessIdentity
$exitedResolution = Resolve-OracleStage3R13TeardownProcessOwnership `
  -ProcessId 9808 -ExpectedPackageFamilyName $expectedFamily `
  -OwnershipResolver {
    param($ProcessId)
    throw [Oracle.Stage3R13.ProcessOpenException]::new(
      [uint32]$ProcessId, 87
    )
  } `
  -ProcessExists { param($ProcessId) $false }
if (
  [string]$exitedResolution.classification -cne
    "exited-before-ownership-query" -or
  [bool]$exitedResolution.safeToStop
) { throw "Exited-process ownership race was not classified safely." }

$liveOpenFailureRejected = $false
try {
  [void](Resolve-OracleStage3R13TeardownProcessOwnership `
    -ProcessId 9808 -ExpectedPackageFamilyName $expectedFamily `
    -OwnershipResolver {
      param($ProcessId)
      throw [Oracle.Stage3R13.ProcessOpenException]::new(
        [uint32]$ProcessId, 5
      )
    } `
    -ProcessExists { param($ProcessId) $true })
} catch { $liveOpenFailureRejected = $true }
if (-not $liveOpenFailureRejected) {
  throw "Unverifiable live process passed teardown ownership classification."
}

$exitedAccessDeniedRejected = $false
try {
  [void](Resolve-OracleStage3R13TeardownProcessOwnership `
    -ProcessId 9808 -ExpectedPackageFamilyName $expectedFamily `
    -OwnershipResolver {
      param($ProcessId)
      throw [Oracle.Stage3R13.ProcessOpenException]::new(
        [uint32]$ProcessId, 5
      )
    } `
    -ProcessExists { param($ProcessId) $false })
} catch { $exitedAccessDeniedRejected = $true }
if (-not $exitedAccessDeniedRejected) {
  throw "Access denial was weakened by later process exit."
}

$exitedWrongOwnerRejected = $false
try {
  [void](Resolve-OracleStage3R13TeardownProcessOwnership `
    -ProcessId 9808 -ExpectedPackageFamilyName $expectedFamily `
    -OwnershipResolver { param($ProcessId) "Different.Package_family" } `
    -ProcessExists { param($ProcessId) $false })
} catch { $exitedWrongOwnerRejected = $true }
if (-not $exitedWrongOwnerRejected) {
  throw "Identity mismatch was weakened by later process exit."
}

$livePidConfirmed = Test-OracleStage3R13ProcessExists -ProcessId $PID
if (-not $livePidConfirmed) {
  throw "The current live PowerShell PID was not affirmatively detected."
}
$absentPidConfirmed = -not (
  Test-OracleStage3R13ProcessExists -ProcessId ([int]::MaxValue)
)
if (-not $absentPidConfirmed) {
  throw "The explicit no-process result was not classified as PID absence."
}
$processQueryFailureRejected = $false
try {
  [void](Test-OracleStage3R13ProcessExists -ProcessId 9808 -ProcessQuery {
    param($ProcessId)
    throw [UnauthorizedAccessException]::new(
      "Synthetic process-query access failure."
    )
  })
} catch { $processQueryFailureRejected = $true }
if (-not $processQueryFailureRejected) {
  throw "A process-query failure was classified as PID absence."
}
$emptyProcessQueryRejected = $false
try {
  [void](Test-OracleStage3R13ProcessExists -ProcessId 9808 -ProcessQuery {
    param($ProcessId)
    @()
  })
} catch { $emptyProcessQueryRejected = $true }
if (-not $emptyProcessQueryRejected) {
  throw "An empty process-query result was classified as PID absence."
}

[ordered]@{
  result = "passed"
  powershell = $PSVersionTable.PSVersion.ToString()
  multiWindowArrayFlattened = $true
  malformedShapesRejected = $true
  exactAppModelOwnershipRequired = $true
  wrongAndMissingOwnershipRejected = $true
  exitedOpenProcessRaceClassified = $true
  unverifiableLiveProcessRejected = $liveOpenFailureRejected
  accessDeniedRemainsFailClosed = $exitedAccessDeniedRejected
  identityMismatchRemainsFailClosed = $exitedWrongOwnerRejected
  livePidAffirmativelyDetected = $livePidConfirmed
  absentPidRequiresExplicitNoProcessResult = $absentPidConfirmed
  processQueryFailureRejected = $processQueryFailureRejected
  emptyProcessQueryRejected = $emptyProcessQueryRejected
  evidencePid = 9808
} | ConvertTo-Json -Depth 6
