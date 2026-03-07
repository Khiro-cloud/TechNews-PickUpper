@echo off
setlocal

cd /d "%~dp0"

start "Tech News Digest Dev Server" cmd /k "npm.cmd run dev"
timeout /t 8 /nobreak >nul
start "" "http://localhost:3000"

endlocal
