[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$ProviderUrl,
  [Parameter(Mandatory = $true)][string]$MailpitUrl,
  [Parameter(Mandatory = $true)][string]$WebOrigin,
  [Parameter(Mandatory = $true)][string]$AnonymousKey,
  [Parameter(Mandatory = $true)][Security.SecureString]$ServiceKey,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [switch]$DevelopmentRehearsal
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$contract = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot "Oracle.Stage4R5Contract.json") | ConvertFrom-Json
. (Join-Path $PSScriptRoot "Oracle.Stage4R5JourneyPolicy.ps1")

if (-not $DevelopmentRehearsal -and -not [bool]$contract.authorityBoundary.qualificationExecutionPermitted) { throw "The R5 engineering-preparation contract bars qualification execution." }
if (Test-Path -LiteralPath $OutputPath) { throw "Journey output is create-only." }
foreach ($pair in @(@($ProviderUrl, "http://127.0.0.1:54321"), @($MailpitUrl, "http://127.0.0.1:54324"))) {
  if ([string]$pair[0] -cne [string]$pair[1]) { throw "Clean-host provider or Mailpit origin differs from the loopback relay contract." }
}
$web = $null
if (-not [Uri]::TryCreate($WebOrigin, [UriKind]::Absolute, [ref]$web) -or $web.Scheme -cne "http" -or $web.Host -cne "127.0.0.1" -or $web.IsDefaultPort) { throw "Installed Web origin is invalid." }
if ([string]::IsNullOrWhiteSpace($AnonymousKey)) { throw "Anonymous provider key is absent." }

