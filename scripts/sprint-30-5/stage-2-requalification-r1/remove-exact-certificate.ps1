[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern("^[0-9A-F]{40}$")]
  [string]$Thumbprint,

  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$ExpectedSubject,

  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Assert-CreateOnlyOutputPath {
  param([Parameter(Mandatory = $true)][string]$Path)

  $repositoryRoot = [IO.Path]::GetFullPath(
    (Join-Path $PSScriptRoot "..\..\..")
  )
  $resolved = [IO.Path]::GetFullPath($Path)
  $repositoryPrefix = $repositoryRoot.TrimEnd("\") + "\"
  if (
    -not $resolved.StartsWith(
      $repositoryPrefix,
      [StringComparison]::OrdinalIgnoreCase
    )
  ) {
    throw "Cleanup evidence must remain inside the repository."
  }
  $relative = $resolved.Substring($repositoryPrefix.Length).Replace("\", "/")

  if (
    -not $relative.StartsWith(
      ".artifacts/sprint-30-5/stage-2-requalification/",
      [StringComparison]::OrdinalIgnoreCase
    ) -or
    $relative.Contains("/../") -or
    $relative.EndsWith("/..", [StringComparison]::Ordinal)
  ) {
    throw "Cleanup evidence must be inside an R1 attempt artifact root."
  }

  $attemptRelative = $relative.Substring(
    ".artifacts/sprint-30-5/stage-2-requalification/".Length
  )
  $attemptId = $attemptRelative.Split("/")[0]
  if ($attemptId -notmatch "^r1-\d{8}T\d{9}Z-[0-9a-f]{8}$") {
    throw "Cleanup evidence does not identify a valid immutable R1 attempt."
  }

  $cursor = $repositoryRoot
  foreach ($segment in $relative.Split("/")) {
    $cursor = Join-Path $cursor $segment
    if (
      (Test-Path -LiteralPath $cursor) -and
      (
        (
          Get-Item -LiteralPath $cursor -Force
        ).Attributes -band [IO.FileAttributes]::ReparsePoint
      )
    ) {
      throw "Cleanup evidence path traverses a reparse point."
    }
  }

  foreach ($protected in @(
    ".artifacts/sprint-30-5/stage-2/",
    "docs/sprints/evidence/sprint-30-5/stage-2/",
    "docs/sprints/evidence/sprint-30-5/stage-3"
  )) {
    if ($relative.StartsWith($protected, [StringComparison]::OrdinalIgnoreCase)) {
      throw "Cleanup evidence cannot target historical qualification data."
    }
  }

  if (Test-Path -LiteralPath $resolved) {
    throw "Cleanup evidence already exists; overwrite is forbidden."
  }
  return $resolved
}

function Get-ExactCertificateMatches {
  $matches = [Collections.Generic.List[object]]::new()
  foreach ($location in @("CurrentUser", "LocalMachine")) {
    foreach ($store in @("My", "Root", "TrustedPeople")) {
      $storePath = "Cert:\$location\$store"
      if (-not (Test-Path -LiteralPath $storePath)) {
        continue
      }
      $certificate = Get-ChildItem -LiteralPath $storePath |
        Where-Object { $_.Thumbprint -ceq $Thumbprint }
      foreach ($item in @($certificate)) {
        $matches.Add([pscustomobject]@{
          Location = $location
          Store = $store
          Certificate = $item
        })
      }
    }
  }
  return @($matches)
}

$resolvedOutput = Assert-CreateOnlyOutputPath -Path $OutputPath
$matches = @(Get-ExactCertificateMatches)

if ($matches.Count -eq 0) {
  throw "The exact generated R1 certificate thumbprint was not found."
}

foreach ($match in $matches) {
  if ([string]$match.Certificate.Subject -cne $ExpectedSubject) {
    throw (
      "Exact thumbprint exists with an unexpected subject in " +
      "$($match.Location)\$($match.Store)."
    )
  }
}

$removed = [Collections.Generic.List[object]]::new()
foreach ($match in $matches) {
  $certificatePath = "Cert:\$($match.Location)\$($match.Store)\$Thumbprint"
  if ($PSCmdlet.ShouldProcess($certificatePath, "Remove exact R1 certificate")) {
    Remove-Item -LiteralPath $certificatePath -Force -ErrorAction Stop
    $removed.Add([ordered]@{
      location = $match.Location
      store = $match.Store
      thumbprint = $Thumbprint
      subject = [string]$match.Certificate.Subject
      hadPrivateKey = [bool]$match.Certificate.HasPrivateKey
    })
  }
}

$remaining = @(Get-ExactCertificateMatches)
if ($remaining.Count -ne 0) {
  throw "Exact R1 certificate thumbprint remains after cleanup."
}

$evidence = [ordered]@{
  schemaVersion = "1.0.0"
  contract = "oracle.sprint-30-5.stage-2-requalification-r1-certificate-cleanup"
  programmeIdentity = "Sprint 30.5 Stage 2 Requalification R1"
  completedAt = [DateTime]::UtcNow.ToString("o")
  status = "passed"
  expectedSubject = $ExpectedSubject
  exactThumbprint = $Thumbprint
  removed = @($removed)
  remainingExactThumbprintMatches = 0
  subjectWideRemovalUsed = $false
  trustRemoved = $true
}

$parent = Split-Path -Parent $resolvedOutput
if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
  throw "The governed R1 attempt directory does not exist."
}

$temporary = Join-Path $parent (
  "." + [IO.Path]::GetFileName($resolvedOutput) +
  ".tmp-" + [guid]::NewGuid().ToString("N")
)
$utf8NoBom = [Text.UTF8Encoding]::new($false)
try {
  $json = $evidence | ConvertTo-Json -Depth 8
  $stream = [IO.File]::Open(
    $temporary,
    [IO.FileMode]::CreateNew,
    [IO.FileAccess]::Write,
    [IO.FileShare]::None
  )
  try {
    $writer = [IO.StreamWriter]::new($stream, $utf8NoBom)
    try {
      $writer.Write($json + [Environment]::NewLine)
      $writer.Flush()
    }
    finally {
      $writer.Dispose()
    }
  }
  finally {
    if ($null -ne $stream) {
      $stream.Dispose()
    }
  }
  if (Test-Path -LiteralPath $resolvedOutput) {
    throw "Cleanup evidence target appeared before atomic finalisation."
  }
  [IO.File]::Move($temporary, $resolvedOutput)
}
finally {
  if (Test-Path -LiteralPath $temporary) {
    Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue
  }
}

$evidence | ConvertTo-Json -Depth 8
