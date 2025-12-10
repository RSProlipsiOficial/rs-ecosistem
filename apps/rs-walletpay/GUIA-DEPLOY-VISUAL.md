# 🎯 GUIA VISUAL DE DEPLOY - RS WALLETPAY

**Objetivo:** Substituir a página "EM DESENVOLVIMENTO" pelo painel completo

---

## 📸 SITUAÇÃO ATUAL

```
🌐 https://walletpay.rsprolipsi.com.br

┌─────────────────────────────────────┐
│                                     │
│         💛 🖤                        │
│     RS PRÓLIPSI                     │
│      WALLETPAY                      │
│                                     │
│  ⚙️ EM DESENVOLVIMENTO ⚙️           │
│                                     │
│  Módulo: WALLETPAY                  │
│  Status: Configuração em andamento  │
│  Versão: 1.0.0                      │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎯 SITUAÇÃO DESEJADA

```
🌐 https://walletpay.rsprolipsi.com.br

┌─────────────────────────────────────────────────────┐
│  [Logo] RS WalletPay            🔔 👤 Roberto       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 DASHBOARD                                       │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Saldo    │ │ Entradas │ │ Saídas   │           │
│  │ R$ 5.420 │ │ R$ 2.100 │ │ R$ 850   │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  📈 Gráfico de Transações                          │
│  ┌─────────────────────────────────────┐           │
│  │     ╱╲                               │           │
│  │    ╱  ╲    ╱╲                        │           │
│  │   ╱    ╲  ╱  ╲                       │           │
│  │  ╱      ╲╱    ╲                      │           │
│  └─────────────────────────────────────┘           │
│                                                     │
│  📋 Últimas Transações                             │
│  • Depósito PIX - R$ 500,00                        │
│  • Saque - R$ 200,00                               │
│  • Transferência - R$ 150,00                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 PROCESSO DE DEPLOY

### PASSO 1: Preparar Arquivos Localmente
```
📁 rs-walletpay/
├── components/ (10 arquivos)
├── pages/ (15 arquivos)
├── src/
└── ...

↓ npm run build

📁 dist/
├── index.html
├── assets/
│   ├── index-abc123.js
│   └── index-abc123.css
└── ...
```

### PASSO 2: Limpar Servidor
```
🗑️ Remover página "EM DESENVOLVIMENTO"

ssh u172569559@191.252.92.55
cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html
rm -rf *
```

### PASSO 3: Enviar Novos Arquivos
```
📤 Upload via SCP

Local (dist/)  →  Servidor (public_html/)
├── index.html     ├── index.html
├── assets/        ├── assets/
└── ...            └── ...
```

### PASSO 4: Configurar .htaccess
```
⚙️ Criar .htaccess para SPA

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### PASSO 5: Ajustar Permissões
```
🔒 Permissões corretas

Arquivos: 644
Pastas: 755
```

---

## 🚀 EXECUTAR AGORA

### Opção 1: Script Automático (RECOMENDADO)

```powershell
cd "G:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack\rs-walletpay"

# Executar deploy
.\deploy-windows.ps1
```

### Opção 2: Passo a Passo Manual

```powershell
# 1. Build
npm run build

# 2. Limpar servidor
ssh u172569559@191.252.92.55 "cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html && rm -rf *"

# 3. Upload
scp -r dist/* u172569559@191.252.92.55:/home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html/

# 4. Criar .htaccess
# (ver COMANDOS-DEPLOY.md)

# 5. Ajustar permissões
ssh u172569559@191.252.92.55 "cd /home/u172569559/domains/walletpay.rsprolipsi.com.br/public_html && find . -type f -exec chmod 644 {} \;"
```

---

## ✅ VERIFICAR RESULTADO

### 1. Abrir no Navegador:
```
https://walletpay.rsprolipsi.com.br
```

### 2. Deve aparecer:
- ✅ Página de Login
- ✅ Design Dark + Gold
- ✅ Logo RS Prólipsi
- ✅ Campos de email e senha

### 3. Após Login:
- ✅ Dashboard com KPIs
- ✅ Menu lateral funcionando
- ✅ Todas as rotas acessíveis
- ✅ Gráficos carregando

---

## 🎨 PÁGINAS DISPONÍVEIS

Após o deploy, estas páginas estarão acessíveis:

```
/login                    → Login
/register                 → Cadastro
/app/dashboard            → Dashboard
/app/transactions         → Transações
/app/payments/cobrancas   → Cobranças
/app/payments/links       → Links de Pagamento
/app/payments/saques      → Saques
/app/payments/transferencias → Transferências
/app/sales                → Hub de Vendas
/app/marketing            → Hub de Marketing
/app/cards                → Cartões
/app/reports              → Relatórios
/app/network              → Minha Rede
/app/settings             → Configurações
```

---

## 🔍 TROUBLESHOOTING

### Problema: Página em branco
**Solução:** Verificar console do navegador (F12)

### Problema: CSS não carrega
**Solução:** Limpar cache (Ctrl+Shift+R)

### Problema: Erro 404 nas rotas
**Solução:** Verificar .htaccess no servidor

### Problema: Não conecta com API
**Solução:** Verificar variáveis de ambiente (.env)

---

## 💛🖤 RESULTADO FINAL

```
ANTES:
❌ Página "EM DESENVOLVIMENTO"
❌ Sem funcionalidades
❌ Apenas placeholder

DEPOIS:
✅ Sistema completo funcionando
✅ 15 páginas acessíveis
✅ Login e autenticação
✅ Dashboard com dados reais
✅ Integração com API
✅ Design profissional
```

---

## 📊 TEMPO ESTIMADO

- Build local: ~2 minutos
- Upload: ~1 minuto
- Configuração: ~30 segundos
- **TOTAL: ~4 minutos**

---

**PRONTO PARA DEPLOY!** 🚀

Execute o script e em 4 minutos o painel estará online!
