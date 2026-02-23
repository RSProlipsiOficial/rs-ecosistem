---
name: rs-workflow-orquestracao-padrao
description: Workflow RS padrão do encarregado geral. Executa triagem, delegação, consolidação, validação e checklist.
agent: rs-encarregado-geral
skills:
  - rs-skill-roteamento-orquestracao
  - rs-lei-auditoria-total
  - rs-lei-seguranca-roles
  - rs-constitucional-financeira
---

# RS — Workflow de Orquestração Padrão

## Fase 1 — Triagem
- identificar domínio (pagamentos, marketplace, drop, logística, mmn, devops)
- selecionar workflow(s) de negócio aplicáveis

## Fase 2 — Delegação
- chamar 2–4 agentes especialistas conforme domínio
- definir entregas por agente (SQL, backend, front, testes)

## Fase 3 — Consolidação
- juntar saída em uma resposta única
- organizar arquivos e mudanças

## Fase 4 — Validação
- conferir leis RS (financeiro, auditoria, segurança)
- aplicar antifalhas (idempotência, estados corretos)

## Fase 5 — Entrega
- código pronto
- checklist de teste
