Set-StrictMode -Version Latest

function Get-OracleStage4R1LifecyclePhases {
  @(
    "authority-consumed", "baseline-verified", "provider-admitted",
    "source-built", "anonymous-boundaries-passed", "account-created-unverified",
    "email-verified", "authenticated-rendering-passed", "isolation-passed",
    "session-invalidated", "provider-torn-down",
    "cleanup-passed", "evidence-frozen"
  )
}
function New-OracleStage4R1LifecycleState {
  [pscustomobject][ordered]@{ index=0; terminal=$false; completed=[Collections.Generic.List[string]]::new() }
}
function Assert-OracleStage4R1NextLifecyclePhase([object]$State,[string]$Phase) {
  $phases=@(Get-OracleStage4R1LifecyclePhases)
  if($State.terminal -or [int]$State.index -ge $phases.Count -or $phases[[int]$State.index] -cne $Phase){
    throw "Lifecycle phase skipped, repeated or out of order: $Phase"
  }
}
function Move-OracleStage4R1Lifecycle([object]$State,[string]$Phase) {
  Assert-OracleStage4R1NextLifecyclePhase $State $Phase
  $State.completed.Add($Phase)
  $State.index=[int]$State.index+1
  if([int]$State.index -eq @(Get-OracleStage4R1LifecyclePhases).Count){$State.terminal=$true}
  $State
}
function Get-OracleStage4R1TeardownObligations([string[]]$CompletedPhases) {
  [pscustomobject][ordered]@{
    stopForwardExecution=$true
    stopWebServer=($CompletedPhases -ccontains "source-built")
    removeDisposableProvider=($CompletedPhases -ccontains "provider-admitted")
    removeSyntheticAccounts=($CompletedPhases -ccontains "account-created-unverified")
    removeMailAndSessions=($CompletedPhases -ccontains "account-created-unverified")
    removeNetworkRules=($CompletedPhases -ccontains "provider-admitted")
    removeBrowserProfile=($CompletedPhases -ccontains "provider-admitted")
    verifyZeroResidue=$true
    preserveAttempt=$true
    retryProhibited=$true
  }
}
