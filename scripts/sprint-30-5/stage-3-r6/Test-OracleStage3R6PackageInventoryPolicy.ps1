[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$AcceptedPackagePath,
  [Parameter(Mandatory = $true)][string]$AcceptedInventoryPath,
  [Parameter(Mandatory = $true)][string]$ContractPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptRoot "Oracle.Stage3R6PackageInventoryPolicy.ps1")

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$contract = Get-Content -LiteralPath $ContractPath -Raw | ConvertFrom-Json

function New-FixtureZip {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][Collections.IDictionary]$Entries
  )

  $stream = [IO.File]::Open(
    $Path,
    [IO.FileMode]::CreateNew,
    [IO.FileAccess]::Write,
    [IO.FileShare]::None
  )
  $archive = $null
  try {
    $archive = [IO.Compression.ZipArchive]::new(
      $stream,
      [IO.Compression.ZipArchiveMode]::Create,
      $true
    )
    foreach ($name in $Entries.Keys) {
      $entry = $archive.CreateEntry([string]$name)
      $entryStream = $entry.Open()
      try {
        $bytes = [Text.Encoding]::UTF8.GetBytes([string]$Entries[$name])
        $entryStream.Write($bytes, 0, $bytes.Length)
      } finally {
        $entryStream.Dispose()
      }
    }
  } finally {
    if ($null -ne $archive) { $archive.Dispose() }
    $stream.Dispose()
  }
}

