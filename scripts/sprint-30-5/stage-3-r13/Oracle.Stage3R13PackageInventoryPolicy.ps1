Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function ConvertTo-OracleStage3R13CanonicalPackagePath {
  param([Parameter(Mandatory = $true)][string]$RawZipPath)

  if (
    [string]::IsNullOrWhiteSpace($RawZipPath) -or
    $RawZipPath.Contains("\") -or
    $RawZipPath -match '%(?![0-9A-Fa-f]{2})'
  ) {
    throw "ZIP entry path is not a valid forward-slash percent-encoded path."
  }

  try {
    $canonical = [Uri]::UnescapeDataString($RawZipPath)
  } catch {
    throw "ZIP entry path percent-decoding failed."
  }

  if (
    [string]::IsNullOrWhiteSpace($canonical) -or
    $canonical.StartsWith("/") -or
    $canonical.EndsWith("/") -or
    $canonical.Contains("\") -or
    $canonical -match '[\x00-\x1f]' -or
    @($canonical.Split("/") | Where-Object {
      [string]::IsNullOrEmpty($_) -or $_ -ceq "." -or $_ -ceq ".."
    }).Count -ne 0
  ) {
    throw "Decoded ZIP entry path is unsafe or non-canonical."
  }

  return $canonical
}

function Test-OracleStage3R13ReservedPackageMetadata {
  param([Parameter(Mandatory = $true)][string]$CanonicalPath)

  return [StringComparer]::Ordinal.Equals(
    $CanonicalPath,
    "[Content_Types].xml"
  )
}

function Get-OracleStage3R13PackageZipInventory {
  param([Parameter(Mandatory = $true)][string]$PackagePath)

  if (-not (Test-Path -LiteralPath $PackagePath -PathType Leaf)) {
    throw "Package ZIP does not exist."
  }

  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem

  $records = [Collections.Generic.List[object]]::new()
  $canonicalPaths = [Collections.Generic.HashSet[string]]::new(
    [StringComparer]::Ordinal
  )
  $packageStream = $null
  $archive = $null
  try {
    $packageStream = [IO.File]::Open(
      $PackagePath,
      [IO.FileMode]::Open,
      [IO.FileAccess]::Read,
      [IO.FileShare]::Read
    )
    $archive = [IO.Compression.ZipArchive]::new(
      $packageStream,
      [IO.Compression.ZipArchiveMode]::Read,
      $false
    )

    foreach ($entry in $archive.Entries) {
      if ([string]::IsNullOrEmpty($entry.Name)) {
        throw "Package ZIP contains a directory entry."
      }

      $rawPath = [string]$entry.FullName
      $canonicalPath =
        ConvertTo-OracleStage3R13CanonicalPackagePath $rawPath
      if (-not $canonicalPaths.Add($canonicalPath)) {
        throw "Package ZIP contains duplicate canonical paths."
      }

      $entryStream = $null
      $sha256 = $null
      try {
        $entryStream = $entry.Open()
        $algorithm = [Security.Cryptography.SHA256]::Create()
        try {
          $sha256 = (
            [BitConverter]::ToString($algorithm.ComputeHash($entryStream))
          ).Replace("-", "").ToLowerInvariant()
        } finally {
          $algorithm.Dispose()
        }
      } finally {
        if ($null -ne $entryStream) { $entryStream.Dispose() }
      }

      $records.Add([pscustomobject][ordered]@{
        rawPath = $rawPath
        path = $canonicalPath
        percentDecoded = -not [StringComparer]::Ordinal.Equals(
          $rawPath,
          $canonicalPath
        )
        reservedContainerMetadata =
          Test-OracleStage3R13ReservedPackageMetadata $canonicalPath
        size = [int64]$entry.Length
        sha256 = $sha256
      })
    }
  } finally {
    if ($null -ne $archive) { $archive.Dispose() }
    if ($null -ne $packageStream) { $packageStream.Dispose() }
  }

  return @($records)
}
