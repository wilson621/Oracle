[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$OutputDirectory = (Join-Path $PSScriptRoot "evidence-output"),

  [Parameter(Mandatory = $false)]
  [string]$ExpectedDeviceName = "Founder-QA-01",

  [Parameter(Mandatory = $false)]
  [string]$ExpectedManufacturer = "MEDION",

  [Parameter(Mandatory = $false)]
  [string]$ExpectedModelPattern = "ERAZER P6605|MD61596",

  [Parameter(Mandatory = $false)]
  [string]$InstallationMediaPath
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Get-SaltedSha256 {
  param(
    [AllowEmptyString()]
    [string]$Value,
    [byte[]]$Salt
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $null
  }

  $valueBytes = [Text.Encoding]::UTF8.GetBytes($Value.Trim())
  $combined = New-Object byte[] ($Salt.Length + $valueBytes.Length)
  [Array]::Copy($Salt, 0, $combined, 0, $Salt.Length)
  [Array]::Copy($valueBytes, 0, $combined, $Salt.Length, $valueBytes.Length)
  $sha = [Security.Cryptography.SHA256]::Create()
  try {
    return ([BitConverter]::ToString($sha.ComputeHash($combined))).Replace("-", "").ToLowerInvariant()
  } finally {
    $sha.Dispose()
  }
}

function Get-InstalledSoftware {
  $paths = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*"
  )

  @(Get-ItemProperty $paths -ErrorAction SilentlyContinue |
    ForEach-Object {
      $displayNameProperty = $_.PSObject.Properties["DisplayName"]
      if (
        $null -ne $displayNameProperty -and
        -not [string]::IsNullOrWhiteSpace([string]$displayNameProperty.Value)
      ) {
        $displayVersionProperty = $_.PSObject.Properties["DisplayVersion"]
        $publisherProperty = $_.PSObject.Properties["Publisher"]
        [ordered]@{
          name = [string]$displayNameProperty.Value
          version = if ($null -ne $displayVersionProperty) {
            [string]$displayVersionProperty.Value
          } else {
            $null
          }
          publisher = if ($null -ne $publisherProperty) {
            [string]$publisherProperty.Value
          } else {
            $null
          }
        }
      }
    } |
    Sort-Object { $_.name }, { $_.version } -Unique)
}

function Get-CommandInventory {
  param([string[]]$Names)

  @($Names | ForEach-Object {
    $command = Get-Command $_ -ErrorAction SilentlyContinue
    [ordered]@{
      name = $_
      present = $null -ne $command
      sourceType = if ($command) { $command.CommandType.ToString() } else { $null }
    }
  })
}

function Read-FounderConfirmation {
  param([string]$Prompt)

  while ($true) {
    $answer = (Read-Host "$Prompt [Y/N]").Trim()
    if ($answer -match "(?i)^y(es)?$") { return $true }
    if ($answer -match "(?i)^n(o)?$") { return $false }
    Write-Host "Please answer Y or N."
  }
}

function Get-OptionalProbe {
  param([scriptblock]$Probe)

  try {
    & $Probe
  } catch {
    [ordered]@{
      available = $false
      error = $_.Exception.Message
    }
  }
}

$resolvedOutput = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null
$outputFile = Join-Path $resolvedOutput "Oracle.Stage3HostAdmission.json"
$outputHashFile = "$outputFile.sha256.txt"
$collectorPath = $MyInvocation.MyCommand.Path

$principal = [Security.Principal.WindowsPrincipal](
  [Security.Principal.WindowsIdentity]::GetCurrent()
)
$elevated = $principal.IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)
if (-not $elevated) {
  throw "Run this read-only collector from an elevated Windows PowerShell window."
}

$salt = New-Object byte[] 32
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
try {
  $random.GetBytes($salt)
} finally {
  $random.Dispose()
}

Write-Host ""
Write-Host "Oracle Sprint 30.5 Stage 3 replacement-host admission"
Write-Host "This collector is read-only except for its evidence output files."
Write-Host "It does not install Oracle, import certificates, transfer Stage 2 artifacts,"
Write-Host "change networking, or begin Stage 3."
Write-Host ""

