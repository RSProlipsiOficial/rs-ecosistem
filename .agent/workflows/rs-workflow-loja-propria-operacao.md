---
name: rs-workflow-loja-propria-operacao
description: Workflow RS para operação de lojas próprias (Shopify-like). Gerencia vendas, split financeiro, afiliados e MMN.
agent: rs-encarregado-geral
skills:
  - rs-lei-operacao-lojas
  - rs-lei-split-receita-plataforma
  - rs-lei-afiliado-mmn-hibrido
---

# RS — Workflow Operação de Loja Própria

## FASE 1 — Criação da loja
- Criar loja
- Vincular owner
- Auditoria: STORE_CREATED

---

## FASE 2 — Venda
- Criar pedido
- Gerar pagamento
- Auditoria: ORDER_CREATED

---

## FASE 3 — Pagamento confirmado
- Confirmar PSP
- Auditoria: PAYMENT_CONFIRMED

---

## FASE 4 — Split financeiro
- Plataforma
- Lojista
- Auditoria: STORE_SPLIT_APPLIED

---

## FASE 5 — Afiliado / MMN
- Calcular comissão
- Verificar elegibilidade MMN
- Auditoria: COMMISSION_AND_MMN_PROCESSED
