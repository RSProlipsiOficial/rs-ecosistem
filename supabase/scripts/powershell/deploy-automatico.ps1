# =====================================================
# RS PRÓLIPSI - SCRIPT DE DEPLOY AUTOMÁTICO
# Execute este script para fazer deploy completo
# =====================================================

Write-Host "🚀 RS PRÓLIPSI - DEPLOY AUTOMÁTICO" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

$BASE_PATH = "G:\Rs Prólipsi Oficial v.1 Roberto Camargo"
$ADMIN_PATH = "$BASE_PATH\RS_Prolipsi_Full_Stack\rs-admin"
$CONSULTOR_PATH = "$BASE_PATH\Documentação RS Prólipsi\rs-consultor"

# =====================================================
# PASSO 1: VERIFICAR DEPENDÊNCIAS
# =====================================================

Write-Host "📦 PASSO 1: Verificando dependências..." -ForegroundColor Yellow

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado! Instale Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# =====================================================
# PASSO 2: INSTALAR DEPENDÊNCIAS DO CONSULTOR
# =====================================================

Write-Host "📦 PASSO 2: Instalando dependências do Consultor..." -ForegroundColor Yellow

Set-Location $CONSULTOR_PATH

if (Test-Path "package.json") {
    Write-Host "   Instalando @supabase/supabase-js..." -ForegroundColor Cyan
    npm install @supabase/supabase-js --silent
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependências do Consultor instaladas!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao instalar dependências do Consultor!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ package.json não encontrado no Consultor!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# =====================================================
# PASSO 3: CONFIGURAR .ENV DO CONSULTOR
# =====================================================

Write-Host "⚙️  PASSO 3: Configurando .env do Consultor..." -ForegroundColor Yellow

$envExample = "$CONSULTOR_PATH\.env.example"
$envLocal = "$CONSULTOR_PATH\.env.local"

if (Test-Path $envExample) {
    if (-not (Test-Path $envLocal)) {
        Copy-Item $envExample $envLocal
        Write-Host "✅ Arquivo .env.local criado!" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Arquivo .env.local já existe (mantendo)" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Arquivo .env.example não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# =====================================================
# PASSO 4: BUILD DO CONSULTOR
# =====================================================

Write-Host "🔨 PASSO 4: Fazendo build do Consultor..." -ForegroundColor Yellow

Set-Location $CONSULTOR_PATH

Write-Host "   Executando npm run build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build do Consultor concluído!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no build do Consultor!" -ForegroundColor Red
    Write-Host "   Tente executar manualmente: cd '$CONSULTOR_PATH' && npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# =====================================================
# PASSO 5: VERIFICAR .ENV DO ADMIN
# =====================================================

Write-Host "⚙️  PASSO 5: Verificando .env do Admin..." -ForegroundColor Yellow

$adminEnv = "$ADMIN_PATH\.env"

if (Test-Path $adminEnv) {
    $envContent = Get-Content $adminEnv -Raw
    
    if ($envContent -match "VITE_SUPABASE_URL" -and $envContent -match "VITE_SUPABASE_ANON_KEY") {
        Write-Host "✅ Arquivo .env do Admin configurado!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Arquivo .env do Admin existe mas pode estar incompleto" -ForegroundColor Yellow
        Write-Host "   Verifique se tem VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Arquivo .env não encontrado no Admin!" -ForegroundColor Red
    Write-Host "   Crie o arquivo: $adminEnv" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# =====================================================
# PASSO 6: BUILD DO ADMIN
# =====================================================

Write-Host "🔨 PASSO 6: Fazendo build do Admin..." -ForegroundColor Yellow

Set-Location $ADMIN_PATH

Write-Host "   Executando npm run build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build do Admin concluído!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no build do Admin!" -ForegroundColor Red
    Write-Host "   Tente executar manualmente: cd '$ADMIN_PATH' && npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# =====================================================
# PASSO 7: RESUMO FINAL
# =====================================================

Write-Host "====================================`n" -ForegroundColor Cyan
Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "====================================`n" -ForegroundColor Cyan

Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ⚙️  Execute o SQL no Supabase:" -ForegroundColor White
Write-Host "   🔗 https://supabase.com/dashboard/project/rptkhrboejbwexseikuo/sql/new" -ForegroundColor Cyan
Write-Host "   📄 Arquivo: DEPLOY-SQL-COMPLETO-PRODUCAO.sql`n" -ForegroundColor Cyan

Write-Host "2. 🧪 Teste localmente:" -ForegroundColor White
Write-Host "   Admin:     cd '$ADMIN_PATH' && npm run preview" -ForegroundColor Cyan
Write-Host "   Consultor: cd '$CONSULTOR_PATH' && npm run preview`n" -ForegroundColor Cyan

Write-Host "3. 🌐 Deploy para servidor (opcional):" -ForegroundColor White
Write-Host "   Ver instruções no arquivo GUIA-DEPLOY-PRODUCAO.md`n" -ForegroundColor Cyan

Write-Host "====================================`n" -ForegroundColor Cyan

Write-Host "📁 ARQUIVOS GERADOS:" -ForegroundColor Yellow
Write-Host "   ✅ $CONSULTOR_PATH\.env.local" -ForegroundColor Green
Write-Host "   ✅ $CONSULTOR_PATH\dist\" -ForegroundColor Green
Write-Host "   ✅ $ADMIN_PATH\dist\`n" -ForegroundColor Green

Write-Host "🎉 Sistema pronto para produção!" -ForegroundColor Green
Write-Host ""
