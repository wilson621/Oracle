[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet(
    "PreExecution",
    "Revision2TrustCleanup",
    "NegativePathAndTrust",
    "InstallAndStartup",
    "InstallAndStartupContinuation",
    "RecoveryContinuationPreflight",
    "InstallAndStartupRecoveryContinuation",
    "RepairAndRemoval",
    "Cleanup"
  )]
  [string]$Phase,

  [Parameter(Mandatory = $false)]
  [string]$TransferRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$contractPath = Join-Path $PSScriptRoot "Oracle.Stage3QualificationContract.json"
$contract = Get-Content -LiteralPath $contractPath -Raw | ConvertFrom-Json
$revision2FailurePath = Join-Path `
  $PSScriptRoot `
  "Oracle.Stage3Revision2FailureRecord.json"
$revision2Failure = Get-Content `
  -LiteralPath $revision2FailurePath `
  -Raw |
  ConvertFrom-Json
$revision3FailurePath = Join-Path `
  $PSScriptRoot `
  "Oracle.Stage3Revision3FailureRecord.json"
$revision3Failure = Get-Content `
  -LiteralPath $revision3FailurePath `
  -Raw |
  ConvertFrom-Json
$revision4FailurePath = Join-Path `
  $PSScriptRoot `
  "Oracle.Stage3Revision4FailureRecord.json"
$revision4Failure = Get-Content `
  -LiteralPath $revision4FailurePath `
  -Raw |
  ConvertFrom-Json
$revision5FailurePath = Join-Path `
  $PSScriptRoot `
  "Oracle.Stage3Revision5FailureRecord.json"
$revision5Failure = Get-Content `
  -LiteralPath $revision5FailurePath `
  -Raw |
  ConvertFrom-Json
$transferRoot = [IO.Path]::GetFullPath($TransferRoot)
$evidenceRoot = Join-Path $transferRoot "stage-3-evidence"
$workRoot = Join-Path $transferRoot "stage-3-work"
$expandedRoot = Join-Path $workRoot "stage-2"
$releaseRoot = Join-Path $expandedRoot "release"
$archivePath = Join-Path $transferRoot $contract.candidate.archiveFilename
$msixPath = Join-Path $releaseRoot $contract.candidate.msixFilename
$certificatePath = Join-Path $workRoot "Oracle.Stage2.PublicTest.cer"
$tamperedPath = Join-Path $workRoot "Oracle.Stage2.TAMPERED.msix"
$identity = [string]$contract.candidate.packageIdentity
$thumbprint = [string]$contract.candidate.certificateThumbprint
$publisher = [string]$contract.candidate.publisher
$temporaryTrustLocation = [string]$contract.temporaryTrust.location
$temporaryTrustStore = [string]$contract.temporaryTrust.store
$temporaryTrustPath = `
  "Cert:\$temporaryTrustLocation\$temporaryTrustStore"
$obsoleteTrustLocation = [string]$contract.obsoleteRevision2Trust.location
$obsoleteTrustStore = [string]$contract.obsoleteRevision2Trust.store
$founderConfirmationTimeoutSeconds = 120
$networkIsolationRuleName = "Oracle.Stage3.R6.OutboundIsolation"
$networkIsolationRuleDisplayName = `
  "Oracle Stage 3 Revision 6 temporary outbound isolation"

New-Item -ItemType Directory -Path $evidenceRoot -Force | Out-Null

if (-not ("OracleStage3Window" -as [type])) {
  Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class OracleStage3Window {
  [DllImport("user32.dll")]
  [return: MarshalAs(UnmanagedType.Bool)]
  public static extern bool IsWindowVisible(IntPtr hWnd);
}
"@
}

function Get-Sha256 {
  param([Parameter(Mandatory = $true)][string]$Path)

  return (
    Get-FileHash -LiteralPath $Path -Algorithm SHA256
  ).Hash.ToLowerInvariant()
}

function Write-Evidence {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][object]$Value
  )

  $path = Join-Path $evidenceRoot $Name
  $sidecarPath = "$path.sha256.txt"
  if (
    (Test-Path -LiteralPath $path) -or
    (Test-Path -LiteralPath $sidecarPath)
  ) {
    throw "Evidence already exists and cannot be overwritten: $Name"
  }

  $token = [Guid]::NewGuid().ToString("N")
  $temporaryPath = Join-Path $evidenceRoot ".$Name.$token.tmp"
  $temporarySidecarPath = `
    Join-Path $evidenceRoot ".$Name.sha256.$token.tmp"
  try {
    $json = $Value | ConvertTo-Json -Depth 12
    $utf8WithBom = New-Object System.Text.UTF8Encoding($true)
    [IO.File]::WriteAllText(
      $temporaryPath,
      "$json$([Environment]::NewLine)",
      $utf8WithBom
    )
    $hash = Get-Sha256 -Path $temporaryPath
    [IO.File]::WriteAllText(
      $temporarySidecarPath,
      "$hash  $Name$([Environment]::NewLine)",
      [Text.Encoding]::ASCII
    )

    if (
      (Test-Path -LiteralPath $path) -or
      (Test-Path -LiteralPath $sidecarPath)
    ) {
      throw "Evidence appeared during finalisation: $Name"
    }
    [IO.File]::Move($temporarySidecarPath, $sidecarPath)
    try {
      [IO.File]::Move($temporaryPath, $path)
    } catch {
      Remove-Item -LiteralPath $sidecarPath `
        -Force -ErrorAction SilentlyContinue
      throw
    }
  } finally {
    Remove-Item -LiteralPath $temporaryPath `
      -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $temporarySidecarPath `
      -Force -ErrorAction SilentlyContinue
  }

  Write-Host "Evidence: $path"
  Write-Host "SHA-256: $(Get-Sha256 -Path $path)"
}

function Assert-Elevated {
  $principal = [Security.Principal.WindowsPrincipal](
    [Security.Principal.WindowsIdentity]::GetCurrent()
  )
  if (-not $principal.IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
  )) {
    throw "This phase requires an elevated Windows PowerShell process."
  }
}

function Assert-PriorPhase {
  param([Parameter(Mandatory = $true)][string]$Filename)

  $path = Join-Path $evidenceRoot $Filename
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "Required prior-phase evidence is missing: $Filename"
  }
  $sidecar = "$path.sha256.txt"
  if (-not (Test-Path -LiteralPath $sidecar -PathType Leaf)) {
    throw "Required prior-phase sidecar is missing: $Filename.sha256.txt"
  }
  $expected = (
    (Get-Content -LiteralPath $sidecar -Raw).Trim() -split "\s+"
  )[0]
  if ((Get-Sha256 -Path $path) -ne $expected.ToLowerInvariant()) {
    throw "Prior-phase evidence hash mismatch: $Filename"
  }
  $evidence = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
  if ([string]$evidence.result -ne "passed") {
    throw "Prior phase did not pass: $Filename"
  }
}

function Assert-EvidenceHash {
  param(
    [Parameter(Mandatory = $true)][string]$Filename,
    [Parameter(Mandatory = $true)][string]$ExpectedSha256
  )

  $path = Join-Path $evidenceRoot $Filename
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "Required bound evidence is missing: $Filename"
  }
  $sidecar = "$path.sha256.txt"
  if (-not (Test-Path -LiteralPath $sidecar -PathType Leaf)) {
    throw "Required bound evidence sidecar is missing: $Filename.sha256.txt"
  }
  $declared = (
    (Get-Content -LiteralPath $sidecar -Raw).Trim() -split "\s+"
  )[0].ToLowerInvariant()
  $actual = Get-Sha256 -Path $path
  if (
    $actual -ne $declared -or
    $actual -ne $ExpectedSha256.ToLowerInvariant()
  ) {
    throw "Bound evidence hash mismatch: $Filename"
  }
}

function Assert-HistoricalEvidenceHash {
  param(
    [Parameter(Mandatory = $true)][string]$HistoryDirectory,
    [Parameter(Mandatory = $true)][string]$Filename,
    [Parameter(Mandatory = $true)][string]$ExpectedSha256
  )

  $path = Join-Path `
    (Join-Path $transferRoot "immutable-history\$HistoryDirectory") `
    $Filename
  $sidecar = "$path.sha256.txt"
  if (
    -not (Test-Path -LiteralPath $path -PathType Leaf) -or
    -not (Test-Path -LiteralPath $sidecar -PathType Leaf)
  ) {
    throw "Required immutable historical evidence or sidecar is missing: $Filename"
  }
  $declared = (
    (Get-Content -LiteralPath $sidecar -Raw).Trim() -split "\s+"
  )[0].ToLowerInvariant()
  $actual = Get-Sha256 -Path $path
  if (
    $actual -ne $declared -or
    $actual -ne $ExpectedSha256.ToLowerInvariant()
  ) {
    throw "Immutable historical evidence binding is invalid: $Filename"
  }
}

function Get-OraclePackage {
  return Get-AppxPackage -Name $identity -ErrorAction SilentlyContinue
}

function Assert-AdmittedHost {
  if ($env:COMPUTERNAME -ine [string]$contract.host.deviceName) {
    throw "Wrong host. Expected $($contract.host.deviceName)."
  }
  $system = Get-CimInstance Win32_ComputerSystem
  if (
    [string]$system.Manufacturer -ine [string]$contract.host.manufacturer -or
    [string]$system.Model -ine [string]$contract.host.model
  ) {
    throw "Host manufacturer/model does not match the admitted host."
  }
  return $system
}

function Get-ExactOracleProcesses {
  param([Parameter(Mandatory = $true)][string]$ExecutablePath)

  $resolvedExecutablePath = [IO.Path]::GetFullPath($ExecutablePath)
  return @(
    Get-Process -Name "Oracle" -ErrorAction SilentlyContinue |
      Where-Object {
        try {
          [IO.Path]::GetFullPath([string]$_.Path) -ieq $resolvedExecutablePath
        } catch {
          $false
        }
      }
  )
}

function Get-UnresolvedOracleProcessIds {
  param([Parameter(Mandatory = $true)][string]$ExecutablePath)

  $resolvedExecutablePath = [IO.Path]::GetFullPath($ExecutablePath)
  return @(
    Get-Process -Name "Oracle" -ErrorAction SilentlyContinue |
      Where-Object {
        try {
          $path = [IO.Path]::GetFullPath([string]$_.Path)
          $path -ine $resolvedExecutablePath
        } catch {
          $true
        }
      } |
      ForEach-Object { [int]$_.Id }
  )
}

