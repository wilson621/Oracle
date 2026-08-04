function Assert-OracleStage5R1ObservationReconciliation(
  [Parameter(Mandatory = $true)]$Stage4Result,
  [Parameter(Mandatory = $true)]$Contract
) {
  if (
    [string]$Stage4Result.result -cne "passed" -or
    -not [bool]$Stage4Result.installedPackageExercised -or
    -not [bool]$Stage4Result.zeroResidue -or
    [bool]$Stage4Result.authorityCreated -or
    [bool]$Stage4Result.attemptCreated -or
    [bool]$Stage4Result.qualificationEvidence
  ) {
    throw "Accepted Stage 4 installed lifecycle did not return the required rehearsal result."
  }
  if ([string]$Stage4Result.observationArchitecture -cne [string]$Contract.developmentRehearsalProfile.observationArchitecture) {
    throw "Observed lifecycle architecture differs from the single-observer contract."
  }
  if ([string]$Stage4Result.stage5StartupProvenance -cne "package-installed-to-first-held-observation-sample") {
    throw "Held-observer startup provenance differs."
  }
  $startup = [double]$Stage4Result.stage5StartupMilliseconds
  if ([double]::IsNaN($startup) -or [double]::IsInfinity($startup) -or $startup -lt 0) {
    throw "Held-observer startup measurement is invalid."
  }
  $observation = $Stage4Result.stage5Observation
  if ($null -eq $observation -or [string]$observation.result -cne "passed") {
    throw "Single held Stage 5 observation is absent or failed."
  }
  $expectedClassification = @("NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "INSTALLED DEVELOPMENT REHEARSAL")
  if (@(Compare-Object -ReferenceObject $expectedClassification -DifferenceObject @($observation.classification) -SyncWindow 0).Count -ne 0) {
    throw "Held-observer classification differs."
  }
  foreach ($property in @("qualificationEvidence", "transferCreated", "authorityCreated", "attemptCreated")) {
    if ([bool]$observation.$property) { throw "Held observation asserts forbidden state: $property" }
  }
  $samples = @($observation.samples)
  if ($samples.Count -lt [int]$Contract.developmentRehearsalProfile.minimumHeldObservationSamples) {
    throw "Held observation has insufficient complete samples."
  }
  $elapsed = [double]$observation.heldObservationElapsedSeconds
  if ([double]::IsNaN($elapsed) -or [double]::IsInfinity($elapsed) -or
    $elapsed -lt [double]$Contract.developmentRehearsalProfile.heldObservationMinimumSeconds -or
    $elapsed -gt [double]$Contract.developmentRehearsalProfile.heldObservationCompletionMaximumSeconds) {
    throw "Held observation elapsed time violates its frozen bounds."
  }
  if ([int]$observation.positiveGpuEngineSamples -lt [int]$Contract.thresholds.minimumHardwareGpuEnginePositiveSamplesPerCycle) {
    throw "Held observation has no positive exact-package GPU-engine sample."
  }
  if ([int]$observation.renderStimulusOperations -lt 4 -or
    [string]$observation.renderStimulus -cne [string]$Contract.developmentRehearsalProfile.ownedWindowRenderStimulus) {
    throw "Held observation did not apply the frozen concurrent owned-window render stimulus."
  }
  if ([string]$observation.measurementOwnership -cne "exact-package-executable-path-with-owned-root-and-single-tree") {
    throw "Held-observer measurement ownership differs."
  }
  $observation
}
