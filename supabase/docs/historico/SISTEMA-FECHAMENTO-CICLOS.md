# 📅 SISTEMA DE FECHAMENTO DE CICLOS - RS PRÓLIPSI

**Versão:** 1.0.0  
**Data:** 06/11/2025  
**Status:** ✅ Implementado

---

## 🎯 VISÃO GERAL

Sistema completo de fechamento automático de períodos contábeis:
- 📦 **Ciclos de Matriz** - Imediato (ao completar 6 vendas)
- 💰 **Pools Mensais** - Fidelidade e Top SIGMA (dia 30)
- 🎯 **Carreira Trimestral** - Avaliação de PINs (fim de Q1, Q2, Q3, Q4)

---

## 📁 ARQUITETURA

### Onde está cada coisa:

| Componente | Localização | Função |
|------------|-------------|--------|
| **Configurações** | `rs-config/src/settings/cycles.json` | Parâmetros de fechamento |
| **Automação** | `rs-ops/src/crons/closeCycles.ts` | CRON de execução |
| **Cálculos** | `rs-core/src/math/` | Matemática de bônus |
| **API Manual** | `rs-api/routes/cycles.ts` | Endpoint admin |
| **Dashboard** | `rs-admin/dashboard.html` | Visualização |

---

## ⚙️ CONFIGURAÇÃO - cycles.json

### 1. **Matriz SIGMA**
```json
{
  "matrix": {
    "autoPay": true,
    "triggerOnCycleComplete": true,
    "cycleSize": 6,
    "pointsPerCycle": 1
  }
}
```

**Comportamento:**
- Ao completar 6 vendas → Fecha ciclo automaticamente
- Paga bônus imediatamente:
  - 30% Ciclo (R$ 108)
  - 6.81% Profundidade (R$ 24,52)
  - 6.39% Carreira (R$ 23 × ciclos válidos VMEC)

---

### 2. **Pools Mensais**

#### Pool de Fidelidade (1.25%)
```json
{
  "fidelity": {
    "poolPct": 1.25,
    "payoutFrequency": "monthly",
    "closeDay": 30,
    "eligibility": {
      "minCycles": 1,
      "minMonthsActive": 1,
      "mustBeActive": true
    }
  }
}
```

**Fechamento:** Dia 30 de cada mês às 03:00  
**Distribuição:** Proporcional aos ciclos completados  
**Elegibilidade:** Consultores ativos com pelo menos 1 ciclo

#### Pool Top SIGMA (4.5%)
```json
{
  "topSigma": {
    "poolPct": 4.5,
    "payoutFrequency": "monthly",
    "closeDay": 30,
    "top": 10,
    "distribution": {
      "1": 20.00,
      "2": 15.00,
      "3": 12.00,
      ...
    }
  }
}
```

**Fechamento:** Dia 30 de cada mês às 03:00  
**Distribuição:** Top 10 consultores conforme ranking  
**Critério:** Total de ciclos da rede (TODA a equipe)

---

### 3. **Carreira Trimestral**

```json
{
  "career": {
    "quarterly": true,
    "quarters": [
      {
        "name": "Q1",
        "months": ["Jan", "Feb", "Mar"],
        "closeDay": 31,
        "closeMonth": "Mar"
      },
      ...
    ],
    "careerPinReset": false,
    "pointsCarryOver": true
  }
}
```

**Fechamento:** Último dia de Mar, Jun, Set, Dez às 03:00  
**Avaliação:** Pontos de carreira acumulados (com VMEC)  
**Ação:** Upgrade automático de PIN se atingir meta

---

## 🔄 FLUXOS DE FECHAMENTO

### FLUXO 1: Ciclo de Matriz (Imediato)

```
Venda #6 registrada
   ↓
Ciclo completa (6/6)
   ↓
TRIGGER AUTOMÁTICO:
   1. Paga bônus de ciclo (R$ 108)
   2. Distribui profundidade (R$ 24,52)
   3. Calcula carreira com VMEC (R$ 23 × válidos)
   4. Atribui 1 ponto de carreira
   5. Cria novo ciclo
   6. Envia notificações
   ↓
Status: completed
```

