# 🚛 RS PRÓLIPSI - MÓDULO LOGÍSTICA

**Versão:** 1.0.0  
**Status:** Em Desenvolvimento  
**Responsável:** Roberto Camargo

---

## 🎯 FUNÇÃO PRINCIPAL

Gerenciar **TODO o fluxo físico de produtos** desde o pedido até a entrega confirmada, integrando com:
- 💰 WalletPay (pagamento)
- 🔄 SIGMA (fechamento de ciclo)
- 🚗 Rotafácil (transporte)
- 📦 Marketplace (vendas)

---

## ⚠️ REGRAS DE NEGÓCIO CRÍTICAS

### 1. **SELEÇÃO DE CD - SEMPRE MANUAL**
```
❌ ERRADO: Sistema escolhe CD automaticamente
✅ CORRETO: Cliente ESCOLHE o CD antes de finalizar
```

**Fluxo:**
1. Cliente adiciona produtos ao carrinho
2. Sistema mostra CDs disponíveis na região
3. Cliente SELECIONA o CD de preferência
4. Mostra prazo e custo de frete
5. Cliente confirma

### 2. **CD SEMPRE DA MESMA REGIÃO**
```
Comprou em SP → Sai do CD de SP
Comprou em RJ → Sai do CD do RJ
Comprou em MG → Sai do CD de MG
```

**Nunca cruza estados sem necessidade!**

### 3. **DROPSHIP SEMPRE PELO CD**
```
❌ ERRADO: Fornecedor → Cliente direto
✅ CORRETO: Fornecedor → CD → Cliente
```

**Motivo:** Controle de qualidade e rastreamento

### 4. **ENTREGA CONFIRMADA = FECHA CICLO**
```
Status: "delivered" → Trigger automático:
  1. Atualiza SIGMA (fecha ciclo)
  2. Libera pontos de carreira
  3. Distribui bônus
  4. Envia notificação
```

---

## 📊 CENTROS DE DISTRIBUIÇÃO

### CDs Ativos:

| CD | Cidade | Estado | Capacidade/dia | Status |
|----|--------|--------|----------------|--------|
| **cd-sp-001** | São Paulo | SP | 500 pedidos | ✅ Ativo |
| **cd-rj-001** | Rio de Janeiro | RJ | 300 pedidos | ✅ Ativo |
| **cd-mg-001** | Belo Horizonte | MG | 250 pedidos | ✅ Ativo |
| **cd-go-001** | Goiânia | GO | 200 pedidos | 🟡 Planejado |

### Cobertura:
- **SP:** São Paulo, Guarulhos, Campinas, ABC
- **RJ:** Rio, Niterói, Duque de Caxias
- **MG:** BH, Contagem, Betim
- **GO:** Goiânia, Aparecida, Anápolis, Brasília

---

## 🔄 FLUXO COMPLETO DO PEDIDO

```
1. PEDIDO CRIADO (rs-marketplace/rs-api)
   ↓
2. PAGAMENTO CONFIRMADO (rs-walletpay)
   Status: payment_confirmed
   ↓
3. CLIENTE SELECIONA CD
   Sistema mostra opções disponíveis
   Cliente escolhe: cd-sp-001
   Status: cd_selected
   ↓
4. SEPARAÇÃO NO CD
   Produtos separados e embalados
   Status: preparing → ready_to_ship
   ↓
5. DESPACHO
   Nota fiscal gerada
   Rotafácil notificado
   Status: dispatched
   ↓
6. EM TRÂNSITO
   Rastreamento ativo
   Status: in_transit → out_for_delivery
   ↓
7. ENTREGA CONFIRMADA
   Status: delivered
   ↓
8. AÇÕES AUTOMÁTICAS:
   ✅ Fecha ciclo SIGMA
   ✅ Libera pontos carreira
   ✅ Distribui bônus
   ✅ Envia notificação
   ↓
9. CONCLUÍDO
   Status: completed
```

---

## 📦 STATUS DO PEDIDO

### Status Principais:

| Status | Descrição | Cor | Ícone |
|--------|-----------|-----|-------|
| `pending` | Aguardando pagamento | 🟠 | ⏳ |
| `payment_confirmed` | Pagamento OK | 🔵 | 💰 |
| `cd_selected` | CD escolhido | 🔵 | 📍 |
| `preparing` | Em separação | 🟡 | 📦 |
| `ready_to_ship` | Pronto para envio | 🟢 | ✅ |
| `dispatched` | Despachado | 🔵 | 🚚 |
| `in_transit` | Em trânsito | 🟠 | 🛣️ |
| `out_for_delivery` | Saiu para entrega | 🟡 | 🚗 |
| `delivered` | **Entregue** | 🟢 | ✅ |
| `completed` | **Concluído** | 🟢 | 🎉 |

