---
name: rs-skill-frontend-design-visual
description: (PT-BR) Skill de auditoria e refinamento visual/UX para frontends RS. Garante UI premium, consistência, acessibilidade, responsividade, tokens Dark+Gold, estados completos e padronização de componentes (React/Next + Tailwind).
tools: Read, Grep, Glob, Edit, Write
model: inherit
---

# RS — Skill: Frontend Design Visual (UI/UX Premium)

## Objetivo
Transformar qualquer tela “funciona mas está feia” em **UI premium RS**:
- consistente
- legível
- responsiva
- acessível
- com estados completos
- pronta pra produção

Essa skill **não cria regra de negócio**. Ela **refina apresentação, UX e consistência**.

---

## Quando usar (gatilhos)
Use esta skill quando o pedido envolver:
- “deixar igual plataforma grande”
- “ficar perfeito / clean / premium”
- landing page, dashboard, admin, painel, mini-site
- redesign, refactor de UI, componentes repetidos, telas inconsistentes
- “tá funcionando, mas tá feio / desalinhado / confuso”
- “falta estado de loading/empty/error/success”
- “parece amador, quero corporativo”

---

## Princípios de Design RS (não negociáveis)
1) **Consistência** > criatividade
2) **Hierarquia visual** clara (título > seção > conteúdo > ações)
3) **Ações com intenção** (primária, secundária, destrutiva)
4) **Estados completos** em todo fluxo (loading/empty/error/success/disabled)
5) **Acessibilidade mínima** (contraste, foco, navegação teclado, labels)
6) **Responsivo real** (mobile-first, depois desktop)
7) **Sem poluição** (espaçamento e alinhamento primeiro, efeitos depois)

---

## Padrão RS — Tokens e estilo (Dark + Gold)
> Respeite a skill `rs-padrao-ui-dark-gold` como fonte primária de tokens.
Se tokens não existirem, proponha e implemente:

### Design tokens mínimos
- Background: `bg-surface`, `bg-elevated`
- Texto: `text-primary`, `text-muted`
- Borda: `border-subtle`
- Ação primária (Gold): `brand-gold`
- Danger: `danger`
- Sucesso: `success`
- Sombras: discretas e consistentes
- Radius: padronizar (ex: 12px/16px)

**Regra:** não inventar 20 cores. Poucas cores, bem usadas.

---

## Checklist de Auditoria Visual (obrigatório)
Ao receber uma tela/fluxo, valide:

### A) Layout e Grid
- [ ] Existe container padrão (ex: max-w + padding consistente)?
- [ ] Grid coerente (cards alinhados, colunas simétricas)?
- [ ] Espaçamento padronizado (4/8/12/16/24/32)?
- [ ] Sem “quebra” em 360px (mobile)?

### B) Tipografia e Hierarquia
- [ ] H1/H2/H3 definidos e usados corretamente
- [ ] Texto secundário com `muted` e tamanho adequado
- [ ] Densidade boa (sem blocos longos sem respiro)

### C) Componentes (consistência)
- [ ] Botões: primário/secondary/ghost/danger padronizados
- [ ] Inputs com label/placeholder/help/error
- [ ] Cards com header/content/footer claros
- [ ] Tabelas com header fixo quando necessário
- [ ] Modais/Sheets com foco, scroll correto, ações no footer

### D) Estados
- [ ] Loading (skeleton/spinner)
- [ ] Empty (texto + CTA)
- [ ] Error (mensagem útil + retry)
- [ ] Success (feedback claro)
- [ ] Disabled (motivo quando aplicável)

### E) Acessibilidade e UX
- [ ] Foco visível (outline)
- [ ] Navegação por teclado funciona
- [ ] Contraste suficiente
- [ ] Ícones com `aria-label` quando necessário

### F) Performance percebida
- [ ] Evitar layout shift
- [ ] Evitar re-render agressivo em listas grandes
- [ ] Lazy-load/virtualização quando necessário

---

## Padrões de Implementação (React/Next + Tailwind)
### Estrutura mínima recomendada
- `/components/ui/*` (base)
- `/components/domain/*` (negócio/feature)
- `/pages|/app` (telas)
- `/styles/tokens.css` ou theme config
- `cn()` util para classes
- “Design audit” como etapa de PR

### Convenções
- Nada de inline styles soltos sem padrão
- Nada de componentes duplicados com variação aleatória
- Extrair componentes repetidos (Card, Button, Input, Badge, Tabs, Table, Modal)

---

## Saída padrão desta skill (formato que você deve entregar)
Sempre entregar nesta ordem:

1) **Diagnóstico visual** (1 parágrafo): principais falhas (hierarquia, spacing, consistência)
2) **Plano de correção** (bullet list curto)
3) **Mudanças aplicadas**:
   - Componentes criados/alterados (lista)
   - Tokens/cores (se mexeu, justificar)
4) **Código** (patch dos componentes/telas)
5) **Checklist de validação visual** (passo a passo)
6) **Riscos** (ex: regressão de responsivo, contraste, estados)

---

## Guardrails (não quebrar o sistema)
- Não alterar regras de negócio
- Não mexer em status financeiro no frontend (respeitar leis RS)
- Não criar dependência desnecessária
- Se precisar de lib, justificar e preferir built-in/leve
- Se faltar contexto, pedir **no máximo 3 informações objetivas**

---

## Prompt interno (para execução)
> “Aplique auditoria visual RS nesta tela/fluxo. Faça UI premium Dark+Gold, responsivo e acessível. Padronize componentes, estados e spacing. Entregue patches e checklist.”
