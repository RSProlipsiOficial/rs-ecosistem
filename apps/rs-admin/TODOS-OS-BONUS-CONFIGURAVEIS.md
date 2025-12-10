# 💰 TODOS OS BÔNUS CONFIGURÁVEIS - PAINEL ADMIN

**Data:** 07/11/2025 13:40  
**Princípio:** **ADMIN CONTROLA TODOS OS BÔNUS**

---

## 📊 RESUMO GERAL DOS BÔNUS

### **Total Distribuído por Ciclo:**
- **Valor do Ciclo:** R$ 360,00
- **Total em Bônus:** R$ 176,22 (48,95%)
- **Reserva da Empresa:** R$ 183,78 (51,05%)

### **Distribuição:**
| Bônus | % | Valor | Frequência |
|-------|---|-------|------------|
| **Ciclo** | 30,00% | R$ 108,00 | Imediato |
| **Profundidade** | 6,81% | R$ 24,52 | Imediato |
| **Fidelidade** | 1,25% | R$ 4,50 | Mensal |
| **Top SIGMA** | 4,50% | R$ 16,20 | Mensal |
| **Carreira** | 6,39% | R$ 23,00 | Trimestral |
| **TOTAL** | **48,95%** | **R$ 176,22** | - |

---

## 1️⃣ BÔNUS DE CICLO (30%)

### **Configuração Atual:**
```json
{
  "enabled": true,
  "percentual": 0.30,
  "valorBase": 360.00,
  "valorPayout": 108.00,
  "paymentTiming": "immediate"
}
```

### **Campos Editáveis no Admin:**
- ✅ `enabled` (Ativar/Desativar)
- ✅ `percentual` (0-100%)
- ✅ `valorPayout` (Calculado automaticamente)
- ✅ `paymentTiming` (immediate, daily, weekly)

### **Validações:**
- Percentual deve estar entre 0% e 50%
- Valor não pode exceder valor do ciclo
- Pagamento imediato é recomendado

### **Endpoint:**
```typescript
PUT /api/admin/bonus/cycle/config
Body: {
  "enabled": true,
  "percentual": 0.30,
  "paymentTiming": "immediate"
}
```

---

## 2️⃣ BÔNUS DE PROFUNDIDADE (6,81%)

### **Configuração Atual:**
```json
{
  "enabled": true,
  "percentualTotal": 0.0681,
  "valorTotal": 24.52,
  "maxLevels": 6,
  "levels": {
    "L1": { "percentage": 0.07, "value": 1.716 },
    "L2": { "percentage": 0.08, "value": 1.961 },
    "L3": { "percentage": 0.10, "value": 2.452 },
    "L4": { "percentage": 0.15, "value": 3.677 },
    "L5": { "percentage": 0.25, "value": 6.129 },
    "L6": { "percentage": 0.35, "value": 8.581 }
  }
}
```

### **Campos Editáveis no Admin:**
- ✅ `enabled` (Ativar/Desativar)
- ✅ `percentualTotal` (Total do bônus)
- ✅ `maxLevels` (1-10 níveis)
- ✅ `levels[L1-L6].percentage` (Distribuição por nível)

### **Validações:**
- Soma dos percentuais dos níveis deve ser 100%
- Cada nível deve ter valor > 0
- Máximo 10 níveis de profundidade

### **Endpoint:**
```typescript
PUT /api/admin/bonus/depth/config
Body: {
  "enabled": true,
  "percentualTotal": 0.0681,
  "maxLevels": 6,
  "levels": {
    "L1": 0.07,
    "L2": 0.08,
    "L3": 0.10,
    "L4": 0.15,
    "L5": 0.25,
    "L6": 0.35
  }
}
```

---

## 3️⃣ BÔNUS DE FIDELIDADE (1,25%)

### **Configuração Atual:**
```json
{
  "enabled": true,
  "percentualPool": 0.0125,
  "valorPool": 4.50,
  "maxLevels": 6,
  "period": "monthly",
  "levels": {
    "L1": { "percentage": 0.07, "value": 0.315 },
    "L2": { "percentage": 0.08, "value": 0.360 },
    "L3": { "percentage": 0.10, "value": 0.450 },
    "L4": { "percentage": 0.15, "value": 0.675 },
    "L5": { "percentage": 0.25, "value": 1.125 },
    "L6": { "percentage": 0.35, "value": 1.575 }
  }
}
```

### **Campos Editáveis no Admin:**
- ✅ `enabled` (Ativar/Desativar)
- ✅ `percentualPool` (% do pool)
- ✅ `maxLevels` (1-10 níveis)
- ✅ `levels[L1-L6].percentage` (Distribuição)
- ✅ `period` (monthly, quarterly)

