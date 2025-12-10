# ================================================
# SCRIPT DE DEPLOY - RS WALLETPAY (WINDOWS)
# ================================================

Write-Host "🚀 Iniciando deploy do RS WalletPay..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

# Variáveis
$VPS_HOST = "191.252.92.55"
$VPS_USER = "u172569559"
$REMOTE_PATH = "/home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html"

# ================================================
# 1. BUILD LOCAL
# ================================================

Write-Host ""
Write-Host "📦 Passo 1: Build de produção..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído!" -ForegroundColor Green

# ================================================
# 2. LIMPAR DIRETÓRIO REMOTO
# ================================================

Write-Host ""
Write-Host "🧹 Passo 2: Limpando diretório remoto..." -ForegroundColor Cyan

$cleanCommand = @"
cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html && rm -rf * && rm -rf .htaccess && echo 'Limpo!'
"@

ssh "$VPS_USER@$VPS_HOST" $cleanCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao limpar diretório remoto!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Diretório limpo!" -ForegroundColor Green

# ================================================
# 3. UPLOAD DOS ARQUIVOS
# ================================================

Write-Host ""
Write-Host "📤 Passo 3: Enviando arquivos..." -ForegroundColor Cyan

scp -r dist/* "$VPS_USER@${VPS_HOST}:$REMOTE_PATH/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no upload!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Arquivos enviados!" -ForegroundColor Green

# ================================================
# 4. CRIAR .HTACCESS
# ================================================

Write-Host ""
Write-Host "⚙️  Passo 4: Configurando .htaccess..." -ForegroundColor Cyan

$htaccessContent = @'
# RS WalletPay - SPA Configuration
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
Options -Indexes
'@

# Salvar .htaccess temporário
$htaccessContent | Out-File -FilePath "dist/.htaccess" -Encoding ASCII

# Upload do .htaccess
scp "dist/.htaccess" "$VPS_USER@${VPS_HOST}:$REMOTE_PATH/.htaccess"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao criar .htaccess!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ .htaccess configurado!" -ForegroundColor Green

# ================================================
# 5. AJUSTAR PERMISSÕES
# ================================================

Write-Host ""
Write-Host "🔒 Passo 5: Ajustando permissões..." -ForegroundColor Cyan

$permCommand = @"
cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html && find . -type f -exec chmod 644 {} \; && find . -type d -exec chmod 755 {} \; && chmod 644 .htaccess && echo 'Permissões OK!'
"@

ssh "$VPS_USER@$VPS_HOST" $permCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao ajustar permissões!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Permissões ajustadas!" -ForegroundColor Green

# ================================================
# 6. VERIFICAR DEPLOY
# ================================================

Write-Host ""
Write-Host "🔍 Passo 6: Verificando deploy..." -ForegroundColor Cyan

$verifyCommand = @"
cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html && ls -lah && echo '' && du -sh .
"@

ssh "$VPS_USER@$VPS_HOST" $verifyCommand

# ================================================
# FINALIZADO
# ================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URL: https://walletpay.rsprolipsi.com.br" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Acesse a URL acima"
Write-Host "  2. Faça login com suas credenciais"
Write-Host "  3. Teste todas as funcionalidades"
Write-Host ""
Write-Host "💛🖤 RS PRÓLIPSI - WALLETPAY ONLINE!" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Green
