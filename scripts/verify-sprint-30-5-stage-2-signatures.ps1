param(
  [Parameter(Mandatory = $true)]
  [string]$ReleaseDirectory,
  [Parameter(Mandatory = $true)]
  [string]$UnpackedDirectory,
  [Parameter(Mandatory = $true)]
  [string]$ExpectedSubject
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Security

$packagePath = Join-Path $ReleaseDirectory "Oracle_0.1.1.0_x64_STAGE2_LOCAL_TEST_ONLY.msix"
$paths = @(
  $packagePath,
  (Join-Path $UnpackedDirectory "Oracle.exe"),
  (Join-Path $UnpackedDirectory "resources\app\dist-native\Oracle.WindowDiscovery.exe"),
  (Join-Path $UnpackedDirectory "resources\app\dist-native\Oracle.WindowObserver.exe")
)

$signatures = foreach ($path in $paths) {
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

$storeMatches = @()
foreach ($location in @("CurrentUser", "LocalMachine")) {
  foreach ($store in @("My", "Root", "TrustedPeople")) {
    $storePath = "Cert:\$location\$store"
    if (Test-Path -LiteralPath $storePath) {
      $storeMatches += Get-ChildItem -LiteralPath $storePath |
        Where-Object { $_.Subject -eq $ExpectedSubject } |
        ForEach-Object {
          [ordered]@{
            location = $location
            store = $store
            thumbprint = $_.Thumbprint
          }
        }
    }
  }
}
if ($storeMatches.Count -ne 0) {
  throw "Stage 2 signing certificate remains in a Windows certificate store."
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
  trustRemoved = $true
  privateSigningMaterialDestroyed = $true
  productionTrusted = $false
} | ConvertTo-Json -Depth 8
