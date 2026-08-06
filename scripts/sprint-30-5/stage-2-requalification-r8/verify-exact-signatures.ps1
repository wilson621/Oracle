[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateScript({ Test-Path -LiteralPath $_ -PathType Container })]
  [string]$ReleaseDirectory,

  [Parameter(Mandatory = $true)]
  [ValidateScript({ Test-Path -LiteralPath $_ -PathType Container })]
  [string]$UnpackedDirectory,

  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$PackageFileName,

  [Parameter(Mandatory = $true)]
  [ValidatePattern("^[0-9A-F]{40}$")]
  [string]$ExpectedThumbprint,

  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$ExpectedSubject
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
Add-Type -AssemblyName System.Security

$governedCertificateStores = @(
  [ordered]@{
    location = "CurrentUser"
    store = "My"
    path = "Cert:\CurrentUser\My"
  },
  [ordered]@{
    location = "CurrentUser"
    store = "Root"
    path = "Cert:\CurrentUser\Root"
  },
  [ordered]@{
    location = "CurrentUser"
    store = "TrustedPeople"
    path = "Cert:\CurrentUser\TrustedPeople"
  },
  [ordered]@{
    location = "LocalMachine"
    store = "My"
    path = "Cert:\LocalMachine\My"
  },
  [ordered]@{
    location = "LocalMachine"
    store = "Root"
    path = "Cert:\LocalMachine\Root"
  },
  [ordered]@{
    location = "LocalMachine"
    store = "TrustedPeople"
    path = "Cert:\LocalMachine\TrustedPeople"
  }
)

$packagePath = Join-Path $ReleaseDirectory $PackageFileName
$executablePaths = @(
  (Join-Path $UnpackedDirectory "Oracle.exe"),
  (
    Join-Path `
      $UnpackedDirectory `
      "resources\app\dist-native\Oracle.WindowDiscovery.exe"
  ),
  (
    Join-Path `
      $UnpackedDirectory `
      "resources\app\dist-native\Oracle.WindowObserver.exe"
  )
)

foreach ($path in @($packagePath) + $executablePaths) {
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "Required signed artifact is missing: $path"
  }
}

function Get-ExactGovernedCertificateMatches {
  $matches = @(
    foreach ($store in $governedCertificateStores) {
      if (-not (Test-Path -LiteralPath $store.path)) {
        continue
      }

      Get-ChildItem -LiteralPath $store.path |
        Where-Object {
          $_.Thumbprint -ceq $ExpectedThumbprint
        } |
        ForEach-Object {
          [pscustomobject]@{
            location = $store.location
            store = $store.store
            path = $store.path
            certificate = $_
          }
        }
    }
  )

  return $matches
}

function Assert-ExactSigner {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,

    [Parameter(Mandatory = $true)]
    [bool]$RequireValidStatus
  )

  $signature = Get-AuthenticodeSignature -LiteralPath $Path
  if ($null -eq $signature.SignerCertificate) {
    throw "Missing Authenticode signature: $Path"
  }
  if ($signature.SignerCertificate.Thumbprint -cne $ExpectedThumbprint) {
    throw "Unexpected signer thumbprint: $Path"
  }
  if ($signature.SignerCertificate.Subject -cne $ExpectedSubject) {
    throw "Unexpected signer subject: $Path"
  }
  if (
    $signature.Status -eq "HashMismatch" -or
    $signature.Status -eq "NotSigned" -or
    ($RequireValidStatus -and $signature.Status -ne "Valid")
  ) {
    throw "Invalid Authenticode signature: $Path ($($signature.Status))"
  }
  return [ordered]@{
    path = Split-Path -Leaf $Path
    status = [string]$signature.Status
    subject = $signature.SignerCertificate.Subject
    thumbprint = $signature.SignerCertificate.Thumbprint
    notAfter = (
      $signature.SignerCertificate.NotAfter.ToUniversalTime().ToString("o")
    )
  }
}

$bootstrapSignature = Get-AuthenticodeSignature -LiteralPath $executablePaths[0]
if (
  $null -eq $bootstrapSignature.SignerCertificate -or
  $bootstrapSignature.Status -eq "HashMismatch" -or
  $bootstrapSignature.Status -eq "NotSigned" -or
  $bootstrapSignature.SignerCertificate.Thumbprint -cne $ExpectedThumbprint -or
  $bootstrapSignature.SignerCertificate.Subject -cne $ExpectedSubject
) {
  throw "Oracle.exe does not carry the exact expected bootstrap signature."
}
$signerCertificate = $bootstrapSignature.SignerCertificate
$temporaryCertificatePath = Join-Path `
  $ReleaseDirectory `
  ".r8-verification-temporary.cer"

if (Test-Path -LiteralPath $temporaryCertificatePath) {
  throw "Temporary verification certificate path already exists."
}

