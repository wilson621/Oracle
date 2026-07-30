Set-StrictMode -Version Latest

function Get-OracleStage3R9RequiredPropertyValue {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][object]$InputObject,
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Source
  )

  $property = $InputObject.PSObject.Properties[$Name]
  if ($null -eq $property) {
    throw "$Source is missing mandatory member '$Name'."
  }
  $property.Value
}

function Assert-OracleStage3R9CommandSurface {
  [CmdletBinding()]
  param()

  $requirements = @(
    @{ name = "Add-AppxPackage"; parameters = @("Path", "ErrorAction") },
    @{ name = "Get-AppxPackage"; parameters = @("Name", "ErrorAction") },
    @{ name = "Remove-AppxPackage"; parameters = @("Package", "Confirm") },
    @{ name = "Reset-AppxPackage"; parameters = @("Package") },
    @{ name = "Get-AuthenticodeSignature"; parameters = @("LiteralPath") },
    @{ name = "Get-CimInstance"; parameters = @("ClassName", "Filter") },
    @{ name = "Get-NetTCPConnection"; parameters = @("OwningProcess") },
    @{ name = "Confirm-SecureBootUEFI"; parameters = @() },
    @{ name = "Get-Tpm"; parameters = @() },
    @{ name = "Get-MpComputerStatus"; parameters = @() },
    @{ name = "Compress-Archive"; parameters = @("LiteralPath", "DestinationPath") }
  )
  $records = [Collections.Generic.List[object]]::new()
  foreach ($requirement in $requirements) {
    $command = Get-Command $requirement.name -ErrorAction Stop
    foreach ($parameterName in $requirement.parameters) {
      if (-not $command.Parameters.ContainsKey($parameterName)) {
        throw "Required command parameter is unavailable: $($requirement.name) -$parameterName"
      }
    }
    $records.Add([pscustomobject][ordered]@{
      name = $requirement.name
      commandType = $command.CommandType.ToString()
      module = [string]$command.ModuleName
      requiredParameters = @($requirement.parameters)
    })
  }
  @($records)
}

function Get-OracleStage3R9AcceptedPublicCertificate {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][object]$Contract,
    [Parameter(Mandatory = $true)][string]$TransferRoot
  )

  $payloadRoot = Join-Path $TransferRoot "payload"
  $releaseManifestPath = Join-Path $payloadRoot (
    [string]$Contract.package.releaseManifestFileName
  )
  $releaseSignaturePath = "$releaseManifestPath.p7s"
  if (
    -not (Test-Path -LiteralPath $releaseManifestPath -PathType Leaf) -or
    -not (Test-Path -LiteralPath $releaseSignaturePath -PathType Leaf)
  ) { throw "Accepted Release Manifest or detached signature is unavailable." }
  Add-Type -AssemblyName System.Security
  $content = [Security.Cryptography.Pkcs.ContentInfo]::new(
    [IO.File]::ReadAllBytes($releaseManifestPath)
  )
  $cms = [Security.Cryptography.Pkcs.SignedCms]::new($content, $true)
  $cms.Decode([IO.File]::ReadAllBytes($releaseSignaturePath))
  $cms.CheckSignature($true)
  if ($cms.SignerInfos.Count -ne 1) {
    throw "Accepted Release Manifest signer cardinality differs."
  }
  $certificate = $cms.SignerInfos[0].Certificate
  if (
    $null -eq $certificate -or
    $certificate.Thumbprint -cne
      [string]$Contract.stage2.certificateThumbprint -or
    $certificate.Subject -cne [string]$Contract.package.publisher -or
    $certificate.HasPrivateKey -or
    $certificate.NotAfter.ToUniversalTime() -ne
      [DateTime]::ParseExact(
        [string]$Contract.stage2.certificateNotAfterUtc,
        "yyyy-MM-ddTHH:mm:ss.fffZ",
        [Globalization.CultureInfo]::InvariantCulture,
        [Globalization.DateTimeStyles]::AssumeUniversal
      ).ToUniversalTime()
  ) { throw "Accepted detached signer certificate identity differs." }
  $certificate
}

