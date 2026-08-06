Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage2R8CleanHostCore.ps1')
$accepted=[ordered]@{
  exact=(Test-OracleStage2R8HostIdentity -Actual 'Founder-QA-01' -Expected 'Founder-QA-01')
  uppercaseWindows=(Test-OracleStage2R8HostIdentity -Actual 'FOUNDER-QA-01' -Expected 'Founder-QA-01')
  lowercaseWindows=(Test-OracleStage2R8HostIdentity -Actual 'founder-qa-01' -Expected 'Founder-QA-01')
}
$rejected=[ordered]@{
  differentSuffix=(-not (Test-OracleStage2R8HostIdentity -Actual 'FOUNDER-QA-02' -Expected 'Founder-QA-01'))
  appended=(-not (Test-OracleStage2R8HostIdentity -Actual 'FOUNDER-QA-01-X' -Expected 'Founder-QA-01'))
  truncated=(-not (Test-OracleStage2R8HostIdentity -Actual 'FOUNDER-QA' -Expected 'Founder-QA-01'))
}
foreach($value in @($accepted.Values)+@($rejected.Values)){if(-not [bool]$value){throw 'Host identity fixture failed.'}}
[pscustomobject]@{result='passed';comparison='OrdinalIgnoreCase';accepted=$accepted;rejected=$rejected}|ConvertTo-Json -Depth 5