$temporaryCertificateBytes = $signerCertificate.Export(
  [Security.Cryptography.X509Certificates.X509ContentType]::Cert
)
$temporaryCertificateStream = [IO.File]::Open(
  $temporaryCertificatePath,
  [IO.FileMode]::CreateNew,
  [IO.FileAccess]::Write,
  [IO.FileShare]::None
)
try {
  $temporaryCertificateStream.Write(
    $temporaryCertificateBytes,
    0,
    $temporaryCertificateBytes.Length
  )
  $temporaryCertificateStream.Flush()
}
finally {
  $temporaryCertificateStream.Dispose()
}

$sourceCertificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new(
  $temporaryCertificatePath
)
try {
  if ($sourceCertificate.Thumbprint -cne $ExpectedThumbprint) {
    throw "Temporary verification CER thumbprint is invalid."
  }
  if ($sourceCertificate.Subject -cne $ExpectedSubject) {
    throw "Temporary verification CER subject is invalid."
  }
  if (
    [Convert]::ToBase64String($sourceCertificate.RawData) -cne
    [Convert]::ToBase64String($temporaryCertificateBytes)
  ) {
    throw "Temporary verification CER bytes differ from the signer certificate."
  }
}
finally {
  $sourceCertificate.Dispose()
}

$preImportMatches = @(Get-ExactGovernedCertificateMatches)
$preImportSigningMatches = @(
  $preImportMatches |
    Where-Object {
      $_.location -ceq "CurrentUser" -and
      $_.store -ceq "My"
    }
)
$preImportTrustMatches = @(
  $preImportMatches |
    Where-Object {
      -not (
        $_.location -ceq "CurrentUser" -and
        $_.store -ceq "My"
      )
    }
)
if (
  $preImportSigningMatches.Count -ne 1 -or
  -not $preImportSigningMatches[0].certificate.HasPrivateKey -or
  $preImportSigningMatches[0].certificate.Subject -cne $ExpectedSubject -or
  [Convert]::ToBase64String(
    $preImportSigningMatches[0].certificate.RawData
  ) -cne [Convert]::ToBase64String($temporaryCertificateBytes)
) {
  throw "Expected exactly one matching CurrentUser\My signing certificate."
}
if ($preImportTrustMatches.Count -ne 0) {
  throw "The exact attempt certificate is already present in a trust store."
}

$certUtilPath = Join-Path ([Environment]::SystemDirectory) "certutil.exe"
if (-not (Test-Path -LiteralPath $certUtilPath -PathType Leaf)) {
  throw "The Windows System32 CertUtil executable is unavailable."
}

if ($temporaryCertificatePath.Contains('"')) {
  throw "Temporary verification certificate path cannot be safely quoted."
}

$certUtilArguments = @(
  "-user",
  "-addstore",
  "Root",
  $temporaryCertificatePath
)
if ($certUtilArguments -contains "-f") {
  throw "CertUtil force-overwrite is forbidden."
}

$certUtilStartInfo = [Diagnostics.ProcessStartInfo]::new()
$certUtilStartInfo.FileName = $certUtilPath
$certUtilStartInfo.Arguments = (
  $certUtilArguments |
    ForEach-Object {
      '"' + $_ + '"'
    }
) -join " "
$certUtilStartInfo.UseShellExecute = $false
$certUtilStartInfo.CreateNoWindow = $true
$certUtilStartInfo.RedirectStandardOutput = $true
$certUtilStartInfo.RedirectStandardError = $true

$certUtilStartedAt = [DateTime]::UtcNow
$certUtilCompletedAt = $null
$certUtilExitCode = $null
$certUtilSignal = $null
$certUtilProcessError = $null
$certUtilStdout = ""
$certUtilStderr = ""
$certUtilProcess = [Diagnostics.Process]::new()
$certUtilProcess.StartInfo = $certUtilStartInfo

try {
  if (-not $certUtilProcess.Start()) {
    throw "CertUtil did not start."
  }
  $certUtilStdoutTask = $certUtilProcess.StandardOutput.ReadToEndAsync()
  $certUtilStderrTask = $certUtilProcess.StandardError.ReadToEndAsync()
  $certUtilProcess.WaitForExit()
  $certUtilStdout = $certUtilStdoutTask.GetAwaiter().GetResult()
  $certUtilStderr = $certUtilStderrTask.GetAwaiter().GetResult()
  $certUtilExitCode = $certUtilProcess.ExitCode
}
catch {
  $certUtilProcessError = $_.Exception.Message
}
finally {
  $certUtilCompletedAt = [DateTime]::UtcNow
  $certUtilProcess.Dispose()
}

$certUtilEvidence = [ordered]@{
  command = $certUtilPath
  arguments = $certUtilArguments
  startedAt = $certUtilStartedAt.ToString("o")
  completedAt = $certUtilCompletedAt.ToString("o")
  exitCode = $certUtilExitCode
  signal = $certUtilSignal
  processError = $certUtilProcessError
  stdout = $certUtilStdout
  stderr = $certUtilStderr
}

