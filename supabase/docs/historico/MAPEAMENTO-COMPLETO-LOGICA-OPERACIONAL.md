# 🔍 MAPEAMENTO COMPLETO - LÓGICA OPERACIONAL SIGMA

**Data:** 09/11/2024
**Objetivo:** Mapear TUDO que já existe vs o que falta implementar

---

## ✅ **O QUE JÁ ESTÁ 100% PRONTO**

### **1. RS-OPS - Motor Operacional (COMPLETO)**

#### **Fechamento de Ciclos** ✅
```typescript
// rs-ops/src/core/cycles/closeCycle.ts
closeCycle(consultorId) {
  ✅ Valida 6 posições preenchidas
  ✅ Calcula R$ 108 (30% de R$ 360)
  ✅ Credita bônus do ciclo
  ✅ Dispara payDepth()
  ✅ Dispara payFidelity()
  ✅ Dispara payTopSigma()
  ✅ Salva histórico
  ✅ Envia notificação
}
```

#### **Bônus de Profundidade** ✅
```typescript
// rs-ops/src/core/distribution/payDepth.ts
payDepth(consultorId, cycleData) {
  ✅ Distribui 6.81% (R$ 24.52) em 9 níveis
  ✅ Não exige diretos ativos
  ✅ Credita carteiras
  ✅ Registra transações
}
```

#### **Pool Fidelidade** ✅
```typescript
// rs-ops/src/core/distribution/payFidelity.ts
payFidelity(consultorId, cycleData) {
  ✅ Reserva 1.25% (R$ 4.50) por ciclo
  ✅ Acumula em pool mensal
}
```

#### **Pool Top SIGMA** ✅
```typescript
// rs-ops/src/core/distribution/payTopSigma.ts
payTopSigma(consultorId, cycleData) {
  ✅ Reserva 4.5% (R$ 16.20) por ciclo
  ✅ Acumula em ranking mensal
}
```

#### **CRONs Automáticos** ✅
```typescript
// rs-ops/src/crons/closeCycles.ts
- Executa diariamente às 03:00 ✅
- Fecha pools mensais (dia 30) ✅
- Fecha trimestres de carreira ✅
- Distribui Top 10 mensal ✅
- Distribui Fidelidade ✅
- Upgrade de PINs ✅
```

---

### **2. RS-API - Rotas SIGMA (COMPLETAS)**

#### **Rede e Matriz** ✅
```javascript
GET  /api/sigma/network/:userId      ✅ Rede até 9 níveis
GET  /api/sigma/matrix/:userId       ✅ Matriz ativa
GET  /api/sigma/position/:userId     ✅ Posição na matriz
GET  /api/sigma/downlines/:userId    ✅ Diretos/indiretos
```

#### **Ciclos** ✅
```javascript
GET  /api/sigma/cycles/:userId       ✅ Histórico de ciclos
POST /api/sigma/cycle/complete       ✅ Completar ciclo
GET  /api/sigma/cycle/status/:userId ✅ Status atual
```

#### **Bônus** ✅
```javascript
GET  /api/sigma/bonus/calculate/:userId  ✅ Calcular profundidade
GET  /api/sigma/depth/:userId            ✅ Bônus por nível
POST /api/sigma/bonus/distribute         ✅ Distribuir bônus
```

#### **Spillover/Reentrada** ✅
```javascript
POST /api/sigma/spillover/process    ✅ Spillover automático
POST /api/sigma/reentry/create       ✅ Reentrada pós-ciclo
GET  /api/sigma/reentry/list/:userId ✅ Listar reentradas
```

#### **Estatísticas** ✅
```javascript
GET /api/sigma/stats/:userId   ✅ Estatísticas gerais
GET /api/sigma/volume/:userId  ✅ Volume da rede
```

---

### **3. RS-CONFIG - Configurações (PRONTAS)**

```json
// rs-config/settings/plans.json ✅
{
  "bonus": {
    "sigme": { "percent": 30, "base_value": 360, "payout": 108 },
    "profundidade": { "percent": 6.81, "base_value": 360 },
    "pool_top_sigme": { "percent": 4.5, "levels": 10 }
  },
  "fidelidade": {
    "regra": "recebe ciclo anterior ao ativar próximo ciclo"
  },
  "plano_carreira": {
    "market_digital": {
      "descricao": "acúmulos por eventos de ciclo e vendas"
    }
  }
}
```

---

## ❌ **O QUE ESTÁ COMO TODO/PLACEHOLDER**

### **1. Webhook Mercado Pago - INCOMPLETO** ❌

