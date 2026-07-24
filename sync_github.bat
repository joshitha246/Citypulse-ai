@echo off
echo ===================================================
echo   Syncing CityPulse AI with GitHub (joshitha246)
echo ===================================================

cd /d "%~dp0"

echo [1/4] Initializing Git...
git init

echo [2/4] Adding files and creating commit...
git add .
git commit -m "Sync CityPulse AI code"

echo [3/4] Setting remote repository...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/joshitha246/Citypulse-ai.git

echo [4/4] Pulling and Pushing to GitHub...
git pull origin main --rebase 2>nul
git push -u origin main

echo ===================================================
echo   DONE! Your code is now synced on GitHub.
echo ===================================================
pause