### **Regras:**
- Consultor deve ter avançado para próxima matriz
- Pago no final do mês
- Soma dos níveis = 100%

### **Endpoint:**
```typescript
PUT /api/admin/bonus/fidelity/config
Body: {
  "enabled": true,
  "percentualPool": 0.0125,
  "maxLevels": 6,
  "period": "monthly",
  "levels": {
    "L1": 0.07,
    "L2": 0.08,
    "L3": 0.10,
    "L4": 0.15,
    "L5": 0.25,
    "L6": 0.35
  }
}
```

---

## 4️⃣ TOP SIGMA (4,5%)

### **Configuração Atual:**
```json
{
  "enabled": true,
  "percentualPool": 0.045,
  "valorPool": 16.20,
  "period": "monthly",
  "ranking": "top_10",
  "levelWeights": [0.20, 0.15, 0.12, 0.10, 0.09, 0.08, 0.07, 0.06, 0.065, 0.065],
  "distribution": {
    "1": 0.02,   // 2% do pool global
    "2": 0.015,  // 1,5%
    "3": 0.012,  // 1,2%
    "4": 0.010,  // 1%
    "5": 0.008,  // 0,8%
    "6": 0.007,  // 0,7%
    "7": 0.006,  // 0,6%
    "8": 0.005,  // 0,5%
    "9": 0.004,  // 0,4%
    "10": 0.003  // 0,3%
  }
}
```

### **Campos Editáveis no Admin:**
- ✅ `enabled` (Ativar/Desativar)
- ✅ `percentualPool` (% do pool global)
- ✅ `ranking` (top_5, top_10, top_20)
- ✅ `levelWeights` (Pesos por nível L1-L10)
- ✅ `distribution` (% para cada posição do ranking)

### **Validações:**
- Soma dos levelWeights = 1.0 (100%)
- Soma da distribution ≤ pool total
- Profundidade e lateralidade ilimitadas

### **Endpoint:**
```typescript
PUT /api/admin/bonus/top-sigma/config
Body: {
  "enabled": true,
  "percentualPool": 0.045,
  "ranking": "top_10",
  "levelWeights": [0.20, 0.15, 0.12, 0.10, 0.09, 0.08, 0.07, 0.06, 0.065, 0.065],
  "distribution": {
    "1": 0.02,
    "2": 0.015,
    ...
  }
}
```

---

## 5️⃣ BÔNUS DE CARREIRA (6,39%)

### **Configuração Atual:**
```json
{
  "enabled": true,
  "percentual": 0.0639,
  "valorPorCiclo": 23.00,
  "period": "quarterly",
  "paymentTiming": "on_qualification",
  "applyVMEC": true
}
```

### **Vinculado aos 13 PINs:**
Cada PIN tem seus próprios requisitos e VMEC:
- PIN01 (Bronze): 5 ciclos, 0 linhas, VMEC []
- PIN02 (Prata): 15 ciclos, 1 linha, VMEC [100%]
- PIN03 (Ouro): 70 ciclos, 1 linha, VMEC [100%]
- ... até PIN13 (Diamante Black)

### **Campos Editáveis no Admin:**
- ✅ `enabled` (Ativar/Desativar)
- ✅ `percentual` (% por ciclo)
- ✅ `valorPorCiclo` (Valor em R$)
- ✅ `period` (quarterly, monthly)
- ✅ `applyVMEC` (Aplicar VMEC ou não)

### **Integração com PINs:**
Quando admin edita um PIN, o bônus de carreira é recalculado automaticamente.

### **Endpoint:**
```typescript
PUT /api/admin/bonus/career/config
Body: {
  "enabled": true,
  "percentual": 0.0639,
  "valorPorCiclo": 23.00,
  "period": "quarterly",
  "applyVMEC": true
}
```

---

## 🎯 MATRIZ SIGMA (Configurações)

### **Configuração Atual:**
```json
{
  "type": "1x6",
  "size": 6,
  "cycleValue": 360.00,
  "compression": {
    "enabled": true,
    "automatic": true,
    "mode": "dynamic"
  },
  "reentry": {
    "enabled": true,
    "automatic": true,
    "cost": 360.00,
    "maxReentries": 999
  }
}
```

