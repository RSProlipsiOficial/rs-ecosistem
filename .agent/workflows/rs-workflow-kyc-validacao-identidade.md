 ---
name: rs-workflow-kyc-validacao-identidade
description: Workflow RS de KYC e validação de identidade. Garante conformidade, bloqueio preventivo e liberação segura de ganhos.
agent: rs-encarregado-geral
skills:
  - rs-lei-seguranca-roles
  - rs-lei-retencao-e-liberacao-ganhos
  - rs-lei-auditoria-total
---

# RS — Workflow KYC & Validação de Identidade

## FASE 1 — Solicitação
- Coletar documentos
- Auditoria: KYC_REQUESTED

---

## FASE 2 — Análise
- Validar documentos
- Auditoria: KYC_UNDER_REVIEW

---

## FASE 3 — Decisão
- Aprovar ou reprovar
- Ajustar limites financeiros
- Auditoria: KYC_DECISION_MADE
