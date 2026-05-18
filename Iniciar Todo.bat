@echo off
cd /d C:\bot\repo-check
title BotNeroo0 - Iniciando
color 0A
echo ================================================
echo  BotNeroo0 - Iniciando Todo
echo ================================================
echo.
echo Abriendo Dashboard...
start "BotNeroo0 - Dashboard" cmd /k "cd /d C:\bot\repo-check\dashboard && npm run dev"
timeout /t 3 /nobreak >nul
echo Abriendo API...
start "BotNeroo0 - API" cmd /k "cd /d C:\bot\repo-check && node bot/api-server.js"
timeout /t 3 /nobreak >nul
echo Abriendo Bot...
start "BotNeroo0 - Bot" cmd /k "cd /d C:\bot\repo-check && npm run bot"
echo.
echo ================================================
echo  Todos los servicios iniciados!
echo ================================================
pause