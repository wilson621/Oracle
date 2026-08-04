Set-StrictMode -Version Latest

$script:OracleRuntimeConfigurationFile = "runtime.json"
$script:OracleRuntimeConfigurationMaximumMinutes = 15

function Initialize-OracleInstalledRuntimePackageData {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][string]$PackageIdentity,
    [Parameter(Mandatory = $true)][string]$PackageFamilyName,
    [Parameter(Mandatory = $true)][string]$ExpectedPackageFamilyName,
    [Parameter(Mandatory = $true)][string]$PackageFullName,
    [Parameter(Mandatory = $true)][string]$ExpectedPackageFullName,
    [Parameter(Mandatory = $true)][string]$LocalAppDataRoot,
    [ValidateRange(1, 600)][int]$RegistrationPollLimit = 120,
    [ValidateRange(0, 5000)][int]$RegistrationPollMilliseconds = 250,
    [scriptblock]$PackageRegistrationProvider,
    [scriptblock]$ApplicationDataFactory
  )

  if (
    $PackageIdentity -cne "Oracle.Platform.LocalCertification" -or
    $PackageFamilyName -cnotmatch '^Oracle\.Platform\.LocalCertification_[a-z0-9]{13}$' -or
    $PackageFullName -cnotmatch '^Oracle\.Platform\.LocalCertification_0\.1\.4\.0_x64__[a-z0-9]{13}$' -or
    $PackageFamilyName -cne $ExpectedPackageFamilyName -or
    $PackageFullName -cne $ExpectedPackageFullName
  ) {
    throw "Post-reset package-data identity is mismatched."
  }

  $registrationPolls = 0
  do {
    $registrationPolls++
    if ($null -ne $PackageRegistrationProvider) {
      $registered = @(& $PackageRegistrationProvider $PackageIdentity)
    } else {
      $registered = @(Get-AppxPackage -Name $PackageIdentity -ErrorAction Stop)
    }
    $matching = @($registered | Where-Object {
      [string]$_.PackageFamilyName -ceq $PackageFamilyName -and
      [string]$_.PackageFullName -ceq $PackageFullName
    })
    if ($registered.Count -eq 1 -and $matching.Count -eq 1) {
      break
    }
    if ($registered.Count -ne 0) {
      $observedIdentities = @($registered | ForEach-Object {
        "$([string]$_.PackageFamilyName)|$([string]$_.PackageFullName)"
      })
      throw (
        "Post-reset package registration is duplicate or mismatched; " +
        "registered=$($registered.Count); matching=$($matching.Count); " +
        "expected=$PackageFamilyName|$PackageFullName; " +
        "observed=$([string]::Join(',', $observedIdentities))."
      )
    }
    if (
      $registrationPolls -lt $RegistrationPollLimit -and
      $RegistrationPollMilliseconds -gt 0
    ) {
      Start-Sleep -Milliseconds $RegistrationPollMilliseconds
    }
  } while ($registrationPolls -lt $RegistrationPollLimit)
  if ($registered.Count -ne 1 -or $matching.Count -ne 1) {
    throw (
      "Post-reset package registration is absent after bounded stabilization; " +
      "polls=$registrationPolls; registered=$($registered.Count); " +
      "expected=$PackageFamilyName|$PackageFullName."
    )
  }

  $localAppData = [IO.Path]::GetFullPath($LocalAppDataRoot)
  $packagesRoot = Join-Path $localAppData "Packages"
  if (-not (Test-Path -LiteralPath $packagesRoot -PathType Container)) {
    throw "Post-reset Packages root is absent."
  }
  Assert-OracleRuntimePath -Path (Join-Path $packagesRoot "probe") -RequiredRoot $packagesRoot
  $packageRoot = Join-Path $packagesRoot $PackageFamilyName
  $packageRootAbsentBefore = -not (Test-Path -LiteralPath $packageRoot)
  Assert-OracleRuntimePath -Path $packageRoot -RequiredRoot $packagesRoot
  $expectedLocalState = Join-Path $packageRoot "LocalState"

  $applicationData = $null
  try {
    $applicationData = if ($null -ne $ApplicationDataFactory) {
      & $ApplicationDataFactory $PackageFamilyName
    } else {
      [Windows.Management.Core.ApplicationDataManager, Windows.Management.Core, ContentType=WindowsRuntime]::CreateForPackageFamily(
        $PackageFamilyName
      )
    }
    if ($null -eq $applicationData -or $null -eq $applicationData.LocalFolder) {
      throw "ApplicationDataManager returned no LocalFolder."
    }
    $observedLocalState = [IO.Path]::GetFullPath([string]$applicationData.LocalFolder.Path)
  } catch {
    throw "Post-reset package-data initialization failed: $($_.Exception.Message)"
  } finally {
    if ($applicationData -is [IDisposable]) {
      $applicationData.Dispose()
    }
  }

  if (
    $observedLocalState -cne [IO.Path]::GetFullPath($expectedLocalState) -or
    -not (Test-Path -LiteralPath $packageRoot -PathType Container) -or
    -not (Test-Path -LiteralPath $expectedLocalState -PathType Container)
  ) {
    throw "Post-reset package-data initialization returned an unexpected path or state."
  }
  Assert-OracleRuntimePath -Path $packageRoot -RequiredRoot $packagesRoot
  Assert-OracleRuntimePath -Path $expectedLocalState -RequiredRoot $packageRoot

  [pscustomobject][ordered]@{
    contract = "oracle.stage3.post-reset-package-data-initialization"
    contractVersion = 1
    api = "Windows.Management.Core.ApplicationDataManager.CreateForPackageFamily"
    packageIdentity = $PackageIdentity
    packageFamilyName = $PackageFamilyName
    packageFullName = $PackageFullName
    packageRootAbsentBefore = $packageRootAbsentBefore
    registrationPolls = $registrationPolls
    registrationPollMilliseconds = $RegistrationPollMilliseconds
    packageRootPresentAfter = $true
    localStatePathMatched = $true
    reparseTraversalRejected = $true
    containsSecretValues = $false
  }
}
function New-OracleInstalledRuntimeConfiguration {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][string]$PackageFamilyName,
    [Parameter(Mandatory = $true)][string]$ExpectedPackageFamilyName,
    [Parameter(Mandatory = $true)][string]$ConfigurationId,
    [Parameter(Mandatory = $true)][string]$FounderGrantId,
    [Parameter(Mandatory = $true)][string]$AuthorityId,
    [Parameter(Mandatory = $true)][string]$AttemptId,
    [Parameter(Mandatory = $true)][string]$CandidateCommit,
    [Parameter(Mandatory = $true)][string]$CandidateTree,
    [Parameter(Mandatory = $true)][string]$MsixSha256,
    [Parameter(Mandatory = $true)][string]$ExpectedCandidateCommit,
    [Parameter(Mandatory = $true)][string]$ExpectedCandidateTree,
    [Parameter(Mandatory = $true)][string]$ExpectedMsixSha256,
    [Parameter(Mandatory = $true)][string]$ProviderUrl,
    [Parameter(Mandatory = $true)][string]$ProviderAnonKey,
    [Parameter(Mandatory = $true)][Security.SecureString]$ProviderServiceKey,
    [Parameter(Mandatory = $true)][Security.SecureString]$SessionSecret,
    [Parameter(Mandatory = $true)][string]$LocalAppDataRoot,
    [DateTime]$IssuedAtUtc = [DateTime]::UtcNow
  )

  $identity = @{
    ConfigurationId = $ConfigurationId
    FounderGrantId = $FounderGrantId
    AuthorityId = $AuthorityId
    AttemptId = $AttemptId
  }
  Assert-OracleInstalledRuntimeIdentity @identity

  if ($PackageFamilyName -cnotmatch '^Oracle\.Platform\.LocalCertification_[a-z0-9]{13}$') {
    throw "Installed runtime configuration package family is invalid."
  }
  foreach ($value in @($CandidateCommit, $CandidateTree)) {
    if ($value -cnotmatch '^[0-9a-f]{40}$') {
      throw "Installed runtime configuration Git binding is invalid."
    }
  }
  if ($MsixSha256 -cnotmatch '^[0-9a-f]{64}$') {
    throw "Installed runtime configuration MSIX binding is invalid."
  }
  if (
    $PackageFamilyName -cne $ExpectedPackageFamilyName -or
    $CandidateCommit -cne $ExpectedCandidateCommit -or
    $CandidateTree -cne $ExpectedCandidateTree -or
    $MsixSha256 -cne $ExpectedMsixSha256
  ) {
    throw "Installed runtime configuration governed binding is mismatched."
  }

  $provider = $null
  if (
    -not [Uri]::TryCreate($ProviderUrl, [UriKind]::Absolute, [ref]$provider) -or
    $provider.Scheme -cne "http" -or
    $provider.Host -cne "127.0.0.1" -or
    $provider.IsDefaultPort -or
    $provider.AbsolutePath -cne "/" -or
    -not [string]::IsNullOrEmpty($provider.Query) -or
    -not [string]::IsNullOrEmpty($provider.Fragment) -or
    -not [string]::IsNullOrEmpty($provider.UserInfo) -or
    $provider.AbsoluteUri.TrimEnd('/') -cne $ProviderUrl
  ) {
    throw "Installed runtime configuration provider URL is invalid."
  }
  if (
    [string]::IsNullOrWhiteSpace($ProviderAnonKey) -or
    $ProviderAnonKey.Length -lt 20 -or
    $ProviderAnonKey.Length -gt 4096 -or
    $ProviderAnonKey -match '\s'
  ) {
    throw "Installed runtime configuration public provider credential is invalid."
  }

  $localAppData = [IO.Path]::GetFullPath($LocalAppDataRoot)
  $packageRoot = Join-Path $localAppData "Packages\$PackageFamilyName"
  if (-not (Test-Path -LiteralPath $packageRoot -PathType Container)) {
    throw "Installed runtime configuration package root is absent."
  }
  Assert-OracleRuntimePath -Path $packageRoot -RequiredRoot (Join-Path $localAppData "Packages")
  $sharedRoot = Join-Path $packageRoot "LocalState\Oracle\QualificationRuntime"
  $configurationDirectory = Join-Path $sharedRoot $ConfigurationId
  $configurationPath = Join-Path $configurationDirectory $script:OracleRuntimeConfigurationFile
  Assert-OracleRuntimePath -Path $configurationDirectory -RequiredRoot $packageRoot
  if (Test-Path -LiteralPath $configurationDirectory) {
    throw "Installed runtime configuration namespace already exists."
  }

  [IO.Directory]::CreateDirectory($sharedRoot) | Out-Null
  Assert-OracleRuntimePath -Path $sharedRoot -RequiredRoot $packageRoot
  [IO.Directory]::CreateDirectory($configurationDirectory) | Out-Null
  Set-OracleRuntimeRestrictedAcl -LiteralPath $configurationDirectory
  Assert-OracleRuntimeRestrictedAcl -LiteralPath $configurationDirectory

  $servicePointer = [IntPtr]::Zero
  $sessionPointer = [IntPtr]::Zero
  $serviceKey = $null
  $sessionValue = $null
  try {
    $servicePointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ProviderServiceKey)
    $sessionPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SessionSecret)
    $serviceKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($servicePointer)
    $sessionValue = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($sessionPointer)
    if (
      [string]::IsNullOrWhiteSpace($serviceKey) -or
      $serviceKey.Length -lt 20 -or
      $serviceKey.Length -gt 4096 -or
      $serviceKey -match '\s' -or
      [string]::IsNullOrWhiteSpace($sessionValue) -or
      $sessionValue.Length -lt 32 -or
      $sessionValue.Length -gt 256 -or
      $sessionValue -match '\s'
    ) {
      throw "Installed runtime configuration secret shape is invalid."
    }

    $issued = $IssuedAtUtc.ToUniversalTime()
    $expires = $issued.AddMinutes($script:OracleRuntimeConfigurationMaximumMinutes)
    $payload = [ordered]@{
      contract = [ordered]@{
        name = "oracle.installed-runtime-configuration"
        version = 1
      }
      configurationId = $ConfigurationId
      purpose = "local-qualification"
      issuedAtUtc = $issued.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
      expiresAtUtc = $expires.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
      founderGrantId = $FounderGrantId
      authorityId = $AuthorityId
      attemptId = $AttemptId
      package = [ordered]@{
        identity = "Oracle.Platform.LocalCertification"
        familyName = $PackageFamilyName
      }
      candidate = [ordered]@{
        commit = $CandidateCommit
        tree = $CandidateTree
        msixSha256 = $MsixSha256
      }
      provider = [ordered]@{
        url = $ProviderUrl
        anonKey = $ProviderAnonKey
        serviceKey = $serviceKey
      }
      session = [ordered]@{
        secret = $sessionValue
      }
    }
    $json = $payload | ConvertTo-Json -Depth 8 -Compress
    $stream = [IO.FileStream]::new(
      $configurationPath,
      [IO.FileMode]::CreateNew,
      [IO.FileAccess]::Write,
      [IO.FileShare]::None
    )
    try {
      $bytes = [Text.UTF8Encoding]::new($false).GetBytes($json)
      $stream.Write($bytes, 0, $bytes.Length)
      $stream.Flush($true)
    } finally {
      $stream.Dispose()
    }
    Set-OracleRuntimeRestrictedAcl -LiteralPath $configurationPath
    Assert-OracleRuntimeRestrictedAcl -LiteralPath $configurationPath
  } catch {
    $setupFailure = $_.Exception
    $cleanupFailure = $null
    try {
      if (Test-Path -LiteralPath $configurationPath -PathType Leaf) {
        Remove-Item -LiteralPath $configurationPath -ErrorAction Stop
      }
      if (Test-Path -LiteralPath $configurationDirectory -PathType Container) {
        $partialResidue = @(
          Get-ChildItem -LiteralPath $configurationDirectory -Force -ErrorAction Stop
        )
        if ($partialResidue.Count -ne 0) {
          throw "Partial runtime configuration residue remains."
        }
        Remove-Item -LiteralPath $configurationDirectory -ErrorAction Stop
      }
    } catch {
      $cleanupFailure = $_.Exception
    }
    if ($null -ne $cleanupFailure) {
      throw (
        "Installed runtime configuration setup failed and cleanup was incomplete: " +
        $setupFailure.Message + "; cleanup: " + $cleanupFailure.Message
      )
    }
    throw $setupFailure
  } finally {
    $serviceKey = $null
    $sessionValue = $null
    if ($servicePointer -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($servicePointer)
    }
    if ($sessionPointer -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($sessionPointer)
    }
  }

  $sha256 = (Get-FileHash -LiteralPath $configurationPath -Algorithm SHA256).Hash.ToLowerInvariant()
  [pscustomobject][ordered]@{
    contract = "oracle.installed-runtime-configuration-admission"
    contractVersion = 1
    configurationId = $ConfigurationId
    configurationPath = $configurationPath
    sha256 = $sha256
    issuedAtUtc = $IssuedAtUtc.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    expiresAtUtc = $IssuedAtUtc.ToUniversalTime().AddMinutes(
      $script:OracleRuntimeConfigurationMaximumMinutes
    ).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    containsSecretValues = $false
    createOnly = $true
    restrictedAcl = $true
  }
}

