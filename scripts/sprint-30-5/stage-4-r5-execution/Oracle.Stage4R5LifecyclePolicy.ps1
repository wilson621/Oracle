Set-StrictMode -Version Latest

function Get-OracleStage4R5LifecyclePhases {
  @(
    "authority-consumed", "baseline-verified", "zero-state-verified",
    "provider-admitted", "trust-established", "package-installed",
    "runtime-configuration-created", "package-activated",
    "installed-server-admitted", "anonymous-boundaries-passed",
    "account-created-unverified", "email-verified",
    "authenticated-rendering-passed", "isolation-passed",
    "session-invalidated", "package-removed", "trust-removed",
    "provider-torn-down", "cleanup-passed", "evidence-frozen"
  )
}

function New-OracleStage4R5LifecycleState {
  [pscustomobject][ordered]@{
    index = 0
    terminal = $false
    completed = [Collections.Generic.List[string]]::new()
  }
}

function Assert-OracleStage4R5NextLifecyclePhase {
  param([Parameter(Mandatory = $true)]$State, [Parameter(Mandatory = $true)][string]$Phase)
  $phases = @(Get-OracleStage4R5LifecyclePhases)
  if (
    $State.terminal -or
    [int]$State.index -ge $phases.Count -or
    $phases[[int]$State.index] -cne $Phase
  ) { throw "Lifecycle phase skipped, repeated or out of order: $Phase" }
}

function Move-OracleStage4R5Lifecycle {
  param([Parameter(Mandatory = $true)]$State, [Parameter(Mandatory = $true)][string]$Phase)
  Assert-OracleStage4R5NextLifecyclePhase -State $State -Phase $Phase
  $State.completed.Add($Phase)
  $State.index = [int]$State.index + 1
  if ([int]$State.index -eq @(Get-OracleStage4R5LifecyclePhases).Count) { $State.terminal = $true }
  $State
}

function Get-OracleStage4R5TeardownObligations {
  param([string[]]$CompletedPhases)
  [pscustomobject][ordered]@{
    stopForwardExecution = $true
    stopInstalledPackage = $CompletedPhases -ccontains "package-activated"
    removePackage = $CompletedPhases -ccontains "package-installed"
    removeTrust = $CompletedPhases -ccontains "trust-established"
    removeRuntimeConfiguration = $CompletedPhases -ccontains "runtime-configuration-created"
    removeQualificationHostRelays = $CompletedPhases -ccontains "provider-admitted"
    removeDisposableProvider = $CompletedPhases -ccontains "provider-admitted"
    removeSyntheticAccountsAndSessions = $CompletedPhases -ccontains "account-created-unverified"
    removeProviderHostPublications = $CompletedPhases -ccontains "provider-admitted"
    verifyBothHostsZeroResidue = $true
    preserveAttempt = $true
    retryProhibited = $true
  }
}
