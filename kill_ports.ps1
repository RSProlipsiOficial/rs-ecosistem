
$ports = @(3002, 3003, 3020, 3004, 2020)
foreach ($port in $ports) {
    $pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($pids) {
        foreach ($pid_val in $pids) {
            Write-Host "Killing process $pid_val on port $port"
            Stop-Process -Id $pid_val -Force -ErrorAction SilentlyContinue
        }
    }
    else {
        Write-Host "No process found on port $port"
    }
}
