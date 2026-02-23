---
name: rs-lei-governanca-ia
description: Lei de governança de IA do RS. Governa criação, alteração e uso de agentes, skills e workflows, garantindo segurança, padronização, aprovação e auditoria.
---

# RS — Lei de Governança de IA

## Princípio
🤖 IA sem governança vira risco.  
IA governada vira **infraestrutura estratégica**.

---

## Regras de criação
- todo agente deve:
  - ter domínio claro
  - usar prefixo rs-
  - declarar skills obrigatórias
- toda skill é imutável por padrão
- todo workflow passa pelo pipeline mestre

---

## Alterações
- mudanças exigem:
  - justificativa
  - versionamento
  - auditoria
- rollback deve ser possível

---

## Proibições
- IA não cria regra financeira sem constituição
- IA não altera leis sozinha
- IA não executa fora do pipeline

---

## Auditoria obrigatória
Eventos:
- IA_AGENT_CREATED
- IA_SKILL_CREATED
- IA_WORKFLOW_CREATED
- IA_CHANGE_REVIEWED