$fixtureRoot = Join-Path (
  [IO.Path]::GetTempPath()
) "oracle-stage3-r6-package-inventory-$([Guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null
try {
  $validZip = Join-Path $fixtureRoot "valid.zip"
  New-FixtureZip $validZip ([ordered]@{
    "%40scope/file.txt" = "encoded"
    "plain.txt" = "plain"
    "[Content_Types].xml" = "metadata"
  })
  $first = @(Get-OracleStage3R6PackageZipInventory $validZip)
  $second = @(Get-OracleStage3R6PackageZipInventory $validZip)
  if (
    $first.Count -ne 3 -or
    $second.Count -ne 3 -or
    @($first | Where-Object { $_.path -ceq "@scope/file.txt" }).Count -ne 1 -or
    @($first | Where-Object {
      $_.path -ceq "@scope/file.txt" -and $_.percentDecoded
    }).Count -ne 1 -or
    @($first | Where-Object {
      $_.reservedContainerMetadata -eq $true -and
      $_.path -ceq "[Content_Types].xml"
    }).Count -ne 1 -or
    (($first | ConvertTo-Json -Depth 4 -Compress) -cne
      ($second | ConvertTo-Json -Depth 4 -Compress))
  ) {
    throw "Valid package-inventory normalization was not deterministic."
  }

  $duplicateZip = Join-Path $fixtureRoot "duplicate.zip"
  New-FixtureZip $duplicateZip ([ordered]@{
    "%40scope/file.txt" = "encoded"
    "@scope/file.txt" = "decoded"
  })
  try {
    Get-OracleStage3R6PackageZipInventory $duplicateZip | Out-Null
    throw "Canonical duplicate was accepted."
  } catch {
    if ($_.Exception.Message -cnotmatch "duplicate canonical paths") { throw }
  }

  $traversalZip = Join-Path $fixtureRoot "traversal.zip"
  New-FixtureZip $traversalZip ([ordered]@{
    "%2e%2e/escape.txt" = "unsafe"
  })
  try {
    Get-OracleStage3R6PackageZipInventory $traversalZip | Out-Null
    throw "Encoded traversal was accepted."
  } catch {
    if ($_.Exception.Message -cnotmatch "unsafe or non-canonical") { throw }
  }

  $contentMismatchZip = Join-Path $fixtureRoot "content-mismatch.zip"
  New-FixtureZip $contentMismatchZip ([ordered]@{
    "%40scope/file.txt" = "changed"
    "plain.txt" = "plain"
    "[Content_Types].xml" = "metadata"
  })
  $contentMismatch = @(
    Get-OracleStage3R6PackageZipInventory $contentMismatchZip |
      Where-Object { $_.path -ceq "@scope/file.txt" }
  )
  $originalEncoded = @($first | Where-Object {
    $_.path -ceq "@scope/file.txt"
  })
  if (
    $contentMismatch.Count -ne 1 -or
    $originalEncoded.Count -ne 1 -or
    [string]$contentMismatch[0].sha256 -ceq
      [string]$originalEncoded[0].sha256
  ) {
    throw "Changed package content was not distinguished by SHA-256."
  }

  $metadataMismatchZip = Join-Path $fixtureRoot "metadata-mismatch.zip"
  New-FixtureZip $metadataMismatchZip ([ordered]@{
    "plain.txt" = "plain"
    "[Content_Types].xml" = "changed metadata"
  })
  $metadataMismatch = @(
    Get-OracleStage3R6PackageZipInventory $metadataMismatchZip |
      Where-Object { $_.reservedContainerMetadata -eq $true }
  )
  if (
    $metadataMismatch.Count -ne 1 -or
    [string]$metadataMismatch[0].sha256 -ceq
      [string]$contract.packageInventory.reservedContainerMetadata.sha256
  ) {
    throw "Changed reserved metadata was not distinguished by SHA-256."
  }

  $acceptedInventory = Get-Content -LiteralPath $AcceptedInventoryPath -Raw |
    ConvertFrom-Json
  $acceptedExpected = [Collections.Generic.Dictionary[string,object]]::new(
    [StringComparer]::Ordinal
  )
  foreach ($entry in @($acceptedInventory.entries)) {
    $canonical =
      ConvertTo-OracleStage3R6CanonicalPackagePath ([string]$entry.path)
    if (
      $canonical -cne [string]$entry.path -or
      (Test-OracleStage3R6ReservedPackageMetadata $canonical) -or
      $acceptedExpected.ContainsKey($canonical)
    ) {
      throw "Accepted inventory path is not canonical and unique."
    }
    $acceptedExpected.Add($canonical, $entry)
  }
  $acceptedZip = @(
    Get-OracleStage3R6PackageZipInventory $AcceptedPackagePath
  )
  $acceptedLogical = @($acceptedZip | Where-Object {
    $_.reservedContainerMetadata -eq $false
  })
  $acceptedReserved = @($acceptedZip | Where-Object {
    $_.reservedContainerMetadata -eq $true
  })
  $acceptedEncoded = @($acceptedZip | Where-Object {
    $_.percentDecoded -eq $true
  })
  foreach ($entry in $acceptedLogical) {
    if (-not $acceptedExpected.ContainsKey([string]$entry.path)) {
      throw "Accepted package contains unexpected logical content."
    }
    $expectedEntry = $acceptedExpected[[string]$entry.path]
    if (
      [int64]$entry.size -ne [int64]$expectedEntry.size -or
      [string]$entry.sha256 -cne [string]$expectedEntry.sha256
    ) {
      throw "Accepted package logical content differs."
    }
  }
  if (
    $acceptedExpected.Count -ne
      [int]$contract.packageInventory.governedEntryCount -or
    $acceptedLogical.Count -ne $acceptedExpected.Count -or
    $acceptedZip.Count -ne
      [int]$contract.packageInventory.zipFileEntryCount -or
    $acceptedEncoded.Count -ne
      [int]$contract.packageInventory.percentEncodedEntryCount -or
    $acceptedReserved.Count -ne 1 -or
    [string]$acceptedReserved[0].path -cne
      [string]$contract.packageInventory.reservedContainerMetadata.path -or
    [string]$acceptedReserved[0].rawPath -cne
      [string]$contract.packageInventory.reservedContainerMetadata.rawZipPath -or
    [int64]$acceptedReserved[0].size -ne
      [int64]$contract.packageInventory.reservedContainerMetadata.size -or
    [string]$acceptedReserved[0].sha256 -cne
      [string]$contract.packageInventory.reservedContainerMetadata.sha256
  ) {
    throw "Accepted package inventory contract differs."
  }

  [ordered]@{
    result = "passed"
    canonicalPath = "@scope/file.txt"
    reservedMetadataPath = "[Content_Types].xml"
    logicalEntries = 2
    zipFileEntries = 3
    duplicateRejected = $true
    encodedTraversalRejected = $true
    deterministicRepeat = $true
    contentMismatchDetected = $true
    reservedMetadataMismatchDetected = $true
    acceptedPackageSha256 = (
      Get-FileHash -LiteralPath $AcceptedPackagePath -Algorithm SHA256
    ).Hash.ToLowerInvariant()
    acceptedGovernedEntries = $acceptedExpected.Count
    acceptedZipFileEntries = $acceptedZip.Count
    acceptedPercentEncodedEntries = $acceptedEncoded.Count
    acceptedReservedMetadataSha256 =
      [string]$acceptedReserved[0].sha256
  } | ConvertTo-Json -Depth 4
} finally {
  Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
}