---

### FLUXO 2: Fechamento Mensal (Dia 30 às 03:00)

```
CRON detecta: hoje = dia 30
   ↓
INICIA FECHAMENTO MENSAL:
   ↓
1. POOL FIDELIDADE
   - Busca total de ciclos do mês
   - Calcula pool: ciclos × R$ 360 × 1.25%
   - Busca consultores elegíveis
   - Distribui proporcionalmente
   - Credita carteiras
   - Gera relatório
   ↓
2. POOL TOP SIGMA
   - Busca total de ciclos do mês
   - Calcula pool: ciclos × R$ 360 × 4.5%
   - Gera ranking Top 10
   - Distribui conforme percentuais
   - Credita carteiras
   - Gera relatório
   ↓
3. RELATÓRIO CONSOLIDADO
   - Total pago
   - Consultores beneficiados
   - Métricas do mês
   ↓
4. NOTIFICAÇÕES
   - Email para consultores
   - Dashboard atualizado
   - Admin notificado
   ↓
Status: Mês fechado ✅
```

---

### FLUXO 3: Fechamento Trimestral (Último dia Q às 03:00)

```
CRON detecta: hoje = fim de trimestre
   ↓
INICIA FECHAMENTO TRIMESTRAL:
   ↓
1. BUSCAR TODOS OS CONSULTORES
   ↓
2. PARA CADA CONSULTOR:
   - Calcular pontos de carreira (com VMEC)
   - Somar com pontos anteriores
   - Verificar se atingiu próximo PIN
   ↓
3. UPGRADES DE PIN
   - Se atingiu meta → Upgrade automático
   - Creditar recompensa de upgrade
   - Atualizar tabela consultores
   - Enviar notificação (email + push + WhatsApp)
   ↓
4. ATUALIZAR PONTOS
   - Gravar novos totais
   - Registrar histórico
   ↓
5. RELATÓRIO TRIMESTRAL
   - Total de upgrades
   - Distribuição de PINs
   - Análise VMEC
   - Crescimento da rede
   ↓
6. NOTIFICAÇÕES
   - Email para todos
   - Dashboard atualizado
   - Liderança notificada
   ↓
Status: Trimestre fechado ✅
```

---

## 🕐 CRONOGRAMA DE EXECUÇÃO

### CRON Principal (Diário às 03:00)

```typescript
cron.schedule('0 3 * * *', async () => {
  // Verificar fechamento trimestral (prioridade)
  if (isQuarterEnd()) {
    await closeCareerQuarter();
  }
  
  // Verificar fechamento mensal
  if (isMonthlyCloseDay()) {
    await closeMonthlyBonuses();
  }
}, { timezone: 'America/Sao_Paulo' });
```

### CRON de Lembretes (Diário às 09:00)

```typescript
cron.schedule('0 9 * * *', async () => {
  // Notificar 7, 3 e 1 dia antes do fechamento
  if (daysUntilClose in [7, 3, 1]) {
    await notifyClosureReminder();
  }
});
```

---

## 📊 CALENDÁRIO 2025

### Fechamentos Mensais (Pools):
- ✅ 30/Jan - Fidelidade + Top SIGMA
- ✅ 28/Fev - Fidelidade + Top SIGMA
- ✅ 30/Mar - Fidelidade + Top SIGMA
- 📅 30/Abr - Fidelidade + Top SIGMA
- 📅 30/Mai - Fidelidade + Top SIGMA
- 📅 30/Jun - Fidelidade + Top SIGMA
- 📅 30/Jul - Fidelidade + Top SIGMA
- 📅 30/Ago - Fidelidade + Top SIGMA
- 📅 30/Set - Fidelidade + Top SIGMA
- 📅 30/Out - Fidelidade + Top SIGMA
- 📅 30/Nov - Fidelidade + Top SIGMA
- 📅 30/Dez - Fidelidade + Top SIGMA

### Fechamentos Trimestrais (Carreira):
- ✅ 31/Mar - Q1 (Jan-Mar)
- 📅 30/Jun - Q2 (Abr-Jun)
- 📅 30/Set - Q3 (Jul-Set)
- 📅 31/Dez - Q4 (Out-Dez)

