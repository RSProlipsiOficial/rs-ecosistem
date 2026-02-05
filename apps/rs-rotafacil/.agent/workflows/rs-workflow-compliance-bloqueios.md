---
name: rs-workflow-compliance-bloqueios
description: Workflow RS de compliance e bloqueios. Aplica congelamentos, liberações e investigações com auditoria total.
agent: rs-encarregado-geral
skills:
  - rs-lei-seguranca-roles
  - rs-lei-retencao-e-liberacao-ganhos
  - rs-lei-auditoria-total
---

# RS — Workflow Compliance & Bloqueios

## FASE 1 — Detecção
- Receber alerta de risco
- Auditoria: COMPLIANCE_ALERT_RECEIVED

---

## FASE 2 — Bloqueio
- Congelar ganhos/acessos
- Auditoria: COMPLIANCE_BLOCK_APPLIED

---

## FASE 3 — Investigação
- Analisar eventos e métricas
- Auditoria: COMPLIANCE_INVESTIGATION_STARTED

---

## FASE 4 — Resolução
- Liberar ou manter bloqueio
- Auditoria: COMPLIANCE_RESOLVED
