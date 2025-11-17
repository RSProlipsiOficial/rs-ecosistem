# ✅ CHECKLIST INTEGRAÇÃO - RS PRÓLIPSI

**Data:** 09/11/2024 01:20
**Objetivo:** Ligar os 3 painéis (Marketplace + Consultor + Admin)

**Legenda:**
- 🔴 **RUIM** - Não funciona / Falta implementar
- 🟡 **BOM** - Parcialmente funcional / Precisa ajustes
- 🟢 **EXCELENTE** - 100% Funcional

---

## 📦 **1. RS-CONFIG (Configurações)**

### **Status Geral: 🟢 EXCELENTE (100%)**

| Item | Status | Observação |
|------|--------|------------|
| Valores de bônus | 🟢 | `plans.json` com todos % corretos |
| Ciclos SIGMA | 🟢 | Valores R$ 360, R$ 108 definidos |
| Plano carreira | 🟢 | PINs e VMEC configurados |
| Timezone Brasil | 🟢 | America/Sao_Paulo |
| Fidelidade | 🟢 | Regra definida (1.25%) |
| Top SIGMA | 🟢 | Pool 4.5%, Top 10 |

**✅ NADA A FAZER - 100% PRONTO**

---

## 🗄️ **2. RS-CORE (Banco de Dados + SQL)**

### **Status Geral: 🟢 EXCELENTE (95%)**

| Item | Status | Observação |
|------|--------|------------|
| **Tabelas Base** | | |
| ├─ consultores | 🟢 | Completa |
| ├─ wallets | 🟢 | Completa |
| ├─ product_catalog | 🟢 | Completa |
| ├─ matriz_cycles | 🟢 | Completa |
| ├─ sales | 🟢 | Completa |
| ├─ bonuses | 🟢 | Completa |
| └─ transactions | 🟢 | Completa |
| **Triggers** | | |
| ├─ trg_process_sale() | 🟢 | Venda → Matriz automático |
| ├─ trg_on_cycle_completed() | 🟢 | Ciclo → Pontos automático |
| └─ trg_log_wallet_transaction() | 🟢 | Wallet → Log automático |
| **Views** | | |
| ├─ vw_active_cycles | 🟢 | Ciclos ativos |
| ├─ vw_consultor_performance | 🟢 | Performance completa |
| ├─ vw_vmec_calculation | 🟢 | Cálculo VMEC |
| └─ vw_top_sigma_ranking | 🟢 | Ranking mensal |
| **RPC Functions** | | |
| ├─ get_uplines() | 🟢 | Busca uplines até L6 |
| ├─ get_user_network() | 🟡 | Precisa verificar se existe |
| └─ close_cycle() | 🟡 | Precisa verificar se existe |

### **🔧 A FAZER:**

#### **Tarefa 1: Verificar RPC Functions no Supabase**
```sql
-- Executar no SQL Editor do Supabase
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%sigma%' OR routine_name LIKE '%cycle%';
```

#### **Tarefa 2: Se faltarem, criar RPCs**
- [ ] `get_user_network(p_user_id UUID, p_max_depth INT)`
- [ ] `close_cycle(p_user_id UUID)` (se necessário via SQL)

**⏱️ Tempo estimado: 30 minutos**

---

## 🌐 **3. RS-API (Backend)**

### **Status Geral: 🟡 BOM (70%)**

| Módulo | Status | Observação |
|--------|--------|------------|
| **Rotas SIGMA** | | |
| ├─ GET /network/:userId | 🟢 | Funcionando |
| ├─ GET /matrix/:userId | 🟢 | Funcionando |
| ├─ GET /cycles/:userId | 🟢 | Funcionando |
| ├─ GET /depth/:userId | 🟢 | Funcionando |
| ├─ POST /cycle/complete | 🟡 | Existe mas não conectado |
| └─ POST /bonus/distribute | 🟡 | Existe mas não conectado |
| **Rotas Marketplace** | | |
| ├─ GET /products | 🟢 | Funcionando |
| ├─ POST /order/create | 🟢 | Funcionando |
| └─ GET /orders/:userId | 🟢 | Funcionando |
| **Rotas Wallet** | | |
| ├─ GET /wallet/:userId | 🟢 | Funcionando |
| ├─ POST /wallet/credit | 🟡 | Precisa testar |
| └─ POST /wallet/withdraw | 🟡 | Precisa testar |
| **Webhook Mercado Pago** | | |
| ├─ Recebe eventos | 🟢 | Funcionando |
| └─ Processa pagamento | 🔴 | **NÃO FUNCIONA** |
| **Services** | | |
| ├─ salesService.js | 🔴 | **NÃO EXISTE** |
| ├─ matrixService.js | 🔴 | **NÃO EXISTE** |
| └─ cycleEventListener.js | 🔴 | **NÃO EXISTE** |

### **🔧 A FAZER:**

#### **Tarefa 1: Criar `salesService.js`** 🔴 CRÍTICO
```javascript
// rs-api/src/services/salesService.js
module.exports = {
  registerSale(paymentData),      // ← Insere em sales
  creditWallet(userId, amount),   // ← Credita carteira
  getOrder(orderId)               // ← Busca pedido
};
```

