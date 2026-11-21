@echo off
setlocal
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 or newer, then open this file again.
  pause
  exit /b 1
)
if not exist node_modules\vite\bin\vite.js (
  call npm ci --no-audit --no-fund
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
call npm start
if errorlevel 1 pause
