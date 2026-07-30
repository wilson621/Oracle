Set-StrictMode -Version Latest

function Invoke-OracleStage3R9CompleteStableObservation {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][ValidateRange(1, [int]::MaxValue)]
    [int]$RequiredDurationSeconds,
    [Parameter(Mandatory = $true)][scriptblock]$CaptureSample,
    [ValidateRange(0, 60000)][int]$PollIntervalMilliseconds = 1000,
    [scriptblock]$GetElapsedMilliseconds,
    [scriptblock]$GetUtcNow,
    [scriptblock]$Sleep
  )

  $clock = [Diagnostics.Stopwatch]::StartNew()
  $elapsedProvider = if ($null -eq $GetElapsedMilliseconds) {
    { $clock.Elapsed.TotalMilliseconds }
  } else {
    $GetElapsedMilliseconds
  }
  $utcProvider = if ($null -eq $GetUtcNow) {
    { [DateTime]::UtcNow }
  } else {
    $GetUtcNow
  }
  $sleepAction = if ($null -eq $Sleep) {
    { param($Milliseconds) Start-Sleep -Milliseconds $Milliseconds }
  } else {
    $Sleep
  }

  $requiredMilliseconds = [int64]$RequiredDurationSeconds * 1000L
  $samples = [Collections.Generic.List[object]]::new()
  $firstElapsed = $null
  $previousElapsed = $null
  $firstUtc = $null
  $previousUtc = $null

  while ($true) {
    $value = & $CaptureSample
    if ($null -eq $value -or $value -is [Array]) {
      throw "Stable observation capture returned no single sample."
    }

    $elapsed = [double](& $elapsedProvider)
    if (
      [double]::IsNaN($elapsed) -or
      [double]::IsInfinity($elapsed) -or
      $elapsed -lt 0
    ) { throw "Stable observation monotonic time is invalid." }

    $utcValue = & $utcProvider
    if ($null -eq $utcValue) {
      throw "Stable observation UTC timestamp is unavailable."
    }
    $utc = ([DateTime]$utcValue).ToUniversalTime()

    if ($null -eq $firstElapsed) {
      $firstElapsed = $elapsed
      $previousElapsed = $elapsed
      $firstUtc = $utc
      $previousUtc = $utc
    } elseif (
      $elapsed -lt [double]$previousElapsed -or
      $utc -lt [DateTime]$previousUtc
    ) {
      throw "Stable observation time moved backwards."
    }

    $measured = $elapsed - [double]$firstElapsed
    $samples.Add([ordered]@{
      recordedAtUtc = $utc.ToString("o")
      elapsedFromFirstValidSampleMilliseconds = $measured
      value = $value
    })
    $previousElapsed = $elapsed
    $previousUtc = $utc

    if ($measured -ge $requiredMilliseconds) { break }
    & $sleepAction $PollIntervalMilliseconds
  }

  $finalMeasured = [double]$previousElapsed - [double]$firstElapsed
  if ($finalMeasured -lt $requiredMilliseconds -or $samples.Count -lt 2) {
    throw "Stable observation did not prove the complete mandatory duration."
  }

  [ordered]@{
    requiredDurationSeconds = $RequiredDurationSeconds
    requiredDurationMilliseconds = $requiredMilliseconds
    measuredDurationMilliseconds = $finalMeasured
    measuredDurationSeconds = $finalMeasured / 1000.0
    firstValidSampleAtUtc = ([DateTime]$firstUtc).ToString("o")
    finalValidSampleAtUtc = ([DateTime]$previousUtc).ToString("o")
    sampleCount = $samples.Count
    samples = @($samples)
  }
}
