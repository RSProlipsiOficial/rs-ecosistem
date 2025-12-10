# 🚀 INSTRUÇÕES DE UPLOAD - RS WALLETPAY

O build está pronto! Agora você precisa fazer o upload para o servidor.

---

## ✅ OPÇÃO 1: SCRIPT PYTHON (RECOMENDADO)

Execute no terminal:

```bash
cd "G:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack\rs-walletpay"
python upload-ftp.py
```

Vai pedir a senha FTP e fazer tudo automaticamente!

---

## ✅ OPÇÃO 2: FILEZILLA/WINSCP

### FileZilla:
1. Abrir FileZilla
2. **Host:** ftp.rsprolipsi.com.br (ou 191.252.92.55)
3. **Usuário:** u172569559
4. **Senha:** [sua senha]
5. **Porta:** 21 (FTP) ou 22 (SFTP)

### Ações:
1. Navegar até: `/domains/walletpay.rsprolipsi.com.br/public_html/`
2. **Deletar tudo** que está lá
3. Fazer upload de **tudo** que está em `dist/`

---

## ✅ OPÇÃO 3: PAINEL HOSTINGER

1. Acessar: https://hpanel.hostinger.com
2. Ir em **"Gerenciador de Arquivos"**
3. Navegar até: `walletpay.rsprolipsi.com.br/public_html/`
4. **Deletar tudo**
5. Clicar em **"Upload"**
6. Selecionar todos os arquivos de `dist/`
7. Aguardar upload

---

## 📁 ARQUIVOS PARA UPLOAD

Tudo que está em:
```
G:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack\rs-walletpay\dist\
```

**Conteúdo:**
- index.html (2.69 KB)
- assets/
  - index-BM0HujIG.js (697.31 KB)

---

## ⚙️ CRIAR .HTACCESS

Depois do upload, criar um arquivo `.htaccess` no servidor com:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

---

## 🔍 VERIFICAR

Depois do upload, acesse:
```
https://walletpay.rsprolipsi.com.br
```

Deve aparecer a página de login do WalletPay! 🎉

---

## 💛🖤 PRONTO!

O painel completo vai substituir a página "EM DESENVOLVIMENTO"!
