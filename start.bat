@echo off
setlocal
cd /d "%~dp0"
title AukTavernaMoReborn - local
set COREPACK_ENABLE_DOWNLOAD_PROMPT=0

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js 22+ is required. Install it from https://nodejs.org and run again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\.modules.yaml" (
  echo Installing dependencies ^(first run only, ~2 min^)...
  call corepack pnpm install --frozen-lockfile
  if errorlevel 1 (
    echo [ERROR] Dependency install failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo.
echo =====================================================================
echo   Starting the app at:  http://localhost:3000
echo   The browser opens automatically.
echo.
echo   Your data ^(lot list, players, settings, rage/bomb state^) is saved
echo   by the browser at this address and is KEPT between launches.
echo   Use the SAME browser and the SAME address to keep your data.
echo.
echo   To stop the app: close this window.
echo =====================================================================
echo.

call corepack pnpm dev

echo.
echo The app has stopped.
pause