function Get-CertificateMatches {
  $stores = @(
    [ordered]@{
      location = "CurrentUser"
      store = "My"
      registryRoot = "HKCU:\SOFTWARE\Microsoft\SystemCertificates\My\Certificates"
    },
    [ordered]@{
      location = "CurrentUser"
      store = "Root"
      registryRoot = "HKCU:\SOFTWARE\Microsoft\SystemCertificates\Root\Certificates"
    },
    [ordered]@{
      location = "CurrentUser"
      store = "TrustedPeople"
      registryRoot = "HKCU:\SOFTWARE\Microsoft\SystemCertificates\TrustedPeople\Certificates"
    },
    [ordered]@{
      location = "LocalMachine"
      store = "My"
      registryRoot = "HKLM:\SOFTWARE\Microsoft\SystemCertificates\My\Certificates"
    },
    [ordered]@{
      location = "LocalMachine"
      store = "Root"
      registryRoot = "HKLM:\SOFTWARE\Microsoft\SystemCertificates\Root\Certificates"
    },
    [ordered]@{
      location = "LocalMachine"
      store = "TrustedPeople"
      registryRoot = "HKLM:\SOFTWARE\Microsoft\SystemCertificates\TrustedPeople\Certificates"
    }
  )

  $matches = @()
  foreach ($definition in $stores) {
    $registryPath = Join-Path `
      ([string]$definition.registryRoot) `
      $thumbprint
    if (Test-Path -LiteralPath $registryPath) {
      $certificatePath = `
        "Cert:\$($definition.location)\$($definition.store)\$thumbprint"
      $certificate = Get-Item -LiteralPath $certificatePath
      $matches += @([ordered]@{
        location = [string]$definition.location
        store = [string]$definition.store
        registryPath = $registryPath
        subject = $certificate.Subject
        thumbprint = $certificate.Thumbprint
        hasPrivateKey = $certificate.HasPrivateKey
        physical = $true
      })
    }
  }
  return @($matches)
}

function Get-LogicalCertificateViews {
  $views = @()
  foreach ($location in @("CurrentUser", "LocalMachine")) {
    foreach ($store in @("My", "Root", "TrustedPeople")) {
      $path = "Cert:\$location\$store"
      if (Test-Path -LiteralPath $path) {
        $views += @(Get-ChildItem -LiteralPath $path | Where-Object {
          $_.Thumbprint -eq $thumbprint
        } | ForEach-Object {
          [ordered]@{
            location = $location
            store = $store
            subject = $_.Subject
            thumbprint = $_.Thumbprint
            hasPrivateKey = $_.HasPrivateKey
            physicalAuthority = $false
          }
        })
      }
    }
  }
  return @($views)
}

function Assert-BoundedCertificateTrust {
  param(
    [Parameter(Mandatory = $true)]
    [double]$MinimumMinutesRemaining
  )

  $matches = @(Get-CertificateMatches)
  if (
    $matches.Count -ne 1 -or
    [string]$matches[0].location -ne $temporaryTrustLocation -or
    [string]$matches[0].store -ne $temporaryTrustStore -or
    [bool]$matches[0].hasPrivateKey
  ) {
    throw "Temporary certificate trust is not exactly bounded."
  }
  $certificate = Get-Item -LiteralPath "$temporaryTrustPath\$thumbprint"
  $now = [DateTime]::UtcNow
  $notBefore = $certificate.NotBefore.ToUniversalTime()
  $notAfter = $certificate.NotAfter.ToUniversalTime()
  $expectedNotAfter = [DateTime]::Parse(
    [string]$contract.candidate.certificateNotAfterUtc
  ).ToUniversalTime()
  if (
    [string]$certificate.Thumbprint -ne $thumbprint -or
    [string]$certificate.Subject -ne $publisher -or
    [bool]$certificate.HasPrivateKey -or
    $notBefore -gt $now -or
    $notAfter -ne $expectedNotAfter -or
    $notAfter -le $now
  ) {
    throw "Temporary certificate identity or validity is invalid."
  }
  $remaining = $notAfter - $now
  if ($remaining.TotalMinutes -lt $MinimumMinutesRemaining) {
    throw "Insufficient temporary certificate validity remains."
  }
  return [ordered]@{
    location = $temporaryTrustLocation
    store = $temporaryTrustStore
    thumbprint = $thumbprint
    subject = [string]$certificate.Subject
    hasPrivateKey = [bool]$certificate.HasPrivateKey
    notBeforeUtc = $notBefore.ToString("o")
    notAfterUtc = $notAfter.ToString("o")
    checkedAtUtc = $now.ToString("o")
    minutesRemaining = [Math]::Round($remaining.TotalMinutes, 2)
  }
}

function Remove-OracleCertificate {
  foreach ($match in @(Get-CertificateMatches)) {
    Remove-Item `
      -LiteralPath `
        "Cert:\$($match.location)\$($match.store)\$thumbprint" `
      -Force `
      -ErrorAction SilentlyContinue
  }
}

function Enable-OracleNetworkIsolation {
  param([Parameter(Mandatory = $true)][string]$ExecutablePath)

  $existing = Get-NetFirewallRule `
    -Name $networkIsolationRuleName `
    -ErrorAction SilentlyContinue
  if ($null -ne $existing) {
    throw "The Revision 5 network-isolation rule already exists."
  }

  $created = $false
  try {
    New-NetFirewallRule `
      -Name $networkIsolationRuleName `
      -DisplayName $networkIsolationRuleDisplayName `
      -Description "Temporary Stage 3 Revision 5 exact-program isolation" `
      -Direction Outbound `
      -Action Block `
      -Enabled True `
      -Profile Any `
      -Program ([IO.Path]::GetFullPath($ExecutablePath)) `
      -PolicyStore PersistentStore |
      Out-Null
    $created = $true
    if (-not (Test-OracleNetworkIsolation -ExecutablePath $ExecutablePath)) {
      throw "The exact-program network-isolation rule did not verify."
    }
  } catch {
    if ($created) {
      Remove-NetFirewallRule `
        -Name $networkIsolationRuleName `
        -ErrorAction SilentlyContinue
    }
    throw
  }
  return [ordered]@{
    name = $networkIsolationRuleName
    displayName = $networkIsolationRuleDisplayName
    direction = "Outbound"
    action = "Block"
    profile = "Any"
    program = [IO.Path]::GetFullPath($ExecutablePath)
    enabledAtUtc = [DateTime]::UtcNow.ToString("o")
    enforcement = "all-outbound-blocked-for-exact-installed-executable"
  }
}

function Test-OracleNetworkIsolation {
  param([Parameter(Mandatory = $true)][string]$ExecutablePath)

  try {
    $rules = @(
      Get-NetFirewallRule `
        -Name $networkIsolationRuleName `
        -ErrorAction Stop
    )
    if (
      $rules.Count -ne 1 -or
      [string]$rules[0].Direction -ne "Outbound" -or
      [string]$rules[0].Action -ne "Block" -or
      [string]$rules[0].Enabled -ne "True"
    ) {
      return $false
    }
    $filters = @(
      $rules[0] |
        Get-NetFirewallApplicationFilter -ErrorAction Stop
    )
    if (
      $filters.Count -ne 1 -or
      [IO.Path]::GetFullPath([string]$filters[0].Program) -ine
        [IO.Path]::GetFullPath($ExecutablePath)
    ) {
      return $false
    }
    return $true
  } catch {
    return $false
  }
}

function Disable-OracleNetworkIsolation {
  param([Parameter(Mandatory = $true)][string]$ExecutablePath)

  $result = [ordered]@{
    name = $networkIsolationRuleName
    removalAttemptedAtUtc = [DateTime]::UtcNow.ToString("o")
    exactRuleVerifiedBeforeRemoval = $false
    removed = $false
    residue = $false
  }
  $existing = @(
    Get-NetFirewallRule `
      -Name $networkIsolationRuleName `
      -ErrorAction SilentlyContinue
  )
  if ($existing.Count -eq 0) {
    $result.removed = $true
    return $result
  }
  if (-not (Test-OracleNetworkIsolation -ExecutablePath $ExecutablePath)) {
    throw "Refusing to remove a network-isolation rule with unexpected scope."
  }
  $result.exactRuleVerifiedBeforeRemoval = $true
  Remove-NetFirewallRule `
    -Name $networkIsolationRuleName `
    -ErrorAction Stop
  $remaining = @(
    Get-NetFirewallRule `
      -Name $networkIsolationRuleName `
      -ErrorAction SilentlyContinue
  )
  $result.residue = $remaining.Count -ne 0
  $result.removed = -not $result.residue
  if ($result.residue) {
    throw "Revision 5 network-isolation rule remains after removal."
  }
  return $result
}

function Assert-Revision3FailureBinding {
  if (
    [string]$revision3Failure.deploymentFailure.originalUntrusted.hresult -ne
      "0x800B0109" -or
    [string]$revision3Failure.deploymentFailure.tamperedAfterTrust.hresult -ne
      "0x80096010" -or
    [bool]$revision3Failure.returnedEvidence.revision3NegativeEvidenceCreated -or
    [bool]$revision3Failure.returnedEvidence.phase03EvidenceCreated
  ) {
    throw "Revision 3 failure record is invalid."
  }

  $originalActivity = [Guid](
    [string]$revision3Failure.deploymentFailure.originalUntrusted.activityId
  )
  $tamperedActivity = [Guid](
    [string]$revision3Failure.deploymentFailure.tamperedAfterTrust.activityId
  )
  $originalMessages = @(
    Get-AppPackageLog -ActivityID $originalActivity |
      ForEach-Object { [string]$_.Message }
  )
  $tamperedMessages = @(
    Get-AppPackageLog -ActivityID $tamperedActivity |
      ForEach-Object { [string]$_.Message }
  )
  if (
    @($originalMessages | Where-Object {
      $_ -match "0x800B0109"
    }).Count -eq 0 -or
    @($tamperedMessages | Where-Object {
      $_ -match "0x80096010"
    }).Count -eq 0
  ) {
    throw "Revision 3 deployment-event binding is unavailable or invalid."
  }
}

function Assert-Revision4FailureBinding {
  $bindings = $revision4Failure.bindings
  $conclusions = $revision4Failure.conclusions
  $installedPackage = $revision4Failure.installedPackage
  if (
    [int]$revision4Failure.revision -ne 4 -or
    [string]$revision4Failure.outcome -ne
      "install-and-startup-timeout-after-successful-appx-activation" -or
    -not [bool]$conclusions.installSucceeded -or
    -not [bool]$conclusions.packageIdentityProven -or
    -not [bool]$conclusions.executableSignatureProven -or
    -not [bool]$conclusions.windowsAppxActivationProven -or
    [bool]$conclusions.visibleReadinessProven -or
    [bool]$conclusions.sustainedReadinessProven -or
    [bool]$conclusions.founderConfirmationsRecorded -or
    [bool]$conclusions.phase03SuccessEvidenceCreated -or
    [bool]$conclusions.productDefectProven
  ) {
    throw "Revision 4 failure conclusions are invalid."
  }
  if (
    [string]$bindings.revision4TransferManifestSha256 -ne
      "ee18fbd03cd44ac45bcc1bf2307ea680a083e301f7a5c6ebc74f5bb32848c971" -or
    [string]$bindings.revision4KitManifestSha256 -ne
      "875f795b89ed72af95b43ed2f6924939ef3480d65501aab5cf8eee9dd900d6b0" -or
    [string]$bindings.revision4QualificationHarnessSha256 -ne
      "57bb72d21274e05d3ad91db84a4d4351db90af54663dffccc60a21723abb3789" -or
    [string]$bindings.revision4NegativePathEvidenceSha256 -ne
      "164a5df278aeca15d98b7c131e4c73cadea40f511d0831f12ed4d0d46e3215e2" -or
    [string]$bindings.installAndStartupTimeoutTranscriptSha256 -ne
      "ab3344781985548280bd1a45975473a9cfdbd4444370d16b23d8642009f9fb60" -or
    [string]$bindings.initialDiagnosticTranscriptSha256 -ne
      "f39933fcce5bede87839cddb535f97e836d6db39646220121c7e9068ede9d070" -or
    [string]$bindings.correctedDiagnosticTranscriptSha256 -ne
      "6fe9fed02be64fbf68a5553049cbd45ce5217f57025ef8c21a370a1e7698fc3" -or
    [string]$bindings.frozenStage2ArchiveSha256 -ne
      [string]$contract.candidate.archiveSha256 -or
    [string]$bindings.frozenMsixSha256 -ne
      [string]$contract.candidate.msixSha256 -or
    [string]$bindings.installedOracleExeSha256 -ne
      [string]$contract.candidate.installedExecutableSha256
  ) {
    throw "Revision 4 failure hash bindings are invalid."
  }
  if (
    [string]$installedPackage.packageFullName -ne
      [string]$contract.candidate.packageFullName -or
    [string]$installedPackage.version -ne
      [string]$contract.candidate.packageVersion -or
    [string]$installedPackage.publisher -ne $publisher -or
    [string]$installedPackage.architecture -ne
      [string]$contract.candidate.packageArchitecture -or
    [string]$installedPackage.status -ne
      [string]$contract.candidate.packageStatus
  ) {
    throw "Revision 4 installed-package binding is invalid."
  }
  if (
    -not [bool]$revision4Failure.governance.immutable -or
    -not [bool]$revision4Failure.governance.mustRemainFailure -or
    -not [bool]$revision4Failure.governance.phase03SuccessEvidenceAbsent -or
    [bool]$revision4Failure.governance.revision5MayReinstallAutomatically
  ) {
    throw "Revision 4 governance binding is invalid."
  }
}

function Assert-Revision5FailureBinding {
  if (
    [int]$revision5Failure.revision -ne 5 -or
    [string]$revision5Failure.outcome -ne
      "continuation-blocked-by-missing-bound-revision-4-evidence" -or
    -not [bool]$revision5Failure.immutable -or
    -not [bool]$revision5Failure.evidence.continuationDiagnostic.finalised -or
    -not [bool]$revision5Failure.evidence.canonicalPhase03SuccessEvidenceAbsent -or
    -not [bool]$revision5Failure.governance.mayNotBeResumedInSameAttemptDirectory
  ) {
    throw "Revision 5 failed-attempt governance binding is invalid."
  }

  $historyRoot = Join-Path `
    $transferRoot `
    "immutable-history\revision-5-failed-attempt"
  foreach ($binding in @(
    $revision5Failure.evidence.preExecution,
    $revision5Failure.evidence.continuationDiagnostic
  )) {
    $path = Join-Path $historyRoot ([string]$binding.filename)
    $sidecar = "$path.sha256.txt"
    if (
      -not (Test-Path -LiteralPath $path -PathType Leaf) -or
      -not (Test-Path -LiteralPath $sidecar -PathType Leaf)
    ) {
      throw "Required immutable Revision 5 failed-attempt evidence is missing."
    }
    $actual = Get-Sha256 -Path $path
    $declared = (
      (Get-Content -LiteralPath $sidecar -Raw).Trim() -split "\s+"
    )[0].ToLowerInvariant()
    if (
      $actual -ne [string]$binding.sha256 -or
      $actual -ne $declared
    ) {
      throw "Revision 5 failed-attempt evidence binding is invalid."
    }
  }
}

function Invoke-RecoveryContinuationPreflight {
  Assert-Elevated

  $evidenceName = "00b-recovery-continuation-preflight.json"
  $evidencePath = Join-Path $evidenceRoot $evidenceName
  if (
    (Test-Path -LiteralPath $evidencePath) -or
    (Test-Path -LiteralPath "$evidencePath.sha256.txt")
  ) {
    throw "Recovery continuation preflight evidence already exists."
  }

  Assert-AdmittedHost | Out-Null
  Assert-Revision4FailureBinding
  Assert-Revision5FailureBinding
  Assert-HistoricalEvidenceHash `
    -HistoryDirectory "revision-4" `
    -Filename ([string]$contract.recovery.requiredRevision4Evidence.filename) `
    -ExpectedSha256 (
      [string]$contract.recovery.requiredRevision4Evidence.sha256
    )
  Assert-PriorPhase -Filename "00a-recovery-restoration.json"

  if (-not (Test-Path -LiteralPath $msixPath -PathType Leaf)) {
    throw "The frozen Stage 2 MSIX is missing."
  }
  if ((Get-Sha256 -Path $msixPath) -ne [string]$contract.candidate.msixSha256) {
    throw "The frozen Stage 2 MSIX hash changed."
  }

  $packages = @(Get-OraclePackage)
  if (
    $packages.Count -ne 1 -or
    [string]$packages[0].PackageFullName -ne
      [string]$contract.candidate.packageFullName -or
    [string]$packages[0].Status -ine [string]$contract.candidate.packageStatus
  ) {
    throw "The exact installed continuation package is required."
  }
  $package = $packages[0]
  $executablePath = Join-Path `
    ([string]$package.InstallLocation) `
    ([string]$contract.candidate.installedExecutable)
  if (
    -not (Test-Path -LiteralPath $executablePath -PathType Leaf) -or
    (Get-Sha256 -Path $executablePath) -ne
      [string]$contract.candidate.installedExecutableSha256
  ) {
    throw "The installed Oracle executable binding is invalid."
  }
  $signature = Get-AuthenticodeSignature -LiteralPath $executablePath
  if (
    [string]$signature.Status -ne "Valid" -or
    $null -eq $signature.SignerCertificate -or
    [string]$signature.SignerCertificate.Subject -ne $publisher -or
    [string]$signature.SignerCertificate.Thumbprint -ne $thumbprint
  ) {
    throw "The installed Oracle executable signature is invalid."
  }
  $certificate = Assert-BoundedCertificateTrust `
    -MinimumMinutesRemaining (
      [int]$contract.startupObservation.minimumCertificateMinutesRemaining
    )
  if (@(Get-Process -Name "Oracle" -ErrorAction SilentlyContinue).Count -ne 0) {
    throw "Oracle is already running before continuation preflight."
  }

  Write-Evidence $evidenceName ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.stage-3-recovery-continuation-preflight"
    revision = 6
    result = "passed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    revision4EvidenceSha256 =
      [string]$contract.recovery.requiredRevision4Evidence.sha256
    revision5FailedAttemptPreserved = $true
    restorationEvidence = "00a-recovery-restoration.json"
    packageFullName = [string]$package.PackageFullName
    packageStatus = [string]$package.Status
    installedExecutableSha256 = Get-Sha256 -Path $executablePath
    frozenMsixSha256 = Get-Sha256 -Path $msixPath
    certificate = $certificate
    oracleAlreadyRunning = $false
    legacyPreExecutionUsed = $false
  })
}

