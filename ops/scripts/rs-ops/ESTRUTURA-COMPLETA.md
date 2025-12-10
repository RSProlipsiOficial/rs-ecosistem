# ⚙️ RS PRÓLIPSI - OPS

## Estrutura Completa do Motor Operacional

**Versão:** 2.0.0 (Expandida)  
**Data:** Novembro 2025

---

## 📁 Árvore de Diretórios

```
rs-ops/
├── src/
│   ├── core/                    # Lógica de negócio principal
│   │   ├── cycles/              # ✅ Gerenciamento de ciclos
│   │   │   ├── closeCycle.ts
│   │   │   ├── openCycle.ts
│   │   │   └── reentryCycle.ts
│   │   ├── distribution/        # ✅ Cálculo e pagamento
│   │   │   ├── calculateBonus.ts
│   │   │   ├── payDepth.ts
│   │   │   ├── payFidelity.ts
│   │   │   └── payTopSigma.ts
│   │   └── validation/          # ✅ Validações
│   │       ├── checkActive.ts
│   │       ├── checkReentry.ts
│   │       └── checkQualified.ts
│   │
│   ├── crons/                   # ✅ Agendamentos automáticos
│   │   ├── activateMatriz.ts    # 1º dia 00:00
│   │   ├── resetMonthlyCounters.ts  # 1º dia 00:10
│   │   ├── payFidelityPool.ts   # Segunda 02:00
│   │   └── payTopSigmaPool.ts   # 1º dia 03:00
│   │
│   ├── jobs/                    # ✅ Manutenção e rotinas
│   │   ├── recalcBonuses.ts
│   │   ├── updateRanks.ts
│   │   ├── cleanLogs.ts
│   │   └── backupWallets.ts
│   │
│   ├── monitors/                # ✅ Monitoramento
│   │   ├── checkVPS.ts
│   │   ├── checkAPI.ts
│   │   ├── checkSupabase.ts
│   │   ├── checkWalletPay.ts
│   │   └── alertDiscord.ts
│   │
│   ├── deploy/                  # ✅ CI/CD e automação
│   │   ├── postDeploy.sh
│   │   ├── sslRenew.sh
│   │   └── reloadServices.sh
│   │
│   ├── services/                # ✅ Integrações
│   │   ├── supabaseService.ts
│   │   ├── walletService.ts
│   │   └── notificationService.ts
│   │
│   ├── utils/                   # ✅ Utilitários
│   │   ├── log.ts
│   │   ├── math.ts
│   │   └── format.ts
│   │
│   └── index.ts                 # ✅ Orquestrador principal
│
├── public/                      # ✅ Dashboard e status
│   ├── metrics.html             # Dashboard visual
│   ├── ops-status.json          # Status em JSON
│   └── readme.md
│
├── .github/                     # ✅ GitHub Actions
│   └── workflows/
│       └── deploy.yml
│
├── logs/                        # Logs (criados em runtime)
│   ├── ops.log
│   ├── cron.log
│   └── errors.log
│
├── package.json                 # ✅ Dependências
├── tsconfig.json                # ✅ Config TypeScript
├── ecosystem.config.js          # ✅ Config PM2
├── .env.example                 # ✅ Template env
├── README.md                    # ✅ Documentação
├── CONFORMIDADE-REVISAO.md      # ✅ Relatório validação
└── ESTRUTURA-COMPLETA.md        # ✅ Este arquivo
```

---

## 🔁 CRONS - Agendamentos Automáticos

### **activateMatriz.ts**
**Executa:** Todo dia 1º às 00:00  
**Função:** Reativa matrizes mensalmente

```typescript
cron.schedule('0 0 1 * *', async () => {
  // 1. Buscar matrizes ativas
  // 2. Resetar contadores mensais
  // 3. Reativar matrizes pausadas
  // 4. Enviar notificações
});
```

### **resetMonthlyCounters.ts**
**Executa:** Todo dia 1º às 00:10  
**Função:** Zera contadores de reentradas (máx 10/mês)

### **payFidelityPool.ts**
**Executa:** Toda segunda-feira às 02:00  
**Função:** Distribui pool de fidelidade semanal

### **payTopSigmaPool.ts**
**Executa:** Todo dia 1º às 03:00  
**Função:** Distribui pool Top SIGMA entre Top 10

---

## ⚙️ JOBS - Tarefas de Manutenção

### **recalcBonuses.ts**
Revalida todos os bônus do período

```bash
npm run job:recalc
```

### **updateRanks.ts**
Atualiza plano de carreira e graduações

```bash
npm run job:ranks
```

### **cleanLogs.ts**
Limpa logs com mais de 30 dias

```bash
npm run job:cleanup
```

### **backupWallets.ts**
Faz snapshot de todas as carteiras

```bash
npm run job:backup
```

---

## 🧠 MONITORS - Monitoramento

### **checkVPS.ts**
Verifica saúde do servidor

```typescript
interface VPSHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}
```

### **checkAPI.ts**
Testa endpoint `/health` da API

### **checkSupabase.ts**
Verifica conexão com Supabase

### **checkWalletPay.ts**
Testa API do WalletPay

