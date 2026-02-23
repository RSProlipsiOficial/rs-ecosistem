---
name: rs-workflow-estorno-chargeback
description: Workflow RS para estorno e chargeback. Reverte pagamentos, bloqueia ganhos e protege o sistema contra duplicações.
agent: rs-encarregado-geral
skills:
  - rs-lei-retencao-e-liberacao-ganhos
  - rs-lei-produto-fisico-devolucao
  - rs-lei-auditoria-total
---

# RS — Workflow Estorno & Chargeback

## FASE 1 — Detecção
- Receber evento de estorno/chargeback
- Auditoria: CHARGEBACK_DETECTED

---

## FASE 2 — Bloqueio imediato
- Congelar ganhos relacionados
- Auditoria: FUNDS_FROZEN

---

## FASE 3 — Reversão
- Estornar valores pagos
- Cancelar comissões/bônus pendentes
- Auditoria: FUNDS_REVERSED

---

## FASE 4 — Compliance
- Marcar conta para revisão
- Auditoria: ACCOUNT_FLAGGED