function Invoke-OracleStage3R9ReadOnlyProcess {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][string]$Executable,
    [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$Arguments
  )

  if (-not (Test-Path -LiteralPath $Executable -PathType Leaf)) {
    throw "Required read-only executable is unavailable: $Executable"
  }
  if (@($Arguments | Where-Object {
    $_ -match '[\s"]' -or $_.EndsWith("\")
  }).Count -ne 0) {
    throw "Read-only preflight process received an unsafe native argument."
  }
  $info = [Diagnostics.ProcessStartInfo]::new()
  $info.FileName = $Executable
  $info.Arguments = [string]::Join(" ", $Arguments)
  $info.UseShellExecute = $false
  $info.CreateNoWindow = $true
  $info.RedirectStandardOutput = $true
  $info.RedirectStandardError = $true
  $process = [Diagnostics.Process]::new()
  $process.StartInfo = $info
  $startedAtUtc = [DateTime]::UtcNow
  try {
    if (-not $process.Start()) {
      throw "Read-only preflight process did not start."
    }
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    $process.WaitForExit()
    $record = [pscustomobject][ordered]@{
      executable = $Executable
      arguments = @($Arguments)
      startedAtUtc = $startedAtUtc.ToString("o")
      completedAtUtc = [DateTime]::UtcNow.ToString("o")
      stdout = $stdoutTask.GetAwaiter().GetResult()
      stderr = $stderrTask.GetAwaiter().GetResult()
      exitCode = $process.ExitCode
      signal = $null
      processError = $null
    }
  } catch {
    throw "Read-only preflight process failed: $($_.Exception.Message)"
  } finally {
    $process.Dispose()
  }
  if ($record.exitCode -ne 0) {
    throw "Read-only preflight process exited with status $($record.exitCode)."
  }
  $record
}

function Assert-OracleStage3R9NoReparseTraversal([string]$Path) {
  $cursor = [IO.Path]::GetFullPath($Path)
  while ($cursor) {
    if (Test-Path -LiteralPath $cursor) {
      $item = Get-Item -LiteralPath $cursor -Force -ErrorAction Stop
      if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "Pre-authority path traverses a reparse point: $cursor"
      }
    }
    $parent = Split-Path -Parent $cursor
    if ($parent -eq $cursor) { break }
    $cursor = $parent
  }
}