function ConvertFrom-OracleStage4R5SecureString {
  param([Parameter(Mandatory = $true)][Security.SecureString]$Value)
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

function ConvertTo-OracleStage4R5Base64Url {
  param([Parameter(Mandatory = $true)][string]$Value)
  [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Value)).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Invoke-OracleStage4R5Http {
  param(
    [Parameter(Mandatory = $true)][string]$Uri,
    [string]$Method = "GET",
    [hashtable]$Headers = @{},
    [AllowNull()][string]$Body = $null,
    [AllowNull()][string]$Cookie = $null
  )
  $request = [Net.HttpWebRequest]::CreateHttp($Uri)
  $request.Method = $Method
  $request.AllowAutoRedirect = $false
  $request.Timeout = 15000
  $request.ReadWriteTimeout = 15000
  $request.UserAgent = "Oracle-Stage4-R5-CleanHost-Journey"
  foreach ($name in $Headers.Keys) {
    if ($name -ceq "Content-Type") { $request.ContentType = [string]$Headers[$name] }
    elseif ($name -ceq "Authorization") { $request.Headers[[Net.HttpRequestHeader]::Authorization] = [string]$Headers[$name] }
    else { $request.Headers[[string]$name] = [string]$Headers[$name] }
  }
  if (-not [string]::IsNullOrEmpty($Cookie)) {
    $request.CookieContainer = [Net.CookieContainer]::new()
    $request.CookieContainer.SetCookies([Uri]$Uri, $Cookie)
  }
  if ($null -ne $Body) {
    $bytes = [Text.Encoding]::UTF8.GetBytes($Body)
    $request.ContentLength = $bytes.Length
    $stream = $request.GetRequestStream()
    try { $stream.Write($bytes, 0, $bytes.Length) } finally { $stream.Dispose() }
  }
  $response = $null
  try { $response = [Net.HttpWebResponse]$request.GetResponse() }
  catch [Net.WebException] {
    if ($null -eq $_.Exception.Response) { throw }
    $response = [Net.HttpWebResponse]$_.Exception.Response
  }
  try {
    $reader = [IO.StreamReader]::new($response.GetResponseStream())
    try { $text = $reader.ReadToEnd() } finally { $reader.Dispose() }
    [pscustomobject][ordered]@{ status = [int]$response.StatusCode; location = [string]$response.Headers["Location"]; body = $text }
  } finally { $response.Dispose() }
}

function ConvertFrom-OracleStage4R5JsonResponse {
  param([Parameter(Mandatory = $true)]$Response, [Parameter(Mandatory = $true)][string]$Context)
  if ([string]::IsNullOrWhiteSpace([string]$Response.body)) { throw "$Context returned an empty JSON body." }
  try { $Response.body | ConvertFrom-Json -ErrorAction Stop }
  catch { throw "$Context returned malformed JSON." }
}

function New-OracleStage4R5SessionCookie {
  param([Parameter(Mandatory = $true)]$Session)
  $json = $Session | ConvertTo-Json -Depth 20 -Compress
  $value = "base64-$(ConvertTo-OracleStage4R5Base64Url $json)"
  if ($value.Length -gt 3000) { throw "Session cookie unexpectedly requires chunking." }
  "sb-127-auth-token=$value"
}

function Wait-OracleStage4R5Confirmation {
  param([Parameter(Mandatory = $true)][string]$Email)
  $deadline = [DateTime]::UtcNow.AddSeconds(30)
  do {
    $query = [Uri]::EscapeDataString("to:$Email")
    $search = Invoke-OracleStage4R5Http -Uri "$MailpitUrl/api/v1/search?query=$query"
    if ($search.status -eq 200) {
      $payload = ConvertFrom-OracleStage4R5JsonResponse $search "Mailpit search"
      $messagesProperty = $payload.PSObject.Properties["messages"]
      if ($null -eq $messagesProperty) { $messagesProperty = $payload.PSObject.Properties["Messages"] }
      foreach ($message in @($(if ($null -eq $messagesProperty) { @() } else { $messagesProperty.Value }))) {
        $id = $null
        foreach ($name in @("ID", "Id", "id")) { if ($null -ne $message.PSObject.Properties[$name]) { $id = [string]$message.$name; break } }
        if ([string]::IsNullOrWhiteSpace($id)) { continue }
        $detail = Invoke-OracleStage4R5Http -Uri "$MailpitUrl/api/v1/message/$([Uri]::EscapeDataString($id))"
        if ($detail.status -ne 200) { continue }
        $match = [regex]::Match($detail.body.Replace('\/', '/'), 'https?://[^"''<>\s]+/auth/v1/verify[^"''<>\s]+')
        if ($match.Success) { return [string]$match.Value }
      }
    }
    Start-Sleep -Milliseconds 250
  } while ([DateTime]::UtcNow -lt $deadline)
  throw "Local confirmation message was not captured."
}

function Write-OracleStage4R5CreateOnlyJson {
  param([Parameter(Mandatory = $true)][string]$Path, [Parameter(Mandatory = $true)]$Value)
  $parent = Split-Path -Parent ([IO.Path]::GetFullPath($Path))
  [IO.Directory]::CreateDirectory($parent) | Out-Null
  $bytes = [Text.UTF8Encoding]::new($false).GetBytes((($Value | ConvertTo-Json -Depth 20) + "`n"))
  $stream = [IO.File]::Open($Path, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
  try { $stream.Write($bytes, 0, $bytes.Length); $stream.Flush($true) } finally { $stream.Dispose() }
}

$service = ConvertFrom-OracleStage4R5SecureString $ServiceKey
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
$nonceBytes = New-Object byte[] 8
$random.GetBytes($nonceBytes)
$nonce = ([BitConverter]::ToString($nonceBytes)).Replace('-', '').ToLowerInvariant()
$passwordBytes = New-Object byte[] 16
$random.GetBytes($passwordBytes)
$password = "Oracle-R5-$([Convert]::ToBase64String($passwordBytes).Replace('/','A').Replace('+','B').TrimEnd('='))!Aa1"
$accounts = @("oracle-stage4-r5-a-$nonce@example.invalid", "oracle-stage4-r5-b-$nonce@example.invalid")
$sessions = [Collections.Generic.List[object]]::new()
$journeys = [Collections.Generic.List[object]]::new()
$knownSecrets = [Collections.Generic.List[string]]::new()
foreach ($value in @($AnonymousKey, $service, $password) + $accounts) { $knownSecrets.Add($value) }

try {
  $anonymous = Invoke-OracleStage4R5Http -Uri "$WebOrigin/companion"
  if ($anonymous.status -ne 307 -or $anonymous.location -cnotmatch '^/auth\?next=') { throw "Anonymous protected route was not rejected." }
  $journeys.Add([ordered]@{ id = "anonymous-protected-route-rejected"; result = "passed" })

  for ($index = 0; $index -lt $accounts.Count; $index++) {
    $email = $accounts[$index]
    $signupBody = @{ email = $email; password = $password; data = @{ display_name = "Stage 4 R5 Fixture" } } | ConvertTo-Json -Depth 5 -Compress
    $signup = Invoke-OracleStage4R5Http -Uri "$ProviderUrl/auth/v1/signup" -Method POST -Headers @{ apikey = $AnonymousKey; Authorization = "Bearer $AnonymousKey"; "Content-Type" = "application/json" } -Body $signupBody
    if ($signup.status -notin @(200, 201)) { throw "Account signup failed with status $($signup.status)." }
    $signupJson = ConvertFrom-OracleStage4R5JsonResponse $signup "Account signup"
    $signupAccessToken = if ($null -eq $signupJson.PSObject.Properties["access_token"]) { $null } else { [string]$signupJson.access_token }`r`n    if ($null -eq $signupJson.user -or -not [string]::IsNullOrEmpty($signupAccessToken)) { throw "Account creation did not preserve the unverified no-session boundary." }
    if ($index -eq 0) { $journeys.Add([ordered]@{ id = "account-created-without-session"; result = "passed" }) }

    $tokenBody = @{ email = $email; password = $password } | ConvertTo-Json -Compress
    $unverified = Invoke-OracleStage4R5Http -Uri "$ProviderUrl/auth/v1/token?grant_type=password" -Method POST -Headers @{ apikey = $AnonymousKey; Authorization = "Bearer $AnonymousKey"; "Content-Type" = "application/json" } -Body $tokenBody
    if ($unverified.status -lt 400) { throw "Unverified account received a session." }
    if ($index -eq 0) { $journeys.Add([ordered]@{ id = "unverified-account-rejected"; result = "passed" }) }

    $verificationUrl = Wait-OracleStage4R5Confirmation -Email $email
    if ($index -eq 0) { $journeys.Add([ordered]@{ id = "confirmation-mail-captured-locally"; result = "passed" }) }
    $verified = Invoke-OracleStage4R5Http -Uri $verificationUrl
    if ($verified.status -lt 300 -or $verified.status -ge 400) { throw "Email verification did not redirect." }

    $signIn = Invoke-OracleStage4R5Http -Uri "$ProviderUrl/auth/v1/token?grant_type=password" -Method POST -Headers @{ apikey = $AnonymousKey; Authorization = "Bearer $AnonymousKey"; "Content-Type" = "application/json" } -Body $tokenBody
    if ($signIn.status -ne 200) { throw "Verified sign-in failed with status $($signIn.status)." }
    $session = ConvertFrom-OracleStage4R5JsonResponse $signIn "Verified sign-in"
    if ([string]::IsNullOrWhiteSpace([string]$session.access_token) -or $null -eq $session.user -or [string]::IsNullOrWhiteSpace([string]$session.user.email_confirmed_at)) { throw "Verified session is incomplete." }
    $knownSecrets.Add([string]$session.access_token)
    $knownSecrets.Add([string]$session.refresh_token)
    $accountId = [string]$session.user.id
    $command = @{ p_account_id = $accountId; p_command = @{ contract = @{ name = "oracle.operator-provisioning-command"; version = 1 }; commandId = [Guid]::NewGuid().ToString(); callsign = "R5$index$($nonce.Substring(0, 6))"; policyId = "stage4-r5-clean-host"; policyVersion = "1" } } | ConvertTo-Json -Depth 8 -Compress
    $provision = Invoke-OracleStage4R5Http -Uri "$ProviderUrl/rest/v1/rpc/provision_operator_for_account" -Method POST -Headers @{ apikey = $service; Authorization = "Bearer $service"; "Content-Type" = "application/json" } -Body $command
    if ($provision.status -ne 200) { throw "Operator provisioning failed with status $($provision.status)." }
    $sessions.Add([pscustomobject][ordered]@{ accountId = $accountId; accessToken = [string]$session.access_token; cookie = New-OracleStage4R5SessionCookie $session })
  }

  if ($sessions[0].accountId -ceq $sessions[1].accountId) { throw "Distinct principals were not established." }
  $journeys.Add([ordered]@{ id = "email-verified"; result = "passed" })
  $journeys.Add([ordered]@{ id = "verified-password-sign-in-passed"; result = "passed" })

  $protected = Invoke-OracleStage4R5Http -Uri "$WebOrigin/companion" -Cookie $sessions[0].cookie
  if ($protected.status -ne 200 -or $protected.body -notmatch '<main|oracle-main-content') { throw "Authenticated installed protected rendering failed." }
  $journeys.Add([ordered]@{ id = "protected-route-rendered"; result = "passed" })

  $api = Invoke-OracleStage4R5Http -Uri "$WebOrigin/api/oracle/conversation" -Method POST -Headers @{ "Content-Type" = "application/json" } -Cookie $sessions[0].cookie -Body (@{ requestId = "stage4-r5-$nonce"; text = "qualification probe" } | ConvertTo-Json -Compress)
  if ($api.status -ne 503) { throw "Authenticated API did not reach its governed inactive-runtime boundary." }
  $journeys.Add([ordered]@{ id = "protected-api-authorised"; result = "passed" })

  $bindings = [Collections.Generic.List[object]]::new()
  foreach ($session in $sessions) {
    $user = Invoke-OracleStage4R5Http -Uri "$ProviderUrl/auth/v1/user" -Headers @{ apikey = $AnonymousKey; Authorization = "Bearer $($session.accessToken)" }
    if ($user.status -ne 200) { throw "Authenticated user lookup failed." }
    $binding = Invoke-OracleStage4R5Http -Uri "$ProviderUrl/rest/v1/operator_account_bindings?select=account_id,operator_id" -Headers @{ apikey = $AnonymousKey; Authorization = "Bearer $($session.accessToken)" }
    if ($binding.status -ne 200) { throw "RLS binding lookup failed." }
    $rows = @(ConvertFrom-OracleStage4R5JsonResponse $binding "RLS binding lookup")
    if ($rows.Count -ne 1 -or [string]$rows[0].account_id -cne [string]$session.accountId) { throw "RLS did not return exactly one own Account binding." }
    $bindings.Add($rows[0])
  }
  if ([string]$bindings[0].operator_id -ceq [string]$bindings[1].operator_id) { throw "Distinct Operators were not established." }
  $journeys.Add([ordered]@{ id = "cross-account-isolation-passed"; result = "passed" })

  $logout = Invoke-OracleStage4R5Http -Uri "$ProviderUrl/auth/v1/logout?scope=global" -Method POST -Headers @{ apikey = $AnonymousKey; Authorization = "Bearer $($sessions[0].accessToken)"; "Content-Type" = "application/json" } -Body "{}"
  if ($logout.status -notin @(200, 204)) { throw "Global sign-out failed." }
  $invalidated = Invoke-OracleStage4R5Http -Uri "$ProviderUrl/auth/v1/user" -Headers @{ apikey = $AnonymousKey; Authorization = "Bearer $($sessions[0].accessToken)" }
  if ($invalidated.status -lt 400) { throw "Signed-out access token remained valid." }
  $signedOut = Invoke-OracleStage4R5Http -Uri "$WebOrigin/companion" -Cookie $sessions[0].cookie
  if ($signedOut.status -ne 307) { throw "Signed-out installed route remained authenticated." }
  $journeys.Add([ordered]@{ id = "sign-out-invalidates-session"; result = "passed" })

  $record = [ordered]@{
    contract = if ($DevelopmentRehearsal) { "oracle.sprint-30-5.stage-4-r5-development-rehearsal" } else { "oracle.sprint-30-5.stage-4-r5-journey" }
    result = "passed"
    classification = if ($DevelopmentRehearsal) { @("NON-QUALIFICATION", "NON-AUTHORITY", "NON-EVIDENCE", "DEVELOPMENT REHEARSAL") } else { "GOVERNED-STAGE-4-R5-QUALIFICATION" }
    collectedAtUtc = [DateTime]::UtcNow.ToString("o")
    provider = [ordered]@{ classification = "disposable-local-non-production"; implementation = "accepted-r4-supabase-stack-on-engineering-provider-host"; productionEndpoint = $false; externalEmail = $false; splitHost = $true }
    journeys = @($journeys)
    rendering = [ordered]@{ mainLandmarks = @([regex]::Matches($protected.body, '<main')).Count; levelOneHeadings = @([regex]::Matches($protected.body, '<h1')).Count; protectedStatus = $protected.status; method = "authenticated-installed-package-server-render" }
    isolation = [ordered]@{ accountCount = 2; crossAccountLeaks = 0; distinctAuthenticatedPrincipals = $true; distinctOperators = $true; rlsBindingsPerPrincipal = @(1, 1) }
    secretsRetained = $false
  }
  [void](Assert-OracleStage4R5JourneyRecord -Record ([pscustomobject]$record) -DevelopmentRehearsal:$DevelopmentRehearsal)
  $serialized = $record | ConvertTo-Json -Depth 20
  Assert-OracleStage4R5SecretFreeText -Text $serialized -KnownSecrets @($knownSecrets)
  Write-OracleStage4R5CreateOnlyJson -Path $OutputPath -Value $record
  [pscustomobject]@{ result = "passed"; journeyCount = $journeys.Count; outputPath = [IO.Path]::GetFullPath($OutputPath) } | ConvertTo-Json
} finally {
  $service = $null
  $password = $null
  $accounts = @()
  $sessions.Clear()
  $knownSecrets.Clear()
  $random.Dispose()
}
