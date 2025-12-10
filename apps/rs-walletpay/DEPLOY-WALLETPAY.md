# 🚀 DEPLOY RS WALLETPAY

**Versão:** 1.0.0  
**Data:** 07/11/2025  
**Domínio:** walletpay.rsprolipsi.com.br

---

## 📋 PRÉ-REQUISITOS

✅ VPS Hostinger configurada  
✅ Nginx instalado  
✅ SSL (Certbot) configurado  
✅ Node.js 18+ instalado  
✅ PM2 instalado  

---

## 🔧 PASSO 1: INSTALAR DEPENDÊNCIAS

```bash
cd /var/www/rs-walletpay
npm install
```

---

## 🏗️ PASSO 2: BUILD DE PRODUÇÃO

```bash
npm run build
```

Isso vai gerar a pasta `dist/` com os arquivos otimizados.

---

## 🌐 PASSO 3: CONFIGURAR NGINX

Criar arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/walletpay.rsprolipsi.com.br
```

Conteúdo:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name walletpay.rsprolipsi.com.br;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name walletpay.rsprolipsi.com.br;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/walletpay.rsprolipsi.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/walletpay.rsprolipsi.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root directory
    root /var/www/rs-walletpay/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logs
    access_log /var/log/nginx/walletpay_access.log;
    error_log /var/log/nginx/walletpay_error.log;
}
```

---

## 🔗 PASSO 4: ATIVAR SITE

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/walletpay.rsprolipsi.com.br /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 🔒 PASSO 5: CONFIGURAR SSL

```bash
# Instalar certificado SSL
sudo certbot --nginx -d walletpay.rsprolipsi.com.br

# Renovação automática (já configurado)
sudo certbot renew --dry-run
```

---

## 📁 ESTRUTURA DE PASTAS

```
/var/www/rs-walletpay/
├── dist/                    # Build de produção
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── ...
├── src/
├── components/
├── pages/
├── package.json
├── vite.config.ts
└── .env
```

---

## 🔄 PASSO 6: ATUALIZAR APLICAÇÃO

Script de deploy automático:

```bash
#!/bin/bash
# deploy-walletpay.sh

echo "🚀 Iniciando deploy do RS WalletPay..."

# Ir para o diretório
cd /var/www/rs-walletpay

# Pull das alterações
git pull origin main

# Instalar dependências
npm install

# Build
npm run build

# Recarregar Nginx
sudo systemctl reload nginx

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Acesse: https://walletpay.rsprolipsi.com.br"
```

Tornar executável:

```bash
chmod +x deploy-walletpay.sh
```

---

## 🔍 PASSO 7: VERIFICAR DEPLOY

```bash
# Verificar status do Nginx
sudo systemctl status nginx

# Ver logs em tempo real
sudo tail -f /var/log/nginx/walletpay_access.log
sudo tail -f /var/log/nginx/walletpay_error.log

# Testar URL
curl -I https://walletpay.rsprolipsi.com.br
```

---

## 🎨 PASSO 8: CONECTAR COM API

Atualizar `.env` de produção:

```env
VITE_API_URL=https://api.rsprolipsi.com.br/api
VITE_SUPABASE_URL=https://rptkhrboejbwexseikuo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 📊 MONITORAMENTO

### Verificar performance:

```bash
# Tamanho dos arquivos
du -sh /var/www/rs-walletpay/dist

# Verificar compressão Gzip
curl -H "Accept-Encoding: gzip" -I https://walletpay.rsprolipsi.com.br
```

### Métricas esperadas:

- ✅ Tempo de carregamento: < 2s
- ✅ First Contentful Paint: < 1.5s
- ✅ Time to Interactive: < 3s
- ✅ Lighthouse Score: > 90

---

## 🔧 TROUBLESHOOTING

### Erro 404 nas rotas:

Verificar se o `try_files` está correto no Nginx.

### CSS não carrega:

Verificar se o Tailwind foi buildado corretamente:

```bash
npm run build
```

### API não conecta:

Verificar variáveis de ambiente no `.env`:

```bash
cat .env
```

---

## 💛🖤 CHECKLIST FINAL

- [ ] Build de produção criado
- [ ] Nginx configurado
- [ ] SSL ativo
- [ ] Domínio apontando
- [ ] Variáveis de ambiente configuradas
- [ ] Logs funcionando
- [ ] Performance otimizada
- [ ] Backup configurado

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Deploy completo
./deploy-walletpay.sh

# Rebuild apenas
cd /var/www/rs-walletpay && npm run build

# Restart Nginx
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/walletpay_error.log
```

---

**Deploy pronto para produção!** 🎉

**URL:** https://walletpay.rsprolipsi.com.br  
**Status:** ✅ PRONTO PARA SUBIR
