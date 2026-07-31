[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "execution-identity-core.ps1")

function Assert-Throws {
  param([scriptblock] $Action, [string] $Pattern)
  try {
    & $Action
  } catch {
    if ($_.Exception.Message -notmatch $Pattern) {
      throw "Unexpected error: $($_.Exception.Message)"
    }
    return
  }
  throw "Expected a terminating error matching: $Pattern"
}

$utc = [DateTime]::SpecifyKind([DateTime]::ParseExact(
  "2026-07-31T17:01:02.345",
  "yyyy-MM-ddTHH:mm:ss.fff",
  [Globalization.CultureInfo]::InvariantCulture
), [DateTimeKind]::Utc)
$identity = New-OracleStage2R3ExecutionIdentity `
  -UtcNowProvider { $utc } `
  -EntropyProvider { [byte[]] @(0xDE, 0xAD, 0xBE, 0xEF) }
if ($identity.timestampUtc -ne "2026-07-31T17:01:02.345Z") { throw "UTC identity mismatch." }
if ($identity.suffix -ne "deadbeef") { throw "Suffix mismatch." }
if ($identity.attemptId -ne "r3-20260731T170102345Z-deadbeef") { throw "Attempt mismatch." }
if ($identity.authorityId -ne "authority-$($identity.attemptId)") { throw "Authority mismatch." }
$secondIdentity = New-OracleStage2R3ExecutionIdentity `
  -UtcNowProvider { $utc } `
  -EntropyProvider { [byte[]] @(0xCA, 0xFE, 0xBA, 0xBE) }
if ($secondIdentity.attemptId -eq $identity.attemptId) { throw "Distinct entropy did not produce a unique attempt identity." }
if ($secondIdentity.authorityId -ne "authority-$($secondIdentity.attemptId)") { throw "Second authority mismatch." }

Assert-Throws {
  New-OracleStage2R3ExecutionIdentity -UtcNowProvider { $utc } -EntropyProvider { throw "fixture entropy failure" }
} "fixture entropy failure"
Assert-Throws {
  New-OracleStage2R3ExecutionIdentity -UtcNowProvider { $utc } -EntropyProvider { $null }
} "returned null"
Assert-Throws {
  New-OracleStage2R3ExecutionIdentity -UtcNowProvider { $utc } -EntropyProvider { [byte[]] @(1, 2, 3) }
} "exactly four bytes"
Assert-Throws {
  New-OracleStage2R3ExecutionIdentity -UtcNowProvider { $utc } -EntropyProvider { [byte[]] @(0, 0, 0, 0) }
} "prohibited all-zero"

$rng = $null
try {
  [byte[]] $probe = New-Object byte[] 4
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  if ($null -eq $rng) { throw "PowerShell 5.1 RNG creation returned null." }
  $rng.GetBytes($probe)
  if ($probe.Length -ne 4) { throw "PowerShell 5.1 RNG probe length mismatch." }
} finally {
  if ($null -ne $rng) { $rng.Dispose() }
}

[pscustomobject]@{
  result = "PASS"
  powershellVersion = $PSVersionTable.PSVersion.ToString()
  deterministicIdentity = $identity.attemptId
  entropyFailureTerminates = $true
  nullEntropyRejected = $true
  wrongLengthRejected = $true
  allZeroSuffixRejected = $true
  distinctEntropyProducesUniqueIdentity = $true
  productionApi = "RandomNumberGenerator.Create().GetBytes(byte[])"
  authorityCreated = $false
  attemptCreated = $false
} | ConvertTo-Json -Depth 5
