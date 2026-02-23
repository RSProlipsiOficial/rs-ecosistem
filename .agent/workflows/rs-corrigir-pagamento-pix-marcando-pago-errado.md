---
description: Workflow RS para corrigir o erro crítico onde um pagamento PIX é marcado como pago apenas ao gerar QR Code. Implementa máquina de estados, confirmação real via webhook/consulta, idempotência, ledger e validação final.
---

---
name: rs-corrigir-pagamento-pix-marcando-pago-errado
description: Workflow RS para corrigir o erro crítico onde um pagamento PIX é marcado como pago apenas ao gerar QR Code. Implementa máquina de estados, confirmação real via webhook/consulta, idempotência, ledger e validação final. Workflow financeiro de alta prioridade.
agent: rs-encarregado-geral
skills:
  - rs-matriz-de-roteamento
  - rs-contrato-api-e-erros
  - rs-padrao-auditoria-e-logs
  - rs-checklist-validacao-final
---

# RS Prólipsi — Workflow: Corrigir PIX Marcando Pago Errado

## Prioridade
🔥 **CRÍTICA** — afeta dinheiro, comissão, bônus e confiança do sistema.

---

## Objetivo
Garantir que:
- Gerar PIX / abrir QR / copiar código **NÃO** marque pagamento como pago
- Pagamento só seja confirmado com **confirmação real do PSP**
- O sistema seja **idempotente**, **auditável** e **confiável**

---

## Sintoma comum (problema atual)
- Ao criar um PIX, o sistema:
  - já marca `payment_status = paid`
  - libera pedido, comissão ou bônus
- Isso gera:
  - inconsistência financeira
  - fraude involuntária
  - erros de conciliação

---

## Resultado esperado
- `payment_status` segue máquina de estados correta
- `paid` só ocorre após confirmação real
- Comissão/bônus só liberam após `paid`
- Auditoria registra todos os eventos

---

## FASE 1 — Diagnóstico (obrigatória)

### 1.1 Identificar ponto do erro
Localizar no código:
- Onde o PIX é criado
- Onde o status é alterado para `paid`

Perguntas obrigatórias:
- O status muda no backend ou frontend?
- Existe webhook configurado?
- Existe distinção entre `pending` e `paid`?

⚠️ Nunca assumir. Ler o código.

---

## FASE 2 — Máquina de estados de pagamento

### 2.1 Estados obrigatórios
Criar/confirmar enum ou campo:

- `created`
- `pending`  ← PIX criado / aguardando pagamento
- `paid`     ← confirmado
- `expired`
- `canceled`

### 2.2 Regra central
- Criar PIX → `pending`
- Frontend **NÃO** pode alterar para `paid`
- Apenas backend, via confirmação real, altera para `paid`

---

## FASE 3 — Criação do PIX (backend)

Ao criar o PIX:
- Gerar cobrança no PSP
- Salvar:
  - `payment_id`
  - `txid` (ou equivalente)
  - `expires_at`
  - `status = pending`
- Registrar auditoria:
  - `PAYMENT_CREATED`

❌ Nunca marcar como `paid` aqui

---

## FASE 4 — Confirmação real do pagamento

### 4.1 Webhook (preferencial)
- Criar/validar endpoint de webhook
- Validar assinatura (HMAC/certificado)
- Extrair identificador único (txid / endToEndId)

### 4.2 Consulta ativa (fallback)
- Endpoint “Já paguei”
- Backend consulta PSP
- Se confirmado → segue fluxo de pagamento

---

## FASE 5 — Idempotência (obrigatória)

- Definir `idempotency_key` por evento (txid/event_id)
- Antes de processar:
  - verificar se evento já foi aplicado
- Se já aplicado:
  - retornar sucesso
  - **não duplicar baixa**

Registrar auditoria:
- `PAYMENT_EVENT_DUPLICATED` (se ocorrer)

---

## FASE 6 — Confirmação do pagamento

Quando confirmado:
- Atualizar `payment_status = paid`
- Preencher `paid_at`
- Registrar auditoria:
  - `PAYMENT_CONFIRMED`

---

## FASE 7 — Ledger (se aplicável)

- Registrar entrada financeira
- Garantir:
  - dupla entrada
  - valor correto
  - vínculo com `payment_id`

---

## FASE 8 — Liberação de efeitos colaterais

Somente após `paid`:
- Pedido → aprovado
- Comissão → liberada
- Bônus → calculado

⚠️ Nenhuma dessas ações pode ocorrer antes.

---

## FASE 9 — Frontend / UI

- Exibir status correto:
  - `Pendente`
  - `Pago`
  - `Expirado`
- Mostrar:
  - tempo restante do PIX
  - mensagem clara
- Botão “Já paguei” **não confirma pagamento**, apenas consulta backend

---

## FASE 10 — Auditoria e logs

Registrar eventos mínimos:
- `PAYMENT_CREATED`
- `PAYMENT_CONFIRMED`
- `PAYMENT_EXPIRED`
- `PAYMENT_EVENT_DUPLICATED`

Cada evento com:
- entity_id
- origem
- timestamp

---

## FASE 11 — Validação final (obrigatória)

Executar **rs-checklist-validacao-final**:

- [ ] PIX gerado não marca como pago
- [ ] Webhook duplicado não duplica baixa
- [ ] Comissão/bônus só liberam após `paid`
- [ ] Auditoria presente
- [ ] UI reflete estado real

---

## Declaração de sucesso
O workflow é considerado concluído apenas quando:
- o erro não ocorre mais
- o fluxo é previsível
- o sistema é auditável