$founderConfirmations = [ordered]@{
  requiredDataBackedUp = Read-FounderConfirmation "Is all data requiring retention independently backed up?"
  deviceMayBeErasedAfterSeparateApproval = Read-FounderConfirmation "May this device be erased later, but only after a separate Founder approval?"
  officialRecoveryRouteAvailable = Read-FounderConfirmation "Is an official recovery route or recovery media available?"
  currentWindowsWasCleanInstalledFromOfficialMedia = Read-FounderConfirmation "Was the current Windows installation clean-installed from official Microsoft media?"
  windowsUpdateStable = Read-FounderConfirmation "Does Windows Update currently report no pending mandatory update?"
  officialDeviceDriversInstalled = Read-FounderConfirmation "Were the current device drivers obtained through Windows Update or official device-manufacturer sources?"
  cleanBaselineAndRecoveryProcedureDocumented = Read-FounderConfirmation "Is the present clean baseline and its recovery procedure documented?"
  noProductionOracleCredentials = Read-FounderConfirmation "Are no production Oracle credentials present on this laptop?"
  noProductionOracleData = Read-FounderConfirmation "Is no production Oracle data present on this laptop?"
  noPurchaseRequired = Read-FounderConfirmation "Can the intended Windows 11 installation use the existing licence without a purchase, paid provider, edition upgrade, or new virtualisation provider?"
}

$installationMedia = [ordered]@{
  supplied = -not [string]::IsNullOrWhiteSpace($InstallationMediaPath)
  filename = $null
  sizeBytes = $null
  sha256 = $null
  available = $false
  error = $null
}
if ($installationMedia.supplied) {
  try {
    $resolvedMedia = (Resolve-Path -LiteralPath $InstallationMediaPath -ErrorAction Stop).Path
    $mediaItem = Get-Item -LiteralPath $resolvedMedia -ErrorAction Stop
    if ($mediaItem.PSIsContainer) {
      throw "InstallationMediaPath must identify the official ISO file, not a directory."
    }
    $installationMedia.filename = $mediaItem.Name
    $installationMedia.sizeBytes = [uint64]$mediaItem.Length
    $installationMedia.sha256 = (Get-FileHash -LiteralPath $resolvedMedia -Algorithm SHA256).Hash.ToLowerInvariant()
    $installationMedia.available = $true
  } catch {
    $installationMedia.error = $_.Exception.Message
  }
}

