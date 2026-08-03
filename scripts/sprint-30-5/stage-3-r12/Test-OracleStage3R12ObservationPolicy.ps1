[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage3R12ObservationPolicy.ps1")

$elapsedValues = [Collections.Generic.Queue[double]]::new()
foreach ($value in @(0.0, 59929.0, 60000.0)) {
  $elapsedValues.Enqueue($value)
}
$utcValues = [Collections.Generic.Queue[DateTime]]::new()
foreach ($value in @(
  [DateTime]::Parse("2026-07-30T21:00:00.000Z").ToUniversalTime(),
  [DateTime]::Parse("2026-07-30T21:00:59.929Z").ToUniversalTime(),
  [DateTime]::Parse("2026-07-30T21:01:00.000Z").ToUniversalTime()
)) {
  $utcValues.Enqueue($value)
}
$captures = 0
$sleeps = 0
$result = Invoke-OracleStage3R12CompleteStableObservation `
  -RequiredDurationSeconds 60 `
  -CaptureSample {
    $script:captures++
    [pscustomobject]@{
      exists = $true
      visible = $true
      minimized = $false
      width = 1200
      height = 800
    }
  } `
  -GetElapsedMilliseconds { $elapsedValues.Dequeue() } `
  -GetUtcNow { $utcValues.Dequeue() } `
  -Sleep { param($Milliseconds) $script:sleeps++ }

if (
  $captures -ne 3 -or $sleeps -ne 2 -or
  [double]$result.measuredDurationMilliseconds -ne 60000.0 -or
  [int]$result.sampleCount -ne 3 -or
  [double]$result.samples[1].elapsedFromFirstValidSampleMilliseconds -ne
    59929.0
) {
  throw "R12 stopped before captured evidence proved sixty complete seconds."
}

$backwardsFailed = $false
$backwardsElapsed = [Collections.Generic.Queue[double]]::new()
$backwardsElapsed.Enqueue(10.0)
$backwardsElapsed.Enqueue(9.0)
try {
  [void](Invoke-OracleStage3R12CompleteStableObservation `
    -RequiredDurationSeconds 1 `
    -CaptureSample { [pscustomobject]@{ valid = $true } } `
    -GetElapsedMilliseconds { $backwardsElapsed.Dequeue() } `
    -GetUtcNow { [DateTime]::UtcNow } `
    -Sleep { param($Milliseconds) })
} catch { $backwardsFailed = $true }
if (-not $backwardsFailed) { throw "Backwards monotonic time passed." }

$invalidSampleFailed = $false
try {
  [void](Invoke-OracleStage3R12CompleteStableObservation `
    -RequiredDurationSeconds 1 `
    -CaptureSample { @() } `
    -GetElapsedMilliseconds { 0.0 } `
    -GetUtcNow { [DateTime]::UtcNow } `
    -Sleep { param($Milliseconds) })
} catch { $invalidSampleFailed = $true }
if (-not $invalidSampleFailed) { throw "Missing observation sample passed." }

$defaultClock = Invoke-OracleStage3R12CompleteStableObservation `
  -RequiredDurationSeconds 1 `
  -PollIntervalMilliseconds 25 `
  -CaptureSample { [pscustomobject]@{ valid = $true } }
if (
  [double]$defaultClock.measuredDurationMilliseconds -lt 1000.0 -or
  [int]$defaultClock.sampleCount -lt 2
) { throw "Default monotonic clock completed before one full second." }

[ordered]@{
  result = "passed"
  founderObservedShortfallMilliseconds = 71
  shortSampleDidNotComplete = $true
  exactMinimumCompleted = $true
  measuredDurationMilliseconds = $result.measuredDurationMilliseconds
  sampleCount = $result.sampleCount
  backwardsTimeRejected = $backwardsFailed
  invalidSampleRejected = $invalidSampleFailed
  defaultClockMeasuredAtLeastOneSecond = $true
} | ConvertTo-Json -Depth 8
