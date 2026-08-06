[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage2R8CleanHostCore.ps1')
$root = Join-Path ([IO.Path]::GetTempPath()) ('oracle-stage2-r8-canary-' + [Guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($root) | Out-Null
try {
  $values = @('r8-build-canary.invalid','oracle-r8-anon-canary-not-a-secret')
  $absentPath = Join-Path $root 'absent.bin'
  [IO.File]::WriteAllBytes($absentPath, [byte[]]::new((1MB) + 257))
  if (Test-OracleStage2R8FileContainsCanary -Path $absentPath -Values $values) { throw 'Absent canary fixture was accepted.' }

  $boundaryPath = Join-Path $root 'boundary.bin'
  $boundaryBytes = [byte[]]::new((1MB) + 257)
  $utf8 = [Text.Encoding]::UTF8.GetBytes($values[0])
  [Buffer]::BlockCopy($utf8, 0, $boundaryBytes, (1MB) - 5, $utf8.Length)
  [IO.File]::WriteAllBytes($boundaryPath, $boundaryBytes)
  if (-not (Test-OracleStage2R8FileContainsCanary -Path $boundaryPath -Values $values)) { throw 'Chunk-boundary UTF-8 canary was missed.' }

  $unicodePath = Join-Path $root 'unicode.bin'
  $unicodeBytes = [byte[]]::new(4096)
  $unicode = [Text.Encoding]::Unicode.GetBytes($values[1])
  [Buffer]::BlockCopy($unicode, 0, $unicodeBytes, 2039, $unicode.Length)
  [IO.File]::WriteAllBytes($unicodePath, $unicodeBytes)
  if (-not (Test-OracleStage2R8FileContainsCanary -Path $unicodePath -Values $values)) { throw 'UTF-16LE canary was missed.' }

  [pscustomobject][ordered]@{
    result = 'passed'
    absentRejected = $true
    utf8ChunkBoundaryDetected = $true
    utf16LeDetected = $true
    chunkBytes = 1MB
  } | ConvertTo-Json -Compress
} finally {
  if (Test-Path -LiteralPath $root) { Remove-Item -LiteralPath $root -Recurse -Force }
}
