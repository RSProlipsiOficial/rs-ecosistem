---
name: rs-workflow-encerramento-conta
description: Workflow RS para encerramento de conta e desligamento do MMN. Bloqueia acessos, ajusta rede e garante auditoria.
agent: rs-encarregado-geral
skills:
  - rs-lei-retencao-e-liberacao-ganhos
  - rs-motor-sigme-mmn
  - rs-lei-auditoria-total
---

# RS — Workflow Encerramento de Conta

## FASE 1 — Solicitação
- Receber pedido
- Auditoria: ACCOUNT_CLOSURE_REQUESTED

---

## FASE 2 — Bloqueio
- Bloquear acessos
- Congelar ganhos
- Auditoria: ACCOUNT_BLOCKED

---

## FASE 3 — Ajuste MMN
- Recalcular rede
- Aplicar derramamento
- Auditoria: SIGME_NODE_REMOVED

---

## FASE 4 — Encerramento
- Finalizar conta
- Auditoria: ACCOUNT_CLOSED
