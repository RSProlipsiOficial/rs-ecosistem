---
name: rs-lei-continuidade-operacional
description: Lei do RS para continuidade operacional. Define como o sistema reage a falhas, executa rollback, mantém segurança e preserva dados.
---

# RS — Lei de Continuidade Operacional

## Princípio
🛡️ Falhar é permitido. **Quebrar não**.

---

## Falhas esperadas
- queda de serviço
- erro de PSP
- duplicação de evento
- falha de deploy

---

## Regras de contingência
- preferir bloqueio a liberação
- manter estado consistente
- nunca perder auditoria

---

## Rollback
- sempre possível
- reversível
- documentado

---

## Auditoria obrigatória
Eventos:
- INCIDENT_DETECTED
- CONTINGENCY_APPLIED
- ROLLBACK_EXECUTED
