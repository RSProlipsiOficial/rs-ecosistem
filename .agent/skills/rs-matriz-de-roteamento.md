---
name: rs-matriz-de-roteamento
description: Skill de decisão do ecossistema RS Prólipsi. Classifica pedidos por domínio (WalletPay, Marketplace, SIGME/MMN, Config, RS Studio, Supabase/DB, Frontend, DevOps), identifica intenção, escolhe workflow e especialistas adequados. Usada pelo Encarregado Geral para orquestrar entregas completas. Keywords: routing, intent classification, workflow selection, payments, pix, bonus, database, frontend, devops.
---

# RS Prólipsi — Matriz de Roteamento Inteligente

## Objetivo da Skill
Transformar um pedido em **plano de execução técnico**.

Você NÃO executa código.
Você **decide o caminho correto**:
- domínio
- workflow
- especialistas
- prioridade
- risco

---

## 1) Entrada esperada
Qualquer solicitação do Roberto, em linguagem natural.

Exemplos:
- “Cria um bônus de indicação”
- “O PIX tá marcando pago errado”
- “Preciso liberar comissão só quando pagar”
- “Cria uma tela nova no padrão RS”
- “Integra WalletPay com Marketplace”

---

## 2) Saída obrigatória
Sempre produzir:

1) **Resumo do pedido** (1 frase clara)
2) **Domínios envolvidos** (1 a 3)
3) **Workflow escolhido**
4) **Especialistas necessários**
5) **Riscos**
6) **Plano resumido de execução**

Se algo estiver indefinido, **listar perguntas objetivas** (máx. 3).

---

## 3) Domínios oficiais RS

### D1 — WalletPay / Pagamentos
Gatilhos:
- pix, qr code, pago, pagamento, webhook, baixa
- saldo, saque, ledger, conciliação, gateway

Especialista:
- rs-arquiteto-walletpay

Workflow típico:
- corrigir-pagamento-pix-marcando-pago-errado

Risco:
- ALTO (financeiro)

---

### D2 — Marketplace / RS Shopping
Gatilhos:
- pedido, checkout, comissão, split, logista
- produto, carrinho, aprovação, faturamento

Especialista:
- rs-arquiteto-marketplace

Workflow típico:
- pedido-marketplace-da-compra-ate-comissao

Risco:
- ALTO (financeiro + reputação)

---

### D3 — SIGME / MMN / Bônus / PINs
Gatilhos:
- bônus, matriz, pin, derramamento
- carreira, indicação, ciclo

Especialista:
- rs-arquiteto-bonus-sigme

Workflow típico:
- criar-bonus-x-sigme

Risco:
- ALTO (regra de negócio)

---

### D4 — Config / Perfis / Planos
Gatilhos:
- plano, permissão, módulo, perfil
- upgrade, downgrade, acesso

Especialista:
- rs-arquiteto-config-perfis

Workflow típico:
- upgrade-plano-automatico

Risco:
- MÉDIO

---

### D5 — RS Studio / RS.IA
Gatilhos:
- automação, agente, mensagem
- notificação, webhook interno, rsa

Especialista:
- rs-arquiteto-studio-rsa

Workflow típico:
- publicar-eventos-studio

Risco:
- MÉDIO

---

### D6 — Supabase / Banco / RLS
Gatilhos:
- tabela, enum, trigger, policy
- rls, supabase, migração

Especialista:
- rs-auditor-supabase-rls

Workflow típico:
- ajustar-schema-e-rls

Risco:
- ALTO (dados)

---

### D7 — Frontend / UI / UX
Gatilhos:
- tela, layout, responsivo
- menu, dashboard, botão

Especialista:
- rs-engenheiro-frontend-ux

Workflow típico:
- aplicar-padrao-ui-em-modulo

Risco:
- BAIXO / MÉDIO

---

### D8 — DevOps / Infra
Gatilhos:
- deploy, docker, nginx
- ssl, domínio, env

Especialista:
- rs-devops-deployer

Workflow típico:
- deploy-vps-rs

Risco:
- ALTO (ambiente)

---

## 4) Regras de decisão

1) Nunca escolher mais de **3 domínios**
2) Sempre escolher **1 workflow principal**
3) Priorizar **risco financeiro > regra de negócio > UI**
4) Se envolver dinheiro → exigir idempotência + auditoria
5) Se envolver bônus/comissão → exigir pagamento confirmado

---

## 5) Exemplo de saída correta

**Pedido:** “Cria um bônus de indicação”

- Resumo: Criar novo bônus de indicação no SIGME
- Domínios: SIGME/MMN, WalletPay
- Workflow: criar-bonus-x-sigme
- Especialistas: rs-arquiteto-bonus-sigme, rs-arquiteto-walletpay
- Risco: ALTO
- Plano:
  1) Definir regra e elegibilidade
  2) Criar schema/ledger
  3) Integrar WalletPay
  4) Notificar via RS Studio
  5) Validar com checklist

---

## 6) Regra de ouro
Se você não souber **qual workflow usar**, pare.
Primeiro classifique corretamente o domínio.
Decisão errada gera código errado.
