[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$FounderAuthorityToken,
  [Parameter(Mandatory = $true)][string]$FounderGrantId,
  [Parameter(Mandatory = $true)][string]$AuthorityId,
  [Parameter(Mandatory = $true)][string]$AttemptId,
  [Parameter(Mandatory = $true)][string]$TimestampUtc,
  [Parameter(Mandatory = $true)][string]$ExpectedTransferManifestSha256,
  [Parameter(Mandatory = $true)][string]$ExpectedTransferCustodySha256,
  [Parameter(Mandatory = $true)][string]$ExpectedHarnessCommit,
  [Parameter(Mandatory = $true)][string]$HostContinuityPath,
  [Parameter(Mandatory = $true)][string]$ExpectedHostContinuitySha256,
  [Parameter(Mandatory = $true)][string]$TransferRoot,
  [Parameter(Mandatory = $true)][string]$EvidenceReturnRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ConfirmPreference = "None"

$scriptPath = $MyInvocation.MyCommand.Path
$scriptRoot = Split-Path -Parent $scriptPath
$bootstrapManifestPath = Join-Path $TransferRoot (
  "Oracle.Stage3R12TransferManifest.json"
)
if (
  $ExpectedTransferManifestSha256 -cnotmatch '^[0-9a-f]{64}$' -or
  -not (Test-Path -LiteralPath $bootstrapManifestPath -PathType Leaf) -or
  (Get-FileHash -LiteralPath $bootstrapManifestPath -Algorithm SHA256).
    Hash.ToLowerInvariant() -cne $ExpectedTransferManifestSha256
) { throw "Execution bootstrap transfer manifest binding differs." }
$bootstrapManifest = Get-Content -LiteralPath $bootstrapManifestPath -Raw |
  ConvertFrom-Json
$bootstrapRequiredFiles = @(
  "Invoke-OracleStage3R12Qualification.ps1",
  "Oracle.Stage3R12ActivationPolicy.ps1",
  "Oracle.Stage3R12CertificateTrustPolicy.ps1",
  "Oracle.Stage3R12Contract.json",
  "Oracle.Stage3R12IdentityPolicy.ps1",
  "Oracle.Stage3R12InstalledSoftwarePolicy.ps1",
  "Oracle.Stage3R12InstalledRuntimeConfigurationPolicy.ps1",
  "Oracle.Stage3R12LifecyclePolicy.ps1",
  "Oracle.Stage3R12ObservationPolicy.ps1",
  "Oracle.Stage3R12PackageInventoryPolicy.ps1",
  "Oracle.Stage3R12PreflightPolicy.ps1",
  "Oracle.Stage3R12ProcessPolicy.ps1",
  "Oracle.Stage3R12WindowPolicy.ps1",
  "Oracle.Stage3R12WindowsExecutablePolicy.ps1"
)
foreach ($fileName in $bootstrapRequiredFiles) {
  $relativePath = "payload/$fileName"
  $entry = @($bootstrapManifest.payload | Where-Object {
    [string]$_.path -ceq $relativePath
  })
  $path = Join-Path $TransferRoot $relativePath
  if (
    $entry.Count -ne 1 -or
    -not (Test-Path -LiteralPath $path -PathType Leaf) -or
    (Get-FileHash -LiteralPath $path -Algorithm SHA256).
      Hash.ToLowerInvariant() -cne [string]$entry[0].sha256
  ) { throw "Execution bootstrap file differs from the transfer: $fileName" }
}
if (
  -not [StringComparer]::OrdinalIgnoreCase.Equals(
    [IO.Path]::GetFullPath($scriptPath),
    [IO.Path]::GetFullPath((
      Join-Path $TransferRoot "payload/Invoke-OracleStage3R12Qualification.ps1"
    ))
  )
) { throw "Execution bootstrap script is outside the verified transfer." }
$contract = Get-Content -LiteralPath (
  Join-Path $scriptRoot "Oracle.Stage3R12Contract.json"
) -Raw | ConvertFrom-Json
. (Join-Path $scriptRoot "Oracle.Stage3R12IdentityPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R12ActivationPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R12CertificateTrustPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R12PackageInventoryPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R12InstalledSoftwarePolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R12InstalledRuntimeConfigurationPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R12LifecyclePolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R12ObservationPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R12PreflightPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R12ProcessPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R12WindowPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage3R12WindowsExecutablePolicy.ps1")
Assert-OracleStage3R12ApplicationActivationContract -Contract $contract
Assert-OracleStage3R12CertificateTrustContract -Contract $contract
$expectedToken = "FOUNDER-AUTHORISED-STAGE3-R12-EXECUTION"
$thumbprint = [string]$contract.stage2.certificateThumbprint
$publisher = [string]$contract.package.publisher
$attemptRoot = Join-Path $EvidenceReturnRoot $AttemptId
$authorityPath = Join-Path $EvidenceReturnRoot "authorities\$AuthorityId.json"
$evidenceRoot = Join-Path $attemptRoot "evidence"
$lifecycleRoot = Join-Path $attemptRoot "lifecycle"
$logsRoot = Join-Path $attemptRoot "logs"
$workRoot = Join-Path $attemptRoot "work"
$manifestPath = Join-Path $TransferRoot "Oracle.Stage3R12TransferManifest.json"
$custodyPath = Join-Path $TransferRoot "Oracle.Stage3R12TransferCustody.json"
$payloadRoot = Join-Path $TransferRoot "payload"
$msixPath = Join-Path $payloadRoot $contract.package.fileName
$discoveryPath = Join-Path $payloadRoot "Oracle.WindowDiscovery.exe"
$observerPath = Join-Path $payloadRoot "Oracle.WindowObserver.exe"
$identityPolicyPath = Join-Path $payloadRoot "Oracle.Stage3R12IdentityPolicy.ps1"
$activationPolicyPath = Join-Path $payloadRoot "Oracle.Stage3R12ActivationPolicy.ps1"
$packageInventoryPolicyPath = Join-Path $payloadRoot (
  "Oracle.Stage3R12PackageInventoryPolicy.ps1"
)
$installedSoftwarePolicyPath = Join-Path $payloadRoot (
  "Oracle.Stage3R12InstalledSoftwarePolicy.ps1"
)
$installedRuntimeConfigurationPolicyPath = Join-Path $payloadRoot (
  "Oracle.Stage3R12InstalledRuntimeConfigurationPolicy.ps1"
)
$lifecyclePolicyPath = Join-Path $payloadRoot "Oracle.Stage3R12LifecyclePolicy.ps1"
$observationPolicyPath = Join-Path $payloadRoot (
  "Oracle.Stage3R12ObservationPolicy.ps1"
)
$preflightPolicyPath = Join-Path $payloadRoot "Oracle.Stage3R12PreflightPolicy.ps1"
$processPolicyPath = Join-Path $payloadRoot "Oracle.Stage3R12ProcessPolicy.ps1"
$windowPolicyPath = Join-Path $payloadRoot "Oracle.Stage3R12WindowPolicy.ps1"
$windowsExecutablePolicyPath = Join-Path $payloadRoot (
  "Oracle.Stage3R12WindowsExecutablePolicy.ps1"
)
$certificateTrustPolicyPath = Join-Path $payloadRoot (
  "Oracle.Stage3R12CertificateTrustPolicy.ps1"
)
$certificateRawBase64 = $null
$packageFamilyName = $null
$initialRuntimeConfiguration = $null
$repairRuntimeConfiguration = $null
$partialArchive = $null
$initialSoftwareJson = $null
$authorityConsumed = $false
$lifecycleState = New-OracleStage3R12LifecycleState
$processEvidenceCounts = @{}
$teardownProcessEvents = [Collections.Generic.List[object]]::new()
function Get-Sha256([string]$Path) {
  (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-RequiredObjectMemberValue(
  [object]$InputObject,
  [string]$MemberName,
  [string]$Context
) {
  if ($null -eq $InputObject) {
    throw "$Context is null."
  }
  $property = $InputObject.PSObject.Properties[$MemberName]
  if ($null -eq $property) {
    throw "$Context is missing mandatory member '$MemberName'."
  }
  $property.Value
}

function Get-InstalledSoftwareInventory {
  @(Get-OracleStage3R12InstalledSoftwareInventory)
}

function New-GovernedRuntimeConfiguration {
  if ([string]::IsNullOrWhiteSpace($packageFamilyName)) {
    throw "Installed package family is unavailable for runtime configuration."
  }
  $anonValue = $null
  $serviceValue = $null
  $sessionValue = $null
  $serviceSecure = $null
  $sessionSecure = $null
  try {
    $anonValue = New-OracleStage3R12CryptographicValue
    $serviceValue = New-OracleStage3R12CryptographicValue
    $sessionValue = New-OracleStage3R12CryptographicValue
    $serviceSecure = ConvertTo-SecureString $serviceValue -AsPlainText -Force
    $sessionSecure = ConvertTo-SecureString $sessionValue -AsPlainText -Force
    New-OracleInstalledRuntimeConfiguration `
      -PackageFamilyName $packageFamilyName `
      -ExpectedPackageFamilyName $packageFamilyName `
      -ConfigurationId "runtime-$AttemptId" `
      -FounderGrantId $FounderGrantId `
      -AuthorityId $AuthorityId `
      -AttemptId $AttemptId `
      -CandidateCommit ([string]$contract.stage2.candidateCommit) `
      -CandidateTree ([string]$contract.stage2.candidateTree) `
      -MsixSha256 ([string]$contract.stage2.msixSha256) `
      -ExpectedCandidateCommit ([string]$contract.stage2.candidateCommit) `
      -ExpectedCandidateTree ([string]$contract.stage2.candidateTree) `
      -ExpectedMsixSha256 ([string]$contract.stage2.msixSha256) `
      -ProviderUrl ([string]$contract.runtimeConfiguration.providerOrigin) `
      -ProviderAnonKey $anonValue `
      -ProviderServiceKey $serviceSecure `
      -SessionSecret $sessionSecure `
      -LocalAppDataRoot $env:LOCALAPPDATA `
      -IssuedAtUtc ([DateTime]::UtcNow)
  } finally {
    $anonValue = $null
    $serviceValue = $null
    $sessionValue = $null
    $serviceSecure = $null
    $sessionSecure = $null
  }
}

function Assert-RuntimeConfigurationConsumedAndRemoveNamespace {
  param([Parameter(Mandatory = $true)][object]$Record)
  $path = [string]$Record.configurationPath
  $directory = Split-Path -Parent $path
  if (Test-Path -LiteralPath $path) {
    throw "Installed runtime configuration was not atomically consumed."
  }
  if (@(Get-ChildItem -LiteralPath $directory -Force -ErrorAction Stop).Count -ne 0) {
    throw "Installed runtime configuration consumption residue remains."
  }
  Remove-OracleInstalledRuntimeConfiguration `
    -ConfigurationPath $path `
    -ExpectedSha256 ([string]$Record.sha256) `
    -LocalAppDataRoot $env:LOCALAPPDATA
}

function Remove-RuntimeConfigurationForTeardown {
  param([AllowNull()][object]$Record)
  if ($null -eq $Record) { return }
  Remove-OracleInstalledRuntimeConfiguration `
    -ConfigurationPath ([string]$Record.configurationPath) `
    -ExpectedSha256 ([string]$Record.sha256) `
    -LocalAppDataRoot $env:LOCALAPPDATA | Out-Null
}

function Get-RuntimeConfigurationEvidence {
  param([Parameter(Mandatory = $true)][object]$Record)
  [ordered]@{
    contract = [string]$Record.contract
    contractVersion = [int]$Record.contractVersion
    configurationId = [string]$Record.configurationId
    configurationPath = [string]$Record.configurationPath
    sha256 = [string]$Record.sha256
    issuedAtUtc = [string]$Record.issuedAtUtc
    expiresAtUtc = [string]$Record.expiresAtUtc
    containsSecretValues = $false
    createOnly = [bool]$Record.createOnly
    restrictedAcl = [bool]$Record.restrictedAcl
  }
}

function Assert-CreateOnlyPath([string]$Path) {
  if (Test-Path -LiteralPath $Path) {
    throw "Create-only destination already exists: $Path"
  }
  $cursor = Split-Path -Parent $Path
  while ($cursor) {
    if (Test-Path -LiteralPath $cursor) {
      $item = Get-Item -LiteralPath $cursor -Force
      if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "Governed path traverses a reparse point: $cursor"
      }
    }
    $parent = Split-Path -Parent $cursor
    if ($parent -eq $cursor) { break }
    $cursor = $parent
  }
}

function Assert-NoReparseTraversal([string]$Path) {
  $cursor = [IO.Path]::GetFullPath($Path)
  while ($cursor) {
    if (
      (Test-Path -LiteralPath $cursor) -and
      (((Get-Item -LiteralPath $cursor -Force).Attributes -band
        [IO.FileAttributes]::ReparsePoint) -ne 0)
    ) { throw "Governed input traverses a reparse point: $cursor" }
    $parent = Split-Path -Parent $cursor
    if ($parent -eq $cursor) { break }
    $cursor = $parent
  }
}

function Copy-CreateOnlyFile([string]$Source, [string]$Destination) {
  Assert-NoReparseTraversal $Source
  Assert-CreateOnlyPath $Destination
  $sourceHash = Get-Sha256 $Source
  [IO.File]::WriteAllBytes($Destination, [IO.File]::ReadAllBytes($Source))
  if ((Get-Sha256 $Destination) -cne $sourceHash) {
    throw "Create-only evidence copy differs from source."
  }
}

function Write-CreateOnlyJson([string]$Path, $Value) {
  Assert-CreateOnlyPath $Path
  $parent = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $parent)) {
    [void](New-Item -ItemType Directory -Path $parent)
  }
  $temporary = "$Path.partial-$PID"
  Assert-CreateOnlyPath $temporary
  try {
    $json = $Value | ConvertTo-Json -Depth 100
    [IO.File]::WriteAllText($temporary, "$json`n", [Text.UTF8Encoding]::new($false))
    [IO.File]::Move($temporary, $Path)
  } finally {
    if (Test-Path -LiteralPath $temporary) {
      Remove-Item -LiteralPath $temporary -ErrorAction SilentlyContinue
    }
  }
}

