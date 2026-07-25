param(
  [Parameter(Mandatory = $true)]
  [string]$ReleaseDirectory,
  [Parameter(Mandatory = $true)]
  [string]$UnpackedDirectory
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Security

$expectedSubject = "CN=Oracle Local Test Signing - NOT PRODUCTION"
$paths = @(
  (Join-Path $ReleaseDirectory "Oracle_0.1.0.0_x64_LOCAL_TEST_ONLY.msix"),
  (Join-Path $UnpackedDirectory "Oracle.exe"),
  (Join-Path $UnpackedDirectory "resources\app\dist-native\Oracle.WindowDiscovery.exe"),
  (Join-Path $UnpackedDirectory "resources\app\dist-native\Oracle.WindowObserver.exe")
)

$signatures = foreach ($path in $paths) {
  $signature = Get-AuthenticodeSignature -LiteralPath $path
  if ($null -eq $signature.SignerCertificate) {
    throw "Missing Authenticode signature: $path"
  }
  if ($signature.SignerCertificate.Subject -ne $expectedSubject) {
    throw "Unexpected signer subject: $path"
  }
  if ($signature.Status -eq "HashMismatch" -or $signature.Status -eq "NotSigned") {
    throw "Invalid Authenticode signature: $path ($($signature.Status))"
  }
  [ordered]@{
    path = $path
    status = [string]$signature.Status
    subject = $signature.SignerCertificate.Subject
    thumbprint = $signature.SignerCertificate.Thumbprint
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
if ($cms.SignerInfos[0].Certificate.Subject -ne $expectedSubject) {
  throw "Release Manifest signer subject is invalid."
}

[ordered]@{
  authenticode = $signatures
  releaseManifestSignature = [ordered]@{
    valid = $true
    detached = $true
    subject = $cms.SignerInfos[0].Certificate.Subject
    thumbprint = $cms.SignerInfos[0].Certificate.Thumbprint
  }
} | ConvertTo-Json -Depth 6
