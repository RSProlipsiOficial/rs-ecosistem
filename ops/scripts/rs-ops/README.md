# 🎯 RS PRÓLIPSI - OPS

**Motor Operacional do Sistema de Marketing Multinível**

Responsável por cálculo e distribuição de bônus, fechamento de ciclos, validações, jobs automáticos, CRONs agendados e monitoramento em tempo real.

**Versão:** 2.0.0 - Estrutura Completa  
**Status:** ✅ Pronto para Produção

---

## 📊 Valores Oficiais Implementados

### 💰 Bônus por Ciclo (Base: R$ 360)

| Tipo | Percentual | Valor | Descrição |
|------|-----------|-------|-----------|
| **Ciclo** | 30% | R$ 108,00 | Pago ao consultor que ciclou |
| **Profundidade** | 6,81% | R$ 24,52 | Distribuído L1-L6 |
| **Fidelidade** | 1,25% | R$ 4,50 | Pool mensal |
| **Top SIGMA** | 4,5% | R$ 16,20 | Pool Top 10 |
| **Carreira** | 6,39% | R$ 23,00 | Plano de carreira |
| **TOTAL** | **48,95%** | **R$ 176,22** | Total distribuído |

---

## 📁 Estrutura do Projeto

```
rs-ops/
├── src/
│   ├── core/                    # Lógica de negócio principal
│   │   ├── cycles/              # Gerenciamento de ciclos
│   │   │   ├── closeCycle.ts    # Fecha ciclo (6 posições)
│   │   │   ├── openCycle.ts     # Abre novo ciclo
│   │   │   └── reentryCycle.ts  # Processa reentrada
│   │   ├── distribution/        # Cálculo e pagamento de bônus
│   │   │   ├── calculateBonus.ts  # Orquestrador de cálculos
│   │   │   ├── payDepth.ts        # Profundidade L1-L6
│   │   │   ├── payFidelity.ts     # Pool fidelidade
│   │   │   └── payTopSigma.ts     # Pool Top 10
│   │   └── validation/          # Validações de negócio
│   │       ├── checkActive.ts     # Verifica se ativo
│   │       ├── checkReentry.ts    # Valida reentrada
│   │       └── checkQualified.ts  # Verifica qualificação
│   ├── services/                # Integrações externas
│   │   ├── supabaseService.ts   # Banco de dados (rs-core)
│   │   ├── walletService.ts     # Pagamentos (rs-walletpay)
│   │   └── notificationService.ts # Notificações
│   ├── jobs/                    # Jobs automáticos
│   │   ├── dailySettlement.ts   # Fechamento diário
│   │   ├── weeklyFidelity.ts    # Pool semanal
│   │   └── monthlyTopSigma.ts   # Pool mensal Top 10
│   ├── utils/                   # Utilitários
│   │   ├── log.ts               # Sistema de logs
│   │   ├── math.ts              # Cálculos matemáticos
│   │   └── format.ts            # Formatadores
│   └── index.ts                 # Ponto de entrada
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### 1. Instalação

```bash
cd rs-ops
npm install
```

### 2. Configuração

Copie `.env.example` para `.env` e configure:

```env
# Supabase (rs-core)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Logs
LOG_LEVEL=info

# Jobs
ENABLE_DAILY_JOB=true
ENABLE_WEEKLY_JOB=true
ENABLE_MONTHLY_JOB=true
```

### 3. Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

---

## 📖 Como Usar

### Fechar um Ciclo

```typescript
import { closeCycle } from 'rs-ops';

await closeCycle('consultor-id-123');
```

**O que acontece:**
1. ✅ Valida se tem 6 posições
2. ✅ Paga R$ 108 ao ciclador (30%)
3. ✅ Distribui R$ 24,52 em profundidade (L1-L6)
4. ✅ Registra R$ 4,50 no pool fidelidade
5. ✅ Atualiza ranking Top SIGMA
6. ✅ Envia notificação
7. ✅ Registra auditoria

---

### Processar Reentrada

```typescript
import { reentryCycle } from 'rs-ops';

await reentryCycle({
  consultorId: 'consultor-id-123',
  valorPago: 60.00
});
```

**O que acontece:**
1. ✅ Valida valor (R$ 60)
2. ✅ Verifica limite (10×/mês)
3. ✅ Abre novo ciclo
4. ✅ Aciona pool fidelidade

---

### Calcular Bônus

```typescript
import { calculateAllBonuses, printBonusBreakdown } from 'rs-ops';

const breakdown = calculateAllBonuses();
console.log(breakdown);
/*
{
  ciclo: 108.00,
  profundidade: 24.52,
  fidelidade: 4.50,
  topSigma: 16.20,
  carreira: 23.00,
  total: 176.22
}
*/

