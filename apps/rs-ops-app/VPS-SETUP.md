# 🖥️ VPS - CONFIGURAÇÃO COMPLETA

**Provedor:** Hostinger VPS  
**Servidor:** srv990916.hstgr.cloud  
**IP:** 72.60.144.245  
**OS:** Ubuntu 24.04 LTS  
**Type:** KVM 2

---

## 🔑 CREDENCIAIS

```bash
# SSH Root Access
ssh root@72.60.144.245
Password: Yannis784512@

# Hostname
srv990916.hstgr.cloud
```

---

## 📦 SOFTWARE INSTALADO

```bash
# Node.js
node -v  # v18.x ou superior

# PM2
pm2 -v

# Nginx
nginx -v

# Certbot (Let's Encrypt)
certbot --version

# PostgreSQL Client (opcional)
psql --version
```

---

## 🚀 DEPLOY INICIAL

### 1. Primeira Configuração

```bash
# Conectar via SSH
ssh root@72.60.144.245

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar PM2 Global
npm install -g pm2

# Instalar Nginx
apt install -y nginx

# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Criar diretório do projeto
mkdir -p /var/www/rs-prolipsi
cd /var/www/rs-prolipsi
```

### 2. Clonar Repositório

```bash
# Instalar Git (se necessário)
apt install -y git

# Configurar Git
git config --global user.name "Roberto Camargo"
git config --global user.email "rsprolipsioficial@gmail.com"

# Clonar projeto (SSH ou HTTPS)
git clone https://github.com/seu-usuario/rs-prolipsi.git .
# OU
git clone git@github.com:seu-usuario/rs-prolipsi.git .
```

### 3. Configurar Módulos

```bash
# RS-API
cd /var/www/rs-prolipsi/rs-api
cp .env.example .env
nano .env  # Configurar credenciais
npm install
npm run build

# RS-OPS
cd /var/www/rs-prolipsi/rs-ops
cp .env.example .env
nano .env  # Configurar credenciais
npm install
npm run build

# RS-CONFIG
cd /var/www/rs-prolipsi/rs-config
npm install
npm run build
```

### 4. Configurar PM2

```bash
# RS-API
cd /var/www/rs-prolipsi/rs-api
pm2 start ecosystem.config.js

# RS-OPS
cd /var/www/rs-prolipsi/rs-ops
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save

# Auto-start PM2 no boot
pm2 startup
# Executar o comando que aparecer
```

### 5. Configurar Nginx

```bash
# Criar config para API
nano /etc/nginx/sites-available/rsprolipsi-api

# Conteúdo:
server {
    listen 80;
    server_name api.rsprolipsi.com.br;

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

# Habilitar site
ln -s /etc/nginx/sites-available/rsprolipsi-api /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

### 6. Configurar SSL (HTTPS)

```bash
# Certificado Let's Encrypt
certbot --nginx -d api.rsprolipsi.com.br

# Testar renovação automática
certbot renew --dry-run

# Criar CRON para renovação (caso não exista)
crontab -e

# Adicionar linha:
0 0 1 * * /usr/bin/certbot renew --quiet && /usr/bin/systemctl reload nginx
```

---

## 📊 MONITORAMENTO

### PM2 Dashboard

```bash
# Ver status de todos os processos
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs de um processo específico
pm2 logs rs-api

# Ver métricas
pm2 monit

# Ver dashboard web (instalar)
pm2 install pm2-server-monit
```

### Nginx Logs

```bash
# Acessar logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Sistema

```bash
# CPU e Memória
htop

# Disco
df -h

# Uptime
uptime
```

---

## 🔄 DEPLOY CONTÍNUO

### Via GitHub Actions (já configurado)

```yaml
# .github/workflows/deploy.yml
# Push para main → Deploy automático
```

### Deploy Manual

```bash
# Conectar VPS
ssh root@72.60.144.245

# Navegar para projeto
cd /var/www/rs-prolipsi

# Atualizar código
git pull origin main

# Atualizar dependências
cd rs-api && npm install && npm run build
cd ../rs-ops && npm install && npm run build

# Reiniciar serviços
pm2 restart all

# Recarregar Nginx (se necessário)
nginx -t && nginx -s reload
```

---

## 🛡️ SEGURANÇA

### Firewall (UFW)

```bash
# Habilitar UFW
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Verificar status
ufw status
```

### Fail2Ban

```bash
# Instalar
apt install -y fail2ban

# Configurar
systemctl enable fail2ban
systemctl start fail2ban
```

### Atualizar Senhas

```bash
# Senha root
passwd

# Criar usuário não-root (recomendado)
adduser deploy
usermod -aG sudo deploy
```

---

## 🔧 TROUBLESHOOTING

### Serviço não inicia

```bash
# Ver logs do PM2
pm2 logs rs-api --lines 100

# Ver logs do sistema
journalctl -xe

# Reiniciar PM2
pm2 restart all
pm2 reload all
```

### Erro no Nginx

```bash
# Testar configuração
nginx -t

# Ver logs
tail -f /var/log/nginx/error.log

# Reiniciar
systemctl restart nginx
```

### Banco de dados não conecta

```bash
# Verificar .env
cat /var/www/rs-prolipsi/rs-ops/.env | grep SUPABASE

# Testar conexão
curl https://rptkhrboejbwexseikuo.supabase.co

# Verificar firewall
ufw status
```

---

## 📞 COMANDOS ÚTEIS

```bash
# Reiniciar tudo
pm2 restart all && systemctl restart nginx

# Limpar logs PM2
pm2 flush

# Backup de .env
cp /var/www/rs-prolipsi/rs-ops/.env ~/backup-env-$(date +%Y%m%d).txt

# Ver portas em uso
netstat -tulpn | grep LISTEN

# Ver processos Node
ps aux | grep node
```

---

## ✅ CHECKLIST PÓS-DEPLOY

- [ ] API responde em http://72.60.144.245:8080
- [ ] API responde em https://api.rsprolipsi.com.br
- [ ] PM2 mostra rs-api como "online"
- [ ] PM2 mostra rs-ops como "online"
- [ ] CRONs estão agendados (`pm2 logs rs-ops`)
- [ ] SSL certificado válido (`curl https://api...`)
- [ ] Logs sendo gerados sem erros
- [ ] Dashboard acessível
- [ ] GitHub Actions rodou com sucesso

---

**Última Atualização:** 06/11/2025  
💛🖤 **RS PRÓLIPSI**
