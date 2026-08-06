[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5ProviderHostPolicy.ps1')

function New-Handoff([string]$Timestamp){
  [pscustomobject]@{
    contract='oracle.sprint-30-5.stage-4-r5-secret-handoff'
    providerIdentity='provider-stage4-r5-20260806T220000000Z-deadbeef'
    providerUrl='http://127.0.0.1:54321'
    mailpitUrl='http://127.0.0.1:54324'
    anonymousKey='fixture-anonymous'
    serviceKey='fixture-service'
    expiresAtUtc=$Timestamp
  }
}
function Assert-Rejected([string]$Timestamp,[string]$Pattern){
  try{[void](Assert-OracleStage4R5SecretHandoffShape (New-Handoff $Timestamp) 'provider-stage4-r5-20260806T220000000Z-deadbeef');throw 'Hostile timestamp was accepted.'}
  catch{if($_.Exception.Message-ceq'Hostile timestamp was accepted.'-or$_.Exception.Message-cnotmatch$Pattern){throw}}
}

$invariant=[Globalization.CultureInfo]::InvariantCulture
$javascriptStyle=[DateTime]::UtcNow.AddMinutes(5).ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'",$invariant)
$powershellStyle=[DateTime]::UtcNow.AddMinutes(5).ToString('o',$invariant)
[void](Assert-OracleStage4R5SecretHandoffShape (New-Handoff $javascriptStyle) 'provider-stage4-r5-20260806T220000000Z-deadbeef')
[void](Assert-OracleStage4R5SecretHandoffShape (New-Handoff $powershellStyle) 'provider-stage4-r5-20260806T220000000Z-deadbeef')
Assert-Rejected ([DateTime]::UtcNow.AddMinutes(-5).ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'",$invariant)) 'expired'
Assert-Rejected '2026-08-06T21:49:03Z' 'canonical cross-runtime UTC'
Assert-Rejected '2026-08-06T21:49:03.754+00:00' 'canonical cross-runtime UTC'
Assert-Rejected '2026-08-06t21:49:03.754z' 'canonical cross-runtime UTC'
Assert-Rejected '2026-02-30T21:49:03.754Z' 'valid UTC instant'

[pscustomobject][ordered]@{
  result='passed'
  classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','CROSS-RUNTIME TIMESTAMP TEST')
  javascriptMillisecondsAccepted=$true
  powershellRoundTripAccepted=$true
  expiredRejected=$true
  missingFractionRejected=$true
  offsetRejected=$true
  nonCanonicalCaseRejected=$true
  invalidCalendarDateRejected=$true
  authorityCreated=$false
  attemptCreated=$false
}|ConvertTo-Json -Depth 5
