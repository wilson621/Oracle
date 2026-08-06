[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
  [string]$ManifestPath,

  [Parameter(Mandatory = $true)]
  [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
  [string]$PfxPath,

  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$Password,

  [Parameter(Mandatory = $true)]
  [ValidatePattern("^[0-9A-F]{40}$")]
  [string]$ExpectedThumbprint,

  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$ExpectedSubject,

  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$SignaturePath
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
Add-Type -AssemblyName System.Security

if (Test-Path -LiteralPath $SignaturePath) {
  throw "Detached signature destination already exists."
}

$parent = Split-Path -Parent ([IO.Path]::GetFullPath($SignaturePath))
if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
  throw "Detached signature parent does not exist."
}

$certificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new(
  $PfxPath,
  $Password,
  [Security.Cryptography.X509Certificates.X509KeyStorageFlags]::EphemeralKeySet
)

try {
  if ($certificate.Thumbprint -cne $ExpectedThumbprint) {
    throw "PFX thumbprint differs from the attempt binding."
  }
  if ($certificate.Subject -cne $ExpectedSubject) {
    throw "PFX subject differs from the attempt binding."
  }

  $content = [Security.Cryptography.Pkcs.ContentInfo]::new(
    [IO.File]::ReadAllBytes($ManifestPath)
  )
  $signed = [Security.Cryptography.Pkcs.SignedCms]::new($content, $true)
  $signer = [Security.Cryptography.Pkcs.CmsSigner]::new($certificate)
  $signer.IncludeOption = (
    [Security.Cryptography.X509Certificates.X509IncludeOption]::EndCertOnly
  )
  $signed.ComputeSignature($signer)

  $temporary = Join-Path $parent (
    "." + [IO.Path]::GetFileName($SignaturePath) +
    ".tmp-" + [guid]::NewGuid().ToString("N")
  )
  try {
    $bytes = $signed.Encode()
    $stream = [IO.File]::Open(
      $temporary,
      [IO.FileMode]::CreateNew,
      [IO.FileAccess]::Write,
      [IO.FileShare]::None
    )
    try {
      $stream.Write($bytes, 0, $bytes.Length)
      $stream.Flush()
    }
    finally {
      $stream.Dispose()
    }
    if (Test-Path -LiteralPath $SignaturePath) {
      throw "Detached signature destination appeared before publication."
    }
    [IO.File]::Move($temporary, $SignaturePath)
  }
  finally {
    if (Test-Path -LiteralPath $temporary) {
      Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue
    }
  }
}
finally {
  $certificate.Dispose()
}
