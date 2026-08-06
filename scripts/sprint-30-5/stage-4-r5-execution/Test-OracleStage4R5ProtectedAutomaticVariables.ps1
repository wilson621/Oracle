[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'

$protected=[Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach($name in @('Host','PID','PSVersionTable','PSEdition','ShellId','HOME','ExecutionContext','PSHOME')){[void]$protected.Add($name)}

function Get-ProtectedReferences([Management.Automation.Language.Ast]$Ast){
  @(
    $Ast.FindAll({
      param($node)
      $node-is[Management.Automation.Language.VariableExpressionAst]-and
        $protected.Contains([string]$node.VariablePath.UserPath)
    },$true)
  )
}

$testName=[IO.Path]::GetFileName($PSCommandPath)
$violations=[Collections.Generic.List[string]]::new()
foreach($file in @(Get-ChildItem -LiteralPath $PSScriptRoot -Filter '*.ps1' -File|Where-Object{$_.Name-cne$testName}|Sort-Object Name)){
  $tokens=$null;$errors=$null
  $ast=[Management.Automation.Language.Parser]::ParseFile($file.FullName,[ref]$tokens,[ref]$errors)
  if(@($errors).Count-ne0){throw "PowerShell parse failure: $($file.Name)"}
  foreach($reference in @(Get-ProtectedReferences $ast)){$violations.Add("$($file.Name):$($reference.Extent.StartLineNumber):`$$($reference.VariablePath.UserPath)")}
}
if($violations.Count-ne0){throw "Protected automatic-variable reference found: $($violations-join', ')"}

$tokens=$null;$errors=$null
$hostile=[Management.Automation.Language.Parser]::ParseInput('$hOsT = [pscustomobject]@{ result = ''passed'' }',[ref]$tokens,[ref]$errors)
if(@($errors).Count-ne0-or@(Get-ProtectedReferences $hostile).Count-ne1){throw 'Case-insensitive hostile Host collision was not rejected.'}

$originalHost=$Host
$hostAdmission=[pscustomobject]@{result='passed';computerName='FOUNDER-QA-01'}
$continuity=[ordered]@{host=$hostAdmission}
if([string]$continuity.host.computerName-cne'FOUNDER-QA-01'-or-not[object]::ReferenceEquals($Host,$originalHost)){throw 'Renamed host-admission runtime binding differs.'}

[pscustomobject][ordered]@{
  result='passed'
  classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','PROTECTED AUTOMATIC-VARIABLE TEST')
  scriptsInspected=@(Get-ChildItem -LiteralPath $PSScriptRoot -Filter '*.ps1' -File|Where-Object{$_.Name-cne$testName}).Count
  protectedNames=@($protected|Sort-Object)
  caseInsensitiveHostileFixtureRejected=$true
  renamedAdmissionRuntimePassed=$true
  authorityCreated=$false
  attemptCreated=$false
}|ConvertTo-Json -Depth 6