function Get-OracleInstalledRuntimeActivationArguments {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][string]$ConfigurationPath,
    [Parameter(Mandatory = $true)][string]$Sha256
  )
  $path = [IO.Path]::GetFullPath($ConfigurationPath)
  if (
    $path.Contains('"') -or
    $path.Contains([char]0) -or
    (Split-Path -Leaf $path) -cne $script:OracleRuntimeConfigurationFile
  ) {
    throw "Installed runtime configuration path is invalid."
  }
  if ($Sha256 -cnotmatch '^[0-9a-f]{64}$') {
    throw "Installed runtime configuration hash is invalid."
  }
  '"--oracle-runtime-configuration=' + $path + '" ' +
    '"--oracle-runtime-configuration-sha256=' + $Sha256 + '"'
}

function Remove-OracleInstalledRuntimeConfiguration {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][string]$ConfigurationPath,
    [Parameter(Mandatory = $true)][string]$ExpectedSha256,
    [Parameter(Mandatory = $true)][string]$LocalAppDataRoot
  )
  $path = [IO.Path]::GetFullPath($ConfigurationPath)
  if (
    (Split-Path -Leaf $path) -cne $script:OracleRuntimeConfigurationFile -or
    (Split-Path -Leaf (Split-Path -Parent $path)) -cnotmatch
      '^runtime-stage[0-9]+-r[0-9]+-[0-9]{8}T[0-9]{9}Z-[0-9a-f]{8}$' -or
    $ExpectedSha256 -cnotmatch '^[0-9a-f]{64}$'
  ) {
    throw "Installed runtime configuration teardown identity is invalid."
  }
  $root = Join-Path ([IO.Path]::GetFullPath($LocalAppDataRoot)) "Packages"
  Assert-OracleRuntimePath -Path $path -RequiredRoot $root
  if (Test-Path -LiteralPath $path -PathType Leaf) {
    $observed = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($observed -cne $ExpectedSha256) {
      throw "Installed runtime configuration teardown identity mismatch."
    }
    Remove-Item -LiteralPath $path -ErrorAction Stop
  }
  $directory = Split-Path -Parent $path
  if (Test-Path -LiteralPath $directory -PathType Container) {
    $residue = @(Get-ChildItem -LiteralPath $directory -Force -ErrorAction Stop)
    if ($residue.Count -ne 0) {
      throw "Installed runtime configuration residue remains."
    }
    Remove-Item -LiteralPath $directory -ErrorAction Stop
  }
  if ((Test-Path -LiteralPath $path) -or (Test-Path -LiteralPath $directory)) {
    throw "Installed runtime configuration residue remains."
  }
  [pscustomobject][ordered]@{
    configurationPath = $path
    expectedSha256 = $ExpectedSha256
    remaining = 0
  }
}

