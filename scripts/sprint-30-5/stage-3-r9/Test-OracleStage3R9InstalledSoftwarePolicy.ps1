[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Oracle.Stage3R9InstalledSoftwarePolicy.ps1")

function Assert-True([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}

$fixtures = @{
  "machine-64" = @(
    [pscustomobject]@{
      DisplayName = "Zulu"
      DisplayVersion = "2.0"
      Publisher = "Publisher B"
    },
    [pscustomobject]@{ PSChildName = "Connection Manager" },
    [pscustomobject]@{ DisplayName = $null },
    [pscustomobject]@{ DisplayName = "" }
  )
  "machine-32" = @(
    [pscustomobject]@{
      DisplayName = "Alpha"
      DisplayVersion = "1.0"
      Publisher = "Publisher A"
    },
    [pscustomobject]@{ DisplayName = "   " },
    [pscustomobject]@{
      DisplayName = 42
      DisplayVersion = $null
    }
  )
  "current-user" = @(
    [pscustomobject]@{
      DisplayName = "Alpha"
      DisplayVersion = "1.0"
      Publisher = "Publisher A"
    },
    [pscustomobject]@{
      DisplayName = "Beta"
    }
  )
}
$viewCalls = [Collections.Generic.List[string]]::new()
$reader = {
  param($Name, $Path)
  $viewCalls.Add("$Name|$Path")
  @($fixtures[$Name])
}

$first = @(Get-OracleStage3R9InstalledSoftwareInventory -RegistryViewReader $reader)
$second = @(Get-OracleStage3R9InstalledSoftwareInventory -RegistryViewReader $reader)
$firstJson = $first | ConvertTo-Json -Depth 8 -Compress
$secondJson = $second | ConvertTo-Json -Depth 8 -Compress

Assert-True ($first.Count -eq 5) "Usable records or duplicates were dropped."
Assert-True ($first[0].DisplayName -ceq "42") "Non-string DisplayName was not deterministic."
Assert-True ($first[1].DisplayName -ceq "Alpha") "Ordinal ordering differs."
Assert-True ($first[2].DisplayName -ceq "Alpha") "Duplicate preservation differs."
Assert-True ($first[3].DisplayName -ceq "Beta") "Missing optional fields changed ordering."
Assert-True ($first[4].DisplayName -ceq "Zulu") "Valid inventory behaviour changed."
Assert-True ($null -eq $first[3].DisplayVersion) "Missing DisplayVersion must remain null."
Assert-True ($null -eq $first[3].Publisher) "Missing Publisher must remain null."
Assert-True ($firstJson -ceq $secondJson) "Installed-software ordering is not deterministic."
Assert-True ($viewCalls.Count -eq 6) "All three registry views were not read per inventory."
Assert-True (
  @($viewCalls | Where-Object { $_ -match '^machine-64\|' }).Count -eq 2
) "The 64-bit uninstall view was not covered."
Assert-True (
  @($viewCalls | Where-Object { $_ -match '^machine-32\|' }).Count -eq 2
) "The 32-bit uninstall view was not covered."

$missingDisplayNameDidNotThrow = $false
try {
  $ignored = @(ConvertTo-OracleStage3R9InstalledSoftwareInventory -RegistryEntries @(
    [pscustomobject]@{ PSChildName = "WIC" }
  ))
  $missingDisplayNameDidNotThrow = $ignored.Count -eq 0
} catch {
  $missingDisplayNameDidNotThrow = $false
}
Assert-True $missingDisplayNameDidNotThrow (
  "A missing DisplayName property failed under StrictMode."
)

$nullRecordRejected = $false
try {
  [void](ConvertTo-OracleStage3R9InstalledSoftwareInventory -RegistryEntries @($null))
} catch {
  $nullRecordRejected = $_.Exception.Message -match "null record"
}
Assert-True $nullRecordRejected "A genuinely malformed null registry record was accepted."

$inaccessibleViewRejected = $false
try {
  [void](Get-OracleStage3R9InstalledSoftwareInventory -RegistryViewReader {
    param($Name, $Path)
    if ($Name -ceq "machine-32") { throw "fixture access denied" }
    @()
  })
} catch {
  $inaccessibleViewRejected = $_.Exception.Message -match "fixture access denied"
}
Assert-True $inaccessibleViewRejected "An inaccessible registry view was silently accepted."

[ordered]@{
  result = "passed"
  strictMode = "Latest"
  validRecordCount = $first.Count
  missingDisplayNameIgnored = $missingDisplayNameDidNotThrow
  nullDisplayNameIgnored = $true
  emptyDisplayNameIgnored = $true
  whitespaceDisplayNameIgnored = $true
  nonStringDisplayName = $first[0].DisplayName
  duplicatesPreserved = @($first | Where-Object {
    $_.DisplayName -ceq "Alpha"
  }).Count
  registryViews = @("machine-64", "machine-32", "current-user")
  inaccessibleViewRejected = $inaccessibleViewRejected
  deterministic = $firstJson -ceq $secondJson
} | ConvertTo-Json -Depth 8
