Set-StrictMode -Version Latest

function Get-OracleStage4R5ProviderMandatoryMember {
  param([object]$Object, [string]$Name, [string]$Context)
  $property = if ($null -eq $Object) { $null } else { $Object.PSObject.Properties[$Name] }
  if ($null -eq $property) { throw "$Context missing mandatory member: $Name" }
  $property.Value
}

function Assert-OracleStage4R5ProviderAdmission {
  param([Parameter(Mandatory = $true)]$Record, [Parameter(Mandatory = $true)]$Contract)
  foreach ($name in @("contract", "result", "providerHost", "providerIdentity", "network", "provider", "images", "migrations", "secretValuesRecorded")) { [void](Get-OracleStage4R5ProviderMandatoryMember $Record $name "Provider admission") }
  if ([string]$Record.contract -cne "oracle.sprint-30-5.stage-4-r5-provider-admission") { throw "Provider admission contract differs." }
  if ([string]$Record.result -cne "passed") { throw "Provider admission did not pass." }
  if (-not [string]::Equals([string]$Record.providerHost, [string]$Contract.hostArchitecture.engineeringProviderHost.identity, [StringComparison]::OrdinalIgnoreCase)) { throw "Provider host identity differs." }
  if ([string]$Record.providerIdentity -cnotmatch '^provider-stage4-r5-[0-9]{8}T[0-9]{9}Z-[a-f0-9]{8}$') { throw "Provider identity is malformed." }
  if ([bool]$Record.secretValuesRecorded) { throw "Provider admission records secret values." }
  if (
    [bool]$Record.provider.productionEndpoint -or
    [bool]$Record.provider.externalEmail -or
    [string]$Record.provider.classification -cne [string]$Contract.provider.classification -or
    [string]$Record.provider.implementation -cne [string]$Contract.provider.implementation
  ) { throw "Provider classification differs." }
  if (
    [int]$Record.network.activeDefaultRoutes -ne 0 -or
    -not [bool]$Record.network.privateOnLinkOnly -or
    [bool]$Record.network.internetReachable -or
    [bool]$Record.network.postgresPublished
  ) { throw "Provider network isolation differs." }
  $expectedImages = @($Contract.provider.services.PSObject.Properties | ForEach-Object { "$(($_.Value.image))@$(($_.Value.digest))" } | Sort-Object)
  $actualImages = @($Record.images | ForEach-Object { "$([string]$_.image)@$([string]$_.digest)" } | Sort-Object)
  if (($actualImages -join "`n") -cne ($expectedImages -join "`n")) { throw "Provider image set differs." }
  if ((@($Record.migrations) -join "`n") -cne (@($Contract.provider.requiredMigrations) -join "`n")) { throw "Provider migration chain differs." }
  $ports = @($Record.network.publishedPorts | ForEach-Object { [int]$_ } | Sort-Object -Unique)
  if (($ports -join ',') -cne '54321,54324') { throw "Provider publication set differs." }
  $Record
}

function Assert-OracleStage4R5ProviderPublicRecordSecretFree {
  param([Parameter(Mandatory = $true)][string]$Text, [string[]]$KnownSecrets = @())
  foreach ($secret in $KnownSecrets) { if (-not [string]::IsNullOrEmpty($secret) -and $Text.Contains($secret)) { throw "Known provider secret appears in a public record." } }
  if ($Text -match 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+') { throw "JWT-like provider value appears in a public record." }
  if ($Text -match '(?i)"(anonKey|serviceKey|service_role|access_token|refresh_token)"\s*:') { throw "Credential field appears in a public provider record." }
}

function Assert-OracleStage4R5SecretHandoffShape {
  param([Parameter(Mandatory = $true)]$Record, [Parameter(Mandatory = $true)][string]$ExpectedProviderIdentity)
  foreach ($name in @("contract", "providerIdentity", "providerUrl", "mailpitUrl", "anonymousKey", "serviceKey", "expiresAtUtc")) { [void](Get-OracleStage4R5ProviderMandatoryMember $Record $name "Provider secret handoff") }
  if ([string]$Record.contract -cne "oracle.sprint-30-5.stage-4-r5-secret-handoff") { throw "Provider secret handoff contract differs." }
  if ([string]$Record.providerIdentity -cne $ExpectedProviderIdentity) { throw "Provider secret handoff identity differs." }
  if ([string]$Record.providerUrl -cne "http://127.0.0.1:54321" -or [string]$Record.mailpitUrl -cne "http://127.0.0.1:54324") { throw "Provider secret handoff origins differ." }
  if ([string]::IsNullOrWhiteSpace([string]$Record.anonymousKey) -or [string]::IsNullOrWhiteSpace([string]$Record.serviceKey)) { throw "Provider secret handoff credentials are absent." }
  $expiry = [DateTime]::ParseExact([string]$Record.expiresAtUtc, "o", [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::RoundtripKind).ToUniversalTime()
  if ($expiry -le [DateTime]::UtcNow) { throw "Provider secret handoff is expired." }
  [pscustomobject][ordered]@{ result = "passed"; providerIdentity = $ExpectedProviderIdentity; expiresAtUtc = $expiry.ToString("o") }
}
