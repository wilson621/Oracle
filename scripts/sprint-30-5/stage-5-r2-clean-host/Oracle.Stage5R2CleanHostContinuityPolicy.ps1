Set-StrictMode -Version Latest

function Assert-OracleStage5R2CleanHostContinuity {
  param([Parameter(Mandatory = $true)]$Contract)

  $issues = [Collections.Generic.List[string]]::new()
  if ([string]$env:COMPUTERNAME -cne [string]$Contract.host.requiredIdentity) {
    $issues.Add("host-identity")
  }
  $system = Get-CimInstance Win32_ComputerSystem -ErrorAction Stop
  if ([string]$system.Model -cne [string]$Contract.host.model) {
    $issues.Add("host-model")
  }
  if (-not [Environment]::Is64BitOperatingSystem -or [Environment]::OSVersion.Version.Build -lt 22000) {
    $issues.Add("windows-11-x64")
  }
  $tools = @([string[]]$Contract.host.requiredAbsentDevelopmentTools | ForEach-Object {
    [ordered]@{ name = $_; available = $null -ne (Get-Command $_ -ErrorAction SilentlyContinue) }
  })
  if (@($tools | Where-Object { $_.available }).Count -ne 0) {
    $issues.Add("development-tools-present")
  }
  $packages = @(Get-AppxPackage -Name ([string]$Contract.package.identity) -ErrorAction SilentlyContinue)
  if ($packages.Count -ne 0) { $issues.Add("oracle-package-residue") }
  $repository = Test-Path -LiteralPath "C:\Dev\project-meta"
  if ($repository) { $issues.Add("development-repository-present") }

  [pscustomobject][ordered]@{
    result = if ($issues.Count -eq 0) { "passed" } else { "failed" }
    issues = @($issues)
    host = [ordered]@{ identity = [string]$env:COMPUTERNAME; model = [string]$system.Model }
    developmentTools = $tools
    repositoryPresent = $repository
    oraclePackageCount = $packages.Count
  }
}
