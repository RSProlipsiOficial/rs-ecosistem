---
name: rs-workflow-produto-fisico-dropshipping
description: Workflow RS para produtos físicos (dropshipping). Controla envio, entrega, retenção de ganhos e devoluções.
agent: rs-encarregado-geral
skills:
  - rs-lei-produto-fisico-devolucao
  - rs-lei-retencao-e-liberacao-ganhos
  - rs-constitucional-financeira
---

# RS — Workflow Produto Físico (Dropshipping)

## FASE 1 — Pedido pago
- Pedido confirmado
- Auditoria: ORDER_PAID

---

## FASE 2 — Envio
- Criar envio
- Gerar tracking
- Auditoria: ORDER_SHIPPED

---

## FASE 3 — Entrega
- Confirmar entrega
- Liberar ganhos
- Auditoria: ORDER_DELIVERED

---

## FASE 4 — Devolução (se ocorrer)
- Bloquear ganhos
- Estornar valores
- Auditoria: ORDER_RETURNED
