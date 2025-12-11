# Plano de Limpeza e Refatoração - RS Prólipsi

Este plano visa organizar o monorepo, corrigindo a estrutura de pastas e preparando o terreno para a importação ou desenvolvimento dos módulos faltantes.

## 1. Correções Estruturais (Imediato)

### A. Mover Módulo de Logística (✅ CONCLUÍDO)
O módulo `rs-logistica` estava isolado na raiz.

*   **Status**: Movido para `apps/rs-logistica`. `pnpm-workspace` atualizado. Build verificado.

### B. Corrigir Workspace Config (✅ CONCLUÍDO)
O arquivo de configuração do workspace tinha erro de digitação.

*   **Status**: Corrigido (`supabse` -> `supabase`).

## 2. Tratamento de Pastas Vazias (✅ CONCLUÍDO)

As pastas vazias em `/apps` receberam tratamento inicial.

*   **Ação Realizada**: Criados `package.json` mínimo e `README.md` explicativo para todos os apps faltantes.
*   **Motivo**: Preservar a estrutura do monorepo e documentar o que deve ser implementado.

## 3. Consolidação de Pacotes e Configs (🟡 EM ANDAMENTO)

### A. Verificar `rs-ops-config` vs `rs-config`
*   **Ação Realizada**: `rs-config` foi inicializado e populado com configurações básicas necessárias para compilar o `rs-ops-app` (cycles, topSigma, ranking).
*   **Próximos Passos**: Continuar migrando configurações hardcoded para este pacote central.

## 4. Ordem de Execução Sugerida

1.  **Padronização**: Executar correção do `pnpm-workspace.yaml`. (✅)
2.  **Organização**: Mover `rs-logistica` para `apps/`. (✅)
3.  **Documentação**: Criar `README.md` "stub" nas pastas vazias indicando "Aguardando Código Fonte". (✅)
4.  **Verificação**: Rodar `pnpm install` na raiz para garantir que o workspace linka corretamente `rs-ops-app` e `rs-logistica`. (✅)