#### **Tarefa 2: Completar Webhook** 🔴 CRÍTICO
```javascript
// rs-api/src/routes/webhook.routes.js
async function applyPaymentUpdate(evt) {
  if (evt.status === 'approved') {
    await registerSale(evt);  // ← ADICIONAR
    // Trigger do Supabase faz o resto!
  }
}
```

#### **Tarefa 3: Criar Listener de Eventos** 🔴 CRÍTICO
```javascript
// rs-api/src/services/cycleEventListener.js
supabase.channel('cycle-events')
  .on('INSERT', { table: 'cycle_events' }, async (payload) => {
    if (payload.new.event_type === 'cycle_completed') {
      // Chamar rs-ops.closeCycle()
    }
  });
```

**⏱️ Tempo estimado: 2 horas**

---

## ⚙️ **4. RS-OPS (Operações Automáticas)**

### **Status Geral: 🟢 EXCELENTE (90%)**

| Módulo | Status | Observação |
|--------|--------|------------|
| **Core - Cycles** | | |
| ├─ closeCycle() | 🟢 | 100% funcional |
| ├─ openCycle() | 🟢 | 100% funcional |
| └─ reentryCycle() | 🟢 | 100% funcional |
| **Core - Distribution** | | |
| ├─ payDepth() | 🟢 | Profundidade 6.81% OK |
| ├─ payFidelity() | 🟢 | Pool 1.25% OK |
| ├─ payTopSigma() | 🟢 | Pool 4.5% OK |
| └─ calculateBonus() | 🟢 | Validação OK |
| **CRONs** | | |
| ├─ closeCycles.ts | 🟢 | Fechamento mensal/trimestral |
| ├─ payFidelityPool.ts | 🟢 | Distribui fidelidade |
| ├─ payTopSigmaPool.ts | 🟢 | Distribui Top 10 |
| └─ activateMatriz.ts | 🟢 | Ativa matriz |
| **Jobs** | | |
| ├─ dailySettlement.ts | 🟢 | Consolidação diária |
| ├─ monthlyTopSigma.ts | 🟢 | Ranking mensal |
| └─ recalcBonuses.ts | 🟢 | Recálculo |
| **Integração com API** | | |
| └─ HTTP Endpoint | 🔴 | **NÃO EXPOSTO** |

### **🔧 A FAZER:**

#### **Tarefa 1: Expor rs-ops via HTTP** 🟡 IMPORTANTE
```javascript
// rs-ops/src/api/server.js (CRIAR)
const express = require('express');
const { closeCycle } = require('../core/cycles/closeCycle');

const app = express();

app.post('/ops/close-cycle', async (req, res) => {
  const { consultorId } = req.body;
  await closeCycle(consultorId);
  res.json({ success: true });
});

app.listen(3001, () => {
  console.log('🚀 RS-OPS API rodando na porta 3001');
});
```

**⏱️ Tempo estimado: 1 hora**

---

## 📚 **5. RS-DOCS (Documentação)**

### **Status Geral: 🟢 EXCELENTE (100%)**

| Item | Status | Observação |
|------|--------|------------|
| Credenciais | 🟢 | Arquivo completo |
| SQL Completo | 🟢 | EXECUTAR-NO-SUPABASE.sql |
| Triggers | 🟢 | VIEWS-E-TRIGGERS.sql |
| Schemas | 🟢 | SCHEMAS-SUPABASE.sql |
| Mapeamento | 🟢 | Documentos criados hoje |

**✅ NADA A FAZER - 100% PRONTO**

---

## 🚚 **6. RS-LOGISTICA (Centro Distribuição)**

### **Status Geral: 🟡 BOM (60%)**

| Módulo | Status | Observação |
|--------|--------|------------|
| Cadastro CDs | 🟢 | Tabela pronta |
| Produtos CD | 🟢 | Relação CD-Produto OK |
| Estoque | 🟡 | Precisa integração real |
| Pedidos CD | 🟡 | Precisa webhook/notificação |
| Logística reversa | 🔴 | Não implementado |

### **🔧 A FAZER (BAIXA PRIORIDADE):**

#### **Tarefa 1: Integração Estoque Real** 🟡
- [ ] Conectar com sistema CD (API ou planilha)
- [ ] Atualizar `stock_quantity` automaticamente
- [ ] Alertas de estoque baixo

**⏱️ Tempo estimado: 3 horas (DEPOIS da integração principal)**

---

## 🔗 **7. INTEGRAÇÃO FINAL (Ligar os Fios)**

### **Status Geral: 🔴 RUIM (30%)**

