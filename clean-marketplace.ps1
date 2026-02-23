# Script para LIMPAR TUDO e deixar Marketplace na porta 3003

Write-Host "🧹 LIMPEZA TOTAL DO MARKETPLACE - Iniciando..." -ForegroundColor Cyan
Write-Host ""

# Parar TODOS os processos Node.js relacionados ao Marketplace
Write-Host "❌ Parando TODOS os processos das portas 3003, 3004, 3005..." -ForegroundColor Red

$ports = @(3003, 3004, 3005)
foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes) {
        foreach ($pid in $processes) {
            Write-Host "  🔴 Matando processo PID $pid na porta $port" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host ""
Write-Host "⏳ Aguardando 3 segundos para liberação das portas..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Limpar cache do Vite
Write-Host "🗑️  Limpando cache do Vite..." -ForegroundColor Yellow
$viteCachePath = "apps\rs-ops-app\rs-marketplace\node_modules\.vite"
if (Test-Path $viteCachePath) {
    Remove-Item -Recurse -Force $viteCachePath -ErrorAction SilentlyContinue
}

# Limpar localStorage (navegador precisará hard refresh)
Write-Host "💾 Cache limpo! Navegador precisará de hard refresh (Ctrl+Shift+R)" -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ LIMPEZA CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Iniciando Marketplace na porta 3003 com dados REAIS..." -ForegroundColor Cyan
Write-Host ""

# Definir porta explicitamente
$env:PORT = "3003"

# Iniciar servidor
Set-Location "apps\rs-ops-app\rs-marketplace"
npm run dev -- --port 3003
