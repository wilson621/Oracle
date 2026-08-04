[CmdletBinding()]
param([switch]$TeardownOnly)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$classification = @(
  "STAGE-4-R2-INSTALLED-PACKAGE-CONTROLLER",
  "SECRET-BEARING-NON-EVIDENCE-CONTROLLER"
)
$scriptRoot = $PSScriptRoot
$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $scriptRoot "..\..\.."))
$contractPath = Join-Path $scriptRoot "Oracle.Stage4R2Contract.json"
$contract = Get-Content -Raw -LiteralPath $contractPath | ConvertFrom-Json
$developmentRehearsal = [Environment]::GetEnvironmentVariable("ORACLE_STAGE4_INSTALLED_DEVELOPMENT_REHEARSAL", "Process") -ceq "1"
. (Join-Path $scriptRoot "Oracle.Stage4R2ActivationPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage4R2InstalledRuntimeConfigurationPolicy.ps1")

function Require-Environment([string]$Name) {
  $value = [Environment]::GetEnvironmentVariable($Name, "Process")
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Required installed-package setting is absent: $Name"
  }
  $value
}

function Write-CreateOnlyJson([string]$Path, $Value) {
  $parent = Split-Path -Parent $Path
  [IO.Directory]::CreateDirectory($parent) | Out-Null
  $bytes = [Text.UTF8Encoding]::new($false).GetBytes(
    (($Value | ConvertTo-Json -Depth 12) + "`n")
  )
  $stream = [IO.FileStream]::new(
    $Path,
    [IO.FileMode]::CreateNew,
    [IO.FileAccess]::Write,
    [IO.FileShare]::None
  )
  try {
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush($true)
  } finally {
    $stream.Dispose()
  }
}

function Assert-Administrator {
  $principal = [Security.Principal.WindowsPrincipal]::new(
    [Security.Principal.WindowsIdentity]::GetCurrent()
  )
  if (-not $principal.IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
  )) {
    throw "Installed Stage 4 R2 execution requires elevated Windows PowerShell."
  }
}

function Get-ExactCertificate {
  @(
    Get-ChildItem -LiteralPath ([string]$contract.package.trustStore) -ErrorAction Stop |
      Where-Object {
        $_.Thumbprint -ceq [string]$contract.stage2.certificateThumbprint
      }
  )
}

function Get-OraclePackages {
  @(Get-AppxPackage -Name ([string]$contract.package.identity) -ErrorAction SilentlyContinue)
}

function Get-ProcessSnapshot {
  @(Get-CimInstance Win32_Process -ErrorAction Stop)
}

function Get-DescendantProcessIds([uint32]$RootProcessId, $Snapshot) {
  $ids = [Collections.Generic.HashSet[uint32]]::new()
  [void]$ids.Add($RootProcessId)
  do {
    $changed = $false
    foreach ($process in $Snapshot) {
      $pidValue = [uint32]$process.ProcessId
      if (
        -not $ids.Contains($pidValue) -and
        $ids.Contains([uint32]$process.ParentProcessId)
      ) {
        [void]$ids.Add($pidValue)
        $changed = $true
      }
    }
  } while ($changed)
  @($ids | ForEach-Object { [uint32]$_ })
}