| Fluxo | Status | O Que Falta |
|-------|--------|-------------|
| **Marketplace → Consultor** | | |
| ├─ Venda no marketplace | 🟢 | Funciona |
| ├─ Webhook MP aprova | 🟢 | Funciona |
| ├─ Inserir em `sales` | 🔴 | **salesService falta** |
| ├─ Trigger adiciona na matriz | 🟢 | SQL pronto (espera INSERT) |
| └─ Consultor vê no painel | 🟢 | Componentes prontos |
| **Matriz → Bônus** | | |
| ├─ 6ª venda completa ciclo | 🟢 | Trigger SQL funciona |
| ├─ Evento `cycle_completed` | 🟢 | SQL insere evento |
| ├─ rs-ops escuta evento | 🔴 | **Listener falta** |
| ├─ rs-ops distribui bônus | 🟢 | Lógica pronta |
| └─ Carteiras creditadas | 🟡 | Precisa testar |
| **Admin → Visualização** | | |
| ├─ Admin vê ciclos ativos | 🟢 | API + componentes OK |
| ├─ Admin vê ranking | 🟢 | View SQL + API OK |
| ├─ Admin vê bônus | 🟢 | API + componentes OK |
| └─ Dados reais (não mock) | 🔴 | **API calls faltam** |

---

## 📋 **CHECKLIST PRIORIZADO**

### **🔴 CRÍTICO (Fazer AGORA - 3h total)**

#### **1. Integração Pagamento → Matriz** ⏱️ 2h
- [ ] Criar `rs-api/src/services/salesService.js`
  - [ ] `registerSale()` - 40 min
  - [ ] `creditWallet()` - 20 min
  - [ ] `getOrder()` - 10 min
- [ ] Completar `rs-api/src/routes/webhook.routes.js`
  - [ ] Adicionar chamada `registerSale()` - 20 min
  - [ ] Adicionar tratamento de erro - 10 min
- [ ] Testar fluxo completo
  - [ ] Criar pedido teste - 10 min
  - [ ] Simular webhook MP - 10 min
  - [ ] Verificar `sales` e `matriz_cycles` - 10 min

#### **2. Integração Ciclo → Bônus** ⏱️ 1h
- [ ] Criar `rs-api/src/services/cycleEventListener.js`
  - [ ] Supabase Realtime listener - 30 min
  - [ ] Chamar rs-ops via HTTP - 10 min
  - [ ] Tratamento de erro - 10 min
- [ ] Expor rs-ops via HTTP (opcional)
  - [ ] Criar `rs-ops/src/api/server.js` - 10 min

---

### **🟡 IMPORTANTE (Fazer DEPOIS - 2h total)**

#### **3. Substituir Mock Data por API Real** ⏱️ 1h
- [ ] rs-admin: Trocar mock data por API calls
  - [ ] `CicloGlobal.tsx` → `/api/sigma/cycles` - 15 min
  - [ ] `BonusProfundidade.tsx` → `/api/sigma/depth` - 15 min
  - [ ] `TopSigme.tsx` → `/api/sigma/stats` - 15 min
  - [ ] `MatrizSigma.tsx` → `/api/sigma/network` - 15 min

#### **4. Testes End-to-End** ⏱️ 1h
- [ ] Simular 6 vendas para completar ciclo
- [ ] Verificar bônus distribuídos
- [ ] Verificar carteiras creditadas
- [ ] Verificar painéis exibindo dados reais

---

### **🟢 MELHORIAS (Fazer FUTURO - 5h total)**

#### **5. Logística e Estoque** ⏱️ 3h
- [ ] Integração estoque real
- [ ] Notificações para CDs
- [ ] Logística reversa

#### **6. Notificações** ⏱️ 2h
- [ ] Email quando ciclo completa
- [ ] WhatsApp quando bônus é pago
- [ ] Push notification no painel

---

## 🎯 **PLANO DE EXECUÇÃO (HOJE)**

### **Hora 1: salesService.js** 
```javascript
// Criar arquivo e implementar 3 funções
// Testar com Postman
```

### **Hora 2: webhook.routes.js + Testes**
```javascript
// Completar applyPaymentUpdate()
// Testar com webhook real
// Verificar INSERT em sales
```

### **Hora 3: cycleEventListener.js**
```javascript
// Criar listener Supabase Realtime
// Testar evento cycle_completed
// Verificar rs-ops chamado
```

---

## 📊 **RESUMO GERAL**

| Módulo | Status | % Pronto | Tempo Restante |
|--------|--------|----------|----------------|
| rs-config | 🟢 | 100% | 0h |
| rs-core (SQL) | 🟢 | 95% | 0.5h |
| rs-api | 🟡 | 70% | 2h |
| rs-ops | 🟢 | 90% | 1h |
| rs-docs | 🟢 | 100% | 0h |
| rs-logistica | 🟡 | 60% | 3h (depois) |
| **Integração** | 🔴 | **30%** | **3h** |

---

## ✅ **CONCLUSÃO**

**SITUAÇÃO:**
- ✅ Backend 90% pronto
- ✅ Frontends 100% prontos
- ❌ Integração 30% pronta

**O QUE FALTA:**
- 🔴 3 arquivos JavaScript (200 linhas total)
- 🔴 3 horas de implementação
- 🔴 Ligar os "fios" entre sistemas

**PRÓXIMO PASSO:**
Começar pela **Hora 1** (salesService.js)?

Aguardando confirmação! 🚀
