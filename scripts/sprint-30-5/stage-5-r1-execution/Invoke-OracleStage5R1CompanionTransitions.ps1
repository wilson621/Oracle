[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][uint32]$OracleRootProcessId,
  [Parameter(Mandatory = $true)][string]$InstallLocation,
  [Parameter(Mandatory = $true)][string]$OutputPath
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage5R1ObservationOwnershipPolicy.ps1")
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

$output = [IO.Path]::GetFullPath($OutputPath)
if (Test-Path -LiteralPath $output) { throw "Transition evidence is create-only." }
$workRoot = Split-Path -Parent $output
[IO.Directory]::CreateDirectory($workRoot) | Out-Null
$fixture = Join-Path $workRoot "cod.exe"
$fixtureTemplate = Join-Path $PSScriptRoot "Oracle.Stage5GameWindowFixture.exe"
$contract = Get-Content -LiteralPath (Join-Path $PSScriptRoot "Oracle.Stage5R1Contract.json") -Raw | ConvertFrom-Json
if (-not (Test-Path -LiteralPath $fixtureTemplate -PathType Leaf)) { throw "Bound companion fixture is absent." }
$templateHash = (Get-FileHash -LiteralPath $fixtureTemplate -Algorithm SHA256).Hash.ToLowerInvariant()
if ($templateHash -cne [string]$contract.host.companionFixture.sha256) { throw "Bound companion fixture hash mismatch." }
[IO.File]::Copy($fixtureTemplate, $fixture, $false)
$fixtureHash = (Get-FileHash -LiteralPath $fixture -Algorithm SHA256).Hash.ToLowerInvariant()
if ($fixtureHash -cne $templateHash) { throw "Copied companion fixture hash mismatch." }
$records = [Collections.Generic.List[object]]::new()
$fixtureProcess = $null

function Get-OracleOwnedIds {
  $snapshot = @(Get-CimInstance Win32_Process -ErrorAction Stop)
  $root = @($snapshot | Where-Object { [uint32]$_.ProcessId -eq $OracleRootProcessId })
  if ($root.Count -ne 1 -or -not (Test-OracleStage5R1PackageOwnedPath $root[0].ExecutablePath $InstallLocation)) { throw "Oracle root ownership changed during transition test." }
  $ids = [Collections.Generic.HashSet[uint32]]::new(); [void]$ids.Add($OracleRootProcessId)
  do { $changed = $false; foreach ($item in $snapshot) { if (-not $ids.Contains([uint32]$item.ProcessId) -and $ids.Contains([uint32]$item.ParentProcessId)) { [void]$ids.Add([uint32]$item.ProcessId); $changed = $true } } } while ($changed)
  @($ids)
}
function Get-OracleText {
  $ids = @(Get-OracleOwnedIds)
  $condition = [Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::ProcessIdProperty, [int]$OracleRootProcessId)
  $roots = @([Windows.Automation.AutomationElement]::RootElement.FindAll([Windows.Automation.TreeScope]::Children, $condition))
  $text = New-Object Collections.Generic.List[string]
  foreach ($root in $roots) {
    foreach ($element in @($root.FindAll([Windows.Automation.TreeScope]::Descendants, [Windows.Automation.Condition]::TrueCondition))) {
      if ([int]$element.Current.ProcessId -in $ids -and -not [string]::IsNullOrWhiteSpace([string]$element.Current.Name)) { $text.Add([string]$element.Current.Name) }
    }
  }
  @($text)
}
function Wait-ForText([string]$Pattern, [string]$Id) {
  $deadline = [DateTime]::UtcNow.AddSeconds(45)
  do { $values = @(Get-OracleText); if (($values -join "`n") -match $Pattern) { $records.Add([ordered]@{ id = $Id; result = "passed"; observedAtUtc = [DateTime]::UtcNow.ToString("o"); method = "installed-uia-owned-process-tree" }); return }; Start-Sleep -Milliseconds 250 } while ([DateTime]::UtcNow -lt $deadline)
  throw "Installed Companion transition was not observed: $Id / $Pattern"
}
function Invoke-OracleButton([string]$Name) {
  $ids = @(Get-OracleOwnedIds)
  $condition = [Windows.Automation.AndCondition]::new(
    [Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::ControlTypeProperty, [Windows.Automation.ControlType]::Button),
    [Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::NameProperty, $Name)
  )
  foreach ($root in @([Windows.Automation.AutomationElement]::RootElement.FindAll([Windows.Automation.TreeScope]::Children, [Windows.Automation.Condition]::TrueCondition))) {
    foreach ($button in @($root.FindAll([Windows.Automation.TreeScope]::Descendants, $condition))) {
      if ([int]$button.Current.ProcessId -in $ids) { ([Windows.Automation.InvokePattern]$button.GetCurrentPattern([Windows.Automation.InvokePattern]::Pattern)).Invoke(); return }
    }
  }
  throw "Installed Companion control was not found: $Name"
}
function Start-Fixture { $script:fixtureProcess = Start-Process -FilePath $fixture -PassThru; if (-not $script:fixtureProcess.Id) { throw "Game fixture did not start." } }
function Stop-Fixture { if ($null -ne $script:fixtureProcess -and -not $script:fixtureProcess.HasExited) { Stop-Process -Id $script:fixtureProcess.Id -Force -ErrorAction Stop; $script:fixtureProcess.WaitForExit() }; $script:fixtureProcess = $null }

try {
  Start-Fixture
  Wait-ForText "(?i)CALL OF DUTY" "attach"
  Stop-Fixture
  Wait-ForText "(?i)SEARCHING FOR SUPPORTED GAME" "detach"
  Invoke-OracleButton "Enable and observe once"
  Wait-ForText "(?i)(unavailable|cannot|could not|no.*attached|observation off)" "degradation"
  Start-Fixture
  Wait-ForText "(?i)CALL OF DUTY" "recovery"
  $record = [ordered]@{ contract = "oracle.sprint-30-5.stage-5-r1-companion-transitions"; result = "passed"; classification = "GOVERNED-STAGE-5-R1-QUALIFICATION"; fixture = [ordered]@{ classification = "DISPOSABLE-NON-PRODUCTION-WINDOW-DISCOVERY-FIXTURE"; sha256 = $fixtureHash }; transitions = @($records) }
  $bytes = [Text.UTF8Encoding]::new($false).GetBytes((($record | ConvertTo-Json -Depth 8) + "`n"))
  $stream = [IO.File]::Open($output, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
  try { $stream.Write($bytes, 0, $bytes.Length); $stream.Flush($true) } finally { $stream.Dispose() }
} finally {
  Stop-Fixture
  if (Test-Path -LiteralPath $fixture) { Remove-Item -LiteralPath $fixture -Force -ErrorAction Stop }
}
