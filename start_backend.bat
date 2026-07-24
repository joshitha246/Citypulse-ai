@echo off
echo ===================================================
echo   Starting CityPulse AI Node.js Express Backend
echo ===================================================

cd /d "%~dp0"

echo [1/2] Checking dependencies...
if not exist node_modules (
    echo Installing Express & CORS...
    call npm install
)

echo [2/2] Launching Backend REST API Server...
node server/server.js

pause
