# Plano de Limpeza e Refatoração - RS Prólipsi

Este plano visa organizar o monorepo, corrigindo a estrutura de pastas e preparando o terreno para a importação ou desenvolvimento dos módulos faltantes.

## 1. Correções Estruturais (Imediato)

### A. Mover Módulo de Logística
O módulo `rs-logistica` está isolado na raiz. Ele deve fazer parte do workspace oficial.

*   **Ação**: Mover `/logistica/rs-logistica` para `/apps/rs-logistica`.
*   **Risco**: Baixo. Requer apenas ajuste de caminhos relativos se houver imports (pouco provável dado o isolamento).
*   **Motivo**: Padronização do monorepo e inclusão no `pnpm-workspace`.

### B. Corrigir Workspace Config
O arquivo de configuração do workspace tem um erro de digitação.

*   **Ação**: Editar `pnpm-workspace.yaml`.
*   **Mudança**: De `supabse/*` para `supabase/*`.
*   **Risco**: Nulo.

## 2. Tratamento de Pastas Vazias (Decisão Requerida)

Temos diversas pastas em `/apps` que estão vazias. Temos duas opções:

### Opção A: Manter como Placeholder (Recomendado se o código virá em breve)
Manter as pastas serve como documentação da estrutura esperada.
*   **Ação**: Adicionar um `README.md` em cada pasta vazia explicando o que deve ser colocado lá.

### Opção B: Limpeza (Recomendado se for reiniciar do zero)
*   **Ação**: Remover:
    - `apps/rs-admin/`
    - `apps/rs-api/`
    - `apps/rs-consultor/`
    - `apps/rs-marketplace/`
    - `apps/rs-rotafacil/`
    - `apps/rs-site/`
    - `apps/rs-studio/`
    - `apps/rs-template-game/`
    - `apps/rs-walletpay/`
    - `apps/rs-robo-kagi-binance/`
    - `apps/rs-core/` (Se confirmado que não é package)

**Recomendação Atual**: Manter as pastas e adicionar um arquivo `.keep` ou `README.md` temporário para git tracking, aguardando a importação do código legado ou início do desenvolvimento.

## 3. Consolidação de Pacotes e Configs

### A. Verificar `rs-ops-config` vs `rs-config`
*   **Ação**: Analisar se `rs-ops-config` pode ser generalizado para ser o config mestre de todo o ecossistema.
*   **Motivo**: Evitar duplicidade de chaves de API e URLs de serviços entre os apps.

## 4. Ordem de Execução Sugerida

1.  **Padronização**: Executar correção do `pnpm-workspace.yaml`.
2.  **Organização**: Mover `rs-logistica` para `apps/`.
3.  **Documentação**: Criar `README.md` "stub" nas pastas vazias indicando "Aguardando Código Fonte".
4.  **Verificação**: Rodar `pnpm install` na raiz para garantir que o workspace linka corretamente `rs-ops-app` e `rs-logistica`.