function Read-FounderConfirmation {
  param([Parameter(Mandatory = $true)][string]$Prompt)

  Write-Host `
    "$Prompt [Y/N] (timeout: $founderConfirmationTimeoutSeconds seconds): " `
    -NoNewline
  $deadline = [DateTime]::UtcNow.AddSeconds(
    $founderConfirmationTimeoutSeconds
  )
  while ([DateTime]::UtcNow -lt $deadline) {
    try {
      if ($Host.UI.RawUI.KeyAvailable) {
        $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Write-Host ([string]$key.Character)
        if ([string]$key.Character -cne "Y") {
          throw "Founder confirmation was not granted: $Prompt"
        }
        return $true
      }
    } catch {
      if (
        [string]$_.Exception.Message -like
        "Founder confirmation was not granted:*"
      ) {
        throw
      }
      throw "Founder confirmation input could not be read safely: $Prompt"
    }
    Start-Sleep -Milliseconds 200
  }
  Write-Host ""
  throw "Founder confirmation timed out: $Prompt"
}

function Invoke-PreExecution {
  if ([int]$contract.qualificationKitRevision -ge 6) {
    throw (
      "Legacy PreExecution is prohibited for the Revision 6 recovery. " +
      "Use the separately governed restoration and recovery preflight."
    )
  }
  if ($env:COMPUTERNAME -ine [string]$contract.host.deviceName) {
    throw "Wrong host. Expected $($contract.host.deviceName)."
  }
  $system = Get-CimInstance Win32_ComputerSystem
  if (
    [string]$system.Manufacturer -ine [string]$contract.host.manufacturer -or
    [string]$system.Model -ine [string]$contract.host.model
  ) {
    throw "Host manufacturer/model does not match the admitted host."
  }
  if (@(Get-CertificateMatches).Count -ne 0) {
    throw "The Stage 2 certificate is already present before qualification."
  }
  if ($null -ne (Get-OraclePackage)) {
    throw "Oracle is already installed before qualification."
  }
  if (-not (Test-Path -LiteralPath $archivePath -PathType Leaf)) {
    throw "Frozen Stage 2 archive is missing."
  }
  $archiveSha256 = Get-Sha256 -Path $archivePath
  if ($archiveSha256 -ne [string]$contract.candidate.archiveSha256) {
    throw "Frozen Stage 2 archive hash mismatch."
  }

  if (Test-Path -LiteralPath $expandedRoot) {
    throw "Stage 2 expansion directory already exists."
  }
  New-Item -ItemType Directory -Path $workRoot -Force | Out-Null
  Expand-Archive -LiteralPath $archivePath -DestinationPath $expandedRoot

  $indexPath = Join-Path $releaseRoot "stage-2-evidence-index.json"
  $index = Get-Content -LiteralPath $indexPath -Raw | ConvertFrom-Json
  foreach ($entry in $index.evidenceFiles) {
    $path = Join-Path $releaseRoot ([string]$entry.filename)
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
      throw "Stage 2 evidence file is missing: $($entry.filename)"
    }
    if ((Get-Sha256 -Path $path) -ne [string]$entry.sha256) {
      throw "Stage 2 evidence hash mismatch: $($entry.filename)"
    }
    if ((Get-Item -LiteralPath $path).Length -ne [long]$entry.size) {
      throw "Stage 2 evidence size mismatch: $($entry.filename)"
    }
  }
  if ((Get-Sha256 -Path $msixPath) -ne [string]$contract.candidate.msixSha256) {
    throw "MSIX hash mismatch."
  }

  Add-Type -AssemblyName System.Security
  $manifestPath = Join-Path $releaseRoot "oracle-release-manifest.json"
  $signaturePath = "$manifestPath.p7s"
  $content = [Security.Cryptography.Pkcs.ContentInfo]::new(
    [IO.File]::ReadAllBytes($manifestPath)
  )
  $cms = [Security.Cryptography.Pkcs.SignedCms]::new($content, $true)
  $cms.Decode([IO.File]::ReadAllBytes($signaturePath))
  $cms.CheckSignature($true)
  if ($cms.SignerInfos.Count -ne 1) {
    throw "Release Manifest must have exactly one signer."
  }
  $certificate = $cms.SignerInfos[0].Certificate
  if (
    $certificate.Subject -ne $publisher -or
    $certificate.Thumbprint -ne $thumbprint -or
    $certificate.HasPrivateKey
  ) {
    throw "Derived public certificate does not match the accepted identity."
  }
  if (
    $certificate.NotAfter.ToUniversalTime() -ne
    [DateTime]::Parse([string]$contract.candidate.certificateNotAfterUtc).ToUniversalTime()
  ) {
    throw "Derived public certificate expiry does not match Stage 2 evidence."
  }
  [IO.File]::WriteAllBytes(
    $certificatePath,
    $certificate.Export(
      [Security.Cryptography.X509Certificates.X509ContentType]::Cert
    )
  )

  Write-Evidence "01-pre-execution.json" ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.stage-3-pre-execution"
    result = "passed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    host = [ordered]@{
      deviceName = $env:COMPUTERNAME
      manufacturer = [string]$system.Manufacturer
      model = [string]$system.Model
      admissionState = [string]$contract.host.admissionState
      installationMediaEvidencePresent = $false
    }
    transfer = [ordered]@{
      archiveSha256 = $archiveSha256
      evidenceFilesVerified = @($index.evidenceFiles).Count
      msixSha256 = Get-Sha256 -Path $msixPath
      releaseManifestSha256 = Get-Sha256 -Path $manifestPath
    }
    certificate = [ordered]@{
      subject = $certificate.Subject
      thumbprint = $certificate.Thumbprint
      notAfterUtc = $certificate.NotAfter.ToUniversalTime().ToString("o")
      hasPrivateKey = $certificate.HasPrivateKey
      trusted = $false
      publicCertificateSha256 = Get-Sha256 -Path $certificatePath
    }
    oracleInstalled = $false
    certificateStoreMatches = 0
  })
}

