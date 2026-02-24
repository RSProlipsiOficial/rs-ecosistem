---
name: rs-checklist-validacao-final
description: Skill de validação final do ecossistema RS Prólipsi. Garante que toda entrega (pagamentos, bônus, comissões, APIs, telas) foi corretamente implementada, testada, auditada e não quebrou fluxos existentes. Usada obrigatoriamente antes de considerar qualquer tarefa concluída. Keywords: checklist, validation, quality control, testing, regression.
---

# RS Prólipsi — Checklist Final de Validação

## Objetivo da Skill
Garantir que **toda entrega técnica**:
- funciona como esperado
- respeita contratos RS
- não gera regressão
- está segura
- pode ir para produção

---

## 1) Validação de requisitos

Antes de tudo, confirmar:
- [ ] O pedido original foi entendido corretamente
- [ ] As regras de negócio estão explícitas
- [ ] Nenhuma regra foi assumida sem confirmação
- [ ] PRDs/Manuais RS foram respeitados (quando existentes)

---

## 2) Validação de schema e dados

- [ ] Tabelas criadas/alteradas corretamente
- [ ] Enums e estados consistentes
- [ ] Índices para campos críticos (ids, status, datas)
- [ ] Migração reversível (rollback possível)
- [ ] Dados sensíveis não estão expostos

---

## 3) Validação de backend / APIs

- [ ] Todos os endpoints usam o **Contrato RS de API**
- [ ] Validação de entrada aplicada
- [ ] Erros retornam códigos estáveis
- [ ] Autenticação e autorização corretas
- [ ] Rate limit em endpoints sensíveis
- [ ] Nenhuma lógica crítica no frontend

---

## 4) Validação de pagamentos (quando aplicável)

- [ ] PIX/QR gerado NÃO marca como pago
- [ ] Pagamento só vira `paid` com confirmação real
- [ ] Webhook valida assinatura
- [ ] Webhook é idempotente (duplicado não duplica baixa)
- [ ] Ledger reflete corretamente o pagamento
- [ ] Comissão/bônus NÃO libera antes do pagamento

---

## 5) Validação de regras de negócio

- [ ] Bônus respeita elegibilidade
- [ ] Comissão respeita status do pedido
- [ ] PIN/matriz respeita hierarquia e derramamento
- [ ] Ajustes manuais geram auditoria
- [ ] Não há atalhos que bypassam regras

---

## 6) Validação de auditoria e logs

- [ ] Eventos críticos geram auditoria
- [ ] Auditoria contém entity_id, event_type, origem
- [ ] Logs técnicos não vazam dados sensíveis
- [ ] Auditoria é imutável (append-only)

---

## 7) Validação de frontend / UI (quando houver)

- [ ] Estados corretos exibidos (pendente/pago/etc.)
- [ ] Mensagens claras para o usuário
- [ ] Nenhuma decisão crítica feita no frontend
- [ ] UI segue padrão RS Dark + Gold
- [ ] Responsividade básica validada

---

## 8) Validação de regressão

- [ ] Fluxos antigos continuam funcionando
- [ ] Nenhum módulo dependente quebrou
- [ ] Não houve mudança silenciosa de contrato
- [ ] Eventos existentes continuam sendo emitidos

---

## 9) Validação operacional

- [ ] Como testar foi documentado
- [ ] Logs permitem debugar se algo falhar
- [ ] Existe caminho claro de rollback
- [ ] Entrega pode ser monitorada em produção

---

## 10) Declaração de conclusão (obrigatória)

Somente após todos os itens acima marcados como OK,
a entrega pode ser considerada **FINALIZADA**.

Caso contrário:
- listar pendências
- corrigir
- revalidar

---

## Regra de ouro
Se algo **não foi validado**,  
então **não está pronto**.
