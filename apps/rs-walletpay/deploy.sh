#!/bin/bash

# ================================================
# SCRIPT DE DEPLOY - RS WALLETPAY
# ================================================

echo "🚀 Iniciando deploy do RS WalletPay..."
echo "================================================"

# Variáveis
VPS_HOST="191.252.92.55"
VPS_USER="u172569559"
REMOTE_PATH="/home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html"
LOCAL_PATH="."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ================================================
# 1. BUILD LOCAL
# ================================================

echo ""
echo "${YELLOW}📦 Passo 1: Build de produção...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erro no build!${NC}"
    exit 1
fi

echo "${GREEN}✅ Build concluído!${NC}"

# ================================================
# 2. LIMPAR DIRETÓRIO REMOTO
# ================================================

echo ""
echo "${YELLOW}🧹 Passo 2: Limpando diretório remoto...${NC}"

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html
rm -rf *
rm -rf .htaccess
echo "✅ Diretório limpo!"
EOF

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erro ao limpar diretório remoto!${NC}"
    exit 1
fi

echo "${GREEN}✅ Diretório limpo!${NC}"

# ================================================
# 3. UPLOAD DOS ARQUIVOS
# ================================================

echo ""
echo "${YELLOW}📤 Passo 3: Enviando arquivos...${NC}"

# Upload da pasta dist/
scp -r dist/* ${VPS_USER}@${VPS_HOST}:${REMOTE_PATH}/

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erro no upload!${NC}"
    exit 1
fi

echo "${GREEN}✅ Arquivos enviados!${NC}"

# ================================================
# 4. CRIAR .HTACCESS PARA SPA
# ================================================

echo ""
echo "${YELLOW}⚙️  Passo 4: Configurando .htaccess...${NC}"

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html

cat > .htaccess << 'HTACCESS'
# RS WalletPay - SPA Configuration

# Enable Rewrite Engine
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # HTTPS Redirect
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # SPA Fallback - Redirect all to index.html
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
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
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "no-referrer-when-downgrade"
</IfModule>

# Disable Directory Listing
Options -Indexes

# Protect .htaccess
<Files .htaccess>
    Order allow,deny
    Deny from all
</Files>
HTACCESS

echo "✅ .htaccess criado!"
EOF

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erro ao criar .htaccess!${NC}"
    exit 1
fi

echo "${GREEN}✅ .htaccess configurado!${NC}"

# ================================================
# 5. AJUSTAR PERMISSÕES
# ================================================

echo ""
echo "${YELLOW}🔒 Passo 5: Ajustando permissões...${NC}"

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod 644 .htaccess
echo "✅ Permissões ajustadas!"
EOF

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erro ao ajustar permissões!${NC}"
    exit 1
fi

echo "${GREEN}✅ Permissões ajustadas!${NC}"

# ================================================
# 6. VERIFICAR DEPLOY
# ================================================

echo ""
echo "${YELLOW}🔍 Passo 6: Verificando deploy...${NC}"

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html
echo "Arquivos no servidor:"
ls -lah
echo ""
echo "Tamanho total:"
du -sh .
EOF

# ================================================
# FINALIZADO
# ================================================

echo ""
echo "================================================"
echo "${GREEN}✅ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo "================================================"
echo ""
echo "🌐 URL: ${GREEN}https://walletpay.rsprolipsi.com.br${NC}"
echo ""
echo "📊 Próximos passos:"
echo "  1. Acesse a URL acima"
echo "  2. Faça login com suas credenciais"
echo "  3. Teste todas as funcionalidades"
echo ""
echo "💛🖤 RS PRÓLIPSI - WALLETPAY ONLINE!"
echo "================================================"
