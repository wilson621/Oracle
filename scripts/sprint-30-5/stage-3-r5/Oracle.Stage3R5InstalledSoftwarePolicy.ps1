Set-StrictMode -Version Latest

function Get-OracleStage3R5OptionalPropertyValue {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][object]$InputObject,
    [Parameter(Mandatory = $true)][string]$Name
  )

  $property = $InputObject.PSObject.Properties[$Name]
  if ($null -eq $property) {
    return $null
  }
  $property.Value
}

function ConvertTo-OracleStage3R5InstalledSoftwareInventory {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [AllowNull()]
    [AllowEmptyCollection()]
    [object[]]$RegistryEntries
  )

  if ($null -eq $RegistryEntries) {
    throw "Installed-software registry enumeration returned a null record."
  }
  $records = [Collections.Generic.List[object]]::new()
  foreach ($entry in $RegistryEntries) {
    if ($null -eq $entry) {
      throw "Installed-software registry enumeration returned a null record."
    }

    $displayNameValue = Get-OracleStage3R5OptionalPropertyValue `
      -InputObject $entry -Name "DisplayName"
    $displayName = if ($null -eq $displayNameValue) {
      $null
    } else {
      [string]$displayNameValue
    }
    if ([string]::IsNullOrWhiteSpace($displayName)) {
      continue
    }

    $displayVersionValue = Get-OracleStage3R5OptionalPropertyValue `
      -InputObject $entry -Name "DisplayVersion"
    $publisherValue = Get-OracleStage3R5OptionalPropertyValue `
      -InputObject $entry -Name "Publisher"
    $records.Add([pscustomobject][ordered]@{
      DisplayName = $displayName
      DisplayVersion = if ($null -eq $displayVersionValue) {
        $null
      } else {
        [string]$displayVersionValue
      }
      Publisher = if ($null -eq $publisherValue) {
        $null
      } else {
        [string]$publisherValue
      }
    })
  }

  $records.Sort([Comparison[object]]{
    param($left, $right)
    foreach ($propertyName in @("DisplayName", "DisplayVersion", "Publisher")) {
      $comparison = [StringComparer]::Ordinal.Compare(
        [string]$left.PSObject.Properties[$propertyName].Value,
        [string]$right.PSObject.Properties[$propertyName].Value
      )
      if ($comparison -ne 0) {
        return $comparison
      }
    }
    0
  })
  @($records)
}

function Get-OracleStage3R5InstalledSoftwareInventory {
  [CmdletBinding()]
  param(
    [scriptblock]$RegistryViewReader
  )

  $views = @(
    [pscustomobject][ordered]@{
      name = "machine-64"
      path = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall"
    },
    [pscustomobject][ordered]@{
      name = "machine-32"
      path = "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
    },
    [pscustomobject][ordered]@{
      name = "current-user"
      path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall"
    }
  )

  $entries = [Collections.Generic.List[object]]::new()
  foreach ($view in $views) {
    $viewEntries = if ($null -ne $RegistryViewReader) {
      @(& $RegistryViewReader $view.name $view.path)
    } elseif (Test-Path -LiteralPath $view.path -ErrorAction Stop) {
      @(Get-ItemProperty -Path (Join-Path $view.path "*") -ErrorAction Stop)
    } else {
      @()
    }
    foreach ($entry in $viewEntries) {
      if ($null -eq $entry) {
        throw "Registry view '$($view.name)' returned a null software record."
      }
      $entries.Add($entry)
    }
  }

  ConvertTo-OracleStage3R5InstalledSoftwareInventory -RegistryEntries $entries
}
