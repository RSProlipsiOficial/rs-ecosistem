# Script para reiniciar o Marketplace com as novas variáveis de ambiente

Write-Host "🔄 Parando processos duplicados do Marketplace..." -ForegroundColor Yellow

# Encontrar processos na porta 3003
$port = 3003
$processIds = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processIds) {
    foreach ($pid in $processIds) {
        Write-Host "❌ Parando processo PID: $pid" -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

Write-Host "✅ Processos duplicados removidos!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Iniciando Marketplace com novas variáveis de ambiente..." -ForegroundColor Cyan

# Limpar cache do Vite
$viteCachePath = "apps\rs-ops-app\rs-marketplace\node_modules\.vite"
if (Test-Path $viteCachePath) {
    Remove-Item -Recurse -Force $viteCachePath -ErrorAction SilentlyContinue
    Write-Host "🗑️  Cache do Vite limpo!" -ForegroundColor Yellow
}

# Iniciar servidor
npm run dev --prefix apps/rs-ops-app/rs-marketplace
