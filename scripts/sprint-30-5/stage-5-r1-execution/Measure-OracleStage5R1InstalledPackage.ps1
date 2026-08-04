[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][uint32]$RootProcessId,
  [Parameter(Mandatory = $true)][string]$InstallLocation,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$output = $null
$rehearsalRoot = $null
$observationStartedAt = $null
$qualification = $false
$samples = [Collections.Generic.List[object]]::new()
$unavailable = [Collections.Generic.List[string]]::new()
$maximumRoots = 0
$maximumNamed = 0
$maximumUnnamed = 0
$renderStimulusOperations = 0
$processExitRacePolls = 0
$foreignDescendantObservations = 0
$maximumOwnedProcesses = 0

function Write-ObservationCreateOnly($Value) {
  $bytes = [Text.UTF8Encoding]::new($false).GetBytes((($Value | ConvertTo-Json -Depth 12) + [Environment]::NewLine))
  $stream = [IO.FileStream]::new($output, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
  try {
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush($true)
  } finally {
    $stream.Dispose()
  }
}

trap {
  $primaryFailure = [string]$_
  try {
    if ($null -ne $output -and $null -ne $rehearsalRoot -and
      $output.StartsWith($rehearsalRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase) -and
      -not (Test-Path -LiteralPath $output)) {
      $elapsed = if ($null -ne $observationStartedAt) { [Math]::Round(([DateTime]::UtcNow - $observationStartedAt).TotalSeconds, 3) } else { 0 }
      Write-ObservationCreateOnly ([ordered]@{
        result = "failed"
        classification = @(if ($qualification) { "GOVERNED-STAGE-5-R1-QUALIFICATION" } else { "NON-QUALIFICATION"; "NON-AUTHORITY"; "NON-EVIDENCE"; "INSTALLED DEVELOPMENT REHEARSAL" })
        qualificationEvidence = $qualification
        transferCreated = $false
        authorityCreated = $false
        attemptCreated = $qualification
        error = $primaryFailure
        samples = @($samples)
        positiveGpuEngineSamples = @($samples | Where-Object { [double]$_.gpuEngineUtilizationPercent -gt 0 }).Count
        renderStimulusOperations = $renderStimulusOperations
        processExitRacePollsDiscarded = $processExitRacePolls
        foreignDescendantObservationsExcluded = $foreignDescendantObservations
        maximumOwnedProcesses = $maximumOwnedProcesses
        heldObservationElapsedSeconds = $elapsed
        unavailableMeasurements = @($unavailable)
        accessibility = [ordered]@{
          installedWindowRoots = $maximumRoots
          namedEnabledFocusables = $maximumNamed
          unnamedEnabledFocusables = $maximumUnnamed
        }
      })
    }
  } catch {}
  Write-Error $primaryFailure
  exit 1
}
$contract = Get-Content -Raw -LiteralPath (
  Join-Path $PSScriptRoot "Oracle.Stage5R1Contract.json"
) | ConvertFrom-Json
$qualification = [Environment]::GetEnvironmentVariable("ORACLE_STAGE5_QUALIFICATION_CYCLE", "Process") -ceq "1"
. (Join-Path $PSScriptRoot "Oracle.Stage5R1ObservationOwnershipPolicy.ps1")
$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
$output = [IO.Path]::GetFullPath($OutputPath)
$rehearsalRoot = [IO.Path]::GetFullPath((Join-Path $repositoryRoot $(if ($qualification) { [string]$contract.paths.artifactRoot } else { [string]$contract.paths.rehearsalRoot })))
if (-not $output.StartsWith($rehearsalRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
  throw "Stage 5 observation output escapes its governed boundary."
}
if (Test-Path -LiteralPath $output) {
  throw "Stage 5 observation output already exists."
}
$installRoot = [IO.Path]::GetFullPath($InstallLocation).TrimEnd('\') + '\'

Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Threading;
using System.Diagnostics;
public sealed class OracleStage5RenderPulse {
  [StructLayout(LayoutKind.Sequential)]
  private struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll", SetLastError = true)]
  private static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll", SetLastError = true)]
  private static extern bool SetWindowPos(IntPtr hWnd, IntPtr insertAfter, int x, int y, int cx, int cy, uint flags);
  [DllImport("user32.dll", SetLastError = true)]
  private static extern bool RedrawWindow(IntPtr hWnd, IntPtr updateRect, IntPtr updateRegion, uint flags);
  [DllImport("user32.dll", SetLastError = true)]
  private static extern bool SetForegroundWindow(IntPtr hWnd);

  [DllImport("user32.dll", SetLastError = true)]
  private static extern bool PostMessage(IntPtr hWnd, uint message, IntPtr wParam, IntPtr lParam);
  public Thread Worker;
  public int Operations;
  public string Error;
  private readonly IntPtr handle;
  private readonly int durationMilliseconds;
  private OracleStage5RenderPulse(IntPtr handleValue, int durationValue) {
    handle = handleValue;
    durationMilliseconds = durationValue;
  }
  public static OracleStage5RenderPulse Start(IntPtr handle, int durationMilliseconds) {
    var pulse = new OracleStage5RenderPulse(handle, durationMilliseconds);
    pulse.Worker = new Thread(pulse.Run);
    pulse.Worker.IsBackground = true;
    pulse.Worker.Start();
    return pulse;
  }
  private void Run() {
    RECT rect;
    if (!GetWindowRect(handle, out rect)) { Error = "Could not read exact-package window rectangle."; return; }
    int width = rect.Right - rect.Left;
    int height = rect.Bottom - rect.Top;
    if (width < 2 || height < 1) { Error = "Exact-package window rectangle is invalid."; return; }
    const uint positionFlags = 0x0004 | 0x0010;
    const uint redrawFlags = 0x0001 | 0x0004 | 0x0080 | 0x0100;
    const uint keyDown = 0x0100;
    const uint keyUp = 0x0101;
    Stopwatch timer = Stopwatch.StartNew();
    bool expanded = false;
    try {
      if (!SetForegroundWindow(handle)) {
        Error = "Could not foreground the exact-package window for renderer-owned stimulus.";
        return;
      }
      while (timer.ElapsedMilliseconds < durationMilliseconds) {
        expanded = !expanded;
        int currentWidth = expanded ? width + 1 : width;
        if (!SetWindowPos(handle, IntPtr.Zero, rect.Left, rect.Top, currentWidth, height, positionFlags)) {
          Error = "Could not apply exact-package window reflow pulse.";
          return;
        }
        if (!RedrawWindow(handle, IntPtr.Zero, IntPtr.Zero, redrawFlags)) {
          Error = "Could not apply exact-package redraw pulse.";
          return;
        }
        if (!PostMessage(handle, keyDown, new IntPtr(0x09), IntPtr.Zero) ||
            !PostMessage(handle, keyUp, new IntPtr(0x09), IntPtr.Zero)) {
          Error = "Could not deliver focus-navigation stimulus to the exact-package window.";
          return;
        }
        Operations += 4;
        Thread.Sleep(50);
      }
    } finally {
      if (!SetWindowPos(handle, IntPtr.Zero, rect.Left, rect.Top, width, height, positionFlags) && Error == null) {
        Error = "Could not restore exact-package window rectangle.";
      }
      RedrawWindow(handle, IntPtr.Zero, IntPtr.Zero, redrawFlags);

    }
  }
}
"@
function Get-ProcessSnapshot {
  @(Get-CimInstance Win32_Process -ErrorAction Stop)
}

function Start-OwnedWindowRenderStimulus($Processes) {
  $pulses = [Collections.Generic.List[object]]::new()
  foreach ($item in $Processes) {
    if ($item.MainWindowHandle -ne [IntPtr]::Zero) {
      $pulses.Add([OracleStage5RenderPulse]::Start($item.MainWindowHandle, 3000))
    }
  }
  @($pulses)
}

function Complete-OwnedWindowRenderStimulus($Pulses) {
  $operations = 0
  foreach ($pulse in @($Pulses)) {
    $pulse.Worker.Join()
    if (-not [string]::IsNullOrWhiteSpace([string]$pulse.Error)) {
      throw [string]$pulse.Error
    }
    $operations += [int]$pulse.Operations
  }
  $operations
}
function Get-UiaMeasurement([int[]]$ProcessIds) {
  $rootsByHandle = @{}
  foreach ($processId in $ProcessIds) {
    $runtime = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($null -ne $runtime -and $runtime.MainWindowHandle -ne [IntPtr]::Zero) {
      try {
        $element = [Windows.Automation.AutomationElement]::FromHandle($runtime.MainWindowHandle)
        if ($null -ne $element) { $rootsByHandle[[string]$runtime.MainWindowHandle] = $element }
      } catch {}
    }
    $condition = [Windows.Automation.PropertyCondition]::new(
      [Windows.Automation.AutomationElement]::ProcessIdProperty,
      $processId
    )
    $roots = [Windows.Automation.AutomationElement]::RootElement.FindAll(
      [Windows.Automation.TreeScope]::Children,
      $condition
    )
    foreach ($root in $roots) {
      $rootsByHandle["uia-$processId-$($root.Current.NativeWindowHandle)"] = $root
    }
  }
  $named = 0
  $unnamed = 0
  foreach ($root in $rootsByHandle.Values) {
    $focusables = $root.FindAll(
      [Windows.Automation.TreeScope]::Descendants,
      [Windows.Automation.PropertyCondition]::new(
        [Windows.Automation.AutomationElement]::IsKeyboardFocusableProperty,
        $true
      )
    )
    foreach ($element in $focusables) {
      if (-not [bool]$element.Current.IsEnabled) { continue }
      if ([string]::IsNullOrWhiteSpace([string]$element.Current.Name)) { $unnamed++ } else { $named++ }
    }
  }
  [pscustomobject][ordered]@{
    roots = $rootsByHandle.Count
    namedEnabledFocusables = $named
    unnamedEnabledFocusables = $unnamed
  }
}

$gpuPids = [Collections.Generic.HashSet[int]]::new()
$heldObservationMinimumSeconds = if ($qualification) { [int]$contract.qualificationProtocol.activeJourneySecondsPerCycle + [int]$contract.qualificationProtocol.soakSecondsPerCycle } else { [int]$contract.developmentRehearsalProfile.heldObservationMinimumSeconds }
$heldObservationPollStartMaximumSeconds = if ($qualification) { $heldObservationMinimumSeconds + 180 } else { [int]$contract.developmentRehearsalProfile.heldObservationPollStartMaximumSeconds }
$heldObservationCompletionMaximumSeconds = if ($qualification) { $heldObservationMinimumSeconds + 300 } else { [int]$contract.developmentRehearsalProfile.heldObservationCompletionMaximumSeconds }
$minimumHeldSamples = if ($qualification) { [Math]::Ceiling(($heldObservationMinimumSeconds * 1000 / [int]$contract.qualificationProtocol.sampleCadenceMilliseconds) * [double]$contract.qualificationProtocol.minimumSampleCompleteness) } else { [int]$contract.developmentRehearsalProfile.minimumHeldObservationSamples }
$sampleCadenceMilliseconds = if ($qualification) { [int]$contract.qualificationProtocol.sampleCadenceMilliseconds } else { [int]$contract.developmentRehearsalProfile.sampleCadenceMilliseconds }
if ($heldObservationMinimumSeconds -lt 30) {
  throw "Stage 5 held observation minimum duration must be at least 30 seconds."
}
if ($heldObservationPollStartMaximumSeconds -lt $heldObservationMinimumSeconds -or
  $heldObservationCompletionMaximumSeconds -lt $heldObservationPollStartMaximumSeconds) {
  throw "Stage 5 held observation timing bounds are invalid."
}
if ($minimumHeldSamples -lt 5) {
  throw "Stage 5 held observation sample minimum must be at least five."
}
if (-not [bool]$contract.developmentRehearsalProfile.ownedWindowRenderStimulusRequired) {
  throw "Stage 5 held observation render stimulus must remain required."
}
if ([string]$contract.developmentRehearsalProfile.ownedWindowRenderStimulus -cne "concurrent-owned-window-foreground-reflow-focus-navigation-with-bounds-restoration") {
  throw "Stage 5 held observation render stimulus contract differs."
}
if ([string]$contract.developmentRehearsalProfile.processExitRaceDisposition -cne "discard-poll-after-current-gpu-identity-revalidation") {
  throw "Stage 5 process-exit race disposition differs."
}
$observationStartedAt = [DateTime]::UtcNow
$minimumDeadline = $observationStartedAt.AddSeconds($heldObservationMinimumSeconds)
$pollStartDeadline = $observationStartedAt.AddSeconds($heldObservationPollStartMaximumSeconds)
$cpuByProcessIdentity = @{}
$lastUtc = $null
$activeCpu = 0.0

do {
  $now = [DateTime]::UtcNow
  $snapshot = Get-ProcessSnapshot
  $selection = Select-OracleStage5R1OwnedDescendants `
    -RootProcessId $RootProcessId -Snapshot $snapshot -InstallLocation $InstallLocation
  $owned = @($selection.owned)
  $maximumOwnedProcesses = [Math]::Max($maximumOwnedProcesses, $owned.Count)
  $foreignDescendantObservations += [int]$selection.foreignDescendantsExcluded
  $processIds = @($owned | ForEach-Object { [int]$_.ProcessId })
  $runtime = @(Get-Process -Id $processIds -ErrorAction SilentlyContinue)
  $workingSetBytes = [double](($owned | ForEach-Object { [double]$_.WorkingSetSize } | Measure-Object -Sum).Sum)
  $workingSet = [Math]::Round(($workingSetBytes / 1MB), 3)
  $cpuDelta = 0.0
  foreach ($item in $owned) {
    $identity = "$([uint32]$item.ProcessId)|$([string]$item.CreationDate)"
    $cpuSeconds = ([double]$item.KernelModeTime + [double]$item.UserModeTime) / 10000000
    if ($cpuByProcessIdentity.ContainsKey($identity)) {
      $cpuDelta += [Math]::Max(0, $cpuSeconds - [double]$cpuByProcessIdentity[$identity])
    }
    $cpuByProcessIdentity[$identity] = $cpuSeconds
  }
  $activeCpu += $cpuDelta
  $cpuPercent = 0.0
  if ($null -ne $lastUtc) {
    $elapsed = ($now - $lastUtc).TotalSeconds
    if ($elapsed -gt 0) {
      $cpuPercent = [Math]::Round(($cpuDelta / $elapsed / [Environment]::ProcessorCount) * 100, 3)
    }
  }
  $lastUtc = $now

  $uia = Get-UiaMeasurement $processIds
  $maximumRoots = [Math]::Max($maximumRoots, [int]$uia.roots)
  $maximumNamed = [Math]::Max($maximumNamed, [int]$uia.namedEnabledFocusables)
  $maximumUnnamed = [Math]::Max($maximumUnnamed, [int]$uia.unnamedEnabledFocusables)

  $gpu = @($owned | Where-Object { ([string]$_.CommandLine) -match '(?i)--type=gpu-process\b' })
  if ($gpu.Count -ne 1) {
    throw "Exactly one package-owned GPU process is required during observation."
  }
  $gpuPid = [int]$gpu[0].ProcessId
  $currentGpu = @(Get-CimInstance Win32_Process -Filter "ProcessId=$gpuPid" -ErrorAction SilentlyContinue)
  if ($currentGpu.Count -ne 1 -or
    -not (Test-OracleStage5R1PackageOwnedPath $currentGpu[0].ExecutablePath $InstallLocation) -or
    [string]$currentGpu[0].CreationDate -cne [string]$gpu[0].CreationDate) {
    $processExitRacePolls++
    Start-Sleep -Milliseconds $sampleCadenceMilliseconds
    continue
  }
  [void]$gpuPids.Add($gpuPid)
  $gpuUtilization = 0.0
  $pulses = if (-not $qualification -or $samples.Count -lt 10 -or ($samples.Count % 300) -eq 0) { @(Start-OwnedWindowRenderStimulus $runtime) } else { @() }
  try {
    Start-Sleep -Milliseconds 250
    $counter = Get-Counter '\GPU Engine(*)\Utilization Percentage' -SampleInterval 1 -MaxSamples $(if ($qualification) { 1 } else { 2 }) -ErrorAction Stop
    $gpuCounters = @($counter.CounterSamples | Where-Object {
      $_.Path -match ("(?i)pid_" + $gpuPid + "_")
    })
    if ($gpuCounters.Count -eq 0) {
      if (-not $unavailable.Contains("package-owned-gpu-engine-counter")) {
        $unavailable.Add("package-owned-gpu-engine-counter")
      }
    } else {
      $gpuUtilization = [Math]::Round([double](($gpuCounters | Measure-Object CookedValue -Maximum).Maximum), 3)
    }
  } catch {
    if (-not $unavailable.Contains("windows-gpu-engine-counter")) {
      $unavailable.Add("windows-gpu-engine-counter")
    }
  } finally {
    $renderStimulusOperations += Complete-OwnedWindowRenderStimulus $pulses
  }

  $samples.Add([pscustomobject][ordered]@{
    observedAtUtc = $now.ToString("o")
    processId = $gpuPid
    processType = "gpu"
    commandLine = [string]$gpu[0].CommandLine
    privateWorkingSetMiB = [Math]::Round(([double]$currentGpu[0].PrivatePageCount / 1MB), 3)
    totalProcessTreeWorkingSetMiB = $workingSet
    processTreeCpuPercent = $cpuPercent
    gpuEngineUtilizationPercent = $gpuUtilization
  })
  Start-Sleep -Milliseconds $sampleCadenceMilliseconds
} while (([DateTime]::UtcNow -lt $minimumDeadline -or $samples.Count -lt $minimumHeldSamples) -and [DateTime]::UtcNow -lt $pollStartDeadline)

$heldObservationElapsedSeconds = ([DateTime]::UtcNow - $observationStartedAt).TotalSeconds
if ($heldObservationElapsedSeconds -gt $heldObservationCompletionMaximumSeconds) {
  throw "Stage 5 held observation exceeded its completion safety bound."
}
if ($samples.Count -lt $minimumHeldSamples) {
  throw "Stage 5 held observation collected fewer than $minimumHeldSamples GPU samples."
}
if ($gpuPids.Count -ne 1) {
  throw "Package-owned GPU process identity changed during held observation."
}
if ($unavailable.Count -ne 0) {
  throw "Held observation contains unavailable measurements: $($unavailable -join ', ')."
}
$positive = @($samples | Where-Object { [double]$_.gpuEngineUtilizationPercent -gt 0 }).Count
if ($renderStimulusOperations -lt 4) {
  throw "Held observation could not exercise an exact-package window render stimulus."
}
if ($positive -lt 1) {
  throw "Held observation captured no positive package-owned GPU-engine activity during controlled render stimulus."
}
if ($maximumRoots -lt 1 -or $maximumNamed -lt 1) {
  throw "Held observation did not expose a named focusable installed Oracle window."
}
if ($maximumUnnamed -ne 0) {
  throw "Held observation found unnamed enabled focusable controls."
}
$commandLines = (@($samples | ForEach-Object { [string]$_.commandLine }) -join [Environment]::NewLine).ToLowerInvariant()
foreach ($indicator in @([string[]]$contract.gpuAcceptance.prohibitedIndicators)) {
  if ($commandLines.Contains(([string]$indicator).ToLowerInvariant())) {
    throw "Held observation found a prohibited GPU indicator: $indicator"
  }
}
$peakTree = [double](($samples | Measure-Object totalProcessTreeWorkingSetMiB -Maximum).Maximum)
$peakGpu = [double](($samples | Measure-Object privateWorkingSetMiB -Maximum).Maximum)
if ($peakTree -gt [double]$contract.thresholds.totalProcessTreePeakWorkingSetMiBMaximum) {
  throw "Held observation process-tree working set exceeds the frozen limit."
}
if ($peakGpu -gt [double]$contract.thresholds.gpuPrivateWorkingSetMiBPeakMaximum) {
  throw "Held observation GPU private working set exceeds the frozen limit."
}
$activeCpu = [Math]::Round($activeCpu, 3)
if ($activeCpu -gt [double]$contract.thresholds.measuredActiveWorkloadCpuSecondsMaximum) {
  throw "Held observation CPU exceeds the frozen measured-workload limit."
}

$record = [ordered]@{
  result = "passed"
  classification = @(if ($qualification) { "GOVERNED-STAGE-5-R1-QUALIFICATION" } else { "NON-QUALIFICATION"; "NON-AUTHORITY"; "NON-EVIDENCE"; "INSTALLED DEVELOPMENT REHEARSAL" })
  qualificationEvidence = $qualification
  transferCreated = $false
  authorityCreated = $false
  attemptCreated = $qualification
  packageSha256 = [string]$contract.package.sha256
  gpuProcessId = [int]@($gpuPids)[0]
  samples = @($samples)
  positiveGpuEngineSamples = $positive
  renderStimulusOperations = $renderStimulusOperations
  processExitRacePollsDiscarded = $processExitRacePolls
  maximumOwnedProcesses = $maximumOwnedProcesses
  heldObservationElapsedSeconds = [Math]::Round($heldObservationElapsedSeconds, 3)
  renderStimulus = "concurrent-owned-window-foreground-reflow-focus-navigation-with-bounds-restoration"
  measuredActiveWorkloadCpuSeconds = $activeCpu
  foreignDescendantObservationsExcluded = $foreignDescendantObservations
  measurementOwnership = "exact-package-executable-path-with-owned-root-and-single-tree"
  accessibility = [ordered]@{
    windowsUiaAvailable = $true
    installedWindowRoots = $maximumRoots
    namedEnabledFocusables = $maximumNamed
    unnamedEnabledFocusables = $maximumUnnamed
    frozenSourceContractPassed = $true
    qualificationAccessibilityClaimed = $false
  }
}
$bytes = [Text.UTF8Encoding]::new($false).GetBytes((($record | ConvertTo-Json -Depth 10) + [Environment]::NewLine))
$stream = [IO.FileStream]::new($output, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
try {
  $stream.Write($bytes, 0, $bytes.Length)
  $stream.Flush($true)
} finally {
  $stream.Dispose()
}
$record | ConvertTo-Json -Depth 4 -Compress | Out-Null
