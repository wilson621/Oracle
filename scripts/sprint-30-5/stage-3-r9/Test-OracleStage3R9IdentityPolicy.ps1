[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptRoot "Oracle.Stage3R9IdentityPolicy.ps1")

function Assert-True([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}

Assert-True (
  Test-OracleWindowsComputerName "FOUNDER-QA-01" "Founder-QA-01"
) "Windows computer-name comparison must ignore casing."
Assert-True (
  Test-OracleWindowsComputerName "Founder-QA-01" "Founder-QA-01"
) "An exact Windows computer-name match must pass."
Assert-True (
  -not (Test-OracleWindowsComputerName "FOUNDER-QA-02" "Founder-QA-01")
) "A materially different Windows computer name must fail."

$rawObservedComputerName = "FOUNDER-QA-01"
$evidence = [ordered]@{
  deviceName = $rawObservedComputerName
}
Assert-True (
  [string]$evidence.deviceName -ceq "FOUNDER-QA-01"
) "Evidence must preserve the raw observed computer-name casing."

[ordered]@{
  result = "passed"
  comparison = "ordinal-ignore-case"
  rawObservedDeviceName = $evidence.deviceName
  collectorAndHarnessPolicy = "Test-OracleWindowsComputerName"
} | ConvertTo-Json -Depth 4
