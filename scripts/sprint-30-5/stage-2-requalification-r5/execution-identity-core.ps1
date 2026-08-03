Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-OracleStage2R5ExecutionIdentity {
  [CmdletBinding()]
  param(
    [scriptblock] $UtcNowProvider,
    [scriptblock] $EntropyProvider
  )

  $observedUtc = if ($null -ne $UtcNowProvider) {
    & $UtcNowProvider
  } else {
    [DateTime]::UtcNow
  }
  if ($observedUtc -isnot [DateTime]) {
    throw "The UTC provider did not return a DateTime."
  }
  $timestampUtc = $observedUtc.ToUniversalTime().ToString(
    "yyyy-MM-ddTHH:mm:ss.fffZ",
    [Globalization.CultureInfo]::InvariantCulture
  )

  [byte[]] $entropy = New-Object byte[] 4
  if ($null -ne $EntropyProvider) {
    $provided = & $EntropyProvider
    if ($null -eq $provided) {
      throw "Secure entropy generation returned null."
    }
    [byte[]] $providedBytes = @($provided)
    if ($providedBytes.Length -ne 4) {
      throw "Secure entropy generation must return exactly four bytes."
    }
    [Array]::Copy($providedBytes, $entropy, 4)
  } else {
    $generator = $null
    try {
      $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
      if ($null -eq $generator) {
        throw "RandomNumberGenerator.Create returned null."
      }
      $generator.GetBytes($entropy)
    } catch {
      throw "Secure entropy generation failed: $($_.Exception.Message)"
    } finally {
      if ($null -ne $generator) {
        $generator.Dispose()
      }
    }
  }

  if (@($entropy | Where-Object { $_ -ne 0 }).Count -eq 0) {
    throw "Secure entropy generation returned the prohibited all-zero suffix."
  }

  $suffix = ([BitConverter]::ToString($entropy)).Replace("-", "").ToLowerInvariant()
  if ($suffix -notmatch "^[0-9a-f]{8}$" -or $suffix -eq "00000000") {
    throw "Secure entropy did not produce a valid governed suffix."
  }
  $compactTimestamp = $timestampUtc.Replace("-", "").Replace(":", "").Replace(".", "")
  $attemptId = "r5-$compactTimestamp-$suffix"
  $authorityId = "authority-$attemptId"
  if ($attemptId -notmatch "^r5-\d{8}T\d{9}Z-[0-9a-f]{8}$") {
    throw "Generated attempt identity is malformed."
  }
  if ($authorityId -ne "authority-$attemptId") {
    throw "Generated authority and attempt identities do not match."
  }

  [pscustomobject]@{
    timestampUtc = $timestampUtc
    suffix = $suffix
    attemptId = $attemptId
    authorityId = $authorityId
  }
}
