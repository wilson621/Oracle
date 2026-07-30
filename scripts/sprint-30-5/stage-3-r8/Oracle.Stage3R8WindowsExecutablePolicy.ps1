Set-StrictMode -Version Latest

function Get-OracleStage3R8WindowsExecutablePath {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("certutil.exe", "reagentc.exe")]
    [string]$Name,
    [string]$SystemDirectory = [Environment]::SystemDirectory
  )

  if (
    @("certutil.exe", "reagentc.exe") -cnotcontains $Name
  ) {
    throw "Windows executable name must use its exact governed spelling."
  }
  if (
    [string]::IsNullOrWhiteSpace($SystemDirectory) -or
    -not [IO.Path]::IsPathRooted($SystemDirectory)
  ) {
    throw "Windows executable roots must be non-empty absolute paths."
  }

  $path = [IO.Path]::GetFullPath([IO.Path]::Combine($SystemDirectory, $Name))
  $expectedParent = [IO.Path]::GetFullPath($SystemDirectory).TrimEnd("\")
  if (
    -not [StringComparer]::OrdinalIgnoreCase.Equals(
      [IO.Path]::GetDirectoryName($path),
      $expectedParent
    ) -or
    -not [StringComparer]::OrdinalIgnoreCase.Equals(
      [IO.Path]::GetFileName($path),
      $Name
    )
  ) {
    throw "Windows executable path escaped its governed platform directory."
  }
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "Required Windows executable is unavailable: $path"
  }
  $item = Get-Item -LiteralPath $path -Force -ErrorAction Stop
  if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
    throw "Required Windows executable is a reparse point: $path"
  }
  $path
}