function Assert-OracleInstalledRuntimeIdentity {
  param(
    [string]$ConfigurationId,
    [string]$FounderGrantId,
    [string]$AuthorityId,
    [string]$AttemptId
  )
  if (
    $AttemptId -cnotmatch '^stage[0-9]+-r[0-9]+-[0-9]{8}T[0-9]{9}Z-[0-9a-f]{8}$' -or
    $ConfigurationId -cne "runtime-$AttemptId" -or
    $AuthorityId -cne "authority-$AttemptId"
  ) {
    throw "Installed runtime configuration execution identity is invalid."
  }
  $expectedGrant = $AttemptId -replace '^(stage[0-9]+-r[0-9]+)-', 'founder-$1-grant-'
  if ($FounderGrantId -cne $expectedGrant) {
    throw "Installed runtime configuration Founder grant is mismatched."
  }
}

function Assert-OracleRuntimePath {
  param([string]$Path, [string]$RequiredRoot)
  $full = [IO.Path]::GetFullPath($Path)
  $root = [IO.Path]::GetFullPath($RequiredRoot).TrimEnd('\') + '\'
  if (Test-Path -LiteralPath $RequiredRoot) {
    $rootItem = Get-Item -LiteralPath $RequiredRoot -Force -ErrorAction Stop
    if (($rootItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw "Installed runtime configuration root contains reparse redirection."
    }
  }
  if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Installed runtime configuration path escapes its governed root."
  }
  $cursor = $full
  while ($cursor.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
    if (Test-Path -LiteralPath $cursor) {
      $item = Get-Item -LiteralPath $cursor -Force -ErrorAction Stop
      if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "Installed runtime configuration path contains reparse redirection."
      }
    }
    $parent = Split-Path -Parent $cursor
    if ([string]::IsNullOrEmpty($parent) -or $parent -ceq $cursor) { break }
    $cursor = $parent
  }
}