$os = Get-CimInstance Win32_OperatingSystem
$computer = Get-CimInstance Win32_ComputerSystem
$computerProduct = Get-CimInstance Win32_ComputerSystemProduct
$bios = Get-CimInstance Win32_BIOS
$processors = @(Get-CimInstance Win32_Processor)
$memory = @(Get-CimInstance Win32_PhysicalMemory)
$video = @(Get-CimInstance Win32_VideoController)
$physicalMedia = @(Get-CimInstance Win32_DiskDrive)
$logicalDisks = @(Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3")
$networkAdapters = @(Get-CimInstance Win32_NetworkAdapter |
  Where-Object { $_.PhysicalAdapter -and $_.MACAddress })
$signedDrivers = @(Get-CimInstance Win32_PnPSignedDriver |
  Where-Object { $_.DeviceName } |
  ForEach-Object {
    [ordered]@{
      deviceName = [string]$_.DeviceName
      manufacturer = [string]$_.Manufacturer
      driverProvider = [string]$_.DriverProviderName
      driverVersion = [string]$_.DriverVersion
      driverDate = $_.DriverDate
      signer = [string]$_.Signer
      isSigned = [bool]$_.IsSigned
    }
  } |
  Sort-Object { $_.deviceName }, { $_.driverVersion })

$installedSoftware = @(Get-InstalledSoftware)
$toolCommands = @(Get-CommandInventory @(
  "node.exe", "npm.cmd", "npx.cmd", "git.exe", "python.exe", "py.exe",
  "docker.exe", "cl.exe", "msbuild.exe", "code.cmd", "cargo.exe",
  "rustc.exe", "go.exe", "javac.exe"
))
$developmentSoftwarePattern = "(?i)(node\.js|python|visual studio|build tools|windows software development kit|windows sdk|docker|git( for windows)?|rust|golang|jdk|java development kit)"
$developmentSoftwareMatches = @($installedSoftware |
  Where-Object { $_.name -match $developmentSoftwarePattern })
$developmentCommandMatches = @($toolCommands | Where-Object { $_.present })

try {
  $allAppx = @(Get-AppxPackage -AllUsers -ErrorAction Stop)
} catch {
  $allAppx = @(Get-AppxPackage -ErrorAction SilentlyContinue)
}
$appxInventory = @($allAppx |
  ForEach-Object {
    [ordered]@{
      name = [string]$_.Name
      version = [string]$_.Version
      publisher = [string]$_.Publisher
      packageFamilyName = [string]$_.PackageFamilyName
    }
  } |
  Sort-Object { $_.name }, { $_.version })

$oracleSoftwareMatches = @($installedSoftware | Where-Object {
  $_.name -match "(?i)^Oracle (Platform|Companion)($|\s)"
})
$oracleAppxMatches = @($appxInventory | Where-Object {
  $_.name -match "(?i)^Oracle\.Platform" -or
  $_.packageFamilyName -match "(?i)^Oracle\.Platform"
})
$oracleProcessMatches = @(Get-Process -ErrorAction SilentlyContinue |
  Where-Object { $_.ProcessName -match "(?i)^Oracle(Platform|Companion)?$" } |
  Select-Object ProcessName, Id)
$oracleServiceMatches = @(Get-Service -ErrorAction SilentlyContinue |
  Where-Object {
    $_.Name -match "(?i)^Oracle(Platform|Companion)" -or
    $_.DisplayName -match "(?i)^Oracle (Platform|Companion)"
  } |
  Select-Object Name, DisplayName, Status)
$oracleTaskMatches = @(Get-ScheduledTask -ErrorAction SilentlyContinue |
  Where-Object {
    $_.TaskName -match "(?i)Oracle (Platform|Companion)" -or
    $_.TaskPath -match "(?i)\\Oracle\\"
  } |
  Select-Object TaskName, TaskPath, State)

$certificateStores = @(
  "Cert:\CurrentUser\My",
  "Cert:\CurrentUser\Root",
  "Cert:\CurrentUser\TrustedPeople",
  "Cert:\LocalMachine\My",
  "Cert:\LocalMachine\Root",
  "Cert:\LocalMachine\TrustedPeople"
)
$oracleCertificateMatches = @($certificateStores | ForEach-Object {
  $store = $_
  @(Get-ChildItem -LiteralPath $store -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Subject -match "(?i)Oracle Stage \d+ Local Test Signing" -or
      $_.FriendlyName -match "(?i)Oracle.*Local Test"
    } |
    ForEach-Object {
      [ordered]@{
        store = $store
        subject = [string]$_.Subject
        thumbprint = [string]$_.Thumbprint
        notAfter = $_.NotAfter.ToUniversalTime().ToString("o")
        hasPrivateKey = [bool]$_.HasPrivateKey
      }
    })
})

$knownResidueNames = @(
  "Oracle.Stage1EvidenceReturn.zip",
  "Oracle.Stage1LaptopAddress.json",
  "Oracle.Stage1Cleanup.json",
  "Oracle.Stage3HostAdmission.json",
  "Oracle_0.1.1.0_x64_STAGE2_LOCAL_TEST_ONLY.msix"
)
$residueRoots = @(
  [Environment]::GetFolderPath("Desktop"),
  [Environment]::GetFolderPath("MyDocuments"),
  (Join-Path $env:USERPROFILE "Downloads"),
  $env:TEMP
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }
$knownResidueMatches = @($residueRoots | ForEach-Object {
  $root = $_
  $knownResidueNames | ForEach-Object {
    $candidate = Join-Path $root $_
    if (Test-Path -LiteralPath $candidate) {
      [ordered]@{
        root = if ($root.StartsWith($env:USERPROFILE, [StringComparison]::OrdinalIgnoreCase)) {
          "%USERPROFILE%" + $root.Substring($env:USERPROFILE.Length)
        } else {
          Split-Path -Leaf $root
        }
        name = Split-Path -Leaf $candidate
      }
    }
  }
})

$sensitiveEnvironmentVariableNames = @(
  @(
    [Environment]::GetEnvironmentVariables("Process").Keys
    [Environment]::GetEnvironmentVariables("User").Keys
    [Environment]::GetEnvironmentVariables("Machine").Keys
  ) | ForEach-Object { [string]$_ } |
    Where-Object {
      $_ -match "(?i)(ORACLE|SUPABASE|POSTGRES|DATABASE_URL|JWT_SECRET|SERVICE_ROLE)"
    } |
    Sort-Object -Unique
)

