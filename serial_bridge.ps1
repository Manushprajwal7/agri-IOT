$portName = "COM3"
$baudRate = 115200

try {
    $port = New-Object System.IO.Ports.SerialPort $portName, $baudRate, 'None', 8, 'One'
    $port.ReadTimeout = 2000
    $port.Open()
    
    while ($true) {
        try {
            $line = $port.ReadLine()
            if ($line -and $line.Trim().Length -gt 0) {
                [Console]::Out.WriteLine($line.Trim())
                [Console]::Out.Flush()
            }
        } catch [System.TimeoutException] {
            # timeout is fine, keep listening
        }
    }
} catch {
    [Console]::Error.WriteLine("Error opening $portName : $_")
} finally {
    if ($port -and $port.IsOpen) {
        $port.Close()
    }
}
