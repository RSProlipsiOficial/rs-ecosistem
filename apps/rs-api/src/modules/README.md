# MODULES - Lógica Operacional RS Prólipsi

Os **modules/** encapsulam a lógica de negócio que usa o `core/` para executar operações específicas.

## 📁 Estrutura

```
modules/
├── cycle/         # Gerenciamento de ciclos
├── bonus/         # Distribuição de bônus
├── fidelity/      # Lógica de fidelidade
├── topsigma/      # Cálculo do pool TOP SIGMA
└── index.ts       # Exportações
```

---

## 🔁 cycle/ - Gerenciamento de Ciclos

### `executeCycle(userId, currentCycle)`

Executa um ciclo e retorna o resultado.

**Retorno:**
```typescript
{
  userId: string,
  currentCycle: number,
  gain: 108,
  unlocked: [number] // Ciclos desbloqueados
}
```

**Bloqueio:** Após 10 reentradas, retorna `{ status: "blocked" }`

### `handleCycleCompleted(userId, level)`

Evento disparado quando um ciclo é completado. Inclui logs e pode ser estendido para:
- Salvar no banco
- Enviar notificações
- Disparar webhooks

---

## 💸 bonus/ - Distribuição de Bônus

### `distributeBonuses(userId)`

Calcula todos os bônus para um usuário.

**Retorno:**
```typescript
{
  userId: string,
  base: 360,
  cycle: 108,
  depth: [...], // Array L1-L6
  pools: {
    fidelity: 4.5,
    topSigma: 16.2
  }
}
```

### `calculateTotalEarnings(cycleCount)`

Projeta ganhos totais baseado no número de ciclos.

**Retorno:**
```typescript
{
  cycleCount: number,
  perCycle: {
    cycle: 108,
    depth: 24.52
  },
  total: {
    cycle: 1080,        // 10 ciclos
    depth: 245.20,
    grand: 1325.20
  }
}
```

---

## 💛 fidelity/ - Fidelidade (Pool 1,25%)

### `checkFidelityUnlock(cycleNumber)`

Retorna quais ciclos foram desbloqueados pela regra N → N-1.

**Exemplos:**
- Ciclo 1: `[]`
- Ciclo 3: `[2]`
- Ciclo 10: `[9]`

### `getFidelityShare(totalVolumeBRL, userPoints, totalPoints)`

Calcula a participação de um usuário no pool de fidelidade.

**Exemplo:**
```typescript
// Volume global: R$ 100.000
// Usuário tem 5.000 pontos de 50.000 totais (10%)
const share = getFidelityShare(100000, 5000, 50000);
// Retorno: R$ 125,00 (10% do pool de R$ 1.250)
```

### `canParticipateInFidelity(hasRecycled, minPurchase)`

Verifica se o usuário pode participar do pool (precisa ter reciclado com R$ 60+).

---

## 🏆 topsigma/ - Top SIGMA (Pool 4,5%)

### `distributeTopSigmaPool(totalVolumeBRL)`

Distribui o pool entre os TOP 10.

**Retorno (exemplo com R$ 100k de volume):**
```typescript
[
  { rank: 1, percent: 22.22, share: 1000 },
  { rank: 2, percent: 16.67, share: 750 },
  { rank: 3, percent: 13.33, share: 600 },
  // ... até rank 10
]
```

### `getTopSigmaShareByCycle(rank, cycleBaseBRL)`

Calcula quanto cada posição do TOP 10 recebe **por ciclo**.

**Exemplos (base R$ 360):**
- #1: R$ 3,60 por ciclo
- #2: R$ 2,70 por ciclo
- #10: R$ 0,54 por ciclo

---

## 🧪 Testar os Módulos

```bash
npx ts-node src/core/core.test.ts
```

Este teste valida todos os módulos em conjunto.

---

## 📊 Fluxo de Uso

```typescript
import { executeCycle } from "./modules/cycle/cycle.module";
import { distributeBonuses } from "./modules/bonus/bonus.module";
import { getFidelityShare } from "./modules/fidelity/fidelity.logic";
import { distributeTopSigmaPool } from "./modules/topsigma/topsigma.calc";

// 1. Executar ciclo
const result = executeCycle("USER123", 5);

// 2. Distribuir bônus
const bonuses = distributeBonuses("USER123");

// 3. Calcular fidelidade
const fidelityShare = getFidelityShare(100000, 5000, 50000);

// 4. Distribuir Top SIGMA
const topDistribution = distributeTopSigmaPool(100000);
```

---

## 🔗 Relação com o CORE

| Módulo | Usa do CORE | Função |
|--------|-------------|---------|
| **cycle** | `sigme`, `payout` | Controle de reentradas |
| **bonus** | `payout` | Cálculos de distribuição |
| **fidelity** | `rules` (via config) | Pool proporcional |
| **topsigma** | `rules` (via config) | Pool ranking |

---

**Última atualização:** Nov 2025  
**Versão:** 1.0.1
