@echo off
title AgriSense & TrueForge Launcher
echo ============================================================
echo   Starting AgriSense AI Platform & TrueForge Control Plane
echo ============================================================
echo.
start "AgriSense Backend (Port 8000)" powershell -NoExit -Command "Set-Location 'A:\agritech\agri-IOT'; python run_server.py"
start "TrueForge Control Plane (Port 8790)" powershell -NoExit -Command "Set-Location 'A:\agritech\agri-IOT'; npx -y @truefoundry/trueforge --port 8790"

echo [1/2] AgriSense Backend launched on http://localhost:8000
echo [2/2] TrueForge Control Plane launched on http://localhost:8790/library
echo.
echo Both services are now running in separate windows.
timeout /t 5 >nul
