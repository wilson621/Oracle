@echo off
setlocal

if /I not "%~1"=="elevated" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$process = Start-Process -FilePath '%~f0' -Verb RunAs -ArgumentList 'elevated' -WorkingDirectory '%~dp0' -Wait -PassThru; exit $process.ExitCode"
  exit /b %errorlevel%
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Run-OracleStage1EvidenceKit.ps1"
set "oracle_exit_code=%errorlevel%"

echo.
if not "%oracle_exit_code%"=="0" (
  echo Oracle Stage 1 evidence collection stopped with an error.
  echo Keep this window open and report the error text to Codex.
)
pause
exit /b %oracle_exit_code%
