---
name: rs-workflow-ia-criar-agente
description: Workflow RS para criação de agentes via RS.IA. Garante governança, validação constitucional e auditoria na criação de novos agentes.
agent: rs-encarregado-geral
skills:
  - rs-lei-governanca-ia
  - rs-constitucional-financeira
  - rs-lei-auditoria-total
---

# RS — Workflow IA: Criar Agente

## FASE 1 — Requisição
- Receber descrição do agente
- Definir domínio e riscos
- Auditoria: IA_AGENT_CREATION_REQUESTED

---

## FASE 2 — Validação
- Verificar aderência às leis RS
- Bloquear domínios financeiros sem constituição
- Auditoria: IA_AGENT_VALIDATED

---

## FASE 3 — Geração
- Criar arquivo `.md`
- Definir skills obrigatórias
- Auditoria: IA_AGENT_CREATED

---

## FASE 4 — Revisão
- Submeter ao Conselho de Qualidade
- Auditoria: IA_AGENT_REVIEWED
