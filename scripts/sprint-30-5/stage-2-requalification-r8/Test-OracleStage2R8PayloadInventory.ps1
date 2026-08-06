Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage2R8CleanHostCore.ps1')
$a=[pscustomobject]@{path='release/Oracle.Stage2R8PublicCertificate.cer';bytes=[int64]1;sha256=('a'*64)}
$b=[pscustomobject]@{path='release/Oracle_0.1.6.0_x64.msix';bytes=[int64]2;sha256=('b'*64)}
$c=[pscustomobject]@{path='release/oracle-release-manifest.json';bytes=[int64]3;sha256=('c'*64)}
Assert-OracleStage2R8PayloadInventory -Actual @($a,$b,$c) -Expected @($b,$c,$a)
$caseVariant=[pscustomobject]@{path='release/oracle.Stage2R8PublicCertificate.cer';bytes=[int64]1;sha256=('a'*64)}
$hashVariant=[pscustomobject]@{path=$a.path;bytes=[int64]1;sha256=('d'*64)}
$fixtures=@(
  [pscustomobject]@{name='case-sensitive-path';actual=[object[]]@($a,$b,$c);expected=[object[]]@($b,$c,$caseVariant)}
  [pscustomobject]@{name='hash-mismatch';actual=[object[]]@($a,$b,$c);expected=[object[]]@($b,$c,$hashVariant)}
  [pscustomobject]@{name='duplicate-actual';actual=[object[]]@($a,$a,$c);expected=[object[]]@($a,$b,$c)}
  [pscustomobject]@{name='duplicate-manifest';actual=[object[]]@($a,$b,$c);expected=[object[]]@($a,$a,$c)}
)
$cases=[ordered]@{}
foreach($fixture in $fixtures){
  $rejected=$false
  try { Assert-OracleStage2R8PayloadInventory -Actual $fixture.actual -Expected $fixture.expected } catch { $rejected=$true }
  if(-not $rejected){throw "Adversarial inventory fixture was accepted: $($fixture.name)"}
  $cases[$fixture.name]='rejected'
}
[pscustomobject]@{result='passed';permutedOrdinalInventory='accepted';adversarial=$cases} | ConvertTo-Json -Depth 5