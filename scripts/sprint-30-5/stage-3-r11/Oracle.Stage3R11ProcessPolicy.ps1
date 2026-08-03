Set-StrictMode -Version Latest

function Get-OracleStage3R11RequiredProcessMember {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][object]$InputObject,
    [Parameter(Mandatory = $true)][string]$Name
  )

  $property = $InputObject.PSObject.Properties[$Name]
  if ($null -eq $property) {
    throw "Governed process result is missing mandatory member '$Name'."
  }
  $property.Value
}

function Invoke-OracleStage3R11GovernedProcess {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Executable,
    [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$Arguments,
    [Parameter(Mandatory = $true)][string]$LogsRoot,
    [Parameter(Mandatory = $true)][hashtable]$ProcessEvidenceCounts,
    [Parameter(Mandatory = $true)][scriptblock]$WriteCreateOnlyJson,
    [bool]$RequireZero = $true,
    [scriptblock]$ProcessRunner
  )

  if (@($Arguments | Where-Object {
    $_.Contains('"') -or $_.EndsWith("\")
  }).Count -ne 0) {
    throw "Process argument contains an unsafe quote or trailing separator."
  }

  $record = if ($null -ne $ProcessRunner) {
    & $ProcessRunner $Executable $Arguments
  } else {
    $info = [Diagnostics.ProcessStartInfo]::new()
    $info.FileName = $Executable
    $info.Arguments = (($Arguments | ForEach-Object { '"' + $_ + '"' }) -join " ")
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $started = [DateTime]::UtcNow
    $exitCode = $null
    $processError = $null
    $stdout = ""
    $stderr = ""
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $info
    try {
      if (-not $process.Start()) { throw "Process did not start." }
      $stdoutTask = $process.StandardOutput.ReadToEndAsync()
      $stderrTask = $process.StandardError.ReadToEndAsync()
      $process.WaitForExit()
      $stdout = $stdoutTask.GetAwaiter().GetResult()
      $stderr = $stderrTask.GetAwaiter().GetResult()
      $exitCode = $process.ExitCode
    } catch {
      $processError = $_.Exception.Message
    } finally {
      $completed = [DateTime]::UtcNow
      $process.Dispose()
    }
    [pscustomobject][ordered]@{
      executable = $Executable
      arguments = @($Arguments)
      startedAtUtc = $started.ToString("o")
      completedAtUtc = $completed.ToString("o")
      stdout = $stdout
      stderr = $stderr
      exitCode = $exitCode
      signal = $null
      processError = $processError
    }
  }

  if ($null -eq $record) {
    throw "Governed process produced no result envelope."
  }
  foreach ($member in @(
    "executable", "arguments", "startedAtUtc", "completedAtUtc", "stdout",
    "stderr", "exitCode", "signal", "processError"
  )) {
    [void](Get-OracleStage3R11RequiredProcessMember $record $member)
  }

  $count = 1
  if ($ProcessEvidenceCounts.ContainsKey($Name)) {
    $count = [int]$ProcessEvidenceCounts[$Name] + 1
  }
  $ProcessEvidenceCounts[$Name] = $count
  $evidenceName = if ($count -eq 1) { $Name } else {
    "$Name-$('{0:D2}' -f $count)"
  }
  & $WriteCreateOnlyJson (Join-Path $LogsRoot "$evidenceName.json") $record

  $processError = Get-OracleStage3R11RequiredProcessMember $record "processError"
  $signal = Get-OracleStage3R11RequiredProcessMember $record "signal"
  $exitCode = Get-OracleStage3R11RequiredProcessMember $record "exitCode"
  if ($null -ne $processError) {
    throw "Governed process failed to start or execute: ${Name}: $processError"
  }
  if ($null -ne $signal) {
    throw "Governed process terminated by signal: ${Name}: $signal"
  }
  if ($null -eq $exitCode) {
    throw "Governed process returned a null exit status: $Name"
  }
  if ($RequireZero -and [int]$exitCode -ne 0) {
    throw "Governed process exited nonzero: ${Name}: $exitCode"
  }
  $record
}
