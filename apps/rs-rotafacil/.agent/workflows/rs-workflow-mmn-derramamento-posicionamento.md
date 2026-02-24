---
description: rs-workflow-mmn-derramamento-posicionamento description: Workflow RS de derramamento e posicionamento SIGME. Cria nós de rede, aplica spillover conforme regras e registra auditoria completa.
---

---
name: rs-workflow-mmn-derramamento-posicionamento
description: Workflow RS de derramamento e posicionamento SIGME. Cria nós de rede, aplica spillover conforme regras e registra auditoria completa.
agent: rs-encarregado-geral
skills:
  - rs-motor-sigme-mmn
  - rs-lei-elegibilidade-ganhos
  - rs-lei-auditoria-total
---

# RS — Workflow MMN: Derramamento & Posicionamento

## FASE 1 — Entrada na rede
- Receber patrocinador
- Validar elegibilidade do patrocinador
- Auditoria: SIGME_SPONSOR_VALIDATED

---

## FASE 2 — Posicionamento
- Verificar limite de filhos
- Aplicar derramamento se necessário
- Registrar caminho completo
- Auditoria: SIGME_NODE_POSITIONED

---

## FASE 3 — Criação do nó
- Criar nó SIGME
- Associar plano/PIN
- Auditoria: SIGME_NODE_CREATED
