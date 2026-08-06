[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptRoot "Oracle.Stage3R13ActivationPolicy.ps1")

function Assert-Rejected([scriptblock]$Action, [string]$Name) {
  $rejected = $false
  try { & $Action } catch { $rejected = $true }
  if (-not $rejected) { throw "Activation fixture was not rejected: $Name" }
}

$contract = Get-Content -LiteralPath (
  Join-Path $scriptRoot "Oracle.Stage3R13Contract.json"
) -Raw | ConvertFrom-Json
Assert-OracleStage3R13ApplicationActivationContract -Contract $contract
$invalidContract = $contract | ConvertTo-Json -Depth 30 | ConvertFrom-Json
$invalidContract.applicationActivation.explorerExitCodeIsQualificationEvidence = $true
Assert-Rejected {
  Assert-OracleStage3R13ApplicationActivationContract -Contract $invalidContract
} "Explorer exit-code contract"

$aumid = "Oracle.Platform.LocalCertification_test!Oracle"
$success = Invoke-OracleStage3R13ApplicationActivation `
  -AppUserModelId $aumid `
  -ActivationRunner {
    param($ObservedAumid, $ObservedArguments)
    if ($ObservedAumid -cne $aumid -or $ObservedArguments -cne "") {
      throw "Activation runner observed changed inputs."
    }
    [pscustomobject]@{ HResult = "0x00000000"; ProcessId = 4242 }
  }
Assert-OracleStage3R13ApplicationActivationSucceeded -Result $success

$availability = Test-OracleStage3R13ApplicationActivationApi -ProbeRunner {
  [pscustomobject]@{ HResult = "0x00000000"; ProcessId = 0 }
}
if (
  -not $availability.available -or
  $availability.classContext -cne "CLSCTX_LOCAL_SERVER"
) {
  throw "Activation API availability fixture failed."
}

Assert-Rejected {
  Invoke-OracleStage3R13ApplicationActivation -AppUserModelId "not-an-aumid"
} "malformed AUMID"
Assert-Rejected {
  $failure = Invoke-OracleStage3R13ApplicationActivation `
    -AppUserModelId $aumid -ActivationRunner {
      [pscustomobject]@{ HResult = "0x80004005"; ProcessId = 0 }
    }
  Assert-OracleStage3R13ApplicationActivationSucceeded -Result $failure
} "HRESULT failure"
Assert-Rejected {
  $zeroPid = Invoke-OracleStage3R13ApplicationActivation `
    -AppUserModelId $aumid -ActivationRunner {
      [pscustomobject]@{ HResult = "0x00000000"; ProcessId = 0 }
    }
  Assert-OracleStage3R13ApplicationActivationSucceeded -Result $zeroPid
} "zero process ID"
Assert-Rejected {
  $runnerError = Invoke-OracleStage3R13ApplicationActivation `
    -AppUserModelId $aumid -ActivationRunner {
      throw "simulated activation error"
    }
  Assert-OracleStage3R13ApplicationActivationSucceeded -Result $runnerError
} "runner error"
Assert-Rejected {
  $incomplete = Invoke-OracleStage3R13ApplicationActivation `
    -AppUserModelId $aumid -ActivationRunner {
      [pscustomobject]@{ HResult = "0x00000000" }
    }
  Assert-OracleStage3R13ApplicationActivationSucceeded -Result $incomplete
} "incomplete native result"
Assert-Rejected {
  $nullResult = Invoke-OracleStage3R13ApplicationActivation `
    -AppUserModelId $aumid -ActivationRunner { $null }
  Assert-OracleStage3R13ApplicationActivationSucceeded -Result $nullResult
} "null native result"
Assert-Rejected {
  $missing = $success | Select-Object * -ExcludeProperty hresult
  Assert-OracleStage3R13ApplicationActivationSucceeded -Result $missing
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
