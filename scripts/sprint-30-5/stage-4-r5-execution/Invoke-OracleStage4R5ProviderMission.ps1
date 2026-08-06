[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][ValidateSet('Start','Stop')][string]$Mode,
  [Parameter(Mandatory=$true)][string]$TransferRoot,
  [Parameter(Mandatory=$true)][string]$ExpectedManifestSha256,
  [Parameter(Mandatory=$true)][string]$ExpectedCustodySha256,
  [Parameter(Mandatory=$true)][string]$ExpectedVerificationSha256,
  [Parameter(Mandatory=$true)][string]$ProviderPreflightPath,
  [Parameter(Mandatory=$true)][string]$ExpectedProviderPreflightSha256,
  [Parameter(Mandatory=$true)][string]$ReturnRoot
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$contract=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'Oracle.Stage4R5ExecutionContract.json')|ConvertFrom-Json
. (Join-Path $PSScriptRoot 'Oracle.Stage4R5CleanHostCore.ps1')
Assert-OracleStage4R5Administrator
if(-not[string]::Equals([string]$env:COMPUTERNAME,[string]$contract.hosts.provider.computerName,[StringComparison]::OrdinalIgnoreCase)){throw 'Provider host identity differs.'}
$transfer=Assert-OracleStage4R5Transfer $TransferRoot $ExpectedManifestSha256 $ExpectedCustodySha256 $ExpectedVerificationSha256
$providerPreflight=[IO.Path]::GetFullPath($ProviderPreflightPath);if((-not (Test-Path -LiteralPath $providerPreflight -PathType Leaf)) -or ((Get-OracleStage4R5Sha256 $providerPreflight) -cne $ExpectedProviderPreflightSha256.ToLowerInvariant())){throw 'Bound provider pre-authority record differs.'}
$preflight=Get-Content -Raw -LiteralPath $providerPreflight|ConvertFrom-Json;if([string]$preflight.result-cne'passed'-or[string]$preflight.transferId-cne[string]$transfer.transferId-or[bool]$preflight.providerStateCreated){throw 'Provider pre-authority admission differs.'}
$routes=@(Get-OracleStage4R5DefaultRoutes);if($routes.Count-ne0){throw 'Provider host regained an active default route.'}
$address=@(Get-NetIPAddress -AddressFamily IPv4 -IPAddress ([string]$contract.hosts.provider.address) -ErrorAction SilentlyContinue|Where-Object{[int]$_.PrefixLength-eq[int]$contract.hosts.provider.prefixLength});if($address.Count-ne1){throw 'Provider private-link address continuity failed.'}
$return=[IO.Path]::GetFullPath($ReturnRoot);if(-not(Test-Path -LiteralPath $return -PathType Container)){throw 'Governed R5 return root is absent.'}
$requestPath=Join-Path $return 'provider-start-request.json';if(-not(Test-Path -LiteralPath $requestPath -PathType Leaf)){throw 'Provider start request is absent.'}
$request=Get-Content -Raw -LiteralPath $requestPath|ConvertFrom-Json;$isRehearsal=[string]$request.contract-ceq'oracle.sprint-30-5.stage-4-r5-provider-rehearsal-request';$isQualification=[string]$request.contract-ceq'oracle.sprint-30-5.stage-4-r5-provider-start-request';if(-not$isRehearsal-and-not$isQualification){throw 'Provider request contract differs.'}
if([string]$request.transferId-cne[string]$transfer.transferId){throw 'Provider request transfer binding differs.'}
$authorityHash='NO-AUTHORITY-DEVELOPMENT-REHEARSAL'
if($isQualification){$authorityPath=Join-Path $return 'authority-record.json';if(-not(Test-Path -LiteralPath $authorityPath -PathType Leaf)){throw 'Provider authority record is absent.'};$authorityHash=Get-OracleStage4R5Sha256 $authorityPath;if([string]$request.authoritySha256-cne$authorityHash){throw 'Provider request authority binding differs.'}}
if($Mode-ceq'Start'){
  if((Test-Path -LiteralPath (Join-Path $return 'provider-admission.json')) -or (Test-Path -LiteralPath (Join-Path $return 'provider-secret-handoff.json'))){throw 'Create-only provider-start output already exists.'}
}else{
  $terminalPath=Join-Path $return 'qualification-terminal.json';if(-not(Test-Path -LiteralPath $terminalPath -PathType Leaf)){throw 'Qualification terminal record is absent; provider teardown is not admitted.'}
  $terminal=Get-Content -Raw -LiteralPath $terminalPath|ConvertFrom-Json;$terminalIdentity=if($isRehearsal){[string]$terminal.rehearsalId}else{[string]$terminal.attemptId};$requestIdentity=if($isRehearsal){[string]$request.rehearsalId}else{[string]$request.attemptId};if($terminalIdentity-cne$requestIdentity-or[string]$terminal.result-cnotin@('passed-awaiting-provider-teardown','failed-awaiting-provider-teardown')){throw 'Provider terminal record differs.'}
  if($isRehearsal-and([string]$terminal.contract-cne'oracle.sprint-30-5.stage-4-r5-rehearsal-terminal'-or[string]$terminal.transferId-cne[string]$transfer.transferId-or[string]$terminal.providerIdentity-cne[string]$request.providerIdentity-or[bool]$terminal.authorityCreated-or[bool]$terminal.attemptCreated)){throw 'Provider rehearsal terminal binding differs.'}
  if(Test-Path -LiteralPath (Join-Path $return 'provider-teardown.json')){throw 'Create-only provider teardown output already exists.'}
}
$node=[string]$contract.toolchain.node.path;$controller=Join-Path $PSScriptRoot 'provider-controller.mjs'
$arguments=@($controller,'--mode',$Mode.ToLowerInvariant(),'--request',$requestPath,'--return-root',$return,'--expected-authority-sha256',$authorityHash,'--transfer-root',[IO.Path]::GetFullPath($TransferRoot))
& $node @arguments
if($LASTEXITCODE-ne0){throw "Stage 4 R5 provider $Mode controller exited $LASTEXITCODE."}
if($Mode-ceq'Stop'){$handoffPath=Join-Path $return 'provider-secret-handoff.json';if(Test-Path -LiteralPath $handoffPath){Remove-Item -LiteralPath $handoffPath -Force};if(Test-Path -LiteralPath $handoffPath){throw 'Provider secret handoff residue remains after teardown.'}}
