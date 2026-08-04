Set-StrictMode -Version Latest

function Assert-OracleStage4R3Transfer {
  param(
    [Parameter(Mandatory = $true)][string]$RepositoryRoot,
    [Parameter(Mandatory = $true)][object]$Contract,
    [Parameter(Mandatory = $true)][string]$TransferRoot,
    [Parameter(Mandatory = $true)][string]$ExpectedManifestSha256,
    [Parameter(Mandatory = $true)][string]$ExpectedCustodySha256,
    [Parameter(Mandatory = $true)][string]$ExpectedVerificationSha256,
    [Parameter(Mandatory = $true)][string]$ExecutionCommit,
    [Parameter(Mandatory = $true)][string]$ExecutionTree
  )
  $approvedRoot = [IO.Path]::GetFullPath((Join-Path $RepositoryRoot ([string]$Contract.paths.transferRoot)))
  $transfer = [IO.Path]::GetFullPath($TransferRoot)
  [void](Assert-OracleStage4R3NoReparseTraversal $transfer $approvedRoot)
  if (-not (Test-Path -LiteralPath $transfer -PathType Container)) { throw "Governed R3 transfer is absent." }
  $manifestPath = Join-Path $transfer ([string]$Contract.transfer.manifestFile)
  $custodyPath = Join-Path $transfer ([string]$Contract.transfer.custodyFile)
  $manifestSidecar = "$manifestPath.sha256.txt"
  $custodySidecar = "$custodyPath.sha256.txt"
  $verificationPath = Join-Path $transfer ([string]$Contract.transfer.verificationFile)
  $verificationSidecar = "$verificationPath.sha256.txt"
  foreach ($path in @($manifestPath, $custodyPath, $manifestSidecar, $custodySidecar, $verificationPath, $verificationSidecar)) {
    [void](Assert-OracleStage4R3NoReparseTraversal $path $transfer)
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Governed transfer record is absent: $path" }
  }
  $manifestHash = (Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $custodyHash = (Get-FileHash -LiteralPath $custodyPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $verificationHash = (Get-FileHash -LiteralPath $verificationPath -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($manifestHash -cne $ExpectedManifestSha256.ToLowerInvariant()) { throw "Transfer manifest hash differs." }
  if ($custodyHash -cne $ExpectedCustodySha256.ToLowerInvariant()) { throw "Transfer custody hash differs." }
  if ($verificationHash -cne $ExpectedVerificationSha256.ToLowerInvariant()) { throw "Transfer independent-verification hash differs." }
  if ((Get-Content -Raw -LiteralPath $manifestSidecar).Trim() -cne "$manifestHash  $([string]$Contract.transfer.manifestFile)") { throw "Transfer manifest sidecar differs." }
  if ((Get-Content -Raw -LiteralPath $custodySidecar).Trim() -cne "$custodyHash  $([string]$Contract.transfer.custodyFile)") { throw "Transfer custody sidecar differs." }
  if ((Get-Content -Raw -LiteralPath $verificationSidecar).Trim() -cne "$verificationHash  $([string]$Contract.transfer.verificationFile)") { throw "Transfer verification sidecar differs." }
  $manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
  $custody = Get-Content -Raw -LiteralPath $custodyPath | ConvertFrom-Json
  $verification = Get-Content -Raw -LiteralPath $verificationPath | ConvertFrom-Json
  if (
    [string]$manifest.contract -cne "oracle.sprint-30-5.stage-4-r3-transfer-manifest" -or
    [string]$manifest.transferId -cnotmatch [string]$Contract.identity.transferPattern -or
    [string]$manifest.executionCommit -cne $ExecutionCommit -or
    [string]$manifest.executionTree -cne $ExecutionTree -or
    [string]$manifest.acceptedPreparationCommit -cne [string]$Contract.acceptedPreparation.commit -or
    [string]$manifest.acceptedPreparationTree -cne [string]$Contract.acceptedPreparation.tree -or
    -not [bool]$manifest.founderAuthorisedQualificationExecution -or
    -not [bool]$manifest.singleAttemptOnly
  ) { throw "Transfer manifest authority or baseline binding differs." }
  if (
    [string]$custody.contract -cne "oracle.sprint-30-5.stage-4-r3-transfer-custody" -or
    [string]$custody.transferId -cne [string]$manifest.transferId -or
    [string]$custody.manifestSha256 -cne $manifestHash -or
    -not [bool]$custody.createOnly -or
    -not [bool]$custody.independentVerificationRequired -or
    [int]$custody.files -ne @($manifest.files).Count
  ) { throw "Transfer custody binding differs." }
  if ([string]$verification.contract -cne 'oracle.sprint-30-5.stage-4-r3-transfer-verification' -or [string]$verification.result -cne 'passed' -or [string]$verification.transferId -cne [string]$manifest.transferId -or [string]$verification.manifestSha256 -cne $manifestHash -or [string]$verification.custodySha256 -cne $custodyHash -or [string]$verification.executionCommit -cne $ExecutionCommit -or [string]$verification.executionTree -cne $ExecutionTree -or [bool]$verification.authorityCreated -or [bool]$verification.attemptCreated) { throw 'Transfer independent-verification binding differs.' }
  $payloadRoot = Join-Path $transfer ([string]$Contract.transfer.payloadDirectory)
  [void](Assert-OracleStage4R3NoReparseTraversal $payloadRoot $transfer)
  $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
  $expectedBytes = [int64]0
  foreach ($entry in @($manifest.files)) {
    $relative = [string]$entry.path
    if ([string]::IsNullOrWhiteSpace($relative) -or $relative.Contains('\') -or $relative.StartsWith('/') -or $relative -match '(^|/)\.\.(/|$)' -or -not $seen.Add($relative)) { throw "Transfer inventory path is invalid or duplicated." }
    $path = [IO.Path]::GetFullPath((Join-Path $payloadRoot $relative.Replace('/', '\')))
    [void](Assert-OracleStage4R3NoReparseTraversal $path $payloadRoot)
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Transfer payload file is absent: $relative" }
    $item = Get-Item -LiteralPath $path -Force
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 -or [int64]$item.Length -ne [int64]$entry.bytes) { throw "Transfer payload metadata differs: $relative" }
    if ((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$entry.sha256) { throw "Transfer payload hash differs: $relative" }
    $expectedBytes += [int64]$entry.bytes
  }
  $physical = @(Get-ChildItem -LiteralPath $payloadRoot -Recurse -File -Force)
  if ($physical.Count -ne $seen.Count -or [int64]$custody.bytes -ne $expectedBytes) { throw "Transfer physical inventory or byte count differs." }
  foreach ($file in $physical) {
    $relative = $file.FullName.Substring($payloadRoot.Length).TrimStart('\').Replace('\', '/')
    if (-not $seen.Contains($relative)) { throw "Unmanifested transfer payload exists: $relative" }
  }
  [pscustomobject][ordered]@{
    transferId = [string]$manifest.transferId
    transferRoot = $transfer
    manifestSha256 = $manifestHash
    custodySha256 = $custodyHash
    verificationSha256 = $verificationHash
    executionCommit = [string]$manifest.executionCommit
    executionTree = [string]$manifest.executionTree
    files = $seen.Count
    bytes = $expectedBytes
    independentlyVerified = $true
  }
}
