param(
  [Parameter(Mandatory = $true)]
  [string]$ExpectedSubject,
  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"
$removed = [System.Collections.Generic.List[object]]::new()

foreach ($location in @("CurrentUser", "LocalMachine")) {
  foreach ($store in @("My", "Root", "TrustedPeople")) {
    $storePath = "Cert:\$location\$store"
    if (-not (Test-Path -LiteralPath $storePath)) {
      continue
    }
    $matches = @(
      Get-ChildItem -LiteralPath $storePath |
        Where-Object { $_.Subject -eq $ExpectedSubject }
    )
    foreach ($certificate in $matches) {
      Remove-Item `
        -LiteralPath "$storePath\$($certificate.Thumbprint)" `
        -Force `
        -ErrorAction Stop
      $removed.Add([ordered]@{
        location = $location
        store = $store
        thumbprint = $certificate.Thumbprint
        hadPrivateKey = $certificate.HasPrivateKey
      })
    }
  }
}

$remaining = @()
foreach ($location in @("CurrentUser", "LocalMachine")) {
  foreach ($store in @("My", "Root", "TrustedPeople")) {
    $storePath = "Cert:\$location\$store"
    if (Test-Path -LiteralPath $storePath) {
      $remaining += @(
        Get-ChildItem -LiteralPath $storePath |
          Where-Object { $_.Subject -eq $ExpectedSubject } |
          ForEach-Object {
            [ordered]@{
              location = $location
              store = $store
              thumbprint = $_.Thumbprint
            }
          }
      )
    }
  }
}

if ($remaining.Count -ne 0) {
  throw "Stage 2 test-certificate teardown left certificate-store residue."
}

$evidence = [ordered]@{
  schemaVersion = 1
  contract = "oracle.sprint-30-5.stage-2-signing-store-cleanup"
  contractVersion = 1
  completedAt = [DateTime]::UtcNow.ToString("o")
  status = "passed"
  expectedSubject = $ExpectedSubject
  removed = @($removed)
  remaining = @($remaining)
  trustRemoved = $true
}

$parent = Split-Path -Parent $OutputPath
if ($parent) {
  New-Item -ItemType Directory -Path $parent -Force | Out-Null
}
$json = $evidence | ConvertTo-Json -Depth 8
[System.IO.File]::WriteAllText(
  $OutputPath,
  "$json`n",
  [System.Text.UTF8Encoding]::new($false)
)
$evidence | ConvertTo-Json -Depth 8
