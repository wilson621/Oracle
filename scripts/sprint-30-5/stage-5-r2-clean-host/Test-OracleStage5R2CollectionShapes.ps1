Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Shape([int]$Count) {
  for ($index = 0; $index -lt $Count; $index++) {
    [pscustomobject]@{ id = $index }
  }
}

foreach ($expected in @(0, 1, 2)) {
  $observed = @(Write-Shape $expected)
  if ($observed.Count -ne $expected) {
    throw "Array-preserving collection shape failed for count $expected."
  }
}

$controller = Get-Content -Raw -LiteralPath (
  Join-Path $PSScriptRoot "Invoke-OracleStage5R2InstalledDevelopmentRehearsal.ps1"
)
$tokens = $null
$parseErrors = $null
[void][Management.Automation.Language.Parser]::ParseFile(
  (Join-Path $PSScriptRoot "Invoke-OracleStage5R2InstalledDevelopmentRehearsal.ps1"),
  [ref]$tokens,
  [ref]$parseErrors
)
if ($parseErrors.Count -ne 0) { throw "Controller contains PowerShell parse errors." }
$compressedKeywordTokens = @($tokens | Where-Object {
  $_.Kind -eq [Management.Automation.Language.TokenKind]::Generic -and
  $_.Text -match '\$'
})
if ($compressedKeywordTokens.Count -ne 0) {
  throw "Controller contains compressed keyword/variable tokens: $($compressedKeywordTokens.Text -join ', ')."
}
if ($controller -match '(?<!@)\(Get-OraclePackages\)\.Count') {
  throw "Controller contains a StrictMode-unsafe direct package count."
}
if ($controller -notmatch '\$packages\s*=\s*@\(Get-OraclePackages\)') {
  throw "Controller does not preserve the one-package collection shape."
}
if (@([regex]::Matches($controller, '@\(Get-OraclePackages\)\.Count')).Count -lt 3) {
  throw "Controller does not preserve all zero-state and teardown collection shapes."
}

[ordered]@{
  result = "passed"
  classification = "NON-QUALIFICATION REGRESSION VALIDATION"
  shapes = @(0, 1, 2)
  qualificationEvidence = $false
  authorityCreated = $false
  attemptCreated = $false
} | ConvertTo-Json
