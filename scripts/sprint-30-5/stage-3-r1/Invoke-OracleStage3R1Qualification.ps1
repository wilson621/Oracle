[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$FounderAuthorityToken,
  [Parameter(Mandatory = $true)][string]$AuthorityId,
  [Parameter(Mandatory = $true)][string]$AttemptId,
  [Parameter(Mandatory = $true)][string]$TimestampUtc,
  [Parameter(Mandatory = $true)][string]$ExpectedTransferManifestSha256,
  [Parameter(Mandatory = $true)][string]$ExpectedHarnessCommit,
  [Parameter(Mandatory = $true)][string]$HostContinuityPath,
  [Parameter(Mandatory = $true)][string]$ExpectedHostContinuitySha256,
  [Parameter(Mandatory = $true)][string]$TransferRoot,
  [Parameter(Mandatory = $true)][string]$EvidenceReturnRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ConfirmPreference = "None"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$contract = Get-Content -LiteralPath (
  Join-Path $scriptRoot "Oracle.Stage3R1Contract.json"
) -Raw | ConvertFrom-Json
$expectedToken = "FOUNDER-AUTHORISED-STAGE3-R1-EXECUTION"
$thumbprint = [string]$contract.stage2.certificateThumbprint
$publisher = [string]$contract.package.publisher
$attemptRoot = Join-Path $EvidenceReturnRoot $AttemptId
$authorityPath = Join-Path $EvidenceReturnRoot "authorities\$AuthorityId.json"
$evidenceRoot = Join-Path $attemptRoot "evidence"
$lifecycleRoot = Join-Path $attemptRoot "lifecycle"
$logsRoot = Join-Path $attemptRoot "logs"
$workRoot = Join-Path $attemptRoot "work"
$manifestPath = Join-Path $TransferRoot "Oracle.Stage3R1TransferManifest.json"
$payloadRoot = Join-Path $TransferRoot "payload"
$msixPath = Join-Path $payloadRoot $contract.package.fileName
$discoveryPath = Join-Path $payloadRoot "Oracle.WindowDiscovery.exe"
$observerPath = Join-Path $payloadRoot "Oracle.WindowObserver.exe"
$certificateRawBase64 = $null
$packageFamilyName = $null
$partialArchive = $null
$initialSoftwareJson = $null
$phaseIndex = 0
$processEvidenceCounts = @{}
$phases = @(
  "authority-consumed", "transfer-verified", "host-admitted",
  "untrusted-rejection-passed", "trust-established", "negative-path-passed", "package-installed",
  "runtime-observed", "repair-observed", "package-removed",
  "trust-removed", "transfer-removed", "cleanup-passed", "evidence-frozen"
)
$stores = @(
  @("CurrentUser", "My"), @("CurrentUser", "Root"),
  @("CurrentUser", "TrustedPeople"), @("LocalMachine", "My"),
  @("LocalMachine", "Root"), @("LocalMachine", "TrustedPeople")
)

function Get-Sha256([string]$Path) {
  (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-InstalledSoftwareInventory {
  @(
    Get-ItemProperty -Path @(
      "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
      "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
      "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*"
    ) -ErrorAction SilentlyContinue |
      Where-Object { -not [string]::IsNullOrWhiteSpace($_.DisplayName) } |
      Select-Object DisplayName, DisplayVersion, Publisher |
      Sort-Object DisplayName, DisplayVersion, Publisher
  )
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
  if ($phaseIndex -ge $phases.Count -or $phases[$phaseIndex] -cne $Phase) {
    throw "Lifecycle phase is skipped, repeated or out of order: $Phase"
  }
  Write-CreateOnlyJson (
    Join-Path $lifecycleRoot ("{0:D2}-{1}.json" -f ($phaseIndex + 1), $Phase)
  ) ([ordered]@{
    contract = "oracle.sprint-30-5.stage-3-r1-lifecycle"
    authorityId = $AuthorityId
    attemptId = $AttemptId
    phase = $Phase
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    details = $Details
  })
  $script:phaseIndex++
}

function Invoke-GovernedProcess(
  [string]$Name,
  [string]$Executable,
  [string[]]$Arguments,
  [bool]$RequireZero = $true
) {
  if (-not (Test-Path -LiteralPath $Executable -PathType Leaf)) {
    throw "Executable is unavailable: $Executable"
  }
  if (@($Arguments | Where-Object {
    $_.Contains('"') -or $_.EndsWith("\")
  }).Count -ne 0) {
    throw "Process argument contains an unsafe quote or trailing separator."
  }
  $info = [Diagnostics.ProcessStartInfo]::new()
  $info.FileName = $Executable
  $info.Arguments = (($Arguments | ForEach-Object { '"' + $_ + '"' }) -join " ")
  $info.UseShellExecute = $false
  $info.CreateNoWindow = $true
  $info.RedirectStandardOutput = $true
  $info.RedirectStandardError = $true
  $started = [DateTime]::UtcNow
  $exitCode = $null
  $processError = $null
  $stdout = ""
  $stderr = ""
  $process = [Diagnostics.Process]::new()
  $process.StartInfo = $info
  try {
    if (-not $process.Start()) { throw "Process did not start." }
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    $process.WaitForExit()
    $stdout = $stdoutTask.GetAwaiter().GetResult()
    $stderr = $stderrTask.GetAwaiter().GetResult()
    $exitCode = $process.ExitCode
  } catch {
    $processError = $_.Exception.Message
  } finally {
    $completed = [DateTime]::UtcNow
    $process.Dispose()
  }
  $record = [ordered]@{
    executable = $Executable
    arguments = $Arguments
    startedAtUtc = $started.ToString("o")
    completedAtUtc = $completed.ToString("o")
    stdout = $stdout
    stderr = $stderr
    exitCode = $exitCode
    signal = $null
    processError = $processError
  }
  $count = 1
  if ($processEvidenceCounts.ContainsKey($Name)) {
    $count = [int]$processEvidenceCounts[$Name] + 1
  }
  $processEvidenceCounts[$Name] = $count
  $evidenceName = if ($count -eq 1) { $Name } else {
    "$Name-$('{0:D2}' -f $count)"
  }
  Write-CreateOnlyJson (Join-Path $logsRoot "$evidenceName.json") $record
  if (
    $null -ne $processError -or $null -eq $exitCode -or
    ($RequireZero -and $exitCode -ne 0)
  ) {
    throw "Governed process failed: $Name"
  }
  $record
}

function Get-ExactCertificateMatches {
  $matches = @()
  foreach ($store in $stores) {
    $certificate = Get-Item -LiteralPath (
      "Cert:\$($store[0])\$($store[1])\$thumbprint"
    ) -ErrorAction SilentlyContinue
    if ($null -ne $certificate) {
      $matches += [pscustomobject]@{
        Location = $store[0]
        Store = $store[1]
        Certificate = $certificate
      }
    }
  }
  @($matches)
}

function Assert-CertificateIdentity($Certificate, [bool]$PrivateKey) {
  if (
    $Certificate.Thumbprint -cne $thumbprint -or
    $Certificate.Subject -cne $publisher -or
    [Convert]::ToBase64String($Certificate.RawData) -cne $certificateRawBase64 -or
    [bool]$Certificate.HasPrivateKey -ne $PrivateKey
  ) {
    throw "Certificate identity, bytes, store lifecycle or private-key state differs."
  }
}

function Remove-ExactRootTrust {
  $rootMatches = @(Get-ExactCertificateMatches | Where-Object {
    $_.Location -ceq "CurrentUser" -and $_.Store -ceq "Root"
  })
  if ($rootMatches.Count -eq 0) { return }
  if ($rootMatches.Count -ne 1) { throw "Unexpected Root match cardinality." }
  Assert-CertificateIdentity $rootMatches[0].Certificate $false
  $certutil = Join-Path ([Environment]::SystemDirectory) "certutil.exe"
  [void](Invoke-GovernedProcess "exact-root-remove" $certutil @(
    "-user", "-delstore", "Root", $thumbprint
  ))
  if (@(Get-ExactCertificateMatches | Where-Object {
    $_.Location -ceq "CurrentUser" -and $_.Store -ceq "Root"
  }).Count -ne 0) { throw "Exact Root trust remains." }
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
  foreach ($process in @(Get-Process -Name "Oracle" -ErrorAction SilentlyContinue)) {
    if (
      $null -eq $process.Path -or
      -not $process.Path.StartsWith(
        $packages[0].InstallLocation,
        [StringComparison]::OrdinalIgnoreCase
      )
    ) { throw "Oracle-named process is not owned by the governed package." }
    Stop-Process -Id $process.Id -ErrorAction Stop
    $process.WaitForExit(10000)
    if (-not $process.HasExited) { throw "Governed Oracle process did not stop." }
  }
}

function Assert-IdentityAndTransfer {
  if ($FounderAuthorityToken -cne $expectedToken) {
    throw "Separate Founder Stage 3 execution authority is required."
  }
  $attempt = [regex]::Match($AttemptId, '^stage3-r1-(\d{8}T\d{9}Z)-([0-9a-f]{8})$')
  $authority = [regex]::Match($AuthorityId, '^authority-stage3-r1-(\d{8}T\d{9}Z)-([0-9a-f]{8})$')
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
  if ([Math]::Abs(([DateTime]::UtcNow - $time).TotalMinutes) -gt 5) {
    throw "Authority timestamp is outside the five-minute execution window."
  }
  if ([DateTime]::UtcNow -ge [DateTime]::Parse(
    $contract.stage2.latestExecutionStartUtc
  ).ToUniversalTime()) { throw "Certificate validity margin is unavailable." }
  foreach ($path in @($manifestPath, "$manifestPath.sha256.txt", $msixPath, $discoveryPath, $observerPath)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
      throw "Required transfer file is missing: $path"
    }
  }
  $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
  if ($manifest.transferId -cnotmatch '^transfer-stage3-r1-\d{8}T\d{9}Z-[0-9a-f]{8}$') {
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
    [string]$manifest.preparation.oeomVersion -cne "1.0"
  ) { throw "Founder-approved Stage 3 harness identity differs." }
  $sidecarValue = (
    Get-Content -LiteralPath "$manifestPath.sha256.txt" -Raw
  ).Trim().Split(" ")[0].ToLowerInvariant()
  if ($sidecarValue -cne (Get-Sha256 $manifestPath)) {
    throw "Transfer manifest sidecar does not match."
  }
  if (
    $manifest.acceptedStage2.attemptId -cne $contract.stage2.attemptId -or
    $manifest.acceptedStage2.authorityId -cne $contract.stage2.authorityId -or
    $manifest.acceptedStage2.candidateCommit -cne
      $contract.stage2.candidateCommit -or
    $manifest.acceptedStage2.candidateTree -cne $contract.stage2.candidateTree -or
    $manifest.acceptedStage2.finalEvidenceManifestSha256 -cne
      $contract.stage2.finalEvidenceManifestSha256 -or
    $manifest.acceptedStage2.archiveSha256 -cne $contract.stage2.archiveSha256 -or
    $manifest.acceptedStage2.msixSha256 -cne $contract.stage2.msixSha256 -or
    $manifest.acceptedStage2.releaseManifestSha256 -cne
      $contract.stage2.releaseManifestSha256 -or
    $manifest.acceptedStage2.certificateThumbprint -cne
      $contract.stage2.certificateThumbprint -or
    (Get-Sha256 $msixPath) -cne $contract.stage2.msixSha256
  ) { throw "Transfer is not bound to accepted Stage 2 R2." }
  $expectedPayload = @(
    "Get-OracleStage3R1HostContinuity.ps1",
    "Invoke-OracleStage3R1Qualification.ps1",
    "Oracle.Sprint30.5.Stage2RequalificationR2QualificationEvidence.zip",
    "Oracle.Stage2RequalificationR2EvidenceManifest.json",
    "Oracle.Stage3HostAdmission.json",
    "Oracle.Stage3R1Contract.json",
    "Oracle.WindowDiscovery.exe",
    "Oracle.WindowObserver.exe",
    "README.md",
    "oracle-0.1.1.cdx.json",
    "oracle-0.1.1.provenance.json",
    "oracle-release-manifest.json",
    "oracle-release-manifest.json.p7s",
    "package-content-inventory.json",
    "qualification-candidate.json",
    "signature-and-trust-verification.json",
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
    [string]$_.path -ceq "payload/Invoke-OracleStage3R1Qualification.ps1"
  })
  $runningContractEntry = @($manifest.payload | Where-Object {
    [string]$_.path -ceq "payload/Oracle.Stage3R1Contract.json"
  })
  if (
    $runningHarnessEntry.Count -ne 1 -or
    $runningContractEntry.Count -ne 1 -or
    (Get-Sha256 $MyInvocation.MyCommand.Path) -cne
      [string]$runningHarnessEntry[0].sha256 -or
    (Get-Sha256 (Join-Path $scriptRoot "Oracle.Stage3R1Contract.json")) -cne
      [string]$runningContractEntry[0].sha256
  ) { throw "Executing harness or contract bytes differ from the transfer." }
  $hostAdmissionPath = Join-Path $payloadRoot $contract.host.hostAdmissionFileName
  $releaseManifestPath = Join-Path $payloadRoot "oracle-release-manifest.json"
  $releaseSignaturePath = "$releaseManifestPath.p7s"
  $sbomPath = Join-Path $payloadRoot "oracle-0.1.1.cdx.json"
  $provenancePath = Join-Path $payloadRoot "oracle-0.1.1.provenance.json"
  $signatureEvidencePath = Join-Path $payloadRoot "signature-and-trust-verification.json"
  if ((Get-Sha256 $hostAdmissionPath) -cne $contract.host.hostAdmissionSha256) {
    throw "Historical host admission binding differs."
  }
  if ((Get-Sha256 $releaseManifestPath) -cne $contract.stage2.releaseManifestSha256) {
    throw "Release Manifest binding differs."
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
  ) { throw "Accepted R2 signature or teardown evidence differs." }
}

function Assert-PackageContent {
  $inventoryPath = Join-Path $payloadRoot "package-content-inventory.json"
  $packageInventory = Get-Content -LiteralPath $inventoryPath -Raw |
    ConvertFrom-Json
  if (
    [string]$packageInventory.contract -cne
      "oracle.sprint-30-5.stage-2-requalification-r2-package-content-inventory" -or
    [string]$packageInventory.attemptId -cne $contract.stage2.attemptId -or
    [string]$packageInventory.authorityId -cne $contract.stage2.authorityId -or
    [string]$packageInventory.candidateCommit -cne
      $contract.stage2.candidateCommit -or
    [string]$packageInventory.harnessCommit -cne
      $contract.stage2.candidateCommit -or
    [string]$packageInventory.packageSha256 -cne $contract.stage2.msixSha256
  ) { throw "Package-content inventory identity differs." }
  $expected = [Collections.Generic.Dictionary[string,object]]::new(
    [StringComparer]::Ordinal
  )
  foreach ($entry in @($packageInventory.entries)) {
    if (
      [string]$entry.path -match '(^|/)\.\.?(/|$)' -or
      [string]$entry.path -match '\\' -or
      [string]$entry.sha256 -cnotmatch '^[0-9a-f]{64}$' -or
      [int64]$entry.size -lt 0 -or
      $expected.ContainsKey([string]$entry.path)
    ) { throw "Package-content inventory contains an unsafe or duplicate entry." }
    $expected.Add([string]$entry.path, $entry)
  }
  $packageZip = Join-Path $workRoot "accepted-package.zip"
  $unpackedRoot = Join-Path $workRoot "package-content"
  Copy-CreateOnlyFile $msixPath $packageZip
  Assert-CreateOnlyPath $unpackedRoot
  Expand-Archive -LiteralPath $packageZip -DestinationPath $unpackedRoot
  $actual = @(
    Get-ChildItem -LiteralPath $unpackedRoot -File -Recurse |
      Sort-Object FullName
  )
  if ($actual.Count -ne $expected.Count) {
    throw "Unpacked package-content count differs."
  }
  foreach ($file in $actual) {
    Assert-NoReparseTraversal $file.FullName
    $relativePath = $file.FullName.Substring($unpackedRoot.Length + 1).Replace(
      "\", "/"
    )
    if (-not $expected.ContainsKey($relativePath)) {
      throw "Unexpected packaged content: $relativePath"
    }
    $entry = $expected[$relativePath]
    if (
      $file.Length -ne [int64]$entry.size -or
      (Get-Sha256 $file.FullName) -cne [string]$entry.sha256
    ) { throw "Packaged content differs: $relativePath" }
  }
  Write-CreateOnlyJson (Join-Path $evidenceRoot "package-content-reconciliation.json") (
    [ordered]@{
      result = "passed"
      packageSha256 = Get-Sha256 $msixPath
      expectedEntries = $expected.Count
      actualEntries = $actual.Count
      inventorySha256 = Get-Sha256 $inventoryPath
    }
  )
}

function Invoke-NativeObservation([string]$Label) {
  $deadline = [DateTime]::UtcNow.AddSeconds(
    [int]$contract.observation.discoveryTimeoutSeconds
  )
  $selected = $null
  while ([DateTime]::UtcNow -lt $deadline -and $null -eq $selected) {
    $name = "$Label-discovery-$([DateTime]::UtcNow.Ticks)"
    $result = Invoke-GovernedProcess $name $discoveryPath @()
    $windows = @($result.stdout | ConvertFrom-Json)
    $candidates = @($windows | Where-Object {
      $_.processName -ceq "Oracle" -and $_.visible -eq $true -and
      $_.minimized -eq $false -and [int64]$_.handle -gt 0 -and
      [int]$_.width -ge 1 -and [int]$_.height -ge 1
    })
    if ($candidates.Count -gt 1) { throw "Multiple qualifying Oracle windows." }
    if ($candidates.Count -eq 1) { $selected = $candidates[0] }
    if ($null -eq $selected) { Start-Sleep -Milliseconds 500 }
  }
  if ($null -eq $selected) { throw "No qualifying installed Oracle window." }
  $process = Get-Process -Id ([int]$selected.processId) -ErrorAction Stop
  $package = @(Get-AppxPackage -Name $contract.package.identity)
  if (
    $package.Count -ne 1 -or
    -not $process.Path.StartsWith(
      $package[0].InstallLocation,
      [StringComparison]::OrdinalIgnoreCase
    )
  ) { throw "Selected window is not owned by the installed Oracle package." }
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
    Get-NetTCPConnection -OwningProcess $process.Id -ErrorAction SilentlyContinue
  )
  if (@($connections | Where-Object {
    $_.State -eq "Established" -and
    $_.RemoteAddress -notin @("127.0.0.1", "::1", "0.0.0.0", "::")
  }).Count -ne 0) {
    throw "Installed Oracle established an unexpected external connection."
  }
  $samples = @()
  $stableUntil = [DateTime]::UtcNow.AddSeconds(
    [int]$contract.observation.stabilitySeconds
  )
  while ([DateTime]::UtcNow -lt $stableUntil) {
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
    $samples += [ordered]@{
      recordedAtUtc = [DateTime]::UtcNow.ToString("o")
      value = $sample
    }
    Start-Sleep -Seconds 1
  }
  if ($samples.Count -lt [int]$contract.observation.stabilitySeconds) {
    throw "Native window stability duration was incomplete."
  }
  [ordered]@{
    selectedWindow = $selected
    ownerProcessPath = $process.Path
    ownerAuthenticodeStatus = [string]$processSignature.Status
    ownerSignerThumbprint = $processSignature.SignerCertificate.Thumbprint
    ownerCommandLine = [string]$processCommand.CommandLine
    networkConnections = $connections
    completedSeconds = [int]$contract.observation.stabilitySeconds
    samples = $samples
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
  if ($env:COMPUTERNAME -cne [string]$contract.host.deviceName) {
    throw "Host identity differs from Founder-QA-01."
  }
  $computerSystem = Get-CimInstance Win32_ComputerSystem
  if (
    [string]$computerSystem.Manufacturer -cne [string]$contract.host.manufacturer -or
    [string]$computerSystem.Model -cne [string]$contract.host.model
  ) { throw "Host manufacturer or model differs from admitted identity." }
  if (@(Get-AppxPackage -Name $contract.package.identity -ErrorAction SilentlyContinue).Count -ne 0) {
    throw "Governed Oracle package is already installed."
  }
  if (@(Get-ExactCertificateMatches).Count -ne 0) {
    throw "Governed Stage 2 R2 certificate is already present."
  }
  if (
    -not (Test-Path -LiteralPath $HostContinuityPath -PathType Leaf) -or
    $ExpectedHostContinuitySha256 -cnotmatch '^[0-9a-f]{64}$' -or
    (Get-Sha256 $HostContinuityPath) -cne $ExpectedHostContinuitySha256
  ) { throw "Founder-approved host-continuity evidence is missing or differs." }
  $hostContinuity = Get-Content -LiteralPath $HostContinuityPath -Raw |
    ConvertFrom-Json
  $hostContinuityRecordedAt = [DateTime]::Parse(
    [string]$hostContinuity.recordedAtUtc
  ).ToUniversalTime()
  if (
    [string]$hostContinuity.contract -cne
      "oracle.sprint-30-5.stage-3-r1-host-continuity" -or
    [string]$hostContinuity.programmeIdentity -cne
      [string]$contract.programmeIdentity -or
    [string]$hostContinuity.result -cne "passed" -or
    @($hostContinuity.issues).Count -ne 0 -or
    [string]$hostContinuity.host.deviceName -cne
      [string]$contract.host.deviceName -or
    [string]$hostContinuity.host.manufacturer -cne
      [string]$contract.host.manufacturer -or
    [string]$hostContinuity.host.model -cne [string]$contract.host.model -or
    [string]$hostContinuity.historicalAdmissionSha256 -cne
      [string]$contract.host.hostAdmissionSha256 -or
    $hostContinuityRecordedAt -gt [DateTime]::UtcNow -or
    ([DateTime]::UtcNow - $hostContinuityRecordedAt).TotalMinutes -gt
      [double]$contract.host.continuityMaximumAgeMinutes
  ) { throw "Host-continuity evidence is invalid, stale or mismatched." }

  [void](New-Item -ItemType Directory -Path $attemptRoot)
  foreach ($path in @($evidenceRoot, $lifecycleRoot, $logsRoot, $workRoot)) {
    [void](New-Item -ItemType Directory -Path $path)
  }
  Copy-CreateOnlyFile $HostContinuityPath (
    Join-Path $evidenceRoot $contract.host.continuityFileName
  )
  Write-CreateOnlyJson $authorityPath ([ordered]@{
    contract = "oracle.sprint-30-5.stage-3-r1-authority"
    authorityId = $AuthorityId
    attemptId = $AttemptId
    timestampUtc = $TimestampUtc
    state = "consumed"
  })
  Write-Lifecycle "authority-consumed" @{ transferRoot = $TransferRoot }
  Assert-PackageContent
  Write-Lifecycle "transfer-verified" @{
    manifestSha256 = Get-Sha256 $manifestPath
    packageContentReconciled = $true
  }

  $developmentTools = @("node", "npm", "git", "python", "docker", "dotnet", "msbuild") |
    ForEach-Object { [ordered]@{
      name = $_
      available = $null -ne (Get-Command $_ -ErrorAction SilentlyContinue)
    }}
  if (@($developmentTools | Where-Object { $_.available }).Count -ne 0) {
    throw "Clean-host admission found development tooling."
  }
  $secureBoot = Confirm-SecureBootUEFI
  $tpm = Get-Tpm
  $defender = Get-MpComputerStatus
  $recovery = Invoke-GovernedProcess "recovery-readiness" (
    Join-Path ([Environment]::SystemDirectory) "reagentc.exe"
  ) @("/info")
  $activation = @(Get-CimInstance SoftwareLicensingProduct | Where-Object {
    $_.PartialProductKey -and $_.LicenseStatus -eq 1
  })
  if (
    -not $secureBoot -or -not $tpm.TpmPresent -or -not $tpm.TpmReady -or
    -not $defender.AntivirusEnabled -or -not $defender.RealTimeProtectionEnabled -or
    $activation.Count -eq 0 -or
    $recovery.stdout -notmatch '(?im)Windows RE status:\s+Enabled'
  ) { throw "Host security, activation or recovery admission is incomplete." }
  $installedSoftware = @(Get-InstalledSoftwareInventory)
  $initialSoftwareJson = $installedSoftware | ConvertTo-Json -Depth 8 -Compress
  Write-CreateOnlyJson (Join-Path $evidenceRoot "host-admission.json") ([ordered]@{
    result = "passed"
    deviceName = $env:COMPUTERNAME
    tools = $developmentTools
    manufacturer = [string]$computerSystem.Manufacturer
    model = [string]$computerSystem.Model
    secureBoot = $secureBoot
    tpmPresent = $tpm.TpmPresent
    tpmReady = $tpm.TpmReady
    defenderAntivirusEnabled = $defender.AntivirusEnabled
    defenderRealTimeProtectionEnabled = $defender.RealTimeProtectionEnabled
    activatedProductCount = $activation.Count
    recovery = $recovery
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

  $signature = Get-AuthenticodeSignature -LiteralPath $msixPath
  $certificate = $signature.SignerCertificate
  if (
    $null -eq $certificate -or $certificate.Thumbprint -cne $thumbprint -or
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
  $certutil = Join-Path ([Environment]::SystemDirectory) "certutil.exe"
  [void](Invoke-GovernedProcess "exact-root-import" $certutil @(
    "-user", "-addstore", "Root", $certificatePath
  ))
  $matches = @(Get-ExactCertificateMatches)
  if ($matches.Count -ne 1 -or $matches[0].Location -cne "CurrentUser" -or
    $matches[0].Store -cne "Root") { throw "Temporary trust is broader than expected." }
  Assert-CertificateIdentity $matches[0].Certificate $false
  if ((Get-AuthenticodeSignature -LiteralPath $msixPath).Status -cne "Valid") {
    throw "Strict Authenticode Status Valid was not achieved."
  }
  Write-Lifecycle "trust-established" @{ thumbprint = $thumbprint; store = "CurrentUser\Root" }

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
  Write-Lifecycle "package-installed" @{ packageFullName = $package[0].PackageFullName }

  [void](Invoke-GovernedProcess "initial-registered-launch" (
    Join-Path ([Environment]::SystemDirectory) "explorer.exe"
  ) @("shell:AppsFolder\$packageFamilyName!Oracle"))
  $initial = Invoke-NativeObservation "initial"
  Write-CreateOnlyJson (Join-Path $evidenceRoot "runtime-observation.json") $initial
  Write-Lifecycle "runtime-observed" @{ handle = $initial.selectedWindow.handle }

  Stop-ExactPackageProcesses
  Reset-AppxPackage -Package $package[0].PackageFullName
  [void](Invoke-GovernedProcess "repair-registered-launch" (
    Join-Path ([Environment]::SystemDirectory) "explorer.exe"
  ) @("shell:AppsFolder\$packageFamilyName!Oracle"))
  $repair = Invoke-NativeObservation "repair"
  Write-CreateOnlyJson (Join-Path $evidenceRoot "repair-observation.json") $repair
  Write-Lifecycle "repair-observed" @{ handle = $repair.selectedWindow.handle }

  Stop-ExactPackageProcesses
  Remove-ExactPackage
  if (@(Get-AppxPackage -Name $contract.package.identity).Count -ne 0) {
    throw "Package residue remains."
  }
  Write-Lifecycle "package-removed" @{ remaining = 0 }
  Remove-ExactRootTrust
  Write-Lifecycle "trust-removed" @{ remaining = @(Get-ExactCertificateMatches).Count }
  if (@(Get-ExactCertificateMatches).Count -ne 0) { throw "Certificate residue remains." }
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
    contract = "oracle.sprint-30-5.stage-3-r1-evidence-manifest"
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
    result = "passed"
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
    contract = "oracle.sprint-30-5.stage-3-r1-archive-manifest"
    authorityId = $AuthorityId
    attemptId = $AttemptId
    archive = [IO.Path]::GetFileName($archivePath)
    size = (Get-Item -LiteralPath $archivePath).Length
    sha256 = $archiveHash
    evidenceManifestSha256 = $evidenceManifestHash
  })
} catch {
  $failure = $_.Exception.Message
  try {
    Stop-ExactPackageProcesses
    Remove-ExactPackage
    Remove-ExactRootTrust
  } catch {
    $teardownFailure = $_.Exception.Message
  }
  if ($null -ne $partialArchive -and (Test-Path -LiteralPath $partialArchive)) {
    Remove-Item -LiteralPath $partialArchive -ErrorAction SilentlyContinue
  }
  if (Test-Path -LiteralPath $attemptRoot) {
    Write-CreateOnlyJson (Join-Path $evidenceRoot "failure.json") ([ordered]@{
      result = "failed"
      completedLifecyclePhases = $phaseIndex
      failure = $failure
      teardownFailure = $teardownFailure
      recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    })
  }
  throw
}
