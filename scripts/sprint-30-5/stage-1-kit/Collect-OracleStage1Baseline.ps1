param(
  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"
$outputFile = [IO.Path]::GetFullPath($OutputPath)
$outputDirectory = Split-Path -Parent $outputFile
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$dxdiagPath = Join-Path $outputDirectory "dxdiag.xml"

function Get-CommandPresence {
  param([string[]]$Names)
  foreach ($name in $Names) {
    $command = Get-Command $name -ErrorAction SilentlyContinue
    [pscustomobject]@{
      name = $name
      present = $null -ne $command
      source = if ($command) { $command.Source } else { $null }
    }
  }
}

function Get-InstalledSoftware {
  $paths = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*"
  )
  Get-ItemProperty $paths -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName } |
    Select-Object @{n="name";e={$_.DisplayName}},
      @{n="version";e={$_.DisplayVersion}},
      @{n="publisher";e={$_.Publisher}} |
    Sort-Object name, version -Unique
}

try {
  $os = Get-CimInstance Win32_OperatingSystem
  $computer = Get-CimInstance Win32_ComputerSystem
  $processor = Get-CimInstance Win32_Processor | Select-Object -First 1
  $gpus = Get-CimInstance Win32_VideoController
  $installedSoftware = @(Get-InstalledSoftware)
  $toolInventory = @(Get-CommandPresence @(
    "node.exe", "npm.cmd", "npx.cmd", "git.exe", "docker.exe",
    "cl.exe", "msbuild.exe", "dotnet.exe", "code.cmd", "python.exe",
    "cargo.exe", "go.exe"
  ))
  $developmentToolsPresent = @($toolInventory | Where-Object { $_.present })
  $oracleSoftware = @($installedSoftware | Where-Object {
    $_.name -match "^Oracle Platform($|\s)" -or
    $_.name -match "^Oracle Companion($|\s)"
  })
  try {
    $appxPackages = @(Get-AppxPackage -AllUsers -ErrorAction Stop)
  } catch {
    $appxPackages = @(Get-AppxPackage -ErrorAction SilentlyContinue)
  }
  $oraclePackages = @($appxPackages |
    Where-Object {
      $_.Name -match "^Oracle\.Platform" -or
      $_.PackageFamilyName -match "^Oracle\.Platform"
    } |
    Select-Object Name, Version, PackageFullName, Publisher)

  $dxdiag = $null
  try {
    Start-Process -FilePath "$env:SystemRoot\System32\dxdiag.exe" `
      -ArgumentList "/whql:off", "/x", "`"$dxdiagPath`"" `
      -Wait -WindowStyle Hidden
    if (Test-Path -LiteralPath $dxdiagPath) {
      [xml]$dxdiagXml = Get-Content -LiteralPath $dxdiagPath -Raw
      $dxdiag = @($dxdiagXml.DxDiag.DisplayDevices.DisplayDevice | ForEach-Object {
        [pscustomobject]@{
          cardName = $_.CardName
          manufacturer = $_.Manufacturer
          driverVersion = $_.DriverVersion
          driverModel = $_.DriverModel
          displayMemory = $_.DisplayMemory
          currentMode = $_.CurrentMode
          hardwareScheduling = $_.HardwareScheduling
          miracast = $_.Miracast
        }
      })
    }
  } finally {
    Remove-Item -LiteralPath $dxdiagPath -Force -ErrorAction SilentlyContinue
  }

  $appliedDpi = (Get-ItemProperty `
    "HKCU:\Control Panel\Desktop\WindowMetrics" `
    -Name AppliedDPI -ErrorAction SilentlyContinue).AppliedDPI
  $restoreService = Get-Service -Name "VSS" -ErrorAction SilentlyContinue
  $restorePoints = @()
  $restorePointError = $null
  try {
    $restorePoints = @(Get-ComputerRestorePoint -ErrorAction Stop |
      Select-Object SequenceNumber, Description, CreationTime,
        RestorePointType, EventType)
  } catch {
    $restorePointError = $_.Exception.Message
  }

  $collectorPath = $MyInvocation.MyCommand.Path
  $evidence = [ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.windows-baseline"
    contractVersion = 1
    collectedAt = (Get-Date).ToUniversalTime().ToString("o")
    result = if (
      $oracleSoftware.Count -eq 0 -and
      $oraclePackages.Count -eq 0 -and
      $developmentToolsPresent.Count -eq 0 -and
      $restorePoints.Count -gt 0
    ) { "passed" } else { "failed" }
    collector = [ordered]@{
      filename = Split-Path -Leaf $collectorPath
      sha256 = (Get-FileHash -LiteralPath $collectorPath -Algorithm SHA256).Hash.ToLowerInvariant()
      powershell = $PSVersionTable.PSVersion.ToString()
      elevated = ([Security.Principal.WindowsPrincipal](
        [Security.Principal.WindowsIdentity]::GetCurrent()
      )).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    }
    operatingSystem = [ordered]@{
      caption = $os.Caption
      version = $os.Version
      buildNumber = $os.BuildNumber
      architecture = $os.OSArchitecture
      lastBootUpTime = $os.LastBootUpTime
    }
    machine = [ordered]@{
      manufacturer = $computer.Manufacturer
      model = $computer.Model
      processor = $processor.Name
      installedMemoryBytes = [uint64]$computer.TotalPhysicalMemory
    }
    display = [ordered]@{
      appliedDpi = $appliedDpi
      scalingPercent = if ($appliedDpi) { [math]::Round(($appliedDpi / 96) * 100) } else { $null }
      adapters = @($gpus | ForEach-Object {
        [ordered]@{
          name = $_.Name
          driverVersion = $_.DriverVersion
          videoProcessor = $_.VideoProcessor
          status = $_.Status
          currentHorizontalResolution = $_.CurrentHorizontalResolution
          currentVerticalResolution = $_.CurrentVerticalResolution
          currentRefreshRate = $_.CurrentRefreshRate
        }
      })
      dxdiag = $dxdiag
    }
    installedSoftware = $installedSoftware
    oracle = [ordered]@{
      installedSoftwareMatches = $oracleSoftware
      appxPackageMatches = $oraclePackages
      absent = $oracleSoftware.Count -eq 0 -and $oraclePackages.Count -eq 0
    }
    developmentTools = $toolInventory
    developmentToolsAbsent = $developmentToolsPresent.Count -eq 0
    systemRestore = [ordered]@{
      volumeShadowCopyService = if ($restoreService) { $restoreService.Status.ToString() } else { "Unavailable" }
      restorePoints = $restorePoints
      enumerationError = $restorePointError
      documentedRestorePointPresent = $restorePoints.Count -gt 0
    }
    limitations = @(
      "Absence checks cover installed-software registrations, Appx packages, and command discovery.",
      "The collector does not inspect or export credentials, files, browser profiles, or personal content."
    )
  }

  $evidence | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $outputFile -Encoding UTF8
  $hash = (Get-FileHash -LiteralPath $outputFile -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  $(Split-Path -Leaf $outputFile)" |
    Set-Content -LiteralPath "$outputFile.sha256.txt" -Encoding ASCII
  Write-Host "Windows baseline evidence written to $outputFile"
  if ($evidence.result -ne "passed") { exit 1 }
} catch {
  $failure = [ordered]@{
    schemaVersion = 1
    contract = "oracle.sprint-30-5.windows-baseline"
    contractVersion = 1
    collectedAt = (Get-Date).ToUniversalTime().ToString("o")
    result = "failed"
    error = $_.Exception.Message
  }
  $failure | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $outputFile -Encoding UTF8
  throw
}