$secureBoot = Get-OptionalProbe {
  [ordered]@{
    available = $true
    enabled = [bool](Confirm-SecureBootUEFI -ErrorAction Stop)
  }
}
$tpm = Get-OptionalProbe {
  $value = Get-Tpm -ErrorAction Stop
  [ordered]@{
    available = $true
    present = [bool]$value.TpmPresent
    ready = [bool]$value.TpmReady
    enabled = [bool]$value.TpmEnabled
    activated = [bool]$value.TpmActivated
    manufacturerVersion = [string]$value.ManufacturerVersion
  }
}
$defender = Get-OptionalProbe {
  $value = Get-MpComputerStatus -ErrorAction Stop
  [ordered]@{
    available = $true
    antivirusEnabled = [bool]$value.AntivirusEnabled
    antispywareEnabled = [bool]$value.AntispywareEnabled
    realTimeProtectionEnabled = [bool]$value.RealTimeProtectionEnabled
    tamperProtectionSource = [string]$value.TamperProtectionSource
    antivirusSignatureLastUpdated = $value.AntivirusSignatureLastUpdated
  }
}

$activationProducts = @(Get-CimInstance SoftwareLicensingProduct |
  Where-Object {
    $_.ApplicationID -eq "55c92734-d682-4d71-983e-d6ec3f16059f" -and
    $_.Name -match "Windows" -and
    $_.LicenseStatus -eq 1
  } |
  ForEach-Object {
    [ordered]@{
      name = [string]$_.Name
      description = [string]$_.Description
      licenseStatus = [int]$_.LicenseStatus
      gracePeriodRemainingMinutes = [uint32]$_.GracePeriodRemaining
    }
  })

$winReOutput = @(& "$env:SystemRoot\System32\reagentc.exe" /info 2>&1)
$winReEnabled = [bool]($winReOutput -match "(?i)Windows RE status:\s+Enabled")

$deviceNameMatches = $env:COMPUTERNAME -eq $ExpectedDeviceName
$manufacturerMatches = $computer.Manufacturer -match [regex]::Escape($ExpectedManufacturer)
$modelMatches = $computer.Model -match $ExpectedModelPattern
$windows11X64 = $os.Caption -match "Windows 11" -and $os.OSArchitecture -match "64-bit"
$activationPassed = @($activationProducts).Count -gt 0
$secureBootPassed = $secureBoot.available -and $secureBoot.enabled
$tpmPassed = $tpm.available -and $tpm.present -and $tpm.ready
$storageHealthy = (
  @($physicalMedia).Count -gt 0 -and
  @($physicalMedia | Where-Object { $_.Status -and $_.Status -ne "OK" }).Count -eq 0 -and
  @($logicalDisks | Where-Object { $_.DeviceID -eq $env:SystemDrive -and $_.FreeSpace -ge 10GB }).Count -gt 0
)
$gpuInventoryPresent = @($video).Count -gt 0
$driverInventoryPresent = @($signedDrivers).Count -gt 0
$oracleAbsent = (
  @($oracleSoftwareMatches).Count -eq 0 -and
  @($oracleAppxMatches).Count -eq 0 -and
  @($oracleProcessMatches).Count -eq 0 -and
  @($oracleServiceMatches).Count -eq 0 -and
  @($oracleTaskMatches).Count -eq 0 -and
  @($oracleCertificateMatches).Count -eq 0
)
$developmentToolsAbsent = (
  @($developmentSoftwareMatches).Count -eq 0 -and
  @($developmentCommandMatches).Count -eq 0
)
$qualificationResidueAbsent = @($knownResidueMatches).Count -eq 0
$productionIndicatorsAbsent = @($sensitiveEnvironmentVariableNames).Count -eq 0
$confirmationsPassed = @($founderConfirmations.Values | Where-Object { -not $_ }).Count -eq 0

$mandatoryChecks = [ordered]@{
  deviceNameMatches = $deviceNameMatches
  manufacturerMatches = $manufacturerMatches
  modelMatches = $modelMatches
  windows11X64 = $windows11X64
  activationPassed = $activationPassed
  secureBootPassed = $secureBootPassed
  tpmPassed = $tpmPassed
  storageHealthyAndCapacitySufficient = $storageHealthy
  gpuInventoryPresent = $gpuInventoryPresent
  driverInventoryPresent = $driverInventoryPresent
  recoveryEnvironmentEnabled = $winReEnabled
  installationMediaEvidencePresent = $installationMedia.available
  oracleAbsent = $oracleAbsent
  developmentToolsAbsent = $developmentToolsAbsent
  qualificationResidueAbsent = $qualificationResidueAbsent
  productionEnvironmentIndicatorsAbsent = $productionIndicatorsAbsent
  founderConfirmationsPassed = $confirmationsPassed
}
$failedChecks = @($mandatoryChecks.GetEnumerator() |
  Where-Object { -not $_.Value } |
  ForEach-Object { $_.Key })

