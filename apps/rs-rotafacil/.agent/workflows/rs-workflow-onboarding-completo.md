---
name: rs-workflow-onboarding-completo
description: Workflow RS de onboarding completo. Gerencia cadastro, definição de papéis, plano inicial, permissões e ativação no ecossistema RS.
agent: rs-encarregado-geral
skills:
  - rs-lei-seguranca-roles
  - rs-lei-elegibilidade-ganhos
  - rs-lei-auditoria-total
---

# RS — Workflow Onboarding Completo

## FASE 1 — Cadastro
- Criar usuário base
- Auditoria: USER_CREATED

---

## FASE 2 — Escolha de papel
- usuário / afiliado / lojista
- Aplicar roles iniciais
- Auditoria: ROLE_ASSIGNED

---

## FASE 3 — Plano inicial
- Definir plano
- Bloquear ganhos até ativação
- Auditoria: PLAN_ASSIGNED

---

## FASE 4 — Ativação
- Ativar acesso conforme papel
- Auditoria: USER_ACTIVATED
