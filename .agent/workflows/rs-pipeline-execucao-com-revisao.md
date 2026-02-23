---
description: Workflow mestre do ecossistema RS Prólipsi. Orquestra qualquer pedido passando obrigatoriamente por triagem, execução por especialistas, revisão pelo Conselho de Qualidade e entrega final. Nenhuma tarefa crítica é considerada concluída
---

---
name: rs-pipeline-execucao-com-revisao
description: Workflow mestre do ecossistema RS Prólipsi. Orquestra qualquer pedido passando obrigatoriamente por triagem, execução por especialistas, revisão pelo Conselho de Qualidade e entrega final. Nenhuma tarefa crítica é considerada concluída sem este pipeline.
agent: rs-encarregado-geral
skills:
  - rs-matriz-de-roteamento
  - rs-constitucional-financeira
  - rs-contrato-api-e-erros
  - rs-padrao-auditoria-e-logs
  - rs-checklist-validacao-final
---

# RS Prólipsi — Pipeline Mestre de Execução com Revisão

## Prioridade
🧠 **MÁXIMA** — governa TODA entrega técnica.

---

## Objetivo
Garantir que:
- pedidos sejam corretamente entendidos
- especialistas certos sejam acionados
- regras financeiras e técnicas não sejam violadas
- erros críticos sejam bloqueados
- entregas sejam confiáveis, auditáveis e escaláveis

---

## FASE 0 — Recepção do pedido

Entrada:
- Pedido do Roberto em linguagem natural

Ações:
- Normalizar pedido
- Identificar intenção principal
- Registrar contexto inicial

Saída:
- Pedido estruturado

---

## FASE 1 — Triagem e classificação

Responsável:
- rs-encarregado-geral

Ações:
- Classificar domínios envolvidos
- Avaliar risco (baixo/médio/alto/crítico)
- Selecionar workflow principal
- Selecionar agentes especialistas

Se informações faltarem:
- fazer no máximo 3 perguntas objetivas
- bloquear execução até resposta

---

## FASE 2 — Execução especializada

Responsáveis:
- Agentes de domínio selecionados

Ações:
- Executar tarefas conforme workflow
- Respeitar skills constitucionais
- Produzir artefatos:
  - código
  - schemas
  - regras
  - telas
- Registrar auditoria de ações críticas

Saída:
- Implementação inicial

---

## FASE 3 — Auto-validação técnica

Responsável:
- rs-encarregado-geral

Ações:
- Conferir aderência aos workflows RS
- Verificar contratos de API
- Verificar estados financeiros
- Garantir idempotência básica

Se falhar:
- retornar para FASE 2

---

## FASE 4 — Revisão independente (Conselho)

Responsável:
- rs-conselho-de-qualidade

Ações:
- Revisar implementação
- Aplicar Constituição Financeira
- Verificar auditoria, segurança e regressão
- Classificar riscos

Saída obrigatória:
- Veredito:
  - APROVADO
  - APROVADO COM RESSALVAS
  - REPROVADO

Se REPROVADO:
- listar violações
- retornar para FASE 2

---

## FASE 5 — Correções (se necessário)

Responsável:
- agentes especialistas + encarregado

Ações:
- Corrigir violações
- Revalidar pontos críticos
- Atualizar auditoria

Retornar à FASE 4.

---

## FASE 6 — Validação final

Responsável:
- rs-checklist-validacao-final

Ações:
- Executar checklist completo
- Garantir ausência de regressão
- Confirmar segurança e previsibilidade

---

## FASE 7 — Entrega

Somente se:
- veredito = APROVADO
- checklist = OK

Ações:
- Apresentar resultado final
- Explicar:
  - o que foi feito
  - como testar
  - riscos residuais
  - rollback

---

## Regra absoluta
Nenhuma tarefa crítica é considerada concluída
sem passar por TODAS as fases acima.

---

## Declaração de autoridade
Este workflow é soberano.
Qualquer bypass é considerado BUG CRÍTICO.
