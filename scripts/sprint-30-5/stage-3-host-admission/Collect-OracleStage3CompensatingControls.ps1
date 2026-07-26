[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$HostAdmissionPath,

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

function Write-HashRecord {
  param([Parameter(Mandatory = $true)][string]$Path)

  $hash = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  $(Split-Path -Leaf $Path)" |
    Set-Content -LiteralPath "$Path.sha256.txt" -Encoding ASCII
  return $hash
}

function Invoke-CapturedNativeCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath,

    [Parameter(Mandatory = $true)]
    [string[]]$Arguments,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath
  )

  $startedAtUtc = (Get-Date).ToUniversalTime()
  $output = @(& $FilePath @Arguments 2>&1 | ForEach-Object {
    [string]$_
  })
  $exitCode = $LASTEXITCODE
  $completedAtUtc = (Get-Date).ToUniversalTime()

  $output | Set-Content -LiteralPath $OutputPath -Encoding UTF8
  $hash = Write-HashRecord -Path $OutputPath

  [ordered]@{
    filename = Split-Path -Leaf $OutputPath
    sha256 = $hash
    exitCode = $exitCode
    startedAtUtc = $startedAtUtc.ToString("o")
    completedAtUtc = $completedAtUtc.ToString("o")
    output = $output
  }
}

function Get-SfcVerifyOnlyAssessment {
  param(
    [Parameter(Mandatory = $true)]
    [string]$EvidencePath
  )

  $bytes = [IO.File]::ReadAllBytes($EvidencePath)
  $encodingName = "utf-8"
  $preambleLength = 0

  if (
    $bytes.Length -ge 3 -and
    $bytes[0] -eq 0xEF -and
    $bytes[1] -eq 0xBB -and
    $bytes[2] -eq 0xBF
  ) {
    $encoding = New-Object Text.UTF8Encoding($false, $true)
    $encodingName = "utf-8-bom"
    $preambleLength = 3
  } elseif (
    $bytes.Length -ge 2 -and
    $bytes[0] -eq 0xFF -and
    $bytes[1] -eq 0xFE
  ) {
    $encoding = New-Object Text.UnicodeEncoding($false, $true, $true)
    $encodingName = "utf-16le-bom"
    $preambleLength = 2
  } elseif (
    $bytes.Length -ge 2 -and
    $bytes[0] -eq 0xFE -and
    $bytes[1] -eq 0xFF
  ) {
    $encoding = New-Object Text.UnicodeEncoding($true, $true, $true)
    $encodingName = "utf-16be-bom"
    $preambleLength = 2
  } else {
    $encoding = New-Object Text.UTF8Encoding($false, $true)
  }

  $text = $encoding.GetString(
    $bytes,
    $preambleLength,
    $bytes.Length - $preambleLength
  )
  $nulCodeUnitCount = (
    @($text.ToCharArray() | Where-Object { [int]$_ -eq 0 }).Count
  )
  $normalizedText = $text.Replace([string][char]0, "")
  $lines = @(
    [regex]::Split($normalizedText, "\r\n|\n|\r") |
      ForEach-Object { $_.Trim() } |
      Where-Object { $_.Length -gt 0 }
  )

  $successMarker =
    "Windows Resource Protection did not find any integrity violations."
  $failureMarkers = @(
    "Windows Resource Protection found corrupt files",
    "Windows Resource Protection found integrity violations",
    "Windows Resource Protection could not perform the requested operation",
    "There is a system repair pending"
  )
  $successMarkerCount = @(
    $lines | Where-Object {
      [string]::Equals(
        $_,
        $successMarker,
        [StringComparison]::OrdinalIgnoreCase
      )
    }
  ).Count
  $failureMarkerCount = @(
    $lines | Where-Object {
      $line = $_
      @($failureMarkers | Where-Object {
        $line.IndexOf($_, [StringComparison]::OrdinalIgnoreCase) -ge 0
      }).Count -gt 0
    }
  ).Count

  [ordered]@{
    parserVersion = 2
    classificationBasis =
      "hash-bound raw evidence exact success marker without failure marker"
    detectedEncoding = $encodingName
    nulCodeUnitsRemoved = $nulCodeUnitCount
    successMarkerCount = $successMarkerCount
    failureMarkerCount = $failureMarkerCount
    noIntegrityViolations = (
      $successMarkerCount -eq 1 -and
      $failureMarkerCount -eq 0
    )
  }
}

