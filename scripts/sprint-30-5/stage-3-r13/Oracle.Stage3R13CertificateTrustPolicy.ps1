Set-StrictMode -Version Latest

function Assert-OracleStage3R13CertificateTrustContract {
  param([Parameter(Mandatory = $true)]$Contract)

  $trust = $Contract.PSObject.Properties["temporaryTrust"]
  if ($null -eq $trust) {
    throw "The contract does not define the mandatory temporary-trust policy."
  }
  $policy = $trust.Value
  $required = @{
    physicalLocation = "LocalMachine"
    store = "TrustedPeople"
    importExecutable = "certutil.exe"
  }
  foreach ($name in $required.Keys) {
    $property = $policy.PSObject.Properties[$name]
    if ($null -eq $property -or [string]$property.Value -cne $required[$name]) {
      throw "The temporary-trust contract differs at $name."
    }
  }
  $expectedImport = @("-addstore", "TrustedPeople", "<attempt-certificate.cer>")
  $expectedRemoval = @(
    "-delstore", "TrustedPeople", "<exact-uppercase-sha1-thumbprint>"
  )
  if (
    [string]::Join([char]0, @($policy.importArguments)) -cne
      [string]::Join([char]0, $expectedImport) -or
    [string]::Join([char]0, @($policy.removalArguments)) -cne
      [string]::Join([char]0, $expectedRemoval) -or
    @($policy.forbiddenArguments).Count -ne 2 -or
    @($policy.forbiddenArguments) -cnotcontains "-user" -or
    @($policy.forbiddenArguments) -cnotcontains "-f"
  ) {
    throw "The temporary-trust CertUtil argument contract differs."
  }
  foreach ($name in @(
    "requiresElevation",
    "requiresExactSubject",
    "requiresExactThumbprint",
    "requiresExactRawBytes",
    "requiresNoPrivateKeyInTrustStore",
    "requiresFinalZeroPhysicalAndLogicalResidue"
  )) {
    $property = $policy.PSObject.Properties[$name]
    if ($null -eq $property -or $property.Value -ne $true) {
      throw "The temporary-trust contract does not require $name."
    }
  }
}

function Assert-OracleStage3R13Thumbprint {
  param([Parameter(Mandatory = $true)][string]$Thumbprint)

  if ($Thumbprint -cnotmatch '^[0-9A-F]{40}$') {
    throw "The governed certificate thumbprint must be exactly 40 uppercase hexadecimal characters."
  }
}

function Get-OracleStage3R13CertificateStoreDefinitions {
  @(
    [pscustomobject][ordered]@{
      location = "CurrentUser"
      store = "My"
      registryRoot = "HKCU:\SOFTWARE\Microsoft\SystemCertificates\My\Certificates"
    },
    [pscustomobject][ordered]@{
      location = "CurrentUser"
      store = "Root"
      registryRoot = "HKCU:\SOFTWARE\Microsoft\SystemCertificates\Root\Certificates"
    },
    [pscustomobject][ordered]@{
      location = "CurrentUser"
      store = "TrustedPeople"
      registryRoot = "HKCU:\SOFTWARE\Microsoft\SystemCertificates\TrustedPeople\Certificates"
    },
    [pscustomobject][ordered]@{
      location = "LocalMachine"
      store = "My"
      registryRoot = "HKLM:\SOFTWARE\Microsoft\SystemCertificates\My\Certificates"
    },
    [pscustomobject][ordered]@{
      location = "LocalMachine"
      store = "Root"
      registryRoot = "HKLM:\SOFTWARE\Microsoft\SystemCertificates\Root\Certificates"
    },
    [pscustomobject][ordered]@{
      location = "LocalMachine"
      store = "TrustedPeople"
      registryRoot = "HKLM:\SOFTWARE\Microsoft\SystemCertificates\TrustedPeople\Certificates"
    }
  )
}

