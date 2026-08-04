[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Oracle.Stage4R4ProcessTeardownPolicy.ps1")

function New-ProcessFixture([int]$ProcessId, [string]$ExecutablePath) {
  [pscustomobject]@{ ProcessId = $ProcessId; ExecutablePath = $ExecutablePath }
}
function Assert-Throws([scriptblock]$Action, [string]$Pattern) {
  $failure = $null
  try { & $Action } catch { $failure = $_ }
  if ($null -eq $failure -or $failure.Exception.Message -notmatch $Pattern) {
    throw "Expected failure was not observed: $Pattern"
  }
}

$ownedPath = "C:\Program Files\WindowsApps\Oracle\app.exe"
$observed = New-ProcessFixture 1324 $ownedPath
$ownershipChecks = 0
$stopCalls = 0
$lookupCalls = 0
$stopped = Invoke-OracleStage4R4OwnedProcessStop -ObservedProcess $observed `
  -OwnershipValidator { param($candidate) $script:ownershipChecks++; if ($candidate.ExecutablePath -cne $ownedPath) { throw "not owned" } } `
  -StopAction { param($processId) $script:stopCalls++; if ($processId -ne 1324) { throw "wrong PID" } } `
  -CurrentLookup { param($processId) $script:lookupCalls++; @() }
if ($stopped.outcome -cne "stop-requested" -or $ownershipChecks -ne 1 -or $stopCalls -ne 1 -or $lookupCalls -ne 0) {
  throw "Ordinary owned-process stop behavior differs."
}

$ownershipChecks = 0
$alreadyExited = Invoke-OracleStage4R4OwnedProcessStop -ObservedProcess $observed `
  -OwnershipValidator { param($candidate) $script:ownershipChecks++; if ($candidate.ExecutablePath -cne $ownedPath) { throw "not owned" } } `
  -StopAction { param($processId) throw "Cannot find a process with the process identifier $processId." } `
  -CurrentLookup { param($processId) @() }
if ($alreadyExited.outcome -cne "already-exited-after-verified-observation" -or -not $alreadyExited.currentProcessAbsent -or $ownershipChecks -ne 1) {
  throw "Verified already-exited race was not reconciled."
}

$ownershipChecks = 0
Assert-Throws {
  Invoke-OracleStage4R4OwnedProcessStop -ObservedProcess $observed `
    -OwnershipValidator { param($candidate) $script:ownershipChecks++; if ($candidate.ExecutablePath -cne $ownedPath) { throw "not owned" } } `
    -StopAction { param($processId) throw "access denied" } `
    -CurrentLookup { param($processId) @(New-ProcessFixture $processId $ownedPath) }
} "Ownership-verified process remained after stop failure"
if ($ownershipChecks -ne 2) { throw "Surviving process ownership was not reverified." }

Assert-Throws {
  Invoke-OracleStage4R4OwnedProcessStop -ObservedProcess $observed `
    -OwnershipValidator { param($candidate) if ($candidate.ExecutablePath -cne $ownedPath) { throw "reused PID is not package owned" } } `
    -StopAction { param($processId) throw "stop failed" } `
    -CurrentLookup { param($processId) @(New-ProcessFixture $processId "C:\Windows\System32\notepad.exe") }
} "reused PID is not package owned"

Assert-Throws {
  Invoke-OracleStage4R4OwnedProcessStop -ObservedProcess $observed `
    -OwnershipValidator { param($candidate) if ($candidate.ExecutablePath -cne $ownedPath) { throw "not owned" } } `
    -StopAction { param($processId) throw "stop failed" } `
    -CurrentLookup { param($processId) @((New-ProcessFixture $processId $ownedPath), (New-ProcessFixture $processId $ownedPath)) }
} "Process identity became ambiguous"

$stopCalls = 0
Assert-Throws {
  Invoke-OracleStage4R4OwnedProcessStop -ObservedProcess (New-ProcessFixture 1324 "C:\Temp\rogue.exe") `
    -OwnershipValidator { param($candidate) if ($candidate.ExecutablePath -cne $ownedPath) { throw "initial process is not package owned" } } `
    -StopAction { param($processId) $script:stopCalls++ } `
    -CurrentLookup { param($processId) @() }
} "initial process is not package owned"
if ($stopCalls -ne 0) { throw "Unowned process reached the stop action." }

[pscustomobject][ordered]@{
  result = "passed"
  classification = "STAGE-4-R4-PROCESS-TEARDOWN-CORRECTION-VALIDATION"
  verifiedAlreadyExitedRaceAccepted = $true
  survivingOwnedProcessRejected = $true
  reusedPidRejected = $true
  ambiguousPidRejected = $true
  unownedProcessRejectedBeforeStop = $true
  authorityCreated = $false
  attemptCreated = $false
} | ConvertTo-Json -Depth 5
