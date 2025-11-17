# 📦 LISTA COMPLETA DE ARQUIVOS PARA DEPLOY

**Versão:** Final
**Data:** 09/11/2024

---

## 📁 **ARQUIVOS NOVOS CRIADOS (13)**

### **Services (3)**
```
rs-api/src/services/
├── matrixService.js          ← Spillover + Compressão dinâmica
├── salesService.js           ← Vendas + Acumulador R$ 60
└── cycleEventListener.js     ← Supabase Realtime listener
```

### **Controllers (1)**
```
rs-api/src/controllers/
└── checkout.controller.js    ← Checkout integrado (pedido + pagamento + matriz)
```

### **Routes (1)**
```
rs-api/src/routes/
└── checkout.routes.js        ← Rotas de checkout unificado
```

### **SQL (1)**
```
rs-core/
└── TABELAS-COMPLEMENTARES.sql  ← 6 tabelas novas
```

### **Documentação (7)**
```
RS_Prolipsi_Full_Stack/
├── DEPLOY-COMPLETO-SISTEMA-SIGMA.md         ← Guia detalhado deploy
├── COMANDOS-RAPIDOS-DEPLOY.md               ← Comandos copy/paste
├── RESUMO-EXECUTIVO-IMPLEMENTACAO-SIGMA.md  ← Visão geral
├── INTEGRACAO-CHECKOUT-COMPLETA.md          ← Como usar checkout
├── PERGUNTAS-CRITICAS-PARA-IMPLEMENTAR.md   ← Análise requisitos
├── IMPLEMENTACAO-IMEDIATA-SEM-PERGUNTAS.md  ← Código pronto
└── LISTA-ARQUIVOS-PARA-DEPLOY.md            ← Este arquivo
```

---

## ✏️ **ARQUIVOS MODIFICADOS (3)**

### **Backend**
```
rs-api/server.js
├── Linha 83:  Adicionada rota /api/checkout
├── Linha 147: Adicionado log da rota
└── Linha 155: Listener auto-start

rs-api/src/routes/webhook.routes.js
└── Linhas 64-154: Completado processamento de pagamento

rs-api/src/controllers/marketplace.controller.js
└── Linhas 154-180: createOrder integrado com salesService
```

---

## 🗄️ **SQL PARA EXECUTAR NO SUPABASE (3 arquivos)**

### **1. Tabelas Base** (se não existir)
```
Arquivo: rs-core/EXECUTAR-NO-SUPABASE.sql
Cria: consultores, wallets, product_catalog, matriz_cycles, sales, etc
```

### **2. Tabelas Complementares** (NOVO)
```
Arquivo: rs-core/TABELAS-COMPLEMENTARES.sql
Cria:
  - orders (pedidos)
  - order_items (itens)
  - cycle_events (eventos)
  - payment_errors (logs)
  - downlines (rede)
  - matrix_accumulator (acumulador R$ 60)
```

### **3. Triggers e Views**
```
Arquivo: rs-core/VIEWS-E-TRIGGERS.sql
Cria:
  - trg_process_sale() - Venda → Matriz
  - trg_on_cycle_completed() - Ciclo → Pontos
  - trg_log_wallet_transaction() - Wallet → Log
  - vw_active_cycles - View de ciclos
  - vw_consultor_performance - View performance
  - vw_top_sigma_ranking - View ranking
```

---

## 🚀 **COMANDOS DE UPLOAD PARA VPS**

### **PowerShell (Windows):**

```powershell
# Ir para pasta do projeto:
cd "g:\Rs Prólipsi Oficial v.1 Roberto Camargo\RS_Prolipsi_Full_Stack\rs-api"

# 1. Upload pasta services (3 arquivos):
scp -r src\services root@72.60.144.245:/var/www/rs-api/src/

# 2. Upload checkout.controller.js:
scp src\controllers\checkout.controller.js root@72.60.144.245:/var/www/rs-api/src/controllers/

# 3. Upload checkout.routes.js:
scp src\routes\checkout.routes.js root@72.60.144.245:/var/www/rs-api/src/routes/

# 4. Upload marketplace.controller.js (modificado):
scp src\controllers\marketplace.controller.js root@72.60.144.245:/var/www/rs-api/src/controllers/

# 5. Upload webhook.routes.js (modificado):
scp src\routes\webhook.routes.js root@72.60.144.245:/var/www/rs-api/src/routes/

# 6. Upload server.js (modificado):
scp server.js root@72.60.144.245:/var/www/rs-api/
```

### **Bash (Linux/Mac):**

