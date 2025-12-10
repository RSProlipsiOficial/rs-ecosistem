# ✅ REGRAS CONSOLIDADAS - RS Prólipsi

## 🎯 Verdade Operacional Garantida

Este documento confirma que **TODAS** as regras foram implementadas exatamente como definido, com validações automáticas que **impedem** o servidor de iniciar se alguma regra estiver incorreta.

---

## 📊 Estrutura Implementada

### 📁 **rs-config/src/settings/**
Arquivos JSON que definem alcances e estruturas:
- ✅ `matrix.json` - Estrutura SIGME (1x6, reentrada R$60)
- ✅ `depth.json` - Alcances (L6, L6, L10)
- ✅ `pools.json` - Fidelidade (1.25%) e Top SIGME (4.5%)
- ✅ `career.json` - Ilimitado + VME

### 📁 **rs-api/src/core/rules/**
Validadores que leem o config e garantem conformidade:
- ✅ `sigmeRules.ts` - Valida matriz 6x6, reentrada, profundidade
- ✅ `fidelityRules.ts` - Valida pool, SEM diretos, L6
- ✅ `topSigmaRules.ts` - Valida pool, SEM diretos, L10, ranking
- ✅ `careerRules.ts` - Valida ilimitado, VME, contagem

---

## 🔐 Validações Automáticas

### ✅ **Na Inicialização do Servidor:**

```
🚀 Iniciando RS Prólipsi API...

✅ Plano de marketing validado (versão 1.0.1)
🔍 Validando regras operacionais...

✅ Regras SIGME validadas
✅ Regras de Fidelidade validadas
✅ Regras de Top SIGME validadas
✅ Regras de Carreira validadas

✅ TODAS as regras operacionais validadas com sucesso!
```

Se **qualquer** regra estiver errada, o servidor **NÃO inicia**.

---

## 📋 Resumo das Regras

### 🔷 **Matriz SIGME**
| Item | Valor | Status |
|------|-------|--------|
| Estrutura | 1 nível, 6 slots | ✅ |
| Reentrada | R$ 60,00 | ✅ |
| Bônus Ciclo | 30% | ✅ |
| Profundidade | L1-L6 (6.81%) | ✅ |
| Diretos obrigatórios | Não | ✅ |

### 💛 **Fidelidade**
| Item | Valor | Status |
|------|-------|--------|
| Pool | 1,25% | ✅ |
| Diretos obrigatórios | **NÃO** | ✅ |
| Desbloqueio | Por reentrada | ✅ |
| Alcance | L1-L6 | ✅ |

### 🏆 **Top SIGME**
| Item | Valor | Status |
|------|-------|--------|
| Pool | 4,5% | ✅ |
| Diretos obrigatórios | **NÃO** | ✅ |
| Alcance | L1-L10 | ✅ |
| Limite lateral | **NÃO** | ✅ |
| Limite profundidade | **NÃO** | ✅ |
| Conta para ranking | **SIM** | ✅ |

### 📈 **Carreira**
| Item | Valor | Status |
|------|-------|--------|
| Profundidade ilimitada | **SIM** | ✅ |
| Lateralidade ilimitada | **SIM** | ✅ |
| VME habilitado | **SIM** | ✅ |
| Conta para rank | Tudo | ✅ |

---

## 🚫 Proibições Garantidas

Estas regras **NUNCA** serão violadas, pois o servidor valida na inicialização:

1. ❌ **Fidelidade NÃO PODE exigir diretos**
2. ❌ **Top SIGME NÃO PODE exigir diretos**
3. ❌ **Carreira NÃO PODE ter limites**
4. ✅ **Top SIGME DEVE contar para ranking**
5. ✅ **VME DEVE estar habilitado**

---

## 🔄 Separação de Pagamentos

### **Matriz ≠ Profundidade**

#### **Bônus do Ciclo** (30% = R$ 108,00)
- Pago ao CICLADOR quando completa os 6 slots
- Valor fixo da base (R$ 360)

#### **Bônus de Profundidade** (6,81%)
- Pago quando DOWNLINES ciclam
- Alcance: L1 até L6
- Usa pesos do config

Ambos são **independentes** e **acumuláveis**.

---

## 📊 Pools

### **Fidelidade** (1,25%)
- Divide entre TODOS os participantes ativos
- Ativa por reentrada (R$ 60)
- SEM exigência de diretos
- Alcance: L6

### **Top SIGME** (4,5%)
- Divide entre Top 10 performers
- Pesos: [2.0, 1.5, 1.2, 1.0, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]
- SEM exigência de diretos
- Alcance: L10
- Conta para ranking

---

## 🧪 Como Testar

```bash
# Rodar validações isoladas
npx ts-node src/core/rules/test.ts

# Rodar servidor (valida automaticamente)
npm run dev
```

---

## 📝 Mantendo Conformidade

### **✅ O que PODE ser alterado:**
- Valores de % no `marketingRules.ts` (se necessário)
- VME caps no `career.json`
- Pesos do Top 10

### **❌ O que NÃO PODE ser alterado:**
- Estrutura da matriz (sempre 1x6)
- Alcances (L6, L6, L10)
- Remoção de validações
- Exigência de diretos em Fidelidade/Top SIGME
- Limites na Carreira

---

## 🔒 Garantias de Integridade

✅ **Config** define as %  
✅ **Rules** valida a estrutura  
✅ **Server** não inicia se houver erro  
✅ **Tests** podem ser rodados a qualquer momento  
✅ **Documentação** sempre atualizada  

---

**Status:** ✅ TOTALMENTE VALIDADO  
**Versão:** 1.0.1  
**Data:** Nov 2025  
**Autor:** Roberto Camargo | RS Prólipsi
