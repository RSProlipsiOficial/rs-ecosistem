#!/bin/bash
# ================================================
# RS PRÓLIPSI - DEPLOY COMPLETO NO VPS
# Execute este script no VPS após conectar via SSH
# ================================================
# VPS: 72.60.144.245
# User: root
# Senha: Yannis784512@
# ================================================

echo "🚀 RS PRÓLIPSI - Deploy Iniciando..."
echo "================================================"

# 1. Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar Node.js 18 (se não tiver)
echo "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar versão
node -v
npm -v

# 3. Instalar PM2 global
echo "📦 Instalando PM2..."
npm install -g pm2

# 4. Instalar Git (se não tiver)
echo "📦 Instalando Git..."
apt install -y git

# 5. Criar diretório do projeto
echo "📁 Criando diretórios..."
mkdir -p /var/www/rs-prolipsi
cd /var/www/rs-prolipsi

# 6. Clonar ou atualizar projeto
echo "📥 Baixando projeto..."
# Se você tem o projeto no Git:
# git clone https://github.com/seu-usuario/rs-prolipsi.git .

# OU copiar os arquivos manualmente via SCP/SFTP

# 7. Instalar dependências - rs-api
echo "📦 Instalando dependências rs-api..."
cd /var/www/rs-prolipsi/rs-api
npm install

# 8. Instalar dependências - rs-ops
echo "📦 Instalando dependências rs-ops..."
cd /var/www/rs-prolipsi/rs-ops
npm install

# 9. Instalar dependências - rs-config
echo "📦 Instalando dependências rs-config..."
cd /var/www/rs-prolipsi/rs-config
npm install

# 10. Build TypeScript
echo "🔨 Compilando TypeScript..."
cd /var/www/rs-prolipsi/rs-api
npm run build

cd /var/www/rs-prolipsi/rs-ops
npm run build

cd /var/www/rs-prolipsi/rs-config
npm run build

# 11. Configurar variáveis de ambiente
echo "⚙️ Configurando .env..."

# rs-api/.env
cat > /var/www/rs-prolipsi/rs-api/.env << 'EOF'
NODE_ENV=production
PORT=8080

# Supabase
SUPABASE_URL=https://rptkhrboejbwexseikuo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo

# CORS
CORS_ORIGIN=*

# JWT
JWT_SECRET=rs-prolipsi-secret-change-in-production
EOF

# rs-ops/.env
cat > /var/www/rs-prolipsi/rs-ops/.env << 'EOF'
NODE_ENV=production
PORT=3100

# Supabase
SUPABASE_URL=https://rptkhrboejbwexseikuo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo

# Jobs
ENABLE_DAILY_JOB=true
ENABLE_WEEKLY_JOB=true
ENABLE_MONTHLY_JOB=true
EOF

# 12. Iniciar com PM2
echo "🚀 Iniciando serviços com PM2..."

# rs-api
cd /var/www/rs-prolipsi/rs-api
pm2 start dist/index.js --name rs-api

# rs-ops
cd /var/www/rs-prolipsi/rs-ops
pm2 start dist/index.js --name rs-ops

# 13. Salvar configuração PM2
echo "💾 Salvando configuração PM2..."
pm2 save

# 14. Configurar PM2 para iniciar no boot
echo "🔄 Configurando auto-start..."
pm2 startup

# 15. Instalar Nginx (se não tiver)
echo "📦 Instalando Nginx..."
apt install -y nginx

# 16. Configurar Nginx para API
echo "⚙️ Configurando Nginx..."
cat > /etc/nginx/sites-available/rsprolipsi-api << 'EOF'
server {
    listen 80;
    server_name 72.60.144.245;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/rsprolipsi-api /etc/nginx/sites-enabled/

# Remover default
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx

# 17. Status final
echo "================================================"
echo "✅ Deploy completado!"
echo "================================================"
echo ""
echo "📊 Status dos serviços:"
pm2 status

echo ""
echo "🌐 API acessível em:"
echo "   http://72.60.144.245"
echo ""
echo "📝 Comandos úteis:"
echo "   pm2 logs          # Ver logs"
echo "   pm2 restart all   # Reiniciar tudo"
echo "   pm2 stop all      # Parar tudo"
echo "   pm2 monit         # Monitorar em tempo real"
echo ""
echo "💛🖤 RS PRÓLIPSI - ONLINE!"
