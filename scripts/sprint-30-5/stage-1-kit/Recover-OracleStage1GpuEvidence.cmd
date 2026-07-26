@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Recover-OracleStage1GpuEvidence.ps1"
set "oracle_exit_code=%errorlevel%"
echo.
if "%oracle_exit_code%"=="2" (
  echo No recoverable GPU evidence was found.
  echo Do not rerun the full Stage 1 evidence kit.
) else if not "%oracle_exit_code%"=="0" (
  echo GPU evidence recovery stopped with an error.
  echo Keep this window open and report the error text to Codex.
)
pause
exit /b %oracle_exit_code%
