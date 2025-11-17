# 🎯 PLANO DE CARREIRA COM VMEC - COMPLETO

**Versão:** 1.0.0  
**Data:** 06/11/2025  
**Status:** ✅ Implementado

---

## 📋 ARQUIVOS CRIADOS:

1. ✅ **rs-config/src/settings/carreira.json** (379 linhas)
2. ✅ **rs-config/src/utils/careerValidation.ts** (300+ linhas)
3. ✅ **rs-core/TABELAS-CARREIRA-VMEC.sql** (400+ linhas)

---

## 🎯 CONCEITOS FUNDAMENTAIS

### VMEC - Volume Máximo Elegível por Equipe e por Ciclo

**Características:**
- ✅ **Profundidade ILIMITADA** - Conta TODA a rede
- ✅ **Lateralidade ILIMITADA** - Pode ter infinitas linhas
- ⚠️ **Controlado por PERCENTUAIS** - Cada linha tem um teto
- ⚠️ **Mínimo de linhas REQUERIDO** - Conforme PIN

**Exemplo Safira [60%, 40%]:**
```
Total: 150 ciclos

L1: 100 ciclos (66%) → EXCEDE 60% → Limita em 90
L2: 50 ciclos (34%) → OK → Usa 50
L3-L10: 0 ciclos → Não conta

Elegíveis: 90 + 50 = 140 ciclos
```

---

## 📊 13 PINS CONFIGURADOS

| PIN | Nome | Ciclos | Linhas | VMEC | Recompensa |
|-----|------|--------|--------|------|------------|
| PIN01 | Bronze | 5 | 0 | [] | R$ 13,50 |
| PIN02 | Prata | 15 | 1 | [100] | R$ 40,50 |
| PIN03 | Ouro | 70 | 1 | [100] | R$ 189,00 |
| PIN04 | Safira | 150 | 2 | [60,40] | R$ 405,00 |
| PIN05 | Esmeralda | 300 | 2 | [60,40] | R$ 810,00 |
| PIN06 | Topázio | 500 | 2 | [60,40] | R$ 1.350,00 |
| PIN07 | Rubi | 750 | 3 | [50,30,20] | R$ 2.025,00 |
| PIN08 | Diamante | 1.500 | 3 | [50,30,20] | R$ 4.050,00 |
| PIN09 | Duplo Diamante | 3.000 | 4 | [40,30,20,10] | R$ 18.450,00 |
| PIN10 | Triplo Diamante | 5.000 | 5 | [35,25,20,10,10] | R$ 36.450,00 |
| PIN11 | Diamante Red | 15.000 | 6 | [30,20,18,12,10,10] | R$ 67.500,00 |
| PIN12 | Diamante Blue | 25.000 | 6 | [30,20,18,12,10,10] | R$ 105.300,00 |
| PIN13 | Diamante Black | 50.000 | 6 | [30,20,18,12,10,10] | R$ 135.000,00 |

---

## 📅 JANELA TRIMESTRAL

### Quarters 2025:

| Quarter | Meses | Fechamento |
|---------|-------|------------|
| **Q1** | Jan, Fev, Mar | 31/Mar |
| **Q2** | Abr, Mai, Jun | 30/Jun |
| **Q3** | Jul, Ago, Set | 30/Set |
| **Q4** | Out, Nov, Dez | 31/Dez |

### Regras:
- ✅ Pontos **NÃO** acumulam entre trimestres (reset)
- ✅ Avaliação ao final de cada Q
- ✅ Upgrade automático se atingir meta
- ✅ Downgrade se não mantiver (exceto Diamante Black)

---

## 🔄 FLUXO COMPLETO

### 1. Consultor Completa Ciclo
```
Ciclo 6/6 completado
   ↓
TRIGGER automático:
   - Cria 1 ponto em career_points
   - Identifica quarter (2025-Q1)
   - Identifica linha (L1, L2, etc.)
   - Armazena cycle_id
```

### 2. Durante o Trimestre
```
Consultor acumula pontos:
   - L1: 100 ciclos
   - L2: 50 ciclos
   - Total bruto: 150 pontos
```

