@echo off
title ShieldLux - Permanent Local Shield
cd /d "%~dp0"
echo Starting ShieldLux permanent server...
start "" http://localhost:8787/web/index.html
node server.js
pause