function Get-ObjectPropertyValue {
  param(
    [Parameter(Mandatory = $true)]
    [object]$InputObject,

    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  $property = $InputObject.PSObject.Properties[$Name]
  if ($null -eq $property) {
    return $null
  }
  return $property.Value
}

function Test-ObjectProperty {
  param(
    [Parameter(Mandatory = $true)]
    [object]$InputObject,

    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  return $null -ne $InputObject.PSObject.Properties[$Name]
}

function Convert-DefenderStatus {
  param([Parameter(Mandatory = $true)][object]$Status)

  [ordered]@{
    antivirusEnabled = [bool](Get-ObjectPropertyValue $Status "AntivirusEnabled")
    antispywareEnabled = [bool](Get-ObjectPropertyValue $Status "AntispywareEnabled")
    behaviorMonitorEnabled = [bool](Get-ObjectPropertyValue $Status "BehaviorMonitorEnabled")
    realTimeProtectionEnabled = [bool](Get-ObjectPropertyValue $Status "RealTimeProtectionEnabled")
    ioavProtectionEnabled = [bool](Get-ObjectPropertyValue $Status "IoavProtectionEnabled")
    nISEnabled = [bool](Get-ObjectPropertyValue $Status "NISEnabled")
    antivirusSignatureVersion = [string](Get-ObjectPropertyValue $Status "AntivirusSignatureVersion")
    antivirusSignatureLastUpdated = Get-ObjectPropertyValue $Status "AntivirusSignatureLastUpdated"
    quickScanAge = Get-ObjectPropertyValue $Status "QuickScanAge"
    quickScanStartTime = Get-ObjectPropertyValue $Status "QuickScanStartTime"
    quickScanEndTime = Get-ObjectPropertyValue $Status "QuickScanEndTime"
    fullScanAge = Get-ObjectPropertyValue $Status "FullScanAge"
    rebootRequired = [bool](Get-ObjectPropertyValue $Status "RebootRequired")
  }
}

function Convert-DefenderThreat {
  param([Parameter(Mandatory = $true)][object]$Threat)

  $isActiveKnown = Test-ObjectProperty $Threat "IsActive"
  [ordered]@{
    threatId = Get-ObjectPropertyValue $Threat "ThreatID"
    threatName = [string](Get-ObjectPropertyValue $Threat "ThreatName")
    severityId = Get-ObjectPropertyValue $Threat "SeverityID"
    categoryId = Get-ObjectPropertyValue $Threat "CategoryID"
    isActiveKnown = $isActiveKnown
    isActive = if ($isActiveKnown) {
      [bool](Get-ObjectPropertyValue $Threat "IsActive")
    } else {
      $null
    }
    didThreatExecute = [bool](Get-ObjectPropertyValue $Threat "DidThreatExecute")
  }
}

function Convert-DefenderDetection {
  param([Parameter(Mandatory = $true)][object]$Detection)

  $initialDetectionTimeKnown =
    Test-ObjectProperty $Detection "InitialDetectionTime"
  [ordered]@{
    threatId = Get-ObjectPropertyValue $Detection "ThreatID"
    threatStatusId = Get-ObjectPropertyValue $Detection "ThreatStatusID"
    currentThreatExecutionStatusId =
      Get-ObjectPropertyValue $Detection "CurrentThreatExecutionStatusID"
    initialDetectionTimeKnown = $initialDetectionTimeKnown
    initialDetectionTime =
      Get-ObjectPropertyValue $Detection "InitialDetectionTime"
    lastThreatStatusChangeTime =
      Get-ObjectPropertyValue $Detection "LastThreatStatusChangeTime"
    actionSuccess = Get-ObjectPropertyValue $Detection "ActionSuccess"
  }
}

$principal = [Security.Principal.WindowsPrincipal](
  [Security.Principal.WindowsIdentity]::GetCurrent()
)
$elevated = $principal.IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)
if (-not $elevated) {
  throw "Run this collector from an elevated Windows PowerShell window."
}

$resolvedAdmissionPath = (Resolve-Path -LiteralPath $HostAdmissionPath).Path
$resolvedOutputDirectory = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $resolvedOutputDirectory -Force | Out-Null

$admissionSha256 = (
  Get-FileHash -LiteralPath $resolvedAdmissionPath -Algorithm SHA256
).Hash.ToLowerInvariant()
$admission = Get-Content -LiteralPath $resolvedAdmissionPath -Raw |
  ConvertFrom-Json

$admissionFailedChecks = @($admission.failedChecks)
$admissionBindingChecks = [ordered]@{
  hashMatches = $admissionSha256 -eq $expectedAdmissionSha256
  contractMatches =
    [string]$admission.contract -eq
    "oracle.sprint-30-5.stage-3-host-admission"
  deviceNameMatches =
    [string]$admission.host.deviceName -eq $expectedDeviceName
  manufacturerMatches =
    [string]$admission.host.manufacturer -eq $expectedManufacturer
  modelMatches =
    [string]$admission.host.model -eq $expectedModel
  mediaEvidenceRemainsFalse =
    -not [bool]$admission.mandatoryChecks.$mediaCheckName
  soleFailedCheckIsMedia =
    $admissionFailedChecks.Count -eq 1 -and
    [string]$admissionFailedChecks[0] -eq $mediaCheckName
}
$failedAdmissionBindingChecks = @(
  $admissionBindingChecks.GetEnumerator() |
    Where-Object { -not $_.Value } |
    ForEach-Object { $_.Key }
)
if ($failedAdmissionBindingChecks.Count -gt 0) {
  throw (
    "Host-admission binding failed: " +
    ($failedAdmissionBindingChecks -join ", ")
  )
}

$dismOutputPath = Join-Path $resolvedOutputDirectory "dism-checkhealth.txt"
$sfcOutputPath = Join-Path $resolvedOutputDirectory "sfc-verifyonly.txt"

$dism = Invoke-CapturedNativeCommand `
  -FilePath "$env:SystemRoot\System32\Dism.exe" `
  -Arguments @("/Online", "/Cleanup-Image", "/CheckHealth") `
  -OutputPath $dismOutputPath
$dismText = $dism.output -join [Environment]::NewLine
$dismPassed = (
  $dism.exitCode -eq 0 -and
  $dismText -match "(?i)No component store corruption detected"
)

$sfc = Invoke-CapturedNativeCommand `
  -FilePath "$env:SystemRoot\System32\sfc.exe" `
  -Arguments @("/verifyonly") `
  -OutputPath $sfcOutputPath
$sfcAssessment = Get-SfcVerifyOnlyAssessment -EvidencePath $sfcOutputPath
$sfcPassed = [bool]$sfcAssessment.noIntegrityViolations

$defenderBeforeRaw = Get-MpComputerStatus
$defenderBefore = Convert-DefenderStatus -Status $defenderBeforeRaw
$defenderBeforePath = Join-Path $resolvedOutputDirectory "defender-before.json"
Write-JsonEvidence -Value $defenderBefore -Path $defenderBeforePath
$defenderBeforeSha256 = Write-HashRecord -Path $defenderBeforePath

$scanStartedAtUtc = (Get-Date).ToUniversalTime()
Start-MpScan -ScanType QuickScan
$scanCommandCompletedAtUtc = (Get-Date).ToUniversalTime()

$defenderAfterRaw = Get-MpComputerStatus
$defenderAfter = Convert-DefenderStatus -Status $defenderAfterRaw
$defenderAfterPath = Join-Path $resolvedOutputDirectory "defender-after.json"
Write-JsonEvidence -Value $defenderAfter -Path $defenderAfterPath
$defenderAfterSha256 = Write-HashRecord -Path $defenderAfterPath

$threats = @(Get-MpThreat -ErrorAction Stop | ForEach-Object {
  Convert-DefenderThreat -Threat $_
})
$detections = @(Get-MpThreatDetection -ErrorAction Stop | ForEach-Object {
  Convert-DefenderDetection -Detection $_
})
$newDetections = @($detections | Where-Object {
  $null -ne $_.initialDetectionTime -and
  ([DateTime]$_.initialDetectionTime).ToUniversalTime() -ge $scanStartedAtUtc
})
$activeThreats = @($threats | Where-Object { $_.isActive })
$threatEvidenceComplete = (
  @($threats | Where-Object { -not $_.isActiveKnown }).Count -eq 0 -and
  @($detections | Where-Object {
    -not $_.initialDetectionTimeKnown
  }).Count -eq 0
)

$defenderThreatEvidence = [ordered]@{
  scanStartedAtUtc = $scanStartedAtUtc.ToString("o")
  scanCommandCompletedAtUtc = $scanCommandCompletedAtUtc.ToString("o")
  activeThreats = $activeThreats
  detectionsSinceScanStart = $newDetections
  allThreatMetadata = $threats
  allDetectionMetadata = $detections
  resourcesOrPathsRetained = $false
}
$defenderThreatsPath = Join-Path $resolvedOutputDirectory "defender-threats.json"
Write-JsonEvidence -Value $defenderThreatEvidence -Path $defenderThreatsPath
$defenderThreatsSha256 = Write-HashRecord -Path $defenderThreatsPath

$quickScanEndTime = $defenderAfter.quickScanEndTime
$quickScanCompleted = (
  $null -ne $quickScanEndTime -and
  ([DateTime]$quickScanEndTime).ToUniversalTime() -ge
    $scanStartedAtUtc.AddMinutes(-1)
)
$defenderHealthy = (
  [bool]$defenderAfter.antivirusEnabled -and
  [bool]$defenderAfter.antispywareEnabled -and
  [bool]$defenderAfter.realTimeProtectionEnabled -and
  -not [bool]$defenderAfter.rebootRequired
)
$defenderPassed = (
  $quickScanCompleted -and
  $defenderHealthy -and
  $threatEvidenceComplete -and
  $activeThreats.Count -eq 0 -and
  $newDetections.Count -eq 0
)

$checks = [ordered]@{
  hostAdmissionBinding = $true
  dismCheckHealth = $dismPassed
  sfcVerifyOnly = $sfcPassed
  defenderQuickScanCompleted = $quickScanCompleted
  defenderHealthy = $defenderHealthy
  defenderThreatEvidenceComplete = $threatEvidenceComplete
  defenderNoActiveThreats = $activeThreats.Count -eq 0
  defenderNoNewDetections = $newDetections.Count -eq 0
}
$failedChecks = @(
  $checks.GetEnumerator() |
    Where-Object { -not $_.Value } |
    ForEach-Object { $_.Key }
)

$collectorPath = $MyInvocation.MyCommand.Path
$evidence = [ordered]@{
  schemaVersion = 1
  contract = "oracle.sprint-30-5.stage-3-compensating-controls"
  contractVersion = 1
  collectedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
  result = if ($failedChecks.Count -eq 0) { "passed" } else { "failed" }
  authority = [ordered]@{
    classification = "evidence-only"
    grantsHostAdmission = $false
    grantsStage3Authority = $false
    maximumDownstreamState = "eligible-for-founder-approval"
  }
  collector = [ordered]@{
    filename = Split-Path -Leaf $collectorPath
    sha256 = (
      Get-FileHash -LiteralPath $collectorPath -Algorithm SHA256
    ).Hash.ToLowerInvariant()
    powershell = $PSVersionTable.PSVersion.ToString()
    elevated = $elevated
  }
  binding = [ordered]@{
    deviceName = $expectedDeviceName
    manufacturer = $expectedManufacturer
    model = $expectedModel
    hostAdmissionFilename = Split-Path -Leaf $resolvedAdmissionPath
    hostAdmissionSha256 = $admissionSha256
    expectedHostAdmissionSha256 = $expectedAdmissionSha256
    baselineRecoveryDocumentSha256 = $expectedBaselineSha256
    installationMediaEvidencePresent = $false
    soleUnavailableEvidence = $mediaCheckName
  }
  controls = [ordered]@{
    dism = [ordered]@{
      command = "DISM.exe /Online /Cleanup-Image /CheckHealth"
      filename = $dism.filename
      sha256 = $dism.sha256
      exitCode = $dism.exitCode
      noCorruptionDetected = $dismPassed
      startedAtUtc = $dism.startedAtUtc
      completedAtUtc = $dism.completedAtUtc
    }
    sfc = [ordered]@{
      command = "sfc.exe /verifyonly"
      filename = $sfc.filename
      sha256 = $sfc.sha256
      exitCode = $sfc.exitCode
      noIntegrityViolations = $sfcPassed
      assessment = $sfcAssessment
      startedAtUtc = $sfc.startedAtUtc
      completedAtUtc = $sfc.completedAtUtc
    }
    defender = [ordered]@{
      command = "Start-MpScan -ScanType QuickScan"
      beforeFilename = Split-Path -Leaf $defenderBeforePath
      beforeSha256 = $defenderBeforeSha256
      afterFilename = Split-Path -Leaf $defenderAfterPath
      afterSha256 = $defenderAfterSha256
      threatsFilename = Split-Path -Leaf $defenderThreatsPath
      threatsSha256 = $defenderThreatsSha256
      scanStartedAtUtc = $scanStartedAtUtc.ToString("o")
      scanCommandCompletedAtUtc = $scanCommandCompletedAtUtc.ToString("o")
      quickScanCompleted = $quickScanCompleted
      healthy = $defenderHealthy
      threatEvidenceComplete = $threatEvidenceComplete
      activeThreatCount = $activeThreats.Count
      newDetectionCount = $newDetections.Count
      passed = $defenderPassed
    }
  }
  checks = $checks
  failedChecks = $failedChecks
  limitations = @(
    "This record does not prove or replace original installation-media provenance.",
    "installationMediaEvidencePresent remains false.",
    "This record cannot grant host admission or Stage 3 authority.",
    "Defender resource paths and unrelated personal data are not retained."
  )
}

$outputPath = Join-Path $resolvedOutputDirectory `
  "Oracle.Stage3CompensatingControls.json"
Write-JsonEvidence -Value $evidence -Path $outputPath
$outputSha256 = Write-HashRecord -Path $outputPath

Write-Host ""
Write-Host "Compensating-control evidence: $outputPath"
Write-Host "SHA-256: $outputSha256"
Write-Host "Result: $($evidence.result)"
if ($failedChecks.Count -gt 0) {
  Write-Host "Failed checks: $($failedChecks -join ', ')"
}
Write-Host ""
Write-Host "No host-admission or Stage 3 authority was granted."

if ($evidence.result -ne "passed") {
  exit 1
}
