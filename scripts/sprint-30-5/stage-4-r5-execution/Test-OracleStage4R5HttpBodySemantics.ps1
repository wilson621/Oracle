[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-HttpHelperDefinition([string]$Path) {
  $tokens = $null
  $errors = $null
  $ast = [Management.Automation.Language.Parser]::ParseFile($Path, [ref]$tokens, [ref]$errors)
  if (@($errors).Count -ne 0) { throw "HTTP helper source did not parse: $Path" }
  $definitions = @($ast.FindAll({
    param($node)
    $node -is [Management.Automation.Language.FunctionDefinitionAst] -and
      $node.Name -ceq 'Invoke-OracleStage4R5Http'
  }, $true))
  if ($definitions.Count -ne 1) { throw "Exactly one HTTP helper was not found: $Path" }
  [string]$definitions[0].Extent.Text
}

$executionPath = Join-Path $PSScriptRoot 'Invoke-OracleStage4R5CleanHostJourney.ps1'
$preparationPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'stage-4-r5\Invoke-OracleStage4R5CleanHostJourney.ps1'
$executionDefinition = Get-HttpHelperDefinition $executionPath
$preparationDefinition = Get-HttpHelperDefinition $preparationPath
if ($executionDefinition -cne $preparationDefinition) { throw 'Preparation and execution HTTP helper semantics differ.' }
foreach ($required in @('$PSBoundParameters.ContainsKey("Body")', '$request.Method = $methodName', 'if ($bodySupplied)')) {
  if (-not $executionDefinition.Contains($required)) { throw "HTTP body semantic guard is absent: $required" }
}
if ($executionDefinition.Contains('if ($null -ne $Body)')) { throw 'Typed-string null comparison remains in the HTTP body path.' }

Invoke-Expression $executionDefinition
$probeUri = 'http://127.0.0.1:1/'
$omittedFailure = $null
try { Invoke-OracleStage4R5Http -Uri $probeUri -Method GET | Out-Null } catch { $omittedFailure = [string]$_.Exception.Message }
if ($omittedFailure -match 'content-body|does not permit a request body') { throw 'An omitted GET body entered the request-body path.' }

$explicitBodyRejections = 0
foreach ($method in @('GET', 'HEAD', 'TRACE')) {
  try { Invoke-OracleStage4R5Http -Uri $probeUri -Method $method -Body '{}' | Out-Null }
  catch {
    if ([string]$_.Exception.Message -cne "HTTP method $method does not permit a request body.") { throw }
    $explicitBodyRejections++
  }
}
if ($explicitBodyRejections -ne 3) { throw 'Body-forbidden methods were not rejected before transport.' }

$postFailure = $null
try { Invoke-OracleStage4R5Http -Uri $probeUri -Method POST -Body '{}' | Out-Null } catch { $postFailure = [string]$_.Exception.Message }
if ($postFailure -match 'does not permit a request body|content-body') { throw 'POST body handling was rejected by the body semantic guard.' }

[pscustomobject][ordered]@{
  result = 'passed'
  classification = @('NON-QUALIFICATION', 'NON-AUTHORITY', 'NON-EVIDENCE', 'HTTP BODY SEMANTICS TEST')
  omittedGetBodySkipped = $true
  explicitForbiddenBodiesRejected = $explicitBodyRejections
  postBodyPermitted = $true
  preparationExecutionSemanticsEqual = $true
  authorityCreated = $false
  attemptCreated = $false
} | ConvertTo-Json -Depth 5