### **alertDiscord.ts / alertTelegram.ts**
Envia alertas críticos

---

## 🚀 DEPLOY - CI/CD

### **GitHub Actions** (`.github/workflows/deploy.yml`)
Deploy automático ao fazer push para `main` ou `production`

```yaml
on:
  push:
    branches:
      - main
      - production
```

### **postDeploy.sh**
Script executado após deploy

```bash
npm install --production
npm run build
pm2 restart rs-ops
pm2 save
```

### **sslRenew.sh**
Renova certificados Let's Encrypt

```bash
certbot renew --quiet
nginx -t && nginx -s reload
```

### **reloadServices.sh**
Reinicia Nginx e PM2

---

## 🌐 PUBLIC - Dashboard

### **metrics.html**
Dashboard visual com métricas em tempo real

**Acesso:** `http://seu-servidor/metrics.html`

**Mostra:**
- Status VPS, API, Supabase, WalletPay
- Uptime e performance
- Logs recentes
- Status dos CRONs

### **ops-status.json**
API JSON com status atual

```json
{
  "timestamp": "2025-11-06T19:00:00.000Z",
  "status": "operational",
  "services": { ... },
  "crons": { ... },
  "jobs": { ... }
}
```

---

## 📦 DEPENDÊNCIAS

### **Produção:**
- `@supabase/supabase-js` - Conexão Supabase
- `dotenv` - Variáveis de ambiente
- `node-cron` - Agendamento de tarefas

### **Desenvolvimento:**
- `@types/node` - Tipos TypeScript
- `@types/node-cron` - Tipos do node-cron
- `ts-node` - Execução TypeScript
- `ts-node-dev` - Hot reload
- `typescript` - Compilador

---

## 🛠️ SCRIPTS DISPONÍVEIS

### **Desenvolvimento:**
```bash
npm run dev           # Inicia com hot reload
```

### **Produção:**
```bash
npm run build         # Compila TypeScript
npm start             # Executa compilado
npm run start:pm2     # Inicia com PM2
```

### **Jobs Manuais:**
```bash
npm run job:recalc    # Recalcula bônus
npm run job:ranks     # Atualiza rankings
npm run job:cleanup   # Limpa logs
npm run job:backup    # Backup carteiras
```

### **Deploy:**
```bash
npm run deploy        # Deploy manual
npm run ssl:renew     # Renova SSL
```

---

## ⚡ PM2 - Gerenciamento

### **Configuração** (`ecosystem.config.js`)

```javascript
{
  name: 'rs-ops',
  script: './dist/index.js',
  instances: 1,
  max_memory_restart: '500M',
  autorestart: true,
  error_file: './logs/pm2-error.log',
  out_file: './logs/pm2-out.log'
}
```

### **Comandos:**
```bash
pm2 start ecosystem.config.js   # Inicia
pm2 restart rs-ops              # Reinicia
pm2 stop rs-ops                 # Para
pm2 logs rs-ops                 # Logs
pm2 status                      # Status
```

---

## 🔐 VARIÁVEIS DE AMBIENTE

```env
# Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Discord/Telegram (Alertas)
DISCORD_WEBHOOK_URL=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# API
API_URL=http://localhost:8080

# WalletPay
WALLETPAY_API_URL=...
WALLETPAY_API_KEY=...
```

---

## 📊 WORKFLOW COMPLETO

### **1. Deploy**
```
GitHub Push → Actions → SSH VPS → Deploy Script → PM2 Restart
```

### **2. CRONs Automáticos**
```
00:00 1º dia → Ativa matrizes
00:10 1º dia → Reset contadores
02:00 Segunda → Pool Fidelidade
03:00 1º dia → Pool Top SIGMA
```

### **3. Monitoramento**
```
Check VPS → Check API → Check Supabase → Check WalletPay
     ↓
Atualiza ops-status.json
     ↓
Dashboard (metrics.html)
     ↓
Se erro → Discord/Telegram Alert
```

---

## ✅ STATUS DOS ARQUIVOS

| Componente | Arquivos | Status |
|------------|----------|--------|
| **Core** | 10 | ✅ 100% |
| **CRONs** | 4 | ✅ 100% |
| **Jobs** | 4 | ✅ 100% |
| **Monitors** | 5 | ✅ 100% |
| **Deploy** | 3 | ✅ 100% |
| **Services** | 3 | ✅ 100% |
| **Utils** | 3 | ✅ 100% |
| **Public** | 3 | ✅ 100% |
| **Config** | 5 | ✅ 100% |
| **TOTAL** | **40** | ✅ **100%** |

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Instalar dependências: `npm install`
2. ✅ Configurar `.env` com credenciais
3. ✅ Testar localmente: `npm run dev`
4. ✅ Build: `npm run build`
5. ✅ Deploy em VPS
6. ✅ Configurar PM2
7. ✅ Configurar GitHub Actions
8. ✅ Monitorar dashboard

---

**Versão:** 2.0.0 - Estrutura Completa  
**Status:** ✅ Pronto para Produção  
**Data:** Novembro 2025

💛🖤 **RS PRÓLIPSI - Transformando Vidas!**