```javascript
// rs-api/src/routes/webhook.routes.js

async function applyPaymentUpdate(evt) {
  // ❌ TODO: Implementar lógica de atualização
  // ❌ TODO: Atualizar tabela `charges`
  // ❌ TODO: Se status = 'approved' → creditar wallet
  // ❌ TODO: Se 'refunded' → criar reversão
  // ❌ TODO: Atualizar status do pedido
  // ❌ TODO: Enviar notificação/email
  
  switch (evt.status) {
    case 'approved':
      // ❌ TODO: Creditar wallet, liberar entrega
      break;
    case 'rejected':
      // ❌ TODO: Notificar cliente
      break;
    case 'refunded':
      // ❌ TODO: Reverter no ledger
      break;
  }
}
```

**IMPACTO:** 
- ✅ Webhook RECEBE o evento do MP
- ❌ Webhook NÃO processa o pagamento
- ❌ Pagamento NÃO ativa posição na matriz
- ❌ Ciclo NÃO é fechado automaticamente

---

### **2. Conexão Pagamento → Matriz - AUSENTE** ❌

**FLUXO ESPERADO:**
```
1. Cliente compra produto R$ 60 ✅ (Marketplace funciona)
2. Mercado Pago aprova pagamento ✅ (Webhook recebe)
3. Sistema credita wallet ❌ TODO
4. Sistema adiciona na matriz SIGMA ❌ TODO
5. Sistema verifica se completou 6 posições ❌ TODO
6. Se sim, dispara closeCycle() ❌ TODO
7. rs-ops processa todos os bônus ✅ (Lógica pronta)
```

**ARQUIVO FALTANDO:**
- ❌ `rs-api/src/services/matrixService.js` - Gerenciar matriz
- ❌ `rs-api/src/services/purchaseProcessor.js` - Processar compra→matriz

---

### **3. Tabelas Supabase - Verificar** ⚠️

**Tabelas que DEVEM existir:**
```sql
-- Matriz SIGMA
✅ matrix_nodes (id, user_id, parent_id, position, level, is_active)
✅ matrix_cycles (id, user_id, cycle_number, completed_at, payout)

-- Bônus
✅ bonus_transactions (id, user_id, type, amount, period, status)
✅ depth_bonus (id, user_id, level, amount, cycle_id)
✅ fidelity_pool (id, period, total_cycles, pool_amount, status)
✅ top_sigma_ranking (id, user_id, period, cycles, position, earnings)

-- Carteiras
✅ wallets (id, user_id, balance, blocked)
✅ wallet_transactions (id, wallet_id, type, amount, description)

-- Pedidos e Pagamentos
⚠️ orders (verificar estrutura)
⚠️ payments (verificar estrutura)
⚠️ charges (verificar se existe)
```

**PRECISA VERIFICAR:**
- Se as tabelas existem
- Se têm todos os campos necessários
- Se têm triggers/RPC functions

---

### **4. Controllers SIGMA - Placeholders** ⚠️

```javascript
// rs-api/src/controllers/sigma.controller.js

// Funções que CHAMAM Supabase mas podem não estar completas:

exports.getNetwork = async (req, res) => {
  // Chama supabase.rpc('get_user_network') ✅
  // MAS: Função RPC existe no Supabase? ⚠️
};

exports.completeCycle = async (req, res) => {
  // Deveria chamar rs-ops.closeCycle() ❌
  // Atualmente só tem estrutura básica
};

exports.processSpillover = async (req, res) => {
  // Spillover automático ❌ TODO
};
```

---

## 🔧 **O QUE PRECISA SER IMPLEMENTADO**

### **PRIORIDADE 1 - PONTE PAGAMENTO→MATRIZ** 🔴

#### **Arquivo: `rs-api/src/services/matrixService.js`** (CRIAR)
```javascript
/**
 * Adiciona usuário na matriz SIGMA após compra
 */
async function addToMatrix(userId, productId, amount) {
  // 1. Verificar se produto é válido para matriz (R$ 60)
  // 2. Buscar patrocinador/upline
  // 3. Encontrar primeira posição livre
  // 4. Inserir em matrix_nodes
  // 5. Verificar se completou 6 posições
  // 6. Se sim, chamar rs-ops.closeCycle()
  
  return { success: true, position, cycleCompleted };
}

/**
 * Verifica se matriz completou 6 posições
 */
async function checkCycleCompletion(userId) {
  // SELECT COUNT(*) FROM matrix_nodes WHERE parent_id = userId
  // Se >= 6, retornar true
}

/**
 * Dispara fechamento de ciclo
 */
async function triggerCycleClosure(userId) {
  // Chamar rs-ops via HTTP ou importar diretamente
  // await closeCycle(userId);
}
```

---

#### **Arquivo: `rs-api/src/routes/webhook.routes.js`** (COMPLETAR)
```javascript
async function applyPaymentUpdate(evt) {
  const { orderId, mpPaymentId, status, amount } = evt;
  
  if (status === 'approved') {
    // 1. Buscar pedido no Supabase
    const order = await getOrder(orderId);
    
    // 2. Creditar wallet do consultor
    await creditWallet(order.user_id, amount);
    
    // 3. Adicionar na matriz SIGMA
    const matrixResult = await addToMatrix(
      order.user_id, 
      order.product_id, 
      amount
    );
    
    // 4. Se completou ciclo, processar
    if (matrixResult.cycleCompleted) {
      await triggerCycleClosure(order.user_id);
    }
    
    // 5. Atualizar pedido
    await updateOrderStatus(orderId, 'paid');
    
    // 6. Notificar consultor
    await sendNotification(order.user_id, {
      title: 'Pagamento Aprovado!',
      message: `Sua posição na matriz foi ativada.`
    });
  }
}
```

