[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $FounderAuthority,
  [Parameter(Mandatory = $true)]
  [ValidatePattern("^[0-9a-f]{40}$")]
  [string] $HarnessCommit,
  [Parameter(Mandatory = $true)]
  [ValidatePattern("^[0-9a-f]{40}$")]
  [string] $HarnessTree
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "execution-identity-core.ps1")

$requiredAuthority = "FOUNDER-AUTHORISED-STAGE-2-R3-SINGLE-ATTEMPT"
if ($FounderAuthority -cne $requiredAuthority) {
  throw "The exact R3 Founder execution authority token is required."
}

$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
$contractPath = Join-Path $PSScriptRoot "Oracle.Stage2RequalificationR3Contract.json"
$executorPath = Join-Path $PSScriptRoot "execute-attempt.mjs"
if (-not (Test-Path -LiteralPath $contractPath -PathType Leaf)) { throw "R3 contract is missing." }
if (-not (Test-Path -LiteralPath $executorPath -PathType Leaf)) { throw "R3 executor is missing." }
$contract = Get-Content -Raw -LiteralPath $contractPath | ConvertFrom-Json

$nodeCommand = Get-Command node.exe -CommandType Application -ErrorAction Stop
$nodePath = [IO.Path]::GetFullPath($nodeCommand.Source)
if (-not (Test-Path -LiteralPath $nodePath -PathType Leaf)) { throw "Approved Node executable is missing." }

Push-Location -LiteralPath $repositoryRoot
try {
  $branch = (& git.exe branch --show-current)
  if ($LASTEXITCODE -ne 0 -or $branch -cne $contract.requiredBranch) { throw "Repository branch preflight failed." }
  $head = (& git.exe rev-parse HEAD)
  if ($LASTEXITCODE -ne 0 -or $head -cne $HarnessCommit) { throw "Harness commit preflight failed." }
  $observedHarnessTree = (& git.exe rev-parse "HEAD^{tree}")
  if ($LASTEXITCODE -ne 0 -or $observedHarnessTree -cne $HarnessTree) { throw "Harness tree preflight failed." }
  $status = @(& git.exe status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0 -or $status.Count -ne 0) { throw "Repository must be clean before identity generation." }

  $identity = New-OracleStage2R3ExecutionIdentity
  if ($identity.suffix -eq "00000000") { throw "The prohibited fixed suffix was generated." }
  $outputRoot = ".artifacts/sprint-30-5/stage-2-requalification-r3/$($identity.attemptId)"
  $authorityPath = ".artifacts/sprint-30-5/stage-2-requalification-r3/authorities/$($identity.authorityId).json"
  if (Test-Path -LiteralPath $outputRoot) { throw "Generated attempt identity already exists." }
  if (Test-Path -LiteralPath $authorityPath) { throw "Generated authority identity already exists." }

  [pscustomobject]@{
    contract = "oracle.sprint-30-5.stage-2-requalification-r3-governed-invocation"
    timestampUtc = $identity.timestampUtc
    authorityId = $identity.authorityId
    attemptId = $identity.attemptId
    nodeExecutable = $nodePath
    executor = $executorPath
    candidateCommit = $contract.candidate.commit
    candidateTree = $contract.candidate.tree
    harnessCommit = $HarnessCommit
    harnessTree = $HarnessTree
    outputRoot = $outputRoot
  } | ConvertTo-Json -Compress

  $arguments = @(
    $executorPath,
    "--founder-authority", $FounderAuthority,
    "--authority-id", $identity.authorityId,
    "--attempt-id", $identity.attemptId,
    "--timestamp-utc", $identity.timestampUtc,
    "--candidate-commit", $contract.candidate.commit,
    "--harness-commit", $HarnessCommit,
    "--machine-identity", [Environment]::MachineName,
    "--package-identity", $contract.package.identity,
    "--package-version", $contract.package.version,
    "--output-root", $outputRoot
  )
  $wrapperEnvironmentName = "ORACLE_STAGE2_R3_GOVERNED_WRAPPER"
  $previousWrapperMarker = [Environment]::GetEnvironmentVariable($wrapperEnvironmentName, "Process")
  try {
    [Environment]::SetEnvironmentVariable(
      $wrapperEnvironmentName,
      "oracle-stage2-r3-governed-wrapper-v1:$PID",
      "Process"
    )
    & $nodePath @arguments
    $executorExitCode = $LASTEXITCODE
  } finally {
    [Environment]::SetEnvironmentVariable(
      $wrapperEnvironmentName,
      $previousWrapperMarker,
      "Process"
    )
  }
  if ($null -eq $executorExitCode) { throw "R3 executor returned a null exit code." }
  exit $executorExitCode
} finally {
  Pop-Location
}
