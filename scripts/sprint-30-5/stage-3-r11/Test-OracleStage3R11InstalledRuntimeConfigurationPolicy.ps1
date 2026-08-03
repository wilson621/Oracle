Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Oracle.Stage3R11InstalledRuntimeConfigurationPolicy.ps1")

$root = Join-Path (Get-Location) (".tmp-runtime-policy-" + [Guid]::NewGuid().ToString("N"))
$family = "Oracle.Platform.LocalCertification_fw69ec0wxwzn4"
$execution = "stage3-r11-20260803T120000000Z-a1b2c3d4"
$secret = ConvertTo-SecureString ("s" * 48) -AsPlainText -Force
$service = ConvertTo-SecureString ("k" * 96) -AsPlainText -Force
try {
  [IO.Directory]::CreateDirectory((Join-Path $root "Packages\$family\LocalState")) | Out-Null
  $parameters = @{
    PackageFamilyName = $family
    ExpectedPackageFamilyName = $family
    ConfigurationId = "runtime-$execution"
    FounderGrantId = "founder-stage3-r11-grant-20260803T120000000Z-a1b2c3d4"
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
  if (-not $missingRootRejected) {
    throw "Absent package root was not rejected."
  }
  if ($teardown.remaining -ne 0) {
    throw "Installed runtime configuration teardown failed."
  }

  $tamper = @{} + $parameters
  $tamper.AttemptId = "stage3-r11-20260803T120000000Z-a1b2c3d5"
  $tamper.ConfigurationId = "runtime-$($tamper.AttemptId)"
  $tamper.AuthorityId = "authority-$($tamper.AttemptId)"
  $tamper.FounderGrantId = "founder-stage3-r11-grant-20260803T120000000Z-a1b2c3d5"
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
  $partial.AttemptId = "stage3-r11-20260803T120000000Z-a1b2c3d6"
  $partial.ConfigurationId = "runtime-$($partial.AttemptId)"
  $partial.AuthorityId = "authority-$($partial.AttemptId)"
  $partial.FounderGrantId = "founder-stage3-r11-grant-20260803T120000000Z-a1b2c3d6"
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
  $firstSecret = New-OracleStage3R11CryptographicValue
  $secondSecret = New-OracleStage3R11CryptographicValue
  if (
    [string]::IsNullOrWhiteSpace($firstSecret) -or
    $firstSecret -ceq $secondSecret
  ) {
    throw "Cryptographic values are absent or repeated."
  }
  $entropyFailureRejected = $false
  try {
    [void](New-OracleStage3R11CryptographicValue -EntropyProvider {
      throw "synthetic entropy failure"
    })
  } catch {
    $entropyFailureRejected = $_.Exception.Message -match
      "Cryptographic runtime-configuration value generation failed"
  }
  $allZeroRejected = $false
  try {
    [void](New-OracleStage3R11CryptographicValue -EntropyProvider {
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
    contract = "oracle.sprint-30-5.stage-3-r11-installed-runtime-configuration-policy-test"
    powershellVersion = $PSVersionTable.PSVersion.ToString()
    createOnly = $true
    restrictedAcl = $true
    secretFreeAdmissionRecord = $true
    deterministicActivationArguments = $true
    duplicateRejected = $true
    governedBindingMismatchRejected = $true
    absentPackageRootRejected = $true
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
