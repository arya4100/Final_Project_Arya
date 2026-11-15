@echo off
cd /d "%~dp0"
echo SmartStock - open http://127.0.0.1:4000 after the API is ready.
echo Demo manager: manager@smartstock.demo
echo Demo password: SmartStock!2026
echo Keep this window open while using the application. Press Ctrl+C to stop.
call npm start
pause
