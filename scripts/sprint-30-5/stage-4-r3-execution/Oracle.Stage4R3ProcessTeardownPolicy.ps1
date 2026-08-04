Set-StrictMode -Version Latest

function Invoke-OracleStage4R3OwnedProcessStop {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][object]$ObservedProcess,
    [Parameter(Mandatory = $true)][scriptblock]$OwnershipValidator,
    [Parameter(Mandatory = $true)][scriptblock]$StopAction,
    [Parameter(Mandatory = $true)][scriptblock]$CurrentLookup
  )

  $processId = [int]$ObservedProcess.ProcessId
  if ($processId -le 0) { throw "Observed package process identity is invalid." }

  & $OwnershipValidator $ObservedProcess
  try {
    $null = & $StopAction $processId
    return [pscustomobject][ordered]@{
      processId = $processId
      outcome = "stop-requested"
      ownershipVerified = $true
      currentProcessAbsent = $false
    }
  } catch {
    $stopFailure = $_.Exception
    $current = @(& $CurrentLookup $processId)
    if ($current.Count -eq 0) {
      return [pscustomobject][ordered]@{
        processId = $processId
        outcome = "already-exited-after-verified-observation"
        ownershipVerified = $true
        currentProcessAbsent = $true
      }
    }
    if ($current.Count -ne 1) {
      throw "Process identity became ambiguous after stop failure: $processId"
    }
    & $OwnershipValidator $current[0]
    throw [InvalidOperationException]::new(
      "Ownership-verified process remained after stop failure: $processId",
      $stopFailure
    )
  }
}
