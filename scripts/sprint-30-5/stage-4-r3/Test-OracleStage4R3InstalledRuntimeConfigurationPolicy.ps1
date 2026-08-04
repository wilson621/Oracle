Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Oracle.Stage4R3InstalledRuntimeConfigurationPolicy.ps1")

$root = Join-Path (Get-Location) (".tmp-runtime-policy-" + [Guid]::NewGuid().ToString("N"))
$family = "Oracle.Platform.LocalCertification_fw69ec0wxwzn4"
$execution = "stage4-r3-20260803T120000000Z-a1b2c3d4"
$secret = ConvertTo-SecureString ("s" * 48) -AsPlainText -Force
$service = ConvertTo-SecureString ("k" * 96) -AsPlainText -Force
try {
  [IO.Directory]::CreateDirectory((Join-Path $root "Packages\$family\LocalState")) | Out-Null
  $parameters = @{
    PackageFamilyName = $family
    ExpectedPackageFamilyName = $family
    ConfigurationId = "runtime-$execution"
    FounderGrantId = "founder-stage4-r3-grant-20260803T120000000Z-a1b2c3d4"
    AuthorityId = "authority-$execution"
    AttemptId = $execution
    CandidateCommit = ("a" * 40)
    CandidateTree = ("b" * 40)
    MsixSha256 = ("c" * 64)
    ExpectedCandidateCommit = ("a" * 40)
    ExpectedCandidateTree = ("b" * 40)
    ExpectedMsixSha256 = ("c" * 64)
    ProviderUrl = "http://127.0.0.1:54321"
    ProviderAnonKey = ("a" * 96)
    ProviderServiceKey = $service
    SessionSecret = $secret
    LocalAppDataRoot = $root
    IssuedAtUtc = [DateTime]"2026-08-03T12:00:00Z"
  }
  $record = New-OracleInstalledRuntimeConfiguration @parameters

  if (
    -not (Test-Path -LiteralPath $record.configurationPath -PathType Leaf) -or
    $record.containsSecretValues -ne $false -or
    $record.createOnly -ne $true -or
    $record.restrictedAcl -ne $true
  ) {
    throw "Installed runtime configuration admission record is invalid."
  }
  $recordJson = $record | ConvertTo-Json -Depth 5
  if ($recordJson.Contains("kkkk") -or $recordJson.Contains("ssss")) {
    throw "Secret entered the admission record."
  }
  $arguments = Get-OracleInstalledRuntimeActivationArguments -ConfigurationPath $record.configurationPath -Sha256 $record.sha256
  if (
    $arguments -notmatch '^"--oracle-runtime-configuration=.*" "--oracle-runtime-configuration-sha256=[0-9a-f]{64}"$'
  ) {
    throw "Activation arguments are not deterministic."
  }

  $duplicateRejected = $false
  try {
    New-OracleInstalledRuntimeConfiguration @parameters
  } catch {
    $duplicateRejected = $_.Exception.Message -match "namespace already exists"
  }
  if (-not $duplicateRejected) {
    throw "Duplicate configuration namespace was not rejected."
  }

  $teardown = Remove-OracleInstalledRuntimeConfiguration -ConfigurationPath $record.configurationPath -ExpectedSha256 $record.sha256 -LocalAppDataRoot $root

  $packageIdentity = "Oracle.Platform.LocalCertification"
  $packageFullName = "Oracle.Platform.LocalCertification_0.1.4.0_x64__fw69ec0wxwzn4"
  $packageRoot = Join-Path $root "Packages\$family"
  Remove-Item -LiteralPath $packageRoot -Recurse -ErrorAction Stop
  $registration = [pscustomobject]@{
    PackageFamilyName = $family
    PackageFullName = $packageFullName
  }
  $registrationProvider = { param([string]$Identity) @($registration) }

  $registrationMismatchRejected = $false
  try {
    Initialize-OracleInstalledRuntimePackageData `
      -PackageIdentity $packageIdentity `
      -PackageFamilyName $family `
      -ExpectedPackageFamilyName $family `
      -PackageFullName $packageFullName `
      -ExpectedPackageFullName $packageFullName `
      -LocalAppDataRoot $root `
      -RegistrationPollLimit 1 `
      -RegistrationPollMilliseconds 0 `
      -PackageRegistrationProvider { param([string]$Identity) @() } `
      -ApplicationDataFactory { throw "must not execute" }
  } catch {
    $registrationMismatchRejected = $_.Exception.Message -match "registration is absent"
  }

  $initializerFailureRejected = $false
  try {
    Initialize-OracleInstalledRuntimePackageData `
      -PackageIdentity $packageIdentity `
      -PackageFamilyName $family `
      -ExpectedPackageFamilyName $family `
      -PackageFullName $packageFullName `
      -ExpectedPackageFullName $packageFullName `
      -LocalAppDataRoot $root `
      -PackageRegistrationProvider $registrationProvider `
      -ApplicationDataFactory { throw "synthetic ApplicationData failure" }
  } catch {
    $initializerFailureRejected = $_.Exception.Message -match "initialization failed"
  }

  $unexpectedPathRejected = $false
  $unexpectedRoot = Join-Path $root "unexpected\LocalState"
  try {
    Initialize-OracleInstalledRuntimePackageData `
      -PackageIdentity $packageIdentity `
      -PackageFamilyName $family `
      -ExpectedPackageFamilyName $family `
      -PackageFullName $packageFullName `
      -ExpectedPackageFullName $packageFullName `
      -LocalAppDataRoot $root `
      -PackageRegistrationProvider $registrationProvider `
      -ApplicationDataFactory {
        param([string]$PackageFamilyName)
        [IO.Directory]::CreateDirectory($unexpectedRoot) | Out-Null
        [pscustomobject]@{ LocalFolder = [pscustomobject]@{ Path = $unexpectedRoot } }
      }
  } catch {
    $unexpectedPathRejected = $_.Exception.Message -match "unexpected path or state"
  }
  if (Test-Path -LiteralPath (Join-Path $root "unexpected")) {
    Remove-Item -LiteralPath (Join-Path $root "unexpected") -Recurse -ErrorAction Stop
  }

  $delayedRegistrationState = [pscustomobject]@{ Poll = 0 }
  $postResetInitialization = Initialize-OracleInstalledRuntimePackageData `
    -PackageIdentity $packageIdentity `
    -PackageFamilyName $family `
    -ExpectedPackageFamilyName $family `
    -PackageFullName $packageFullName `
    -ExpectedPackageFullName $packageFullName `
    -LocalAppDataRoot $root `
    -RegistrationPollLimit 3 `
    -RegistrationPollMilliseconds 0 `
    -PackageRegistrationProvider {
      param([string]$Identity)
      $delayedRegistrationState.Poll++
      if ($delayedRegistrationState.Poll -lt 3) { return @() }
      @($registration)
    } `
    -ApplicationDataFactory {
      param([string]$PackageFamilyName)
      $localState = Join-Path $root "Packages\$PackageFamilyName\LocalState"
      [IO.Directory]::CreateDirectory($localState) | Out-Null
      [pscustomobject]@{ LocalFolder = [pscustomobject]@{ Path = $localState } }
    }
  if (
    $postResetInitialization.api -cne
      "Windows.Management.Core.ApplicationDataManager.CreateForPackageFamily" -or
    -not $postResetInitialization.packageRootAbsentBefore -or
    [int]$postResetInitialization.registrationPolls -ne 3 -or
    -not $postResetInitialization.localStatePathMatched -or
    $postResetInitialization.containsSecretValues
  ) {
    throw "Post-reset package-data initialization record is invalid."
  }
  $postResetRecord = New-OracleInstalledRuntimeConfiguration @parameters
  $postResetTeardown = Remove-OracleInstalledRuntimeConfiguration `
    -ConfigurationPath $postResetRecord.configurationPath `
    -ExpectedSha256 $postResetRecord.sha256 `
    -LocalAppDataRoot $root
  if ($postResetTeardown.remaining -ne 0) {
    throw "Post-reset runtime configuration teardown failed."
  }
  $mismatchRejected = $false
  $mismatch = @{} + $parameters
  $mismatch.ExpectedMsixSha256 = ("d" * 64)
  try {
    New-OracleInstalledRuntimeConfiguration @mismatch
  } catch {
    $mismatchRejected = $_.Exception.Message -match "governed binding is mismatched"
  }
  if (-not $mismatchRejected) {
    throw "Mismatched governed candidate binding was not rejected."
  }

  $missingRootRejected = $false
  $missingRoot = @{} + $parameters
  $missingRoot.PackageFamilyName = "Oracle.Platform.LocalCertification_aaaaaaaaaaaaa"
  $missingRoot.ExpectedPackageFamilyName = $missingRoot.PackageFamilyName
  try {
    New-OracleInstalledRuntimeConfiguration @missingRoot
  } catch {
    $missingRootRejected = $_.Exception.Message -match "package root is absent"
  }
  if (
    -not $registrationMismatchRejected -or
    -not $initializerFailureRejected -or
    -not $unexpectedPathRejected
  ) {
    throw "Post-reset package-data initialization did not fail closed."
  }
  if (-not $missingRootRejected) {
    throw "Absent package root was not rejected."
  }
  if ($teardown.remaining -ne 0) {
    throw "Installed runtime configuration teardown failed."
  }

  $tamper = @{} + $parameters
  $tamper.AttemptId = "stage4-r3-20260803T120000000Z-a1b2c3d5"
  $tamper.ConfigurationId = "runtime-$($tamper.AttemptId)"
  $tamper.AuthorityId = "authority-$($tamper.AttemptId)"
  $tamper.FounderGrantId = "founder-stage4-r3-grant-20260803T120000000Z-a1b2c3d5"
  $tamperRecord = New-OracleInstalledRuntimeConfiguration @tamper
  [IO.File]::AppendAllText($tamperRecord.configurationPath, "x")
  $tamperRejected = $false
  try {
    Remove-OracleInstalledRuntimeConfiguration -ConfigurationPath $tamperRecord.configurationPath -ExpectedSha256 $tamperRecord.sha256 -LocalAppDataRoot $root
  } catch {
    $tamperRejected = $_.Exception.Message -match "teardown identity mismatch"
  }
  if (-not $tamperRejected -or -not (Test-Path -LiteralPath $tamperRecord.configurationPath -PathType Leaf)) {
    throw "Tampered runtime configuration was not preserved fail closed."
  }
  Remove-Item -LiteralPath $tamperRecord.configurationPath -Force
  Remove-Item -LiteralPath (Split-Path -Parent $tamperRecord.configurationPath) -Force

  $partial = @{} + $parameters
  $partial.AttemptId = "stage4-r3-20260803T120000000Z-a1b2c3d6"
  $partial.ConfigurationId = "runtime-$($partial.AttemptId)"
  $partial.AuthorityId = "authority-$($partial.AttemptId)"
  $partial.FounderGrantId = "founder-stage4-r3-grant-20260803T120000000Z-a1b2c3d6"
  $partialRecord = New-OracleInstalledRuntimeConfiguration @partial
  $consumingPath = "$($partialRecord.configurationPath).consuming-123"
  Move-Item -LiteralPath $partialRecord.configurationPath -Destination $consumingPath -ErrorAction Stop
  $partialRejected = $false
  try {
    Remove-OracleInstalledRuntimeConfiguration -ConfigurationPath $partialRecord.configurationPath -ExpectedSha256 $partialRecord.sha256 -LocalAppDataRoot $root
  } catch {
    $partialRejected = $_.Exception.Message -match "residue remains"
  }
  if (-not $partialRejected -or -not (Test-Path -LiteralPath $consumingPath -PathType Leaf)) {
    throw "Partial-consumption residue was not preserved fail closed."
  }
  Remove-Item -LiteralPath $consumingPath -Force
  Remove-Item -LiteralPath (Split-Path -Parent $partialRecord.configurationPath) -Force
  $firstSecret = New-OracleStage4R3CryptographicValue
  $secondSecret = New-OracleStage4R3CryptographicValue
  if (
    [string]::IsNullOrWhiteSpace($firstSecret) -or
    $firstSecret -ceq $secondSecret
  ) {
    throw "Cryptographic values are absent or repeated."
  }
  $entropyFailureRejected = $false
  try {
    [void](New-OracleStage4R3CryptographicValue -EntropyProvider {
      throw "synthetic entropy failure"
    })
  } catch {
    $entropyFailureRejected = $_.Exception.Message -match
      "Cryptographic runtime-configuration value generation failed"
  }
  $allZeroRejected = $false
  try {
    [void](New-OracleStage4R3CryptographicValue -EntropyProvider {
      param([int]$Length)
      New-Object byte[] $Length
    })
  } catch {
    $allZeroRejected = $_.Exception.Message -match "entropy output is invalid"
  }
  if (-not $entropyFailureRejected -or -not $allZeroRejected) {
    throw "Cryptographic generation did not fail closed."
  }
  [pscustomobject][ordered]@{
    contract = "oracle.sprint-30-5.stage-4-r3-installed-runtime-configuration-policy-test"
    powershellVersion = $PSVersionTable.PSVersion.ToString()
    createOnly = $true
    restrictedAcl = $true
    secretFreeAdmissionRecord = $true
    deterministicActivationArguments = $true
    duplicateRejected = $true
    governedBindingMismatchRejected = $true
    absentPackageRootRejected = $true
    postResetRegistrationMismatchRejected = $registrationMismatchRejected
    postResetInitializerFailureRejected = $initializerFailureRejected
    postResetUnexpectedPathRejected = $unexpectedPathRejected
    postResetSupportedInitialization = $true
    postResetRegistrationStabilization = $true
    unconfiguredBootstrapActivationRequired = $false
    tamperedFilePreservedFailClosed = $true
    partialConsumptionPreservedFailClosed = $true
    zeroResidue = $true
    cryptographicValuesDistinct = $true
    entropyFailureRejected = $entropyFailureRejected
    allZeroEntropyRejected = $allZeroRejected
    result = "pass"
  } | ConvertTo-Json -Depth 5
} finally {
  Remove-Item -LiteralPath $root -Recurse -ErrorAction SilentlyContinue
}
