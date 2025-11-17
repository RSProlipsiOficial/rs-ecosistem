# 🎯 SISTEMA DE PRODUTOS E MATRIZ - COMPLETO

**Data:** 06/11/2025  
**Status:** ✅ Pronto para Executar

---

## 📦 O QUE FOI CRIADO

### 1. **Tabelas SQL (13 tabelas)**

Arquivo: `rs-core/EXECUTAR-NO-SUPABASE.sql`

**Novas tabelas:**
- ✅ `product_catalog` - Catálogo de produtos
- ✅ `sales` - Registro de vendas
- ✅ `matriz_cycles` - Controle de ciclos
- ✅ `career_points` - Pontos de carreira
- ✅ `user_roles` - Permissões (cliente, consultor, CD)
- ✅ `cycle_events` - Log de eventos

**Mais 7 tabelas base:**
- consultores, wallets, bonuses, transactions, ranking, downlines, logs_operations

---

## 💰 PRECIFICAÇÃO IMPLEMENTADA

### Valores por Tipo de Usuário:

| Tipo | Desconto | Preço Kit SIGMA | Regra |
|------|----------|-----------------|-------|
| **Cliente** | 0% | R$ 120,00 | Preço de vitrine |
| **Consultor** | 50% | R$ 60,00 | Valor de reentrada |
| **CD** | 57.6% | R$ 50,88 | 50% + 15.2% adicional |

**Cálculo CD:**
```
120 × 0.5 = 60 (desconto consultor)
60 × 0.848 = 50.88 (desconto CD adicional de 15.2%)
```

---

## 🔄 LÓGICA DE CICLAGEM

### Fluxo Completo:

```
1 Venda → Preenche 1 vaga na matriz
6 Vendas → Ciclo completa
Ao completar:
  ✅ Paga R$ 108,00 (30% de R$ 360)
  ✅ Gera 1 ponto de carreira
  ✅ Distribui bônus profundidade (R$ 24,52)
  ✅ Acumula pool fidelidade (R$ 4,50)
  ✅ Qualifica para Top SIGMA (R$ 16,20)
  ✅ Abre novo ciclo automaticamente
```

### Matriz SIGMA 1x6:

```
      [Consultor]
   /  /  |  \  \  \
 [1][2][3][4][5][6]
```

- **6 vagas** por ciclo
- **R$ 60** por vaga
- **R$ 360** total do ciclo
- **R$ 108** de payout (30%)

---

## 🗄️ ESTRUTURA DE DADOS

### product_catalog
```sql
- name, description, sku
- price_base (120.00)
- price_consultor (60.00)
- price_cd (50.88)
- discount_consultor (50%)
- discount_cd (57.6%)
- contributes_to_matrix (true)
- stock_quantity, category, tags
- image_url, slug
```

### sales
```sql
- buyer_id, product_id
- price_final, total_amount
- matrix_id, matrix_slot_filled
- career_points_generated
- payment_status, delivery_status
```

### matriz_cycles
```sql
- consultor_id, cycle_number
- slot_1_sale_id ... slot_6_sale_id
- slots_filled (0-6)
- status (open/completed)
- cycle_payout (108.00)
- career_point_awarded
```

### career_points
```sql
- consultor_id
- points_total, points_trimestre_atual
- pin_atual, pin_nivel
- total_cycles_completed
- vme_linha_1_percent ... vme_linha_6_percent
```

---

## 🚀 API ENDPOINTS

### POST /v1/sales/register
Registra venda e atualiza ciclo automaticamente

**Request:**
```json
{
  "product_id": "uuid",
  "quantity": 1,
  "payment_method": "wallet"
}
```

**Response (vaga preenchida):**
```json
{
  "success": true,
  "sale_id": "uuid",
  "cycle_info": {
    "slots_filled": 3,
    "slots_total": 6,
    "status": "open"
  }
}
```

**Response (ciclo completado):**
```json
{
  "success": true,
  "cycle_completed": true,
  "cycle_payout": 108.00,
  "career_point_awarded": true,
  "new_cycle_opened": true
}
```

