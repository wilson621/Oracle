param(
  [Parameter(Mandatory = $true)]
  [string]$ManifestPath,
  [Parameter(Mandatory = $true)]
  [string]$PfxPath,
  [Parameter(Mandatory = $true)]
  [string]$Password,
  [Parameter(Mandatory = $true)]
  [string]$SignaturePath
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Security

$certificate = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new(
  $PfxPath,
  $Password,
  [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::EphemeralKeySet
)
$content = [System.Security.Cryptography.Pkcs.ContentInfo]::new(
  [System.IO.File]::ReadAllBytes($ManifestPath)
)
$signed = [System.Security.Cryptography.Pkcs.SignedCms]::new($content, $true)
$signer = [System.Security.Cryptography.Pkcs.CmsSigner]::new($certificate)
$signer.IncludeOption = [System.Security.Cryptography.X509Certificates.X509IncludeOption]::EndCertOnly
$signed.ComputeSignature($signer)
[System.IO.File]::WriteAllBytes($SignaturePath, $signed.Encode())
$certificate.Dispose()
