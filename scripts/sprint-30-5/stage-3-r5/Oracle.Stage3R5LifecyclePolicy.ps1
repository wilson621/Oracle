Set-StrictMode -Version Latest

function Get-OracleStage3R5LifecyclePhases {
  @(
    "authority-consumed",
    "transfer-verified",
    "host-admitted",
    "untrusted-rejection-passed",
    "trust-established",
    "negative-path-passed",
    "package-installed",
    "runtime-observed",
    "repair-observed",
    "package-removed",
    "trust-removed",
    "transfer-removed",
    "cleanup-passed",
    "evidence-frozen"
  )
}

function New-OracleStage3R5LifecycleState {
  [pscustomobject][ordered]@{
    index = 0
    terminal = $false
    completed = [Collections.Generic.List[string]]::new()
  }
}

function Move-OracleStage3R5Lifecycle {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][object]$State,
    [Parameter(Mandatory = $true)][string]$Phase
  )

  $phases = @(Get-OracleStage3R5LifecyclePhases)
  Assert-OracleStage3R5NextLifecyclePhase -State $State -Phase $Phase
  $State.completed.Add($Phase)
  $State.index = [int]$State.index + 1
  if ([int]$State.index -eq $phases.Count) {
    $State.terminal = $true
  }
  $State
}

function Assert-OracleStage3R5NextLifecyclePhase {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][object]$State,
    [Parameter(Mandatory = $true)][string]$Phase
  )

  $phases = @(Get-OracleStage3R5LifecyclePhases)
  if (
    $State.terminal -eq $true -or
    [int]$State.index -ge $phases.Count -or
    $phases[[int]$State.index] -cne $Phase
  ) {
    throw "Lifecycle phase is skipped, repeated or out of order: $Phase"
  }
}

function Get-OracleStage3R5TeardownObligations {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$CompletedPhases
  )

  $trustCreated = $CompletedPhases -ccontains "trust-established"
  $packageInstalled = $CompletedPhases -ccontains "package-installed"
  [pscustomobject][ordered]@{
    stopForwardExecution = $true
    removeExactPackage = $packageInstalled
    stopExactPackageProcesses = $packageInstalled
    removeExactRootTrust = $trustCreated
    verifyZeroPackageResidue = $true
    verifyZeroCertificateResidue = $true
    verifyZeroProcessResidue = $true
    preserveAttempt = $true
    retryProhibited = $true
  }
}
