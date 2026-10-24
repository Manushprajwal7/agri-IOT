# Start Gemma Translator & AgriSense Platform (PowerShell)
$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " AgriSense & AgriMarket AI — Local Gemma Translator" -ForegroundColor Green
Write-Host " Powered by Google Gemma 4 (gemma4-e2b via LiteRT-LM)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

# 1. Check LiteRT-LM Server on port 9379
$litertPort = 9379
$litertListening = Get-NetTCPConnection -LocalPort $litertPort -State Listen -ErrorAction SilentlyContinue

if ($litertListening) {
    Write-Host "[1/3] LiteRT-LM Server is already ACTIVE on port $litertPort." -ForegroundColor Green
} else {
    Write-Host "[1/3] Starting LiteRT-LM server on port $litertPort..." -ForegroundColor Yellow
    Start-Process -FilePath "litert-lm" -ArgumentList "serve", "--host", "127.0.0.1", "--port", "$litertPort" -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

# 2. Check Python Translation Backend on port 5005
$translatorPort = 5005
$translatorListening = Get-NetTCPConnection -LocalPort $translatorPort -State Listen -ErrorAction SilentlyContinue

if ($translatorListening) {
    Write-Host "[2/3] Python Translator Backend is already ACTIVE on port $translatorPort." -ForegroundColor Green
} else {
    Write-Host "[2/3] Starting Python Translator Backend on port $translatorPort..." -ForegroundColor Yellow
    $env:TRANSLATOR_PORT = "$translatorPort"
    Start-Process -FilePath "python" -ArgumentList "-u", "gemma_translator\backend\server.py" -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

# 3. Check AgriSense Node Web Server on port 3000
$nodePort = 3000
$nodeListening = Get-NetTCPConnection -LocalPort $nodePort -State Listen -ErrorAction SilentlyContinue

if ($nodeListening) {
    Write-Host "[3/3] AgriSense Web Server is already ACTIVE on port $nodePort." -ForegroundColor Green
} else {
    Write-Host "[3/3] Starting AgriSense Node Web Server on port $nodePort..." -ForegroundColor Yellow
    Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Minimized
    Start-Sleep -Seconds 2
}

Write-Host "`nAll services online!" -ForegroundColor Green
Write-Host "-> Integrated Translator: http://localhost:3000/translator.html" -ForegroundColor Cyan
Write-Host "-> Direct Kiosk View:     http://localhost:3000/translator" -ForegroundColor Cyan
Write-Host "-> Python Backend:        http://localhost:5005" -ForegroundColor Cyan
Write-Host "-> LiteRT-LM API:         http://localhost:9379" -ForegroundColor Cyan

Start-Process "http://localhost:3000/translator.html"