function Invoke-NegativePathAndTrust {
  Assert-Elevated
  Assert-PriorPhase ([string]$contract.requalification.cleanupEvidence)
  Assert-Revision3FailureBinding
  $revision3EvidencePath = Join-Path `
    $evidenceRoot `
    ([string]$contract.requalification.negativePathEvidence)
  if (
    (Test-Path -LiteralPath $revision3EvidencePath) -or
    (Test-Path -LiteralPath "$revision3EvidencePath.sha256.txt")
  ) {
    throw "Revision 3 NegativePathAndTrust evidence already exists."
  }
  if (@(Get-CertificateMatches).Count -ne 0) {
    throw "The Stage 2 certificate is already trusted."
  }
  if ($null -ne (Get-OraclePackage)) {
    throw "Oracle is already installed."
  }

  $untrustedRejected = $false
  try {
    Add-AppxPackage -Path $msixPath -ErrorAction Stop
  } catch {
    $untrustedRejected = $true
  }
  if (-not $untrustedRejected -or $null -ne (Get-OraclePackage)) {
    throw "Windows did not reject the untrusted original package."
  }

  $imported = Import-Certificate -FilePath $certificatePath `
    -CertStoreLocation $temporaryTrustPath
  if (
    $imported.Thumbprint -ne $thumbprint -or
    $imported.Subject -ne $publisher -or
    $imported.HasPrivateKey
  ) {
    Remove-OracleCertificate
    throw "Temporary trust imported an unexpected certificate."
  }

  $acceptedSignature = Get-AuthenticodeSignature -LiteralPath $msixPath
  if (
    [string]$acceptedSignature.Status -ne "Valid" -or
    $null -eq $acceptedSignature.SignerCertificate -or
    $acceptedSignature.SignerCertificate.Thumbprint -ne $thumbprint
  ) {
    Remove-OracleCertificate
    throw "The accepted MSIX is not valid under the temporary trust."
  }

  Copy-Item -LiteralPath $msixPath -Destination $tamperedPath
  [byte[]]$bytes = [IO.File]::ReadAllBytes($tamperedPath)
  $offset = [Math]::Max(0, $bytes.Length - 512)
  $bytes[$offset] = $bytes[$offset] -bxor 1
  [IO.File]::WriteAllBytes($tamperedPath, $bytes)
  $tamperedRejected = $false
  try {
    Add-AppxPackage -Path $tamperedPath -ErrorAction Stop
  } catch {
    $tamperedRejected = $true
  }
  Remove-Item -LiteralPath $tamperedPath -Force -ErrorAction SilentlyContinue
  if (-not $tamperedRejected -or $null -ne (Get-OraclePackage)) {
    Remove-OracleCertificate
    throw "Windows did not reject the tampered package."
  }

  $matches = @(Get-CertificateMatches)
  if (
    $matches.Count -ne 1 -or
    $matches[0].location -ne $temporaryTrustLocation -or
    $matches[0].store -ne $temporaryTrustStore -or
    $matches[0].hasPrivateKey
  ) {
    Remove-OracleCertificate
    throw "Temporary certificate trust is broader than declared."
  }
  $logicalViews = @(Get-LogicalCertificateViews)
  $unexpectedLogicalViews = @(
    $logicalViews |
      Where-Object {
        -not (
          $_.store -eq $temporaryTrustStore -and
          $_.location -in @("CurrentUser", "LocalMachine") -and
          -not $_.hasPrivateKey
        )
      }
  )
  if ($unexpectedLogicalViews.Count -ne 0) {
    Remove-OracleCertificate
    throw "Temporary certificate trust has an unexpected logical projection."
  }

  Write-Evidence `
    ([string]$contract.requalification.negativePathEvidence) `
    ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.stage-3-negative-path-and-trust-r4"
    result = "passed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    revision = 4
    revision2FailureRecordSha256 = Get-Sha256 `
      -Path $revision2FailurePath
    revision3FailureRecordSha256 = Get-Sha256 `
      -Path $revision3FailurePath
    untrustedOriginalRejected = $untrustedRejected
    acceptedOriginalSignatureStatus = [string]$acceptedSignature.Status
    acceptedOriginalSignerThumbprint = `
      $acceptedSignature.SignerCertificate.Thumbprint
    tamperedCopyRejected = $tamperedRejected
    acceptedPackageModified = $false
    physicalTemporaryTrust = $matches
    logicalTrustViews = $logicalViews
    inheritedLogicalProjectionCount = @(
      $logicalViews |
        Where-Object { $_.location -eq "CurrentUser" }
    ).Count
    privateKeyPresent = $false
    })
}

function Test-LoopbackAddress {
  param([Parameter(Mandatory = $true)][string]$Address)

  if (
    $Address -eq "::1" -or
    $Address -eq "0:0:0:0:0:0:0:1" -or
    $Address.StartsWith("127.") -or
    $Address.StartsWith("::ffff:127.")
  ) {
    return $true
  }
  return $false
}

function Get-AppxActivationEvents {
  param(
    [Parameter(Mandatory = $true)][DateTime]$StartTimeUtc,
    [Parameter(Mandatory = $true)][string]$PackageFullName,
    [Parameter(Mandatory = $true)][string]$PackageFamilyName,
    [Parameter(Mandatory = $true)][int]$ProcessId
  )

  try {
    return @(
      Get-WinEvent -FilterHashtable @{
        LogName = "Microsoft-Windows-AppModel-Runtime/Admin"
        StartTime = $StartTimeUtc.ToLocalTime()
      } -ErrorAction Stop |
        Where-Object {
          $message = [string]$_.Message
          (
            $message -match [regex]::Escape($PackageFullName) -or
            $message -match [regex]::Escape($PackageFamilyName)
          ) -and
          $message -match "\b$ProcessId\b" -and
          [int]$_.Id -eq 201
        } |
        Select-Object -First 20 |
        ForEach-Object {
          [ordered]@{
            id = [int]$_.Id
            timeCreatedUtc = $_.TimeCreated.ToUniversalTime().ToString("o")
            recordId = [long]$_.RecordId
            activityId = [string]$_.ActivityId
            message = [string]$_.Message
          }
        }
    )
  } catch {
    return @()
  }
}

