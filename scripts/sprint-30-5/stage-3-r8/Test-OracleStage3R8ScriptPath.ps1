[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$ExpectedScriptPath,
  [Parameter(Mandatory = $true)][string]$ExpectedSha256
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$scriptPath = $MyInvocation.MyCommand.Path
$scriptCommandType = $MyInvocation.MyCommand.GetType().FullName

function Test-FunctionScopedInvocation {
  [ordered]@{
    commandType = $MyInvocation.MyCommand.GetType().FullName
    hasPathProperty = $null -ne $MyInvocation.MyCommand.PSObject.Properties["Path"]
    capturedScriptPath = $scriptPath
  }
}

$functionState = Test-FunctionScopedInvocation
$resolvedScriptPath = [IO.Path]::GetFullPath($scriptPath)
$resolvedExpectedPath = [IO.Path]::GetFullPath($ExpectedScriptPath)
$observedSha256 = (
  Get-FileHash -LiteralPath $scriptPath -Algorithm SHA256
).Hash.ToLowerInvariant()

if ($scriptCommandType -cne "System.Management.Automation.ExternalScriptInfo") {
  throw "The regression fixture was not invoked through powershell.exe -File."
}
if ($resolvedScriptPath -cne $resolvedExpectedPath) {
  throw "Script-scoped MyInvocation did not resolve the exact executing file."
}
if (
  [string]$functionState.commandType -cne
    "System.Management.Automation.FunctionInfo" -or
  [bool]$functionState.hasPathProperty
) {
  throw "Function-scoped MyInvocation semantics differ from Windows PowerShell 5.1."
}
if ([string]$functionState.capturedScriptPath -cne $scriptPath) {
  throw "A function could not use the captured script-scoped path."
}
if ($observedSha256 -cne $ExpectedSha256.ToLowerInvariant()) {
  throw "Captured script path did not hash the exact executing file."
}

[ordered]@{
  result = "passed"
  invocationMode = "powershell.exe -File"
  scriptCommandType = $scriptCommandType
  functionCommandType = $functionState.commandType
  functionHasPathProperty = $functionState.hasPathProperty
  scriptPath = $scriptPath
  sha256 = $observedSha256
} | ConvertTo-Json -Depth 4
