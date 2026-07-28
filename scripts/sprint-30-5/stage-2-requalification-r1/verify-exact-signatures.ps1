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
  ".r1-verification-temporary.cer"

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

$temporaryTrust = Import-Certificate `
  -FilePath $temporaryCertificatePath `
  -CertStoreLocation "Cert:\CurrentUser\Root"

if ($temporaryTrust.Thumbprint -cne $ExpectedThumbprint) {
  throw "Temporary trust imported an unexpected certificate."
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
    "oracle.sprint-30-5.stage-2-requalification-r1-signature-verification"
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
    thumbprint = $temporaryTrust.Thumbprint
  }
  temporaryCertificatePath = $temporaryCertificatePath
  productionTrusted = $false
} | ConvertTo-Json -Depth 8
