$ErrorActionPreference = "Stop"
$parent = Split-Path -Parent ([IO.Path]::GetFullPath($PSScriptRoot))
$addresses = @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
  Where-Object {
    $_.IPAddress -ne "127.0.0.1" -and
    $_.AddressState -eq "Preferred"
  } |
  Select-Object InterfaceAlias, IPAddress, PrefixLength |
  Sort-Object InterfaceAlias, IPAddress)
if ($addresses.Count -eq 0) {
  throw "No active IPv4 address was found."
}
$evidence = [ordered]@{
  schemaVersion = 1
  contract = "oracle.sprint-30-5.qualification-machine-address"
  contractVersion = 1
  collectedAt = (Get-Date).ToUniversalTime().ToString("o")
  addresses = $addresses
}
$output = Join-Path $parent "Oracle.Stage1LaptopAddress.json"
$evidence | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $output -Encoding UTF8
$hash = (Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash.ToLowerInvariant()
"$hash  $(Split-Path -Leaf $output)" |
  Set-Content -LiteralPath "$output.sha256.txt" -Encoding ASCII
Write-Host "Qualification laptop IPv4 addresses:"
$addresses | Format-Table -AutoSize
Write-Host "Send Oracle.Stage1LaptopAddress.json to Codex before running the main kit."