function Invoke-StartupMilestoneObserver {
  param(
    [Parameter(Mandatory = $true)][object]$Package,
    [Parameter(Mandatory = $true)][string]$ExecutablePath,
    [Parameter(Mandatory = $true)][string]$Purpose
  )

  $thresholds = $contract.startupObservation
  $samplingSeconds = [int]$thresholds.samplingIntervalSeconds
  $observation = [ordered]@{
    purpose = $Purpose
    activationRequestTimestampUtc = $null
    appxActivationRequestIssued = $false
    appxActivationEvents = @()
    appxActivationResult = "not-requested"
    processCreationTimestampUtc = $null
    activationLatencyMilliseconds = $null
    initialProcessId = $null
    initialProcessCreationTimestampUtc = $null
    processId = $null
    executablePath = $null
    mainWindowHandle = 0
    windowVisible = $false
    responsivenessSamples = @()
    readinessTimestampUtc = $null
    sustainedRuntimeRequiredSeconds = [int]$thresholds.sustainedRuntimeSeconds
    sustainedRuntimeObservedSeconds = 0
    activeNetworkConnections = @()
    udpEndpoints = @()
    networkIsolation = [ordered]@{
      ruleName = $networkIsolationRuleName
      exactProgramRuleVerifiedBeforeActivation = $false
      exactProgramRuleVerifiedThroughoutObservation = $false
      enforcement = "all-outbound-blocked-for-exact-installed-executable"
    }
    nonLoopbackActiveConnectionObserved = $false
    processDisappeared = $false
    processExitTimestampUtc = $null
    processExitCode = $null
    failedMilestone = $null
  }
  $script:LastStartupObservation = $observation

  if (-not (Test-OracleNetworkIsolation -ExecutablePath $ExecutablePath)) {
    $observation.failedMilestone = "network-isolation-before-activation"
    throw "Exact-program outbound network isolation is not active."
  }
  $observation.networkIsolation.exactProgramRuleVerifiedBeforeActivation = $true

  $activationRequested = [DateTime]::UtcNow
  $observation.activationRequestTimestampUtc = $activationRequested.ToString("o")
  try {
    Start-Process explorer.exe `
      -ArgumentList "shell:AppsFolder\$($Package.PackageFamilyName)!Oracle"
    $observation.appxActivationRequestIssued = $true
    $observation.appxActivationResult = "request-issued"
  } catch {
    $observation.appxActivationResult = "request-failed"
    $observation.failedMilestone = "appx-activation-request"
    throw
  }

  $processDeadline = $activationRequested.AddSeconds(
    [int]$thresholds.processCreationDeadlineSeconds
  )
  $process = $null
  while ([DateTime]::UtcNow -lt $processDeadline -and $null -eq $process) {
    Start-Sleep -Seconds $samplingSeconds
    if (-not (Test-OracleNetworkIsolation -ExecutablePath $ExecutablePath)) {
      $observation.failedMilestone = `
        "network-isolation-during-process-creation"
      throw "Exact-program outbound network isolation was lost."
    }
    $candidates = @(Get-ExactOracleProcesses -ExecutablePath $ExecutablePath)
    if ($candidates.Count -gt 0) {
      $process = $candidates |
        Sort-Object StartTime |
        Select-Object -First 1
    }
  }
  if ($null -eq $process) {
    $observation.failedMilestone = "process-creation"
    throw "Oracle process was not created within the governed deadline."
  }

  $processCreationUtc = $process.StartTime.ToUniversalTime()
  $observation.initialProcessId = [int]$process.Id
  $observation.initialProcessCreationTimestampUtc = `
    $processCreationUtc.ToString("o")

  $windowDeadline = [DateTime]::UtcNow.AddSeconds(
    [int]$thresholds.windowReadinessDeadlineSeconds
  )
  $consecutiveResponsive = 0
  $readinessProcessId = $null
  $readinessWindowHandle = [long]0
  $windowProcess = $null
  while (
    [DateTime]::UtcNow -lt $windowDeadline -and
    $consecutiveResponsive -lt [int]$thresholds.consecutiveResponsiveSamples
  ) {
    Start-Sleep -Seconds $samplingSeconds
    if (-not (Test-OracleNetworkIsolation -ExecutablePath $ExecutablePath)) {
      $observation.failedMilestone = `
        "network-isolation-during-window-readiness"
      throw "Exact-program outbound network isolation was lost."
    }
    $candidates = @(Get-ExactOracleProcesses -ExecutablePath $ExecutablePath)
    if ($candidates.Count -eq 0) {
      $observation.processDisappeared = $true
      $observation.processExitTimestampUtc = [DateTime]::UtcNow.ToString("o")
      $observation.failedMilestone = "process-survival-before-readiness"
      throw "Oracle exited before window readiness was established."
    }
    $windowCandidates = @(
      $candidates |
        Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero }
    )
    $windowProcess = $null
    if ($null -ne $readinessProcessId) {
      $windowProcess = $windowCandidates |
        Where-Object {
          $_.Id -eq [int]$readinessProcessId -and
          [long]$_.MainWindowHandle -eq $readinessWindowHandle
        } |
        Select-Object -First 1
    }
    if ($null -eq $windowProcess) {
      $windowProcess = $windowCandidates | Select-Object -First 1
    }
    if ($null -eq $windowProcess) {
      $consecutiveResponsive = 0
      $readinessProcessId = $null
      $readinessWindowHandle = [long]0
      continue
    }
    $sampleProcessId = [int]$windowProcess.Id
    $sampleWindowHandle = [long]$windowProcess.MainWindowHandle
    $sameIdentity = (
      $null -ne $readinessProcessId -and
      [int]$readinessProcessId -eq $sampleProcessId -and
      $readinessWindowHandle -eq $sampleWindowHandle
    )
    if (-not $sameIdentity) {
      $consecutiveResponsive = 0
      $readinessProcessId = $sampleProcessId
      $readinessWindowHandle = $sampleWindowHandle
    }
    $visible = [OracleStage3Window]::IsWindowVisible(
      $windowProcess.MainWindowHandle
    )
    $responsive = [bool]$windowProcess.Responding
    $sample = [ordered]@{
      timestampUtc = [DateTime]::UtcNow.ToString("o")
      processId = [int]$windowProcess.Id
      mainWindowHandle = [long]$windowProcess.MainWindowHandle
      visible = $visible
      responsive = $responsive
      stableIdentity = $sameIdentity
    }
    $observation.responsivenessSamples += @($sample)
    if ($visible -and $responsive) {
      $consecutiveResponsive += 1
    } else {
      $consecutiveResponsive = 0
    }
  }
  if (
    $null -eq $windowProcess -or
    $consecutiveResponsive -lt [int]$thresholds.consecutiveResponsiveSamples
  ) {
    $observation.failedMilestone = "visible-responsive-window-readiness"
    throw "Oracle did not establish a visible responsive window."
  }

  $observation.processId = [int]$windowProcess.Id
  $windowProcessCreationUtc = $windowProcess.StartTime.ToUniversalTime()
  $observation.processCreationTimestampUtc = `
    $windowProcessCreationUtc.ToString("o")
  $observation.activationLatencyMilliseconds = [Math]::Round(
    ($windowProcessCreationUtc - $activationRequested).TotalMilliseconds,
    0
  )
  $observation.executablePath = `
    [IO.Path]::GetFullPath([string]$windowProcess.Path)
  $observation.mainWindowHandle = [long]$windowProcess.MainWindowHandle
  $observation.windowVisible = $true
  $observation.readinessTimestampUtc = [DateTime]::UtcNow.ToString("o")
  $observation.appxActivationEvents = @(
    Get-AppxActivationEvents `
      -StartTimeUtc $activationRequested `
      -PackageFullName ([string]$Package.PackageFullName) `
      -PackageFamilyName ([string]$Package.PackageFamilyName) `
      -ProcessId ([int]$windowProcess.Id)
  )
  if ($observation.appxActivationEvents.Count -eq 0) {
    $observation.failedMilestone = "windows-appx-activation-event"
    throw "No matching Windows AppX activation event was available."
  }
  $observation.appxActivationResult = "windows-event-and-package-process-proven"

  $networkKeys = @{}
  $udpKeys = @{}
  $sustainedStarted = [DateTime]::UtcNow
  $sustainedDeadline = $sustainedStarted.AddSeconds(
    [int]$thresholds.sustainedRuntimeSeconds
  )
  while ([DateTime]::UtcNow -lt $sustainedDeadline) {
    Start-Sleep -Seconds $samplingSeconds
    $current = Get-Process -Id $windowProcess.Id -ErrorAction SilentlyContinue
    if ($null -eq $current) {
      $observation.processDisappeared = $true
      $observation.processExitTimestampUtc = [DateTime]::UtcNow.ToString("o")
      $observation.failedMilestone = "sustained-runtime-process-survival"
      throw "Oracle exited during the sustained-runtime interval."
    }
    $visible = [OracleStage3Window]::IsWindowVisible(
      $current.MainWindowHandle
    )
    if (
      $current.MainWindowHandle -eq [IntPtr]::Zero -or
      -not $visible -or
      -not [bool]$current.Responding
    ) {
      $observation.failedMilestone = "sustained-runtime-window-readiness"
      throw "Oracle lost visible responsive window readiness."
    }
    $allOracleProcesses = @(
      Get-ExactOracleProcesses -ExecutablePath $ExecutablePath
    )
    if (-not (Test-OracleNetworkIsolation -ExecutablePath $ExecutablePath)) {
      $observation.failedMilestone = "network-isolation-during-observation"
      throw "Exact-program outbound network isolation was lost."
    }
    $connections = @()
    $udpEndpoints = @()
    foreach ($oracleProcess in $allOracleProcesses) {
      $connections += @(
        Get-NetTCPConnection -OwningProcess $oracleProcess.Id `
          -ErrorAction SilentlyContinue
      )
      $udpEndpoints += @(
        Get-NetUDPEndpoint -OwningProcess $oracleProcess.Id `
          -ErrorAction SilentlyContinue
      )
    }
    foreach ($endpoint in $udpEndpoints) {
      $key = "{0}|{1}|{2}" -f `
        $endpoint.OwningProcess,
        $endpoint.LocalAddress,
        $endpoint.LocalPort
      if (-not $udpKeys.ContainsKey($key)) {
        $udpKeys[$key] = $true
        $observation.udpEndpoints += @([ordered]@{
          owningProcess = [int]$endpoint.OwningProcess
          localAddress = [string]$endpoint.LocalAddress
          localPort = [int]$endpoint.LocalPort
          outboundTrafficPreventedByFirewall = $true
        })
      }
    }
    foreach ($connection in $connections) {
      $key = "{0}|{1}|{2}|{3}|{4}|{5}" -f `
        $connection.OwningProcess,
        $connection.LocalAddress,
        $connection.LocalPort,
        $connection.RemoteAddress,
        $connection.RemotePort,
        $connection.State
      if (-not $networkKeys.ContainsKey($key)) {
        $networkKeys[$key] = $true
        $observation.activeNetworkConnections += @([ordered]@{
          owningProcess = [int]$connection.OwningProcess
          localAddress = [string]$connection.LocalAddress
          localPort = [int]$connection.LocalPort
          remoteAddress = [string]$connection.RemoteAddress
          remotePort = [int]$connection.RemotePort
          state = [string]$connection.State
        })
      }
      if (
        [string]$connection.State -eq "Established" -and
        -not (Test-LoopbackAddress -Address ([string]$connection.RemoteAddress))
      ) {
        $observation.nonLoopbackActiveConnectionObserved = $true
        $observation.failedMilestone = "non-loopback-active-network-connection"
        throw "Oracle established a prohibited non-loopback connection."
      }
    }
    $observation.sustainedRuntimeObservedSeconds = [Math]::Floor(
      ([DateTime]::UtcNow - $sustainedStarted).TotalSeconds
    )
  }
  if (-not (Test-OracleNetworkIsolation -ExecutablePath $ExecutablePath)) {
    $observation.failedMilestone = "network-isolation-after-observation"
    throw "Exact-program outbound network isolation was not preserved."
  }
  $observation.networkIsolation.exactProgramRuleVerifiedThroughoutObservation =
    $true

  return [pscustomobject]@{
    evidence = $observation
    processId = [int]$windowProcess.Id
  }
}

