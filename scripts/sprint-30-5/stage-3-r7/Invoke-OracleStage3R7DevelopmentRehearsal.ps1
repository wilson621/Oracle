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

. (Join-Path $PSScriptRoot "Oracle.Stage3R7LifecyclePolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R7IdentityPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R7ActivationPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R7CertificateTrustPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R7InstalledSoftwarePolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R7ProcessPolicy.ps1")
. (Join-Path $PSScriptRoot "Oracle.Stage3R7WindowsExecutablePolicy.ps1")

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
  Assert-OracleStage3R7NextLifecyclePhase -State $State -Phase $Phase
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
  [void](Move-OracleStage3R7Lifecycle -State $State -Phase $Phase)
}

function Invoke-SimulatedLifecycle([string]$Root, [string]$InjectedFailure) {
  $state = New-OracleStage3R7LifecycleState
  $failure = $null
  try {
    foreach ($phase in @(Get-OracleStage3R7LifecyclePhases)) {
      Invoke-SimulatedPhase -State $state -Phase $phase -Root $Root `
        -InjectedFailure $InjectedFailure
    }
  } catch {
    $failure = $_
  }
  $teardown = Get-OracleStage3R7TeardownObligations `
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
$parent = Join-Path $repositoryRoot ".tmp-stage3-r7-development-rehearsal"
$root = Join-Path $parent ("rehearsal-{0}" -f [Guid]::NewGuid().ToString("N"))
if (Test-Path -LiteralPath $root) {
  throw "Development rehearsal root already exists."
}
[void](New-Item -ItemType Directory -Path $root)

try {
  $software = @(ConvertTo-OracleStage3R7InstalledSoftwareInventory -RegistryEntries @(
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
  $fixtureThumbprint = "119937D4B90068ACE8765695C5A94321A2C40BD8"
  $fixtureSubject = "CN=Oracle Stage 2 Requalification R2 Local Test Signing - NOT PRODUCTION"
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
  Assert-OracleStage3R7TemporaryTrustState `
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
    [void](Get-OracleStage3R7WindowsExecutablePath `
      -Name $name -SystemDirectory $fixtureSystem32)
  }
  $fixtureActivation = Invoke-OracleStage3R7ApplicationActivation `
    -AppUserModelId "Oracle.Platform.LocalCertification_fixture!Oracle" `
    -ActivationRunner {
      [pscustomobject]@{ HResult = "0x00000000"; ProcessId = 4242 }
    }
  Assert-OracleStage3R7ApplicationActivationSucceeded `
    -Result $fixtureActivation
  Remove-Item -LiteralPath $fixtureSystem32 -Recurse
  $processRoot = Join-Path $root "process"
  [void](New-Item -ItemType Directory -Path $processRoot)
  $processCounts = @{}
  $processResult = Invoke-OracleStage3R7GovernedProcess `
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

  $successRoot = Join-Path $root "success"
  [void](New-Item -ItemType Directory -Path $successRoot)
  $success = Invoke-SimulatedLifecycle -Root $successRoot -InjectedFailure ""
  if ($null -ne $success.failure -or $success.state.terminal -ne $true) {
    throw "Simulated success path did not complete."
  }

  $failureResults = [Collections.Generic.List[object]]::new()
  foreach ($phase in @(Get-OracleStage3R7LifecyclePhases)) {
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
      "Oracle.Stage3R7LifecyclePolicy.ps1",
      "Oracle.Stage3R7IdentityPolicy.ps1",
      "Oracle.Stage3R7ActivationPolicy.ps1",
      "Oracle.Stage3R7CertificateTrustPolicy.ps1",
      "Oracle.Stage3R7InstalledSoftwarePolicy.ps1",
      "Oracle.Stage3R7ProcessPolicy.ps1",
      "Oracle.Stage3R7WindowsExecutablePolicy.ps1"
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
