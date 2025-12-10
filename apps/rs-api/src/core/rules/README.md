# 🎯 Regras Operacionais RS Prólipsi

Este diretório consolida **TODAS** as regras operacionais do sistema, garantindo que nenhuma lógica fuja do que foi definido no plano de marketing.

---

## 📁 Estrutura

```
rules/
├── sigmeRules.ts       # Matriz SIGME (ciclo + profundidade)
├── fidelityRules.ts    # Pool de Fidelidade
├── topSigmaRules.ts    # Pool Top SIGME
├── careerRules.ts      # Plano de Carreira + VME
└── index.ts            # Validações consolidadas
```

---

## 🔐 Regras Garantidas

### ✅ **1. Matriz SIGME**

- **Estrutura:** 1 nível, 6 posições
- **Ciclo:** Preencheu 6 → ciclou
- **Reentrada:** R$ 60,00 (sem exigência de diretos)
- **Bônus do Ciclo:** 30% da base (R$ 360)
- **Profundidade:** Paga quando downlines ciclam até L6

### ✅ **2. Pool de Fidelidade**

- **Pool:** 1,25%
- **Desbloqueio:** Por reentrada (comprou/reciclou → participa)
- **Diretos:** ❌ SEM exigência de diretos
- **Alcance:** Até L6

### ✅ **3. Pool Top SIGME**

- **Pool:** 4,5%
- **Distribuição:** Top 10 com pesos [2.0, 1.5, 1.2, 1.0, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]
- **Diretos:** ❌ SEM exigência de diretos
- **Alcance:** Até L10
- **Ranking:** ✅ SEM limite de lateralidade/profundidade

### ✅ **4. Plano de Carreira**

- **Profundidade:** ✅ ILIMITADA
- **Lateralidade:** ✅ ILIMITADA
- **VME:** Ativo (Volume Máximo por Linha)
- **Contam para rank:** Ciclos SIGME + Fidelidade + Top SIGME + Volume Pessoal + Volume Equipe

---

## 🚫 Validações Críticas

### ❌ **Proibições Absolutas:**

1. **Fidelidade NÃO PODE exigir diretos**
2. **Top SIGME NÃO PODE exigir diretos**
3. **Top SIGME DEVE contar para ranking**
4. **Carreira DEVE ser sem limites de profundidade/lateralidade**
5. **VME DEVE estar habilitado**

---

## 🧪 Como Testar

```bash
# Rodar validações
npm run dev

# Ou testar manualmente
node -r ts-node/register src/core/rules/test.ts
```

---

## 📊 Separação de Pagamentos

### **Bônus do Ciclo** (30%)
- Pagamento direto ao ciclador
- Base: R$ 360,00
- Valor: R$ 108,00

### **Bônus de Profundidade** (6,81%)
- Paga quando seus downlines ciclam
- Alcance: L1 até L6
- Usa pesos definidos no config

### **Pool Fidelidade** (1,25%)
- Divide entre participantes ativos
- Desbloqueio por reentrada

### **Pool Top SIGME** (4,5%)
- Divide entre Top 10
- Até L10 de alcance

---

## 🔄 Fluxo de Validação

1. **Servidor inicia** → `validateAllRules()`
2. **Valida SIGME** → estrutura, reentrada, profundidade
3. **Valida Fidelidade** → pool, sem diretos, L6
4. **Valida Top SIGME** → pool, sem diretos, L10, ranking
5. **Valida Carreira** → ilimitado, VME, contagem

Se **qualquer** validação falhar → **servidor NÃO inicia**

---

## 📝 Mantendo as % Corretas

**IMPORTANTE:** As porcentagens já definidas no `marketingRules.ts` são mantidas:

- Ciclo: **30%**
- Profundidade: **6,81%** (dividido em 6 níveis)
- Fidelidade: **1,25%**
- Top SIGME: **4,5%**

Estes arquivos **NÃO alteram %**, apenas estruturam a lógica operacional.

---

**Versão:** 1.0.1  
**Última atualização:** Nov 2025