function Close-AllExactOracleProcesses {
  param(
    [Parameter(Mandatory = $true)][string]$ExecutablePath,
    [Parameter(Mandatory = $false)][Nullable[int]]$PreferredProcessId
  )

  $result = [ordered]@{
    closeRequestedUtc = [DateTime]::UtcNow.ToString("o")
    matchingProcessIdsBefore = @()
    primaryProcessId = $null
    closeMainWindowAccepted = $false
    graceful = $false
    exitCodeAvailable = $false
    exitCodeUnavailableReason = $null
    orderlyClassification = "not-attempted"
    forcedProcessIds = @()
    exitTimestampUtc = $null
    exitCode = $null
    matchingProcessIdsAfter = @()
    unresolvedOracleProcessIdsAfter = @()
    zeroMatchingProcessesVerified = $false
  }

  $matchingBefore = @(
    Get-ExactOracleProcesses -ExecutablePath $ExecutablePath
  )
  $result.matchingProcessIdsBefore = @(
    $matchingBefore | ForEach-Object { [int]$_.Id }
  )
  if ($matchingBefore.Count -eq 0) {
    Start-Sleep -Seconds 5
    $matchingBefore = @(
      Get-ExactOracleProcesses -ExecutablePath $ExecutablePath
    )
    $result.matchingProcessIdsBefore = @(
      $matchingBefore | ForEach-Object { [int]$_.Id }
    )
    if ($matchingBefore.Count -eq 0) {
      $result.orderlyClassification = "no-matching-process-present"
      $result.exitTimestampUtc = [DateTime]::UtcNow.ToString("o")
      $result.unresolvedOracleProcessIdsAfter = @(
        Get-UnresolvedOracleProcessIds -ExecutablePath $ExecutablePath
      )
      $result.zeroMatchingProcessesVerified =
        $result.unresolvedOracleProcessIdsAfter.Count -eq 0
      return $result
    }
  }

  $primary = $null
  if ($null -ne $PreferredProcessId) {
    $primary = $matchingBefore |
      Where-Object { $_.Id -eq [int]$PreferredProcessId } |
      Select-Object -First 1
  }
  if ($null -eq $primary) {
    $primary = $matchingBefore |
      Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } |
      Select-Object -First 1
  }
  if ($null -eq $primary) {
    $primary = $matchingBefore | Select-Object -First 1
  }
  $result.primaryProcessId = [int]$primary.Id
  $result.closeMainWindowAccepted = [bool]$primary.CloseMainWindow()

  $deadline = [DateTime]::UtcNow.AddSeconds(
    [int]$contract.startupObservation.gracefulCloseDeadlineSeconds
  )
  while (
    [DateTime]::UtcNow -lt $deadline -and
    @(Get-ExactOracleProcesses -ExecutablePath $ExecutablePath).Count -ne 0
  ) {
    Start-Sleep -Seconds 1
  }

  $remaining = @(
    Get-ExactOracleProcesses -ExecutablePath $ExecutablePath
  )
  if ($remaining.Count -eq 0) {
    $result.exitTimestampUtc = [DateTime]::UtcNow.ToString("o")
    try {
      $result.exitCode = [int]$primary.ExitCode
      $result.exitCodeAvailable = $true
    } catch {
      $result.exitCode = $null
      $result.exitCodeUnavailableReason = [string]$_.Exception.Message
    }
    if ($result.closeMainWindowAccepted) {
      if ($result.exitCodeAvailable -and [int]$result.exitCode -eq 0) {
        $result.graceful = $true
        $result.orderlyClassification = "graceful-zero-exit-code"
      } elseif (-not $result.exitCodeAvailable) {
        $result.graceful = $true
        $result.orderlyClassification = `
          "graceful-exit-code-unavailable-all-processes-closed"
      } else {
        $result.orderlyClassification = "graceful-nonzero-exit-code"
      }
    } else {
      $result.orderlyClassification = `
        "processes-exited-without-accepted-close-request"
    }
  } else {
    $result.forcedProcessIds = @(
      $remaining | ForEach-Object { [int]$_.Id }
    )
    foreach ($exactProcess in $remaining) {
      Stop-Process -Id $exactProcess.Id -Force -ErrorAction SilentlyContinue
    }
    $forcedDeadline = [DateTime]::UtcNow.AddSeconds(10)
    while (
      [DateTime]::UtcNow -lt $forcedDeadline -and
      @(Get-ExactOracleProcesses -ExecutablePath $ExecutablePath).Count -ne 0
    ) {
      Start-Sleep -Milliseconds 250
    }
    $result.exitTimestampUtc = [DateTime]::UtcNow.ToString("o")
    $result.orderlyClassification = "forced-exact-process-cleanup"
  }

  $matchingAfter = @(
    Get-ExactOracleProcesses -ExecutablePath $ExecutablePath
  )
  Start-Sleep -Seconds 5
  $lateProcesses = @(
    Get-ExactOracleProcesses -ExecutablePath $ExecutablePath
  )
  if ($lateProcesses.Count -ne 0) {
    $lateIds = @($lateProcesses | ForEach-Object { [int]$_.Id })
    $result.forcedProcessIds = @(
      @($result.forcedProcessIds) + $lateIds |
        Select-Object -Unique
    )
    foreach ($lateProcess in $lateProcesses) {
      Stop-Process -Id $lateProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
    $result.graceful = $false
    $result.orderlyClassification = "forced-late-process-cleanup"
  }
  $matchingAfter = @(
    Get-ExactOracleProcesses -ExecutablePath $ExecutablePath
  )
  $result.matchingProcessIdsAfter = @(
    $matchingAfter | ForEach-Object { [int]$_.Id }
  )
  $result.unresolvedOracleProcessIdsAfter = @(
    Get-UnresolvedOracleProcessIds -ExecutablePath $ExecutablePath
  )
  $result.zeroMatchingProcessesVerified = (
    $result.matchingProcessIdsAfter.Count -eq 0 -and
    $result.unresolvedOracleProcessIdsAfter.Count -eq 0
  )
  return $result
}

function Invoke-InstallAndStartup {
  throw (
    "InstallAndStartup is the immutable Revision 4 historical phase and " +
    "must not be rerun. Use InstallAndStartupContinuation only under " +
    "separate Founder execution authority."
  )
}

function Invoke-InstallAndStartupContinuation {
  param([switch]$RecoveryMode)

  Assert-Elevated
  if (
    [int]$contract.qualificationKitRevision -ge 6 -and
    -not $RecoveryMode
  ) {
    throw (
      "Legacy Revision 5 continuation is prohibited in the Revision 6 kit."
    )
  }

  $diagnosticName = if ($RecoveryMode) {
    "03a-install-and-startup-r6-recovery-diagnostic.json"
  } else {
    "03a-install-and-startup-r5-diagnostic.json"
  }
  $diagnosticContract = if ($RecoveryMode) {
    "oracle.sprint-30-5.stage-3-install-and-startup-r6-recovery-diagnostic"
  } else {
    "oracle.sprint-30-5.stage-3-install-and-startup-r5-diagnostic"
  }
  $finalisationFailureName = if ($RecoveryMode) {
    "03b-install-and-startup-r6-recovery-finalisation-failure.json"
  } else {
    "03b-install-and-startup-r5-finalisation-failure.json"
  }
  $finalisationFailureContract = if ($RecoveryMode) {
    "oracle.sprint-30-5.stage-3-install-and-startup-r6-recovery-finalisation-failure"
  } else {
    "oracle.sprint-30-5.stage-3-install-and-startup-r5-finalisation-failure"
  }
  $canonicalName = "03-install-and-startup.json"
  $diagnosticPath = Join-Path $evidenceRoot $diagnosticName
  $canonicalPath = Join-Path $evidenceRoot $canonicalName
  if (
    (Test-Path -LiteralPath $diagnosticPath) -or
    (Test-Path -LiteralPath "$diagnosticPath.sha256.txt")
  ) {
    throw "Continuation diagnostic evidence already exists. Refusing overwrite."
  }
  if (
    (Test-Path -LiteralPath $canonicalPath) -or
    (Test-Path -LiteralPath "$canonicalPath.sha256.txt")
  ) {
    throw "Canonical Phase 03 evidence already exists. Refusing continuation."
  }

  $diagnostic = [ordered]@{
    schemaVersion = 1
    contract = $diagnosticContract
    revision = if ($RecoveryMode) { 6 } else { 5 }
    result = "failed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    failedMilestone = "preconditions"
    failureMessage = $null
    revision4PreservedAsFailure = $true
    automaticReinstallAttempted = $false
    preconditions = [ordered]@{}
    package = $null
    certificate = $null
    finalCertificateRevalidation = $null
    networkIsolation = [ordered]@{
      strategy = "exact-program-outbound-firewall-block"
      enabled = $null
      removal = $null
    }
    observation = $null
    founderConfirmations = [ordered]@{
      windowVisiblyPresent = $null
      expectedLocalQualificationInterface = $null
      normalInteractionResponsive = $null
      visibleInterfaceFreeOfError = $null
    }
    closure = $null
    canonicalPhase03Eligible = $false
  }
  $observedProcessId = $null
  $exactExecutablePath = $null
  $networkIsolationCreated = $false
  $networkIsolationRemoved = $false
  $processCleanupCompleted = $false
  $diagnosticFinalized = $false
  $script:LastStartupObservation = $null

  try {
    $system = Assert-AdmittedHost
    $diagnostic.preconditions.hostIdentity = $true
    Assert-Revision4FailureBinding
    $diagnostic.preconditions.revision4FailureRecord = $true
    if ($RecoveryMode) {
      Assert-Revision5FailureBinding
      Assert-PriorPhase -Filename "00a-recovery-restoration.json"
      Assert-PriorPhase -Filename "00b-recovery-continuation-preflight.json"
      $diagnostic.preconditions.revision5FailedAttempt = $true
      $diagnostic.preconditions.recoveryRestoration = $true
      $diagnostic.preconditions.recoveryContinuationPreflight = $true
    }
    if ($RecoveryMode) {
      Assert-HistoricalEvidenceHash `
        -HistoryDirectory "revision-4" `
        -Filename (
          [string]$contract.recovery.requiredRevision4Evidence.filename
        ) `
        -ExpectedSha256 (
          [string]$contract.recovery.requiredRevision4Evidence.sha256
        )
    } else {
      Assert-EvidenceHash `
        -Filename (
          [string]$contract.requalification.revision4NegativePathEvidence
        ) `
        -ExpectedSha256 (
          [string]$contract.requalification.revision4NegativePathEvidenceSha256
        )
    }
    $diagnostic.preconditions.revision4NegativePathEvidence = $true

    if (-not (Test-Path -LiteralPath $msixPath -PathType Leaf)) {
      throw "The frozen Stage 2 MSIX is missing."
    }
    $msixSha256 = Get-Sha256 -Path $msixPath
    if ($msixSha256 -ne [string]$contract.candidate.msixSha256) {
      throw "The frozen Stage 2 MSIX hash changed."
    }
    $diagnostic.preconditions.frozenMsix = $true

    $packages = @(Get-OraclePackage)
    if ($packages.Count -ne 1) {
      throw "Continuation requires exactly one existing installed Oracle package."
    }
    $package = $packages[0]
    if (
      [string]$package.Name -ne [string]$contract.candidate.packageIdentity -or
      [string]$package.PackageFullName -ne
        [string]$contract.candidate.packageFullName -or
      [string]$package.Version -ne [string]$contract.candidate.packageVersion -or
      [string]$package.Publisher -ne $publisher -or
      [string]$package.Architecture -ine
        [string]$contract.candidate.packageArchitecture -or
      [string]$package.Status -ine [string]$contract.candidate.packageStatus
    ) {
      throw "Installed package identity, version, publisher, architecture or status is invalid."
    }
    $diagnostic.preconditions.installedPackage = $true

    $executablePath = Join-Path `
      ([string]$package.InstallLocation) `
      ([string]$contract.candidate.installedExecutable)
    $exactExecutablePath = [IO.Path]::GetFullPath($executablePath)
    if (-not (Test-Path -LiteralPath $executablePath -PathType Leaf)) {
      throw "Installed Oracle executable is missing."
    }
    $executableSha256 = Get-Sha256 -Path $executablePath
    if (
      $executableSha256 -ne
      [string]$contract.candidate.installedExecutableSha256
    ) {
      throw "Installed Oracle executable hash mismatch."
    }
    $signature = Get-AuthenticodeSignature -LiteralPath $executablePath
    if (
      [string]$signature.Status -ne "Valid" -or
      $null -eq $signature.SignerCertificate -or
      [string]$signature.SignerCertificate.Subject -ne $publisher -or
      [string]$signature.SignerCertificate.Thumbprint -ne $thumbprint
    ) {
      throw "Installed Oracle executable signature or signer is invalid."
    }
    $diagnostic.preconditions.installedExecutable = $true

    $certificateState = Assert-BoundedCertificateTrust `
      -MinimumMinutesRemaining (
        [int]$contract.startupObservation.minimumCertificateMinutesRemaining
      )
    $diagnostic.preconditions.boundedCertificateTrust = $true

    $alreadyRunning = @(
      Get-Process -Name "Oracle" -ErrorAction SilentlyContinue
    )
    if ($alreadyRunning.Count -ne 0) {
      throw "Oracle is already running before continuation activation."
    }
    $diagnostic.preconditions.oracleNotAlreadyRunning = $true

    $diagnostic.package = [ordered]@{
      name = [string]$package.Name
      packageFullName = [string]$package.PackageFullName
      packageFamilyName = [string]$package.PackageFamilyName
      publisher = [string]$package.Publisher
      version = [string]$package.Version
      architecture = [string]$package.Architecture
      status = [string]$package.Status
      installLocation = [string]$package.InstallLocation
      executablePath = [IO.Path]::GetFullPath($executablePath)
      executableSha256 = $executableSha256
      executableSignatureStatus = [string]$signature.Status
      executableSignerSubject = [string]$signature.SignerCertificate.Subject
      executableSignerThumbprint = `
        [string]$signature.SignerCertificate.Thumbprint
      msixSha256 = $msixSha256
    }
    $diagnostic.certificate = $certificateState

    $diagnostic.networkIsolation.enabled = Enable-OracleNetworkIsolation `
      -ExecutablePath $exactExecutablePath
    $networkIsolationCreated = $true

    $diagnostic.failedMilestone = "startup-observation"
    $observed = Invoke-StartupMilestoneObserver `
      -Package $package `
      -ExecutablePath $executablePath `
      -Purpose "InstallAndStartupContinuation"
    $diagnostic.observation = $observed.evidence
    $observedProcessId = [int]$observed.processId

    $diagnostic.failedMilestone = "founder-confirmations"
    $diagnostic.founderConfirmations.windowVisiblyPresent =
      Read-FounderConfirmation "Is the Oracle window visibly present?"
    $diagnostic.founderConfirmations.expectedLocalQualificationInterface =
      Read-FounderConfirmation `
        "Does it show the expected local-qualification/unavailable interface?"
    $diagnostic.founderConfirmations.normalInteractionResponsive =
      Read-FounderConfirmation `
        "Does the interface visibly respond to normal focus, minimise and restore interaction?"
    $diagnostic.founderConfirmations.visibleInterfaceFreeOfError =
      Read-FounderConfirmation `
        "Is the visible interface free of an error message?"

    if (
      -not (
        Test-OracleNetworkIsolation -ExecutablePath $exactExecutablePath
      )
    ) {
      throw "Network isolation was lost during Founder confirmation."
    }
    $currentWindowProcess = Get-Process `
      -Id $observedProcessId `
      -ErrorAction SilentlyContinue
    if (
      $null -eq $currentWindowProcess -or
      [IO.Path]::GetFullPath([string]$currentWindowProcess.Path) -ine
        $exactExecutablePath -or
      [long]$currentWindowProcess.MainWindowHandle -ne
        [long]$diagnostic.observation.mainWindowHandle -or
      -not [OracleStage3Window]::IsWindowVisible(
        $currentWindowProcess.MainWindowHandle
      ) -or
      -not [bool]$currentWindowProcess.Responding
    ) {
      throw "Oracle readiness changed during Founder confirmation."
    }

    $diagnostic.failedMilestone = "orderly-exit"
    $closure = Close-AllExactOracleProcesses `
      -ExecutablePath $exactExecutablePath `
      -PreferredProcessId $observedProcessId
    $processCleanupCompleted = $true
    $diagnostic.closure = $closure
    $diagnostic.observation.processExitTimestampUtc = $closure.exitTimestampUtc
    $diagnostic.observation.processExitCode = $closure.exitCode
    if (
      -not [bool]$closure.graceful -or
      -not [bool]$closure.zeroMatchingProcessesVerified -or
      @($closure.forcedProcessIds).Count -ne 0 -or
      [string]$closure.orderlyClassification -notin @(
        "graceful-zero-exit-code",
        "graceful-exit-code-unavailable-all-processes-closed"
      )
    ) {
      throw "Oracle did not complete a deterministically orderly exit."
    }

    $diagnostic.networkIsolation.removal = Disable-OracleNetworkIsolation `
      -ExecutablePath $exactExecutablePath
    $networkIsolationRemoved = $true
    $diagnostic.finalCertificateRevalidation =
      Assert-BoundedCertificateTrust -MinimumMinutesRemaining 1

    $diagnostic.result = "passed"
    $diagnostic.failedMilestone = $null
    $diagnostic.failureMessage = $null
    $diagnostic.canonicalPhase03Eligible = $true
    Write-Evidence $diagnosticName $diagnostic
    $diagnosticFinalized = $true
    $diagnosticSha256 = Get-Sha256 -Path $diagnosticPath

    $canonicalCertificateRevalidation =
      Assert-BoundedCertificateTrust -MinimumMinutesRemaining 1
    Write-Evidence $canonicalName ([ordered]@{
      schemaVersion = 1
      contract = "oracle.sprint-30-5.stage-3-install-and-startup"
      result = "passed"
      recordedAtUtc = [DateTime]::UtcNow.ToString("o")
      revision = if ($RecoveryMode) { 6 } else { 5 }
      revision4PreservedAsFailure = $true
      diagnosticEvidence = $diagnosticName
      diagnosticEvidenceSha256 = $diagnosticSha256
      package = $diagnostic.package
      certificate = $diagnostic.certificate
      certificateRevalidatedImmediatelyBeforeCanonicalEvidence = `
        $canonicalCertificateRevalidation
      observation = $diagnostic.observation
      founderConfirmations = $diagnostic.founderConfirmations
      closure = $diagnostic.closure
      automaticReinstallAttempted = $false
    })
  } catch {
    $originalFailure = [string]$_.Exception.Message
    $diagnostic.failureMessage = $originalFailure
    if ($null -ne $script:LastStartupObservation) {
      $diagnostic.observation = $script:LastStartupObservation
      if ($null -ne $diagnostic.observation.failedMilestone) {
        $diagnostic.failedMilestone = `
          [string]$diagnostic.observation.failedMilestone
      }
      if ($null -ne $diagnostic.observation.processId) {
        $observedProcessId = [int]$diagnostic.observation.processId
      }
    }
    if (
      -not $processCleanupCompleted -and
      $null -ne $exactExecutablePath
    ) {
      $diagnostic.closure = Close-AllExactOracleProcesses `
        -ExecutablePath $exactExecutablePath `
        -PreferredProcessId $observedProcessId
      $processCleanupCompleted = $true
      if ($null -ne $diagnostic.observation) {
        $diagnostic.observation.processExitTimestampUtc = `
          $diagnostic.closure.exitTimestampUtc
        $diagnostic.observation.processExitCode = `
          $diagnostic.closure.exitCode
      }
    }
    if (
      $networkIsolationCreated -and
      -not $networkIsolationRemoved -and
      $null -ne $exactExecutablePath
    ) {
      try {
        $diagnostic.networkIsolation.removal =
          Disable-OracleNetworkIsolation `
            -ExecutablePath $exactExecutablePath
        $networkIsolationRemoved = $true
      } catch {
        $diagnostic.networkIsolation.removal = [ordered]@{
          removed = $false
          failure = [string]$_.Exception.Message
        }
      }
    }

    if ($diagnosticFinalized) {
      Write-Evidence $finalisationFailureName ([ordered]@{
        schemaVersion = 1
        contract = $finalisationFailureContract
        revision = if ($RecoveryMode) { 6 } else { 5 }
        result = "failed"
        recordedAtUtc = [DateTime]::UtcNow.ToString("o")
        failureMessage = $originalFailure
        diagnosticEvidence = $diagnosticName
        diagnosticEvidenceSha256 = Get-Sha256 -Path $diagnosticPath
        diagnosticPreservedWithoutRewrite = $true
        canonicalEvidencePresent = `
          (Test-Path -LiteralPath $canonicalPath -PathType Leaf)
        canonicalSidecarPresent = `
          (Test-Path -LiteralPath "$canonicalPath.sha256.txt" -PathType Leaf)
        processCleanup = $diagnostic.closure
        networkIsolationRemoval = $diagnostic.networkIsolation.removal
      })
    } elseif (
      -not (Test-Path -LiteralPath $diagnosticPath) -and
      -not (Test-Path -LiteralPath "$diagnosticPath.sha256.txt")
    ) {
      Write-Evidence $diagnosticName $diagnostic
    } else {
      Write-Evidence $finalisationFailureName ([ordered]@{
        schemaVersion = 1
        contract = $finalisationFailureContract
        revision = if ($RecoveryMode) { 6 } else { 5 }
        result = "failed"
        recordedAtUtc = [DateTime]::UtcNow.ToString("o")
        failureMessage = $originalFailure
        diagnosticEvidencePresent = `
          (Test-Path -LiteralPath $diagnosticPath -PathType Leaf)
        diagnosticSidecarPresent = `
          (Test-Path -LiteralPath "$diagnosticPath.sha256.txt" -PathType Leaf)
        diagnosticPreservedWithoutRewrite = $true
        canonicalEvidencePresent = `
          (Test-Path -LiteralPath $canonicalPath -PathType Leaf)
        canonicalSidecarPresent = `
          (Test-Path -LiteralPath "$canonicalPath.sha256.txt" -PathType Leaf)
        processCleanup = $diagnostic.closure
        networkIsolationRemoval = $diagnostic.networkIsolation.removal
      })
    }
    throw
  }
}

function Invoke-Revision2TrustCleanup {
  Assert-Elevated
  $cleanupEvidencePath = Join-Path `
    $evidenceRoot `
    ([string]$contract.requalification.cleanupEvidence)
  if (
    (Test-Path -LiteralPath $cleanupEvidencePath) -or
    (Test-Path -LiteralPath "$cleanupEvidencePath.sha256.txt")
  ) {
    throw "Revision 2 trust-cleanup evidence already exists."
  }
  Assert-EvidenceHash `
    -Filename "01-pre-execution.json" `
    -ExpectedSha256 ([string]$revision2Failure.evidence.preExecutionSha256)
  Assert-EvidenceHash `
    -Filename "02-negative-path-and-trust.json" `
    -ExpectedSha256 ([string]$revision2Failure.evidence.negativePathSha256)

  $phase3Path = Join-Path $evidenceRoot "03-install-and-startup.json"
  if (
    (Test-Path -LiteralPath $phase3Path) -or
    (Test-Path -LiteralPath "$phase3Path.sha256.txt")
  ) {
    throw "Revision 2 unexpectedly produced InstallAndStartup evidence."
  }
  if ($null -ne (Get-OraclePackage)) {
    throw "Oracle is unexpectedly installed before Revision 2 trust cleanup."
  }
  if (@(Get-Process -Name "Oracle" -ErrorAction SilentlyContinue).Count -ne 0) {
    throw "Oracle is unexpectedly running before Revision 2 trust cleanup."
  }
  if ((Get-Sha256 -Path $msixPath) -ne [string]$contract.candidate.msixSha256) {
    throw "The accepted MSIX changed before Revision 2 trust cleanup."
  }

  $activityId = [Guid]([string]$revision2Failure.deploymentFailure.activityId)
  $deploymentLog = @(Get-AppPackageLog -ActivityID $activityId)
  $deploymentMessages = @(
    $deploymentLog |
      ForEach-Object { [string]$_.Message }
  )
  $trustFailureMessages = @(
    $deploymentMessages |
      Where-Object {
        $_ -match "0x800B0109" -and
        $_ -match "root certificate"
      }
  )
  if ($trustFailureMessages.Count -eq 0) {
    throw "Revision 2 deployment failure is unavailable or does not match."
  }

  $matchesBefore = @(Get-CertificateMatches)
  if (
    $matchesBefore.Count -ne 1 -or
    $matchesBefore[0].location -ne $obsoleteTrustLocation -or
    $matchesBefore[0].store -ne $obsoleteTrustStore -or
    $matchesBefore[0].hasPrivateKey
  ) {
    throw "Revision 2 trust state does not match the preserved failure record."
  }

  Remove-Item `
    -LiteralPath `
      "Cert:\$obsoleteTrustLocation\$obsoleteTrustStore\$thumbprint" `
    -Force

  $matchesAfter = @(Get-CertificateMatches)
  if ($matchesAfter.Count -ne 0) {
    throw "Obsolete Revision 2 certificate trust remains after cleanup."
  }

  Write-Evidence `
    ([string]$contract.requalification.cleanupEvidence) `
    ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.stage-3-revision-2-trust-cleanup"
    result = "passed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    revision = 3
    revision2Failure = [ordered]@{
      activityId = [string]$revision2Failure.deploymentFailure.activityId
      hresult = [string]$revision2Failure.deploymentFailure.hresult
      deploymentLogRecordCount = $deploymentLog.Count
      deploymentMessages = $deploymentMessages
      readOnlyCaptureSha256 = `
        [string]$revision2Failure.evidence.readOnlyStateCaptureSha256
      preExecutionSha256 = `
        [string]$revision2Failure.evidence.preExecutionSha256
      negativePathSha256 = `
        [string]$revision2Failure.evidence.negativePathSha256
    }
    obsoleteTrustBefore = $matchesBefore
    obsoleteTrustRemoved = $true
    certificateStoreMatchesAfter = $matchesAfter
    oracleInstalled = $false
    oracleProcessCount = 0
    acceptedMsixSha256 = Get-Sha256 -Path $msixPath
    originalEvidencePreserved = $true
    nextPermittedPhase = "NegativePathAndTrust"
    })
}

