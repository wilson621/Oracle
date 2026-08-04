[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$contract = Get-Content -Raw -LiteralPath (
  Join-Path $PSScriptRoot "Oracle.Stage5R1Contract.json"
) | ConvertFrom-Json
. (Join-Path $PSScriptRoot "Oracle.Stage5R1ObservationOwnershipPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage5R1ObservationReconciliationPolicy.ps1")

foreach ($property in @(
  "transferPreparationPermitted",
  "transferCreationPermitted",
  "authorityCreationPermitted",
  "qualificationAttemptPermitted",
  "qualificationExecutionPermitted"
)) {
  if (-not [bool]$contract.authorityBoundary.$property) {
    throw "Authorised execution flag is disabled: $property"
  }
}
if ([int]$contract.authorityBoundary.maximumTransfers -ne 2 -or [int]$contract.authorityBoundary.maximumReplacementTransfers -ne 1 -or [int]$contract.authorityBoundary.maximumAdmissibleTransfers -ne 1 -or [int]$contract.authorityBoundary.maximumAuthorities -ne 1 -or [int]$contract.authorityBoundary.maximumAttempts -ne 1 -or [bool]$contract.authorityBoundary.retryPermitted) { throw "Execution cardinality boundary differs." }
if ([string]$contract.transfer.historicalFailedTransfer.transferId -cne "transfer-stage5-r1-20260804T174913211Z-e7b00bae" -or -not [bool]$contract.transfer.historicalFailedTransfer.admissionProhibited -or -not [bool]$contract.transfer.historicalFailedTransfer.executionProhibited) { throw "Immutable failed-transfer boundary differs." }
if ([int]$contract.developmentRehearsalProfile.heldObservationMinimumSeconds -lt 30) {
  throw "Held observation minimum-duration policy is weaker than 30 seconds."
}
if ([int]$contract.developmentRehearsalProfile.heldObservationPollStartMaximumSeconds -lt 180 -or
  [int]$contract.developmentRehearsalProfile.heldObservationCompletionMaximumSeconds -lt 240) {
  throw "Held observation safety bounds are weaker than the frozen correction."
}
if ([int]$contract.developmentRehearsalProfile.minimumHeldObservationSamples -lt 5) {
  throw "Held observation sample policy is weaker than five samples."
}
if (-not [bool]$contract.developmentRehearsalProfile.ownedWindowRenderStimulusRequired -or
  [string]$contract.developmentRehearsalProfile.ownedWindowRenderStimulus -cne "concurrent-owned-window-foreground-reflow-focus-navigation-with-bounds-restoration") {
  throw "Owned-window render stimulus contract differs."
}
$wrapperSource = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot "Invoke-OracleStage5R1InstalledDevelopmentRehearsal.ps1")
$stdoutReadIndex = $wrapperSource.IndexOf('$stdoutTask = $process.StandardOutput.ReadToEndAsync()', [StringComparison]::Ordinal)
$stderrReadIndex = $wrapperSource.IndexOf('$stderrTask = $process.StandardError.ReadToEndAsync()', [StringComparison]::Ordinal)
$waitIndex = $wrapperSource.LastIndexOf('$process.WaitForExit()', [StringComparison]::Ordinal)
if ($stdoutReadIndex -lt 0 -or $stderrReadIndex -lt 0 -or $waitIndex -lt 0 -or
  $stdoutReadIndex -gt $waitIndex -or $stderrReadIndex -gt $waitIndex) {
  throw "Installed wrapper does not drain redirected output asynchronously before waiting."
}
if ($wrapperSource.Contains('$process.WaitForExit()' + [Environment]::NewLine + '$childStdout = $process.StandardOutput.ReadToEnd()')) {
  throw "Installed wrapper retains the redirected-output pipe deadlock ordering."
}
$observerSource = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot "Measure-OracleStage5R1InstalledPackage.ps1")
foreach ($requiredSource in @("GetWindowRect", "SetWindowPos", "RedrawWindow", "SetForegroundWindow", "PostMessage", "keyDown", "keyUp", "Thread", "-SampleInterval 1 -MaxSamples", "ORACLE_STAGE5_QUALIFICATION_CYCLE", "qualificationProtocol.sampleCadenceMilliseconds", "finally", "PrivatePageCount", "KernelModeTime", "UserModeTime", "CreationDate", "processExitRacePolls")) {
  if (-not $observerSource.Contains($requiredSource)) { throw "Observer implementation is incomplete: $requiredSource" }
}
foreach ($prohibitedSource in @("priorForeground", "Could not restore the previously foreground window")) {
  if ($observerSource.Contains($prohibitedSource)) {
    throw "Observer retains the invalid cross-process foreground-restoration gate: $prohibitedSource"
  }
}
if ($observerSource.Contains('Get-Process -Id $processIds -ErrorAction Stop')) {
  throw "Observer retains the racy bulk process lookup."
}
$nativeMatch = [regex]::Match($observerSource, '(?s)Add-Type -TypeDefinition @"\r?\n(.*?)\r?\n"@')
if (-not $nativeMatch.Success) { throw "Concurrent render-pulse native implementation was not found." }
Add-Type -TypeDefinition $nativeMatch.Groups[1].Value
$invalidPulse = [OracleStage5RenderPulse]::Start([IntPtr]::Zero, 10)
$invalidPulse.Worker.Join()
if ([string]::IsNullOrWhiteSpace([string]$invalidPulse.Error) -or [int]$invalidPulse.Operations -ne 0) {
  throw "Concurrent render pulse did not fail closed for an invalid window handle."
}
if ([string]$contract.developmentRehearsalProfile.processExitRaceDisposition -cne "discard-poll-after-current-gpu-identity-revalidation") {
  throw "Process-exit race disposition differs."
}
$wrapperSource = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot "Invoke-OracleStage5R1InstalledDevelopmentRehearsal.ps1")
if ($wrapperSource -match '(?m)^\s*childLifecycleSupervisedToCompletion\s*=\s*false\s*$') {
  throw "Outer wrapper uses a bare PowerShell boolean literal."
}
if ($wrapperSource -notmatch '(?m)^\s*childLifecycleSupervisedToCompletion\s*=\s*\$false\s*$') {
  throw "Outer wrapper diagnostic boolean is not initialized safely."
}
foreach ($requiredSource in @("stage5Observation", "stage5StartupMilliseconds", "childLifecycleSupervisedToCompletion", '$process.WaitForExit()', "zeroResidue")) {
  if (-not $wrapperSource.Contains($requiredSource)) { throw "Outer supervisor/reconciler implementation is incomplete: $requiredSource" }
}
foreach ($prohibitedSource in @("UIAutomationClient", "Get-Counter", 'while (-not $process.HasExited)', 'Get-Process -Id $processIds', 'Get-Process -Id $gpuPid')) {
  if ($wrapperSource.Contains($prohibitedSource)) { throw "Outer wrapper retains duplicate observation logic: $prohibitedSource" }
}
if ([string]$contract.developmentRehearsalProfile.observationArchitecture -cne "single-held-observer-with-supervised-outer-reconciliation") {
  throw "Single-observer architecture contract differs."
}