// Ou visualizar
printBonusBreakdown();
/*
============================================================
💰 BREAKDOWN DE BÔNUS - RS PRÓLIPSI
============================================================
Base do Ciclo:     R$ 360.00
────────────────────────────────────────────────────────────
Ciclo (30%):       R$ 108.00
Profundidade:      R$ 24.52 (L1-L6)
Fidelidade:        R$ 4.50 (Pool)
Top SIGMA:         R$ 16.20 (Top 10)
Carreira:          R$ 23.00 (VME)
────────────────────────────────────────────────────────────
TOTAL DISTRIBUÍDO: R$ 176.22
============================================================
*/
```

---

## 🔧 Funções Principais

### Cycles

| Função | Descrição | Uso |
|--------|-----------|-----|
| `closeCycle(consultorId)` | Fecha ciclo com 6 posições | Quando ciclo completa |
| `openCycle(data)` | Abre novo ciclo | Primeira compra ou reentrada |
| `reentryCycle(request)` | Processa reentrada | Compra de R$ 60 |

### Distribution

| Função | Descrição | Valores |
|--------|-----------|---------|
| `payDepth(consultorId, cycleData)` | Paga profundidade L1-L6 | R$ 24,52 total |
| `payFidelity(consultorId, cycleData)` | Distribui pool fidelidade | R$ 4,50 por ciclo |
| `payTopSigma(consultorId, cycleData)` | Atualiza ranking | Pool mensal |
| `calculateAllBonuses()` | Calcula todos os bônus | Breakdown completo |

### Validation

| Função | Descrição | Retorno |
|--------|-----------|---------|
| `checkActive(consultorId)` | Verifica se está ativo | `boolean` |
| `checkReentry(consultorId)` | Valida reentrada (limite 10×) | `boolean` |
| `checkQualified(consultorId)` | Verifica qualificações | `QualificationResult` |

---

## 📊 Distribuição de Profundidade

### Pesos L1-L6 (Total: R$ 24,52)

| Nível | Peso | Valor | Cálculo |
|-------|------|-------|---------|
| L1 | 7% | R$ 1,72 | 24,52 × 7% |
| L2 | 8% | R$ 1,96 | 24,52 × 8% |
| L3 | 10% | R$ 2,45 | 24,52 × 10% |
| L4 | 15% | R$ 3,68 | 24,52 × 15% |
| L5 | 25% | R$ 6,13 | 24,52 × 25% |
| L6 | 35% | R$ 8,58 | 24,52 × 35% |

**Código:**
```typescript
import { calculateDepthBonus } from 'rs-ops';

const bonusL1 = calculateDepthBonus(1); // R$ 1,72
const bonusL6 = calculateDepthBonus(6); // R$ 8,58
```

---

## 🏆 Pool Top SIGMA

### Distribuição Top 10 (Total: R$ 16,20 por ciclo)

| Posição | Peso | % do Pool |
|---------|------|-----------|
| 1º | 2,0 | 22,2% |
| 2º | 1,5 | 16,7% |
| 3º | 1,2 | 13,3% |
| 4º | 1,0 | 11,1% |
| 5º | 0,8 | 8,9% |
| 6º | 0,7 | 7,8% |
| 7º | 0,6 | 6,7% |
| 8º | 0,5 | 5,6% |
| 9º | 0,4 | 4,4% |
| 10º | 0,3 | 3,3% |

**Código:**
```typescript
import { calculateTop10Share } from 'rs-ops';

const totalPool = 1620.00; // Exemplo: 100 ciclos × R$ 16,20
const share1st = calculateTop10Share(1, totalPool); // ~R$ 360
```

---

## 🔄 Jobs Automáticos

### Diário (Meia-noite)

```typescript
import { dailySettlement } from 'rs-ops';

// Executa:
// - Consolida ciclos pendentes
// - Processa pagamentos em fila
// - Atualiza rankings
// - Gera relatórios

await dailySettlement();
```

### Semanal (Segunda-feira)

```typescript
import { weeklyFidelity } from 'rs-ops';

// Distribui pool de fidelidade semanal
await weeklyFidelity();
```

### Mensal (Dia 1º)

```typescript
import { monthlyTopSigma } from 'rs-ops';

// Distribui pool Top SIGMA entre Top 10
await monthlyTopSigma();
```

---

## 🔐 Regras de Negócio

### ✅ Garantias Implementadas

1. **Ciclo fecha com 6 posições** (não menos, não mais)
2. **Profundidade paga até L6** (sem limite de lateralidade)
3. **Fidelidade SEM diretos** (apenas reentrada)
4. **Top SIGMA SEM diretos** (apenas volume)
5. **Valores exatos** (conforme documentação oficial)
6. **Auditoria completa** (todos os eventos logados)
7. **Validações rigorosas** (antes de processar)
8. **Notificações automáticas** (consultor + admin)

### 🚫 Validações Críticas

```typescript
// Exemplo de validação antes de fechar ciclo
if (downlines.length < 6) {
  throw new Error("Ciclo precisa de 6 posições");
}

