# =====================================================
# RS PRÓLIPSI - TESTE RÁPIDO DE INTEGRAÇÃO
# Execute este script para verificar se está tudo OK
# =====================================================

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  RS PRÓLIPSI - TESTE DE INTEGRAÇÃO" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js NÃO instalado!" -ForegroundColor Red
    exit 1
}

# Verificar se npm está instalado
Write-Host "[2/5] Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  ✅ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ npm NÃO instalado!" -ForegroundColor Red
    exit 1
}

# Verificar Admin
Write-Host "[3/5] Verificando rs-admin..." -ForegroundColor Yellow
$adminPath = "G:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack\rs-admin"
if (Test-Path $adminPath) {
    Write-Host "  ✅ Pasta rs-admin existe" -ForegroundColor Green
    
    $adminEnv = Join-Path $adminPath ".env"
    if (Test-Path $adminEnv) {
        Write-Host "  ✅ .env do Admin existe" -ForegroundColor Green
        
        $envContent = Get-Content $adminEnv -Raw
        if ($envContent -match "VITE_SUPABASE_URL") {
            Write-Host "  ✅ Chave Supabase configurada" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Chave Supabase NÃO encontrada no .env" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ .env do Admin NÃO existe" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Pasta rs-admin NÃO encontrada" -ForegroundColor Red
}

# Verificar Consultor
Write-Host "[4/5] Verificando rs-consultor..." -ForegroundColor Yellow
$consultorPath = "G:\Rs Prólipsi Oficial v.1 Roberto Camargo\Documentação RS Prólipsi\rs-consultor"
if (Test-Path $consultorPath) {
    Write-Host "  ✅ Pasta rs-consultor existe" -ForegroundColor Green
    
    $consultorEnv = Join-Path $consultorPath ".env"
    if (Test-Path $consultorEnv) {
        Write-Host "  ✅ .env do Consultor existe" -ForegroundColor Green
        
        $envContent = Get-Content $consultorEnv -Raw
        if ($envContent -match "VITE_SUPABASE_URL") {
            Write-Host "  ✅ Chave Supabase configurada" -ForegroundColor Green
            
            # Verificar se é a chave correta (nova)
            if ($envContent -match "iat.*1757014891") {
                Write-Host "  ✅ Chave Supabase ATUALIZADA (2025)" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️ Chave Supabase pode estar desatualizada" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ❌ Chave Supabase NÃO encontrada no .env" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ .env do Consultor NÃO existe" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Pasta rs-consultor NÃO encontrada" -ForegroundColor Red
}

# Verificar scripts SQL
Write-Host "[5/5] Verificando scripts SQL..." -ForegroundColor Yellow
$sqlPath = "G:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack"
$sqlVerificacao = Join-Path $sqlPath "SQL-VERIFICACAO-AUTOMATICA.sql"
$sqlDeploy = Join-Path $sqlPath "DEPLOY-SQL-COMPLETO-PRODUCAO.sql"

if (Test-Path $sqlVerificacao) {
    Write-Host "  ✅ SQL-VERIFICACAO-AUTOMATICA.sql existe" -ForegroundColor Green
} else {
    Write-Host "  ❌ SQL-VERIFICACAO-AUTOMATICA.sql NÃO encontrado" -ForegroundColor Red
}

if (Test-Path $sqlDeploy) {
    Write-Host "  ✅ DEPLOY-SQL-COMPLETO-PRODUCAO.sql existe" -ForegroundColor Green
} else {
    Write-Host "  ❌ DEPLOY-SQL-COMPLETO-PRODUCAO.sql NÃO encontrado" -ForegroundColor Red
}

# Resumo
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  RESUMO DO TESTE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣ Executar SQL no Supabase:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/rptkhrboejbwexseikuo/sql/new" -ForegroundColor Gray
Write-Host "   Arquivo: SQL-VERIFICACAO-AUTOMATICA.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣ Iniciar Admin:" -ForegroundColor White
Write-Host "   cd ""$adminPath""" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣ Iniciar Consultor:" -ForegroundColor White
Write-Host "   cd ""$consultorPath""" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣ Testar:" -ForegroundColor White
Write-Host "   - Criar comunicado no Admin" -ForegroundColor Gray
Write-Host "   - Verificar no Consultor" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Guia completo: TESTE-COMUNICACAO-COMPLETO.md" -ForegroundColor Cyan
Write-Host ""

# Perguntar se quer iniciar os servidores
Write-Host "Deseja iniciar os servidores agora? (S/N): " -ForegroundColor Yellow -NoNewline
$resposta = Read-Host

if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host ""
    Write-Host "Iniciando servidores..." -ForegroundColor Green
    Write-Host ""
    
    # Iniciar Admin em nova janela
    Write-Host "🚀 Abrindo Admin..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$adminPath'; npm run dev"
    
    Start-Sleep -Seconds 2
    
    # Iniciar Consultor em nova janela
    Write-Host "🚀 Abrindo Consultor..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$consultorPath'; npm run dev"
    
    Write-Host ""
    Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Aguarde alguns segundos e acesse:" -ForegroundColor Yellow
    Write-Host "  - Admin: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "  - Consultor: http://localhost:5174" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "OK! Inicie manualmente quando quiser." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
