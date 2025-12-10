# 🚀 COMANDOS DE DEPLOY - RS WALLETPAY

**Domínio:** https://walletpay.rsprolipsi.com.br  
**Servidor:** 191.252.92.55  
**Usuário:** u172569559

---

## 📋 OPÇÃO 1: SCRIPT AUTOMÁTICO (RECOMENDADO)

### Windows (PowerShell):

```powershell
# Executar script de deploy
.\deploy-windows.ps1
```

### Linux/Mac (Bash):

```bash
# Dar permissão de execução
chmod +x deploy.sh

# Executar script de deploy
./deploy.sh
```

---

## 📋 OPÇÃO 2: COMANDOS MANUAIS

### 1. Build Local:

```bash
npm run build
```

### 2. Limpar Servidor:

```bash
ssh u172569559@191.252.92.55 "cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html && rm -rf * && rm -rf .htaccess"
```

### 3. Upload dos Arquivos:

```bash
scp -r dist/* u172569559@191.252.92.55:/home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html/
```

### 4. Criar .htaccess no Servidor:

```bash
ssh u172569559@191.252.92.55 << 'EOF'
cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html

cat > .htaccess << 'HTACCESS'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
HTACCESS
EOF
```

### 5. Ajustar Permissões:

```bash
ssh u172569559@191.252.92.55 "cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html && find . -type f -exec chmod 644 {} \; && find . -type d -exec chmod 755 {} \;"
```

### 6. Verificar:

```bash
ssh u172569559@191.252.92.55 "cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html && ls -lah"
```

---

## 🔍 VERIFICAR DEPLOY

### Testar URL:

```bash
curl -I https://walletpay.rsprolipsi.com.br
```

### Ver Logs do Servidor:

```bash
ssh u172569559@191.252.92.55 "tail -f /home/u172569559/logs/walletpay.rsprolipsi.com.br.error.log"
```

---

## 🔄 ATUALIZAÇÃO RÁPIDA

Se só mudou código (sem dependências):

```bash
# Build
npm run build

# Upload
scp -r dist/* u172569559@191.252.92.55:/home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html/
```

---

## 🆘 TROUBLESHOOTING

### Erro de Permissão SSH:

```bash
# Verificar chave SSH
ssh-add -l

# Adicionar chave se necessário
ssh-add ~/.ssh/id_rsa
```

### Erro 404 nas Rotas:

Verificar se o `.htaccess` está correto:

```bash
ssh u172569559@191.252.92.55 "cat /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html/.htaccess"
```

### CSS Não Carrega:

Verificar permissões:

```bash
ssh u172569559@191.252.92.55 "ls -la /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html/assets/"
```

---

## 💛🖤 CHECKLIST FINAL

- [ ] Build executado com sucesso
- [ ] Arquivos enviados para o servidor
- [ ] .htaccess criado
- [ ] Permissões ajustadas
- [ ] URL acessível
- [ ] Login funcionando
- [ ] Rotas funcionando
- [ ] CSS carregando

---

**Pronto para deploy!** 🚀