### 3. Fechamento Trimestral (31/Mar às 03:00)
```
CRON closeCareerQuarter():
   ↓
Para cada consultor:
   1. Buscar pontos do trimestre
   2. Agrupar por linha
   3. Aplicar VMEC do PIN atual
   4. Calcular pontos elegíveis
   5. Verificar se qualifica para upgrade
   ↓
Se qualifica:
   - Upgrade PIN
   - Creditar recompensa
   - Enviar notificação
   - Gravar histórico
   ↓
Criar snapshot trimestral
```

---

## 🧮 APLICAÇÃO DO VMEC

### Pseudocódigo:
```typescript
function applyVMEC(lines, vmecPercentages) {
  const totalRaw = lines.reduce((sum, l) => sum + l.points, 0);
  let totalCapped = 0;
  
  lines.forEach((line, index) => {
    const capPercentage = vmecPercentages[index] || 10; // Default 10%
    const lineCap = totalRaw * (capPercentage / 100);
    const lineCapped = Math.min(line.points, lineCap);
    
    totalCapped += lineCapped;
  });
  
  return totalCapped;
}
```

### Exemplo Real:
```javascript
// Consultor Safira (PIN04)
const lines = [
  { id: 1, points: 100 },
  { id: 2, points: 50 }
];

const vmec = [60, 40]; // Safira

// Aplicar VMEC
const totalRaw = 150;

// L1: min(100, 150 * 0.60) = min(100, 90) = 90
// L2: min(50, 150 * 0.40) = min(50, 60) = 50

const eligible = 90 + 50 = 140;
```

---

## 💾 TABELAS SUPABASE

### 1. career_points
```sql
- id (UUID)
- user_id (UUID)
- quarter_id (TEXT) -- "2025-Q1"
- line_id (INT) -- 1, 2, 3...
- cycle_id (UUID)
- raw_points (NUMERIC) -- sempre 1
- created_at (TIMESTAMPTZ)
```

**Função:** Armazena cada ponto gerado por ciclo completado.

### 2. career_vmec_applied
```sql
- id (UUID)
- user_id (UUID)
- quarter_id (TEXT)
- pin_code (TEXT)
- vmec_percentages (JSONB)
- line_breakdown (JSONB)
- total_raw_points (NUMERIC)
- total_capped_points (NUMERIC)
- eligible_points (NUMERIC)
- qualifies (BOOLEAN)
```

**Função:** Armazena resultado do VMEC aplicado. Auditoria completa.

### 3. career_rank_history
```sql
- id (UUID)
- user_id (UUID)
- quarter_id (TEXT)
- previous_pin_code (TEXT)
- new_pin_code (TEXT)
- eligible_points (NUMERIC)
- action (TEXT) -- 'promoted', 'maintained', 'downgraded'
- reward_amount (NUMERIC)
```

**Função:** Histórico de mudanças de PIN.

### 4. career_snapshots
```sql
- id (UUID)
- user_id (UUID)
- quarter_id (TEXT)
- pin_code (TEXT)
- total_raw_points (NUMERIC)
- total_eligible_points (NUMERIC)
- vmec_breakdown (JSONB)
- is_active (BOOLEAN)
```

**Função:** Snapshot do estado ao final do trimestre.

---

## ✅ VALIDAÇÕES IMPLEMENTADAS

### Validação do Config:
```typescript
validateCareerConfig()
```

**Verifica:**
- ✅ 13 PINs presentes
- ✅ 4 quarters configurados
- ✅ Todos os meses cobertos
- ✅ minQuarterPoints > 0
- ✅ VMEC soma <= 100%
- ✅ pointsPerMatrixCycle = 1

### Validação de Qualificação:
```typescript
validatePinQualification(consultorData, pinCode)
```

**Verifica:**
- ✅ Consultor ativo
- ✅ KYC aprovado
- ✅ Reentrada no trimestre
- ✅ Pontos suficientes
- ✅ Linhas diretas suficientes
- ✅ Linhas contribuindo suficientes

