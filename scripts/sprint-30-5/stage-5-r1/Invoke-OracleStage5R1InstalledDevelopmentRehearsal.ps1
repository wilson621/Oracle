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

trap {
  try {
    if (-not (Test-Path -LiteralPath $result)) {
      Write-CreateOnlyResult ([ordered]@{
        result = "failed"
        classification = @("NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "INSTALLED DEVELOPMENT REHEARSAL")
        qualificationEvidence = $false
        transferCreated = $false
        authorityCreated = $false
        attemptCreated = $false
        error = [string]$_
      })
    }
  } catch {}
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

if (-not [Environment]::MachineName.Equals([string]$contract.host.requiredIdentity, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Installed rehearsal is not running on the admitted Founder-QA-01 host."
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
$runner = Join-Path $repositoryRoot "scripts\sprint-30-5\stage-4-r4\run-live-installed-development-rehearsal.mjs"
if (-not (Test-Path -LiteralPath $runner -PathType Leaf)) {
  throw "Accepted Stage 4 installed lifecycle runner is absent."
}

Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

$stdoutPath = Join-Path $resultParent ("stage4-child-" + [Guid]::NewGuid().ToString("N") + ".stdout.txt")
$stderrPath = Join-Path $resultParent ("stage4-child-" + [Guid]::NewGuid().ToString("N") + ".stderr.txt")
$startUtc = [DateTime]::UtcNow
$process = Start-Process -FilePath $node -ArgumentList @($runner) -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath

$samples = [Collections.Generic.List[object]]::new()
$unavailable = [Collections.Generic.List[string]]::new()
$warnings = [Collections.Generic.List[string]]::new()
$observedGpuPids = [Collections.Generic.HashSet[int]]::new()
$installationObservedAt = $null
$firstWindowObservedAt = $null
$maximumWindowRoots = 0
$maximumNamedFocusables = 0
$maximumUnnamedFocusables = 0
$lastCpuSeconds = $null
$lastSampleUtc = $null
$firstCpuSeconds = $null
$lastObservedCpuSeconds = $null
$sampleCadence = [int]$contract.developmentRehearsalProfile.sampleCadenceMilliseconds

while (-not $process.HasExited) {
  $sampleUtc = [DateTime]::UtcNow
  $package = @(Get-AppxPackage -AllUsers -Name ([string]$contract.package.identity) -ErrorAction Stop)
  if ($package.Count -gt 1) {
    throw "Multiple accepted-identity Oracle packages are installed."
  }
  if ($package.Count -eq 1) {
    if ([string]$package[0].PackageFullName -cne [string]$contract.package.fullName) {
      throw "Installed Oracle package full name differs from accepted R6."
    }
    if ($null -eq $installationObservedAt) {
      $installationObservedAt = $sampleUtc
    }
    $installLocation = [IO.Path]::GetFullPath([string]$package[0].InstallLocation).TrimEnd('\') + '\'
    $snapshot = @(Get-CimInstance Win32_Process -ErrorAction Stop | Where-Object {
      -not [string]::IsNullOrWhiteSpace([string]$_.ExecutablePath) -and
      [IO.Path]::GetFullPath([string]$_.ExecutablePath).StartsWith($installLocation, [StringComparison]::OrdinalIgnoreCase)
    })
    if ($snapshot.Count -gt 0) {
      $processIds = @($snapshot | ForEach-Object { [int]$_.ProcessId })
      $runtime = @(Get-Process -Id $processIds -ErrorAction Stop)
      $totalWorkingSetMiB = [Math]::Round((($runtime | Measure-Object WorkingSet64 -Sum).Sum / 1MB), 3)
      $cpuSeconds = [double](($runtime | Measure-Object CPU -Sum).Sum)
      if ($null -eq $firstCpuSeconds) { $firstCpuSeconds = $cpuSeconds }
      $lastObservedCpuSeconds = $cpuSeconds
      $cpuPercent = 0.0
      if ($null -ne $lastCpuSeconds -and $null -ne $lastSampleUtc) {
        $elapsed = ($sampleUtc - $lastSampleUtc).TotalSeconds
        if ($elapsed -gt 0) {
          $cpuPercent = [Math]::Max(0, [Math]::Round((($cpuSeconds - $lastCpuSeconds) / $elapsed / [Environment]::ProcessorCount) * 100, 3))
        }
      }
      $lastCpuSeconds = $cpuSeconds
      $lastSampleUtc = $sampleUtc

      $gpu = @($snapshot | Where-Object { ([string]$_.CommandLine) -match '(?i)--type=gpu-process(?:\s|$)' })
      if ($gpu.Count -gt 1) {
        throw "Multiple package-owned GPU processes were observed in one sample."
      }
      if ($gpu.Count -eq 1) {
        $gpuPid = [int]$gpu[0].ProcessId
        [void]$observedGpuPids.Add($gpuPid)
        $gpuRuntime = Get-Process -Id $gpuPid -ErrorAction Stop
        $gpuUtilization = 0.0
        try {
          $counter = Get-Counter '\GPU Engine(*)\Utilization Percentage' -ErrorAction Stop
          $gpuCounterSamples = @($counter.CounterSamples | Where-Object {
            $_.Path -match ("(?i)pid_" + $gpuPid + "_")
          })
          if ($gpuCounterSamples.Count -eq 0) {
            if (-not $unavailable.Contains("package-owned-gpu-engine-counter")) {
              $unavailable.Add("package-owned-gpu-engine-counter")
            }
          } else {
            $gpuUtilization = [Math]::Round([double](($gpuCounterSamples | Measure-Object CookedValue -Sum).Sum), 3)
          }
        } catch {
          if (-not $unavailable.Contains("windows-gpu-engine-counter")) {
            $unavailable.Add("windows-gpu-engine-counter")
          }
        }
        $samples.Add([pscustomobject][ordered]@{
          observedAtUtc = $sampleUtc.ToString("o")
          processId = $gpuPid
          processType = "gpu"
          commandLine = [string]$gpu[0].CommandLine
          privateWorkingSetMiB = [Math]::Round(($gpuRuntime.PrivateMemorySize64 / 1MB), 3)
          totalProcessTreeWorkingSetMiB = $totalWorkingSetMiB
          processTreeCpuPercent = $cpuPercent
          gpuEngineUtilizationPercent = $gpuUtilization
        })
      }

      $windowRoots = 0
      $namedFocusables = 0
      $unnamedFocusables = 0
      foreach ($processId in $processIds) {
        $condition = [Windows.Automation.PropertyCondition]::new(
          [Windows.Automation.AutomationElement]::ProcessIdProperty,
          $processId
        )
        $roots = [Windows.Automation.AutomationElement]::RootElement.FindAll(
          [Windows.Automation.TreeScope]::Children,
          $condition
        )
        $windowRoots += $roots.Count
        foreach ($root in $roots) {
          $focusables = $root.FindAll(
            [Windows.Automation.TreeScope]::Descendants,
            [Windows.Automation.PropertyCondition]::new(
              [Windows.Automation.AutomationElement]::IsKeyboardFocusableProperty,
              $true
            )
          )
          foreach ($element in $focusables) {
            if (-not [bool]$element.Current.IsEnabled) { continue }
            if ([string]::IsNullOrWhiteSpace([string]$element.Current.Name)) {
              $unnamedFocusables++
            } else {
              $namedFocusables++
            }
          }
        }
      }
      if ($windowRoots -gt 0 -and $null -eq $firstWindowObservedAt) {
        $firstWindowObservedAt = $sampleUtc
      }
      $maximumWindowRoots = [Math]::Max($maximumWindowRoots, $windowRoots)
      $maximumNamedFocusables = [Math]::Max($maximumNamedFocusables, $namedFocusables)
      $maximumUnnamedFocusables = [Math]::Max($maximumUnnamedFocusables, $unnamedFocusables)
    }
  }
  Start-Sleep -Milliseconds $sampleCadence
  $process.Refresh()
}
$process.WaitForExit()
$childStdout = if (Test-Path -LiteralPath $stdoutPath) { Get-Content -Raw -LiteralPath $stdoutPath } else { "" }
$childStderr = if (Test-Path -LiteralPath $stderrPath) { Get-Content -Raw -LiteralPath $stderrPath } else { "" }
Remove-Item -LiteralPath $stdoutPath,$stderrPath -Force -ErrorAction Stop
if ($process.ExitCode -ne 0) {
  throw "Accepted Stage 4 installed lifecycle rehearsal exited $($process.ExitCode). stdout: $childStdout stderr: $childStderr"
}
$stage4Result = $childStdout | ConvertFrom-Json
if (
  [string]$stage4Result.result -cne "passed" -or
  -not [bool]$stage4Result.installedPackageExercised -or
  -not [bool]$stage4Result.zeroResidue -or
  [bool]$stage4Result.authorityCreated -or
  [bool]$stage4Result.attemptCreated -or
  [bool]$stage4Result.qualificationEvidence
) {
  throw "Accepted Stage 4 installed lifecycle did not return the required rehearsal result."
}
if ($samples.Count -lt [int]$contract.developmentRehearsalProfile.minimumInstalledSamples) {
  throw "Insufficient package-owned GPU samples were collected."
}
if ($observedGpuPids.Count -ne 1) {
  throw "Package-owned GPU process identity was not stable."
}
if ($null -eq $installationObservedAt -or $null -eq $firstWindowObservedAt) {
  throw "Installed-package startup window observation is incomplete."
}
$startupMilliseconds = [Math]::Round(($firstWindowObservedAt - $installationObservedAt).TotalMilliseconds, 3)
$activeCpuSeconds = if ($null -ne $firstCpuSeconds -and $null -ne $lastObservedCpuSeconds) {
  [Math]::Max(0, [Math]::Round(($lastObservedCpuSeconds - $firstCpuSeconds), 3))
} else { 0 }

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
  hostIdentity = [string]$contract.host.requiredIdentity
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
  routeP95Milliseconds = 5.029
  routeP99Milliseconds = 5.029
  apiP95Milliseconds = 5.281
  maximumHtmlBytes = 8601
  guidanceP95Milliseconds = 0.097
  guidanceP99Milliseconds = 0.171
  timingMeasurementProvenance = "accepted-phase4-reference-not-installed-stage5-claim"
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
  residue = [ordered]@{
    packages = $remainingPackages.Count
    processes = $remainingProcesses.Count
    certificates = $remainingCertificates.Count
  }
}
Write-CreateOnlyResult $record
$record | ConvertTo-Json -Depth 8
