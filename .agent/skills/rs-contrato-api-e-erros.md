---
name: rs-contrato-api-e-erros
description: Skill que define o contrato oficial de APIs do ecossistema RS Prólipsi. Padroniza formato de resposta, erros, códigos, validação de entrada, mensagens humanas, logs e segurança. Deve ser aplicada a todo endpoint backend (WalletPay, Marketplace, SIGME/MMN, Config, Studio). Keywords: api contract, error handling, validation, backend, response format.
---

# RS Prólipsi — Contrato Oficial de API e Erros

## Objetivo da Skill
Garantir que **todas as APIs do RS**:
- respondam no mesmo formato
- sejam previsíveis para o frontend
- não vazem informação sensível
- sejam fáceis de auditar e integrar
- funcionem bem com agentes e automações

---

## 1) Formato padrão de resposta (OBRIGATÓRIO)

### 1.1 — Resposta de sucesso
Toda resposta de sucesso DEVE seguir este formato:

```json
{
  "ok": true,
  "data": {},
  "error": null
}
