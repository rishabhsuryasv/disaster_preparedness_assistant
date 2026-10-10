@echo off
title Disaster Preparedness Assistant
cd /d "%~dp0"
where python >nul 2>nul && (python server.py & goto :eof)
where py >nul 2>nul && (py server.py & goto :eof)
echo Python was not found - opening the offline version (saved official alert data).
start "" "%~dp0DisasterPrepAssistant.html"
