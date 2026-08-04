function Test-OracleStage5R1PackageOwnedPath(
  [AllowNull()][string]$ExecutablePath,
  [Parameter(Mandatory = $true)][string]$InstallLocation
) {
  if ([string]::IsNullOrWhiteSpace($ExecutablePath)) { return $false }
  try {
    $path = [IO.Path]::GetFullPath($ExecutablePath)
    $root = [IO.Path]::GetFullPath($InstallLocation).TrimEnd('\') + '\'
    return $path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)
  } catch {
    return $false
  }
}

function Select-OracleStage5R1OwnedDescendants(
  [Parameter(Mandatory = $true)][uint32]$RootProcessId,
  [Parameter(Mandatory = $true)]$Snapshot,
  [Parameter(Mandatory = $true)][string]$InstallLocation
) {
  $rootMatches = @($Snapshot | Where-Object { [uint32]$_.ProcessId -eq $RootProcessId })
  if ($rootMatches.Count -ne 1) {
    throw "Installed activation root is absent or ambiguous during observation."
  }
  if (-not (Test-OracleStage5R1PackageOwnedPath $rootMatches[0].ExecutablePath $InstallLocation)) {
    throw "Installed activation root is no longer owned by the exact package."
  }

  $ids = [Collections.Generic.HashSet[uint32]]::new()
  [void]$ids.Add($RootProcessId)
  do {
    $changed = $false
    foreach ($item in $Snapshot) {
      $id = [uint32]$item.ProcessId
      if (-not $ids.Contains($id) -and $ids.Contains([uint32]$item.ParentProcessId)) {
        [void]$ids.Add($id)
        $changed = $true
      }
    }
  } while ($changed)

  $owned = [Collections.Generic.List[object]]::new()
  $foreignDescendants = 0
  foreach ($item in $Snapshot) {
    $isOwned = Test-OracleStage5R1PackageOwnedPath $item.ExecutablePath $InstallLocation
    $isDescendant = $ids.Contains([uint32]$item.ProcessId)
    if ($isOwned -and -not $isDescendant) {
      throw "A second or orphaned exact-package process tree was observed."
    }
    if ($isOwned -and $isDescendant) {
      $owned.Add($item)
    } elseif ($isDescendant) {
      $foreignDescendants++
    }
  }
  if ($owned.Count -eq 0) {
    throw "Exact installed package process set disappeared during observation."
  }
  [pscustomobject][ordered]@{
    owned = @($owned)
    foreignDescendantsExcluded = $foreignDescendants
  }
}
