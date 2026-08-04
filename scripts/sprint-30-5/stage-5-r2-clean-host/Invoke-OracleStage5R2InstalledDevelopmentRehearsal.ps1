[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$ResultPath)
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"
$scriptRoot=$PSScriptRoot
$repository=[IO.Path]::GetFullPath((Join-Path $scriptRoot "..\..\.."))
$contract=Get-Content -Raw -LiteralPath (Join-Path $scriptRoot "Oracle.Stage5R2CleanHostContract.json")|ConvertFrom-Json
. (Join-Path $scriptRoot "Oracle.Stage5R2ActivationPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage5R2InstalledRuntimeConfigurationPolicy.ps1")
. (Join-Path $scriptRoot "Oracle.Stage5R2ProcessTeardownPolicy.ps1")
$result=[IO.Path]::GetFullPath($ResultPath)
$approved=[IO.Path]::GetFullPath((Join-Path $repository ".artifacts\sprint-30-5\stage-5-r2-development-rehearsal")).TrimEnd('\')+'\'
if(-not$result.StartsWith($approved,[StringComparison]::OrdinalIgnoreCase)){throw "Development result escapes its non-evidence root."}
if(Test-Path -LiteralPath $result){throw "Development result is create-only."}
$work="$result.work";if(Test-Path -LiteralPath $work){throw "Development work root is create-only."};[IO.Directory]::CreateDirectory($work)|Out-Null
$fixture=$null;$package=$null;$installLocation=$null;$configurationPath=$null;$configurationHash=$null;$trust=$false;$primary=$null;$cleanup=[Collections.Generic.List[string]]::new()

function Write-CreateOnlyJson([string]$Path,$Value){$bytes=[Text.UTF8Encoding]::new($false).GetBytes((($Value|ConvertTo-Json -Depth 20)+"`n"));$stream=[IO.File]::Open($Path,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);try{$stream.Write($bytes,0,$bytes.Length);$stream.Flush($true)}finally{$stream.Dispose()}}
function Get-OraclePackages{@(Get-AppxPackage -Name ([string]$contract.package.identity) -ErrorAction SilentlyContinue)}
function Get-Snapshot{@(Get-CimInstance Win32_Process -ErrorAction Stop)}
function Test-Owned($Process){if([string]::IsNullOrWhiteSpace([string]$Process.ExecutablePath)){return $false};[IO.Path]::GetFullPath([string]$Process.ExecutablePath).StartsWith([IO.Path]::GetFullPath($installLocation).TrimEnd('\')+'\',[StringComparison]::OrdinalIgnoreCase)}
function Get-Descendants([uint32]$Root,$Snapshot){$ids=[Collections.Generic.HashSet[uint32]]::new();[void]$ids.Add($Root);do{$changed=$false;foreach($p in $Snapshot){if(-not$ids.Contains([uint32]$p.ProcessId)-and$ids.Contains([uint32]$p.ParentProcessId)){[void]$ids.Add([uint32]$p.ProcessId);$changed=$true}}}while($changed);@($ids)}
function Find-WebOrigin([uint32]$Root){$deadline=[DateTime]::UtcNow.AddSeconds(30);do{$snapshot=Get-Snapshot;$ids=@(Get-Descendants $Root $snapshot);foreach($id in $ids){$p=@($snapshot|Where-Object{[uint32]$_.ProcessId-eq$id});if($p.Count-ne1-or-not(Test-Owned $p[0])){throw "Installed process ownership changed during listener admission."}};$found=@();foreach($listener in @(Get-NetTCPConnection -State Listen -ErrorAction Stop|Where-Object{$_.LocalAddress-in@('127.0.0.1','::1')-and[uint32]$_.OwningProcess-in$ids})){$origin="http://127.0.0.1:$([int]$listener.LocalPort)";try{$r=Invoke-WebRequest -UseBasicParsing -Uri "$origin/auth" -MaximumRedirection 0 -TimeoutSec 2 -ErrorAction Stop;if([int]$r.StatusCode-eq200){$found+=$origin}}catch{}};$found=@($found|Sort-Object -Unique);if($found.Count-eq1){return $found[0]};if($found.Count-gt1){throw "Multiple package-owned HTTP listeners were admitted."};Start-Sleep -Milliseconds 200}while([DateTime]::UtcNow-lt$deadline);throw "Package-owned HTTP listener admission timed out."}
function Stop-OwnedProcesses{if([string]::IsNullOrWhiteSpace($installLocation)){return};$snapshot=Get-Snapshot;$owned=@($snapshot|Where-Object{Test-Owned $_}|Sort-Object ProcessId -Descending);foreach($observed in $owned){Invoke-OracleStage4R4OwnedProcessStop -ObservedProcess $observed -OwnershipValidator {param($p)if(-not(Test-Owned $p)){throw "Process ownership changed before teardown."}} -StopAction {param($id)Stop-Process -Id $id -Force -ErrorAction Stop} -CurrentLookup {param($id)@(Get-Snapshot|Where-Object{[int]$_.ProcessId-eq$id})}|Out-Null};$deadline=[DateTime]::UtcNow.AddSeconds(10);do{if(@(Get-Snapshot|Where-Object{Test-Owned $_}).Count-eq0){return};Start-Sleep -Milliseconds 100}while([DateTime]::UtcNow-lt$deadline);throw "Package-owned process residue remains."}

try{
  $principal=[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent());if(-not$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){throw "Installed clean-host development rehearsal requires elevation."}
  if([string]$contract.status-cne"engineering-preparation-qualification-barred"-or[bool]$contract.authorityBoundary.qualificationExecutionPermitted){throw "Clean-host preparation authority boundary differs."}
  if(@(Get-OraclePackages).Count-ne0){throw "Oracle package pre-state is not zero."};if(@(Get-ChildItem -LiteralPath "Cert:\LocalMachine\TrustedPeople"|Where-Object{$_.Thumbprint-ceq[string]$contract.package.certificateThumbprint}).Count-ne0){throw "Oracle certificate pre-state is not zero."}
  $msix=[IO.Path]::GetFullPath((Join-Path $repository ([string]$contract.package.artifactPath)));$certificate=[IO.Path]::GetFullPath((Join-Path $repository ([string]$contract.package.publicCertificatePath)))
  if((Get-FileHash -Algorithm SHA256 -LiteralPath $msix).Hash.ToLowerInvariant()-cne[string]$contract.package.sha256){throw "Accepted R6 MSIX differs."};if((Get-FileHash -Algorithm SHA256 -LiteralPath $certificate).Hash.ToLowerInvariant()-cne[string]$contract.package.publicCertificateSha256){throw "Accepted R6 certificate differs."}
  $fixturePath=Join-Path $scriptRoot ([string]$contract.cleanHostFixture.executable);if((Get-FileHash -Algorithm SHA256 -LiteralPath $fixturePath).Hash.ToLowerInvariant()-cne[string]$contract.cleanHostFixture.sha256){throw "Clean-host fixture identity differs."}
  $fixture=Start-Process -FilePath $fixturePath -ArgumentList @('--port',[string]$contract.cleanHostFixture.port) -PassThru -WindowStyle Hidden;$deadline=[DateTime]::UtcNow.AddSeconds(15);do{try{$health=Invoke-RestMethod -Uri "http://127.0.0.1:$($contract.cleanHostFixture.port)/health" -TimeoutSec 2;break}catch{Start-Sleep -Milliseconds 100}}while([DateTime]::UtcNow-lt$deadline);if([string]$health.result-cne'passed'){throw "Clean-host fixture admission failed."}
  $import=Import-Certificate -FilePath $certificate -CertStoreLocation ([string]$contract.package.trustStore) -ErrorAction Stop;$trust=$true;if($import.Thumbprint-cne[string]$contract.package.certificateThumbprint){throw "Imported trust identity differs."}
  Add-AppxPackage -Path $msix -ErrorAction Stop;$packages=@(Get-OraclePackages);if($packages.Count-ne1-or[string]$packages[0].PackageFullName-cne[string]$contract.package.fullName){throw "Installed R6 package identity differs."};$package=$packages[0];$installLocation=[string]$package.InstallLocation
  [void](Initialize-OracleInstalledRuntimePackageData -PackageIdentity ([string]$contract.package.identity) -PackageFamilyName ([string]$package.PackageFamilyName) -ExpectedPackageFamilyName ([string]$contract.package.familyName) -PackageFullName ([string]$package.PackageFullName) -ExpectedPackageFullName ([string]$contract.package.fullName) -LocalAppDataRoot $env:LOCALAPPDATA)
  $stamp=[DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ');$nonce=[Guid]::NewGuid().ToString('N').Substring(0,8);$attempt="stage5-r2-$stamp-$nonce";$configurationId="runtime-$attempt"
  $service=ConvertTo-SecureString 'oracle-stage5-clean-host-service-key-not-production' -AsPlainText -Force;$session=ConvertTo-SecureString 'oracle-stage5-clean-host-session-secret-not-production' -AsPlainText -Force
  $configuration=New-OracleInstalledRuntimeConfiguration -PackageFamilyName ([string]$package.PackageFamilyName) -ExpectedPackageFamilyName ([string]$contract.package.familyName) -ConfigurationId $configurationId -FounderGrantId ($attempt-replace'^(stage5-r2)-','founder-$1-grant-') -AuthorityId "authority-$attempt" -AttemptId $attempt -CandidateCommit ([string]$contract.package.candidateCommit) -CandidateTree ([string]$contract.package.candidateTree) -MsixSha256 ([string]$contract.package.sha256) -ExpectedCandidateCommit ([string]$contract.package.candidateCommit) -ExpectedCandidateTree ([string]$contract.package.candidateTree) -ExpectedMsixSha256 ([string]$contract.package.sha256) -ProviderUrl "http://127.0.0.1:$($contract.cleanHostFixture.port)" -ProviderAnonKey ([string]$contract.cleanHostFixture.anonymousKey) -ProviderServiceKey $service -SessionSecret $session -LocalAppDataRoot $env:LOCALAPPDATA
  $configurationPath=[string]$configuration.configurationPath;$configurationHash=[string]$configuration.sha256;$arguments=Get-OracleInstalledRuntimeActivationArguments -ConfigurationPath $configurationPath -Sha256 $configurationHash;$activation=Invoke-OracleStage4R4ApplicationActivation -AppUserModelId "$($package.PackageFamilyName)!$($contract.package.appId)" -Arguments $arguments;Assert-OracleStage4R4ApplicationActivationSucceeded $activation
  $origin=Find-WebOrigin ([uint32]$activation.processId);if(Test-Path -LiteralPath $configurationPath){throw "Runtime configuration was not consumed."}
  $edge=@("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe","$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe")|Where-Object{Test-Path -LiteralPath $_ -PathType Leaf}|Select-Object -First 1;if([string]::IsNullOrWhiteSpace([string]$edge)){throw "Microsoft Edge is absent."}
  & (Join-Path $scriptRoot "Invoke-OracleStage5R2EdgeSemanticProbe.ps1") -EdgePath $edge -WebOrigin "$origin/" -OutputPath (Join-Path $work 'semantic.json')
  & (Join-Path $scriptRoot "Measure-OracleStage5R2InstalledPackage.ps1") -RootProcessId ([uint32]$activation.processId) -InstallLocation $installLocation -ApprovedOutputRoot $work -OutputPath (Join-Path $work 'observation.json')
  & (Join-Path $scriptRoot "Invoke-OracleStage5R2CompanionTransitions.ps1") -OracleRootProcessId ([uint32]$activation.processId) -InstallLocation $installLocation -OutputPath (Join-Path $work 'companion.json')
} catch {
  $primary = $_.Exception
} finally {
  try { Stop-OwnedProcesses } catch { $cleanup.Add("process: $($_.Exception.Message)") }
  try {
    if ($null -ne $configurationPath -and (Test-Path -LiteralPath $configurationPath)) {
      Remove-OracleInstalledRuntimeConfiguration -ConfigurationPath $configurationPath -ExpectedSha256 $configurationHash -LocalAppDataRoot $env:LOCALAPPDATA | Out-Null
    }
  } catch { $cleanup.Add("runtime: $($_.Exception.Message)") }
  try {
    if ($null -ne $package) { Remove-AppxPackage -Package ([string]$package.PackageFullName) -ErrorAction Stop }
    if (@(Get-OraclePackages).Count -ne 0) { throw "Package residue remains." }
    $packageRoot = Join-Path $env:LOCALAPPDATA "Packages\$($contract.package.familyName)"
    if (Test-Path -LiteralPath $packageRoot) { Remove-Item -LiteralPath $packageRoot -Recurse -Force -ErrorAction Stop }
  } catch { $cleanup.Add("package: $($_.Exception.Message)") }
  try {
    if ($trust) {
      $cert = "Cert:\LocalMachine\TrustedPeople\$($contract.package.certificateThumbprint)"
      if (Test-Path -LiteralPath $cert) { Remove-Item -LiteralPath $cert -Force -ErrorAction Stop }
    }
  } catch { $cleanup.Add("trust: $($_.Exception.Message)") }
  try {
    if ($null -ne $fixture -and -not $fixture.HasExited) {
      $observed = Get-CimInstance Win32_Process -Filter "ProcessId=$($fixture.Id)"
      $expectedFixture = [IO.Path]::GetFullPath((Join-Path $scriptRoot ([string]$contract.cleanHostFixture.executable)))
      if ($null -eq $observed -or [IO.Path]::GetFullPath([string]$observed.ExecutablePath) -cne $expectedFixture) { throw "Fixture process identity changed." }
      Stop-Process -Id $fixture.Id -Force -ErrorAction Stop
      $fixture.WaitForExit()
    }
  } catch { $cleanup.Add("fixture: $($_.Exception.Message)") }
}$zero=@(Get-OraclePackages).Count-eq0-and@(Get-ChildItem -LiteralPath "Cert:\LocalMachine\TrustedPeople"|Where-Object{$_.Thumbprint-ceq[string]$contract.package.certificateThumbprint}).Count-eq0-and@((Get-Snapshot)|Where-Object{-not[string]::IsNullOrWhiteSpace([string]$_.ExecutablePath)-and[string]$_.ExecutablePath-match'(?i)\\WindowsApps\\Oracle\.Platform\.LocalCertification_'}).Count-eq0
$record=[ordered]@{result=if($null-eq$primary-and$cleanup.Count-eq0-and$zero){'passed'}else{'failed'};classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','INSTALLED CLEAN-HOST DEVELOPMENT REHEARSAL');qualificationEvidence=$false;transferCreated=$false;authorityCreated=$false;attemptCreated=$false;packageSha256=[string]$contract.package.sha256;fixtureSha256=[string]$contract.cleanHostFixture.sha256;semantic=if(Test-Path(Join-Path $work 'semantic.json')){Get-Content -Raw (Join-Path $work 'semantic.json')|ConvertFrom-Json}else{$null};observation=if(Test-Path(Join-Path $work 'observation.json')){Get-Content -Raw (Join-Path $work 'observation.json')|ConvertFrom-Json}else{$null};companion=if(Test-Path(Join-Path $work 'companion.json')){Get-Content -Raw (Join-Path $work 'companion.json')|ConvertFrom-Json}else{$null};zeroResidue=$zero;error=if($null-ne$primary){$primary.Message}else{$null};cleanupFailures=@($cleanup)}
Write-CreateOnlyJson $result $record
if([string]$record.result-cne'passed'){throw "Installed clean-host development rehearsal failed: $($record.error); cleanup=$($cleanup -join '; ')"}
$record|ConvertTo-Json -Depth 5
