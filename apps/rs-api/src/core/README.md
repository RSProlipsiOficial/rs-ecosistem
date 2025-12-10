# CORE - Motor Matemático RS Prólipsi

O **core/** é o coração da API - traduz as regras do `config/` em comportamento operacional.

## 📁 Estrutura

```
core/
├── sigma.ts       # Estrutura da matriz 6x6
├── sigme.ts       # Progressão e reentrada
├── payouts.ts     # Distribuição de valores
├── trigger.ts     # Eventos de ciclo
└── index.ts       # Exportações
```

---

## 📐 sigma.ts - Matriz 6x6

Define a estrutura da matriz SIGMA e suas propriedades.

**Funções:**
- `totalSlots()` - Total de posições: 55.986
- `entryAmount()` - Valor de entrada: R$ 360

**Metas por nível:**
- L1: 6
- L2: 36
- L3: 216
- L4: 1.296
- L5: 7.776
- L6: 46.656

---

## 🔄 sigme.ts - Progressão SIGME

Controla reentradas e desbloqueios.

**Funções:**
- `canReenter(currentCycle)` - Verifica se pode reentrar (limite: 10)
- `nextCycleValue()` - Valor do próximo ciclo: R$ 360
- `unlockedCycles(currentCycle)` - Ciclos desbloqueados pela regra N → N-1

**Regra de desbloqueio:**
- Ciclo 1: nenhum desbloqueado
- Ciclo 2-9: desbloqueia N-1
- Ciclo 10+: desbloqueia [N-1, N]

---

## 💰 payouts.ts - Distribuição de Valores

Calcula todos os bônus baseados na base do ciclo (R$ 360).

**Funções:**

### `cycleBonus(base)`
- Calcula 30% do ciclo
- Retorno: R$ 108,00

### `depthBonuses(base)`
- Calcula 6,81% distribuído em 6 níveis
- Retorno: Array com valores por nível

| Nível | % | Valor |
|-------|---|-------|
| L1 | 0,48% | R$ 1,72 |
| L2 | 0,54% | R$ 1,96 |
| L3 | 0,68% | R$ 2,45 |
| L4 | 1,02% | R$ 3,68 |
| L5 | 1,70% | R$ 6,13 |
| L6 | 2,38% | R$ 8,58 |

### `fidelityPool(base)`
- Calcula 1,25% para o pool
- Retorno: R$ 4,50

### `topSigmaPool(base)`
- Calcula 4,5% para o pool
- Retorno: R$ 16,20

---

## ⚡ trigger.ts - Eventos de Ciclo

Dispara quando um usuário completa um ciclo.

**Função: `onCycleComplete(userId, level)`**

Retorna:
```typescript
{
  userId: string,
  level: number,
  base: 360,
  results: {
    totalCycleBonus: 108,
    depth: [...], // Array L1-L6
    fidelity: 4.5,
    topSigma: 16.2
  }
}
```

---

## 🧪 Testar o CORE

```bash
npx ts-node src/core/core.test.ts
```

---

## 📊 Exemplo de Uso

```typescript
import { sigma, sigme, payout, onCycleComplete } from "./core";

// Verificar matriz
console.log(sigma.totalSlots()); // 55986

// Verificar reentrada
if (sigme.canReenter(5)) {
  console.log("Pode reentrar!");
}

// Calcular bônus
const bonus = payout.cycleBonus(360); // 108
const depth = payout.depthBonuses(360); // Array L1-L6

// Disparar evento
const result = onCycleComplete("USER123", 3);
console.log(result);
```

---

**Última atualização:** Nov 2025  
**Versão:** 1.0.1
