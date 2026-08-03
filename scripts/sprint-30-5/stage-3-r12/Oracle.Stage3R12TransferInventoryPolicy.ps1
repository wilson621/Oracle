Set-StrictMode -Version Latest

function Assert-OracleStage3R12TransferPayloadInventory {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][psobject]$Manifest,
    [Parameter(Mandatory = $true)][psobject]$Contract,
    [Parameter(Mandatory = $true)][string]$TransferRoot,
    [Parameter(Mandatory = $true)][scriptblock]$GetSha256
  )

  if (
    [string]$Contract.transferPayload.inventoryAuthority -cne
      "founder-bound-transfer-manifest" -or
    -not [bool]$Contract.transferPayload.actualDirectoryMustMatchManifest -or
    -not [bool]$Contract.transferPayload.requiredSubsetMustBePresent
  ) {
    throw "Transfer payload inventory contract is absent or weakened."
  }

  $entries = @($Manifest.payload)
  $requiredFileNames = @($Contract.transferPayload.requiredFileNames)
  if ($entries.Count -eq 0 -or $requiredFileNames.Count -eq 0) {
    throw "Transfer payload inventory or required subset is empty."
  }

  $manifestPaths = [Collections.Generic.HashSet[string]]::new(
    [StringComparer]::Ordinal
  )
  $manifestFileNames = [Collections.Generic.HashSet[string]]::new(
    [StringComparer]::OrdinalIgnoreCase
  )
  $payloadBytes = [int64]0
  foreach ($entry in $entries) {
    $relativePath = [string]$entry.path
    $fileName = [IO.Path]::GetFileName($relativePath)
    if (
      $relativePath -cnotmatch '^payload/[^/\\]+$' -or
      [string]$entry.sha256 -cnotmatch '^[0-9a-f]{64}$' -or
      [int64]$entry.size -lt 0 -or
      -not $manifestPaths.Add($relativePath) -or
      -not $manifestFileNames.Add($fileName)
    ) {
      throw "Transfer manifest payload entry is malformed or duplicated."
    }
    $path = Join-Path $TransferRoot $relativePath
    if (
      -not (Test-Path -LiteralPath $path -PathType Leaf) -or
      ((Get-Item -LiteralPath $path -Force).Attributes -band
        [IO.FileAttributes]::ReparsePoint) -ne 0 -or
      (Get-Item -LiteralPath $path -Force).Length -ne [int64]$entry.size -or
      (& $GetSha256 $path) -cne [string]$entry.sha256
    ) {
      throw "Transfer manifest payload bytes differ: $relativePath"
    }
    $payloadBytes += [int64]$entry.size
  }

  $requiredNames = [Collections.Generic.HashSet[string]]::new(
    [StringComparer]::OrdinalIgnoreCase
  )
  foreach ($fileName in $requiredFileNames) {
    if (
      [string]$fileName -cnotmatch '^[^/\\]+$' -or
      -not $requiredNames.Add([string]$fileName) -or
      -not $manifestFileNames.Contains([string]$fileName)
    ) {
      throw "Transfer manifest is missing or duplicates a required payload file."
    }
  }

  $payloadRoot = Join-Path $TransferRoot "payload"
  $actualItems = @(Get-ChildItem -LiteralPath $payloadRoot -Force)
  if (@($actualItems | Where-Object {
    $_.PSIsContainer -or
    (($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0)
  }).Count -ne 0) {
    throw "Transfer payload directory contains a directory or reparse point."
  }
  $actualPaths = @($actualItems | ForEach-Object {
    "payload/$($_.Name)"
  } | Sort-Object)
  $expectedPaths = @($manifestPaths | Sort-Object)
  if (
    $actualPaths.Count -ne $expectedPaths.Count -or
    @(Compare-Object -ReferenceObject $expectedPaths `
      -DifferenceObject $actualPaths -CaseSensitive).Count -ne 0
  ) {
    throw "Transfer payload directory differs from the governed manifest."
  }

  [pscustomobject][ordered]@{
    contract = "oracle.sprint-30-5.stage-3-r12-transfer-payload-inventory"
    inventoryAuthority = "founder-bound-transfer-manifest"
    manifestEntryCount = $entries.Count
    requiredEntryCount = $requiredFileNames.Count
    payloadBytes = $payloadBytes
    actualDirectoryMatched = $true
    allManifestBytesVerified = $true
    requiredSubsetPresent = $true
  }
}
