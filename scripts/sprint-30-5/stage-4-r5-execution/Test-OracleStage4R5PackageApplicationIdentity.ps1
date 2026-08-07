[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R5ExecutionContract.json')|ConvertFrom-Json
$repository=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))
$freeze=[IO.Path]::GetFullPath((Join-Path $repository ([string]$contract.paths.engineeringFreezeRoot)))
$packagePath=Join-Path $freeze ('release\'+[string]$contract.package.fileName)
if(-not(Test-Path -LiteralPath $packagePath -PathType Leaf)){throw 'Accepted R8 package is absent.'}
if((Get-FileHash -LiteralPath $packagePath -Algorithm SHA256).Hash.ToLowerInvariant()-cne[string]$contract.package.sha256){throw 'Accepted R8 package hash differs.'}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive=[IO.Compression.ZipFile]::OpenRead($packagePath)
try{
  $entries=@($archive.Entries|Where-Object{[string]$_.FullName-ceq'AppxManifest.xml'})
  if($entries.Count-ne1){throw 'Accepted R8 package manifest inventory differs.'}
  $reader=[IO.StreamReader]::new($entries[0].Open(),[Text.Encoding]::UTF8,$true)
  try{[xml]$manifest=$reader.ReadToEnd()}finally{$reader.Dispose()}
}finally{$archive.Dispose()}
$namespace=[Xml.XmlNamespaceManager]::new($manifest.NameTable);$namespace.AddNamespace('f','http://schemas.microsoft.com/appx/manifest/foundation/windows10')
$applications=@($manifest.SelectNodes('/f:Package/f:Applications/f:Application',$namespace))
if($applications.Count-ne1){throw 'Accepted R8 application inventory differs.'}
$application=$applications[0]
if(
  [string]$application.Id-cne[string]$contract.package.appId-or
  [string]$application.Executable-cne'Oracle.exe'-or
  [string]$application.EntryPoint-cne'Windows.FullTrustApplication'
){throw 'R5 application activation identity differs from the accepted R8 package manifest.'}
$aumid="$([string]$contract.package.familyName)!$([string]$contract.package.appId)"
if($aumid-cne'Oracle.Platform.LocalCertification_2hnkknkjbzac2!Oracle'){throw 'R5 AppUserModelId differs from the accepted R8 identity.'}
$acceptedActivationPath=Join-Path $repository 'docs\sprints\evidence\sprint-30-5\stage-3-r13\Oracle.Stage3R13Evidence\stage3-r13-20260806T162253957Z-b0cb2a17\evidence\initial-activation.json'
$acceptedActivation=Get-Content -Raw -LiteralPath $acceptedActivationPath|ConvertFrom-Json
if([string]$acceptedActivation.appUserModelId-cne$aumid-or[string]$acceptedActivation.hresult-cne'0x00000000'-or[uint32]$acceptedActivation.processId-eq0-or$null-ne$acceptedActivation.error){throw 'R5 AppUserModelId differs from accepted R13 activation evidence.'}
$installed=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Invoke-OracleStage4R5InstalledPackageJourney.ps1')
if(-not$installed.Contains('$appUserModelId = "$packageFamilyName!$([string]$contract.package.appId)"')){throw 'Installed controller does not bind activation to the verified contract app ID.'}

[pscustomobject][ordered]@{
  result='passed'
  classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','PACKAGE APPLICATION IDENTITY TEST')
  packageSha256=[string]$contract.package.sha256
  manifestApplicationId=[string]$application.Id
  appUserModelId=$aumid
  executable=[string]$application.Executable
  entryPoint=[string]$application.EntryPoint
  acceptedR13ActivationMatched=$true
  transferCreated=$false
  authorityCreated=$false
  attemptCreated=$false
}|ConvertTo-Json -Depth 5