// Limite de reentradas
if (monthlyReentries >= 10) {
  throw new Error("Limite de 10 reentradas/mês atingido");
}

// Valor de reentrada
if (valorPago !== 60.00) {
  throw new Error("Valor de reentrada deve ser R$ 60,00");
}
```

---

## 📝 Logs e Auditoria

Todos os eventos são registrados:

```typescript
// Exemplo de log
{
  timestamp: "2025-11-06T16:30:00.000Z",
  type: "cycle.closed",
  data: {
    consultorId: "abc-123",
    valor: 108.00,
    profundidade: "L1-L6",
    fidelidade: "Pool",
    topSigma: "Ranking"
  }
}
```

**Tipos de eventos:**
- `cycle.open` - Ciclo aberto
- `cycle.closed` - Ciclo fechado
- `cycle.skip` - Ciclo não fechou (aguardando)
- `depth.paid` - Profundidade paga
- `fidelity.paid` - Fidelidade paga
- `topsigma.paid` - Top SIGMA pago
- `payment.success` - Pagamento processado
- `payment.error` - Erro no pagamento

---

## 🧪 Testes

### Validar Percentuais

```typescript
import { validateBonusPercentages } from 'rs-ops';

const isValid = validateBonusPercentages();
// true = percentuais corretos (48,95%)
```

### Simular Ciclo Completo

```bash
npm run dev
```

Ao iniciar, mostra:

```
============================================================
🚀 RS PRÓLIPSI - OPS
Motor Operacional Iniciado
============================================================

💰 BREAKDOWN DE BÔNUS - RS PRÓLIPSI
Base do Ciclo:     R$ 360.00
────────────────────────────────────────────────────────────
Ciclo (30%):       R$ 108.00
Profundidade:      R$ 24.52 (L1-L6)
Fidelidade:        R$ 4.50 (Pool)
Top SIGMA:         R$ 16.20 (Top 10)
Carreira:          R$ 23.00 (VME)
────────────────────────────────────────────────────────────
TOTAL DISTRIBUÍDO: R$ 176.22
============================================================
```

---

## 🔗 Integração com Outros Módulos

### rs-core (Supabase)
```typescript
import { getConsultorById, saveCycleHistory } from './services/supabaseService';
```

### rs-walletpay
```typescript
import { processPayment } from './services/walletService';
```

### rs-config
```typescript
// Lê regras de rs-config automaticamente
import { CONSTANTS } from './utils/math';
```

---

## 📦 Dependências

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
```

---

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento (hot reload)
npm run build    # Compilar TypeScript
npm start        # Produção (requer build)
```

---

## 📚 Documentação Adicional

- **CONFORMIDADE-REVISAO.md** - Relatório completo de validação
- **.env.example** - Exemplo de variáveis de ambiente
- **src/utils/math.ts** - Constantes e cálculos oficiais

---

## ⚠️ Importantes

### Valores NÃO podem ser alterados

Os valores em `src/utils/math.ts` seguem **exatamente** a documentação oficial:

```typescript
export const CONSTANTS = {
  CYCLE_BASE_BRL: 360.00,       // ✅ NÃO ALTERAR
  CYCLE_PAYOUT_BRL: 108.00,     // ✅ NÃO ALTERAR
  DEPTH_TOTAL_BRL: 24.52,       // ✅ NÃO ALTERAR
  FIDELITY_POOL_BRL: 4.50,      // ✅ NÃO ALTERAR
  TOP_SIGMA_POOL_BRL: 16.20,    // ✅ NÃO ALTERAR
};
```

### Validação Automática

Ao iniciar, o sistema valida se todos os percentuais estão corretos:

```typescript
validateBonusPercentages(); // Deve ser 48,95%
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@supabase/supabase-js'"

```bash
npm install
```

### Erro: "SUPABASE_URL não configurado"

Configure `.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### Erro: "Ciclo não fechou"

Verifique se tem exatamente 6 posições preenchidas.

---

## 📄 Licença

**Privado** - RS Prólipsi  
© 2025 Roberto Camargo

---

## 👥 Contato

**Desenvolvedor:** Roberto Camargo  
**Projeto:** RS Prólipsi Full Stack  
**Módulo:** rs-ops (Motor Operacional)

---

**Status:** ✅ 100% Conforme com Documentação Oficial  
**Versão:** 1.0.0  
**Última Atualização:** Novembro 2025

💛🖤 **RS PRÓLIPSI - Transformando Vidas!**