### Cálculo de Progresso:
```typescript
calculateProgressToNextPin(currentPin, quarterPoints)
```

**Retorna:**
- PIN atual
- Próximo PIN
- Pontos atuais
- Pontos requeridos
- % de progresso
- Pontos restantes

---

## 🔔 NOTIFICAÇÕES

### Ao Completar Ciclo:
```
"Parabéns! +1 ponto de carreira (Q1: 45/150)"
```

### Ao Fazer Upgrade:
```
"🎉 PROMOÇÃO! Você alcançou SAFIRA!
Recompensa: R$ 405,00 creditados.
Próximo: Esmeralda (300 ciclos)"
```

### Lembrete Trimestral:
```
"Faltam 7 dias para o fechamento de Q1!
Você tem 140 pontos. Faltam 10 para Safira!"
```

---

## 📊 EDGE CASES COBERTOS

### 1. Entrada no Meio do Trimestre
```
countCyclesFromAnyJoinDate: true
```
✅ Consultor entra em Fev → Pontos contam normalmente em Q1

### 2. Profundidade Ilimitada
```
linesEligibleDepth: "unlimited"
```
✅ Conta ciclos de L1, L2, L3... até o infinito

### 3. Lateralidade Ilimitada
```
linesEligibleWidth: "unlimited"
```
✅ Pode ter 10, 50, 100 linhas diretas

### 4. Linha Excede VMEC
```
L1: 100 ciclos (66% de 150)
VMEC: [60%, 40%]
```
✅ Limita L1 em 90 (60% de 150)

### 5. Faltam Linhas Mínimas
```
PIN04 requer 2 linhas
Consultor tem apenas 1
```
✅ Não qualifica, mesmo com pontos suficientes

### 6. Diamante Black Vitalício
```
downgradeIfBelowInNextQuarter: false
graceQuarters: 999
```
✅ Uma vez Diamante Black, sempre Diamante Black

---

## 🚀 CONSUMO PELOS MÓDULOS

### rs-core
```typescript
import careerConfig from 'rs-config/src/settings/carreira.json';

// Aplicar VMEC
const vmec = careerConfig.pins.find(p => p.code === 'PIN04').requirements.vmecPercentages;
const eligible = applyVMEC(lines, vmec);
```

### rs-ops
```typescript
import { validateCareerConfig } from 'rs-config/src/utils/careerValidation';

// Validar antes de usar
const validation = validateCareerConfig();
if (!validation.valid) {
  console.error('Config inválido:', validation.errors);
}
```

### rs-api
```typescript
GET /v1/career/:userId/quarter/:q

Response:
{
  "quarter": "2025-Q1",
  "currentPin": "Safira",
  "rawPoints": 150,
  "eligiblePoints": 140,
  "breakdown": {
    "L1": { "raw": 100, "capped": 90 },
    "L2": { "raw": 50, "capped": 50 }
  },
  "nextPin": "Esmeralda",
  "progress": 46.67,
  "remaining": 160
}
```

### rs-admin
```typescript
// Dashboard mostra:
- Pontos brutos vs elegíveis
- VMEC por linha (gráfico)
- Progresso para próximo PIN
- Histórico de upgrades
```

---

## ✅ CHECKLIST FINAL

| Componente | Status | Arquivo |
|------------|--------|---------|
| Config 13 PINs | ✅ | carreira.json |
| VMEC por PIN | ✅ | carreira.json |
| Janela Trimestral | ✅ | carreira.json |
| Elegibilidade | ✅ | carreira.json |
| Retenção/Downgrade | ✅ | carreira.json |
| Validador | ✅ | careerValidation.ts |
| Tabelas SQL | ✅ | TABELAS-CARREIRA-VMEC.sql |
| Trigger Automático | ✅ | SQL |
| Função VMEC | ✅ | SQL |
| View Resumo | ✅ | SQL |
| Documentação | ✅ | Este arquivo |

---

💛🖤 **RS PRÓLIPSI - PLANO DE CARREIRA 100% PARAMETRIZADO!**

**Tudo configurado, validado e pronto para uso!** 🚀
