Set-StrictMode -Version Latest

function Test-OracleWindowsComputerName {
  [CmdletBinding()]
  param(
    [AllowEmptyString()][string]$Observed,
    [AllowEmptyString()][string]$Expected
  )

  [StringComparer]::OrdinalIgnoreCase.Equals($Observed, $Expected)
}
