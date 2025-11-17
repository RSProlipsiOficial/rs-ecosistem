# 🔐 PASSO A PASSO - CONECTAR VIA SSH E IMPLANTAR

## ⏱️ Tempo total: 15-20 minutos

---

## 1️⃣ CONECTAR NO VPS VIA SSH

### Windows (PowerShell ou CMD):

```bash
ssh root@72.60.144.245
```

**Quando pedir senha:** `Yannis784512@`

✅ Você estará conectado no servidor!

---

## 2️⃣ OPÇÃO 1: EXECUTAR SCRIPT AUTOMÁTICO

### Copiar script para o VPS:

**No seu PC (PowerShell):**
```powershell
scp "G:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack\DEPLOY-VPS-COMANDOS.sh" root@72.60.144.245:/root/deploy.sh
```

**Senha:** `Yannis784512@`

### Executar no VPS:

**Via SSH (já conectado):**
```bash
chmod +x /root/deploy.sh
./root/deploy.sh
```

✅ Script instalará tudo automaticamente!

---

## 3️⃣ OPÇÃO 2: COMANDOS MANUAIS (Passo a passo)

Se preferir fazer manual, execute cada comando:

### 1. Atualizar sistema
```bash
apt update && apt upgrade -y
```

### 2. Instalar Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node -v
```

### 3. Instalar PM2
```bash
npm install -g pm2
```

### 4. Criar diretórios
```bash
mkdir -p /var/www/rs-prolipsi
cd /var/www/rs-prolipsi
```

### 5. Copiar projeto do PC para VPS

**No seu PC (outra janela PowerShell):**
```powershell
# Navegar até a pasta do projeto
cd "G:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack"

# Copiar rs-api
scp -r rs-api root@72.60.144.245:/var/www/rs-prolipsi/

# Copiar rs-ops
scp -r rs-ops root@72.60.144.245:/var/www/rs-prolipsi/

# Copiar rs-config
scp -r rs-config root@72.60.144.245:/var/www/rs-prolipsi/

# Copiar rs-core
scp -r rs-core root@72.60.144.245:/var/www/rs-prolipsi/
```

**Senha em cada comando:** `Yannis784512@`

### 6. Instalar dependências (no VPS via SSH)

```bash
# rs-api
cd /var/www/rs-prolipsi/rs-api
npm install

# rs-ops
cd /var/www/rs-prolipsi/rs-ops
npm install

# rs-config
cd /var/www/rs-prolipsi/rs-config
npm install
```

### 7. Criar arquivo .env (rs-api)

```bash
cat > /var/www/rs-prolipsi/rs-api/.env << 'EOF'
NODE_ENV=production
PORT=8080
SUPABASE_URL=https://rptkhrboejbwexseikuo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo
EOF
```

### 8. Iniciar com PM2

```bash
# rs-api
cd /var/www/rs-prolipsi/rs-api
pm2 start src/index.js --name rs-api

# rs-ops
cd /var/www/rs-prolipsi/rs-ops
pm2 start src/index.js --name rs-ops

# Salvar
pm2 save

# Auto-start
pm2 startup
```

### 9. Instalar e configurar Nginx

```bash
apt install -y nginx

cat > /etc/nginx/sites-available/rsprolipsi << 'EOF'
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
    }
}
EOF

ln -s /etc/nginx/sites-available/rsprolipsi /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## 4️⃣ VERIFICAR SE ESTÁ FUNCIONANDO

### No VPS (SSH):
```bash
pm2 status
pm2 logs
```

### No navegador:
```
http://72.60.144.245
```

Deve mostrar a API respondendo!

---

## 5️⃣ COMANDOS ÚTEIS

```bash
# Ver logs em tempo real
pm2 logs

# Reiniciar tudo
pm2 restart all

# Parar tudo
pm2 stop all

# Status dos processos
pm2 status

# Monitorar
pm2 monit

# Ver logs do Nginx
tail -f /var/log/nginx/error.log
```

---

## 🆘 TROUBLESHOOTING

### Se der erro "porta 8080 em uso":
```bash
# Ver o que está usando a porta
lsof -i :8080

# Matar o processo
kill -9 [PID]

# Reiniciar
pm2 restart rs-api
```

### Se der erro de permissão:
```bash
# Dar permissão aos arquivos
chmod -R 755 /var/www/rs-prolipsi
chown -R root:root /var/www/rs-prolipsi
```

### Se Nginx não iniciar:
```bash
# Ver erro
nginx -t

# Ver log
tail -f /var/log/nginx/error.log

# Reiniciar
systemctl restart nginx
```

---

## ✅ CHECKLIST FINAL

- [ ] Conectou via SSH ✅
- [ ] Node.js instalado ✅
- [ ] PM2 instalado ✅
- [ ] Projeto copiado para VPS ✅
- [ ] Dependências instaladas ✅
- [ ] .env configurado ✅
- [ ] PM2 rodando rs-api e rs-ops ✅
- [ ] Nginx configurado ✅
- [ ] API acessível no navegador ✅

---

💛🖤 **RS PRÓLIPSI - DEPLOY COMPLETO!**