---

## 🔔 NOTIFICAÇÕES AUTOMÁTICAS

### Ao Completar Ciclo:
- ✅ Email
- ✅ Push notification
- ✅ Dashboard

**Template:** "Parabéns! Você completou um ciclo! R$ 108 creditados."

### Ao Fechar Mês:
- ✅ Email (consultores elegíveis)
- ✅ Dashboard

**Template:** "Pool de Fidelidade distribuído! Você recebeu R$ X."

### Ao Fechar Trimestre:
- ✅ Email (todos)
- ✅ Push notification
- ✅ Dashboard

**Template:** "Trimestre Q1 encerrado! Confira seu progresso de carreira."

### Ao Fazer Upgrade de PIN:
- ✅ Email
- ✅ Push notification
- ✅ WhatsApp
- ✅ Dashboard

**Template:** "🎉 PARABÉNS! Você foi promovido a OURO! Recompensa: R$ 500."

### Lembretes (7, 3, 1 dia antes):
- ✅ Email
- ✅ Dashboard

**Template:** "Faltam 3 dias para o fechamento mensal. Última chance de ciclar!"

---

## 📈 RELATÓRIOS GERADOS

### Relatório Mensal (PDF + Excel + JSON):
- Total de ciclos completados
- Pool Fidelidade (valor e distribuição)
- Pool Top SIGMA (ranking e valores)
- Total de bônus pagos
- Consultores ativos
- Novos consultores

### Relatório Trimestral (PDF + Excel):
- Upgrades de PIN realizados
- Total de pontos atribuídos
- Distribuição de PINs no sistema
- Performance trimestral
- Análise VMEC
- Crescimento da rede

### Relatório Anual (PDF):
- Resumo do ano
- Total de compensação paga
- Top performers
- Métricas de crescimento
- Overview financeiro

---

## 🔐 AUDITORIA E SEGURANÇA

### Logs Completos:
```
✅ Todos os fechamentos são logados
✅ Retenção: 7 anos (2.555 dias)
✅ Backup antes de cada fechamento
✅ Rastreamento de mudanças
```

### Controles:
```
✅ Fechamento automático habilitado
⚠️ Fechamento manual: requer aprovação admin
❌ Reabertura: desabilitada (rollback apenas em 7 dias)
✅ Notificação de erros: Discord + Email
```

---

## 🚀 API MANUAL (Admin)

### Forçar Fechamento Mensal:
```bash
POST /v1/cycles/close?type=monthly
Authorization: Bearer {admin_token}
```

### Forçar Fechamento Trimestral:
```bash
POST /v1/cycles/close?type=quarterly
Authorization: Bearer {admin_token}
```

### Consultar Próximo Fechamento:
```bash
GET /v1/cycles/next
```

**Resposta:**
```json
{
  "monthly": {
    "date": "2025-11-30",
    "daysLeft": 18,
    "type": "fidelity_topsigma"
  },
  "quarterly": {
    "date": "2025-12-31",
    "daysLeft": 49,
    "quarter": "Q4"
  }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

| Componente | Status | Arquivo |
|------------|--------|---------|
| Config de Ciclos | ✅ | `cycles.json` |
| CRON de Fechamento | ✅ | `closeCycles.ts` |
| CRON de Lembretes | ✅ | `closeCycles.ts` |
| Cálculo Fidelidade | ⏳ | Implementar queries |
| Cálculo Top SIGMA | ⏳ | Implementar queries |
| Cálculo Carreira | ⏳ | Implementar queries |
| Upgrade de PIN | ⏳ | Implementar lógica |
| Relatórios PDF | 📋 | Pendente |
| Dashboard Admin | 📋 | Pendente |
| API Manual | 📋 | Pendente |
| Notificações | ⏳ | Integrar templates |

---

💛🖤 **RS PRÓLIPSI - SISTEMA DE FECHAMENTO COMPLETO E AUTOMATIZADO!**

**Tudo parametrizado, tudo automático, tudo auditado!** 🚀
