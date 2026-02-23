---
name: rs-workflow-afiliado-puro
description: Workflow RS para afiliado puro. Gerencia vendas, comissão direta e liberação de ganhos sem integração com MMN.
agent: rs-encarregado-geral
skills:
  - rs-lei-split-receita-plataforma
  - rs-lei-elegibilidade-ganhos
  - rs-constitucional-financeira
---

# RS — Workflow Afiliado Puro

## FASE 1 — Venda
- Criar pedido
- Auditoria: ORDER_CREATED

---

## FASE 2 — Pagamento
- Confirmar pagamento
- Auditoria: PAYMENT_CONFIRMED

---

## FASE 3 — Comissão
- Calcular comissão afiliado
- Liberar conforme regras
- Auditoria: AFFILIATE_COMMISSION_RELEASED
