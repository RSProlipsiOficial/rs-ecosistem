---
name: rs-padrao-ui-dark-gold
description: Skill de padronização visual e UX do ecossistema RS Prólipsi. Define tokens de cor, tipografia, espaçamento, componentes, estados e responsividade no padrão Dark + Gold RS. Deve ser aplicada a toda nova tela ou refatoração de UI. Keywords: ui, ux, design system, dark mode, gold, frontend.
---

# RS Prólipsi — Padrão Oficial de UI (Dark + Gold)

## Objetivo da Skill
Garantir que toda interface do RS Prólipsi:
- tenha identidade única
- seja consistente entre módulos
- comunique status corretamente
- seja limpa, profissional e escalável

---

## 1) Princípios de UI RS

1. **Escuro como base** (foco, menos ruído)
2. **Dourado como destaque** (ação, valor, status positivo)
3. **Hierarquia clara** (título → conteúdo → ação)
4. **Estados explícitos** (pendente ≠ pago)
5. **Simplicidade funcional** (menos elementos, mais clareza)

---

## 2) Paleta de cores (tokens conceituais)

### Base
- Fundo principal: `#0E0E0E` a `#121212`
- Cards: `#161616` a `#1C1C1C`
- Bordas suaves: `#2A2A2A`

### Texto
- Primário: `#FFFFFF`
- Secundário: `#B3B3B3`
- Desabilitado: `#6F6F6F`

### Destaque (Gold RS)
- Gold principal: `#C9A24D`
- Gold hover: `#E0B860`
- Gold sutil: `#8F7A3D`

### Estados
- Sucesso: `#2ECC71`
- Atenção: `#F1C40F`
- Erro: `#E74C3C`
- Info: `#3498DB`

---

## 3) Tipografia (diretriz)

- Títulos: sans-serif moderna (ex.: Inter, Poppins)
- Corpo: sans-serif legível
- Peso:
  - Título: 600–700
  - Subtítulo: 500
  - Texto: 400
- Evitar textos longos em caixa alta

---

## 4) Layout e espaçamento

- Grid consistente
- Margens internas (cards): 16–24px
- Espaçamento vertical entre blocos: 16–32px
- Sidebar colapsável (desktop)
- Header fixo opcional

---

## 5) Componentes padrão

### Cards
- Fundo escuro
- Borda sutil
- Sombra leve
- Título + conteúdo + ação clara

### Botões
- Primário: Gold RS
- Secundário: outline gold
- Destrutivo: vermelho
- Desabilitado: cinza

### Inputs
- Fundo escuro
- Borda sutil
- Foco em gold
- Erro com mensagem clara

---

## 6) Estados visuais obrigatórios

Toda entidade crítica DEVE exibir estado visual:

### Exemplos
- Pagamento: `Pendente` / `Pago` / `Expirado`
- Pedido: `Aguardando` / `Aprovado` / `Cancelado`
- Bônus: `Elegível` / `Liberado` / `Bloqueado`

Estados devem usar:
- Cor
- Texto
- (Opcional) ícone

---

## 7) Responsividade (mínimo)

- Mobile-first
- Breakpoints:
  - sm: até 640px
  - md: 641–1024px
  - lg: 1025px+
- Sidebar vira menu colapsado no mobile
- Tabelas viram listas quando necessário

---

## 8) UX — Regras importantes

- Nunca esconder status crítico
- Nunca depender de tooltip para informação essencial
- Feedback imediato para ações (loading, sucesso, erro)
- Confirmação para ações destrutivas
- Evitar pop-ups desnecessários

---

## 9) Integração com agentes

- Agentes de frontend DEVEM aplicar esta skill
- Não criar variações de cor por módulo
- O padrão RS é único em todo o ecossistema

---

## Regra de ouro
Se uma tela não “parece RS” à primeira vista,  
ela está fora do padrão e deve ser ajustada.