### **Campos Editáveis no Admin:**
- ✅ `size` (Tamanho da matriz: 3, 6, 9, 12)
- ✅ `cycleValue` (Valor do ciclo em R$)
- ✅ `compression.enabled` (Ativar compressão)
- ✅ `compression.mode` (dynamic, static)
- ✅ `reentry.enabled` (Reentrada automática)
- ✅ `reentry.cost` (Custo da reentrada)
- ✅ `reentry.maxReentries` (Máximo de reentradas)

### **Validações:**
- Size deve ser múltiplo de 3
- Cycle value > 0
- Reentry cost ≤ cycle value

### **Endpoint:**
```typescript
PUT /api/admin/sigma/matrix/config
Body: {
  "size": 6,
  "cycleValue": 360.00,
  "compression": {
    "enabled": true,
    "mode": "dynamic"
  },
  "reentry": {
    "enabled": true,
    "automatic": true,
    "cost": 360.00
  }
}
```

---

## 📋 PÁGINA DE CONFIGURAÇÃO NO ADMIN

### **Layout Sugerido:**

```
┌─────────────────────────────────────────────┐
│  CONFIGURAÇÕES DE BÔNUS                     │
├─────────────────────────────────────────────┤
│                                             │
│  [Tab] Matriz SIGMA                         │
│  [Tab] Bônus de Ciclo                       │
│  [Tab] Bônus de Profundidade                │
│  [Tab] Bônus de Fidelidade                  │
│  [Tab] Top SIGMA                            │
│  [Tab] Bônus de Carreira                    │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ BÔNUS DE CICLO                        │  │
│  │                                       │  │
│  │ Status: [✓] Ativo                     │  │
│  │                                       │  │
│  │ Percentual: [30]%                     │  │
│  │ Valor: R$ 108,00 (calculado)          │  │
│  │                                       │  │
│  │ Pagamento: [Imediato ▼]               │  │
│  │                                       │  │
│  │ [Salvar Alterações]                   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ RESUMO GERAL                          │  │
│  │                                       │  │
│  │ Total Distribuído: 48,95%             │  │
│  │ Total em R$: R$ 176,22                │  │
│  │ Reserva Empresa: 51,05%               │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 🔗 SINCRONIZAÇÃO

### **Fluxo:**
```
Admin edita bônus
    ↓
API valida
    ↓
Salva no banco
    ↓
Atualiza bonus.json
    ↓
Atualiza matrices.json
    ↓
Atualiza topSigma.json
    ↓
Atualiza cycles.json
    ↓
Notifica todos os painéis
    ↓
Consultores veem mudanças
```

---

## ✅ ENDPOINTS COMPLETOS

### **1. Buscar Todas as Configurações:**
```typescript
GET /api/admin/bonus/config
Response: {
  "ciclo": {...},
  "profundidade": {...},
  "fidelidade": {...},
  "topSigma": {...},
  "carreira": {...},
  "matriz": {...}
}
```

### **2. Atualizar Bônus Individual:**
```typescript
PUT /api/admin/bonus/:type/config
// type: ciclo, profundidade, fidelidade, topSigma, carreira
```

### **3. Validar Configuração:**
```typescript
POST /api/admin/bonus/validate
Body: { "ciclo": {...}, "profundidade": {...} }
Response: {
  "valid": true,
  "errors": [],
  "warnings": ["Soma total é 48,95%"]
}
```

### **4. Sincronizar Todos os Arquivos:**
```typescript
POST /api/admin/bonus/sync
Response: {
  "success": true,
  "filesUpdated": [
    "bonus.json",
    "matrices.json",
    "topSigma.json",
    "cycles.json"
  ]
}
```

---

## 🚨 REGRAS CRÍTICAS

1. **Soma Total ≤ 100%** - Nunca pode exceder
2. **Validar Antes de Salvar** - Sempre!
3. **Sincronizar Todos os Arquivos** - Sempre!
4. **Notificar Mudanças** - Sempre!
5. **Manter Histórico** - Auditoria de 7 anos

---

## 📊 TABELA DE VALIDAÇÃO

| Bônus | Min % | Max % | Atual % | Status |
|-------|-------|-------|---------|--------|
| Ciclo | 20% | 40% | 30% | ✅ OK |
| Profundidade | 5% | 10% | 6,81% | ✅ OK |
| Fidelidade | 1% | 5% | 1,25% | ✅ OK |
| Top SIGMA | 3% | 7% | 4,5% | ✅ OK |
| Carreira | 5% | 10% | 6,39% | ✅ OK |
| **TOTAL** | **40%** | **60%** | **48,95%** | ✅ OK |

---

**Documento criado em:** 07/11/2025 13:40  
**Status:** 🎯 PRONTO PARA IMPLEMENTAÇÃO