function Invoke-RepairAndRemoval {
  Assert-Elevated
  Assert-PriorPhase "03-install-and-startup.json"
  $package = Get-OraclePackage
  if ($null -eq $package) {
    throw "Oracle is not installed before repair/reset."
  }
  Reset-AppxPackage -Package $package.PackageFullName
  $package = Get-OraclePackage
  if ($null -eq $package) {
    throw "Repair/reset removed the accepted package; automatic reinstall is forbidden."
  }
  if (
    $null -eq $package -or
    [string]$package.Version -ne [string]$contract.candidate.packageVersion
  ) {
    throw "Repair/reset did not preserve the accepted package identity."
  }

  $executablePath = Join-Path `
    ([string]$package.InstallLocation) `
    ([string]$contract.candidate.installedExecutable)
  if (
    -not (Test-Path -LiteralPath $executablePath -PathType Leaf) -or
    (Get-Sha256 -Path $executablePath) -ne
      [string]$contract.candidate.installedExecutableSha256
  ) {
    throw "Repair/reset did not preserve the accepted Oracle executable."
  }
  $script:LastStartupObservation = $null
  $repairIsolation = Enable-OracleNetworkIsolation `
    -ExecutablePath $executablePath
  $repairIsolationRemoved = $false
  $repairProcessCleanupCompleted = $false
  try {
    $observed = Invoke-StartupMilestoneObserver `
      -Package $package `
      -ExecutablePath $executablePath `
      -Purpose "RepairAndRemovalRelaunch"
    $failClosed = Read-FounderConfirmation `
      "Oracle still shows the approved fail-closed local state after repair/reset"
    $closure = Close-AllExactOracleProcesses `
      -ExecutablePath $executablePath `
      -PreferredProcessId ([int]$observed.processId)
    $repairProcessCleanupCompleted = $true
    $repairIsolationRemoval = Disable-OracleNetworkIsolation `
      -ExecutablePath $executablePath
    $repairIsolationRemoved = $true
  } finally {
    if (-not $repairProcessCleanupCompleted) {
      $closure = Close-AllExactOracleProcesses `
        -ExecutablePath $executablePath
      $repairProcessCleanupCompleted = $true
    }
    if (-not $repairIsolationRemoved) {
      $repairIsolationRemoval = Disable-OracleNetworkIsolation `
        -ExecutablePath $executablePath
      $repairIsolationRemoved = $true
    }
  }
  if (
    -not [bool]$closure.graceful -or
    -not [bool]$closure.zeroMatchingProcessesVerified -or
    @($closure.forcedProcessIds).Count -ne 0 -or
    [string]$closure.orderlyClassification -notin @(
      "graceful-zero-exit-code",
      "graceful-exit-code-unavailable-all-processes-closed"
    )
  ) {
    throw "Oracle did not close orderly after repair/reset relaunch."
  }

  $packageFullName = $package.PackageFullName
  $packageFamilyName = $package.PackageFamilyName
  Remove-AppxPackage -Package $packageFullName -Confirm:$false
  if ($null -ne (Get-OraclePackage)) {
    throw "Oracle remains registered after uninstall."
  }

  Write-Evidence "04-repair-and-removal.json" ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.stage-3-repair-and-removal"
    result = "passed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    resetCompleted = $true
    sameIdentityPreserved = $true
    relaunchCompleted = $true
    relaunchObservation = $observed.evidence
    relaunchClosure = $closure
    networkIsolation = $repairIsolation
    networkIsolationRemoval = $repairIsolationRemoval
    founderFailClosedConfirmation = $failClosed
    packageFullName = $packageFullName
    packageFamilyName = $packageFamilyName
    uninstalled = $true
    packageRegistrationRemaining = $false
  })
}