### Status de Problema:

| Status | Descrição | Ação |
|--------|-----------|------|
| `delivery_failed` | Falha na entrega | Reagendar |
| `rescheduled` | Reagendado | Nova tentativa |
| `return_to_cd` | Retornando ao CD | Processar devolução |
| `refund_processing` | Processando reembolso | Creditar WalletPay |

---

## 🔗 INTEGRAÇÕES

### 1. **rs-api** (Pedidos)
```javascript
POST /v1/orders/create
{
  "userId": "uuid",
  "products": [{ "id": "p01", "qty": 6 }],
  "cdId": "cd-sp-001", // Cliente escolheu
  "shippingAddress": {...}
}
```

### 2. **rs-walletpay** (Pagamento)
```javascript
// Callback após pagamento confirmado
POST /v1/logistics/payment-confirmed
{
  "orderId": "uuid",
  "paymentId": "uuid",
  "amount": 360.00
}
```

### 3. **rs-core** (SIGMA)
```javascript
// Ao confirmar entrega
POST /v1/sigma/close-cycle
{
  "consultorId": "uuid",
  "orderId": "uuid",
  "cycleValue": 360.00
}
```

### 4. **rs-rotafacil** (Transporte)
```javascript
POST /v1/tracking/update
{
  "orderId": "uuid",
  "status": "out_for_delivery",
  "location": {...},
  "estimatedDelivery": "2025-11-10T14:00:00Z"
}
```

---

## 📊 ESTOQUE

### Controle por CD:

```json
{
  "productId": "p01",
  "cdId": "cd-sp-001",
  "quantity": 150,
  "reserved": 30,
  "available": 120,
  "threshold": 10,
  "status": "available"
}
```

### Alertas Automáticos:

- **Estoque < 10:** Alerta para reposição
- **Estoque = 0:** Bloqueia vendas
- **Reserved = Total:** Trava novas reservas

---

## 🎨 DASHBOARD LOGÍSTICO

### Acesso:
```
https://logistica.rsprolipsi.com.br
```

### Usuários:
- 👨‍💼 **Admin** - Visão geral de todos os CDs
- 📦 **Gerente de CD** - Apenas seu CD
- 🚗 **Motorista** - Apenas suas entregas

### Seções:

1. **Pedidos Pendentes**
   - Filtros: status, data, CD
   - Ações: separar, despachar, cancelar

2. **Estoque Atual**
   - Por produto e CD
   - Alertas de baixo estoque

3. **Entregas em Andamento**
   - Mapa interativo
   - Rastreamento em tempo real

4. **Relatórios**
   - Pedidos despachados
   - Tempo médio de entrega
   - Taxa de devoluções
   - Custos de transporte

---

## 🚀 PRÓXIMOS PASSOS

### Fase 1 (Atual):
- [x] Estrutura de pastas
- [x] Configuração de CDs
- [x] Mapeamento de status
- [ ] API de pedidos
- [ ] Integração WalletPay
- [ ] Integração SIGMA

### Fase 2:
- [ ] Dashboard HTML
- [ ] Rastreamento Rotafácil
- [ ] Relatórios automáticos
- [ ] Notificações push

### Fase 3:
- [ ] App mobile para motoristas
- [ ] IA para otimização de rotas
- [ ] Previsão de demanda

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

| Área | Status | Prioridade |
|------|--------|------------|
| Estrutura de pastas | ✅ | Alta |
| Config CDs | ✅ | Alta |
| Config Status | ✅ | Alta |
| API Pedidos | ⏳ | Alta |
| Integração WalletPay | ⏳ | Alta |
| Integração SIGMA | ⏳ | Alta |
| Dashboard UI | 📋 | Média |
| Rastreamento | 📋 | Média |
| Relatórios | 📋 | Baixa |

---

💛🖤 **RS PRÓLIPSI - LOGÍSTICA INTELIGENTE**

**Regra de ouro:** Cliente escolhe o CD, pedido sai da mesma região, entrega confirmada fecha o ciclo!