```bash
cd /caminho/para/rs-api

# Upload tudo de uma vez:
scp -r src/services/* root@72.60.144.245:/var/www/rs-api/src/services/
scp src/controllers/checkout.controller.js root@72.60.144.245:/var/www/rs-api/src/controllers/
scp src/routes/checkout.routes.js root@72.60.144.245:/var/www/rs-api/src/routes/
scp src/controllers/marketplace.controller.js root@72.60.144.245:/var/www/rs-api/src/controllers/
scp src/routes/webhook.routes.js root@72.60.144.245:/var/www/rs-api/src/routes/
scp server.js root@72.60.144.245:/var/www/rs-api/
```

---

## 📋 **CHECKLIST PRÉ-DEPLOY**

### **Supabase (10 min)**
- [ ] SQL 1: EXECUTAR-NO-SUPABASE.sql
- [ ] SQL 2: TABELAS-COMPLEMENTARES.sql
- [ ] SQL 3: VIEWS-E-TRIGGERS.sql
- [ ] Verificar 17+ tabelas criadas
- [ ] Habilitar Realtime em `cycle_events`

### **Variáveis de Ambiente (5 min)**
- [ ] `.env` tem `SUPABASE_URL`
- [ ] `.env` tem `SUPABASE_SERVICE_KEY`
- [ ] `.env` tem `MP_ACCESS_TOKEN`
- [ ] `.env` tem `PORT=8080`

### **Upload Arquivos (15 min)**
- [ ] Upload services/ (3 arquivos)
- [ ] Upload checkout.controller.js
- [ ] Upload checkout.routes.js
- [ ] Upload marketplace.controller.js (modificado)
- [ ] Upload webhook.routes.js (modificado)
- [ ] Upload server.js (modificado)

### **Dependências (5 min)**
- [ ] `npm install @supabase/supabase-js`
- [ ] Verificar package.json

### **Reiniciar Servidor (2 min)**
- [ ] `pm2 restart rs-api`
- [ ] Verificar logs
- [ ] Confirmar "Listener ativo"

### **Webhook MP (5 min)**
- [ ] Configurar URL no Mercado Pago
- [ ] Testar webhook
- [ ] Verificar recebimento nos logs

### **Teste Final (10 min)**
- [ ] Criar produto teste
- [ ] Criar consultor teste
- [ ] Simular compra
- [ ] Verificar matriz
- [ ] Confirmar bônus

**Total:** ~52 minutos

---

## 🔍 **VERIFICAÇÃO PÓS-DEPLOY**

### **1. Verificar Rotas**
```bash
curl https://api.rsprolipsi.com.br/health

# Deve retornar:
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123,
  "environment": "production"
}
```

### **2. Verificar Logs**
```bash
ssh root@72.60.144.245
pm2 logs rs-api --lines 50

# Deve mostrar:
✅ Servidor rodando na porta 8080
✅ Listener ativo e escutando eventos de ciclo!
📡 Status do listener: SUBSCRIBED
```

### **3. Verificar Tabelas**
```sql
-- No Supabase SQL Editor:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'orders', 'order_items', 'cycle_events', 
  'payment_errors', 'downlines', 'matrix_accumulator'
);

-- Deve retornar 6 tabelas ✅
```

### **4. Testar Checkout**
```bash
curl -X POST https://api.rsprolipsi.com.br/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyerEmail": "teste@email.com",
    "buyerName": "Teste",
    "items": [{"product_id": "produto-id", "quantity": 1}],
    "paymentMethod": "pix"
  }'

# Deve retornar:
{
  "success": true,
  "order": { "id": "...", "total": 60.00, "status": "pending" },
  "payment": { "qr_code": "...", "paymentId": "..." }
}
```

---

## 📊 **ESTATÍSTICAS**

### **Arquivos**
- Novos: 13
- Modificados: 3
- SQL: 3
- **Total:** 19 arquivos

### **Linhas de Código**
- Services: ~800 linhas
- Controllers: ~300 linhas
- Routes: ~50 linhas
- SQL: ~400 linhas
- Docs: ~2.000 linhas
- **Total:** ~3.550 linhas

### **Funcionalidades**
- Checkout integrado
- Acumulador R$ 60
- Spillover automático
- Compressão dinâmica
- Webhook MP
- Supabase Realtime
- rs-ops integrado

---

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ Executar SQLs no Supabase
2. ✅ Upload arquivos no VPS
3. ✅ Configurar webhook MP
4. ✅ Testar sistema
5. ✅ Integrar frontends (marketplace, admin, consultor)

---

## 📞 **SUPORTE**

**Dúvidas?** Consultar:
- `DEPLOY-COMPLETO-SISTEMA-SIGMA.md` (guia detalhado)
- `COMANDOS-RAPIDOS-DEPLOY.md` (comandos copy/paste)
- `INTEGRACAO-CHECKOUT-COMPLETA.md` (como usar)

**Problemas?** Verificar logs:
```bash
pm2 logs rs-api
```

---

**Última atualização:** 09/11/2024 16:10
**Status:** ✅ **PRONTO PARA DEPLOY**
