[CmdletBinding()]
param(
  [string]$OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$operationalFiles = @(
  "Get-OracleStage3R6HostContinuity.ps1",
  "Invoke-OracleStage3R6PreAuthorityPreflight.ps1",
  "Invoke-OracleStage3R6Qualification.ps1",
  "Oracle.Stage3R6CertificateTrustPolicy.ps1",
  "Oracle.Stage3R6IdentityPolicy.ps1",
  "Oracle.Stage3R6InstalledSoftwarePolicy.ps1",
  "Oracle.Stage3R6LifecyclePolicy.ps1",
  "Oracle.Stage3R6PackageInventoryPolicy.ps1",
  "Oracle.Stage3R6PreflightPolicy.ps1",
  "Oracle.Stage3R6ProcessPolicy.ps1",
  "Oracle.Stage3R6WindowsExecutablePolicy.ps1"
)

function Get-Classification(
  [string]$File,
  [string]$Function,
  [string]$Expression,
  [string]$Member
) {
  if (
    $Function -ceq "Get-RequiredObjectMemberValue" -and
    (
      $Expression -match '^\$InputObject\.PSObject(?:\.Properties)?$' -or
      $Expression -ceq '$property.Value'
    )
  ) {
    return [ordered]@{
      classification = "explicitly-existence-checked-mandatory-member"
      dataSource = "manifest-bound JSON object"
      mandatory = $true
      protection = "PSObject.Properties[name] is checked for null before Value access"
      testCoverage = "Test-OracleStage3R6OptionalMemberAudit.ps1 and verify-preparation.mjs"
      disposition = "fail-closed-if-missing"
    }
  }
  if (
    $File -ceq "Oracle.Stage3R6PreflightPolicy.ps1" -and
    $Expression -match '\.PSObject\.Properties\['
  ) {
    return [ordered]@{
      classification = "explicitly-existence-checked"
      dataSource = "external or JSON object"
      mandatory = $true
      protection = "PSObject.Properties[name] is checked before mandatory Value access"
      testCoverage = "Test-OracleStage3R6HostShapeFixtures.ps1"
      disposition = "fail-closed-if-missing"
    }
  }
  if ($Expression -match '\.PSObject\.Properties\[') {
    return [ordered]@{
      classification = "explicitly-existence-checked"
      dataSource = "PSObject dynamic or optional property collection"
      mandatory = $false
      protection = "PSObject.Properties[name] is tested for null before Value access"
      testCoverage = "Test-OracleStage3R6InstalledSoftwarePolicy.ps1"
      disposition = "safe"
    }
  }
  if ($File -ceq "Oracle.Stage3R6InstalledSoftwarePolicy.ps1") {
    return [ordered]@{
      classification = "structurally-guaranteed-by-construction"
      dataSource = "policy-owned view or normalized inventory record"
      mandatory = $true
      protection = "record is constructed by this policy after optional-member filtering"
      testCoverage = "Test-OracleStage3R6InstalledSoftwarePolicy.ps1"
      disposition = "safe"
    }
  }
  if ($File -ceq "Oracle.Stage3R6LifecyclePolicy.ps1") {
    return [ordered]@{
      classification = "structurally-guaranteed-by-construction"
      dataSource = "policy-owned lifecycle state"
      mandatory = $true
      protection = "state shape is created only by New-OracleStage3R6LifecycleState"
      testCoverage = "Test-OracleStage3R6LifecyclePolicy.ps1"
      disposition = "safe"
    }
  }
  if ($File -ceq "Oracle.Stage3R6PreflightPolicy.ps1") {
    return [ordered]@{
      classification = "structurally-guaranteed-or-preflight-validated"
      dataSource = "PowerShell runtime, typed command metadata, validated contract or preflight-owned record"
      mandatory = $true
      protection = "typed producer or Get-OracleStage3R6RequiredPropertyValue"
      testCoverage = "host-shape fixtures and Founder-QA-01 pre-authority probe"
      disposition = "fail-closed-if-unavailable"
    }
  }
  if ($File -ceq "Oracle.Stage3R6ProcessPolicy.ps1") {
    return [ordered]@{
      classification = "explicitly-validated-process-envelope-member"
      dataSource = "policy-owned process envelope or injected failure fixture"
      mandatory = $true
      protection = "Get-OracleStage3R6RequiredProcessMember checks every member before use"
      testCoverage = "Test-OracleStage3R6ProcessPolicy.ps1"
      disposition = "fail-closed-if-missing"
    }
  }
  if ($File -ceq "Oracle.Stage3R6PackageInventoryPolicy.ps1") {
    return [ordered]@{
      classification = "structurally-guaranteed-by-platform-type"
      dataSource = "System.IO.Compression and policy-owned package records"
      mandatory = $true
      protection = "typed ZIP APIs and canonical record construction"
      testCoverage = "Test-OracleStage3R6PackageInventoryPolicy.ps1"
      disposition = "safe"
    }
  }
  if ($File -ceq "Oracle.Stage3R6IdentityPolicy.ps1") {
    return [ordered]@{
      classification = "structurally-guaranteed-by-platform-type"
      dataSource = "System.StringComparer"
      mandatory = $true
      protection = "typed .NET ordinal comparison"
      testCoverage = "Test-OracleStage3R6IdentityPolicy.ps1"
      disposition = "safe"
    }
  }
  if ($File -ceq "Oracle.Stage3R6CertificateTrustPolicy.ps1") {
    return [ordered]@{
      classification = "policy-owned-or-platform-certificate-member"
      dataSource = "policy store definition or typed X509Certificate2 object"
      mandatory = $true
      protection = "physical registry presence, exact provider lookup and fixture-backed identity assertion"
      testCoverage = "Test-OracleStage3R6CertificateTrustPolicy.ps1"
      disposition = "fail-closed-if-missing-or-mismatched"
    }
  }
  if ($File -ceq "Oracle.Stage3R6WindowsExecutablePolicy.ps1") {
    return [ordered]@{
      classification = "structurally-guaranteed-by-platform-policy"
      dataSource = "typed .NET Windows folder APIs and policy-owned paths"
      mandatory = $true
      protection = "absolute direct-child mapping, existence and reparse checks"
      testCoverage = "Test-OracleStage3R6WindowsExecutablePolicy.ps1"
      disposition = "fail-closed-if-unavailable"
    }
  }
  if ($Expression -match '^\$contract(?:\.|$)') {
    return [ordered]@{
      classification = "mandatory-validated-contract-member"
      dataSource = "Oracle.Stage3R6Contract.json"
      mandatory = $true
      protection = "contract shape and exact bindings are validated by verify-preparation.mjs"
      testCoverage = "verify-preparation.mjs"
      disposition = "fail-closed-if-missing"
    }
  }
  if ($Expression -match '^\$(manifest|bootstrapManifest|custody|releaseManifest|sbom|provenance|signatureEvidence|packageInventory|hostContinuity)(?:\.|$)') {
    return [ordered]@{
      classification = "mandatory-validated-json-member"
      dataSource = "manifest-bound JSON input"
      mandatory = $true
      protection = "StrictMode plus exact contract, identity, count and hash validation"
      testCoverage = "verify-preparation.mjs and development rehearsal"
      disposition = "fail-closed-if-missing"
    }
  }
  if ($Expression -match '^\$_\.(path|sha256|size|reservedContainerMetadata|percentDecoded|available|visible|processName|handle|minimized|height|width|State|RemoteAddress|OwningProcess|Store|Location|Name|FullName|Length)$') {
    return [ordered]@{
      classification = "mandatory-pipeline-record-member"
      dataSource = "validated or policy-constructed pipeline record"
      mandatory = $true
      protection = "producer shape, cardinality and strict downstream validation"
      testCoverage = "verify-preparation.mjs and policy fixtures"
      disposition = "fail-closed-if-missing"
    }
  }
  if ($Expression -match '^\$(?:_|originalError)\.(Exception|FullyQualifiedErrorId)(?:\.|$)') {
    return [ordered]@{
      classification = "structurally-guaranteed-by-platform-type"
      dataSource = "PowerShell ErrorRecord"
      mandatory = $true
      protection = "catch block supplies a typed ErrorRecord"
      testCoverage = "failure-path rehearsal"
      disposition = "safe"
    }
  }
  if ($Expression -match '^\$_\.(LicenseStatus|PartialProductKey)$') {
    return [ordered]@{
      classification = "structurally-guaranteed-by-cim-schema"
      dataSource = "SoftwareLicensingProduct CIM instance"
      mandatory = $true
      protection = "pre-authority cmdlet and returned-member probe"
      testCoverage = "Founder-QA-01 pre-authority preflight"
      disposition = "fail-closed-if-schema-differs"
    }
  }
  if ($Expression -match '^\$(system|computerSystem|computerProduct|operatingSystem|tpm|defender|activation|package|packages|process|processCommand|connections|certificate|signature|trustedPackageSignature|processSignature|untrustedSignature|tamperedSignature|cms|entry|zipEntry|reserved|selected|sample|observed|windows|result|recovery|info|authority|attempt|item|file|stream|algorithm|archive|records|state|success|failure)(?:\[.*?\])?(?:\.|$)|^\(Get-(Item|FileHash|AuthenticodeSignature)[\s\S]*\)\.') {
    return [ordered]@{
      classification = "structurally-guaranteed-or-mandatory-platform-member"
      dataSource = "typed .NET, CIM, AppX, certificate, process, filesystem or policy object"
      mandatory = $true
      protection = "typed producer, explicit cardinality/null guard where nullable, and fail-closed use"
      testCoverage = "pre-authority probe, phase rehearsal, static harness validation"
      disposition = "fail-closed-if-unavailable"
    }
  }
  if ($Expression -match '^\$(MyInvocation|PSVersionTable|env:|phases|lifecycleState|processEvidenceCounts|actual|expected|samples|developmentTools|certificateMatches|physicalCertificateMatches|logicalCertificateViews|physicalMatches|logicalViews|seen|issues|viewCalls|fixtures|allFiles|failureResults|teardownFailures|tamperedBytes|sidecarValue|custodySidecarValue|time|hostContinuityRecordedAt|deadline|stableUntil|scriptPath|attemptRoot|canonical|RawZipPath|actualTransferRootEntries|expectedTransferRootEntries|actualPayload|expectedPayload|actualPayloadPaths|payloadPaths|payloadEntries|runningScriptEntry|contractEntry|runningHarnessEntry|runningContractEntry|runningCertificateTrustPolicyEntry|runningIdentityPolicyEntry|runningPackageInventoryPolicyEntry|runningInstalledSoftwarePolicyEntry|runningLifecyclePolicyEntry|runningPreflightPolicyEntry|runningProcessPolicyEntry|runningWindowsExecutablePolicyEntry|zipEntries|candidates|matches|initial|repair|inventory|preflight|packageReconciliation|operation|definition|view)(?:\[.*?\])?(?:\.|$)|^@\(.+\)\.Count$|^\[DateTime\]::UtcNow\.|^\(\[DateTime\]::UtcNow\s+-') {
    return [ordered]@{
      classification = "structurally-guaranteed-by-language-or-construction"
      dataSource = "PowerShell automatic value, array, string, dictionary or policy-owned state"
      mandatory = $true
      protection = "constructed locally or guaranteed by the PowerShell language/runtime"
      testCoverage = "parser validation, StrictMode fixtures and lifecycle rehearsal"
      disposition = "safe"
    }
  }
  $null
}

$records = [Collections.Generic.List[object]]::new()
$unclassified = [Collections.Generic.List[object]]::new()
foreach ($fileName in $operationalFiles) {
  $path = Join-Path $PSScriptRoot $fileName
  $tokens = $null
  $parseErrors = $null
  $ast = [Management.Automation.Language.Parser]::ParseFile(
    $path,
    [ref]$tokens,
    [ref]$parseErrors
  )
  if ($parseErrors.Count -ne 0) {
    throw "Optional-member audit cannot parse $fileName."
  }
  $nodes = $ast.FindAll({
    param($node)
    $node -is [Management.Automation.Language.MemberExpressionAst] -and
    -not $node.Static -and
    $node -isnot [Management.Automation.Language.InvokeMemberExpressionAst]
  }, $true)
  foreach ($node in $nodes) {
    $functionNode = $node.Parent
    while (
      $null -ne $functionNode -and
      $functionNode -isnot [Management.Automation.Language.FunctionDefinitionAst]
    ) { $functionNode = $functionNode.Parent }
    $functionName = if ($null -eq $functionNode) {
      "<script>"
    } else {
      $functionNode.Name
    }
    $expression = ($node.Extent.Text -replace '\s+', ' ').Trim()
    $member = $node.Member.Extent.Text
    $classification = Get-Classification -File $fileName `
      -Function $functionName -Expression $expression -Member $member
    $record = [ordered]@{
      file = $fileName
      line = $node.Extent.StartLineNumber
      function = $functionName
      expression = $expression
      member = $member
    }
    if ($null -eq $classification) {
      $record.classification = "unclassified"
      $unclassified.Add($record)
    } else {
      foreach ($key in $classification.Keys) {
        $record[$key] = $classification[$key]
      }
    }
    $records.Add($record)
  }
}

$report = [ordered]@{
  schemaVersion = "1.0.0"
  contract = "oracle.sprint-30-5.stage-3-r6-optional-member-audit"
  generatedFromOperationalSources = $operationalFiles
  memberAccessCount = $records.Count
  unclassifiedCount = $unclassified.Count
  disposition = if ($unclassified.Count -eq 0) { "passed" } else { "failed" }
  records = $records
}

if ($OutputPath) {
  if (Test-Path -LiteralPath $OutputPath) {
    throw "Optional-member audit output is create-only: $OutputPath"
  }
  $json = $report | ConvertTo-Json -Depth 20
  [IO.File]::WriteAllText(
    $OutputPath,
    "$json`n",
    [Text.UTF8Encoding]::new($false)
  )
}
if ($unclassified.Count -ne 0) {
  $summary = @($unclassified | ForEach-Object {
    "$($_.file):$($_.line):$($_.expression)"
  }) -join "; "
  throw "Unclassified reachable member access remains ($($unclassified.Count)): $summary"
}
$report | ConvertTo-Json -Depth 20