function Get-OracleStage3R13PhysicalCertificateMatches {
  param([Parameter(Mandatory = $true)][string]$Thumbprint)

  Assert-OracleStage3R13Thumbprint -Thumbprint $Thumbprint
  $matches = @()
  foreach ($definition in @(Get-OracleStage3R13CertificateStoreDefinitions)) {
    $registryPath = Join-Path ([string]$definition.registryRoot) $Thumbprint
    if (Test-Path -LiteralPath $registryPath) {
      $providerPath = (
        "Cert:\$($definition.location)\$($definition.store)\$Thumbprint"
      )
      $certificate = Get-Item -LiteralPath $providerPath -ErrorAction Stop
      $matches += [pscustomobject][ordered]@{
        Location = [string]$definition.location
        Store = [string]$definition.store
        RegistryPath = $registryPath
        ProviderPath = $providerPath
        Certificate = $certificate
        Physical = $true
      }
    }
  }
  @($matches)
}

function Get-OracleStage3R13LogicalCertificateViews {
  param([Parameter(Mandatory = $true)][string]$Thumbprint)

  Assert-OracleStage3R13Thumbprint -Thumbprint $Thumbprint
  $views = @()
  foreach ($definition in @(Get-OracleStage3R13CertificateStoreDefinitions)) {
    $providerPath = (
      "Cert:\$($definition.location)\$($definition.store)\$Thumbprint"
    )
    $certificate = Get-Item -LiteralPath $providerPath -ErrorAction SilentlyContinue
    if ($null -ne $certificate) {
      $views += [pscustomobject][ordered]@{
        Location = [string]$definition.location
        Store = [string]$definition.store
        ProviderPath = $providerPath
        Certificate = $certificate
        Physical = $false
      }
    }
  }
  @($views)
}

function Test-OracleStage3R13CertificateIdentity {
  param(
    [Parameter(Mandatory = $true)][object]$Certificate,
    [Parameter(Mandatory = $true)][string]$Thumbprint,
    [Parameter(Mandatory = $true)][string]$Subject,
    [Parameter(Mandatory = $true)][string]$RawBase64,
    [Parameter(Mandatory = $true)][bool]$HasPrivateKey
  )

  (
    [string]$Certificate.Thumbprint -ceq $Thumbprint -and
    [string]$Certificate.Subject -ceq $Subject -and
    [Convert]::ToBase64String([byte[]]$Certificate.RawData) -ceq $RawBase64 -and
    [bool]$Certificate.HasPrivateKey -eq $HasPrivateKey
  )
}

function Assert-OracleStage3R13NoCertificateResidue {
  param(
    [Parameter(Mandatory = $true)]
    [AllowEmptyCollection()][object[]]$PhysicalMatches,
    [Parameter(Mandatory = $true)]
    [AllowEmptyCollection()][object[]]$LogicalViews
  )

  if ($PhysicalMatches.Count -ne 0 -or $LogicalViews.Count -ne 0) {
    throw "The governed certificate already exists in a physical store or logical view."
  }
}

