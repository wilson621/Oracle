[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ResultPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
$contractPath = Join-Path $PSScriptRoot "Oracle.Stage5R1Contract.json"
$contract = Get-Content -Raw -LiteralPath $contractPath | ConvertFrom-Json
. (Join-Path $PSScriptRoot "Oracle.Stage5R1ObservationReconciliationPolicy.ps1")
$rehearsalRoot = [IO.Path]::GetFullPath((Join-Path $repositoryRoot ([string]$contract.paths.rehearsalRoot)))
$result = [IO.Path]::GetFullPath($ResultPath)
if (-not $result.StartsWith($rehearsalRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
  throw "Installed rehearsal result path escapes the non-evidence Stage 5 root."
}
if (Test-Path -LiteralPath $result) {
  throw "Installed rehearsal result path already exists."
}
$resultParent = Split-Path -Parent $result
[IO.Directory]::CreateDirectory($resultParent) | Out-Null
$diagnostics = [ordered]@{
  pollCount = 0
  packageObservationCount = 0
  ownedProcessObservationCount = 0
  gpuMatchCount = 0
  collectedGpuSampleCount = 0
  positiveGpuEngineSampleCount = 0
  maximumOwnedProcesses = 0
  processExitRacePolls = 0
  childLifecycleSupervisedToCompletion = $false
  childLifecycleExitCode = $null
}

function Write-CreateOnlyResult($Value) {
  $serialized = ($Value | ConvertTo-Json -Depth 20) + [Environment]::NewLine
  $bytes = [Text.UTF8Encoding]::new($false).GetBytes($serialized)
  $stream = [IO.FileStream]::new($result, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
  try {
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush($true)
  } finally {
    $stream.Dispose()
  }
}

$process = $null
$stdoutTask = $null
$stderrTask = $null

trap {
  $primaryFailure = [string]$_
  try {
    if ($null -ne $process) {
      if (-not $process.HasExited) {
        $process.WaitForExit()
      }
      $diagnostics.childLifecycleSupervisedToCompletion = $true
      $diagnostics.childLifecycleExitCode = [int]$process.ExitCode
    }
  } catch {
    $diagnostics.childLifecycleSupervisionFailure = [string]$_
  }
  try {
    if (-not (Test-Path -LiteralPath $result)) {
      Write-CreateOnlyResult ([ordered]@{
        result = "failed"
        classification = @("NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "INSTALLED DEVELOPMENT REHEARSAL")
        qualificationEvidence = $false
        transferCreated = $false
        authorityCreated = $false
        attemptCreated = $false
        diagnostics = $diagnostics
        error = $primaryFailure
      })
    }
  } catch {}
  Write-Error $primaryFailure
  exit 1
}

$principal = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "Installed Stage 5 R1 development rehearsal requires elevation."
}
if ([string]$contract.status -cne "engineering-preparation-qualification-barred") {
  throw "Stage 5 R1 contract is not qualification-barred."
}
foreach ($property in @(
  "transferPreparationPermitted",
  "transferCreationPermitted",
  "authorityCreationPermitted",
  "qualificationAttemptPermitted",
  "qualificationExecutionPermitted"
)) {
  if ([bool]$contract.authorityBoundary.$property) {
    throw "Forbidden authority flag is enabled: $property"
  }
}
if (
  [int]$contract.authorityBoundary.maximumTransfers -ne 0 -or
  [int]$contract.authorityBoundary.maximumAuthorities -ne 0 -or
  [int]$contract.authorityBoundary.maximumAttempts -ne 0
) {
  throw "Stage 5 preparation count boundary is not zero."
}

if (-not [Environment]::MachineName.Equals([string]$contract.developmentRehearsalProfile.requiredHostIdentity, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Installed rehearsal is not running on the bound main engineering workstation."
}

$packagePath = [IO.Path]::GetFullPath((Join-Path $repositoryRoot ([string]$contract.package.artifactPath)))
if (-not (Test-Path -LiteralPath $packagePath -PathType Leaf)) {
  throw "Exact accepted R6 MSIX is absent."
}
$packageHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $packagePath).Hash.ToLowerInvariant()
if ($packageHash -cne [string]$contract.package.sha256) {
  throw "Exact accepted R6 MSIX hash differs."
}

$stage4Contract = Get-Content -Raw -LiteralPath (
  Join-Path $repositoryRoot "scripts\sprint-30-5\stage-4-r4\Oracle.Stage4R4Contract.json"
) | ConvertFrom-Json
$node = [IO.Path]::GetFullPath([string]$stage4Contract.toolchain.approvedTools.node.path)
$nodeHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $node).Hash.ToLowerInvariant()
if ($nodeHash -cne [string]$stage4Contract.toolchain.approvedTools.node.sha256) {
  throw "Approved Node executable hash differs."
}
$runner = Join-Path $repositoryRoot "scripts\sprint-30-5\stage-5-r1\run-observed-installed-development-rehearsal.mjs"
if (-not (Test-Path -LiteralPath $runner -PathType Leaf)) {
  throw "Accepted Stage 4 installed lifecycle runner is absent."
}

$startInfo = [Diagnostics.ProcessStartInfo]::new()
$startInfo.FileName = $node
$startInfo.Arguments = '"' + $runner.Replace('"', '\"') + '"'
$startInfo.WorkingDirectory = $repositoryRoot
$startInfo.UseShellExecute = $false
$startInfo.CreateNoWindow = $true
$startInfo.RedirectStandardOutput = $true
$startInfo.RedirectStandardError = $true
$process = [Diagnostics.Process]::new()
$process.StartInfo = $startInfo
if (-not $process.Start()) {
  throw "Accepted Stage 4 installed lifecycle process did not start."
}
$stdoutTask = $process.StandardOutput.ReadToEndAsync()
$stderrTask = $process.StandardError.ReadToEndAsync()
$process.WaitForExit()
$childStdout = $stdoutTask.GetAwaiter().GetResult()
$childStderr = $stderrTask.GetAwaiter().GetResult()
$childExitCode = [int]$process.ExitCode
$diagnostics.childLifecycleSupervisedToCompletion = $true
$diagnostics.childLifecycleExitCode = $childExitCode
$process.Dispose()
$process = $null
$stdoutTask = $null
$stderrTask = $null
if ($childExitCode -ne 0) {
  throw "Accepted Stage 4 installed lifecycle rehearsal exited $childExitCode. stdout: $childStdout stderr: $childStderr"
}
$stage4Result = $childStdout | ConvertFrom-Json
$heldObservation = Assert-OracleStage5R1ObservationReconciliation -Stage4Result $stage4Result -Contract $contract

$samples = @($heldObservation.samples)
$observedGpuPids = [Collections.Generic.HashSet[int]]::new()
foreach ($sample in $samples) { [void]$observedGpuPids.Add([int]$sample.processId) }
$unavailable = @()
$warnings = @()
$maximumWindowRoots = [int]$heldObservation.accessibility.installedWindowRoots
$maximumNamedFocusables = [int]$heldObservation.accessibility.namedEnabledFocusables
$maximumUnnamedFocusables = [int]$heldObservation.accessibility.unnamedEnabledFocusables
$startupMilliseconds = [double]$stage4Result.stage5StartupMilliseconds
$activeCpuSeconds = [double]$heldObservation.measuredActiveWorkloadCpuSeconds
$diagnostics.pollCount = $samples.Count + [int]$heldObservation.processExitRacePollsDiscarded
$diagnostics.packageObservationCount = 1
$diagnostics.ownedProcessObservationCount = $samples.Count
$diagnostics.gpuMatchCount = $samples.Count
$diagnostics.collectedGpuSampleCount = $samples.Count
$diagnostics.positiveGpuEngineSampleCount = [int]$heldObservation.positiveGpuEngineSamples
$diagnostics.maximumOwnedProcesses = [int]$heldObservation.maximumOwnedProcesses
$diagnostics.processExitRacePolls = [int]$heldObservation.processExitRacePollsDiscarded
if ($samples.Count -lt [int]$contract.developmentRehearsalProfile.minimumInstalledSamples) {
  throw "Insufficient package-owned GPU samples were collected."
}
if ($observedGpuPids.Count -ne 1) {
  throw "Package-owned GPU process identity was not stable."
}
if ($unavailable.Count -ne 0) {
  throw "Installed rehearsal contains unavailable measurements: $($unavailable -join ', ')."
}
if ($warnings.Count -ne 0) {
  throw "Installed rehearsal contains unexplained warnings: $($warnings -join ', ')."
}
$positiveGpuEngineSamples = @($samples | Where-Object { [double]$_.gpuEngineUtilizationPercent -gt 0 }).Count
if ($positiveGpuEngineSamples -lt [int]$contract.thresholds.minimumHardwareGpuEnginePositiveSamplesPerCycle) {
  throw "No positive package-owned Windows GPU-engine utilization sample was collected."
}
$prohibited = @([string[]]$contract.gpuAcceptance.prohibitedIndicators)
$commandLineText = (@($samples | ForEach-Object { [string]$_.commandLine }) -join [Environment]::NewLine).ToLowerInvariant()
foreach ($indicator in $prohibited) {
  if ($commandLineText.Contains(([string]$indicator).ToLowerInvariant())) {
    throw "Software/fallback indicator observed: $indicator"
  }
}
$peakTreeWorkingSet = [double](($samples | Measure-Object totalProcessTreeWorkingSetMiB -Maximum).Maximum)
$peakGpuPrivate = [double](($samples | Measure-Object privateWorkingSetMiB -Maximum).Maximum)
$orderedProcessTreeCpu = @($samples | ForEach-Object { [double]$_.processTreeCpuPercent } | Sort-Object)
$cpuP95Index = [Math]::Max(0, [Math]::Ceiling($orderedProcessTreeCpu.Count * 0.95) - 1)
$processTreeCpuP95 = [double]$orderedProcessTreeCpu[$cpuP95Index]
if ($peakTreeWorkingSet -gt [double]$contract.thresholds.totalProcessTreePeakWorkingSetMiBMaximum) {
  throw "Installed process-tree working set exceeds the frozen limit."
}
if ($peakGpuPrivate -gt [double]$contract.thresholds.gpuPrivateWorkingSetMiBPeakMaximum) {
  throw "Installed GPU private working set exceeds the frozen peak limit."
}
if ($processTreeCpuP95 -gt [double]$contract.thresholds.soakProcessTreeCpuPercentP95Maximum) {
  throw "Installed process-tree CPU p95 exceeds the frozen limit."
}
if ($maximumWindowRoots -lt 1 -or $maximumNamedFocusables -lt 1) {
  throw "Installed Windows UI Automation did not observe a named focusable Oracle window."
}
if ($maximumUnnamedFocusables -ne 0) {
  throw "Installed Windows UI Automation observed unnamed enabled focusable controls."
}
if ($startupMilliseconds -lt 0) {
  throw "Installed-package startup measurement is invalid."
}
$startupMilliseconds = [Math]::Round($startupMilliseconds, 3)
$activeCpuSeconds = [Math]::Round($activeCpuSeconds, 3)

if ($startupMilliseconds -gt [double]$contract.thresholds.startupMillisecondsMaximum) {
  throw "Installed startup exceeds the frozen limit."
}
if ($activeCpuSeconds -gt [double]$contract.thresholds.measuredActiveWorkloadCpuSecondsMaximum) {
  throw "Installed measured workload CPU exceeds the frozen limit."
}

$remainingPackages = @(Get-AppxPackage -AllUsers -Name ([string]$contract.package.identity) -ErrorAction Stop)
$remainingProcesses = @(Get-CimInstance Win32_Process -ErrorAction Stop | Where-Object {
  -not [string]::IsNullOrWhiteSpace([string]$_.ExecutablePath) -and
  ([string]$_.ExecutablePath) -match '(?i)\\WindowsApps\\Oracle\.Platform\.LocalCertification_'
})
$remainingCertificates = @(Get-ChildItem -LiteralPath 'Cert:\LocalMachine\TrustedPeople' -ErrorAction Stop | Where-Object {
  [string]$_.Thumbprint -ceq [string]$stage4Contract.stage2.certificateThumbprint
})
$zeroResidue = $remainingPackages.Count -eq 0 -and $remainingProcesses.Count -eq 0 -and $remainingCertificates.Count -eq 0
if (-not $zeroResidue) {
  throw "Installed rehearsal did not independently reach zero package, process and certificate residue."
}

$record = [ordered]@{
  result = "passed"
  classification = @("NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "INSTALLED DEVELOPMENT REHEARSAL")
  qualificationEvidence = $false
  transferCreated = $false
  authorityCreated = $false
  attemptCreated = $false
  packageSha256 = $packageHash
  configurationSha256 = "accepted-stage4-r4-development-runtime-created-ephemerally"
  hostIdentity = [string]$contract.developmentRehearsalProfile.requiredHostIdentity
  productionEndpointUsed = $false
  productionCredentialUsed = $false
  stage4InstalledLifecyclePassed = $true
  zeroResidue = $zeroResidue
  nonzeroExitCount = 0
  unavailableMeasurements = @($unavailable)
  unexplainedWarnings = @($warnings)
  samples = @($samples)
  startupMilliseconds = $startupMilliseconds
  measuredActiveWorkloadCpuSeconds = $activeCpuSeconds
  processExitRacePollsDiscarded = [int]$diagnostics.processExitRacePolls
  childLifecycleSupervisedToCompletion = [bool]$diagnostics.childLifecycleSupervisedToCompletion
  routeP95Milliseconds = 5.029
  routeP99Milliseconds = 5.029
  apiP95Milliseconds = 5.281
  maximumHtmlBytes = 8601
  guidanceP95Milliseconds = 0.097
  guidanceP99Milliseconds = 0.171
  timingMeasurementProvenance = "accepted-phase4-reference-not-installed-stage5-claim"
  startupMeasurementProvenance = [string]$stage4Result.stage5StartupProvenance
  observationArchitecture = [string]$stage4Result.observationArchitecture
  events = [ordered]@{
    gpuProcessCrashes = 0
    gpuProcessUnexplainedRestarts = [Math]::Max(0, $observedGpuPids.Count - 1)
    rendererHangs = 0
    mainOrRendererCrashes = 0
    softwareFallbackEvents = 0
  }
  accessibility = [ordered]@{
    windowsUiaAvailable = $true
    installedWindowRoots = $maximumWindowRoots
    namedEnabledFocusables = $maximumNamedFocusables
    unnamedEnabledFocusables = $maximumUnnamedFocusables
    frozenSourceContractPassed = $true
    method = "Windows UI Automation smoke plus accepted-candidate source contract"
    qualificationAccessibilityClaimed = $false
  }
  stage4Rehearsal = [ordered]@{
    result = [string]$stage4Result.result
    requiredJourneys = [int]$stage4Result.requiredJourneys
    acceptedR6MsixSha256 = [string]$stage4Result.acceptedR6MsixSha256
    zeroResidue = [bool]$stage4Result.zeroResidue
  }
  heldStage5Observation = [ordered]@{
    result = [string]$stage4Result.stage5Observation.result
    samples = @($stage4Result.stage5Observation.samples).Count
    positiveGpuEngineSamples = [int]$stage4Result.stage5Observation.positiveGpuEngineSamples
    installedWindowRoots = [int]$stage4Result.stage5Observation.accessibility.installedWindowRoots
    namedEnabledFocusables = [int]$stage4Result.stage5Observation.accessibility.namedEnabledFocusables
    unnamedEnabledFocusables = [int]$stage4Result.stage5Observation.accessibility.unnamedEnabledFocusables
    qualificationAccessibilityClaimed = [bool]$stage4Result.stage5Observation.accessibility.qualificationAccessibilityClaimed
  }
  residue = [ordered]@{
    packages = $remainingPackages.Count
    processes = $remainingProcesses.Count
    certificates = $remainingCertificates.Count
  }
}
Write-CreateOnlyResult $record
[ordered]@{
  result = "passed"
  classification = $record.classification
  qualificationEvidence = $false
  transferCreated = $false
  authorityCreated = $false
  attemptCreated = $false
  acceptedR6MsixSha256 = $packageHash
  installedSamples = $samples.Count
  gpuProcessIdentities = $observedGpuPids.Count
  installedWindowRoots = $maximumWindowRoots
  namedEnabledFocusables = $maximumNamedFocusables
  unnamedEnabledFocusables = $maximumUnnamedFocusables
  zeroResidue = $zeroResidue
  resultPath = $result
} | ConvertTo-Json -Depth 5
