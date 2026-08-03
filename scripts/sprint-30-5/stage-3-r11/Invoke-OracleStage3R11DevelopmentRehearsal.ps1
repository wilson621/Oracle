[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$classification = @(
  "NON-QUALIFICATION",
  "NON-AUTHORITY",
  "NON-EVIDENCE",
  "DEVELOPMENT REHEARSAL"
)

. (Join-Path $PSScriptRoot "Oracle.Stage3R11LifecyclePolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11IdentityPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11ActivationPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11CertificateTrustPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11InstalledSoftwarePolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11InstalledRuntimeConfigurationPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11ObservationPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11ProcessPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11WindowPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R11WindowsExecutablePolicy.ps1")

function Write-RehearsalJsonCreateOnly([string]$Path, $Value) {
  if (Test-Path -LiteralPath $Path) {
    throw "Development rehearsal refuses to replace an existing output: $Path"
  }
  $json = $Value | ConvertTo-Json -Depth 30
  $bytes = [Text.UTF8Encoding]::new($false).GetBytes("$json`n")
  $stream = [IO.File]::Open(
    $Path,
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
}

function Invoke-SimulatedPhase(
  [object]$State,
  [string]$Phase,
  [string]$Root,
  [string]$InjectedFailure
) {
  Assert-OracleStage3R11NextLifecyclePhase -State $State -Phase $Phase
  if ($InjectedFailure -ceq $Phase) {
    throw "Injected development-rehearsal failure before phase: $Phase"
  }
  Write-RehearsalJsonCreateOnly (Join-Path $Root "$Phase.json") ([ordered]@{
    classification = $classification
    phase = $Phase
    simulated = $true
    hostMutation = $false
    authorityConsumed = $false
    qualificationEvidence = $false
  })
  [void](Move-OracleStage3R11Lifecycle -State $State -Phase $Phase)
}

function Invoke-SimulatedLifecycle([string]$Root, [string]$InjectedFailure) {
  $state = New-OracleStage3R11LifecycleState
  $failure = $null
  try {
    foreach ($phase in @(Get-OracleStage3R11LifecyclePhases)) {
      Invoke-SimulatedPhase -State $state -Phase $phase -Root $Root `
        -InjectedFailure $InjectedFailure
    }
  } catch {
    $failure = $_
  }
  $teardown = Get-OracleStage3R11TeardownObligations `
    -CompletedPhases @($state.completed)
  Write-RehearsalJsonCreateOnly (Join-Path $Root "teardown.json") ([ordered]@{
    classification = $classification
    simulated = $true
    failure = if ($null -eq $failure) { $null } else { $failure.Exception.Message }
    completedPhases = @($state.completed)
    obligations = $teardown
  })
  [pscustomobject][ordered]@{
    state = $state
    failure = $failure
    teardown = $teardown
  }
}

$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
$parent = Join-Path $repositoryRoot ".tmp-r11"
$root = Join-Path $parent ("r-{0}" -f [Guid]::NewGuid().ToString("N").Substring(0, 8))
if (Test-Path -LiteralPath $root) {
  throw "Development rehearsal root already exists."
}
[void](New-Item -ItemType Directory -Path $root)

try {
  $software = @(ConvertTo-OracleStage3R11InstalledSoftwareInventory -RegistryEntries @(
    [pscustomobject]@{ DisplayName = "Zulu"; DisplayVersion = "2" },
    [pscustomobject]@{ PSChildName = "no-display-name" },
    [pscustomobject]@{ DisplayName = "Alpha"; Publisher = "Publisher" }
  ))
  if (
    $software.Count -ne 2 -or
    $software[0].DisplayName -cne "Alpha" -or
    $software[1].DisplayName -cne "Zulu"
  ) { throw "Shared installed-software policy failed inside rehearsal." }
  if (-not (Test-OracleWindowsComputerName "FOUNDER-QA-01" "Founder-QA-01")) {
    throw "Shared host-identity policy failed inside rehearsal."
  }
  $fixtureThumbprint = "8C24858C147873EF46A9D61018FA2702B6222EA2"
  $fixtureSubject = "CN=Oracle Stage 2 Requalification R6 Local Test Signing - NOT PRODUCTION"
  $fixtureRaw = [byte[]]@(1, 2, 3)
  $fixtureCertificate = [pscustomobject][ordered]@{
    Thumbprint = $fixtureThumbprint
    Subject = $fixtureSubject
    RawData = $fixtureRaw
    HasPrivateKey = $false
  }
  $fixturePhysical = @([pscustomobject][ordered]@{
    Location = "LocalMachine"
    Store = "TrustedPeople"
    Certificate = $fixtureCertificate
  })
  $fixtureLogical = @(
    [pscustomobject][ordered]@{
      Location = "LocalMachine"
      Store = "TrustedPeople"
      Certificate = $fixtureCertificate
    },
    [pscustomobject][ordered]@{
      Location = "CurrentUser"
      Store = "TrustedPeople"
      Certificate = $fixtureCertificate
    }
  )
  Assert-OracleStage3R11TemporaryTrustState `
    -PhysicalMatches $fixturePhysical -LogicalViews $fixtureLogical `
    -Thumbprint $fixtureThumbprint -Subject $fixtureSubject `
    -RawBase64 ([Convert]::ToBase64String($fixtureRaw))
  $fixtureSystem32 = Join-Path $root "fixture-System32"
  [void](New-Item -ItemType Directory -Path $fixtureSystem32)
  foreach ($name in @("certutil.exe", "reagentc.exe")) {
    [IO.File]::WriteAllBytes(
      (Join-Path $fixtureSystem32 $name),
      [byte[]]@(77, 90)
    )
    [void](Get-OracleStage3R11WindowsExecutablePath `
      -Name $name -SystemDirectory $fixtureSystem32)
  }
  $fixtureActivation = Invoke-OracleStage3R11ApplicationActivation `
    -AppUserModelId "Oracle.Platform.LocalCertification_fixture!Oracle" `
    -ActivationRunner {
      [pscustomobject]@{ HResult = "0x00000000"; ProcessId = 4242 }
    }
  Assert-OracleStage3R11ApplicationActivationSucceeded `
    -Result $fixtureActivation
  $fixtureWindows = @(
    ConvertFrom-OracleStage3R11WindowDiscoveryJson -Json (
      '[{"handle":"123","title":"Oracle","processId":9808,' +
      '"processName":"Oracle","visible":true,"minimized":false,' +
      '"x":0,"y":0,"width":800,"height":600},' +
      '{"handle":"456","title":"Other","processId":42,' +
      '"processName":"Other","visible":true,"minimized":false,' +
      '"x":0,"y":0,"width":640,"height":480}]'
    )
  )
  if (
    $fixtureWindows.Count -ne 2 -or
    -not (Test-OracleStage3R11QualifyingWindow $fixtureWindows[0])
  ) { throw "Shared window discovery policy failed inside rehearsal." }
  [void](Assert-OracleStage3R11ProcessPackageOwnership `
    -ProcessId 9808 `
    -ExpectedPackageFamilyName "Oracle.Platform.LocalCertification_fixture" `
    -Resolver {
      param($ProcessId)
      "Oracle.Platform.LocalCertification_fixture"
    })
  $rehearsalElapsedValues = [Collections.Generic.Queue[double]]::new()
  foreach ($value in @(0.0, 59929.0, 60000.0)) {
    $rehearsalElapsedValues.Enqueue($value)
  }
  $observedAt = [Collections.Generic.Queue[DateTime]]::new()
  foreach ($value in @(
    [DateTime]::Parse("2026-07-30T21:00:00.000Z").ToUniversalTime(),
    [DateTime]::Parse("2026-07-30T21:00:59.929Z").ToUniversalTime(),
    [DateTime]::Parse("2026-07-30T21:01:00.000Z").ToUniversalTime()
  )) {
    $observedAt.Enqueue($value)
  }
  $observation = Invoke-OracleStage3R11CompleteStableObservation `
    -RequiredDurationSeconds 60 `
    -CaptureSample {
      [pscustomobject]@{ visible = $true; minimized = $false }
    } `
    -GetElapsedMilliseconds { $rehearsalElapsedValues.Dequeue() } `
    -GetUtcNow { $observedAt.Dequeue() } `
    -Sleep { param($Milliseconds) }
  if (
    [double]$observation.measuredDurationMilliseconds -ne 60000.0 -or
    [int]$observation.sampleCount -ne 3
  ) { throw "Shared complete-duration observation policy failed in rehearsal." }
  Initialize-OracleStage3R11AppModelProcessIdentity
  $exitedProcess = Resolve-OracleStage3R11TeardownProcessOwnership `
    -ProcessId 9808 `
    -ExpectedPackageFamilyName "Oracle.Platform.LocalCertification_fixture" `
    -OwnershipResolver {
      param($ProcessId)
      throw [Oracle.Stage3R11.ProcessOpenException]::new(
        [uint32]$ProcessId, 87
      )
    } `
    -ProcessExists { param($ProcessId) $false }
  if (
    [string]$exitedProcess.classification -cne
      "exited-before-ownership-query" -or
    [bool]$exitedProcess.safeToStop
  ) { throw "Shared teardown exit-race policy failed in rehearsal." }
  Remove-Item -LiteralPath $fixtureSystem32 -Recurse
  $processRoot = Join-Path $root "process"
  [void](New-Item -ItemType Directory -Path $processRoot)
  $processCounts = @{}
  $processResult = Invoke-OracleStage3R11GovernedProcess `
    -Name "simulated-process" `
    -Executable "C:\Windows\System32\fixture.exe" `
    -Arguments @("path with spaces") `
    -LogsRoot $processRoot `
    -ProcessEvidenceCounts $processCounts `
    -WriteCreateOnlyJson ${function:Write-RehearsalJsonCreateOnly} `
    -ProcessRunner {
      [pscustomobject][ordered]@{
        classification = $classification
        simulated = $true
        authorityConsumed = $false
        qualificationEvidence = $false
        executable = "C:\Windows\System32\fixture.exe"
        arguments = @("path with spaces")
        startedAtUtc = "2026-07-30T00:00:00.000Z"
        completedAtUtc = "2026-07-30T00:00:01.000Z"
        stdout = "simulated"
        stderr = ""
        exitCode = 0
        signal = $null
        processError = $null
      }
    }
  if ([int]$processResult.exitCode -ne 0) {
    throw "Shared process policy failed inside rehearsal."
  }

  $runtimeRoot = Join-Path $root "runtime-local-app-data"
  $runtimeFamily = "Oracle.Platform.LocalCertification_fw69ec0wxwzn4"
  [IO.Directory]::CreateDirectory((Join-Path $runtimeRoot "Packages\$runtimeFamily\LocalState")) | Out-Null
  $runtimeAttempt = "stage3-r11-20260803T120000000Z-a1b2c3d4"
  $runtimeParameters = @{
    PackageFamilyName = $runtimeFamily
    ExpectedPackageFamilyName = $runtimeFamily
    ConfigurationId = "runtime-$runtimeAttempt"
    FounderGrantId = "founder-stage3-r11-grant-20260803T120000000Z-a1b2c3d4"
    AuthorityId = "authority-$runtimeAttempt"
    AttemptId = $runtimeAttempt
    CandidateCommit = ("a" * 40)
    CandidateTree = ("b" * 40)
    MsixSha256 = ("c" * 64)
    ExpectedCandidateCommit = ("a" * 40)
    ExpectedCandidateTree = ("b" * 40)
    ExpectedMsixSha256 = ("c" * 64)
    ProviderUrl = "http://127.0.0.1:54321"
    ProviderAnonKey = ("a" * 96)
    ProviderServiceKey = ConvertTo-SecureString ("k" * 96) -AsPlainText -Force
    SessionSecret = ConvertTo-SecureString ("s" * 48) -AsPlainText -Force
    LocalAppDataRoot = $runtimeRoot
    IssuedAtUtc = [DateTime]"2026-08-03T12:00:00Z"
  }
  $runtimeRecord = New-OracleInstalledRuntimeConfiguration @runtimeParameters
  $runtimeArguments = Get-OracleInstalledRuntimeActivationArguments -ConfigurationPath $runtimeRecord.configurationPath -Sha256 $runtimeRecord.sha256
  if ($runtimeArguments -notmatch '^"--oracle-runtime-configuration=.*" "--oracle-runtime-configuration-sha256=[0-9a-f]{64}"$') {
    throw "Runtime-configuration activation arguments failed rehearsal."
  }
  $runtimeRemoval = Remove-OracleInstalledRuntimeConfiguration -ConfigurationPath $runtimeRecord.configurationPath -ExpectedSha256 $runtimeRecord.sha256 -LocalAppDataRoot $runtimeRoot
  if ([int]$runtimeRemoval.remaining -ne 0) { throw "Runtime-configuration residue remains in rehearsal." }
  Remove-Item -LiteralPath $runtimeRoot -Recurse -Force
  $successRoot = Join-Path $root "success"
  [void](New-Item -ItemType Directory -Path $successRoot)
  $success = Invoke-SimulatedLifecycle -Root $successRoot -InjectedFailure ""
  if ($null -ne $success.failure -or $success.state.terminal -ne $true) {
    throw "Simulated success path did not complete."
  }

  $failureResults = [Collections.Generic.List[object]]::new()
  foreach ($phase in @(Get-OracleStage3R11LifecyclePhases)) {
    $failureRoot = Join-Path $root "failure-$phase"
    [void](New-Item -ItemType Directory -Path $failureRoot)
    $failure = Invoke-SimulatedLifecycle -Root $failureRoot -InjectedFailure $phase
    if (
      $null -eq $failure.failure -or
      $failure.state.terminal -eq $true -or
      $failure.teardown.stopForwardExecution -ne $true -or
      $failure.teardown.preserveAttempt -ne $true -or
      $failure.teardown.retryProhibited -ne $true
    ) { throw "Failure rehearsal did not fail closed at phase: $phase" }
    $failureResults.Add([ordered]@{
      phase = $phase
      completed = @($failure.state.completed)
      teardown = $failure.teardown
    })
  }

  $allFiles = @(Get-ChildItem -LiteralPath $root -File -Recurse | Sort-Object FullName)
  foreach ($file in $allFiles) {
    $record = Get-Content -LiteralPath $file.FullName -Raw | ConvertFrom-Json
    if (
      @($record.classification).Count -ne $classification.Count -or
      @(Compare-Object @($record.classification) $classification -CaseSensitive).Count -ne 0
    ) { throw "A rehearsal file can be confused with qualification evidence." }
  }

  $archivePartial = Join-Path $root "development-rehearsal.partial.zip"
  $archive = Join-Path $root "development-rehearsal.zip"
  Compress-Archive -Path (Join-Path $successRoot "*") `
    -DestinationPath $archivePartial -CompressionLevel Optimal
  [IO.File]::Move($archivePartial, $archive)
  $archiveSha256 = (
    Get-FileHash -LiteralPath $archive -Algorithm SHA256
  ).Hash.ToLowerInvariant()
  $manifestPath = Join-Path $root "development-rehearsal-manifest.json"
  Write-RehearsalJsonCreateOnly $manifestPath ([ordered]@{
    classification = $classification
    simulated = $true
    authorityConsumed = $false
    qualificationEvidence = $false
    successPath = @($success.state.completed)
    injectedFailures = $failureResults
    archive = [ordered]@{
      name = [IO.Path]::GetFileName($archive)
      size = (Get-Item -LiteralPath $archive).Length
      sha256 = $archiveSha256
    }
  })

  $result = [ordered]@{
    result = "passed"
    classification = $classification
    realPoliciesExercised = @(
      "Oracle.Stage3R11LifecyclePolicy.ps1",
      "Oracle.Stage3R11IdentityPolicy.ps1",
      "Oracle.Stage3R11ActivationPolicy.ps1",
      "Oracle.Stage3R11CertificateTrustPolicy.ps1",
      "Oracle.Stage3R11InstalledSoftwarePolicy.ps1",
      "Oracle.Stage3R11InstalledRuntimeConfigurationPolicy.ps1",
      "Oracle.Stage3R11ObservationPolicy.ps1",
      "Oracle.Stage3R11ProcessPolicy.ps1",
      "Oracle.Stage3R11WindowPolicy.ps1",
      "Oracle.Stage3R11WindowsExecutablePolicy.ps1"
    )
    successPathPhases = @($success.state.completed)
    failureInjectionCount = $failureResults.Count
    archiveCreateOnlyPublication = $true
    archiveSha256Verified = (
      (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant() -ceq
      $archiveSha256
    )
    authorityConsumed = $false
    hostMutation = $false
    qualificationEvidenceCreated = $false
    limitation = (
      "Package, certificate, trust, launch, repair and removal operations are " +
      "fixture-backed simulations; their real cmdlet surface is validated by the " +
      "separate pre-authority probe on Founder-QA-01."
    )
  }
} finally {
  if (Test-Path -LiteralPath $root) {
    Remove-Item -LiteralPath $root -Recurse -Force
  }
  if (
    (Test-Path -LiteralPath $parent) -and
    @(Get-ChildItem -LiteralPath $parent -Force).Count -eq 0
  ) {
    Remove-Item -LiteralPath $parent
  }
}

$result | ConvertTo-Json -Depth 20