function Assert-OracleStage3R13TemporaryTrustState {
  param(
    [Parameter(Mandatory = $true)]
    [AllowEmptyCollection()][object[]]$PhysicalMatches,
    [Parameter(Mandatory = $true)]
    [AllowEmptyCollection()][object[]]$LogicalViews,
    [Parameter(Mandatory = $true)][string]$Thumbprint,
    [Parameter(Mandatory = $true)][string]$Subject,
    [Parameter(Mandatory = $true)][string]$RawBase64
  )

  Assert-OracleStage3R13Thumbprint -Thumbprint $Thumbprint
  if (
    $PhysicalMatches.Count -ne 1 -or
    [string]$PhysicalMatches[0].Location -cne "LocalMachine" -or
    [string]$PhysicalMatches[0].Store -cne "TrustedPeople" -or
    -not (Test-OracleStage3R13CertificateIdentity `
      -Certificate $PhysicalMatches[0].Certificate `
      -Thumbprint $Thumbprint -Subject $Subject -RawBase64 $RawBase64 `
      -HasPrivateKey $false)
  ) {
    throw "Temporary physical trust is not exactly LocalMachine\TrustedPeople."
  }

  if ($LogicalViews.Count -lt 1 -or $LogicalViews.Count -gt 2) {
    throw "Temporary trust has an unexpected logical-view cardinality."
  }
  $seen = @{}
  foreach ($view in $LogicalViews) {
    $key = "$($view.Location)\$($view.Store)"
    if (
      [string]$view.Store -cne "TrustedPeople" -or
      @("CurrentUser", "LocalMachine") -cnotcontains [string]$view.Location -or
      $seen.ContainsKey($key) -or
      -not (Test-OracleStage3R13CertificateIdentity `
        -Certificate $view.Certificate `
        -Thumbprint $Thumbprint -Subject $Subject -RawBase64 $RawBase64 `
        -HasPrivateKey $false)
    ) {
      throw "Temporary trust has an unexpected or mismatched logical projection."
    }
    $seen[$key] = $true
  }
  if (-not $seen.ContainsKey("LocalMachine\TrustedPeople")) {
    throw "The authoritative LocalMachine\TrustedPeople logical view is absent."
  }
}

function Assert-OracleStage3R13ExactRemovalTarget {
  param(
    [Parameter(Mandatory = $true)]
    [AllowEmptyCollection()][object[]]$PhysicalMatches,
    [Parameter(Mandatory = $true)]
    [AllowEmptyCollection()][object[]]$LogicalViews,
    [Parameter(Mandatory = $true)][string]$Thumbprint,
    [Parameter(Mandatory = $true)][string]$Subject,
    [Parameter(Mandatory = $true)][string]$RawBase64
  )

  Assert-OracleStage3R13Thumbprint -Thumbprint $Thumbprint
  if (
    $PhysicalMatches.Count -ne 1 -or
    [string]$PhysicalMatches[0].Location -cne "LocalMachine" -or
    [string]$PhysicalMatches[0].Store -cne "TrustedPeople" -or
    -not (Test-OracleStage3R13CertificateIdentity `
      -Certificate $PhysicalMatches[0].Certificate `
      -Thumbprint $Thumbprint -Subject $Subject -RawBase64 $RawBase64 `
      -HasPrivateKey $false)
  ) {
    throw "Exact machine-trust removal target is absent, duplicated or mismatched."
  }
  $seen = @{}
  foreach ($view in $LogicalViews) {
    $key = "$($view.Location)\$($view.Store)"
    if (
      [string]$view.Store -cne "TrustedPeople" -or
      @("CurrentUser", "LocalMachine") -cnotcontains [string]$view.Location -or
      $seen.ContainsKey($key) -or
      -not (Test-OracleStage3R13CertificateIdentity `
        -Certificate $view.Certificate `
        -Thumbprint $Thumbprint -Subject $Subject -RawBase64 $RawBase64 `
        -HasPrivateKey $false)
    ) {
      throw "Exact machine-trust removal observed an unexpected logical view."
    }
    $seen[$key] = $true
  }
}

function Get-OracleStage3R13TrustImportArguments {
  param([Parameter(Mandatory = $true)][string]$CertificatePath)

  @("-addstore", "TrustedPeople", [IO.Path]::GetFullPath($CertificatePath))
}

function Get-OracleStage3R13TrustRemovalArguments {
  param([Parameter(Mandatory = $true)][string]$Thumbprint)

  Assert-OracleStage3R13Thumbprint -Thumbprint $Thumbprint
  @("-delstore", "TrustedPeople", $Thumbprint)
}

function Test-OracleStage3R13ProcessIsElevated {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  try {
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    $principal.IsInRole(
      [Security.Principal.WindowsBuiltInRole]::Administrator
    )
  } finally {
    $identity.Dispose()
  }
}
