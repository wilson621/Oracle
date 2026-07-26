[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$HostAdmissionPath,

  [Parameter(Mandatory = $true)]
  [string]$BaselineRecoveryDocumentPath,

  [Parameter(Mandatory = $true)]
  [string]$CompensatingControlsPath,

  [Parameter(Mandatory = $false)]
  [string]$OutputDirectory = (Join-Path $PSScriptRoot "evidence-output")
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$expectedAdmissionSha256 =
  "6dfaa176ed2d43595511d44401612536c6c0f1955f94527469d0f22af09c3b0e"
$expectedBaselineSha256 =
  "6674b900fccadcc8f6d476dda6a787f859aad948dc78033dbfb7793ac90e8d44"
$expectedDeviceName = "Founder-QA-01"
$expectedManufacturer = "MEDION"
$expectedModel = "ERAZER P6605 MD61596"
$mediaCheckName = "installationMediaEvidencePresent"

function Get-Sha256 {
  param([Parameter(Mandatory = $true)][string]$Path)

  (
    Get-FileHash -LiteralPath $Path -Algorithm SHA256
  ).Hash.ToLowerInvariant()
}

function Get-FalsePropertyNames {
  param([Parameter(Mandatory = $true)][object]$Value)

  @($Value.PSObject.Properties |
    Where-Object { -not [bool]$_.Value } |
    ForEach-Object { $_.Name })
}

function Write-JsonEvidence {
  param(
    [Parameter(Mandatory = $true)]
    [object]$Value,

    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  $Value | ConvertTo-Json -Depth 12 |
    Set-Content -LiteralPath $Path -Encoding UTF8
}

$resolvedAdmissionPath = (Resolve-Path -LiteralPath $HostAdmissionPath).Path
$resolvedBaselinePath = (
  Resolve-Path -LiteralPath $BaselineRecoveryDocumentPath
).Path
$resolvedControlsPath = (
  Resolve-Path -LiteralPath $CompensatingControlsPath
).Path
$resolvedOutputDirectory = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $resolvedOutputDirectory -Force | Out-Null

$admissionSha256 = Get-Sha256 -Path $resolvedAdmissionPath
$baselineSha256 = Get-Sha256 -Path $resolvedBaselinePath
$controlsSha256 = Get-Sha256 -Path $resolvedControlsPath

$admission = Get-Content -LiteralPath $resolvedAdmissionPath -Raw |
  ConvertFrom-Json
$controls = Get-Content -LiteralPath $resolvedControlsPath -Raw |
  ConvertFrom-Json

$admissionFailedChecks = @($admission.failedChecks)
$falseMandatoryChecks = @(Get-FalsePropertyNames -Value $admission.mandatoryChecks)
$falseTechnicalChecks = @($falseMandatoryChecks | Where-Object {
  $_ -ne $mediaCheckName
})
$falseFounderConfirmations = @(
  Get-FalsePropertyNames -Value $admission.founderConfirmations
)
$falseCompensatingChecks = @(Get-FalsePropertyNames -Value $controls.checks)

$checks = [ordered]@{
  admissionHashMatches =
    $admissionSha256 -eq $expectedAdmissionSha256
  admissionContractMatches =
    [string]$admission.contract -eq
    "oracle.sprint-30-5.stage-3-host-admission"
  admissionCollectorRevisionMatches =
    [int]$admission.collector.revision -eq 3
  deviceNameMatches =
    [string]$admission.host.deviceName -eq $expectedDeviceName
  manufacturerMatches =
    [string]$admission.host.manufacturer -eq $expectedManufacturer
  modelMatches =
    [string]$admission.host.model -eq $expectedModel
  baselineHashMatches =
    $baselineSha256 -eq $expectedBaselineSha256
  installationMediaEvidenceRemainsFalse =
    -not [bool]$admission.mandatoryChecks.$mediaCheckName
  soleFailedAdmissionCheckIsMedia =
    $admissionFailedChecks.Count -eq 1 -and
    [string]$admissionFailedChecks[0] -eq $mediaCheckName
  allTechnicalAdmissionChecksPass =
    $falseTechnicalChecks.Count -eq 0
  allFounderConfirmationsPass =
    $falseFounderConfirmations.Count -eq 0
  controlsContractMatches =
    [string]$controls.contract -eq
    "oracle.sprint-30-5.stage-3-compensating-controls"
  controlsAdmissionBindingMatches =
    [string]$controls.binding.hostAdmissionSha256 -eq
    $expectedAdmissionSha256
  controlsBaselineBindingMatches =
    [string]$controls.binding.baselineRecoveryDocumentSha256 -eq
    $expectedBaselineSha256
  controlsPreserveMissingMedia =
    -not [bool]$controls.binding.installationMediaEvidencePresent
  controlsResultPasses =
    [string]$controls.result -eq "passed"
  allCompensatingChecksPass =
    $falseCompensatingChecks.Count -eq 0
  dismPasses =
    [bool]$controls.controls.dism.noCorruptionDetected -and
    [int]$controls.controls.dism.exitCode -eq 0
  sfcPasses =
    [bool]$controls.controls.sfc.noIntegrityViolations -and
    [int]$controls.controls.sfc.exitCode -eq 0
  defenderPasses =
    [bool]$controls.controls.defender.passed -and
    [bool]$controls.controls.defender.quickScanCompleted -and
    [bool]$controls.controls.defender.healthy -and
    [bool]$controls.controls.defender.threatEvidenceComplete -and
    [int]$controls.controls.defender.activeThreatCount -eq 0 -and
    [int]$controls.controls.defender.newDetectionCount -eq 0
  controlsCannotGrantAdmission =
    -not [bool]$controls.authority.grantsHostAdmission
  controlsCannotGrantStage3 =
    -not [bool]$controls.authority.grantsStage3Authority
  controlsMaximumStateIsBounded =
    [string]$controls.authority.maximumDownstreamState -eq
    "eligible-for-founder-approval"
}

$failedChecks = @(
  $checks.GetEnumerator() |
    Where-Object { -not $_.Value } |
    ForEach-Object { $_.Key }
)
$candidateState = if ($failedChecks.Count -eq 0) {
  "eligible-for-founder-approval"
} else {
  "not-eligible"
}

$evaluatorPath = $MyInvocation.MyCommand.Path
$candidate = [ordered]@{
  schemaVersion = 1
  contract = "oracle.sprint-30-5.stage-3-provenance-exception-candidate"
  contractVersion = 1
  evaluatedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
  state = $candidateState
  maximumState = "eligible-for-founder-approval"
  admissionGranted = $false
  stage3AuthorityGranted = $false
  founderApprovalRequired = $true
  exception = [ordered]@{
    identifier =
      "sprint-30-5-stage-3-founder-qa-01-retained-media-provenance"
    scope = [ordered]@{
      deviceName = $expectedDeviceName
      manufacturer = $expectedManufacturer
      model = $expectedModel
      installationBinding = $expectedAdmissionSha256
      transferable = $false
    }
    assertion =
      "Windows was clean-installed using Microsoft's official Media Creation Tool USB workflow, but the original USB or ISO hash was not retained."
    installationMediaEvidencePresent = $false
    residualRisk =
      "Oracle cannot cryptographically prove the identity of the original installation media. It instead proves the observed freshness, integrity and uncontaminated state of the resulting Windows installation."
    invalidatedBy = @(
      "windows-reinstall",
      "windows-reset",
      "system-disk-replacement",
      "system-image-restoration",
      "secure-boot-change",
      "tpm-change",
      "contamination",
      "unexplained-software",
      "failed-integrity-controls"
    )
  }
  evidence = [ordered]@{
    hostAdmissionFilename = Split-Path -Leaf $resolvedAdmissionPath
    hostAdmissionSha256 = $admissionSha256
    baselineRecoveryFilename = Split-Path -Leaf $resolvedBaselinePath
    baselineRecoverySha256 = $baselineSha256
    compensatingControlsFilename = Split-Path -Leaf $resolvedControlsPath
    compensatingControlsSha256 = $controlsSha256
  }
  evaluator = [ordered]@{
    filename = Split-Path -Leaf $evaluatorPath
    sha256 = Get-Sha256 -Path $evaluatorPath
    powershell = $PSVersionTable.PSVersion.ToString()
  }
  checks = $checks
  failedChecks = $failedChecks
  limitations = @(
    "This candidate does not grant host admission.",
    "This candidate does not authorise Stage 3.",
    "installationMediaEvidencePresent remains false.",
    "Only the Founder may approve the host-specific exception.",
    "Qualification Register and programme status remain unchanged until Founder approval."
  )
}

$outputPath = Join-Path $resolvedOutputDirectory `
  "Oracle.Stage3ProvenanceExceptionCandidate.json"
Write-JsonEvidence -Value $candidate -Path $outputPath
$outputSha256 = Get-Sha256 -Path $outputPath
"$outputSha256  $(Split-Path -Leaf $outputPath)" |
  Set-Content -LiteralPath "$outputPath.sha256.txt" -Encoding ASCII

Write-Host ""
Write-Host "Exception candidate: $outputPath"
Write-Host "SHA-256: $outputSha256"
Write-Host "State: $candidateState"
Write-Host "Admission granted: false"
Write-Host "Stage 3 authority granted: false"
if ($failedChecks.Count -gt 0) {
  Write-Host "Failed checks: $($failedChecks -join ', ')"
}

if ($candidateState -ne "eligible-for-founder-approval") {
  exit 1
}