function Assert-OracleRuntimeRestrictedAcl {
  param([Parameter(Mandatory = $true)][string]$LiteralPath)
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent().User
  $expectedSids = @(
    $identity.Value,
    [Security.Principal.SecurityIdentifier]::new(
      [Security.Principal.WellKnownSidType]::LocalSystemSid,
      $null
    ).Value,
    [Security.Principal.SecurityIdentifier]::new(
      [Security.Principal.WellKnownSidType]::BuiltinAdministratorsSid,
      $null
    ).Value
  ) | Sort-Object
  $acl = Get-Acl -LiteralPath $LiteralPath -ErrorAction Stop
  $observedSids = @($acl.Access | ForEach-Object {
    if (
      $_.AccessControlType -ne [Security.AccessControl.AccessControlType]::Allow -or
      ($_.FileSystemRights -band [Security.AccessControl.FileSystemRights]::FullControl) -ne
        [Security.AccessControl.FileSystemRights]::FullControl
    ) {
      throw "Installed runtime configuration ACL grants unexpected access."
    }
    $_.IdentityReference.Translate(
      [Security.Principal.SecurityIdentifier]
    ).Value
  }) | Sort-Object
  if (
    -not $acl.AreAccessRulesProtected -or
    $acl.Owner -cne $identity.Translate(
      [Security.Principal.NTAccount]
    ).Value -or
    [string]::Join([char]0, $observedSids) -cne
      [string]::Join([char]0, $expectedSids)
  ) {
    throw "Installed runtime configuration ACL verification failed."
  }
}
function Set-OracleRuntimeRestrictedAcl {
  param([Parameter(Mandatory = $true)][string]$LiteralPath)
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent().User
  if ($null -eq $identity) {
    throw "Current Windows identity SID is unavailable."
  }
  $item = Get-Item -LiteralPath $LiteralPath -Force -ErrorAction Stop
  $acl = Get-Acl -LiteralPath $LiteralPath -ErrorAction Stop
  $inheritance = if ($item.PSIsContainer) {
    [Security.AccessControl.InheritanceFlags]::ContainerInherit -bor
      [Security.AccessControl.InheritanceFlags]::ObjectInherit
  } else {
    [Security.AccessControl.InheritanceFlags]::None
  }
  $acl.SetOwner($identity)
  $acl.SetAccessRuleProtection($true, $false)
  foreach ($rule in @($acl.Access)) {
    [void]$acl.RemoveAccessRuleAll($rule)
  }
  foreach ($sid in @(
    $identity,
    [Security.Principal.SecurityIdentifier]::new(
      [Security.Principal.WellKnownSidType]::LocalSystemSid,
      $null
    ),
    [Security.Principal.SecurityIdentifier]::new(
      [Security.Principal.WellKnownSidType]::BuiltinAdministratorsSid,
      $null
    )
  )) {
    $rule = [Security.AccessControl.FileSystemAccessRule]::new(
      $sid,
      [Security.AccessControl.FileSystemRights]::FullControl,
      $inheritance,
      [Security.AccessControl.PropagationFlags]::None,
      [Security.AccessControl.AccessControlType]::Allow
    )
    [void]$acl.AddAccessRule($rule)
  }
  Set-Acl -LiteralPath $LiteralPath -AclObject $acl -ErrorAction Stop
}

function New-OracleStage4R3CryptographicValue {
  [CmdletBinding()]
  param(
    [ValidateRange(32, 256)][int]$ByteLength = 48,
    [scriptblock]$EntropyProvider
  )

  [byte[]]$bytes = @()
  try {
    if ($null -ne $EntropyProvider) {
      $providedBytes = & $EntropyProvider $ByteLength
      $bytes = [byte[]]$providedBytes
    } else {
      $bytes = New-Object byte[] $ByteLength
      $algorithm = [Security.Cryptography.RandomNumberGenerator]::Create()
      try {
        $algorithm.GetBytes($bytes)
      } finally {
        $algorithm.Dispose()
      }
    }
    if (
      $bytes.Count -ne $ByteLength -or
      @($bytes | Where-Object { $_ -ne 0 }).Count -eq 0
    ) {
      throw "Cryptographic entropy output is invalid."
    }
    [Convert]::ToBase64String($bytes)
  } catch {
    throw "Cryptographic runtime-configuration value generation failed: $($_.Exception.Message)"
  } finally {
    if ($bytes.Count -gt 0) { [Array]::Clear($bytes, 0, $bytes.Count) }
  }
}