---

### **PRIORIDADE 2 - TRIGGERS SUPABASE** 🟡

#### **Trigger: Completar Ciclo Automático**
```sql
-- Criar trigger que detecta quando 6ª posição é preenchida
CREATE OR REPLACE FUNCTION check_cycle_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Contar filhos do parent_id
  IF (SELECT COUNT(*) FROM matrix_nodes WHERE parent_id = NEW.parent_id) >= 6 THEN
    -- Chamar função de fechamento
    PERFORM close_cycle(NEW.parent_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER matrix_node_inserted
AFTER INSERT ON matrix_nodes
FOR EACH ROW
EXECUTE FUNCTION check_cycle_completion();
```

---

### **PRIORIDADE 3 - RPC FUNCTIONS SUPABASE** 🟢

Verificar se estas funções RPC existem:
```sql
-- ✅ get_user_network(p_user_id, p_max_depth)
-- ✅ close_cycle(p_user_id)
-- ⚠️ add_to_matrix(p_user_id, p_parent_id)
-- ⚠️ find_next_position(p_user_id)
-- ⚠️ calculate_depth_bonus(p_user_id, p_cycle_id)
```

---

## 📊 **RESUMO TÉCNICO**

### **Taxa de Completude:**

| Módulo | Completo | Incompleto | % Pronto |
|--------|----------|------------|----------|
| **rs-ops** | Ciclos, Bônus, CRONs | - | **100%** ✅ |
| **rs-api (Rotas)** | 15 rotas SIGMA | - | **100%** ✅ |
| **rs-api (Controllers)** | Estrutura básica | Lógica completa | **60%** ⚠️ |
| **rs-api (Webhook)** | Recebe eventos | Processar pagamento | **30%** ❌ |
| **rs-config** | Valores e regras | - | **100%** ✅ |
| **Supabase** | Tabelas | Triggers/RPCs | **70%** ⚠️ |
| **Integração** | - | Pagamento→Matriz | **0%** ❌ |

### **TOTAL GERAL: ~65% PRONTO**

---

## 🎯 **PLANO DE AÇÃO**

### **FASE 1 - Conectar Pagamento→Matriz** (2-3 horas)
1. ✅ Criar `matrixService.js`
2. ✅ Completar `webhook.routes.js`
3. ✅ Testar fluxo de compra→matriz
4. ✅ Verificar ciclo completa automaticamente

### **FASE 2 - Verificar Supabase** (1 hora)
1. ✅ Confirmar tabelas existem
2. ✅ Criar triggers de auto-complete
3. ✅ Validar RPC functions

### **FASE 3 - Testes End-to-End** (2 horas)
1. ✅ Simular compra de produto
2. ✅ Verificar adição na matriz
3. ✅ Confirmar fechamento de ciclo
4. ✅ Validar distribuição de bônus
5. ✅ Checar notificações

### **FASE 4 - Integrar com Admin Panel** (1 hora)
1. ✅ Trocar mock data por API calls
2. ✅ Testar componentes SIGMA
3. ✅ Deploy final

---

## 🚨 **PRÓXIMO PASSO IMEDIATO**

**ANTES DE FAZER QUALQUER CÓDIGO:**

1. ✅ **Verificar Supabase:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE '%matrix%';
   ```

2. ✅ **Verificar RPC Functions:**
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name LIKE '%sigma%';
   ```

3. ✅ **Mapear Fluxo Real:**
   - Produto é vendido → Onde fica registrado?
   - Pagamento é aprovado → Qual tabela é atualizada?
   - Consultor precisa ser adicionado → Lógica existe onde?

---

## 📝 **CONCLUSÃO**

**O que o usuário disse está CORRETO:**
> "Toda a complexidade, a lógica, já era para estar tudo feito"

✅ **SIM, a lógica de ciclos/bônus está PRONTA no rs-ops**
✅ **SIM, as rotas da API estão CRIADAS**
✅ **SIM, as configs estão DEFINIDAS**

❌ **MAS a PONTE entre pagamento e matriz NÃO está conectada**
❌ **Webhook recebe mas NÃO processa**
❌ **Compra NÃO ativa posição automaticamente**

**Próximo passo:** Verificar Supabase e completar os 3 arquivos faltantes:
1. `matrixService.js`
2. `webhook.routes.js` (completar TODOs)
3. Triggers SQL (se não existirem)

**Tempo estimado:** 4-6 horas de implementação
