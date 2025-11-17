# RS PROLIPSI - VERIFICACAO DO SISTEMA

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  RS PROLIPSI - VERIFICACAO DO SISTEMA" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  OK Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERRO Node.js NAO instalado!" -ForegroundColor Red
    exit 1
}

# Verificar npm
Write-Host "[2/5] Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  OK npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERRO npm NAO instalado!" -ForegroundColor Red
    exit 1
}

# Verificar Admin
Write-Host "[3/5] Verificando rs-admin..." -ForegroundColor Yellow
$adminPath = "G:\Rs Prolipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack\rs-admin"
if (Test-Path $adminPath) {
    Write-Host "  OK Pasta rs-admin existe" -ForegroundColor Green
    
    $adminEnv = Join-Path $adminPath ".env"
    if (Test-Path $adminEnv) {
        Write-Host "  OK .env do Admin existe" -ForegroundColor Green
        
        $envContent = Get-Content $adminEnv -Raw
        if ($envContent -match "VITE_SUPABASE_URL") {
            Write-Host "  OK Chave Supabase configurada" -ForegroundColor Green
        } else {
            Write-Host "  ERRO Chave Supabase NAO encontrada no .env" -ForegroundColor Red
        }
    } else {
        Write-Host "  ERRO .env do Admin NAO existe" -ForegroundColor Red
    }
} else {
    Write-Host "  ERRO Pasta rs-admin NAO encontrada" -ForegroundColor Red
}

# Verificar Consultor
Write-Host "[4/5] Verificando rs-consultor..." -ForegroundColor Yellow
$consultorPath = "G:\Rs Prolipsi Oficial v.1 Roberto Camargo\Documentacao RS Prolipsi\rs-consultor"
if (Test-Path $consultorPath) {
    Write-Host "  OK Pasta rs-consultor existe" -ForegroundColor Green
    
    $consultorEnv = Join-Path $consultorPath ".env"
    if (Test-Path $consultorEnv) {
        Write-Host "  OK .env do Consultor existe" -ForegroundColor Green
        
        $envContent = Get-Content $consultorEnv -Raw
        if ($envContent -match "VITE_SUPABASE_URL") {
            Write-Host "  OK Chave Supabase configurada" -ForegroundColor Green
            
            # Verificar se e a chave correta (nova)
            if ($envContent -match "1757014891") {
                Write-Host "  OK Chave Supabase ATUALIZADA (2025)" -ForegroundColor Green
            } else {
                Write-Host "  AVISO Chave Supabase pode estar desatualizada" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ERRO Chave Supabase NAO encontrada no .env" -ForegroundColor Red
        }
    } else {
        Write-Host "  ERRO .env do Consultor NAO existe" -ForegroundColor Red
    }
} else {
    Write-Host "  ERRO Pasta rs-consultor NAO encontrada" -ForegroundColor Red
}

# Verificar scripts SQL
Write-Host "[5/5] Verificando scripts SQL..." -ForegroundColor Yellow
$sqlPath = "G:\Rs Prolipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack"
$sqlVerificacao = Join-Path $sqlPath "SQL-VERIFICACAO-AUTOMATICA.sql"
$sqlDeploy = Join-Path $sqlPath "DEPLOY-SQL-COMPLETO-PRODUCAO.sql"

if (Test-Path $sqlVerificacao) {
    Write-Host "  OK SQL-VERIFICACAO-AUTOMATICA.sql existe" -ForegroundColor Green
} else {
    Write-Host "  ERRO SQL-VERIFICACAO-AUTOMATICA.sql NAO encontrado" -ForegroundColor Red
}

if (Test-Path $sqlDeploy) {
    Write-Host "  OK DEPLOY-SQL-COMPLETO-PRODUCAO.sql existe" -ForegroundColor Green
} else {
    Write-Host "  ERRO DEPLOY-SQL-COMPLETO-PRODUCAO.sql NAO encontrado" -ForegroundColor Red
}

# Resumo
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  RESUMO E PROXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "VERIFICACAO CONCLUIDA!" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Executar SQL no Supabase:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/rptkhrboejbwexseikuo/sql/new" -ForegroundColor Gray
Write-Host "   Arquivo: SQL-VERIFICACAO-AUTOMATICA.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Iniciar Admin:" -ForegroundColor White
Write-Host "   cd rs-admin" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Iniciar Consultor:" -ForegroundColor White
Write-Host "   cd rs-consultor" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Testar criacao de comunicado" -ForegroundColor White
Write-Host ""
Write-Host "Guia completo: LEIA-ME-PRIMEIRO.md" -ForegroundColor Cyan
Write-Host ""
