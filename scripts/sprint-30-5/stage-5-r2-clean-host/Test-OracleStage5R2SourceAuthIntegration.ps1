[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$OutputPath)
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"
$root=$PSScriptRoot
$repository=[IO.Path]::GetFullPath((Join-Path $root "..\..\.."))
$contract=Get-Content -Raw -LiteralPath (Join-Path $root "Oracle.Stage5R2CleanHostContract.json")|ConvertFrom-Json
$output=[IO.Path]::GetFullPath($OutputPath)
if(Test-Path -LiteralPath $output){throw "Source-auth integration output is create-only."}
[IO.Directory]::CreateDirectory((Split-Path -Parent $output))|Out-Null
$node="C:\Program Files\nodejs\node.exe"
$fixturePath=Join-Path $root ([string]$contract.cleanHostFixture.executable)
$fixture=$null;$next=$null;$primary=$null;$cleanup=[Collections.Generic.List[string]]::new()
function Get-Snapshot{@(Get-CimInstance Win32_Process -ErrorAction Stop)}
function Get-Descendants([int]$Root){$snapshot=Get-Snapshot;$ids=[Collections.Generic.HashSet[int]]::new();[void]$ids.Add($Root);do{$changed=$false;foreach($p in $snapshot){if(-not$ids.Contains([int]$p.ProcessId)-and$ids.Contains([int]$p.ParentProcessId)){[void]$ids.Add([int]$p.ProcessId);$changed=$true}}}while($changed);@($snapshot|Where-Object{[int]$_.ProcessId-in$ids})}
try{
  if(-not(Test-Path -LiteralPath $node -PathType Leaf)){throw "Engineering Node executable is absent."}
  if((Get-FileHash -Algorithm SHA256 -LiteralPath $fixturePath).Hash.ToLowerInvariant()-cne[string]$contract.cleanHostFixture.sha256){throw "Clean-host fixture identity differs."}
  $fixture=Start-Process -FilePath $fixturePath -ArgumentList @('--port',[string]$contract.cleanHostFixture.port) -PassThru -WindowStyle Hidden
  $deadline=[DateTime]::UtcNow.AddSeconds(15);do{try{$health=Invoke-RestMethod -Uri "http://127.0.0.1:$($contract.cleanHostFixture.port)/health" -TimeoutSec 2;break}catch{Start-Sleep -Milliseconds 100}}while([DateTime]::UtcNow-lt$deadline);if([string]$health.result-cne'passed'){throw "Clean-host fixture admission failed."}
  $env:NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:$($contract.cleanHostFixture.port)";$env:NEXT_PUBLIC_SUPABASE_ANON_KEY=[string]$contract.cleanHostFixture.anonymousKey;$env:SUPABASE_SECRET_KEY='oracle-stage5-clean-host-service-key-not-production';$env:ORACLE_WEB_SESSION_SECRET='oracle-stage5-clean-host-session-secret-not-production';$env:NODE_ENV='development'
  $next=Start-Process -FilePath $node -ArgumentList @((Join-Path $repository 'node_modules\next\dist\bin\next'),'dev','--hostname','127.0.0.1','--port','4545') -WorkingDirectory $repository -PassThru -WindowStyle Hidden
  $deadline=[DateTime]::UtcNow.AddSeconds(120);do{try{$auth=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:4545/auth' -TimeoutSec 3;break}catch{Start-Sleep -Milliseconds 250}}while([DateTime]::UtcNow-lt$deadline);if($null-eq$auth-or[int]$auth.StatusCode-ne200){throw "Oracle source auth page did not start."}
  $edge=@("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe","$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe")|Where-Object{Test-Path -LiteralPath $_ -PathType Leaf}|Select-Object -First 1
  & (Join-Path $root 'Invoke-OracleStage5R2EdgeSemanticProbe.ps1') -EdgePath $edge -WebOrigin 'http://127.0.0.1:4545/' -OutputPath $output -DebugPort 55435 -EngineeringAuthDiagnostics|Out-Null
}catch{$primary=$_.Exception}finally{
  foreach($name in @('NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SECRET_KEY','ORACLE_WEB_SESSION_SECRET','NODE_ENV')){[Environment]::SetEnvironmentVariable($name,$null,'Process')}
  try{
    if($null-ne$next){
      $observed=@(Get-Descendants $next.Id)
      $owned=@($observed|Where-Object{[string]$_.Name -ceq "node.exe"})
      foreach($p in @($owned|Sort-Object ProcessId -Descending)){
        if([string]::IsNullOrWhiteSpace([string]$p.ExecutablePath)-or[IO.Path]::GetFullPath([string]$p.ExecutablePath)-cne[IO.Path]::GetFullPath($node)){throw "Source-auth Node ownership changed for PID $([int]$p.ProcessId)."}
        $identity=[string]$p.CreationDate
        $current=@(Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$p.ProcessId)")
        if($current.Count-eq1-and[string]$current[0].CreationDate-ceq$identity){try{Stop-Process -Id ([int]$p.ProcessId) -Force -ErrorAction Stop}catch{if(@(Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$p.ProcessId)").Count-ne0){throw}}}
      }
      Start-Sleep -Milliseconds 250
      foreach($p in $owned){if(@(Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$p.ProcessId)").Count-ne0){throw "Source-auth Node PID $([int]$p.ProcessId) remained."}}
    }
  }catch{$cleanup.Add("node: $($_.Exception.Message)")}
  try{if($null-ne$fixture-and-not$fixture.HasExited){$p=@(Get-CimInstance Win32_Process -Filter "ProcessId=$($fixture.Id)");if($p.Count-ne1-or[IO.Path]::GetFullPath([string]$p[0].ExecutablePath)-cne[IO.Path]::GetFullPath($fixturePath)){throw "Fixture ownership changed."};Stop-Process -Id $fixture.Id -Force -ErrorAction Stop;$fixture.WaitForExit()}}catch{$cleanup.Add("fixture: $($_.Exception.Message)")}
}
if($null-ne$primary-or$cleanup.Count-ne0){throw "Source-auth integration failed: $($primary.Message); cleanup=$($cleanup -join '; ')"}
$record=Get-Content -Raw -LiteralPath $output|ConvertFrom-Json
if([string]$record.result-cne'passed'-or@($record.routes).Count-ne8-or-not[bool]$record.browserTeardown.profileRemoved){throw "Source-auth integration result is incomplete."}
[ordered]@{result='passed';classification='NON-QUALIFICATION SOURCE AUTH INTEGRATION';routes=@($record.routes).Count;browserProfileRemoved=[bool]$record.browserTeardown.profileRemoved;qualificationEvidence=$false;transferCreated=$false;authorityCreated=$false;attemptCreated=$false}|ConvertTo-Json