function Get-OracleStage3R9PreAuthorityObservation {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][object]$Contract,
    [Parameter(Mandatory = $true)][string]$TransferRoot,
    [Parameter(Mandatory = $true)][string]$EvidenceReturnRoot,
    [Parameter(Mandatory = $true)][string]$HostContinuityPath,
    [Parameter(Mandatory = $true)][string]$ExpectedHostContinuitySha256,
    [Parameter(Mandatory = $true)][scriptblock]$GetSha256,
    [Parameter(Mandatory = $true)][scriptblock]$GetCertificateMatches
  )

  if ($PSVersionTable.PSEdition -cne "Desktop") {
    throw "Founder-QA-01 requires Windows PowerShell Desktop edition."
  }
  if (
    $PSVersionTable.PSVersion.Major -ne 5 -or
    $PSVersionTable.PSVersion.Minor -ne 1 -or
    -not [Environment]::Is64BitProcess
  ) { throw "Founder-QA-01 requires 64-bit Windows PowerShell 5.1." }
  if (
    [string]$Contract.preAuthority.requiredElevation -cne "administrator" -or
    -not (Test-OracleStage3R9ProcessIsElevated)
  ) {
    throw "Machine-scoped AppX trust requires an elevated Windows PowerShell process."
  }
  if (
    [string]::IsNullOrWhiteSpace($env:COMPUTERNAME) -or
    -not (Test-OracleWindowsComputerName (
      [string]$env:COMPUTERNAME
    ) ([string]$Contract.host.deviceName))
  ) { throw "Pre-authority host identity differs from Founder-QA-01." }

  foreach ($path in @($TransferRoot, $EvidenceReturnRoot, $HostContinuityPath)) {
    Assert-OracleStage3R9NoReparseTraversal $path
  }
  if (
    -not (Test-Path -LiteralPath $TransferRoot -PathType Container) -or
    -not (Test-Path -LiteralPath $EvidenceReturnRoot -PathType Container) -or
    -not (Test-Path -LiteralPath $HostContinuityPath -PathType Leaf)
  ) { throw "Pre-authority transfer, continuity or return root is unavailable." }
  $transferFull = [IO.Path]::GetFullPath($TransferRoot).TrimEnd("\")
  $returnFull = [IO.Path]::GetFullPath($EvidenceReturnRoot).TrimEnd("\")
  if (
    $transferFull -ceq $returnFull -or
    $transferFull.StartsWith("$returnFull\", [StringComparison]::OrdinalIgnoreCase) -or
    $returnFull.StartsWith("$transferFull\", [StringComparison]::OrdinalIgnoreCase)
  ) { throw "Pre-authority transfer and evidence-return roots are not isolated." }
  [void](Get-Acl -LiteralPath $EvidenceReturnRoot -ErrorAction Stop)

  $commands = @(Assert-OracleStage3R9CommandSurface)
  $windowsExecutables = [ordered]@{
    certutil = Get-OracleStage3R9WindowsExecutablePath -Name "certutil.exe"
    reagentc = Get-OracleStage3R9WindowsExecutablePath -Name "reagentc.exe"
  }
  $applicationActivation = Test-OracleStage3R9ApplicationActivationApi
  if (-not $applicationActivation.available) {
    throw (
      "IApplicationActivationManager is unavailable before authority: " +
      "$($applicationActivation.hresult); $($applicationActivation.error)"
    )
  }
  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $recovery = Invoke-OracleStage3R9ReadOnlyProcess `
    -Executable $windowsExecutables.reagentc `
    -Arguments @("/info")
  if ($recovery.stdout -notmatch '(?im)Windows RE status:\s+Enabled') {
    throw "Pre-authority Windows recovery is not enabled."
  }

  $computerSystem = Get-CimInstance Win32_ComputerSystem -ErrorAction Stop
  $manufacturer = [string](Get-OracleStage3R9RequiredPropertyValue `
    $computerSystem "Manufacturer" "Win32_ComputerSystem")
  $model = [string](Get-OracleStage3R9RequiredPropertyValue `
    $computerSystem "Model" "Win32_ComputerSystem")
  if (
    $manufacturer -cne [string]$Contract.host.manufacturer -or
    $model -cne [string]$Contract.host.model
  ) { throw "Pre-authority host manufacturer or model differs." }

  $secureBoot = Confirm-SecureBootUEFI -ErrorAction Stop
  $tpm = Get-Tpm -ErrorAction Stop
  $defender = Get-MpComputerStatus -ErrorAction Stop
  foreach ($member in @("TpmPresent", "TpmReady")) {
    [void](Get-OracleStage3R9RequiredPropertyValue $tpm $member "Get-Tpm")
  }
  foreach ($member in @("AntivirusEnabled", "RealTimeProtectionEnabled")) {
    [void](Get-OracleStage3R9RequiredPropertyValue $defender $member "Get-MpComputerStatus")
  }
  if (
    -not $secureBoot -or
    -not [bool](Get-OracleStage3R9RequiredPropertyValue $tpm "TpmPresent" "Get-Tpm") -or
    -not [bool](Get-OracleStage3R9RequiredPropertyValue $tpm "TpmReady" "Get-Tpm") -or
    -not [bool](Get-OracleStage3R9RequiredPropertyValue (
      $defender
    ) "AntivirusEnabled" "Get-MpComputerStatus") -or
    -not [bool](Get-OracleStage3R9RequiredPropertyValue (
      $defender
    ) "RealTimeProtectionEnabled" "Get-MpComputerStatus")
  ) { throw "Pre-authority security state is incomplete." }

  $activation = @(Get-CimInstance SoftwareLicensingProduct -ErrorAction Stop |
    Where-Object {
      $partialKey = Get-OracleStage3R9RequiredPropertyValue `
        $_ "PartialProductKey" "SoftwareLicensingProduct"
      $licenseStatus = Get-OracleStage3R9RequiredPropertyValue `
        $_ "LicenseStatus" "SoftwareLicensingProduct"
      $partialKey -and [int]$licenseStatus -eq 1
    })
  if ($activation.Count -eq 0) { throw "Pre-authority Windows activation is unavailable." }

  $installedSoftware = @(Get-OracleStage3R9InstalledSoftwareInventory)
  $packages = @(Get-AppxPackage -Name $Contract.package.identity -ErrorAction Stop)
  if ($packages.Count -ne 0) { throw "Governed Oracle package is already installed." }
  $certificateMatches = @(& $GetCertificateMatches)
  if ($certificateMatches.Count -ne 0) {
    throw "Governed Stage 2 R2 certificate is already present."
  }
  $acceptedPackagePath = Join-Path (
    Join-Path $TransferRoot "payload"
  ) ([string]$Contract.package.fileName)
  $untrustedSignature = Get-AuthenticodeSignature `
    -LiteralPath $acceptedPackagePath -ErrorAction Stop
  foreach ($member in @("Status", "SignerCertificate")) {
    [void](Get-OracleStage3R9RequiredPropertyValue (
      $untrustedSignature
    ) $member "Get-AuthenticodeSignature")
  }
  $signerCertificate = Get-OracleStage3R9AcceptedPublicCertificate `
    -Contract $Contract -TransferRoot $TransferRoot
  $observedUntrustedSigner = Get-OracleStage3R9RequiredPropertyValue `
    $untrustedSignature "SignerCertificate" "Get-AuthenticodeSignature"
  if (
    [string](Get-OracleStage3R9RequiredPropertyValue (
      $untrustedSignature
    ) "Status" "Get-AuthenticodeSignature") -ceq "Valid"
  ) { throw "Pre-authority untrusted package signature state differs." }
  if (
    $null -ne $observedUntrustedSigner -and
    (
      [string]$observedUntrustedSigner.Thumbprint -cne
        [string]$Contract.stage2.certificateThumbprint -or
      [string]$observedUntrustedSigner.Subject -cne
        [string]$Contract.package.publisher
    )
  ) { throw "Pre-authority observable MSIX signer identity differs." }
  $tcpConnections = @(Get-NetTCPConnection -ErrorAction Stop)
  foreach ($connection in $tcpConnections) {
    foreach ($member in @("OwningProcess", "State", "RemoteAddress")) {
      [void](Get-OracleStage3R9RequiredPropertyValue (
        $connection
      ) $member "Get-NetTCPConnection")
    }
  }

  if (
    $ExpectedHostContinuitySha256 -cnotmatch '^[0-9a-f]{64}$' -or
    (& $GetSha256 $HostContinuityPath) -cne $ExpectedHostContinuitySha256
  ) { throw "Founder-approved host-continuity hash differs." }
  $continuity = Get-Content -LiteralPath $HostContinuityPath -Raw -ErrorAction Stop |
    ConvertFrom-Json
  foreach ($member in @(
    "contract", "programmeIdentity", "recordedAtUtc", "result", "issues",
    "host", "historicalAdmissionSha256"
  )) {
    [void](Get-OracleStage3R9RequiredPropertyValue $continuity $member "host continuity")
  }
  foreach ($member in @("deviceName", "manufacturer", "model")) {
    [void](Get-OracleStage3R9RequiredPropertyValue $continuity.host $member "host continuity host")
  }
  $recordedAt = [DateTime]::ParseExact(
    [string]$continuity.recordedAtUtc,
    "yyyy-MM-ddTHH:mm:ss.fffffffZ",
    [Globalization.CultureInfo]::InvariantCulture,
    [Globalization.DateTimeStyles]::AssumeUniversal
  ).ToUniversalTime()
  $now = [DateTime]::UtcNow
  if (
    [string]$continuity.contract -cne
      "oracle.sprint-30-5.stage-3-r9-host-continuity" -or
    [string]$continuity.programmeIdentity -cne [string]$Contract.programmeIdentity -or
    [string]$continuity.result -cne "passed" -or
    @($continuity.issues).Count -ne 0 -or
    -not (Test-OracleWindowsComputerName (
      [string]$continuity.host.deviceName
    ) ([string]$Contract.host.deviceName)) -or
    [string]$continuity.host.manufacturer -cne [string]$Contract.host.manufacturer -or
    [string]$continuity.host.model -cne [string]$Contract.host.model -or
    [string]$continuity.historicalAdmissionSha256 -cne
      [string]$Contract.host.hostAdmissionSha256 -or
    $recordedAt -gt $now -or
    ($now - $recordedAt).TotalMinutes -gt
      [double]$Contract.host.continuityMaximumAgeMinutes
  ) { throw "Founder-approved host continuity is stale, malformed or mismatched." }
  if (
    $now -ge [DateTime]::ParseExact(
      [string]$Contract.stage2.latestExecutionStartUtc,
      "yyyy-MM-ddTHH:mm:ss.fffZ",
      [Globalization.CultureInfo]::InvariantCulture,
      [Globalization.DateTimeStyles]::AssumeUniversal
    ).ToUniversalTime()
  ) { throw "Certificate execution-start margin is unavailable." }

  $developmentTools = @("node", "npm", "git", "python", "docker", "dotnet", "msbuild") |
    ForEach-Object {
      [pscustomobject][ordered]@{
        name = $_
        available = $null -ne (Get-Command $_ -ErrorAction SilentlyContinue)
      }
    }
  if (@($developmentTools | Where-Object { $_.available }).Count -ne 0) {
    throw "Pre-authority host contains development tooling."
  }

  [pscustomobject][ordered]@{
    result = "passed"
    classification = @(
      "NON-QUALIFICATION",
      "NON-AUTHORITY",
      "NON-EVIDENCE",
      "READ-ONLY PRE-AUTHORITY PREFLIGHT"
    )
    observedAtUtc = $now.ToString("o")
    powershell = [ordered]@{
      edition = $PSVersionTable.PSEdition
      version = $PSVersionTable.PSVersion.ToString()
      is64BitProcess = [Environment]::Is64BitProcess
      elevated = $true
    }
    host = [ordered]@{
      deviceName = $env:COMPUTERNAME
      manufacturer = $manufacturer
      model = $model
    }
    security = [ordered]@{
      secureBoot = $secureBoot
      tpmPresent = [bool](Get-OracleStage3R9RequiredPropertyValue (
        $tpm
      ) "TpmPresent" "Get-Tpm")
      tpmReady = [bool](Get-OracleStage3R9RequiredPropertyValue (
        $tpm
      ) "TpmReady" "Get-Tpm")
      defenderAntivirusEnabled = [bool](Get-OracleStage3R9RequiredPropertyValue (
        $defender
      ) "AntivirusEnabled" "Get-MpComputerStatus")
      defenderRealTimeProtectionEnabled = [bool](
        Get-OracleStage3R9RequiredPropertyValue (
          $defender
        ) "RealTimeProtectionEnabled" "Get-MpComputerStatus"
      )
      activatedProductCount = $activation.Count
    }
    commandSurface = $commands
    windowsExecutables = $windowsExecutables
    applicationActivation = $applicationActivation
    developmentTools = $developmentTools
    recovery = $recovery
    registryViews = @("machine-64", "machine-32", "current-user")
    installedSoftware = $installedSoftware
    installedSoftwareCount = $installedSoftware.Count
    packageCount = $packages.Count
    certificateMatchCount = $certificateMatches.Count
    platformProbe = [ordered]@{
      untrustedAuthenticodeStatus = [string]$untrustedSignature.Status
      signerThumbprint = [string]$signerCertificate.Thumbprint
      signerSubject = [string]$signerCertificate.Subject
      tcpConnectionCount = $tcpConnections.Count
    }
    continuitySha256 = $ExpectedHostContinuitySha256
    continuityRecordedAtUtc = $recordedAt.ToString("o")
    transferRoot = $transferFull
    evidenceReturnRoot = $returnFull
    authorityCreated = $false
    attemptCreated = $false
    hostMutation = $false
  }
}