function Invoke-Cleanup {
  Assert-Elevated
  Assert-PriorPhase "04-repair-and-removal.json"
  $remainingPackage = Get-OraclePackage
  if ($null -ne $remainingPackage) {
    Remove-AppxPackage -Package $remainingPackage.PackageFullName `
      -Confirm:$false -ErrorAction SilentlyContinue
  }
  Stop-Process -Name "Oracle" -Force -ErrorAction SilentlyContinue
  Remove-OracleCertificate
  Remove-Item -LiteralPath $tamperedPath -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $certificatePath -Force -ErrorAction SilentlyContinue

  $packageRemaining = $null -ne (Get-OraclePackage)
  $certificateMatches = @(Get-CertificateMatches)
  $logicalCertificateViews = @(Get-LogicalCertificateViews)
  $oracleProcesses = @(Get-Process -Name "Oracle" -ErrorAction SilentlyContinue)
  if (
    $packageRemaining -or
    $certificateMatches.Count -ne 0 -or
    $logicalCertificateViews.Count -ne 0 -or
    $oracleProcesses.Count -ne 0
  ) {
    throw "Cleanup left package, certificate or process residue."
  }

  Write-Evidence "05-cleanup.json" ([ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.stage-3-cleanup"
    result = "passed"
    recordedAtUtc = [DateTime]::UtcNow.ToString("o")
    packageRemaining = $packageRemaining
    certificateStoreMatches = $certificateMatches
    logicalCertificateViews = $logicalCertificateViews
    oracleProcessCount = $oracleProcesses.Count
    privateKeyMaterialTransferred = $false
    evidencePreserved = $true
    stage4Started = $false
  })
}

switch ($Phase) {
  "PreExecution" { Invoke-PreExecution }
  "Revision2TrustCleanup" { Invoke-Revision2TrustCleanup }
  "NegativePathAndTrust" { Invoke-NegativePathAndTrust }
  "InstallAndStartup" { Invoke-InstallAndStartup }
  "InstallAndStartupContinuation" {
    Invoke-InstallAndStartupContinuation
  }
  "RecoveryContinuationPreflight" {
    Invoke-RecoveryContinuationPreflight
  }
  "InstallAndStartupRecoveryContinuation" {
    Invoke-InstallAndStartupContinuation -RecoveryMode
  }
  "RepairAndRemoval" { Invoke-RepairAndRemoval }
  "Cleanup" { Invoke-Cleanup }
}