function Write-CreateOnlyText([string]$Path, [string]$Value) {
  Assert-CreateOnlyPath $Path
  $temporary = "$Path.partial-$PID"
  Assert-CreateOnlyPath $temporary
  try {
    [IO.File]::WriteAllText($temporary, $Value, [Text.ASCIIEncoding]::new())
    [IO.File]::Move($temporary, $Path)
  } finally {
    if (Test-Path -LiteralPath $temporary) {
      Remove-Item -LiteralPath $temporary -ErrorAction SilentlyContinue
    }
  }
}

function Write-Lifecycle([string]$Phase, $Details) {
  $phaseIndex = [int]$lifecycleState.index
  Assert-OracleStage3R12NextLifecyclePhase -State $lifecycleState -Phase $Phase
  Write-CreateOnlyJson (
    Join-Path $lifecycleRoot ("{0:D2}-{1}.json" -f ($phaseIndex + 1), $Phase)
  ) ([ordered]@{
    contract = "oracle.sprint-30-5.stage-3-r12-lifecycle"
    programmeIdentity = [string]$contract.programmeIdentity
    revision = [string]$contract.revision
    founderGrantId = $FounderGrantId
    authorityId = $AuthorityId
    attemptId = $AttemptId
    phase = $Phase
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
      details = $Details
  })
  [void](Move-OracleStage3R12Lifecycle -State $lifecycleState -Phase $Phase)
}

function Invoke-GovernedProcess(
  [string]$Name,
  [string]$Executable,
  [string[]]$Arguments,
  [bool]$RequireZero = $true
) {
  Invoke-OracleStage3R12GovernedProcess `
    -Name $Name `
    -Executable $Executable `
    -Arguments $Arguments `
    -LogsRoot $logsRoot `
    -ProcessEvidenceCounts $processEvidenceCounts `
    -WriteCreateOnlyJson ${function:Write-CreateOnlyJson} `
    -RequireZero $RequireZero
}

function Get-ExactCertificateMatches {
  @(Get-OracleStage3R12LogicalCertificateViews -Thumbprint $thumbprint)
}

function Get-PhysicalExactCertificateMatches {
  @(Get-OracleStage3R12PhysicalCertificateMatches -Thumbprint $thumbprint)
}

function Remove-ExactMachineTrust {
  $physicalMatches = @(Get-PhysicalExactCertificateMatches)
  $logicalViews = @(Get-ExactCertificateMatches)
  if ($physicalMatches.Count -eq 0 -and $logicalViews.Count -eq 0) { return }
  Assert-OracleStage3R12ExactRemovalTarget `
    -PhysicalMatches $physicalMatches -LogicalViews $logicalViews `
    -Thumbprint $thumbprint -Subject $publisher `
    -RawBase64 $certificateRawBase64
  $certutil = Get-OracleStage3R12WindowsExecutablePath -Name "certutil.exe"
  [void](Invoke-GovernedProcess "exact-machine-trust-remove" $certutil @(
    Get-OracleStage3R12TrustRemovalArguments -Thumbprint $thumbprint
  ))
  Assert-OracleStage3R12NoCertificateResidue `
    -PhysicalMatches @(Get-PhysicalExactCertificateMatches) `
    -LogicalViews @(Get-ExactCertificateMatches)
}

function Remove-ExactPackage {
  $packages = @(Get-AppxPackage -Name $contract.package.identity -ErrorAction SilentlyContinue)
  if ($packages.Count -gt 1) { throw "Unexpected package cardinality." }
  if ($packages.Count -eq 1) {
    Remove-AppxPackage -Package $packages[0].PackageFullName -Confirm:$false
  }
}

function Stop-ExactPackageProcesses {
  $packages = @(Get-AppxPackage -Name $contract.package.identity -ErrorAction SilentlyContinue)
  if ($packages.Count -gt 1) { throw "Unexpected package cardinality during process cleanup." }
  if ($packages.Count -eq 0) { return }
  $expectedFamilyName = [string]$packages[0].PackageFamilyName
  if ([string]::IsNullOrWhiteSpace($expectedFamilyName)) {
    throw "Installed package has no usable package-family identity."
  }
  foreach ($process in @(Get-Process -Name "Oracle" -ErrorAction SilentlyContinue)) {
    $resolution = Resolve-OracleStage3R12TeardownProcessOwnership `
      -ProcessId ([int]$process.Id) `
      -ExpectedPackageFamilyName $expectedFamilyName
    $teardownProcessEvents.Add([ordered]@{
      recordedAtUtc = [DateTime]::UtcNow.ToString("o")
      processId = [int]$process.Id
      classification = [string]$resolution.classification
      safeToStop = [bool]$resolution.safeToStop
    })
    if (-not [bool]$resolution.safeToStop) { continue }
    try {
      Stop-Process -Id $process.Id -ErrorAction Stop
    } catch {
      if (-not (Test-OracleStage3R12ProcessExists -ProcessId $process.Id)) {
        $teardownProcessEvents.Add([ordered]@{
          recordedAtUtc = [DateTime]::UtcNow.ToString("o")
          processId = [int]$process.Id
          classification = "exited-after-ownership-verification"
          safeToStop = $false
        })
        continue
      }
      throw
    }
    $process.WaitForExit(10000)
    if (-not $process.HasExited) { throw "Governed Oracle process did not stop." }
    $teardownProcessEvents.Add([ordered]@{
      recordedAtUtc = [DateTime]::UtcNow.ToString("o")
      processId = [int]$process.Id
      classification = "stopped-governed-process"
      safeToStop = $true
    })
  }
}

