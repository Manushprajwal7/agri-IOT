$ErrorActionPreference = 'SilentlyContinue'
$targetFile = Join-Path $PSScriptRoot "data\live_telemetry.json"
$tmpFile = Join-Path $PSScriptRoot "data\live_telemetry.tmp"

Write-Host "[BRIDGE] Starting COM3 live telemetry listener..."

try {
    $port = New-Object System.IO.Ports.SerialPort "COM3", 115200, "None", 8, "One"
    $port.DtrEnable = $false
    $port.RtsEnable = $false
    $port.ReadTimeout = 3000
    $port.Open()
    Write-Host "[BRIDGE] Connected to COM3 at 115200 baud."

    while ($true) {
        try {
            $line = $port.ReadLine()
            if ($line -and $line.Trim().StartsWith("{") -and $line.Trim().EndsWith("}")) {
                $trimmed = $line.Trim()
                # Parse to verify JSON
                $jsonObj = $trimmed | ConvertFrom-Json
                if ($jsonObj.type -eq "telemetry") {
                    $payload = @{
                        isLive = $true
                        connected = $true
                        source = "ESP32-HARDWARE"
                        soilMoisture = [int]$jsonObj.soilPercent
                        soilRaw = [int]$jsonObj.soilRaw
                        temperature = [double]$jsonObj.temp
                        humidity = [double]$jsonObj.humidity
                        buzzerActive = [bool]$jsonObj.buzzer
                        timestamp = (Get-Date).ToString("hh:mm:ss tt")
                        updatedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                    } | ConvertTo-Json -Compress

                    # Atomic write
                    Set-Content -Path $tmpFile -Value $payload -Encoding UTF8 -Force
                    Move-Item -Path $tmpFile -Destination $targetFile -Force
                    Write-Host "[TELEMETRY UPDATE] Soil: $($jsonObj.soilPercent)% | Temp: $($jsonObj.temp)C | Hum: $($jsonObj.humidity)%"
                }
            }
        } catch [System.TimeoutException] {
            # Idle timeout, continue listening
        } catch {
            Start-Sleep -Milliseconds 100
        }
    }
} catch {
    Write-Error "[BRIDGE ERROR] $_"
} finally {
    if ($port -and $port.IsOpen) {
        $port.Close()
    }
}
