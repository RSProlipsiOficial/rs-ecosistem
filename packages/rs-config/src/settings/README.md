# ⚙️ Settings - Configurações Estruturais

Arquivos JSON que definem os **alcances, estruturas e limites** das regras operacionais.

---

## 📁 Arquivos

### **matrix.json** - Matriz SIGME
```json
{
  "sigme": {
    "structure": {
      "levelsStructural": 1,      // 1 nível estrutural
      "slotsPerCycle": 6          // 6 posições
    },
    "reentry": {
      "enabled": true,            // Reentrada habilitada
      "minPersonalPurchaseBRL": 60 // R$ 60 mínimo
    }
  }
}
```

### **depth.json** - Alcances de Profundidade
```json
{
  "depth": {
    "matrixCycleDepthLevels": 6,  // Bônus de profundidade até L6
    "fidelityDepthLevels": 6,     // Pool fidelidade até L6
    "topSigmaDepthLevels": 10,    // Pool Top SIGME até L10
    "career": {
      "unlimitedDepth": true,     // Carreira SEM limite
      "unlimitedWidth": true      // Carreira SEM limite lateral
    }
  }
}
```

### **pools.json** - Pools de Fidelidade e Top SIGME
```json
{
  "fidelity": {
    "poolPct": 1.25,              // 1,25% do pool
    "unlock": {
      "byReentry": true,          // Desbloqueio por reentrada
      "requiresDirects": false    // SEM diretos obrigatórios
    },
    "depthLevels": 6              // Até L6
  },
  "topSigma": {
    "poolPct": 4.5,               // 4,5% do pool
    "top10Weights": [...],        // Pesos do Top 10
    "depthLevels": 10,            // Até L10
    "rankCounting": {
      "noWidthLimit": true,       // SEM limite lateral
      "noDepthLimit": true        // SEM limite profundidade
    }
  }
}
```

### **career.json** - Plano de Carreira
```json
{
  "career": {
    "unlimitedDepth": true,       // SEM limite profundidade
    "unlimitedWidth": true,       // SEM limite lateral
    "vme": {
      "enabled": true,            // VME ativo
      "caps": "USE_YOUR_PLAN_TABLE"
    },
    "countsForRank": [
      "sigmeCycles",              // Ciclos SIGME
      "fidelityPool",             // Pool Fidelidade
      "topSigmaPool",             // Pool Top SIGME
      "personalVolume",           // Volume pessoal
      "teamVolume"                // Volume equipe
    ]
  }
}
```

---

## 🎯 Propósito

Estes arquivos definem **estrutura e alcances**, NÃO porcentagens.

As **porcentagens** estão em `marketingRules.ts` da API e **NÃO são alteradas aqui**.

---

## 🚫 Validações Garantidas

1. ❌ Fidelidade NÃO pode exigir diretos
2. ❌ Top SIGME NÃO pode exigir diretos
3. ✅ Top SIGME DEVE contar para ranking
4. ✅ Carreira DEVE ser ilimitada (profundidade + lateral)
5. ✅ VME DEVE estar habilitado

---

**Versão:** 1.0.1  
**Última atualização:** Nov 2025
