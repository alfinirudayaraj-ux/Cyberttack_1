@echo off
title ShieldLux - Server + Windows Guardian
cd /d "%~dp0"
echo Starting ShieldLux server + background clipboard guardian...
start "" http://localhost:8787/web/guardian.html
start "" node server.js
node guardian-win.js
pause
