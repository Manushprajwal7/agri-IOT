# AgriSense & TrueForge PowerShell Launcher
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Starting AgriSense AI Platform & TrueForge Control Plane  " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

# 1. Launch FastAPI Backend on Port 8000
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'A:\agritech\agri-IOT'; $Host.UI.RawUI.WindowTitle = 'AgriSense API (Port 8000)'; python run_server.py"
Write-Host "[✓] AgriSense API & Web App launched: http://localhost:8000" -ForegroundColor Cyan

# 2. Launch TrueForge Control Plane on Port 8790
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'A:\agritech\agri-IOT'; $Host.UI.RawUI.WindowTitle = 'TrueForge Control Plane (Port 8790)'; npx -y @truefoundry/trueforge --port 8790"
Write-Host "[✓] TrueForge Agent Library launched: http://localhost:8790/library" -ForegroundColor Cyan

Write-Host ""
Write-Host "Both servers are running in separate PowerShell windows!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C inside those windows anytime to stop them." -ForegroundColor Gray