### GET /v1/matrix/my
Consultar meus ciclos

### GET /v1/career/my
Ver pontos e graduação

### GET /v1/products
Listar produtos disponíveis

---

## 🎓 INTEGRAÇÃO COM PLANO DE CARREIRA

### 13 PINs:

| PIN | Ciclos | Recompensa |
|-----|--------|------------|
| Bronze | 5 | R$ 13,50 |
| Prata | 15 | R$ 40,50 |
| Ouro | 70 | R$ 189,00 |
| Safira | 150 | R$ 405,00 |
| ... | ... | ... |
| Diamante Black | 50.000 | R$ 135.000,00 |

**Cada ciclo completo = 1 ponto**

---

## 💡 EXEMPLO PRÁTICO

### Cenário: João (Consultor)

**Ação 1:** Compra Kit SIGMA por R$ 60  
→ Preenche vaga 1/6 do ciclo  
→ Status: Ciclo aberto (1/6)

**Ação 2-5:** Mais 4 vendas (R$ 60 cada)  
→ Preenchidas vagas 2, 3, 4, 5  
→ Status: Ciclo aberto (5/6)

**Ação 6:** 6ª venda  
→ Vaga 6/6 preenchida  
→ **Ciclo completa!**  
→ João recebe R$ 108 na carteira  
→ João ganha 1 ponto de carreira  
→ Sistema distribui bônus para uplines  
→ Novo ciclo abre automaticamente  
→ Status: Ciclo 2 aberto (0/6)

---

## 🔧 CONFIGURAÇÃO NO rs-config

Adicionar em `src/settings/produtos.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "description": "Configuração de produtos e precificação",
  "version": "1.0.0",
  
  "produto_base": {
    "nome": "Kit de Ativação SIGMA 1x6",
    "sku": "KIT-SIGMA-1X6",
    "preco_vitrine": 120.00,
    "preco_consultor": 60.00,
    "preco_cd": 50.88
  },
  
  "descontos": {
    "consultor_percent": 50.00,
    "cd_percent": 57.60,
    "cd_calculo": "50% base + 15.2% adicional"
  },
  
  "matriz": {
    "vagas_por_produto": 1,
    "pontos_por_ciclo": 1,
    "total_vagas_ciclo": 6,
    "valor_total_ciclo": 360.00,
    "payout_ciclo": 108.00,
    "payout_percent": 30.00
  }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Backend (rs-ops):
- [ ] Função `processSale(userId, productId)`
- [ ] Função `updateCycle(cycleId, saleId)`
- [ ] Função `completeCycle(cycleId)`
- [ ] Função `awardCareerPoint(userId)`
- [ ] Função `distributeBonuses(cycleId)`

### API (rs-api):
- [ ] Endpoint `POST /sales/register`
- [ ] Endpoint `GET /matrix/my`
- [ ] Endpoint `GET /career/my`
- [ ] Endpoint `GET /products`

### Front-end:
- [ ] Página de produtos
- [ ] Checkout de compra
- [ ] Dashboard de ciclos
- [ ] Visualização da matriz
- [ ] Histórico de vendas

---

## 📊 DASHBOARD - MÉTRICAS

**Para o Consultor ver:**
- Ciclo atual (vagas preenchidas/total)
- Total de ciclos completados
- Pontos de carreira acumulados
- Graduação atual e próxima
- Valor total recebido
- Volume de vendas mensal

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **EXECUTAR SQL** no Supabase (5min)
2. ⏱️ Implementar endpoints na API (2h)
3. ⏱️ Criar telas de produtos no front (4h)
4. ⏱️ Testar fluxo completo (1h)

---

## 📞 CREDENCIAIS

**Supabase:**
```
https://rptkhrboejbwexseikuo.supabase.co
rsprolipsioficial@gmail.com
Yannis784512@
```

**Arquivo SQL:**
```
rs-core/EXECUTAR-NO-SUPABASE.sql
```

---

💛🖤 **RS PRÓLIPSI - Sistema de Produtos e Matriz COMPLETO!**
