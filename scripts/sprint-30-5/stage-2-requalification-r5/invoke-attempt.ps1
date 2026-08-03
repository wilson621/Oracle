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

$requiredAuthority = "FOUNDER-AUTHORISED-STAGE-2-R5-SINGLE-ATTEMPT"
if ($FounderAuthority -cne $requiredAuthority) {
  throw "The exact R5 Founder execution authority token is required."
}

$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
$contractPath = Join-Path $PSScriptRoot "Oracle.Stage2RequalificationR5Contract.json"
$executorPath = Join-Path $PSScriptRoot "execute-attempt.mjs"
if (-not (Test-Path -LiteralPath $contractPath -PathType Leaf)) { throw "R5 contract is missing." }
if (-not (Test-Path -LiteralPath $executorPath -PathType Leaf)) { throw "R5 executor is missing." }
$contract = Get-Content -Raw -LiteralPath $contractPath | ConvertFrom-Json

function Resolve-GovernedExecutable([string] $Name) {
  $configured = $contract.toolchainExecutables.$Name
  if ([string]::IsNullOrWhiteSpace($configured)) { throw "Approved $Name executable path is absent." }
  $path = [IO.Path]::GetFullPath($configured)
  $item = Get-Item -LiteralPath $path -Force -ErrorAction Stop
  if ($item.PSIsContainer -or (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0)) {
    throw "Approved $Name executable is not an exact regular file."
  }
  $realPath = [IO.Path]::GetFullPath((Resolve-Path -LiteralPath $path -ErrorAction Stop).ProviderPath)
  if (-not [string]::Equals($realPath, $path, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Approved $Name executable traverses a reparse path."
  }
  return $path
}

$nodePath = Resolve-GovernedExecutable "node"
$gitPath = Resolve-GovernedExecutable "git"

Push-Location -LiteralPath $repositoryRoot
try {
  $branch = (& $gitPath branch --show-current)
  if ($LASTEXITCODE -ne 0 -or $branch -cne $contract.requiredBranch) { throw "Repository branch preflight failed." }
  $head = (& $gitPath rev-parse HEAD)
  if ($LASTEXITCODE -ne 0 -or $head -cne $HarnessCommit) { throw "Harness commit preflight failed." }
  $observedHarnessTree = (& $gitPath rev-parse "HEAD^{tree}")
  if ($LASTEXITCODE -ne 0 -or $observedHarnessTree -cne $HarnessTree) { throw "Harness tree preflight failed." }
  $status = @(& $gitPath status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0 -or $status.Count -ne 0) { throw "Repository must be clean before identity generation." }

  $identity = New-OracleStage2R5ExecutionIdentity
  if ($identity.suffix -eq "00000000") { throw "The prohibited fixed suffix was generated." }
  $outputRoot = ".artifacts/sprint-30-5/stage-2-requalification-r5/$($identity.attemptId)"
  $authorityPath = ".artifacts/sprint-30-5/stage-2-requalification-r5/authorities/$($identity.authorityId).json"
  if (Test-Path -LiteralPath $outputRoot) { throw "Generated attempt identity already exists." }
  if (Test-Path -LiteralPath $authorityPath) { throw "Generated authority identity already exists." }

  [pscustomobject]@{
    contract = "oracle.sprint-30-5.stage-2-requalification-r5-governed-invocation"
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
  $wrapperEnvironmentName = "ORACLE_STAGE2_R5_GOVERNED_WRAPPER"
  $previousWrapperMarker = [Environment]::GetEnvironmentVariable($wrapperEnvironmentName, "Process")
  try {
    [Environment]::SetEnvironmentVariable(
      $wrapperEnvironmentName,
      "oracle-stage2-r5-governed-wrapper-v1:$PID",
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
  if ($null -eq $executorExitCode) { throw "R5 executor returned a null exit code." }
  exit $executorExitCode
} finally {
  Pop-Location
}
