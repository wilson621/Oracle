[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$compiler = Join-Path $env:SystemRoot "Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path -LiteralPath $compiler -PathType Leaf)) { throw "Windows .NET Framework C# compiler is absent on the engineering workstation." }
$source = Join-Path $root "Oracle.Stage5CleanHostFixtureProvider.cs"
$output = Join-Path $root "Oracle.Stage5CleanHostFixtureProvider.exe"
& $compiler /nologo /target:exe /optimize+ "/out:$output" /reference:System.Web.Extensions.dll $source
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $output -PathType Leaf)) { throw "Clean-host fixture compilation failed." }
$semanticSource = Join-Path $root "Oracle.Stage5SemanticProbeFixtureSite.cs"
$semanticOutput = Join-Path $root "Oracle.Stage5SemanticProbeFixtureSite.exe"
& $compiler /nologo /target:exe /optimize+ "/out:$semanticOutput" $semanticSource
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $semanticOutput -PathType Leaf)) { throw "Semantic-probe fixture compilation failed." }
[ordered]@{ result = "passed"; classification = "NON-QUALIFICATION ENGINEERING BUILD"; outputs = @(
  [ordered]@{ path = $output; sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $output).Hash.ToLowerInvariant() },
  [ordered]@{ path = $semanticOutput; sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $semanticOutput).Hash.ToLowerInvariant() }
) } | ConvertTo-Json -Depth 5
