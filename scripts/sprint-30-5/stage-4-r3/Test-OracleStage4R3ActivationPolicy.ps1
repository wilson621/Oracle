[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptRoot "Oracle.Stage4R3ActivationPolicy.ps1")

function Assert-Rejected([scriptblock]$Action, [string]$Name) {
  $rejected = $false
  try { & $Action } catch { $rejected = $true }
  if (-not $rejected) { throw "Activation fixture was not rejected: $Name" }
}

$contract = Get-Content -LiteralPath (
  Join-Path $scriptRoot "Oracle.Stage4R3Contract.json"
) -Raw | ConvertFrom-Json
Assert-OracleStage4R3ApplicationActivationContract -Contract $contract
$invalidContract = $contract | ConvertTo-Json -Depth 30 | ConvertFrom-Json
$invalidContract.applicationActivation.explorerExitCodeIsQualificationEvidence = $true
Assert-Rejected {
  Assert-OracleStage4R3ApplicationActivationContract -Contract $invalidContract
} "Explorer exit-code contract"

$aumid = "Oracle.Platform.LocalCertification_test!Oracle"
$success = Invoke-OracleStage4R3ApplicationActivation `
  -AppUserModelId $aumid `
  -ActivationRunner {
    param($ObservedAumid, $ObservedArguments)
    if ($ObservedAumid -cne $aumid -or $ObservedArguments -cne "") {
      throw "Activation runner observed changed inputs."
    }
    [pscustomobject]@{ HResult = "0x00000000"; ProcessId = 4242 }
  }
Assert-OracleStage4R3ApplicationActivationSucceeded -Result $success

$availability = Test-OracleStage4R3ApplicationActivationApi -ProbeRunner {
  [pscustomobject]@{ HResult = "0x00000000"; ProcessId = 0 }
}
if (
  -not $availability.available -or
  $availability.classContext -cne "CLSCTX_LOCAL_SERVER"
) {
  throw "Activation API availability fixture failed."
}

Assert-Rejected {
  Invoke-OracleStage4R3ApplicationActivation -AppUserModelId "not-an-aumid"
} "malformed AUMID"
Assert-Rejected {
  $failure = Invoke-OracleStage4R3ApplicationActivation `
    -AppUserModelId $aumid -ActivationRunner {
      [pscustomobject]@{ HResult = "0x80004005"; ProcessId = 0 }
    }
  Assert-OracleStage4R3ApplicationActivationSucceeded -Result $failure
} "HRESULT failure"
Assert-Rejected {
  $zeroPid = Invoke-OracleStage4R3ApplicationActivation `
    -AppUserModelId $aumid -ActivationRunner {
      [pscustomobject]@{ HResult = "0x00000000"; ProcessId = 0 }
    }
  Assert-OracleStage4R3ApplicationActivationSucceeded -Result $zeroPid
} "zero process ID"
Assert-Rejected {
  $runnerError = Invoke-OracleStage4R3ApplicationActivation `
    -AppUserModelId $aumid -ActivationRunner {
      throw "simulated activation error"
    }
  Assert-OracleStage4R3ApplicationActivationSucceeded -Result $runnerError
} "runner error"
Assert-Rejected {
  $incomplete = Invoke-OracleStage4R3ApplicationActivation `
    -AppUserModelId $aumid -ActivationRunner {
      [pscustomobject]@{ HResult = "0x00000000" }
    }
  Assert-OracleStage4R3ApplicationActivationSucceeded -Result $incomplete
} "incomplete native result"
Assert-Rejected {
  $nullResult = Invoke-OracleStage4R3ApplicationActivation `
    -AppUserModelId $aumid -ActivationRunner { $null }
  Assert-OracleStage4R3ApplicationActivationSucceeded -Result $nullResult
} "null native result"
Assert-Rejected {
  $missing = $success | Select-Object * -ExcludeProperty hresult
  Assert-OracleStage4R3ApplicationActivationSucceeded -Result $missing
} "missing result member"

[pscustomobject][ordered]@{
  result = "passed"
  directActivation = $true
  explorerExitCodeIgnored = $true
  classContext = "CLSCTX_LOCAL_SERVER"
  successHresult = $success.hresult
  successProcessId = $success.processId
  malformedAumidRejected = $true
  nonzeroHresultRejected = $true
  zeroProcessIdRejected = $true
  runnerErrorRejected = $true
  incompleteNativeResultRejected = $true
  nullNativeResultRejected = $true
  missingMemberRejected = $true
} | ConvertTo-Json -Depth 10
