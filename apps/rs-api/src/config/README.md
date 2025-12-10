# Config - Regras de Marketing RS Prólipsi

## 📋 Resumo das Regras Implementadas

### 💰 Base do Ciclo
- **Kit**: R$ 60,00
- **Ciclo completo**: R$ 360,00 (6 kits)
- **Payout direto**: 30% = R$ 108,00

### 🎯 Matriz SIGMA 6x6
- **Estrutura**: 6 de largura × 6 de profundidade
- **Metas por nível**:
  - L1: 6
  - L2: 36
  - L3: 216
  - L4: 1.296
  - L5: 7.776
  - L6: 46.656
- **Qualificação**: 6 diretos (para ciclar)

### 📊 Bônus de Profundidade (6,81%)
**Base**: R$ 24,52 por ciclo (6,81% de R$ 360)

**Distribuição por nível** (dispara quando downline CLICA):
- **L1**: 7% = R$ 1,72
- **L2**: 8% = R$ 1,96
- **L3**: 10% = R$ 2,45
- **L4**: 15% = R$ 3,68
- **L5**: 25% = R$ 6,13
- **L6**: 35% = R$ 8,58

### 💛 Fidelidade (POOL 1,25%)
- **Pool por ciclo**: R$ 4,50 (1,25% de R$ 360)
- **Sem exigência de diretos**
- **Desbloqueio**: N desbloqueia N-1 (no 10º, libera 9 e 10)
- **Gatilho**: Compra de R$ 60 (reciclo/reativação)

### 🏆 Top SIGMA (POOL 4,5%)
- **Pool por ciclo**: R$ 16,20 (4,5% de R$ 360)
- **Sem exigência de diretos**
- **Distribuição TOP 10** (pesos relativos):
  1. 2,0%
  2. 1,5%
  3. 1,2%
  4. 1,0%
  5. 0,8%
  6. 0,7%
  7. 0,6%
  8. 0,5%
  9. 0,4%
  10. 0,3%

### 🎖️ Plano de Carreira
- **Status**: Ativo
- **Acúmulo**: Trimestral
- **Potencial**: Até R$ 135.000 (conforme tabela de PINs no Admin)

---

## 📈 Distribuição Total

| Bônus | Percentual | Valor (base R$ 360) |
|-------|------------|---------------------|
| Ciclo direto | 30,00% | R$ 108,00 |
| Profundidade | 6,81% | R$ 24,52 |
| Fidelidade | 1,25% | R$ 4,50 |
| Top SIGMA | 4,5% | R$ 16,20 |
| **TOTAL** | **42,56%** | **R$ 153,22** |

---

## 🔧 Uso no código

```typescript
import { rules } from "./config";

// Acessar valores
console.log(rules.cycleBaseBRL);        // 360
console.log(rules.sigma.levelTargets);  // [6, 36, 216, ...]
console.log(rules.depth.weights);       // [7, 8, 10, 15, 25, 35]

// Calcular bônus
const depthBonus = rules.cycleBaseBRL * (rules.depth.totalPct / 100);
console.log(depthBonus); // 24.516
```

---

## ✅ Validação

Para testar as regras:

```bash
npx ts-node src/config/marketingRules.test.ts
```

---

**Versão**: 1.0.1  
**Última atualização**: Nov 2025
