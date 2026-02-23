---
name: rs-workflow-plano-upgrade-downgrade
description: Workflow RS para upgrade, downgrade e bloqueio de planos. Atualiza permissões, módulos e elegibilidade financeira.
agent: rs-encarregado-geral
skills:
  - rs-lei-elegibilidade-ganhos
  - rs-lei-seguranca-roles
  - rs-lei-auditoria-total
---

# RS — Workflow Plano: Upgrade / Downgrade

## FASE 1 — Solicitação
- Receber pedido de alteração
- Auditoria: PLAN_CHANGE_REQUESTED

---

## FASE 2 — Validação
- Verificar pagamentos
- Verificar impacto financeiro
- Auditoria: PLAN_CHANGE_VALIDATED

---

## FASE 3 — Aplicação
- Atualizar plano
- Atualizar permissões
- Ajustar elegibilidade MMN
- Auditoria: PLAN_CHANGED

---

## FASE 4 — Pós-processo
- Recalcular ganhos se necessário
- Auditoria: PLAN_POST_PROCESSING
