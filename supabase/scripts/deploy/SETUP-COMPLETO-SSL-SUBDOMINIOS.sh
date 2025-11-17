#!/bin/bash
# ================================================
# RS PRÓLIPSI - CONFIGURAÇÃO COMPLETA
# SSL + Páginas Estáticas para todos os subdomínios
# Domínio: rsprolipsi.com.br
# ================================================

DOMAIN="rsprolipsi.com.br"
IP="72.60.144.245"

# Lista de subdomínios
SUBDOMINIOS=(
  "admin"
  "api"
  "config"
  "core"
  "marketplace"
  "agendaviva"
  "logistica"
  "walletpay"
  "www"
  "logos"
  "escritorio"
  "studio"
  "robo"
  "rotafacil"
)

echo "🚀 RS PRÓLIPSI - Setup Completo Iniciando..."
echo "================================================"

# 1. Instalar Certbot
echo "📦 Instalando Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# 2. Criar diretório para páginas estáticas
echo "📁 Criando estrutura de diretórios..."
mkdir -p /var/www/rs-prolipsi/static

# 3. Criar página HTML estática (preto e dourado)
echo "🎨 Criando página estática..."
cat > /var/www/rs-prolipsi/static/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RS Prólipsi - {{MODULO}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFD700;
        }
        
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #FFD700;
            border-radius: 20px;
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
            max-width: 600px;
            animation: fadeIn 1s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .logo {
            font-size: 80px;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        h1 {
            font-size: 48px;
            margin-bottom: 10px;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            letter-spacing: 2px;
        }
        
        h2 {
            font-size: 28px;
            color: #FFA500;
            margin-bottom: 30px;
            font-weight: 300;
        }
        
        .status {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            margin-top: 20px;
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
        }
        
        .info {
            margin-top: 30px;
            padding: 20px;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 10px;
            font-size: 14px;
            color: #FFD700;
        }
        
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #888;
        }
        
        .sparkle {
            display: inline-block;
            animation: sparkle 1.5s infinite;
        }
        
        @keyframes sparkle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">💛🖤</div>
        <h1>RS PRÓLIPSI</h1>
        <h2>{{MODULO}}</h2>
        <div class="status">
            <span class="sparkle">✨</span> EM DESENVOLVIMENTO <span class="sparkle">✨</span>
        </div>
        <div class="info">
            <p><strong>Módulo:</strong> {{MODULO}}</p>
            <p><strong>Status:</strong> Configuração em andamento</p>
            <p><strong>Versão:</strong> 1.0.0</p>
        </div>
        <div class="footer">
            © 2025 RS Prólipsi - Todos os direitos reservados
        </div>
    </div>
</body>
</html>
HTMLEOF

# 4. Criar configurações Nginx para cada subdomínio
echo "⚙️ Configurando Nginx para todos os subdomínios..."

for SUB in "${SUBDOMINIOS[@]}"; do
    echo "📝 Configurando: $SUB.$DOMAIN"
    
    # Criar diretório específico
    mkdir -p /var/www/rs-prolipsi/$SUB
    
    # Copiar HTML e substituir nome do módulo
    MODULO_NOME=$(echo $SUB | tr '[:lower:]' '[:upper:]')
    sed "s/{{MODULO}}/$MODULO_NOME/g" /var/www/rs-prolipsi/static/index.html > /var/www/rs-prolipsi/$SUB/index.html
    
    # Criar configuração Nginx
    cat > /etc/nginx/sites-available/$SUB.$DOMAIN << NGINXEOF
server {
    listen 80;
    server_name $SUB.$DOMAIN;
    
    root /var/www/rs-prolipsi/$SUB;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
    
    # Logs
    access_log /var/log/nginx/$SUB.$DOMAIN.access.log;
    error_log /var/log/nginx/$SUB.$DOMAIN.error.log;
}
NGINXEOF
    
    # Ativar site
    ln -sf /etc/nginx/sites-available/$SUB.$DOMAIN /etc/nginx/sites-enabled/
    
done

# 5. Configurar domínio principal (www)
echo "📝 Configurando domínio principal..."
cat > /etc/nginx/sites-available/$DOMAIN << 'NGINXEOF'
server {
    listen 80;
    server_name rsprolipsi.com.br;
    
    root /var/www/rs-prolipsi/www;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# 6. Testar configuração Nginx
echo "🧪 Testando configuração Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração Nginx OK!"
    systemctl reload nginx
else
    echo "❌ Erro na configuração Nginx!"
    exit 1
fi

# 7. Configurar SSL com Certbot para TODOS os subdomínios
echo "🔒 Configurando SSL com Let's Encrypt..."

# Montar lista de domínios para o certificado
CERT_DOMAINS="-d $DOMAIN -d www.$DOMAIN"
for SUB in "${SUBDOMINIOS[@]}"; do
    CERT_DOMAINS="$CERT_DOMAINS -d $SUB.$DOMAIN"
done

# Obter certificado SSL
certbot --nginx $CERT_DOMAINS --non-interactive --agree-tos --email rsprolipsioficial@gmail.com --redirect

# 8. Configurar renovação automática
echo "🔄 Configurando renovação automática SSL..."
systemctl enable certbot.timer
systemctl start certbot.timer

# 9. Status final
echo "================================================"
echo "✅ CONFIGURAÇÃO COMPLETA!"
echo "================================================"
echo ""
echo "🌐 Domínios configurados:"
echo "   - https://$DOMAIN"
echo "   - https://www.$DOMAIN"
for SUB in "${SUBDOMINIOS[@]}"; do
    echo "   - https://$SUB.$DOMAIN"
done
echo ""
echo "🔒 SSL: Ativo (Let's Encrypt)"
echo "🔄 Renovação automática: Ativa"
echo ""
echo "📊 Verificar status:"
echo "   nginx -t"
echo "   systemctl status nginx"
echo "   certbot certificates"
echo ""
echo "💛🖤 RS PRÓLIPSI - ONLINE!"