if (
  $null -ne $certUtilProcessError -or
  $null -ne $certUtilSignal -or
  $null -eq $certUtilExitCode -or
  $certUtilExitCode -ne 0
) {
  throw (
    "CertUtil temporary Root trust failed. " +
    "ProcessError=$certUtilProcessError; " +
    "Signal=$certUtilSignal; " +
    "ExitCode=$certUtilExitCode; " +
    "Stdout=$certUtilStdout; " +
    "Stderr=$certUtilStderr"
  )
}

$postImportMatches = @(Get-ExactGovernedCertificateMatches)
$rootMatches = @(
  $postImportMatches |
    Where-Object {
      $_.location -ceq "CurrentUser" -and
      $_.store -ceq "Root"
    }
)
$postImportSigningMatches = @(
  $postImportMatches |
    Where-Object {
      $_.location -ceq "CurrentUser" -and
      $_.store -ceq "My"
    }
)
$unexpectedPostImportMatches = @(
  $postImportMatches |
    Where-Object {
      -not (
        $_.location -ceq "CurrentUser" -and
        ($_.store -ceq "My" -or $_.store -ceq "Root")
      )
    }
)
if (
  $rootMatches.Count -ne 1 -or
  $rootMatches[0].certificate.Thumbprint -cne $ExpectedThumbprint -or
  $rootMatches[0].certificate.Subject -cne $ExpectedSubject -or
  [Convert]::ToBase64String($rootMatches[0].certificate.RawData) -cne
  [Convert]::ToBase64String($temporaryCertificateBytes)
) {
  throw "CurrentUser\Root does not contain exactly the expected certificate."
}
if (
  $postImportSigningMatches.Count -ne 1 -or
  -not $postImportSigningMatches[0].certificate.HasPrivateKey -or
  $postImportSigningMatches[0].certificate.Subject -cne $ExpectedSubject -or
  [Convert]::ToBase64String(
    $postImportSigningMatches[0].certificate.RawData
  ) -cne [Convert]::ToBase64String($temporaryCertificateBytes) -or
  $unexpectedPostImportMatches.Count -ne 0 -or
  $postImportMatches.Count -ne 2
) {
  throw "Unexpected exact-thumbprint certificate-store state after Root trust."
}

$executableSignatures = @(
  foreach ($path in $executablePaths) {
    Assert-ExactSigner -Path $path -RequireValidStatus $true
  }
)

$packageSignature = Assert-ExactSigner `
  -Path $packagePath `
  -RequireValidStatus $true

$manifestPath = Join-Path $ReleaseDirectory "oracle-release-manifest.json"
$signaturePath = "$manifestPath.p7s"
if (
  -not (Test-Path -LiteralPath $manifestPath -PathType Leaf) -or
  -not (Test-Path -LiteralPath $signaturePath -PathType Leaf)
) {
  throw "Release Manifest or detached signature is missing."
}

$content = [Security.Cryptography.Pkcs.ContentInfo]::new(
  [IO.File]::ReadAllBytes($manifestPath)
)
$cms = [Security.Cryptography.Pkcs.SignedCms]::new($content, $true)
$cms.Decode([IO.File]::ReadAllBytes($signaturePath))
$cms.CheckSignature($true)

if ($cms.SignerInfos.Count -ne 1) {
  throw "Release Manifest must have exactly one signer."
}

$manifestSigner = $cms.SignerInfos[0].Certificate
if ($manifestSigner.Thumbprint -cne $ExpectedThumbprint) {
  throw "Release Manifest signer thumbprint is invalid."
}
if ($manifestSigner.Subject -cne $ExpectedSubject) {
  throw "Release Manifest signer subject is invalid."
}

[ordered]@{
  schemaVersion = "1.0.0"
  contract = (
    "oracle.sprint-30-5.stage-2-requalification-r8-signature-verification"
  )
  status = "passed"
  exactThumbprint = $ExpectedThumbprint
  expectedSubject = $ExpectedSubject
  authenticode = @($packageSignature) + $executableSignatures
  releaseManifestSignature = [ordered]@{
    valid = $true
    detached = $true
    subject = $manifestSigner.Subject
    thumbprint = $manifestSigner.Thumbprint
    notAfter = $manifestSigner.NotAfter.ToUniversalTime().ToString("o")
  }
  temporaryTrust = [ordered]@{
    created = $true
    location = "CurrentUser\Root"
    thumbprint = $rootMatches[0].certificate.Thumbprint
    sourceCertificateBytesMatched = $true
    exactCurrentUserMySigningMatches = $postImportSigningMatches.Count
    exactCurrentUserRootTrustMatches = $rootMatches.Count
    unexpectedGovernedStoreMatches = $unexpectedPostImportMatches.Count
    certUtil = $certUtilEvidence
  }
  temporaryCertificatePath = $temporaryCertificatePath
  productionTrusted = $false
} | ConvertTo-Json -Depth 8
