[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$EdgePath,
  [Parameter(Mandatory = $true)][string]$WebOrigin,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [int]$DebugPort = 4315,
  [switch]$EngineeringAuthDiagnostics
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$contract = Get-Content -Raw -LiteralPath (Join-Path $root "Oracle.Stage5R2CleanHostContract.json") | ConvertFrom-Json
$origin = [Uri]$WebOrigin
if (-not $origin.IsLoopback -or $origin.Scheme -cne "http" -or $origin.AbsolutePath -cne "/") { throw "Installed web origin must be an HTTP loopback origin." }
if (-not (Test-Path -LiteralPath $EdgePath -PathType Leaf)) { throw "Admitted Edge executable is absent." }
$output = [IO.Path]::GetFullPath($OutputPath)
if (Test-Path -LiteralPath $output) { throw "Semantic-probe output is create-only." }
[IO.Directory]::CreateDirectory((Split-Path -Parent $output)) | Out-Null
$profile = Join-Path ([IO.Path]::GetTempPath()) ("oracle-stage5-r2-edge-" + [Guid]::NewGuid().ToString("N"))
[IO.Directory]::CreateDirectory($profile) | Out-Null
$edge = $null
$socket = $null
$nextId = 0
$authExceptions = [Collections.Generic.List[object]]::new()

function Send-Cdp([string]$Method, $Parameters = @{}) {
  $script:nextId++
  $requestId = $script:nextId
  $message = @{ id = $requestId; method = $Method; params = $Parameters } | ConvertTo-Json -Depth 30 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($message)
  $segment = [ArraySegment[byte]]::new($bytes)
  [void]$socket.SendAsync($segment, [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
  while ($true) {
    $stream = [IO.MemoryStream]::new()
    try {
      do {
        $buffer = New-Object byte[] 65536
        $received = $socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), [Threading.CancellationToken]::None).GetAwaiter().GetResult()
        if ($received.MessageType -eq [Net.WebSockets.WebSocketMessageType]::Close) { throw "Edge CDP socket closed." }
        $stream.Write($buffer, 0, $received.Count)
      } while (-not $received.EndOfMessage)
      $record = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
    } finally { $stream.Dispose() }
    if ($EngineeringAuthDiagnostics -and $null -ne $record.PSObject.Properties["method"] -and [string]$record.method -ceq "Debugger.paused") {
      $description = if ($null -ne $record.params.PSObject.Properties["data"] -and $null -ne $record.params.data.PSObject.Properties["description"]) { [string]$record.params.data.description } else { $null }
      $top = @($record.params.callFrames | Select-Object -First 1)
      $authExceptions.Add([ordered]@{
        reason = [string]$record.params.reason
        description = $description
        functionName = if ($top.Count -eq 1) { [string]$top[0].functionName } else { $null }
        url = if ($top.Count -eq 1) { [string]$top[0].url } else { $null }
        lineNumber = if ($top.Count -eq 1) { [int]$top[0].location.lineNumber } else { $null }
      })
      $script:nextId++
      $resume = [Text.Encoding]::UTF8.GetBytes((@{ id=$script:nextId; method="Debugger.resume"; params=@{} } | ConvertTo-Json -Compress))
      [void]$socket.SendAsync([ArraySegment[byte]]::new($resume), [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
      continue
    }
    if ($null -ne $record.PSObject.Properties["id"] -and [int]$record.id -eq $requestId) {
      if ($null -ne $record.PSObject.Properties["error"]) { throw "Edge CDP command failed: $($record.error.code) $($record.error.message)" }
      return $record.result
    }
  }
}

function Invoke-JavaScript([string]$Expression) {
  $result = Send-Cdp "Runtime.evaluate" @{ expression = $Expression; returnByValue = $true; awaitPromise = $true }
  if ($null -ne $result.PSObject.Properties["exceptionDetails"]) { throw "Installed browser evaluation failed." }
  $result.result.value
}

function Wait-Document([string]$ExpectedPath) {
  $deadline = [DateTime]::UtcNow.AddSeconds(30)
  $lastState = $null
  do {
    try {
      $lastState = Invoke-JavaScript "({ready:document.readyState,path:location.pathname,href:location.href,status:[...document.querySelectorAll('[role=status]')].map(e=>e.textContent).join(' | ').slice(0,1000)})"
      if ([string]$lastState.ready -ceq "complete" -and [string]$lastState.path -ceq $ExpectedPath) { return }
    } catch {}
    Start-Sleep -Milliseconds 100
  } while ([DateTime]::UtcNow -lt $deadline)
  throw "Installed browser navigation timed out for $ExpectedPath; lastState=$($lastState | ConvertTo-Json -Compress)."
}
function Navigate([string]$Path) {
  [void](Send-Cdp "Page.navigate" @{ url = $origin.GetLeftPart([UriPartial]::Authority) + $Path })
  Wait-Document ([Uri]($origin.GetLeftPart([UriPartial]::Authority) + $Path)).AbsolutePath
}

function Test-KeyboardFocusIndicators {
  if($EngineeringAuthDiagnostics){[void](Invoke-JavaScript "document.querySelectorAll('nextjs-portal').forEach(e=>e.setAttribute('inert',''));true")}
  $count = [int](Invoke-JavaScript "[...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(e=>!e.disabled&&e.getAttribute('aria-disabled')!=='true'&&!e.closest('[inert]')&&Number(e.getAttribute('tabindex')||0)>=0&&e.getClientRects().length).length")
  if ($count -gt 128) { throw "Installed route exposes an unbounded keyboard focus sequence." }
  [void](Invoke-JavaScript "document.body.setAttribute('tabindex','-1');document.body.focus();document.body.removeAttribute('tabindex');true")
  $failures=[Collections.Generic.List[object]]::new()
  for($index=0;$index-lt$count;$index++){
    [void](Send-Cdp "Input.dispatchKeyEvent" @{type="keyDown";key="Tab";code="Tab";windowsVirtualKeyCode=9;nativeVirtualKeyCode=9})
    [void](Send-Cdp "Input.dispatchKeyEvent" @{type="keyUp";key="Tab";code="Tab";windowsVirtualKeyCode=9;nativeVirtualKeyCode=9})
    $state=Invoke-JavaScript "(()=>{const e=document.activeElement,s=getComputedStyle(e),name=(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.textContent||e.getAttribute('title')||e.getAttribute('alt')||e.labels?.[0]?.textContent||'').trim();return{tag:e.tagName,name:name.slice(0,80),focusVisible:e.matches(':focus-visible'),outlineStyle:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth)||0,boxShadow:s.boxShadow}})()"
    if(-not[bool]$state.focusVisible-or(([string]$state.outlineStyle-ceq"none"-or[double]$state.outlineWidth-le0)-and[string]$state.boxShadow-ceq"none")){$failures.Add($state)}
  }
  [pscustomobject]@{passed=$failures.Count-eq0;failures=@($failures)}
}
function Get-EdgeProfileProcesses {
  $expectedEdge = [IO.Path]::GetFullPath($EdgePath)
  $matches = @(Get-CimInstance Win32_Process -ErrorAction Stop | Where-Object {
    [string]$_.Name -ceq "msedge.exe" -and
    -not [string]::IsNullOrWhiteSpace([string]$_.CommandLine) -and
    ([string]$_.CommandLine).IndexOf($profile, [StringComparison]::OrdinalIgnoreCase) -ge 0
  })
  foreach ($process in $matches) {
    if ([string]::IsNullOrWhiteSpace([string]$process.ExecutablePath) -or
      [IO.Path]::GetFullPath([string]$process.ExecutablePath) -cne $expectedEdge) {
      throw "A foreign process references the exact Edge profile: $([int]$process.ProcessId)."
    }
  }
  @($matches)
}

function Request-EdgeBrowserClose {
  if ($null -eq $socket -or $socket.State -ne [Net.WebSockets.WebSocketState]::Open) { return $false }
  $script:nextId++
  $message = @{ id = $script:nextId; method = "Browser.close"; params = @{} } | ConvertTo-Json -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($message)
  [void]$socket.SendAsync([ArraySegment[byte]]::new($bytes), [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
  $true
}

function Complete-EdgeProfileTeardown {
  $closeRequested = $false
  try { $closeRequested = Request-EdgeBrowserClose } catch {}
  if ($null -ne $socket) { $socket.Dispose(); $script:socket = $null }
  $deadline = [DateTime]::UtcNow.AddSeconds(10)
  do {
    $remaining = @(Get-EdgeProfileProcesses)
    if ($remaining.Count -eq 0) { break }
    Start-Sleep -Milliseconds 100
  } while ([DateTime]::UtcNow -lt $deadline)
  $stopped = [Collections.Generic.List[object]]::new()
  foreach ($observed in @($remaining)) {
    $processId = [int]$observed.ProcessId
    $expectedCreation = [string]$observed.CreationDate
    try { Stop-Process -Id $processId -Force -ErrorAction Stop; $stopped.Add([ordered]@{ processId=$processId; outcome="stop-requested" }) }
    catch {
      $current = @(Get-CimInstance Win32_Process -Filter "ProcessId=$processId" -ErrorAction Stop)
      if ($current.Count -eq 0) { $stopped.Add([ordered]@{ processId=$processId; outcome="already-exited-after-verified-observation" }); continue }
      if ($current.Count -ne 1 -or [string]$current[0].CreationDate -cne $expectedCreation) { throw "Edge profile process identity changed after stop failure: $processId" }
      [void](Get-EdgeProfileProcesses)
      throw
    }
  }
  $deadline = [DateTime]::UtcNow.AddSeconds(10)
  do { $remaining = @(Get-EdgeProfileProcesses); if ($remaining.Count -eq 0) { break }; Start-Sleep -Milliseconds 100 } while ([DateTime]::UtcNow -lt $deadline)
  if ($remaining.Count -ne 0) { throw "Ownership-verified Edge profile processes remain after bounded teardown." }
  $deleteFailure = $null
  $deadline = [DateTime]::UtcNow.AddSeconds(10)
  do {
    try { if (Test-Path -LiteralPath $profile) { Remove-Item -LiteralPath $profile -Recurse -Force -ErrorAction Stop }; $deleteFailure=$null; break }
    catch { $deleteFailure=$_.Exception.Message; Start-Sleep -Milliseconds 100 }
  } while ([DateTime]::UtcNow -lt $deadline)
  if (Test-Path -LiteralPath $profile) { throw "Edge profile remained after process quiescence: $deleteFailure" }
  [pscustomobject][ordered]@{ closeRequested=$closeRequested; forcedProcessOutcomes=@($stopped); remainingProfileProcesses=0; profileRemoved=$true }
}
$inspection = @'
(() => {
 const f=[...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(e=>!e.disabled&&e.getAttribute('aria-disabled')!=='true');
 const name=e=>(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.textContent||e.getAttribute('title')||e.getAttribute('alt')||e.labels?.[0]?.textContent||'').trim();
 let focus=true,focusFailures=[];
 const colorCanvas=document.createElement('canvas'),colorContext=colorCanvas.getContext('2d',{willReadFrequently:true});colorCanvas.width=colorCanvas.height=1;const parse=v=>{colorContext.clearRect(0,0,1,1);colorContext.fillStyle='#000';colorContext.fillStyle=v;colorContext.fillRect(0,0,1,1);const d=colorContext.getImageData(0,0,1,1).data;return [d[0],d[1],d[2],d[3]/255]};
 const lum=r=>{const c=r.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
 let contrast=0,contrastDetails=[];for(const e of [...document.querySelectorAll('h1,h2,h3,p,label,a,button,input,select,textarea')].filter(e=>!e.disabled&&e.getAttribute('aria-disabled')!=='true'&&e.getClientRects().length&&(e.textContent||e.value||'').trim().length)){const s=getComputedStyle(e),fg=parse(s.color);let n=e,layers=[];while(n){const c=parse(getComputedStyle(n).backgroundColor);if(c[3]>0)layers.push(c);if(c[3]>=.999)break;n=n.parentElement}let bg=[0,0,0,1];const over=(a,b)=>[a[0]*a[3]+b[0]*(1-a[3]),a[1]*a[3]+b[1]*(1-a[3]),a[2]*a[3]+b[2]*(1-a[3]),1];for(const layer of layers.reverse())bg=over(layer,bg);const renderedForeground=over(fg,bg);const ratio=(Math.max(lum(renderedForeground),lum(bg))+.05)/(Math.min(lum(renderedForeground),lum(bg))+.05),large=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&Number(s.fontWeight)>=700);if(ratio<(large?3:4.5)){contrast++;contrastDetails.push({tag:e.tagName,text:(e.textContent||e.value||'').trim().slice(0,80),color:s.color,background:'rgb('+bg.join(',')+')',ratio:Number(ratio.toFixed(3)),fontSize:s.fontSize,fontWeight:s.fontWeight})}}
 const live=[...document.querySelectorAll('[role=status],[role=alert],[aria-live]')];
 const animated=[...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);return parseFloat(s.animationDuration)>.001||parseFloat(s.transitionDuration)>.001});
 return {language:document.documentElement.lang,main:document.querySelectorAll('main,[role=main]').length,h1:document.querySelectorAll('h1,[role=heading][aria-level="1"]').length,unnamed:f.filter(e=>!name(e)).length,positive:f.filter(e=>Number(e.getAttribute('tabindex'))>0).length,focus,focusFailures,contrast,contrastDetails,live:live.every(e=>['status','alert'].includes(e.getAttribute('role'))||['polite','assertive','off'].includes(e.getAttribute('aria-live'))),reduced:matchMedia('(prefers-reduced-motion: reduce)').matches&&animated.length===0};
})()
'@

$record = $null
$primaryFailure = $null
$cleanupFailures = [Collections.Generic.List[string]]::new()
$browserTeardown = $null
try {
  $arguments = @("--headless=new", "--remote-debugging-port=$DebugPort", "--user-data-dir=$profile", "--no-first-run", "--disable-background-networking", "--disable-component-update", "--disable-default-apps", "--disable-sync", "--metrics-recording-only", "about:blank")
  $edge = Start-Process -FilePath $EdgePath -ArgumentList $arguments -PassThru -WindowStyle Hidden
  $deadline = [DateTime]::UtcNow.AddSeconds(30)
  do { try { $target = Invoke-RestMethod -Method Put -Uri "http://127.0.0.1:$DebugPort/json/new?about:blank" -TimeoutSec 2; break } catch { Start-Sleep -Milliseconds 100 } } while ([DateTime]::UtcNow -lt $deadline)
  if ($null -eq $target -or [string]::IsNullOrWhiteSpace([string]$target.webSocketDebuggerUrl)) { throw "Edge CDP admission failed." }
  $socket = [Net.WebSockets.ClientWebSocket]::new()
  [void]$socket.ConnectAsync([Uri][string]$target.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
  [void](Send-Cdp "Page.enable"); [void](Send-Cdp "Runtime.enable"); [void](Send-Cdp "Accessibility.enable")
  [void](Send-Cdp "Emulation.setEmulatedMedia" @{ features = @(@{ name="prefers-reduced-motion"; value="reduce" }) })
  Navigate "/auth?next=%2Foracle"
  $email = ([string]$contract.cleanHostFixture.fixtureEmail | ConvertTo-Json -Compress)
  $password = ([string]$contract.cleanHostFixture.fixturePassword | ConvertTo-Json -Compress)
  [void](Invoke-JavaScript "(()=>{const q=(t,v)=>{const e=document.querySelector('input[type='+t+']');const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};q('email',$email);q('password',$password);return true})()")
  $deadline = [DateTime]::UtcNow.AddSeconds(10)
  do {
    $formState = Invoke-JavaScript "(()=>{const e=document.querySelector('input[type=email]'),p=document.querySelector('input[type=password]'),b=document.querySelector('form button');return {email:e?.value||'',passwordLength:p?.value?.length||0,buttonDisabled:!!b?.disabled}})()"
    if ([string]$formState.email -ceq [string]$contract.cleanHostFixture.fixtureEmail -and [int]$formState.passwordLength -eq ([string]$contract.cleanHostFixture.fixturePassword).Length -and -not [bool]$formState.buttonDisabled) { break }
    Start-Sleep -Milliseconds 100
  } while ([DateTime]::UtcNow -lt $deadline)
  if ([bool]$formState.buttonDisabled) { throw "Installed authentication form did not reconcile controlled input state." }
  if ($EngineeringAuthDiagnostics) {
    [void](Send-Cdp "Debugger.enable")
    [void](Send-Cdp "Debugger.setPauseOnExceptions" @{ state="all" })
  }
  [void](Invoke-JavaScript "(()=>{document.querySelector('form button').click();return true})()")
  Wait-Document "/oracle"
  if ($EngineeringAuthDiagnostics) { [void](Send-Cdp "Debugger.setPauseOnExceptions" @{ state="none" }) }
  $routes = [Collections.Generic.List[object]]::new()
  foreach ($path in @([string[]]$contract.qualificationProtocol.requiredRoutes)) {
    [void](Send-Cdp "Emulation.setDeviceMetricsOverride" @{ width=1440; height=900; deviceScaleFactor=1; mobile=$false })
    Navigate $path
    $dom = Invoke-JavaScript $inspection
    $keyboardFocus = Test-KeyboardFocusIndicators
    $dom.focus = [bool]$keyboardFocus.passed
    $dom.focusFailures = @($keyboardFocus.failures)
    $ax = Send-Cdp "Accessibility.getFullAXTree"
    $roles = @($ax.nodes | Where-Object { -not [bool]$_.ignored } | ForEach-Object { [string]$_.role.value })
    if ($roles -cnotcontains "main" -or $roles -cnotcontains "heading") { throw "$path accessibility tree lacks required semantics." }
    if ([string]$dom.language -cne [string]$contract.accessibilityAcceptance.documentLanguage -or [int]$dom.main -lt 1 -or [int]$dom.h1 -lt 1 -or [int]$dom.unnamed -ne 0 -or [int]$dom.positive -ne 0 -or -not [bool]$dom.focus -or [int]$dom.contrast -ne 0 -or -not [bool]$dom.live -or -not [bool]$dom.reduced) { throw "$path installed semantic acceptance failed: $($dom | ConvertTo-Json -Compress)." }
    [void](Send-Cdp "Emulation.setDeviceMetricsOverride" @{ width=720; height=900; deviceScaleFactor=1; mobile=$false })
    $overflow = [int](Invoke-JavaScript "Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth)")
    if ($overflow -ne 0) { throw "$path overflows at 200-percent equivalent reflow." }
    $routes.Add([ordered]@{ path=$path; documentLanguage=[string]$dom.language; mainLandmarks=[int]$dom.main; levelOneHeadings=[int]$dom.h1; unnamedEnabledFocusables=[int]$dom.unnamed; positiveTabIndexCount=[int]$dom.positive; focusIndicatorPassed=[bool]$dom.focus; contrastViolations=[int]$dom.contrast; liveRegionSemanticsPassed=[bool]$dom.live; reducedMotionRenderedPassed=[bool]$dom.reduced; horizontalOverflowAt200PercentPixels=$overflow; semanticSnapshotPassed=$true })
  }
  $record = [ordered]@{ contract="oracle.sprint-30-5.stage-5-r2-clean-host-semantic-probe"; result="passed"; classification="STAGE5-CLEAN-HOST-INSTALLED-RENDERING"; routes=@($routes); externalAssistiveTechnologyCertificationClaimed=$false }
} catch {
  $primaryFailure = $_.Exception
} finally {
  try { $browserTeardown = Complete-EdgeProfileTeardown } catch { $cleanupFailures.Add($_.Exception.Message) }
}
if ($null -ne $primaryFailure -or $cleanupFailures.Count -ne 0) {
  $failure = [ordered]@{ result="failed"; primaryFailure=if($null-ne$primaryFailure){$primaryFailure.Message}else{$null}; cleanupFailures=@($cleanupFailures); browserTeardown=$browserTeardown; profile=$profile; engineeringAuthExceptions=if($EngineeringAuthDiagnostics){@($authExceptions)}else{@()} }
  $failureBytes=[Text.UTF8Encoding]::new($false).GetBytes((($failure|ConvertTo-Json -Depth 10)+"`n"));$failureStream=[IO.File]::Open("$output.failure.json",[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);try{$failureStream.Write($failureBytes,0,$failureBytes.Length);$failureStream.Flush($true)}finally{$failureStream.Dispose()}
  throw "Installed semantic probe failed: $($failure.primaryFailure); cleanup=$($cleanupFailures -join '; ')"
}
$record["browserTeardown"]=$browserTeardown
$bytes=[Text.UTF8Encoding]::new($false).GetBytes((($record|ConvertTo-Json -Depth 12)+"`n"));$stream=[IO.File]::Open($output,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);try{$stream.Write($bytes,0,$bytes.Length);$stream.Flush($true)}finally{$stream.Dispose()}
$record | ConvertTo-Json -Depth 12