$evidence = [ordered]@{
  schemaVersion = 1
  contract = "oracle.sprint-30-5.stage-3-host-admission"
  contractVersion = 1
  collectedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
  status = if (@($failedChecks).Count -eq 0) { "passed" } else { "failed" }
  designation = [ordered]@{
    expectedDeviceName = $ExpectedDeviceName
    expectedManufacturer = $ExpectedManufacturer
    expectedModelPattern = $ExpectedModelPattern
  }
  privacy = [ordered]@{
    hashAlgorithm = "salted-sha256"
    saltBase64 = [Convert]::ToBase64String($salt)
    rawSerialsRetained = $false
    rawMacAddressesRetained = $false
    productKeysRetained = $false
    credentialValuesInspected = $false
  }
  collector = [ordered]@{
    revision = 3
    filename = Split-Path -Leaf $collectorPath
    sha256 = (Get-FileHash -LiteralPath $collectorPath -Algorithm SHA256).Hash.ToLowerInvariant()
    powershell = $PSVersionTable.PSVersion.ToString()
    elevated = $elevated
  }
  host = [ordered]@{
    deviceName = $env:COMPUTERNAME
    manufacturer = [string]$computer.Manufacturer
    model = [string]$computer.Model
    systemFamily = [string]$computer.SystemFamily
    systemSku = [string]$computer.SystemSKUNumber
    serialSha256 = Get-SaltedSha256 -Value ([string]$bios.SerialNumber) -Salt $salt
    productUuidSha256 = Get-SaltedSha256 -Value ([string]$computerProduct.UUID) -Salt $salt
    processors = @($processors | ForEach-Object {
      [ordered]@{
        name = [string]$_.Name
        architecture = [int]$_.Architecture
        cores = [uint32]$_.NumberOfCores
        logicalProcessors = [uint32]$_.NumberOfLogicalProcessors
      }
    })
    installedMemoryBytes = [uint64]$computer.TotalPhysicalMemory
    memoryModules = @($memory | ForEach-Object {
      [ordered]@{
        capacityBytes = [uint64]$_.Capacity
        speedMhz = [uint32]$_.Speed
        manufacturer = [string]$_.Manufacturer
        partNumber = ([string]$_.PartNumber).Trim()
        serialSha256 = Get-SaltedSha256 -Value ([string]$_.SerialNumber) -Salt $salt
      }
    })
  }
  firmware = [ordered]@{
    manufacturer = [string]$bios.Manufacturer
    smbiosVersion = [string]$bios.SMBIOSBIOSVersion
    releaseDate = $bios.ReleaseDate
    uefiSecureBoot = $secureBoot
    tpm = $tpm
  }
  operatingSystem = [ordered]@{
    caption = [string]$os.Caption
    editionId = [string](Get-ItemPropertyValue "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" "EditionID" -ErrorAction SilentlyContinue)
    displayVersion = [string](Get-ItemPropertyValue "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" "DisplayVersion" -ErrorAction SilentlyContinue)
    version = [string]$os.Version
    buildNumber = [string]$os.BuildNumber
    architecture = [string]$os.OSArchitecture
    locale = [string]$os.Locale
    installDate = $os.InstallDate
    lastBootUpTime = $os.LastBootUpTime
    activation = $activationProducts
    recoveryEnvironmentEnabled = $winReEnabled
    defender = $defender
  }
  installationMedia = $installationMedia
  storage = [ordered]@{
    physical = @($physicalMedia | ForEach-Object {
      [ordered]@{
        model = [string]$_.Model
        interfaceType = [string]$_.InterfaceType
        mediaType = [string]$_.MediaType
        firmwareRevision = [string]$_.FirmwareRevision
        sizeBytes = [uint64]$_.Size
        status = [string]$_.Status
        serialSha256 = Get-SaltedSha256 -Value ([string]$_.SerialNumber) -Salt $salt
      }
    })
    logical = @($logicalDisks | ForEach-Object {
      [ordered]@{
        deviceId = [string]$_.DeviceID
        fileSystem = [string]$_.FileSystem
        sizeBytes = [uint64]$_.Size
        freeSpaceBytes = [uint64]$_.FreeSpace
      }
    })
  }
  display = [ordered]@{
    appliedDpi = (Get-ItemPropertyValue "HKCU:\Control Panel\Desktop\WindowMetrics" "AppliedDPI" -ErrorAction SilentlyContinue)
    adapters = @($video | ForEach-Object {
      [ordered]@{
        name = [string]$_.Name
        adapterCompatibility = [string]$_.AdapterCompatibility
        driverVersion = [string]$_.DriverVersion
        driverDate = $_.DriverDate
        videoProcessor = [string]$_.VideoProcessor
        adapterRamBytes = if ($null -ne $_.AdapterRAM) { [uint64]$_.AdapterRAM } else { $null }
        status = [string]$_.Status
        horizontalResolution = $_.CurrentHorizontalResolution
        verticalResolution = $_.CurrentVerticalResolution
        refreshRate = $_.CurrentRefreshRate
      }
    })
  }
  network = [ordered]@{
    adapters = @($networkAdapters | ForEach-Object {
      [ordered]@{
        name = [string]$_.Name
        manufacturer = [string]$_.Manufacturer
        adapterType = [string]$_.AdapterType
        netConnectionId = [string]$_.NetConnectionID
        enabled = [bool]$_.NetEnabled
        status = [string]$_.NetConnectionStatus
        macSha256 = Get-SaltedSha256 -Value ([string]$_.MACAddress) -Salt $salt
      }
    })
  }
  drivers = $signedDrivers
  installedSoftware = $installedSoftware
  appxInventory = $appxInventory
  absence = [ordered]@{
    oracle = [ordered]@{
      absent = $oracleAbsent
      installedSoftwareMatches = $oracleSoftwareMatches
      appxMatches = $oracleAppxMatches
      processMatches = $oracleProcessMatches
      serviceMatches = $oracleServiceMatches
      scheduledTaskMatches = $oracleTaskMatches
      certificateMatches = $oracleCertificateMatches
    }
    developmentTools = [ordered]@{
      absent = $developmentToolsAbsent
      commandInventory = $toolCommands
      installedSoftwareMatches = $developmentSoftwareMatches
    }
    qualificationResidue = [ordered]@{
      absent = $qualificationResidueAbsent
      knownMatches = $knownResidueMatches
    }
    productionIndicators = [ordered]@{
      absent = $productionIndicatorsAbsent
      matchingEnvironmentVariableNames = $sensitiveEnvironmentVariableNames
      limitation = "Only variable names were inspected; values and credential stores were not read."
    }
  }
  founderConfirmations = $founderConfirmations
  mandatoryChecks = $mandatoryChecks
  failedChecks = $failedChecks
  limitations = @(
    "This is read-only host admission, not Stage 3 execution.",
    "The collector does not install, transfer or inspect the Stage 2 package.",
    "The collector does not import or inspect the Stage 2 public certificate.",
    "No credential values, browser profiles, personal files or production systems are inspected.",
    "Production credential and data absence requires the recorded Founder attestations in addition to bounded machine indicators.",
    "If this run occurs before the authorised clean installation, installation-media identity and post-install clean-state evidence will remain outstanding and admission must fail closed.",
    "Installed-package GPU qualification remains a later Stage 5 requirement."
  )
}

$evidence | ConvertTo-Json -Depth 14 |
  Set-Content -LiteralPath $outputFile -Encoding UTF8
$outputHash = (Get-FileHash -LiteralPath $outputFile -Algorithm SHA256).Hash.ToLowerInvariant()
"$outputHash  $(Split-Path -Leaf $outputFile)" |
  Set-Content -LiteralPath $outputHashFile -Encoding ASCII

Write-Host ""
Write-Host "Admission evidence: $outputFile"
Write-Host "SHA-256 record:    $outputHashFile"
Write-Host "Result:             $($evidence.status)"
if (@($failedChecks).Count -gt 0) {
  Write-Host "Failed checks:      $($failedChecks -join ', ')"
}
Write-Host ""
Write-Host "No Stage 3 action was performed."

if ($evidence.status -ne "passed") {
  exit 1
}