function Assert-PackageOwnedProcess(
  $Process,
  [string]$InstallLocation
) {
  if ([string]::IsNullOrWhiteSpace([string]$Process.ExecutablePath)) {
    throw "Oracle process executable path is unavailable."
  }
  $path = [IO.Path]::GetFullPath([string]$Process.ExecutablePath)
  $root = [IO.Path]::GetFullPath($InstallLocation).TrimEnd('\') + '\'
  if (-not $path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Oracle process is not owned by the installed R6 package."
  }
}

function Find-InstalledWebOrigin(
  [uint32]$RootProcessId,
  [string]$InstallLocation
) {
  $deadline = [DateTime]::UtcNow.AddSeconds(30)
  do {
    $snapshot = Get-ProcessSnapshot
    $ids = @(Get-DescendantProcessIds $RootProcessId $snapshot)
    foreach ($id in $ids) {
      $process = @($snapshot | Where-Object { [uint32]$_.ProcessId -eq $id })
      if ($process.Count -eq 1) {
        Assert-PackageOwnedProcess $process[0] $InstallLocation
      }
    }
    $listeners = @(
      Get-NetTCPConnection -State Listen -ErrorAction Stop |
        Where-Object {
          $_.LocalAddress -in @("127.0.0.1", "::1") -and
          [uint32]$_.OwningProcess -in $ids
        }
    )
    $admitted = @()
    foreach ($listener in $listeners) {
      $origin = "http://127.0.0.1:$([int]$listener.LocalPort)"
      try {
        $response = Invoke-WebRequest -Uri "$origin/auth" -UseBasicParsing `
          -MaximumRedirection 0 -TimeoutSec 2 -ErrorAction Stop
        if ([int]$response.StatusCode -eq 200) {
          $admitted += [pscustomobject]@{
            origin = $origin
            port = [int]$listener.LocalPort
            owningProcessId = [uint32]$listener.OwningProcess
          }
        }
      } catch {
        # A listener is admitted only by an affirmative Oracle HTTP response.
      }
    }
    $unique = @($admitted | Sort-Object origin -Unique)
    if ($unique.Count -eq 1) {
      return [pscustomobject][ordered]@{
        origin = [string]$unique[0].origin
        port = [int]$unique[0].port
        owningProcessId = [uint32]$unique[0].owningProcessId
        rootProcessId = $RootProcessId
        processIds = @($ids | Sort-Object)
        ownership = "exact-installed-package-process-tree"
      }
    }
    if ($unique.Count -gt 1) {
      throw "Multiple package-owned Oracle HTTP listeners were admitted."
    }
    Start-Sleep -Milliseconds 200
  } while ([DateTime]::UtcNow -lt $deadline)
  throw "The package-owned Oracle HTTP listener was not admitted within 30 seconds."
}

function Stop-PackageProcesses([string]$InstallLocation) {
  if ([string]::IsNullOrWhiteSpace($InstallLocation)) { return 0 }
  $snapshot = Get-ProcessSnapshot
  $owned = @($snapshot | Where-Object {
    -not [string]::IsNullOrWhiteSpace([string]$_.ExecutablePath) -and
    [IO.Path]::GetFullPath([string]$_.ExecutablePath).StartsWith(
      [IO.Path]::GetFullPath($InstallLocation).TrimEnd('\') + '\',
      [StringComparison]::OrdinalIgnoreCase
    )
  })
  foreach ($process in @($owned | Sort-Object ProcessId -Descending)) {
    Assert-PackageOwnedProcess $process $InstallLocation
    Stop-Process -Id ([int]$process.ProcessId) -Force -ErrorAction Stop
  }
  $deadline = [DateTime]::UtcNow.AddSeconds(10)
  do {
    $remaining = @(Get-ProcessSnapshot | Where-Object {
      -not [string]::IsNullOrWhiteSpace([string]$_.ExecutablePath) -and
      [IO.Path]::GetFullPath([string]$_.ExecutablePath).StartsWith(
        [IO.Path]::GetFullPath($InstallLocation).TrimEnd('\') + '\',
        [StringComparison]::OrdinalIgnoreCase
      )
    })
    if ($remaining.Count -eq 0) { return $owned.Count }
    Start-Sleep -Milliseconds 100
  } while ([DateTime]::UtcNow -lt $deadline)
  throw "Package-owned Oracle processes remain after bounded teardown."
}

Assert-Administrator
if ([string]$contract.executionSurface -cne "accepted-r6-installed-msix") {
  throw "R2 execution surface differs."
}

$attemptRoot = [IO.Path]::GetFullPath((Require-Environment "ORACLE_STAGE4_ATTEMPT_ROOT"))
$logsRoot = Join-Path $attemptRoot "logs"
$journeyOutput = [IO.Path]::GetFullPath((Require-Environment "ORACLE_STAGE4_JOURNEY_OUTPUT"))
$transferRootSetting = [Environment]::GetEnvironmentVariable('ORACLE_STAGE4_TRANSFER_ROOT', 'Process')
if ($developmentRehearsal) {
  $msixPath = [IO.Path]::GetFullPath((Join-Path $repositoryRoot ([string]$contract.package.artifactPath)))
  $certificatePath = [IO.Path]::GetFullPath((Join-Path $repositoryRoot ([string]$contract.package.publicCertificatePath)))
} else {
  if ([string]::IsNullOrWhiteSpace($transferRootSetting)) { throw 'Governed transfer root is absent.' }
  $transferRootFull = [IO.Path]::GetFullPath($transferRootSetting)
  $approvedTransferRoot = [IO.Path]::GetFullPath((Join-Path $repositoryRoot ([string]$contract.paths.transferRoot))).TrimEnd('\') + '\'
  if (-not $transferRootFull.StartsWith($approvedTransferRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'Governed transfer root escapes its approved boundary.' }
  $msixPath = [IO.Path]::GetFullPath((Join-Path $transferRootFull ([string]$contract.transfer.msixRelativePath)))
  $certificatePath = [IO.Path]::GetFullPath((Join-Path $transferRootFull ([string]$contract.transfer.certificateRelativePath)))
}
$configurationPath = $null
$configurationHash = $null
$packageFamilyName = $null
$packageFullName = $null
$installLocation = $null
$packageRoot = $null
$trustEstablished = $false
$packageInstalled = $false
$primaryFailure = $null
$cleanupFailures = [Collections.Generic.List[string]]::new()
$redactionValues = [Collections.Generic.List[string]]::new()
foreach ($name in @("ORACLE_STAGE4_ANON_KEY", "SUPABASE_SECRET_KEY", "ORACLE_WEB_SESSION_SECRET")) {
  $value = [Environment]::GetEnvironmentVariable($name, "Process")
  if (-not [string]::IsNullOrEmpty($value)) { $redactionValues.Add($value) }
}
$phases = [Collections.Generic.List[object]]::new()
$mark = {
  param([string]$Phase, $Details)
  $phases.Add([pscustomobject][ordered]@{
    phase = $Phase
    observedAtUtc = [DateTime]::UtcNow.ToString("o")
    details = $Details
  })
}

try {
  if ($TeardownOnly) {
    $existingPackages = @(Get-OraclePackages)
    if ($existingPackages.Count -gt 1) { throw "Multiple Oracle packages prevent bounded safety teardown." }
    if ($existingPackages.Count -eq 1) {
      $packageInstalled = $true
      $packageFamilyName = [string]$existingPackages[0].PackageFamilyName
      $packageFullName = [string]$existingPackages[0].PackageFullName
      $installLocation = [string]$existingPackages[0].InstallLocation
      $packageRoot = Join-Path $env:LOCALAPPDATA "Packages\$packageFamilyName"
      if ($packageFamilyName -cne [string]$contract.package.familyName -or $packageFullName -cne [string]$contract.package.fullName) {
        throw "Safety teardown package identity differs."
      }
    } else {
      $packageRoot = Join-Path $env:LOCALAPPDATA "Packages\$([string]$contract.package.familyName)"
    }
    $trustEstablished = @(Get-ExactCertificate).Count -eq 1
  } else {
    if ($developmentRehearsal) {
      if ([Environment]::GetEnvironmentVariable("ORACLE_STAGE4_EXECUTION_MODE", "Process") -cne "development-rehearsal") {
        throw "Installed rehearsal mode is mismatched."
      }
      $attemptId = Require-Environment "ORACLE_STAGE4_R2_REHEARSAL_IDENTITY"
      if ($attemptId -cnotmatch [string]$contract.identity.attemptPattern) {
        throw "Installed rehearsal identity is malformed."
      }
      $authorityId = "authority-$attemptId"
      $founderGrantId = $attemptId -replace '^stage4-r2-', 'founder-stage4-r2-grant-'
    } else {
      if (
        [string]$contract.executionAuthority.founderAuthorisedQualificationExecution -ne "True" -or
        [string]$contract.executionAuthority.authorityCreationPermitted -ne "True" -or
        [string]$contract.executionAuthority.qualificationAttemptPermitted -ne "True"
      ) {
        throw "R2 contract does not authorise qualification execution."
      }
      $authorityPath = [IO.Path]::GetFullPath((Require-Environment "ORACLE_STAGE4_AUTHORITY_RECORD"))
      $authority = Get-Content -Raw -LiteralPath $authorityPath | ConvertFrom-Json
      if ($authority.consumed -ne $true) {
        throw "Installed controller authority is not consumed."
      }
      $founderGrantId = [string]$authority.founderGrantId
      $authorityId = [string]$authority.authorityId
      $attemptId = [string]$authority.attemptId
      $expectedAttemptRoot = [IO.Path]::GetFullPath((Join-Path (
        [IO.Path]::GetFullPath((Join-Path $repositoryRoot ([string]$contract.paths.artifactRoot)))
      ) $attemptId))
      if ($attemptRoot -cne $expectedAttemptRoot) {
        throw "Installed controller attempt root is mismatched."
      }
    }

    if (@(Get-OraclePackages).Count -ne 0 -or @(Get-ExactCertificate).Count -ne 0) {
      throw "Installed R2 requires zero package and certificate pre-state."
    }
    if ((Get-FileHash -LiteralPath $msixPath -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$contract.stage2.msixSha256) {
      throw "Accepted R6 MSIX hash differs."
    }
    if ((Get-FileHash -LiteralPath $certificatePath -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$contract.package.publicCertificateSha256) {
      throw "Accepted R6 public certificate hash differs."
    }
    $certificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new($certificatePath)
    if (
      $certificate.Thumbprint -cne [string]$contract.stage2.certificateThumbprint -or
      $certificate.HasPrivateKey -or
      $certificate.Subject -cne [string]$contract.package.publisher
    ) {
      throw "Accepted R6 public certificate identity differs."
    }
    & $mark "zero-state-verified" @{ packages = 0; certificates = 0 }

    $import = Import-Certificate -FilePath $certificatePath `
      -CertStoreLocation ([string]$contract.package.trustStore) -ErrorAction Stop
    $trustEstablished = $true
    if ($import.Thumbprint -cne [string]$contract.stage2.certificateThumbprint) {
      throw "Exact R6 trust import differs."
    }
    & $mark "trust-established" @{ thumbprint = $import.Thumbprint }

    Add-AppxPackage -Path $msixPath -ErrorAction Stop
    $packageInstalled = $true
    $packages = @(Get-OraclePackages)
    if ($packages.Count -ne 1 -or [string]$packages[0].Version -cne [string]$contract.package.version) {
      throw "Exact R6 package registration differs."
    }
    $packageFamilyName = [string]$packages[0].PackageFamilyName
    $packageFullName = [string]$packages[0].PackageFullName
    $installLocation = [string]$packages[0].InstallLocation
    $packageRoot = Join-Path $env:LOCALAPPDATA "Packages\$packageFamilyName"
    $applicationData = [Windows.Management.Core.ApplicationDataManager, Windows.Management.Core, ContentType=WindowsRuntime]::CreateForPackageFamily($packageFamilyName)
    if ($null -eq $applicationData -or [IO.Path]::GetFullPath([string]$applicationData.LocalFolder.Path) -cne [IO.Path]::GetFullPath((Join-Path $packageRoot "LocalState"))) {
      throw "Installed R2 package data initialization differs."
    }
    & $mark "package-installed" @{ packageFullName = $packageFullName; familyName = $packageFamilyName }

    $providerUrl = Require-Environment "ORACLE_STAGE4_PROVIDER_URL"
    $anonKey = Require-Environment "ORACLE_STAGE4_ANON_KEY"
    $serviceKey = Require-Environment "SUPABASE_SECRET_KEY"
    $sessionSecret = Require-Environment "ORACLE_WEB_SESSION_SECRET"
    $serviceSecure = ConvertTo-SecureString $serviceKey -AsPlainText -Force
    $sessionSecure = ConvertTo-SecureString $sessionSecret -AsPlainText -Force
    $configurationId = "runtime-$attemptId"
    $configuration = New-OracleInstalledRuntimeConfiguration `
      -PackageFamilyName $packageFamilyName `
      -ExpectedPackageFamilyName $packageFamilyName `
      -ConfigurationId $configurationId `
      -FounderGrantId $founderGrantId `
      -AuthorityId $authorityId `
      -AttemptId $attemptId `
      -CandidateCommit ([string]$contract.stage2.candidateCommit) `
      -CandidateTree ([string]$contract.stage2.candidateTree) `
      -MsixSha256 ([string]$contract.stage2.msixSha256) `
      -ExpectedCandidateCommit ([string]$contract.stage2.candidateCommit) `
      -ExpectedCandidateTree ([string]$contract.stage2.candidateTree) `
      -ExpectedMsixSha256 ([string]$contract.stage2.msixSha256) `
      -ProviderUrl $providerUrl `
      -ProviderAnonKey $anonKey `
      -ProviderServiceKey $serviceSecure `
      -SessionSecret $sessionSecure `
      -LocalAppDataRoot $env:LOCALAPPDATA
    $configurationPath = [string]$configuration.configurationPath
    $configurationHash = [string]$configuration.sha256
    & $mark "runtime-configuration-created" @{
      configurationId = $configurationId
      sha256 = $configurationHash
      containsSecretValues = $false
    }

    $appUserModelId = "$packageFamilyName!$([string]$contract.package.appId)"
    $arguments = Get-OracleInstalledRuntimeActivationArguments `
      -ConfigurationPath $configurationPath -Sha256 $configurationHash
    $activation = Invoke-OracleStage4R2ApplicationActivation `
      -AppUserModelId $appUserModelId -Arguments $arguments
    Assert-OracleStage4R2ApplicationActivationSucceeded $activation
    & $mark "package-activated" @{
      hresult = $activation.hresult
      processId = $activation.processId
      configurationConsumedAtActivationReturn = -not (Test-Path -LiteralPath $configurationPath)
    }

    $server = Find-InstalledWebOrigin `
      -RootProcessId ([uint32]$activation.processId) `
      -InstallLocation $installLocation
    Write-CreateOnlyJson (Join-Path $logsRoot "installed-server-admission.json") $server
    if (Test-Path -LiteralPath $configurationPath) {
      throw "Installed runtime configuration remained after server admission."
    }
    $configurationDirectory = Split-Path -Parent $configurationPath
    if (@(Get-ChildItem -LiteralPath $configurationDirectory -Force -ErrorAction Stop).Count -ne 0) {
      throw "Installed runtime configuration consumption residue remains."
    }
    $runtimeNamespaceResult = Remove-OracleInstalledRuntimeConfiguration `
      -ConfigurationPath $configurationPath -ExpectedSha256 $configurationHash `
      -LocalAppDataRoot $env:LOCALAPPDATA
    $configurationPath = $null
    & $mark "installed-server-admitted" @{
      origin = $server.origin
      owningProcessId = $server.owningProcessId
      ownership = $server.ownership
      runtimeConfigurationConsumed = $true
      runtimeConfigurationNamespaceRemaining = [int]$runtimeNamespaceResult.remaining
    }

    $nodePath = [IO.Path]::GetFullPath((Require-Environment "ORACLE_STAGE4_NODE_PATH"))
    $journeyScript = Join-Path $scriptRoot "run-live-journey.mjs"
    $env:ORACLE_STAGE4_WEB_ORIGIN = [string]$server.origin
    $process = Start-Process -FilePath $nodePath -ArgumentList @($journeyScript) `
      -WorkingDirectory $repositoryRoot -NoNewWindow -Wait -PassThru
    if ($process.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $journeyOutput -PathType Leaf)) {
      throw "Installed R2 live journey failed with exit code $($process.ExitCode)."
    }
    & $mark "live-journey-passed" @{ outputCreated = $true }
  }
} catch {
  $primaryFailure = $_.Exception
} finally {
  try {
    $stopped = Stop-PackageProcesses $installLocation
    if ($stopped -gt 0) { & $mark "package-processes-stopped" @{ count = $stopped } }
  } catch { $cleanupFailures.Add("process-stop: $($_.Exception.Message)") }
  try {
    if ($null -ne $configurationPath -and (Test-Path -LiteralPath $configurationPath)) {
      Remove-OracleInstalledRuntimeConfiguration -ConfigurationPath $configurationPath `
        -ExpectedSha256 $configurationHash -LocalAppDataRoot $env:LOCALAPPDATA | Out-Null
    }
  } catch { $cleanupFailures.Add("runtime-configuration: $($_.Exception.Message)") }
  try {
    if ($packageInstalled -and [string]::IsNullOrWhiteSpace($packageFullName)) {
      $cleanupPackages = @(Get-OraclePackages)
      if ($cleanupPackages.Count -ne 1) { throw "Partially installed Oracle package identity is unavailable for teardown." }
      $packageFullName = [string]$cleanupPackages[0].PackageFullName
      $packageFamilyName = [string]$cleanupPackages[0].PackageFamilyName
      $installLocation = [string]$cleanupPackages[0].InstallLocation
      $packageRoot = Join-Path $env:LOCALAPPDATA "Packages\$packageFamilyName"
    }
    if ($packageInstalled -and -not [string]::IsNullOrWhiteSpace($packageFullName)) {
      Remove-AppxPackage -Package $packageFullName -ErrorAction Stop
    }
    if (@(Get-OraclePackages).Count -ne 0) { throw "Oracle package residue remains." }
    if ($null -ne $packageRoot -and (Test-Path -LiteralPath $packageRoot)) {
      Assert-OracleRuntimePath -Path $packageRoot -RequiredRoot (Join-Path $env:LOCALAPPDATA "Packages")
      Remove-Item -LiteralPath $packageRoot -Recurse -Force -ErrorAction Stop
    }
    & $mark "package-removed" @{ remaining = 0 }
  } catch { $cleanupFailures.Add("package-remove: $($_.Exception.Message)") }
  try {
    if ($trustEstablished) {
      $certificateStorePath = "Cert:\LocalMachine\TrustedPeople\$([string]$contract.stage2.certificateThumbprint)"
      if (Test-Path -LiteralPath $certificateStorePath) {
        Remove-Item -LiteralPath $certificateStorePath -Force -ErrorAction Stop
      }
    }
    if (@(Get-ExactCertificate).Count -ne 0) { throw "Exact R6 trust residue remains." }
    & $mark "trust-removed" @{ remaining = 0 }
  } catch { $cleanupFailures.Add("trust-remove: $($_.Exception.Message)") }
  foreach ($name in @(
    "ORACLE_STAGE4_PROVIDER_URL", "ORACLE_STAGE4_ANON_KEY",
    "SUPABASE_SECRET_KEY", "ORACLE_WEB_SESSION_SECRET",
    "ORACLE_STAGE4_WEB_ORIGIN"
  )) { [Environment]::SetEnvironmentVariable($name, $null, "Process") }
}

function Remove-InstalledSecrets([string]$Text) {
  $safe = [string]$Text
  foreach ($secret in $redactionValues) {
    $safe = $safe.Replace($secret, "[REDACTED]")
  }
  $safe
}

$safePrimaryFailure = if ($null -eq $primaryFailure) { $null } else { Remove-InstalledSecrets $primaryFailure.Message }
$safeCleanupFailures = @($cleanupFailures | ForEach-Object { Remove-InstalledSecrets $_ })
$resultClassification = if ($developmentRehearsal) { @("NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "INSTALLED DEVELOPMENT REHEARSAL") } else { $classification }
$resultStatus = if ($null -eq $primaryFailure -and $cleanupFailures.Count -eq 0) { "passed" } else { "failed" }
$result = [pscustomobject][ordered]@{
  contract = "oracle.sprint-30-5.stage-4-r2-installed-package-result"
  classification = $resultClassification
  result = $resultStatus
  primaryFailure = $safePrimaryFailure
  cleanupFailures = $safeCleanupFailures
  phases = @($phases)
  packageSha256 = [string]$contract.stage2.msixSha256
  secretValuesRecorded = $false
  zeroResidue = (
    @(Get-OraclePackages).Count -eq 0 -and
    @(Get-ExactCertificate).Count -eq 0 -and
    ($null -eq $packageRoot -or -not (Test-Path -LiteralPath $packageRoot))
  )
}
$resultFileName = if ($TeardownOnly) { "installed-safety-teardown.json" } else { "installed-package-result.json" }
$resultPath = Join-Path $logsRoot $resultFileName
if (-not (Test-Path -LiteralPath $resultPath)) {
  Write-CreateOnlyJson $resultPath $result
}
if ($result.result -cne "passed" -or -not $result.zeroResidue) {
  throw "Installed Stage 4 R2 controller failed; teardown result was preserved."
}
$result | ConvertTo-Json -Depth 12
