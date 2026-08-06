Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Security -ErrorAction Stop

function Write-OracleStage2R8CreateOnlyJson {
  param([Parameter(Mandatory = $true)][string]$Path, [Parameter(Mandatory = $true)]$Value)
  $bytes = [Text.UTF8Encoding]::new($false).GetBytes(($Value | ConvertTo-Json -Depth 30) + [Environment]::NewLine)
  $stream = [IO.File]::Open($Path, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
  try { $stream.Write($bytes, 0, $bytes.Length); $stream.Flush($true) } finally { $stream.Dispose() }
}

function Get-OracleStage2R8Sha256 {
  param([Parameter(Mandatory = $true)][string]$Path)
  (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Assert-OracleStage2R8NoReparseTraversal {
  param([Parameter(Mandatory = $true)][string]$Path, [Parameter(Mandatory = $true)][string]$Root)
  $resolved = [IO.Path]::GetFullPath($Path)
  $boundary = [IO.Path]::GetFullPath($Root).TrimEnd('\')
  if ($resolved -cne $boundary -and -not $resolved.StartsWith($boundary + '\', [StringComparison]::OrdinalIgnoreCase)) { throw "Path escapes the governed root." }
  $current = $resolved
  while ($current.Length -ge $boundary.Length) {
    if (Test-Path -LiteralPath $current) {
      $item = Get-Item -LiteralPath $current -Force
      if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw "Reparse traversal is prohibited: $current" }
    }
    if ($current -ceq $boundary) { break }
    $current = [IO.Path]::GetDirectoryName($current)
  }
  $resolved
}

function Get-OracleStage2R8PayloadInventory {
  param([Parameter(Mandatory = $true)][string]$PayloadRoot)
  $root = [IO.Path]::GetFullPath($PayloadRoot).TrimEnd('\')
  @(
    Get-ChildItem -LiteralPath $root -Recurse -File -Force |
      Sort-Object FullName |
      ForEach-Object {
        [void](Assert-OracleStage2R8NoReparseTraversal -Path $_.FullName -Root $root)
        [pscustomobject][ordered]@{
          path = $_.FullName.Substring($root.Length).TrimStart('\').Replace('\', '/')
          bytes = [int64]$_.Length
          sha256 = Get-OracleStage2R8Sha256 -Path $_.FullName
        }
      }
  )
}

function Assert-OracleStage2R8PayloadInventory {
  param(
    [Parameter(Mandatory = $true)][object[]]$Actual,
    [Parameter(Mandatory = $true)][object[]]$Expected
  )
  if ($Actual.Count -ne $Expected.Count) { throw "Transfer payload count differs." }
  $actualByPath = [Collections.Generic.Dictionary[string,object]]::new([StringComparer]::Ordinal)
  foreach ($item in $Actual) {
    $itemPath = [string]$item.path
    if ($actualByPath.ContainsKey($itemPath)) { throw "Transfer payload contains a duplicate exact path." }
    $actualByPath.Add($itemPath,$item)
  }
  $expectedPaths = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
  foreach ($item in $Expected) {
    $itemPath = [string]$item.path
    if (-not $expectedPaths.Add($itemPath)) { throw "Transfer manifest contains a duplicate exact path." }
    if (-not $actualByPath.ContainsKey($itemPath)) { throw "Transfer payload path differs." }
    $actualItem = $actualByPath[$itemPath]
    if ([int64]$actualItem.bytes -ne [int64]$item.bytes -or [string]$actualItem.sha256 -cne [string]$item.sha256) { throw "Transfer payload inventory differs." }
  }
}
function Assert-OracleStage2R8Transfer {
  param(
    [Parameter(Mandatory = $true)][string]$TransferRoot,
    [Parameter(Mandatory = $true)][string]$ExpectedManifestSha256,
    [Parameter(Mandatory = $true)][string]$ExpectedCustodySha256,
    [Parameter(Mandatory = $true)][string]$ExpectedVerificationSha256
  )
  $root = [IO.Path]::GetFullPath($TransferRoot)
  [void](Assert-OracleStage2R8NoReparseTraversal -Path $root -Root $root)
  foreach ($name in @('Oracle.Stage2R8TransferManifest.json','Oracle.Stage2R8TransferCustody.json','Oracle.Stage2R8TransferVerification.json')) {
    $file = Join-Path $root $name
    [void](Assert-OracleStage2R8NoReparseTraversal -Path $file -Root $root)
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Transfer record is absent: $name" }
  }
  $manifestPath = Join-Path $root 'Oracle.Stage2R8TransferManifest.json'
  $custodyPath = Join-Path $root 'Oracle.Stage2R8TransferCustody.json'
  $verificationPath = Join-Path $root 'Oracle.Stage2R8TransferVerification.json'
  if ((Get-OracleStage2R8Sha256 $manifestPath) -cne $ExpectedManifestSha256.ToLowerInvariant()) { throw "Transfer manifest hash differs." }
  if ((Get-OracleStage2R8Sha256 $custodyPath) -cne $ExpectedCustodySha256.ToLowerInvariant()) { throw "Transfer custody hash differs." }
  if ((Get-OracleStage2R8Sha256 $verificationPath) -cne $ExpectedVerificationSha256.ToLowerInvariant()) { throw "Transfer verification hash differs." }
  $manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
  $custody = Get-Content -Raw -LiteralPath $custodyPath | ConvertFrom-Json
  $verification = Get-Content -Raw -LiteralPath $verificationPath | ConvertFrom-Json
  if ([string]$manifest.contract -cne 'oracle.sprint-30-5.stage-2-r8-transfer-manifest' -or -not [bool]$manifest.founderAuthorisedQualificationExecution -or -not [bool]$manifest.singleAttemptOnly) { throw "Transfer authority contract differs." }
  if ([int]$manifest.maximumAuthorities -ne 1 -or [int]$manifest.maximumAttempts -ne 1) { throw "Transfer single-use limits differ." }
  if ([string]$custody.transferId -cne [string]$manifest.transferId -or [string]$custody.founderGrantId -cne [string]$manifest.founderGrantId -or [string]$custody.manifestSha256 -cne (Get-OracleStage2R8Sha256 $manifestPath) -or -not [bool]$custody.createOnly -or -not [bool]$custody.independentVerificationRequired) { throw "Transfer custody differs." }
  if ([string]$verification.result -cne 'passed' -or [string]$verification.transferId -cne [string]$manifest.transferId -or [string]$verification.founderGrantId -cne [string]$manifest.founderGrantId -or [string]$verification.manifestSha256 -cne (Get-OracleStage2R8Sha256 $manifestPath) -or [string]$verification.custodySha256 -cne (Get-OracleStage2R8Sha256 $custodyPath) -or [bool]$verification.authorityCreated -or [bool]$verification.attemptCreated) { throw "Independent transfer verification differs." }
  foreach ($lineageField in @('replacesTransferId','preservesOriginalTransferId')) {
    $manifestHasLineage = $manifest.PSObject.Properties.Name -ccontains $lineageField
    $custodyHasLineage = $custody.PSObject.Properties.Name -ccontains $lineageField
    $verificationHasLineage = $verification.PSObject.Properties.Name -ccontains $lineageField
    if ($manifestHasLineage -ne $custodyHasLineage -or $manifestHasLineage -ne $verificationHasLineage) { throw "Transfer lineage shape differs: $lineageField" }
    if ($manifestHasLineage) {
      $manifestLineage = [string]$manifest.PSObject.Properties[$lineageField].Value
      $custodyLineage = [string]$custody.PSObject.Properties[$lineageField].Value
      $verificationLineage = [string]$verification.PSObject.Properties[$lineageField].Value
      if ($custodyLineage -cne $manifestLineage -or $verificationLineage -cne $manifestLineage) { throw "Transfer lineage differs: $lineageField" }
    }
  }
  $payloadRoot = Join-Path $root 'payload'
  [void](Assert-OracleStage2R8NoReparseTraversal -Path $payloadRoot -Root $root)
  $actual = @(Get-OracleStage2R8PayloadInventory -PayloadRoot $payloadRoot)
  $expected = @($manifest.files)

  Assert-OracleStage2R8PayloadInventory -Actual $actual -Expected $expected

  $executionContractPath = Join-Path $payloadRoot 'harness\Oracle.Stage2RequalificationR8Contract.json'
  if ((Get-OracleStage2R8Sha256 $executionContractPath) -cne [string]$manifest.executionContractSha256 -or [string]$verification.executionContractSha256 -cne [string]$manifest.executionContractSha256) { throw "Execution contract binding differs." }
  [pscustomobject][ordered]@{ transferId=[string]$manifest.transferId; payloadRoot=$payloadRoot; manifest=$manifest; independentlyVerified=$true }
}

function Test-OracleStage2R8HostIdentity {
  param(
    [Parameter(Mandatory = $true)][string]$Actual,
    [Parameter(Mandatory = $true)][string]$Expected
  )
  [String]::Equals($Actual,$Expected,[StringComparison]::OrdinalIgnoreCase)
}
function Get-OracleStage2R8HostAdmission {
  param([Parameter(Mandatory = $true)]$Contract)
  $computer = [string]$env:COMPUTERNAME
  if (-not (Test-OracleStage2R8HostIdentity -Actual $computer -Expected ([string]$Contract.qualificationHost.identity))) { throw "Qualification host identity differs." }
  if (Test-Path -LiteralPath 'C:\Dev\project-meta') { throw "Development repository is prohibited on the qualification host." }
  $presentTools = @()
  foreach ($tool in @($Contract.qualificationHost.prohibitedDependencies)) {
    if ($null -ne (Get-Command ($tool + '.exe') -ErrorAction SilentlyContinue)) { $presentTools += [string]$tool }
  }
  if ($presentTools.Count -ne 0) { throw "Development tooling is prohibited on the qualification host: $($presentTools -join ', ')" }
  $os = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
  $packages = @(Get-AppxPackage -Name ([string]$Contract.package.identity) -ErrorAction SilentlyContinue)
  $subject = [string]$Contract.package.publisherSubjectPrefix
  $certificates = @(
    Get-ChildItem -LiteralPath 'Cert:\CurrentUser\Root','Cert:\CurrentUser\My' -ErrorAction Stop |
      Where-Object { $_.Subject -ceq $subject }
  )
  if ($packages.Count -ne 0 -or $certificates.Count -ne 0) { throw "Pre-authority package or certificate state is not zero." }
  [pscustomobject][ordered]@{
    result='passed'
    computerName=$computer
    operatingSystem=[string]$os.Caption
    version=[string]$os.Version
    architecture=[string]$env:PROCESSOR_ARCHITECTURE
    repositoryPresent=$false
    developmentToolsPresent=@()
    packagesPresent=0
    certificatesPresent=0
    admittedAtUtc=[DateTime]::UtcNow.ToString('o')
  }
}

function New-OracleStage2R8AuthorityIdentity {
  $bytes = [byte[]]::new(4)
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  if (($bytes | Where-Object { $_ -ne 0 }).Count -eq 0) { throw "All-zero authority entropy is prohibited." }
  $suffix = ([BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
  $stamp = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ')
  [pscustomobject][ordered]@{ authorityId="authority-stage2-r8-$stamp-$suffix"; attemptId="stage2-r8-$stamp-$suffix"; timestampUtc=[DateTime]::UtcNow.ToString('o') }
}

function Test-OracleStage2R8FileContainsCanary {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string[]]$Values
  )
  $encoding = [Text.Encoding]::GetEncoding(28591)
  $needles = @(
    foreach ($value in $Values) {
      $encoding.GetString([Text.Encoding]::UTF8.GetBytes($value))
      $encoding.GetString([Text.Encoding]::Unicode.GetBytes($value))
    }
  )
  $maximumNeedleBytes = ($needles | ForEach-Object { $_.Length } | Measure-Object -Maximum).Maximum
  $overlap = [Math]::Max(0, [int]$maximumNeedleBytes - 1)
  $chunkBytes = 1MB
  $buffer = [byte[]]::new($chunkBytes + $overlap)
  $stream = [IO.File]::Open($Path, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
  try {
    $carried = 0
    while ($true) {
      $read = $stream.Read($buffer, $carried, $chunkBytes)
      $available = $carried + $read
      if ($available -eq 0) { break }
      $haystack = $encoding.GetString($buffer, 0, $available)
      foreach ($needle in $needles) {
        if ($haystack.IndexOf($needle, [StringComparison]::Ordinal) -ge 0) { return $true }
      }
      if ($read -eq 0) { break }
      $carried = [Math]::Min($overlap, $available)
      if ($carried -gt 0) {
        [Buffer]::BlockCopy($buffer, $available - $carried, $buffer, 0, $carried)
      }
    }
    $false
  } finally {
    $stream.Dispose()
  }
}


function Invoke-OracleStage2R8CandidateVerification {
  param([Parameter(Mandatory = $true)]$Contract, [Parameter(Mandatory = $true)][string]$PayloadRoot, [Parameter(Mandatory = $true)][string]$WorkRoot)
  $release = Join-Path $PayloadRoot 'release'
  $packagePath = Join-Path $release ([string]$Contract.package.fileName)
  $certificatePath = Join-Path $release ([string]$Contract.package.publicCertificateFileName)
  foreach ($path in @($packagePath,$certificatePath)) { if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Frozen candidate file is absent: $path" } }
  $certificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new($certificatePath)
  if ($certificate.Subject -cne [string]$Contract.package.publisherSubjectPrefix) { throw "Public certificate subject differs." }
  $thumbprint = $certificate.Thumbprint.ToUpperInvariant()
  $preTrust = Get-AuthenticodeSignature -LiteralPath $packagePath
  if ([string]$preTrust.Status -ceq 'Valid') { throw "Transferred package was unexpectedly trusted before the attempt." }
  $trustPath = "Cert:\CurrentUser\Root\$thumbprint"
  $trusted = $false
  try {
    $imported = Import-Certificate -FilePath $certificatePath -CertStoreLocation 'Cert:\CurrentUser\Root' -ErrorAction Stop
    $trusted = $true
    if ($imported.Thumbprint.ToUpperInvariant() -cne $thumbprint) { throw "Imported trust identity differs." }
    $signature = Get-AuthenticodeSignature -LiteralPath $packagePath
    if ([string]$signature.Status -cne 'Valid' -or $signature.SignerCertificate.Thumbprint.ToUpperInvariant() -cne $thumbprint) { throw "MSIX Authenticode verification failed." }
    $manifestPath = Join-Path $release 'oracle-release-manifest.json'
    $signaturePath = Join-Path $release 'oracle-release-manifest.json.p7s'
    $content = [IO.File]::ReadAllBytes($manifestPath)
    $cms = [Security.Cryptography.Pkcs.SignedCms]::new([Security.Cryptography.Pkcs.ContentInfo]::new($content), $true)
    $cms.Decode([IO.File]::ReadAllBytes($signaturePath))
    $cms.CheckSignature($true)
    if ($cms.SignerInfos.Count -ne 1 -or $cms.SignerInfos[0].Certificate.Thumbprint.ToUpperInvariant() -cne $thumbprint) { throw "Detached release-manifest signer differs." }
    $zipPath = Join-Path $WorkRoot 'candidate.zip'
    [IO.File]::Copy($packagePath,$zipPath,$false)
    $unpacked = Join-Path $WorkRoot 'unpacked'
    Expand-Archive -LiteralPath $zipPath -DestinationPath $unpacked -Force
    $appx = [xml](Get-Content -Raw -LiteralPath (Join-Path $unpacked 'AppxManifest.xml'))
    if ([string]$appx.Package.Identity.Version -cne [string]$Contract.package.version -or [string]$appx.Package.Identity.Publisher -cne [string]$Contract.package.publisherSubjectPrefix) { throw "Unpacked package identity differs." }
    $canaries = @('r8-build-canary.invalid','oracle-r8-anon-canary-not-a-secret','oracle-r8-service-canary-not-a-secret','oracle-r8-session-canary-not-a-secret-32-bytes')
    foreach ($file in Get-ChildItem -LiteralPath $unpacked -Recurse -File -Force) {
      if (Test-OracleStage2R8FileContainsCanary -Path $file.FullName -Values $canaries) { throw "Runtime-configuration canary leaked into the package." }
    }
    [pscustomobject][ordered]@{ result='passed'; packageSha256=(Get-OracleStage2R8Sha256 $packagePath); certificateSha256=(Get-OracleStage2R8Sha256 $certificatePath); certificateThumbprint=$thumbprint; authenticode='Valid'; detachedManifestSignature='Valid'; packageVersion=[string]$appx.Package.Identity.Version; runtimeCanariesFound=0 }
  } finally {
    if ($trusted -and (Test-Path -LiteralPath $trustPath)) { Remove-Item -LiteralPath $trustPath -Force -ErrorAction Stop }
    if (Test-Path -LiteralPath $trustPath) { throw "Exact temporary trust remains after verification." }
  }
}