function Assert-IdentityAndTransfer {
  if ([string]$contract.authority.execution -cne "founder-authorised") {
    throw "Stage 3 R12 qualification execution is not authorised."
  }
  if ($FounderAuthorityToken -cne $expectedToken) {
    throw "Separate Founder Stage 3 execution authority is required."
  }
  $attempt = [regex]::Match($AttemptId, '^stage3-r12-(\d{8}T\d{9}Z)-([0-9a-f]{8})$')
  $authority = [regex]::Match($AuthorityId, '^authority-stage3-r12-(\d{8}T\d{9}Z)-([0-9a-f]{8})$')
  $time = [DateTime]::ParseExact(
    $TimestampUtc, "yyyy-MM-ddTHH:mm:ss.fffZ",
    [Globalization.CultureInfo]::InvariantCulture,
    [Globalization.DateTimeStyles]::AssumeUniversal
  ).ToUniversalTime()
  if (
    -not $attempt.Success -or -not $authority.Success -or
    $attempt.Groups[1].Value -cne $time.ToString("yyyyMMddTHHmmssfffZ") -or
    $attempt.Groups[1].Value -cne $authority.Groups[1].Value -or
    $attempt.Groups[2].Value -cne $authority.Groups[2].Value
  ) { throw "Authority and attempt identity mismatch." }
  $expectedFounderGrantId = $AttemptId -replace (
    '^stage3-r12-', 'founder-stage3-r12-grant-'
  )
  if ($FounderGrantId -cne $expectedFounderGrantId) {
    throw "Founder grant and execution identity mismatch."
  }
  if ([Math]::Abs(([DateTime]::UtcNow - $time).TotalMinutes) -gt 5) {
    throw "Authority timestamp is outside the five-minute execution window."
  }
  if ([DateTime]::UtcNow -ge [DateTime]::Parse(
    $contract.stage2.latestExecutionStartUtc
  ).ToUniversalTime()) { throw "Certificate validity margin is unavailable." }
  foreach ($path in @(
    $manifestPath, "$manifestPath.sha256.txt", $custodyPath,
    "$custodyPath.sha256.txt", $msixPath, $discoveryPath,
    $observerPath, $identityPolicyPath, $packageInventoryPolicyPath,
    $activationPolicyPath,
    $installedSoftwarePolicyPath, $installedRuntimeConfigurationPolicyPath,
    $lifecyclePolicyPath, $preflightPolicyPath,
    $processPolicyPath, $observationPolicyPath, $windowPolicyPath,
    $windowsExecutablePolicyPath,
    $certificateTrustPolicyPath
  )) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
      throw "Required transfer file is missing: $path"
    }
  }
  $expectedTransferRootEntries = @(
    "Oracle.Stage3R12TransferCustody.json",
    "Oracle.Stage3R12TransferCustody.json.sha256.txt",
    "Oracle.Stage3R12TransferManifest.json",
    "Oracle.Stage3R12TransferManifest.json.sha256.txt",
    "payload"
  ) | Sort-Object
  $actualTransferRootEntries = @(
    Get-ChildItem -LiteralPath $TransferRoot -Force |
      ForEach-Object { $_.Name } |
      Sort-Object
  )
  if (
    $actualTransferRootEntries.Count -ne $expectedTransferRootEntries.Count -or
    @(Compare-Object -ReferenceObject $expectedTransferRootEntries `
      -DifferenceObject $actualTransferRootEntries -CaseSensitive).Count -ne 0
  ) { throw "Transfer root contains missing or unexpected entries." }
  $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
  if (
    [string]$contract.programmeIdentity -cne
      "Sprint 30.5 Stage 3 Requalification R12" -or
    [string]$contract.revision -cne "R12" -or
    [string]$manifest.contract -cne
      "oracle.sprint-30-5.stage-3-r12-transfer" -or
    [string]$manifest.programmeIdentity -cne
      [string]$contract.programmeIdentity -or
    [string]$manifest.revision -cne [string]$contract.revision -or
    $manifest.transferId -cnotmatch
      '^transfer-stage3-r12-\d{8}T\d{9}Z-[0-9a-f]{8}$' -or
    @($contract.rejectedTransfers | Where-Object {
      [string]($_ | Select-Object -ExpandProperty transferId -ErrorAction Stop) -ceq
      [string]$manifest.transferId
    }).Count -ne 0
  ) {
    throw "Transfer identity is malformed."
  }
  if (
    $ExpectedTransferManifestSha256 -cnotmatch '^[0-9a-f]{64}$' -or
    (Get-Sha256 $manifestPath) -cne $ExpectedTransferManifestSha256
  ) { throw "Founder-approved transfer manifest hash differs." }
  if (
    $ExpectedHarnessCommit -cnotmatch '^[0-9a-f]{40}$' -or
    [string]$manifest.preparation.branch -cne
      [string]$contract.requiredBranch -or
    [string]$manifest.preparation.harnessCommit -cne $ExpectedHarnessCommit -or
    [string]$manifest.preparation.harnessTree -cnotmatch '^[0-9a-f]{40}$' -or
    [string]$manifest.preparation.oeomVersion -cne "1.0" -or
    [string]$manifest.method -cne [string]$contract.transferMedium.method -or
    [string]$manifest.transferMedium.device -cne
      [string]$contract.transferMedium.device -or
    [string]$manifest.transferMedium.hardwareSerial -cne
      [string]$contract.transferMedium.hardwareSerial -or
    [string]$manifest.transferMedium.filesystem -cne
      [string]$contract.transferMedium.filesystem -or
    [string]$manifest.transferMedium.label -cne
      [string]$contract.transferMedium.label -or
    [string]$manifest.transferMedium.volumeSerial -cne
      [string]$contract.transferMedium.volumeSerial
  ) { throw "Founder-approved Stage 3 harness identity differs." }
  $sidecarValue = (
    Get-Content -LiteralPath "$manifestPath.sha256.txt" -Raw
  ).Trim().Split(" ")[0].ToLowerInvariant()
  if ($sidecarValue -cne (Get-Sha256 $manifestPath)) {
    throw "Transfer manifest sidecar does not match."
  }
  if (
    $ExpectedTransferCustodySha256 -cnotmatch '^[0-9a-f]{64}$' -or
    (Get-Sha256 $custodyPath) -cne $ExpectedTransferCustodySha256
  ) { throw "Founder-approved transfer custody hash differs." }
  $custodySidecarValue = (
    Get-Content -LiteralPath "$custodyPath.sha256.txt" -Raw
  ).Trim().Split(" ")[0].ToLowerInvariant()
  $custody = Get-Content -LiteralPath $custodyPath -Raw | ConvertFrom-Json
  if (
    $custodySidecarValue -cne (Get-Sha256 $custodyPath) -or
    [string]$custody.contract -cne
      "oracle.sprint-30-5.stage-3-r12-transfer-custody" -or
    [string]$custody.programmeIdentity -cne
      [string]$contract.programmeIdentity -or
    [string]$custody.revision -cne [string]$contract.revision -or
    [string]$custody.authority -cne
      "FOUNDER-AUTHORISED-STAGE3-R12-TRANSFER" -or
    [string]$custody.transferId -cne [string]$manifest.transferId -or
    [string]$custody.manifest.sha256 -cne (Get-Sha256 $manifestPath) -or
    [string]$custody.transferMedium.method -cne
      [string]$contract.transferMedium.method -or
    [string]$custody.transferMedium.device -cne
      [string]$contract.transferMedium.device -or
    [string]$custody.transferMedium.hardwareSerial -cne
      [string]$contract.transferMedium.hardwareSerial -or
    [string]$custody.transferMedium.filesystem -cne
      [string]$contract.transferMedium.filesystem -or
    [string]$custody.transferMedium.label -cne
      [string]$contract.transferMedium.label -or
    [string]$custody.transferMedium.volumeSerial -cne
      [string]$contract.transferMedium.volumeSerial
  ) { throw "Transfer custody evidence is missing, mismatched or unapproved." }
  if (
    $manifest.acceptedStage2.attemptId -cne $contract.stage2.attemptId -or
    $manifest.acceptedStage2.authorityId -cne $contract.stage2.authorityId -or
    $manifest.acceptedStage2.candidateCommit -cne
      $contract.stage2.candidateCommit -or
    $manifest.acceptedStage2.candidateTree -cne $contract.stage2.candidateTree -or
    $manifest.acceptedStage2.harnessCommit -cne $contract.stage2.harnessCommit -or
    $manifest.acceptedStage2.harnessTree -cne $contract.stage2.harnessTree -or
    $manifest.acceptedStage2.closureCommit -cne $contract.stage2.closureCommit -or
    $manifest.acceptedStage2.closureTree -cne $contract.stage2.closureTree -or
    $manifest.acceptedStage2.acceptedEvidenceIndexSha256 -cne
      $contract.stage2.acceptedEvidenceIndexSha256 -or
    $manifest.acceptedStage2.finalEvidenceManifestSha256 -cne
      $contract.stage2.finalEvidenceManifestSha256 -or
    $manifest.acceptedStage2.archiveSha256 -cne $contract.stage2.archiveSha256 -or
    $manifest.acceptedStage2.msixSha256 -cne $contract.stage2.msixSha256 -or
    $manifest.acceptedStage2.releaseManifestSha256 -cne
      $contract.stage2.releaseManifestSha256 -or
    $manifest.acceptedStage2.releaseManifestSignatureSha256 -cne
      $contract.stage2.releaseManifestSignatureSha256 -or
    $manifest.acceptedStage2.sbomSha256 -cne $contract.stage2.sbomSha256 -or
    $manifest.acceptedStage2.provenanceSha256 -cne
      $contract.stage2.provenanceSha256 -or
    $manifest.acceptedStage2.certificateThumbprint -cne
      $contract.stage2.certificateThumbprint -or
    (Get-Sha256 $msixPath) -cne $contract.stage2.msixSha256
  ) { throw "Transfer is not bound to accepted Stage 2 R6." }
  $expectedPayload = @(
    "Get-OracleStage3R12HostContinuity.ps1",
    "Invoke-OracleStage3R12PreAuthorityPreflight.ps1",
    "Invoke-OracleStage3R12Qualification.ps1",
    "Oracle.Sprint30.5.Stage2RequalificationR6QualificationEvidence.zip",
    "Oracle.Stage2RequalificationR6AcceptedEvidenceIndex.json",
    "Oracle.Stage2RequalificationR6EvidenceManifest.json",
    "SPRINT_30_5_STAGE_2_REQUALIFICATION_R6_CLOSURE.md",
    "Oracle.Stage3HostAdmission.json",
    "Oracle.Stage3R12Contract.json",
    "Oracle.Stage3R12ActivationPolicy.ps1",
    "Oracle.Stage3R12CertificateTrustPolicy.ps1",
    "Oracle.Stage3R12IdentityPolicy.ps1",
    "Oracle.Stage3R12InstalledSoftwarePolicy.ps1",
    "Oracle.Stage3R12InstalledRuntimeConfigurationPolicy.ps1",
    "Oracle.Stage3R12LifecyclePolicy.ps1",
    "Oracle.Stage3R12ObservationPolicy.ps1",
    "Oracle.Stage3R12OptionalMemberAudit.json",
    "Oracle.Stage3R12PreflightPolicy.ps1",
    "Oracle.Stage3R12ProcessPolicy.ps1",
    "Oracle.Stage3R12WindowPolicy.ps1",
    "Oracle.Stage3R12WindowsExecutablePolicy.ps1",
    "Oracle.Stage3R12PhaseAudit.json",
    "Oracle.Stage3R12PackageInventoryPolicy.ps1",
    "Oracle.WindowDiscovery.exe",
    "Oracle.WindowObserver.exe",
    "README.md",
    "oracle-0.1.4.cdx.json",
    "oracle-0.1.4.provenance.json",
    "oracle-release-manifest.json",
    "oracle-release-manifest.json.p7s",
    "package-content-inventory.json",
    "qualification-candidate.json",
    "runtime-configuration-build-secrecy.json",
    "signature-and-trust-verification.json",
    "Test-OracleStage3R12ActivationPolicy.ps1",
    "Test-OracleStage3R12CertificateTrustPolicy.ps1",
    "Test-OracleStage3R12InstalledRuntimeConfigurationPolicy.ps1",
    "Test-OracleStage3R12OptionalMemberAudit.ps1",
    "Test-OracleStage3R12ObservationPolicy.ps1",
    "Test-OracleStage3R12WindowPolicy.ps1",
    $contract.package.fileName
  ) | Sort-Object
  $actualPayload = @($manifest.payload | ForEach-Object {
    if (
      [string]$_.path -cnotmatch '^payload/[^/\\]+$' -or
      [string]$_.sha256 -cnotmatch '^[0-9a-f]{64}$' -or
      [int64]$_.size -lt 0
    ) { throw "Transfer payload entry is malformed or can escape." }
    [IO.Path]::GetFileName([string]$_.path)
  } | Sort-Object)
  if (
    $actualPayload.Count -ne $expectedPayload.Count -or
    @(Compare-Object $actualPayload $expectedPayload).Count -ne 0
  ) { throw "Transfer payload inventory is missing, duplicate or unexpected." }
  foreach ($entry in @($manifest.payload)) {
    $path = Join-Path $TransferRoot $entry.path
    if (
      -not (Test-Path -LiteralPath $path -PathType Leaf) -or
      (Get-Sha256 $path) -cne $entry.sha256 -or
      (Get-Item -LiteralPath $path).Length -ne $entry.size
    ) { throw "Transfer payload mismatch: $($entry.path)" }
  }
  $runningHarnessEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Invoke-OracleStage3R12Qualification.ps1"
  })
  $runningContractEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12Contract.json"
  })
  $runningActivationPolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12ActivationPolicy.ps1"
  })
  $runningCertificateTrustPolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12CertificateTrustPolicy.ps1"
  })
  $runningIdentityPolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12IdentityPolicy.ps1"
  })
  $runningPackageInventoryPolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12PackageInventoryPolicy.ps1"
  })
  $runningInstalledSoftwarePolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12InstalledSoftwarePolicy.ps1"
  })
  $runningInstalledRuntimeConfigurationPolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq
      "payload/Oracle.Stage3R12InstalledRuntimeConfigurationPolicy.ps1"
  })
  $runningLifecyclePolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12LifecyclePolicy.ps1"
  })
  $runningObservationPolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12ObservationPolicy.ps1"
  })
  $runningPreflightPolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12PreflightPolicy.ps1"
  })
  $runningProcessPolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12ProcessPolicy.ps1"
  })
  $runningWindowPolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12WindowPolicy.ps1"
  })
  $runningWindowsExecutablePolicyEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R12WindowsExecutablePolicy.ps1"
  })
  if (
    $runningHarnessEntry.Count -ne 1 -or
    $runningContractEntry.Count -ne 1 -or
    $runningActivationPolicyEntry.Count -ne 1 -or
    $runningCertificateTrustPolicyEntry.Count -ne 1 -or
    $runningIdentityPolicyEntry.Count -ne 1 -or
    $runningPackageInventoryPolicyEntry.Count -ne 1 -or
    $runningInstalledSoftwarePolicyEntry.Count -ne 1 -or
    $runningInstalledRuntimeConfigurationPolicyEntry.Count -ne 1 -or
    $runningLifecyclePolicyEntry.Count -ne 1 -or
    $runningObservationPolicyEntry.Count -ne 1 -or
    $runningPreflightPolicyEntry.Count -ne 1 -or
    $runningProcessPolicyEntry.Count -ne 1 -or
    $runningWindowPolicyEntry.Count -ne 1 -or
    $runningWindowsExecutablePolicyEntry.Count -ne 1 -or
    (Get-Sha256 $scriptPath) -cne
      [string]$runningHarnessEntry[0].sha256 -or
    (Get-Sha256 (Join-Path $scriptRoot "Oracle.Stage3R12Contract.json")) -cne
      [string]$runningContractEntry[0].sha256 -or
    (Get-Sha256 $activationPolicyPath) -cne
      [string]$runningActivationPolicyEntry[0].sha256 -or
    (Get-Sha256 $certificateTrustPolicyPath) -cne
      [string]$runningCertificateTrustPolicyEntry[0].sha256 -or
    (Get-Sha256 (
      Join-Path $scriptRoot "Oracle.Stage3R12IdentityPolicy.ps1"
    )) -cne [string]$runningIdentityPolicyEntry[0].sha256 -or
    (Get-Sha256 (
      Join-Path $scriptRoot "Oracle.Stage3R12PackageInventoryPolicy.ps1"
    )) -cne [string]$runningPackageInventoryPolicyEntry[0].sha256 -or
    (Get-Sha256 (
      Join-Path $scriptRoot "Oracle.Stage3R12InstalledSoftwarePolicy.ps1"
    )) -cne [string]$runningInstalledSoftwarePolicyEntry[0].sha256 -or
    (Get-Sha256 (Join-Path $scriptRoot "Oracle.Stage3R12InstalledRuntimeConfigurationPolicy.ps1")) -cne
      [string]$runningInstalledRuntimeConfigurationPolicyEntry[0].sha256 -or
    (Get-Sha256 (
      Join-Path $scriptRoot "Oracle.Stage3R12LifecyclePolicy.ps1"
    )) -cne [string]$runningLifecyclePolicyEntry[0].sha256 -or
    (Get-Sha256 (
      Join-Path $scriptRoot "Oracle.Stage3R12ObservationPolicy.ps1"
    )) -cne [string]$runningObservationPolicyEntry[0].sha256 -or
    (Get-Sha256 (
      Join-Path $scriptRoot "Oracle.Stage3R12PreflightPolicy.ps1"
    )) -cne [string]$runningPreflightPolicyEntry[0].sha256 -or
    (Get-Sha256 (
      Join-Path $scriptRoot "Oracle.Stage3R12ProcessPolicy.ps1"
    )) -cne [string]$runningProcessPolicyEntry[0].sha256 -or
    (Get-Sha256 (
      Join-Path $scriptRoot "Oracle.Stage3R12WindowPolicy.ps1"
    )) -cne [string]$runningWindowPolicyEntry[0].sha256 -or
    (Get-Sha256 (
      Join-Path $scriptRoot "Oracle.Stage3R12WindowsExecutablePolicy.ps1"
    )) -cne [string]$runningWindowsExecutablePolicyEntry[0].sha256
  ) {
    throw "Executing harness, contract or policy bytes differ from the transfer."
  }
  $hostAdmissionPath = Join-Path $payloadRoot $contract.host.hostAdmissionFileName
  $releaseManifestPath = Join-Path $payloadRoot "oracle-release-manifest.json"
  $releaseSignaturePath = "$releaseManifestPath.p7s"
  $sbomPath = Join-Path $payloadRoot "oracle-0.1.4.cdx.json"
  $provenancePath = Join-Path $payloadRoot "oracle-0.1.4.provenance.json"
  $signatureEvidencePath = Join-Path $payloadRoot "signature-and-trust-verification.json"
  $optionalMemberAuditPath = Join-Path $payloadRoot (
    "Oracle.Stage3R12OptionalMemberAudit.json"
  )
  $phaseAuditPath = Join-Path $payloadRoot "Oracle.Stage3R12PhaseAudit.json"
  $optionalMemberAudit = Get-Content -LiteralPath $optionalMemberAuditPath -Raw |
    ConvertFrom-Json
  $phaseAudit = Get-Content -LiteralPath $phaseAuditPath -Raw | ConvertFrom-Json
  $auditDisposition = Get-RequiredObjectMemberValue $optionalMemberAudit `
    "disposition" "Transfer-bound optional-member audit"
  $unclassifiedCount = Get-RequiredObjectMemberValue $optionalMemberAudit `
    "unclassifiedCount" "Transfer-bound optional-member audit"
  $auditedPhases = Get-RequiredObjectMemberValue $phaseAudit `
    "phases" "Transfer-bound phase audit"
  if (
    [string]$auditDisposition -cne "passed" -or
    [int]$unclassifiedCount -ne 0 -or
    @($auditedPhases).Count -ne
      @(Get-OracleStage3R12LifecyclePhases).Count
  ) { throw "Transfer-bound optional-member or phase audit differs." }
  if ((Get-Sha256 $hostAdmissionPath) -cne $contract.host.hostAdmissionSha256) {
    throw "Historical host admission binding differs."
  }
  if (
    (Get-Sha256 $releaseManifestPath) -cne
      $contract.stage2.releaseManifestSha256 -or
    (Get-Sha256 $releaseSignaturePath) -cne
      $contract.stage2.releaseManifestSignatureSha256 -or
    (Get-Sha256 $sbomPath) -cne $contract.stage2.sbomSha256 -or
    (Get-Sha256 $provenancePath) -cne $contract.stage2.provenanceSha256
  ) {
    throw "Release Manifest, signature, SBOM or provenance binding differs."
  }
  $releaseManifest = Get-Content -LiteralPath $releaseManifestPath -Raw | ConvertFrom-Json
  if (
    $releaseManifest.packageIdentity.name -cne $contract.package.identity -or
    $releaseManifest.packageIdentity.publisher -cne $contract.package.publisher -or
    $releaseManifest.packageVersion -cne $contract.package.version -or
    $releaseManifest.runtimeCompositionManifestVersion -cne
      $contract.package.runtimeManifestVersion
  ) { throw "Release Manifest identity or Runtime Manifest binding differs." }
  Add-Type -AssemblyName System.Security
  $content = [Security.Cryptography.Pkcs.ContentInfo]::new(
    [IO.File]::ReadAllBytes($releaseManifestPath)
  )
  $cms = [Security.Cryptography.Pkcs.SignedCms]::new($content, $true)
  $cms.Decode([IO.File]::ReadAllBytes($releaseSignaturePath))
  $cms.CheckSignature($true)
  if (
    $cms.SignerInfos.Count -ne 1 -or
    $cms.SignerInfos[0].Certificate.Thumbprint -cne $thumbprint -or
    $cms.SignerInfos[0].Certificate.Subject -cne $publisher -or
    $cms.SignerInfos[0].Certificate.HasPrivateKey
  ) { throw "Detached Release Manifest signature differs." }
  $sbom = Get-Content -LiteralPath $sbomPath -Raw | ConvertFrom-Json
  if ($sbom.bomFormat -cne "CycloneDX" -or $sbom.specVersion -cne "1.6") {
    throw "SBOM identity differs."
  }
  $provenance = Get-Content -LiteralPath $provenancePath -Raw | ConvertFrom-Json
  if (
    @($provenance.subject).Count -ne 1 -or
    $provenance.subject[0].digest.sha256 -cne $contract.stage2.msixSha256 -or
    $provenance.predicate.buildDefinition.internalParameters.sourceCommit -cne
      $contract.stage2.candidateCommit -or
    $provenance.predicate.buildDefinition.internalParameters.sourceTree -cne
      $contract.stage2.candidateTree
  ) { throw "Provenance candidate or package binding differs." }
  $signatureEvidence = Get-Content -LiteralPath $signatureEvidencePath -Raw |
    ConvertFrom-Json
  if (
    [string]$signatureEvidence.status -cne "passed" -or
    [string]$signatureEvidence.exactThumbprint -cne $thumbprint -or
    [string]$signatureEvidence.expectedSubject -cne $publisher -or
    $signatureEvidence.productionTrusted -ne $false -or
    $signatureEvidence.trustRemoved -ne $true -or
    $signatureEvidence.privateSigningMaterialDestroyed -ne $true -or
    [int]$signatureEvidence.packageContentEntries -lt 1
  ) { throw "Accepted R6 signature or teardown evidence differs." }
}

function Assert-PackageContent {
  $inventoryPath = Join-Path $payloadRoot "package-content-inventory.json"
  $packageInventory = Get-Content -LiteralPath $inventoryPath -Raw |
    ConvertFrom-Json
  if (
    [string]$packageInventory.contract -cne
      "oracle.sprint-30-5.stage-2-requalification-r6-package-content-inventory" -or
    [string]$packageInventory.attemptId -cne $contract.stage2.attemptId -or
    [string]$packageInventory.authorityId -cne $contract.stage2.authorityId -or
    [string]$packageInventory.candidateCommit -cne
      $contract.stage2.candidateCommit -or
    [string]$packageInventory.harnessCommit -cne
      $contract.stage2.harnessCommit -or
    [string]$packageInventory.packageSha256 -cne $contract.stage2.msixSha256
  ) { throw "Package-content inventory identity differs." }
  $expected = [Collections.Generic.Dictionary[string,object]]::new(
    [StringComparer]::Ordinal
  )
  foreach ($entry in @($packageInventory.entries)) {
    $canonicalExpectedPath =
      ConvertTo-OracleStage3R12CanonicalPackagePath ([string]$entry.path)
    if (
      $canonicalExpectedPath -cne [string]$entry.path -or
      (Test-OracleStage3R12ReservedPackageMetadata $canonicalExpectedPath) -or
      [string]$entry.sha256 -cnotmatch '^[0-9a-f]{64}$' -or
      [int64]$entry.size -lt 0 -or
      $expected.ContainsKey($canonicalExpectedPath)
    ) { throw "Package-content inventory contains an unsafe or duplicate entry." }
    $expected.Add($canonicalExpectedPath, $entry)
  }

  if ($expected.Count -ne [int]$contract.packageInventory.governedEntryCount) {
    throw "Governed package-content inventory count differs from the contract."
  }

  $zipEntries = @(Get-OracleStage3R12PackageZipInventory $msixPath)
  $actual = [Collections.Generic.Dictionary[string,object]]::new(
    [StringComparer]::Ordinal
  )
  $reserved = @($zipEntries | Where-Object {
    $_.reservedContainerMetadata -eq $true
  })
  $percentEncodedCount = @($zipEntries | Where-Object {
    $_.percentDecoded -eq $true
  }).Count
  foreach ($zipEntry in $zipEntries) {
    if ($zipEntry.reservedContainerMetadata -eq $true) { continue }
    if ($actual.ContainsKey([string]$zipEntry.path)) {
      throw "Package ZIP contains duplicate governed inventory paths."
    }
    $actual.Add([string]$zipEntry.path, $zipEntry)
    if (-not $expected.ContainsKey([string]$zipEntry.path)) {
      throw "Unexpected packaged content: $($zipEntry.path)"
    }
    $entry = $expected[[string]$zipEntry.path]
    if (
      [int64]$zipEntry.size -ne [int64]$entry.size -or
      [string]$zipEntry.sha256 -cne [string]$entry.sha256
    ) { throw "Packaged content differs: $($zipEntry.path)" }
  }
  if (
    $zipEntries.Count -ne [int]$contract.packageInventory.zipFileEntryCount -or
    $percentEncodedCount -ne
      [int]$contract.packageInventory.percentEncodedEntryCount -or
    $actual.Count -ne $expected.Count -or
    $reserved.Count -ne 1 -or
    [string]$reserved[0].path -cne
      [string]$contract.packageInventory.reservedContainerMetadata.path -or
    [string]$reserved[0].rawPath -cne
      [string]$contract.packageInventory.reservedContainerMetadata.rawZipPath -or
    [int64]$reserved[0].size -ne
      [int64]$contract.packageInventory.reservedContainerMetadata.size -or
    [string]$reserved[0].sha256 -cne
      [string]$contract.packageInventory.reservedContainerMetadata.sha256
  ) {
    throw "Package ZIP inventory or reserved container metadata differs."
  }

  [ordered]@{
    result = "passed"
    packageSha256 = Get-Sha256 $msixPath
    canonicalPathRepresentation =
      [string]$contract.packageInventory.canonicalPathRepresentation
    expectedEntries = $expected.Count
    actualEntries = $actual.Count
    zipFileEntries = $zipEntries.Count
    percentEncodedEntries = $percentEncodedCount
    reservedContainerMetadata = [ordered]@{
      path = [string]$reserved[0].path
      rawZipPath = [string]$reserved[0].rawPath
      size = [int64]$reserved[0].size
      sha256 = [string]$reserved[0].sha256
      excludedFromLogicalPayloadInventory = $true
    }
    inventorySha256 = Get-Sha256 $inventoryPath
  }
}

function Invoke-NativeObservation([string]$Label) {
  $deadline = [DateTime]::UtcNow.AddSeconds(
    [int]$contract.observation.discoveryTimeoutSeconds
  )
  $selected = $null
  while ([DateTime]::UtcNow -lt $deadline -and $null -eq $selected) {
    $name = "$Label-discovery-$([DateTime]::UtcNow.Ticks)"
    $result = Invoke-GovernedProcess $name $discoveryPath @()
    $windows = @(
      ConvertFrom-OracleStage3R12WindowDiscoveryJson -Json ([string]$result.stdout)
    )
    $candidates = @($windows | Where-Object {
      Test-OracleStage3R12QualifyingWindow $_
    })
    if ($candidates.Count -gt 1) { throw "Multiple qualifying Oracle windows." }
    if ($candidates.Count -eq 1) { $selected = $candidates[0] }
    if ($null -eq $selected) { Start-Sleep -Milliseconds 500 }
  }
  if ($null -eq $selected) { throw "No qualifying installed Oracle window." }
  $process = Get-Process -Id ([int]$selected.processId) -ErrorAction Stop
  $package = @(Get-AppxPackage -Name $contract.package.identity)
  if ($package.Count -ne 1) {
    throw "Installed package cardinality differs during native observation."
  }
  $ownership = Assert-OracleStage3R12ProcessPackageOwnership `
    -ProcessId ([int]$process.Id) `
    -ExpectedPackageFamilyName ([string]$package[0].PackageFamilyName)
  if ([string]::IsNullOrWhiteSpace([string]$process.Path)) {
    throw "Selected Oracle process path is unavailable."
  }
  $processSignature = Get-AuthenticodeSignature -LiteralPath $process.Path
  if (
    $processSignature.Status -cne "Valid" -or
    $null -eq $processSignature.SignerCertificate -or
    $processSignature.SignerCertificate.Thumbprint -cne $thumbprint -or
    $processSignature.SignerCertificate.Subject -cne $publisher
  ) { throw "Installed Oracle executable signature differs." }
  $processCommand = Get-CimInstance Win32_Process -Filter (
    "ProcessId = $($process.Id)"
  )
  if (
    $null -eq $processCommand -or
    [string]$processCommand.CommandLine -match
      '(?i)--(?:no|disable)-sandbox|--remote-debugging'
  ) { throw "Installed renderer process security flags are unsafe or unavailable." }
  $connections = @(
    Get-NetTCPConnection -ErrorAction Stop |
      Where-Object { [int]$_.OwningProcess -eq [int]$process.Id }
  )
  if (@($connections | Where-Object {
    $_.State -eq "Established" -and
    $_.RemoteAddress -notin @("127.0.0.1", "::1", "0.0.0.0", "::")
  }).Count -ne 0) {
    throw "Installed Oracle established an unexpected external connection."
  }
  $stability = Invoke-OracleStage3R12CompleteStableObservation `
    -RequiredDurationSeconds ([int]$contract.observation.stabilitySeconds) `
    -CaptureSample {
      $sampleName = "$Label-observer-$([DateTime]::UtcNow.Ticks)"
      $observed = Invoke-GovernedProcess $sampleName $observerPath @(
        "observe", [string]$selected.handle
      )
      $sample = $observed.stdout | ConvertFrom-Json
      if (
        $sample.exists -ne $true -or $sample.visible -ne $true -or
        $sample.minimized -ne $false -or $null -eq $sample.bounds -or
        [int]$sample.bounds.width -lt 1 -or [int]$sample.bounds.height -lt 1
      ) { throw "Native window observation became unstable." }
      $sample
    }
  [ordered]@{
    selectedWindow = $selected
    ownerPackageIdentity = $ownership
    ownerProcessPath = $process.Path
    ownerAuthenticodeStatus = [string]$processSignature.Status
    ownerSignerThumbprint = $processSignature.SignerCertificate.Thumbprint
    ownerCommandLine = [string]$processCommand.CommandLine
    networkConnections = $connections
    requiredDurationSeconds = [int]$contract.observation.stabilitySeconds
    measuredDurationMilliseconds = $stability.measuredDurationMilliseconds
    measuredDurationSeconds = $stability.measuredDurationSeconds
    firstValidSampleAtUtc = $stability.firstValidSampleAtUtc
    finalValidSampleAtUtc = $stability.finalValidSampleAtUtc
    completedSeconds = $stability.measuredDurationSeconds
    samples = $stability.samples
  }
}

$failure = $null
$teardownFailure = $null
try {
  Assert-IdentityAndTransfer
  if (-not (Test-Path -LiteralPath $EvidenceReturnRoot -PathType Container)) {
    throw "Founder-approved evidence return root must already exist."
  }
  if (
    [IO.Path]::GetFullPath($EvidenceReturnRoot) -ceq
      [IO.Path]::GetFullPath($TransferRoot) -or
    [IO.Path]::GetFullPath($EvidenceReturnRoot).StartsWith(
      "$([IO.Path]::GetFullPath($TransferRoot).TrimEnd('\'))\",
      [StringComparison]::OrdinalIgnoreCase
    ) -or
    [IO.Path]::GetFullPath($TransferRoot).StartsWith(
      "$([IO.Path]::GetFullPath($EvidenceReturnRoot).TrimEnd('\'))\",
      [StringComparison]::OrdinalIgnoreCase
    )
  ) { throw "Evidence return root must be isolated from the transfer root." }
  Assert-NoReparseTraversal $TransferRoot
  Assert-NoReparseTraversal $EvidenceReturnRoot
  Assert-NoReparseTraversal $HostContinuityPath
  Assert-CreateOnlyPath $attemptRoot
  Assert-CreateOnlyPath $authorityPath
  $preflight = Get-OracleStage3R12PreAuthorityObservation `
    -Contract $contract `
    -TransferRoot $TransferRoot `
    -EvidenceReturnRoot $EvidenceReturnRoot `
    -HostContinuityPath $HostContinuityPath `
    -ExpectedHostContinuitySha256 $ExpectedHostContinuitySha256 `
    -GetSha256 ${function:Get-Sha256} `
    -GetCertificateMatches ${function:Get-ExactCertificateMatches}
  $packageReconciliation = Assert-PackageContent
  $hostContinuityRecordedAt = [DateTime]::Parse(
    [string]$preflight.continuityRecordedAtUtc
  ).ToUniversalTime()
  $installedSoftware = @($preflight.installedSoftware)
  $initialSoftwareJson = $installedSoftware | ConvertTo-Json -Depth 8 -Compress

  [void](New-Item -ItemType Directory -Path $attemptRoot)
  foreach ($path in @($evidenceRoot, $lifecycleRoot, $logsRoot, $workRoot)) {
    [void](New-Item -ItemType Directory -Path $path)
  }
  Copy-CreateOnlyFile $HostContinuityPath (
    Join-Path $evidenceRoot $contract.host.continuityFileName
  )
  Write-CreateOnlyJson $authorityPath ([ordered]@{
    contract = "oracle.sprint-30-5.stage-3-r12-authority"
    programmeIdentity = [string]$contract.programmeIdentity
    revision = [string]$contract.revision
    founderGrantId = $FounderGrantId
    authorityId = $AuthorityId
    attemptId = $AttemptId
    timestampUtc = $TimestampUtc
    state = "consumed"
  })
  $authorityConsumed = $true
  Write-Lifecycle "authority-consumed" @{ transferRoot = $TransferRoot }
  Write-CreateOnlyJson (
    Join-Path $evidenceRoot "package-content-reconciliation.json"
  ) $packageReconciliation
  Write-Lifecycle "transfer-verified" @{
    manifestSha256 = Get-Sha256 $manifestPath
    packageContentReconciled = $true
  }

  Write-CreateOnlyJson (Join-Path $evidenceRoot "host-admission.json") ([ordered]@{
    result = "passed"
    deviceName = $env:COMPUTERNAME
    preAuthorityClassification = $preflight.classification
    preAuthorityObservedAtUtc = $preflight.observedAtUtc
    powershell = $preflight.powershell
    commandSurface = $preflight.commandSurface
    platformProbe = $preflight.platformProbe
    tools = $preflight.developmentTools
    manufacturer = [string]$preflight.host.manufacturer
    model = [string]$preflight.host.model
    secureBoot = $preflight.security.secureBoot
    tpmPresent = $preflight.security.tpmPresent
    tpmReady = $preflight.security.tpmReady
    defenderAntivirusEnabled = $preflight.security.defenderAntivirusEnabled
    defenderRealTimeProtectionEnabled =
      $preflight.security.defenderRealTimeProtectionEnabled
    activatedProductCount = $preflight.security.activatedProductCount
    recovery = $preflight.recovery
    installedSoftware = $installedSoftware
    historicalAdmissionSha256 = $contract.host.hostAdmissionSha256
    installationMediaEvidencePresent = $false
  })
  Write-Lifecycle "host-admitted" @{
    clean = $true
    continuitySha256 = $ExpectedHostContinuitySha256
    continuityRecordedAtUtc = $hostContinuityRecordedAt.ToString("o")
  }

  $untrustedFailure = $null
  try { Add-AppxPackage -Path $msixPath -ErrorAction Stop } catch {
    $untrustedFailure = [ordered]@{
      exceptionType = $_.Exception.GetType().FullName
      hresult = "0x$($_.Exception.HResult.ToString('X8'))"
      message = $_.Exception.Message
      fullyQualifiedErrorId = $_.FullyQualifiedErrorId
    }
  }
  $untrustedSignature = Get-AuthenticodeSignature -LiteralPath $msixPath
  if (
    $null -eq $untrustedFailure -or $untrustedSignature.Status -ceq "Valid" -or
    @(Get-AppxPackage -Name $contract.package.identity).Count -ne 0
  ) {
    throw "Untrusted package was not rejected."
  }
  Write-CreateOnlyJson (Join-Path $evidenceRoot "untrusted-rejection.json") ([ordered]@{
    result = "rejected"
    authenticodeStatus = [string]$untrustedSignature.Status
    failure = $untrustedFailure
    installedPackageCount = 0
  })
  Write-Lifecycle "untrusted-rejection-passed" @{
    untrustedPackageRejected = $true
    authenticodeStatus = [string]$untrustedSignature.Status
  }

  $certificate = Get-OracleStage3R12AcceptedPublicCertificate `
    -Contract $contract -TransferRoot $TransferRoot
  if (
    $certificate.Thumbprint -cne $thumbprint -or
    $certificate.Subject -cne $publisher -or $certificate.HasPrivateKey
  ) { throw "MSIX signer identity differs from accepted R2 evidence." }
  if (
    $certificate.NotAfter.ToUniversalTime() -ne
      [DateTime]::Parse($contract.stage2.certificateNotAfterUtc).ToUniversalTime() -or
    [DateTime]::UtcNow -lt $certificate.NotBefore.ToUniversalTime() -or
    [DateTime]::UtcNow -ge $certificate.NotAfter.ToUniversalTime()
  ) { throw "MSIX signer certificate validity differs from accepted R2 evidence." }
  $certificateRawBase64 = [Convert]::ToBase64String($certificate.RawData)
  $certificatePath = Join-Path $workRoot "attempt-public-certificate.cer"
  [IO.File]::WriteAllBytes($certificatePath, $certificate.RawData)
  $certutil = Get-OracleStage3R12WindowsExecutablePath -Name "certutil.exe"
  Assert-OracleStage3R12NoCertificateResidue `
    -PhysicalMatches @(Get-PhysicalExactCertificateMatches) `
    -LogicalViews @(Get-ExactCertificateMatches)
  [void](Invoke-GovernedProcess "exact-machine-trust-import" $certutil @(
    Get-OracleStage3R12TrustImportArguments -CertificatePath $certificatePath
  ))
  $physicalMatches = @(Get-PhysicalExactCertificateMatches)
  $logicalViews = @(Get-ExactCertificateMatches)
  Assert-OracleStage3R12TemporaryTrustState `
    -PhysicalMatches $physicalMatches -LogicalViews $logicalViews `
    -Thumbprint $thumbprint -Subject $publisher `
    -RawBase64 $certificateRawBase64
  $trustedPackageSignature = Get-AuthenticodeSignature -LiteralPath $msixPath
  if (
    $trustedPackageSignature.Status -cne "Valid" -or
    $null -eq $trustedPackageSignature.SignerCertificate -or
    $trustedPackageSignature.SignerCertificate.Thumbprint -cne $thumbprint -or
    $trustedPackageSignature.SignerCertificate.Subject -cne $publisher -or
    [Convert]::ToBase64String(
      $trustedPackageSignature.SignerCertificate.RawData
    ) -cne $certificateRawBase64 -or
    $trustedPackageSignature.SignerCertificate.HasPrivateKey
  ) {
    throw "Strict Authenticode Status Valid or exact MSIX signer identity was not achieved."
  }
  Write-Lifecycle "trust-established" @{
    thumbprint = $thumbprint
    physicalStore = "LocalMachine\TrustedPeople"
    physicalMatchCount = $physicalMatches.Count
    logicalViews = @($logicalViews | ForEach-Object {
      "$($_.Location)\$($_.Store)"
    })
  }

  $tamperedPath = Join-Path $workRoot "tampered.msix"
  [IO.File]::WriteAllBytes($tamperedPath, [IO.File]::ReadAllBytes($msixPath))
  $tamperedBytes = [IO.File]::ReadAllBytes($tamperedPath)
  $tamperedBytes[$tamperedBytes.Length - 257] = (
    $tamperedBytes[$tamperedBytes.Length - 257] -bxor 1
  )
  [IO.File]::WriteAllBytes($tamperedPath, $tamperedBytes)
  $tamperedFailure = $null
  try { Add-AppxPackage -Path $tamperedPath -ErrorAction Stop } catch {
    $tamperedFailure = [ordered]@{
      exceptionType = $_.Exception.GetType().FullName
      hresult = "0x$($_.Exception.HResult.ToString('X8'))"
      message = $_.Exception.Message
      fullyQualifiedErrorId = $_.FullyQualifiedErrorId
    }
  }
  $tamperedSignature = Get-AuthenticodeSignature -LiteralPath $tamperedPath
  [IO.File]::Delete($tamperedPath)
  if (
    $null -eq $tamperedFailure -or $tamperedSignature.Status -ceq "Valid" -or
    @(Get-AppxPackage -Name $contract.package.identity).Count -ne 0 -or
    (Get-Sha256 $msixPath) -cne $contract.stage2.msixSha256
  ) { throw "Tampered package rejection failed or accepted package changed." }
  Write-CreateOnlyJson (Join-Path $evidenceRoot "tampered-rejection.json") ([ordered]@{
    result = "rejected"
    authenticodeStatus = [string]$tamperedSignature.Status
    failure = $tamperedFailure
    installedPackageCount = 0
    acceptedPackageSha256 = Get-Sha256 $msixPath
  })
  Write-Lifecycle "negative-path-passed" @{
    tamperedPackageRejected = $true
    authenticodeStatus = [string]$tamperedSignature.Status
  }

  Add-AppxPackage -Path $msixPath
  $package = @(Get-AppxPackage -Name $contract.package.identity)
  if ($package.Count -ne 1 -or [string]$package[0].Version -cne $contract.package.version -or
    [string]$package[0].Publisher -cne $publisher) { throw "Installed package identity differs." }
  $packageFamilyName = [string]$package[0].PackageFamilyName
  $packageFullName = [string]$package[0].PackageFullName
  Write-Lifecycle "package-installed" @{ packageFullName = $packageFullName }

  $appUserModelId = "$packageFamilyName!Oracle"
  $initialRuntimeConfiguration = New-GovernedRuntimeConfiguration
  Write-CreateOnlyJson (
    Join-Path $evidenceRoot "initial-runtime-configuration-admission.json"
  ) (Get-RuntimeConfigurationEvidence $initialRuntimeConfiguration)
  $initialActivationArguments = Get-OracleInstalledRuntimeActivationArguments `
    -ConfigurationPath ([string]$initialRuntimeConfiguration.configurationPath) `
    -Sha256 ([string]$initialRuntimeConfiguration.sha256)
  $initialActivation = Invoke-OracleStage3R12ApplicationActivation `
    -AppUserModelId $appUserModelId `
    -Arguments $initialActivationArguments
  Write-CreateOnlyJson (
    Join-Path $evidenceRoot "initial-activation.json"
  ) $initialActivation
  Assert-OracleStage3R12ApplicationActivationSucceeded -Result $initialActivation
  $initial = Invoke-NativeObservation "initial"
  Write-CreateOnlyJson (Join-Path $evidenceRoot "runtime-observation.json") $initial
  $initialRuntimeTeardown =
    Assert-RuntimeConfigurationConsumedAndRemoveNamespace `
      -Record $initialRuntimeConfiguration
  Write-CreateOnlyJson (
    Join-Path $evidenceRoot "initial-runtime-configuration-consumption.json"
  ) ([ordered]@{
    configurationId = [string]$initialRuntimeConfiguration.configurationId
    sha256 = [string]$initialRuntimeConfiguration.sha256
    consumedFileRemaining = 0
    namespaceRemaining = [int]$initialRuntimeTeardown.remaining
    secretValuesRecorded = $false
  })
  Write-Lifecycle "runtime-observed" @{
    activationApi = $initialActivation.api
    activationHresult = $initialActivation.hresult
    activationProcessId = $initialActivation.processId
    handle = $initial.selectedWindow.handle
  }

  Stop-ExactPackageProcesses
  Reset-AppxPackage -Package $packageFullName
  $postResetPackageData = Initialize-OracleInstalledRuntimePackageData `
    -PackageIdentity ([string]$contract.package.identity) `
    -PackageFamilyName $packageFamilyName `
    -ExpectedPackageFamilyName $packageFamilyName `
    -PackageFullName $packageFullName `
    -ExpectedPackageFullName $packageFullName `
    -LocalAppDataRoot $env:LOCALAPPDATA
  Write-CreateOnlyJson (
    Join-Path $evidenceRoot "post-reset-package-data-initialization.json"
  ) $postResetPackageData
  $repairRuntimeConfiguration = New-GovernedRuntimeConfiguration
  Write-CreateOnlyJson (
    Join-Path $evidenceRoot "repair-runtime-configuration-admission.json"
  ) (Get-RuntimeConfigurationEvidence $repairRuntimeConfiguration)
  $repairActivationArguments = Get-OracleInstalledRuntimeActivationArguments `
    -ConfigurationPath ([string]$repairRuntimeConfiguration.configurationPath) `
    -Sha256 ([string]$repairRuntimeConfiguration.sha256)
  $repairActivation = Invoke-OracleStage3R12ApplicationActivation `
    -AppUserModelId $appUserModelId `
    -Arguments $repairActivationArguments
  Write-CreateOnlyJson (
    Join-Path $evidenceRoot "repair-activation.json"
  ) $repairActivation
  Assert-OracleStage3R12ApplicationActivationSucceeded -Result $repairActivation
  $repair = Invoke-NativeObservation "repair"
  Write-CreateOnlyJson (Join-Path $evidenceRoot "repair-observation.json") $repair
  $repairRuntimeTeardown =
    Assert-RuntimeConfigurationConsumedAndRemoveNamespace `
      -Record $repairRuntimeConfiguration
  Write-CreateOnlyJson (
    Join-Path $evidenceRoot "repair-runtime-configuration-consumption.json"
  ) ([ordered]@{
    configurationId = [string]$repairRuntimeConfiguration.configurationId
    sha256 = [string]$repairRuntimeConfiguration.sha256
    consumedFileRemaining = 0
    namespaceRemaining = [int]$repairRuntimeTeardown.remaining
    secretValuesRecorded = $false
  })
  Write-Lifecycle "repair-observed" @{
    activationApi = $repairActivation.api
    activationHresult = $repairActivation.hresult
    activationProcessId = $repairActivation.processId
    handle = $repair.selectedWindow.handle
  }

  Stop-ExactPackageProcesses
  Remove-ExactPackage
  if (@(Get-AppxPackage -Name $contract.package.identity).Count -ne 0) {
    throw "Package residue remains."
  }
  Write-Lifecycle "package-removed" @{ remaining = 0 }
  Remove-ExactMachineTrust
  Write-Lifecycle "trust-removed" @{
    remainingPhysical = @(Get-PhysicalExactCertificateMatches).Count
    remainingLogical = @(Get-ExactCertificateMatches).Count
  }
  Assert-OracleStage3R12NoCertificateResidue `
    -PhysicalMatches @(Get-PhysicalExactCertificateMatches) `
    -LogicalViews @(Get-ExactCertificateMatches)
  if (@(Get-Process -Name "Oracle" -ErrorAction SilentlyContinue).Count -ne 0) {
    throw "Oracle process residue remains."
  }
  $packageDataPath = Join-Path $env:LOCALAPPDATA "Packages\$packageFamilyName"
  if (Test-Path -LiteralPath $packageDataPath) {
    throw "Oracle package application-data residue remains."
  }
  $finalSoftware = @(Get-InstalledSoftwareInventory)
  if (($finalSoftware | ConvertTo-Json -Depth 8 -Compress) -cne $initialSoftwareJson) {
    throw "Installed-software inventory changed during qualification."
  }
  $transferResolved = [IO.Path]::GetFullPath($TransferRoot)
  if (
    ((Get-Item -LiteralPath $transferResolved -Force).Attributes -band
      [IO.FileAttributes]::ReparsePoint) -ne 0
  ) { throw "Transfer root became a reparse point." }
  Remove-Item -LiteralPath $transferResolved -Recurse
  if (Test-Path -LiteralPath $transferResolved) { throw "Transfer residue remains." }
  Write-Lifecycle "transfer-removed" @{ transferRootRemoved = $true }
  if (
    ((Get-Item -LiteralPath $workRoot -Force).Attributes -band
      [IO.FileAttributes]::ReparsePoint) -ne 0
  ) { throw "Attempt work root became a reparse point." }
  Remove-Item -LiteralPath $workRoot -Recurse
  if (Test-Path -LiteralPath $workRoot) { throw "Attempt work residue remains." }
  Write-Lifecycle "cleanup-passed" @{
    package = 0
    certificate = 0
    process = 0
    packageData = 0
    transfer = 0
    work = 0
    installedSoftwareUnchanged = $true
    processTeardownEvents = @($teardownProcessEvents)
  }
  $inventory = @(Get-ChildItem -LiteralPath $attemptRoot -Recurse -File |
    Sort-Object FullName |
    ForEach-Object {
      [ordered]@{
        path = $_.FullName.Substring($attemptRoot.Length + 1).Replace("\", "/")
        size = $_.Length
        sha256 = Get-Sha256 $_.FullName
      }
    })
  $evidenceManifestPath = Join-Path $evidenceRoot "evidence-manifest.json"
  Write-CreateOnlyJson $evidenceManifestPath ([ordered]@{
    contract = "oracle.sprint-30-5.stage-3-r12-evidence-manifest"
    programmeIdentity = [string]$contract.programmeIdentity
    revision = [string]$contract.revision
    founderGrantId = $FounderGrantId
    authorityId = $AuthorityId
    attemptId = $AttemptId
    scope = "all attempt files created before evidence freeze"
    excludedFinalFiles = @(
      "evidence/evidence-manifest.json",
      "evidence/evidence-manifest.json.sha256.txt",
      "evidence/completion.json",
      "lifecycle/14-evidence-frozen.json"
    )
    files = $inventory
  })
  $evidenceManifestHash = Get-Sha256 $evidenceManifestPath
  Write-CreateOnlyText "$evidenceManifestPath.sha256.txt" (
    "$evidenceManifestHash  evidence-manifest.json`n"
  )
  Write-Lifecycle "evidence-frozen" @{
    result = "passed"
    inventoryCount = $inventory.Count
    evidenceManifestSha256 = $evidenceManifestHash
  }
  Write-CreateOnlyJson (Join-Path $evidenceRoot "completion.json") ([ordered]@{
    programmeIdentity = [string]$contract.programmeIdentity
    revision = [string]$contract.revision
    result = "passed"
    founderGrantId = $FounderGrantId
    authorityId = $AuthorityId
    attemptId = $AttemptId
    evidenceManifestSha256 = $evidenceManifestHash
    stage4Started = $false
  })
  $archivePath = Join-Path $EvidenceReturnRoot "$AttemptId.zip"
  Assert-CreateOnlyPath $archivePath
  $partialArchive = Join-Path $EvidenceReturnRoot "$AttemptId.partial-$PID.zip"
  Assert-CreateOnlyPath $partialArchive
  Compress-Archive -LiteralPath $attemptRoot -DestinationPath $partialArchive
  [IO.File]::Move($partialArchive, $archivePath)
  $archiveHash = Get-Sha256 $archivePath
  Write-CreateOnlyText "$archivePath.sha256.txt" (
    "$archiveHash  $([IO.Path]::GetFileName($archivePath))`n"
  )
  Write-CreateOnlyJson "$archivePath.manifest.json" ([ordered]@{
    contract = "oracle.sprint-30-5.stage-3-r12-archive-manifest"
    programmeIdentity = [string]$contract.programmeIdentity
    revision = [string]$contract.revision
    founderGrantId = $FounderGrantId
    authorityId = $AuthorityId
    attemptId = $AttemptId
    archive = [IO.Path]::GetFileName($archivePath)
    size = (Get-Item -LiteralPath $archivePath).Length
    sha256 = $archiveHash
    evidenceManifestSha256 = $evidenceManifestHash
  })
} catch {
  $originalError = $_
  $failure = $originalError.Exception.Message
  $teardownFailures = [Collections.Generic.List[string]]::new()
  if ($authorityConsumed) {
    foreach ($operation in @(
      @{ name = "stop-exact-package-processes"; action = {
        Stop-ExactPackageProcesses
      }},
      @{ name = "remove-runtime-configurations"; action = {
        Remove-RuntimeConfigurationForTeardown $repairRuntimeConfiguration
        Remove-RuntimeConfigurationForTeardown $initialRuntimeConfiguration
      }},
      @{ name = "remove-exact-package"; action = {
        Remove-ExactPackage
      }},
      @{ name = "remove-exact-machine-trust"; action = {
        Remove-ExactMachineTrust
      }},
      @{ name = "verify-zero-package-residue"; action = {
        if (@(Get-AppxPackage -Name $contract.package.identity).Count -ne 0) {
          throw "Package residue remains after failure teardown."
        }
      }},
      @{ name = "verify-zero-certificate-residue"; action = {
        Assert-OracleStage3R12NoCertificateResidue `
          -PhysicalMatches @(Get-PhysicalExactCertificateMatches) `
          -LogicalViews @(Get-ExactCertificateMatches)
      }},
      @{ name = "verify-zero-process-residue"; action = {
        if (@(Get-Process -Name "Oracle" -ErrorAction SilentlyContinue).Count -ne 0) {
          throw "Oracle process residue remains after failure teardown."
        }
      }}
    )) {
      try {
        & $operation.action
      } catch {
        $teardownFailures.Add(
          "$($operation.name): $($_.Exception.Message)"
        )
      }
    }
  }
  $teardownFailure = if ($teardownFailures.Count -eq 0) {
    $null
  } else {
    @($teardownFailures)
  }
  if ($null -ne $partialArchive -and (Test-Path -LiteralPath $partialArchive)) {
    Remove-Item -LiteralPath $partialArchive -ErrorAction SilentlyContinue
  }
  if (Test-Path -LiteralPath $attemptRoot) {
    try {
      Write-CreateOnlyJson (Join-Path $evidenceRoot "failure.json") ([ordered]@{
        programmeIdentity = [string]$contract.programmeIdentity
        revision = [string]$contract.revision
        result = "failed"
        authorityConsumed = $authorityConsumed
        completedLifecyclePhases = @($lifecycleState.completed)
        failure = $failure
        teardownFailure = $teardownFailure
        teardownProcessEvents = @($teardownProcessEvents)
        recordedAtUtc = [DateTime]::UtcNow.ToString("o")
      })
    } catch {
      throw (
        "Original qualification failure: $failure; failure-record publication " +
        "also failed: $($_.Exception.Message)"
      )
    }
  }
  if ($teardownFailures.Count -ne 0) {
    throw (
      "Original qualification failure: $failure; governed teardown also failed: " +
      (@($teardownFailures) -join "; ")
    )
  }
  throw $originalError
}
