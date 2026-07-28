param(
  [Parameter(Mandatory = $true)]
  [string]$ReleaseDirectory,
  [Parameter(Mandatory = $true)]
  [string]$UnpackedDirectory,
  [Parameter(Mandatory = $true)]
  [string]$ExpectedSubject
)

throw (
  "Historical Sprint 30.5 Stage 2 signature verifier is retired and " +
  "cannot be rerun. Use only a separately Founder-authorised " +
  "Requalification R1 entry point."
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Security

$packagePath = Join-Path $ReleaseDirectory "Oracle_0.1.1.0_x64_STAGE2_LOCAL_TEST_ONLY.msix"
$executablePaths = @(
  (Join-Path $UnpackedDirectory "Oracle.exe"),
  (Join-Path $UnpackedDirectory "resources\app\dist-native\Oracle.WindowDiscovery.exe"),
  (Join-Path $UnpackedDirectory "resources\app\dist-native\Oracle.WindowObserver.exe")
)

function Get-Stage2CertificateStoreMatches {
  $found = @()
  foreach ($location in @("CurrentUser", "LocalMachine")) {
    foreach ($store in @("My", "Root", "TrustedPeople")) {
      $storePath = "Cert:\$location\$store"
      if (Test-Path -LiteralPath $storePath) {
        $found += @(
          Get-ChildItem -LiteralPath $storePath |
            Where-Object { $_.Subject -eq $ExpectedSubject } |
            ForEach-Object {
              [ordered]@{
                location = $location
                store = $store
                thumbprint = $_.Thumbprint
              }
            }
        )
      }
    }
  }
  return @($found)
}

$preExistingStoreMatches = @(Get-Stage2CertificateStoreMatches)
if ($preExistingStoreMatches.Count -ne 0) {
  $existing = $preExistingStoreMatches | ConvertTo-Json -Compress -Depth 4
  throw "Stage 2 signing identity existed before bounded verification: $existing"
}

$signatures = foreach ($path in $executablePaths) {
  $signature = Get-AuthenticodeSignature -LiteralPath $path
  if ($null -eq $signature.SignerCertificate) {
    throw "Missing Authenticode signature: $path"
  }
  if ($signature.SignerCertificate.Subject -ne $ExpectedSubject) {
    throw "Unexpected signer subject: $path"
  }
  if ($signature.Status -eq "HashMismatch" -or $signature.Status -eq "NotSigned") {
    throw "Invalid Authenticode signature: $path ($($signature.Status))"
  }
  [ordered]@{
    path = Split-Path -Leaf $path
    status = [string]$signature.Status
    subject = $signature.SignerCertificate.Subject
    thumbprint = $signature.SignerCertificate.Thumbprint
    notAfter = $signature.SignerCertificate.NotAfter.ToUniversalTime().ToString("o")
  }
}

$signerCertificate = (Get-AuthenticodeSignature -LiteralPath $executablePaths[0]).SignerCertificate
$signerThumbprint = $signerCertificate.Thumbprint
$temporaryCertificatePath = Join-Path $ReleaseDirectory "stage-2-verification-temporary.cer"
$temporaryTrust = $null
$packageSignature = $null

try {
  [System.IO.File]::WriteAllBytes(
    $temporaryCertificatePath,
    $signerCertificate.Export(
      [System.Security.Cryptography.X509Certificates.X509ContentType]::Cert
    )
  )
  $temporaryTrust = Import-Certificate `
    -FilePath $temporaryCertificatePath `
    -CertStoreLocation "Cert:\CurrentUser\Root"
  $packageSignature = Get-AuthenticodeSignature -LiteralPath $packagePath
  if ($null -eq $packageSignature.SignerCertificate) {
    throw "Missing Authenticode signature: $packagePath"
  }
  if ($packageSignature.SignerCertificate.Subject -ne $ExpectedSubject) {
    throw "Unexpected signer subject: $packagePath"
  }
  if ($packageSignature.Status -ne "Valid") {
    throw "Invalid MSIX signature: $packagePath ($($packageSignature.Status))"
  }
}
finally {
  foreach ($location in @("CurrentUser", "LocalMachine")) {
    foreach ($store in @("My", "Root", "TrustedPeople")) {
      Remove-Item `
        -LiteralPath "Cert:\$location\$store\$signerThumbprint" `
        -Force `
        -ErrorAction SilentlyContinue
    }
  }
  Remove-Item -LiteralPath $temporaryCertificatePath -Force -ErrorAction SilentlyContinue
}

$signatures = @(
  [ordered]@{
    path = Split-Path -Leaf $packagePath
    status = [string]$packageSignature.Status
    subject = $packageSignature.SignerCertificate.Subject
    thumbprint = $packageSignature.SignerCertificate.Thumbprint
    notAfter = $packageSignature.SignerCertificate.NotAfter.ToUniversalTime().ToString("o")
  }
) + @($signatures)

$manifestPath = Join-Path $ReleaseDirectory "oracle-release-manifest.json"
$signaturePath = "$manifestPath.p7s"
$content = [System.Security.Cryptography.Pkcs.ContentInfo]::new(
  [System.IO.File]::ReadAllBytes($manifestPath)
)
$cms = [System.Security.Cryptography.Pkcs.SignedCms]::new($content, $true)
$cms.Decode([System.IO.File]::ReadAllBytes($signaturePath))
$cms.CheckSignature($true)
if ($cms.SignerInfos.Count -ne 1) {
  throw "Release Manifest must have exactly one signer."
}
if ($cms.SignerInfos[0].Certificate.Subject -ne $ExpectedSubject) {
  throw "Release Manifest signer subject is invalid."
}

$storeMatches = @(Get-Stage2CertificateStoreMatches)
if ($storeMatches.Count -ne 0) {
  $remaining = $storeMatches | ConvertTo-Json -Compress -Depth 4
  throw "Stage 2 signing certificate remains in a Windows certificate store: $remaining"
}

[ordered]@{
  status = "passed"
  authenticode = $signatures
  releaseManifestSignature = [ordered]@{
    valid = $true
    detached = $true
    subject = $cms.SignerInfos[0].Certificate.Subject
    thumbprint = $cms.SignerInfos[0].Certificate.Thumbprint
    notAfter = $cms.SignerInfos[0].Certificate.NotAfter.ToUniversalTime().ToString("o")
  }
  certificateStoreMatches = @($storeMatches)
  temporaryTrustUsed = $true
  trustRemoved = $true
  privateSigningMaterialDestroyed = $true
  productionTrusted = $false
} | ConvertTo-Json -Depth 8