$reconciledObservation = [pscustomobject]@{
  result = "passed"
  classification = @("NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "INSTALLED DEVELOPMENT REHEARSAL")
  qualificationEvidence = $false
  transferCreated = $false
  authorityCreated = $false
  attemptCreated = $false
  samples = @(1..([int]$contract.developmentRehearsalProfile.minimumHeldObservationSamples) | ForEach-Object { [pscustomobject]@{ processId = 42 } })
  positiveGpuEngineSamples = 1
  renderStimulusOperations = 4
  renderStimulus = "concurrent-owned-window-foreground-reflow-focus-navigation-with-bounds-restoration"
  measurementOwnership = "exact-package-executable-path-with-owned-root-and-single-tree"
  heldObservationElapsedSeconds = 35
}
$reconciledStage4 = [pscustomobject]@{
  result = "passed"
  installedPackageExercised = $true
  zeroResidue = $true
  authorityCreated = $false
  attemptCreated = $false
  qualificationEvidence = $false
  observationArchitecture = "single-held-observer-with-supervised-outer-reconciliation"
  stage5StartupProvenance = "package-installed-to-first-held-observation-sample"
  stage5StartupMilliseconds = 1000
  stage5Observation = $reconciledObservation
}
Assert-OracleStage5R1ObservationReconciliation -Stage4Result $reconciledStage4 -Contract $contract | Out-Null
$reconciliationAdversarial = @(
  @{ name = "missing observation"; mutate = { param($x) $x.stage5Observation = $null } },
  @{ name = "wrong classification"; mutate = { param($x) $x.stage5Observation.classification[0] = "QUALIFICATION" } },
  @{ name = "authority asserted"; mutate = { param($x) $x.stage5Observation.authorityCreated = $true } },
  @{ name = "insufficient samples"; mutate = { param($x) $x.stage5Observation.samples = @() } },
  @{ name = "insufficient elapsed time"; mutate = { param($x) $x.stage5Observation.heldObservationElapsedSeconds = 10 } },
  @{ name = "excess elapsed time"; mutate = { param($x) $x.stage5Observation.heldObservationElapsedSeconds = 241 } },
  @{ name = "no positive GPU activity"; mutate = { param($x) $x.stage5Observation.positiveGpuEngineSamples = 0 } },
  @{ name = "invalid startup"; mutate = { param($x) $x.stage5StartupMilliseconds = -1 } },
  @{ name = "duplicate observer architecture"; mutate = { param($x) $x.observationArchitecture = "dual-concurrent-observers" } },
  @{ name = "residue"; mutate = { param($x) $x.zeroResidue = $false } }
)
foreach ($case in $reconciliationAdversarial) {
  $candidate = ($reconciledStage4 | ConvertTo-Json -Depth 10 | ConvertFrom-Json)
  & $case.mutate $candidate
  try {
    Assert-OracleStage5R1ObservationReconciliation -Stage4Result $candidate -Contract $contract | Out-Null
    throw "Reconciliation adversarial case was accepted: $($case.name)"
  } catch {
    if ([string]$_ -match "adversarial case was accepted") { throw }
  }
}

$install = "C:\Program Files\WindowsApps\Oracle.Package\"
$ownedRoot = [pscustomobject]@{ ProcessId = [uint32]100; ParentProcessId = [uint32]1; ExecutablePath = "C:\Program Files\WindowsApps\Oracle.Package\Oracle.exe" }
$ownedGpu = [pscustomobject]@{ ProcessId = [uint32]101; ParentProcessId = [uint32]100; ExecutablePath = "C:\Program Files\WindowsApps\Oracle.Package\Oracle.exe" }
$foreignHelper = [pscustomobject]@{ ProcessId = [uint32]102; ParentProcessId = [uint32]100; ExecutablePath = "C:\Windows\System32\conhost.exe" }
$selection = Select-OracleStage5R1OwnedDescendants -RootProcessId 100 -Snapshot @($ownedRoot, $ownedGpu, $foreignHelper) -InstallLocation $install
if (@($selection.owned).Count -ne 2 -or [int]$selection.foreignDescendantsExcluded -ne 1) {
  throw "Ownership selection did not isolate exact-package descendants."
}
$orphan = [pscustomobject]@{ ProcessId = [uint32]103; ParentProcessId = [uint32]999; ExecutablePath = "C:\Program Files\WindowsApps\Oracle.Package\Oracle.exe" }
try {
  Select-OracleStage5R1OwnedDescendants -RootProcessId 100 -Snapshot @($ownedRoot, $ownedGpu, $orphan) -InstallLocation $install | Out-Null
  throw "Orphaned package process was accepted."
} catch {
  if ([string]$_ -notmatch "second or orphaned") { throw }
}
$reusedRoot = [pscustomobject]@{ ProcessId = [uint32]100; ParentProcessId = [uint32]1; ExecutablePath = "C:\Windows\System32\notepad.exe" }
try {
  Select-OracleStage5R1OwnedDescendants -RootProcessId 100 -Snapshot @($reusedRoot) -InstallLocation $install | Out-Null
  throw "Foreign reused root was accepted."
} catch {
  if ([string]$_ -notmatch "no longer owned") { throw }
}

$gpuPattern = '(?i)--type=gpu-process\b'
$gpuFixtures = @(
  '"Oracle.exe" --type=gpu-process --use-angle=d3d11',
  '"Oracle.exe" "--type=gpu-process" "--use-angle=d3d11"'
)
foreach ($fixture in $gpuFixtures) {
  if ($fixture -notmatch $gpuPattern) {
    throw "GPU classifier rejected a governed fixture."
  }
}
foreach ($fixture in @(
  '"Oracle.exe" --type=renderer',
  '"Oracle.exe" --type=utility',
  '"Oracle.exe" --disable-gpu'
)) {
  if ($fixture -match $gpuPattern) {
    throw "GPU classifier admitted a non-GPU fixture."
  }
}

$stage4 = Get-Content -Raw -LiteralPath (
  Join-Path $PSScriptRoot "..\stage-4-r4\Oracle.Stage4R4Contract.json"
) | ConvertFrom-Json
$node = [string]$stage4.toolchain.approvedTools.node.path

function Invoke-ExitFixture([int]$ExpectedExitCode) {
  $info = [Diagnostics.ProcessStartInfo]::new()
  $info.FileName = $node
  $info.Arguments = '-e "process.exit(' + $ExpectedExitCode + ')"'
  $info.UseShellExecute = $false
  $info.CreateNoWindow = $true
  $info.RedirectStandardOutput = $true
  $info.RedirectStandardError = $true
  $process = [Diagnostics.Process]::new()
  $process.StartInfo = $info
  if (-not $process.Start()) { throw "Exit fixture did not start." }
  $stdout = $process.StandardOutput.ReadToEnd()
  $stderr = $process.StandardError.ReadToEnd()
  $process.WaitForExit()
  $actual = [int]$process.ExitCode
  $process.Dispose()
  if ($actual -ne $ExpectedExitCode) {
    throw "Exit fixture returned $actual instead of $ExpectedExitCode. stdout: $stdout stderr: $stderr"
  }
  $actual
}

function Invoke-HighVolumeRedirectFixture {
  $info = [Diagnostics.ProcessStartInfo]::new()
  $info.FileName = $node
  $info.Arguments = '-e "process.stdout.write(''O''.repeat(1048576));process.stderr.write(''E''.repeat(1048576))"'
  $info.UseShellExecute = $false
  $info.CreateNoWindow = $true
  $info.RedirectStandardOutput = $true
  $info.RedirectStandardError = $true
  $process = [Diagnostics.Process]::new()
  $process.StartInfo = $info
  try {
    if (-not $process.Start()) { throw "High-volume redirected-output fixture did not start." }
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    if (-not $process.WaitForExit(30000)) {
      $process.Kill()
      throw "High-volume redirected-output fixture deadlocked."
    }
    $stdout = $stdoutTask.GetAwaiter().GetResult()
    $stderr = $stderrTask.GetAwaiter().GetResult()
    if ([int]$process.ExitCode -ne 0 -or $stdout.Length -ne 1048576 -or $stderr.Length -ne 1048576) {
      throw "High-volume redirected-output fixture was truncated or returned non-zero."
    }
    $stdout.Length + $stderr.Length
  } finally {
    $process.Dispose()
  }
}

$redirectedOutputBytesCaptured = Invoke-HighVolumeRedirectFixture
$zero = Invoke-ExitFixture 0
$nonzero = Invoke-ExitFixture 7
if ($zero -ne 0 -or $nonzero -ne 7) {
  throw "Direct process exit-code policy failed."
}

[ordered]@{
  result = "passed"
  quotedGpuCommandLinesAccepted = $gpuFixtures.Count
  nonGpuCommandLinesRejected = 3
  zeroExitCaptured = $zero
  nonzeroExitCaptured = $nonzero
  redirectedOutputBytesCaptured = $redirectedOutputBytesCaptured
  nullExitCodeAccepted = $false
  ownedDescendantsAccepted = 2
  foreignDescendantsExcluded = 1
  orphanedPackageTreeAccepted = $false
  reusedRootAccepted = $false
  reconciliationPositiveCases = 1
  reconciliationAdversarialCases = $reconciliationAdversarial.Count
  authorityCreated = $false
  transferCreated = $false
  attemptCreated = $false
} | ConvertTo-Json -Depth 4
