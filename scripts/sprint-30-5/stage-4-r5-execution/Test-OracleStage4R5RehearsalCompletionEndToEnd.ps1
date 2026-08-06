[CmdletBinding()]param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5JourneyPolicy.ps1')

$testRoot=Join-Path ([IO.Path]::GetTempPath()) ('oracle-stage4-r5-completion-e2e-'+[Guid]::NewGuid().ToString('N'))
$bundleRoot=Join-Path $testRoot 'bundle';$payload=Join-Path $bundleRoot 'payload';[IO.Directory]::CreateDirectory($payload)|Out-Null
$bundleId='engineering-rehearsal-stage4-r5-20260806T230000000Z-c0ffee00';$transferId="NON-TRANSFER-$bundleId"
$bundle=[ordered]@{schemaVersion='1.0.0';contract='oracle.sprint-30-5.stage-4-r5-engineering-rehearsal-bundle';bundleId=$bundleId;classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','NON-TRANSFER');transferCreated=$false;qualificationExecutionPermitted=$false;authorityCreated=$false;attemptCreated=$false;qualificationEvidence=$false;preparation=[ordered]@{executionCommit='fixture-commit';executionTree='fixture-tree'};payload=@()}
$bundlePath=Join-Path $bundleRoot 'Oracle.Stage4R5EngineeringRehearsalBundle.json';Write-OracleStage4R5CreateOnlyJson $bundlePath $bundle;$bundleSha=Get-OracleStage4R5Sha256 $bundlePath
$rehearsalId='rehearsal-stage4-r5-20260806T230100000Z-c0ffee00';$providerIdentity='provider-stage4-r5-20260806T230100000Z-c0ffee00'
$classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','INSTALLED DEVELOPMENT REHEARSAL')

function New-Case([string]$Name,[bool]$Passed){
  $root=Join-Path $testRoot $Name;$returned=Join-Path $root 'qualification-host-rehearsal';[IO.Directory]::CreateDirectory((Join-Path $returned 'logs'))|Out-Null
  $terminalResult=if($Passed){'passed-awaiting-provider-teardown'}else{'failed-awaiting-provider-teardown'}
  Write-OracleStage4R5CreateOnlyJson (Join-Path $root 'provider-start-request.json') ([ordered]@{contract='oracle.sprint-30-5.stage-4-r5-provider-rehearsal-request';transferId=$transferId;rehearsalId=$rehearsalId;providerIdentity=$providerIdentity;authorityCreated=$false;attemptCreated=$false})
  Write-OracleStage4R5CreateOnlyJson (Join-Path $root 'provider-admission.json') ([ordered]@{result='passed';transferId=$transferId;attemptId=$rehearsalId;providerIdentity=$providerIdentity})
  Write-OracleStage4R5CreateOnlyJson (Join-Path $root 'qualification-terminal.json') ([ordered]@{contract='oracle.sprint-30-5.stage-4-r5-rehearsal-terminal';result=$terminalResult;transferId=$transferId;rehearsalId=$rehearsalId;providerIdentity=$providerIdentity;authorityCreated=$false;attemptCreated=$false})
  Write-OracleStage4R5CreateOnlyJson (Join-Path $root 'provider-teardown.json') ([ordered]@{result='passed';attemptId=$rehearsalId;providerIdentity=$providerIdentity;providerContainers=0;providerVolumes=0;providerNetworks=0;providerRelays=0;firewallRules=0;providerWorkRootPresent=$false;zeroResidue=$true})
  if($Passed){
    [IO.Directory]::CreateDirectory((Join-Path $returned 'evidence'))|Out-Null
    $required=Get-OracleStage4R5RequiredJourneys
    $journey=[ordered]@{contract='oracle.sprint-30-5.stage-4-r5-development-rehearsal';result='passed';classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','DEVELOPMENT REHEARSAL');provider=[ordered]@{classification='disposable-local-non-production';implementation='accepted-r4-supabase-stack-on-engineering-provider-host';productionEndpoint=$false;externalEmail=$false;splitHost=$true};journeys=@($required|ForEach-Object{[ordered]@{id=[string]$_;result='passed'}});rendering=[ordered]@{protectedStatus=200;mainLandmarks=1;levelOneHeadings=1;method='authenticated-installed-package-server-render'};isolation=[ordered]@{accountCount=2;crossAccountLeaks=0;distinctAuthenticatedPrincipals=$true;distinctOperators=$true;rlsBindingsPerPrincipal=@(1,1)};secretsRetained=$false}
    Write-OracleStage4R5CreateOnlyJson (Join-Path $returned 'evidence\live-journey.json') $journey
    Write-OracleStage4R5CreateOnlyJson (Join-Path $returned 'completion.json') ([ordered]@{result=$terminalResult;authorityCreated=$false;attemptCreated=$false;packageResidue=0;trustResidue=0})
    Write-OracleStage4R5CreateOnlyJson (Join-Path $returned 'logs\installed-package-result.json') ([ordered]@{result='passed';classification=$classification;zeroResidue=$true})
  }else{
    Write-OracleStage4R5CreateOnlyJson (Join-Path $returned 'failure.json') ([ordered]@{result='failed';primaryFailure='fixture-installed-controller-failure';cleanupFailures=@();authorityCreated=$false;attemptCreated=$false})
    Write-OracleStage4R5CreateOnlyJson (Join-Path $returned 'logs\installed-package-result.json') ([ordered]@{result='failed';classification=$classification;primaryFailure='fixture-runtime-identity-failure';zeroResidue=$true})
  }
  Write-OracleStage4R5CreateOnlyJson (Join-Path $root 'qualification-host-rehearsal-manifest.json') ([ordered]@{result=$terminalResult;rehearsalId=$rehearsalId;files=@(Get-OracleStage4R5Inventory $returned);authorityCreated=$false;attemptCreated=$false})
  [pscustomobject]@{root=$root;output=Join-Path $root 'completion-output.json'}
}

try{
  $passed=New-Case 'passed' $true;$failed=New-Case 'failed' $false;$script=Join-Path $PSScriptRoot 'Complete-OracleStage4R5TwoHostRehearsal.ps1';$ps=Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
  $common=@('-NoLogo','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',$script,'-TransferRoot',$bundleRoot,'-ExpectedManifestSha256','0','-ExpectedCustodySha256','0','-ExpectedVerificationSha256','0','-EngineeringRehearsalBundle','-ExpectedEngineeringRehearsalBundleSha256',$bundleSha)
  $passedText=(& $ps @common -RehearsalRoot $passed.root -OutputPath $passed.output 2>&1|Out-String);$passedExit=$LASTEXITCODE
  if($passedExit-ne0-or-not(Test-Path -LiteralPath $passed.output)){throw "Passed completion fixture failed: $passedText"}
  $ErrorActionPreference='Continue';$failedText=(& $ps @common -RehearsalRoot $failed.root -OutputPath $failed.output 2>&1|Out-String);$failedExit=$LASTEXITCODE;$ErrorActionPreference='Stop'
  if($failedExit-eq0-or$failedText-cnotmatch'Two-host rehearsal failed after verified zero-residue teardown: fixture-installed-controller-failure'-or$failedText-cmatch'terminal record differs'-or(Test-Path -LiteralPath $failed.output)){throw "Failed completion fixture was not reported correctly: $failedText"}
}finally{if(Test-Path -LiteralPath $testRoot){Remove-Item -LiteralPath $testRoot -Recurse -Force}}

[pscustomobject][ordered]@{result='passed';classification=@('NON-QUALIFICATION','NON-AUTHORITY','NON-EVIDENCE','END-TO-END REHEARSAL COMPLETION FIXTURE');passedLifecycleCompleted=$true;failedLifecyclePreserved=$true;failureSurfacedAfterZeroResidue=$true;transferCreated=$false;authorityCreated=$false;attemptCreated=$false}|ConvertTo-Json -Depth 5
