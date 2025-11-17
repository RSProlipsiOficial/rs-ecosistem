# 📚 DOCUMENTAÇÃO COMPLETA - PAINÉIS RS PRÓLIPSI

**Versão:** 1.0.0  
**Data:** 07/11/2025  
**Status:** ✅ SISTEMA COMPLETO

---

## 📋 ÍNDICE

1. [Visão Geral do Ecossistema](#visão-geral)
2. [Painel Admin](#painel-admin)
3. [Painel Consultor](#painel-consultor)
4. [Painel Marketplace](#painel-marketplace)
5. [RS Studio](#rs-studio)
6. [Integrações](#integrações)
7. [Design System](#design-system)
8. [Segurança](#segurança)

---

## 🌐 VISÃO GERAL DO ECOSSISTEMA

### Arquitetura Completa:

```
┌─────────────────────────────────────────────────────────┐
│              ECOSSISTEMA RS PRÓLIPSI                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ PAINEL ADMIN │  │   PAINEL     │  │  MARKETPLACE │ │
│  │              │  │  CONSULTOR   │  │  RS SHOPPING │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │          │
│         └─────────┬───────┴─────────┬───────┘          │
│                   │                 │                  │
│            ┌──────▼─────────────────▼──────┐          │
│            │      RS STUDIO + RS.IA        │          │
│            └──────┬─────────────────┬──────┘          │
│                   │                 │                  │
│         ┌─────────▼─────────┐  ┌────▼──────────┐     │
│         │  SUPABASE DB      │  │  WALLETPAY    │     │
│         │  + SIGMA ENGINE   │  │  + ASAAS      │     │
│         └───────────────────┘  └───────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Módulos Principais:

| Módulo | Porta | Domínio | Status |
|--------|-------|---------|--------|
| **Admin** | 5001 | admin.rsprolipsi.com.br | ✅ Ativo |
| **Consultor** | 5002 | consultor.rsprolipsi.com.br | ✅ Ativo |
| **Marketplace** | 5003 | marketplace.rsprolipsi.com.br | ✅ Ativo |
| **RS Studio** | 5004 | studio.rsprolipsi.com.br | ✅ Ativo |
| **API** | 3000 | api.rsprolipsi.com.br | ✅ Ativo |

---

## 🔐 PAINEL ADMIN

### 1. VISÃO GERAL

O **Painel Administrativo** é o centro de controle total do sistema RS Prólipsi, permitindo gerenciamento completo de consultores, rede, finanças, produtos e configurações.

### 2. MÓDULOS PRINCIPAIS

#### 2.1 Dashboard

**KPIs Principais:**
- Total de consultores ativos
- Faturamento mensal
- Bônus pagos
- Média de ganhos
- Taxa de ativação
- Crescimento da rede

**Gráficos:**
- Evolução de consultores (linha)
- Distribuição por PIN (pizza)
- Faturamento mensal (barras)
- Top 10 consultores (ranking)

#### 2.2 Gestão de Consultores

**Funcionalidades:**

✅ **Lista Completa:**
- Pesquisa por nome, email, CPF, ID
- Filtros: status, PIN, matriz, cidade
- Ordenação customizável
- Exportação CSV/PDF

✅ **Ficha Técnica:**
```json
{
  "identificacao": {
    "id": "UUID",
    "nome": "string",
    "email": "string",
    "cpf": "string",
    "telefone": "string",
    "endereco": "object",
    "status": "ativo|inativo|pendente|banido"
  },
  "rede": {
    "patrocinador_id": "UUID",
    "matriz_atual": "3x5|4x5",
    "nivel_carreira": "PIN01-PIN13",
    "diretos_ativos": "number",
    "ciclo_sigma": "number",
    "data_ativacao": "date"
  },
  "financeiro": {
    "saldo_atual": "decimal",
    "total_bonus": "decimal",
    "total_comissoes": "decimal",
    "total_saques": "decimal"
  }
}
```

✅ **Ações Disponíveis:**
- Editar dados pessoais
- Alterar status
- Visualizar rede completa
- Consultar histórico financeiro
- Aprovar/rejeitar saques
- Enviar mensagens
- Gerar relatórios

#### 2.3 SIGMA (Matriz e Rede)

**Visualização:**
- Árvore genealógica interativa (D3.js)
- Até 9 gerações
- Cores por status:
  - 🟢 Verde: Ativo
  - ⚫ Cinza: Inativo
  - 🟡 Dourado: Qualificado (PIN)

**Cálculos:**
- Pontos por nível
- Bônus de profundidade (L1-L9)
- Ciclos completados
- Spillover e reentradas

**Funções:**
```javascript
getUserNetwork(userId)
getMatrixStatus(userId)
getBonusSummary(userId)
calculateDepthBonus(userId, level)
```

#### 2.4 Carreira (PIN)

**13 Níveis de Carreira:**

| PIN | Nome | Ciclos | Diretos | VMEC | Bônus |
|-----|------|--------|---------|------|-------|
| PIN01 | Iniciante | 1 | 1 | 0% | - |
| PIN02 | Bronze | 3 | 2 | 0% | - |
| PIN03 | Prata | 6 | 3 | 0% | - |
| PIN04 | Ouro | 12 | 4 | 10% | R$ 500 |
| PIN05 | Platina | 24 | 5 | 15% | R$ 1.000 |
| PIN06 | Diamante | 48 | 6 | 20% | R$ 2.000 |
| PIN07 | Safira | 96 | 7 | 25% | R$ 4.000 |
| PIN08 | Rubi | 192 | 8 | 30% | R$ 8.000 |
| PIN09 | Esmeralda | 384 | 9 | 35% | R$ 16.000 |
| PIN10 | Ametista | 768 | 10 | 40% | R$ 32.000 |
| PIN11 | Topázio | 1.536 | 11 | 45% | R$ 64.000 |
| PIN12 | Ônix | 3.072 | 12 | 50% | R$ 128.000 |
| PIN13 | Cristal | 6.144 | 13 | 55% | R$ 256.000 |

**Apuração:**
- Trimestral
- VMEC por linha
- Bônus de carreira automático

#### 2.5 Financeiro (WalletPay)

**Gestão Completa:**

✅ **Saldos e Transações:**
- Visualização de todos os saldos
- Histórico completo
- Filtros por tipo, período, status
- Exportação de extratos

✅ **Saques:**
- Fila de aprovação
- Aprovação em lote
- Rejeição com motivo
- Histórico de processamento

✅ **Relatórios:**
- Bônus pagos por período
- Comissões distribuídas
- Taxas cobradas
- Conciliação bancária

#### 2.6 Marketplace

**Gestão de Produtos:**
- Cadastro completo
- Categorias e subcategorias
- Variações (tamanho, cor)
- Controle de estoque
- Imagens e descrições
- Preços e promoções

**Gestão de Pedidos:**
- Status em tempo real
- Aprovação de pagamentos
- Rastreamento de entregas
- Gestão de devoluções
- Relatórios de vendas

**Afiliação:**
- Links personalizados
- Comissões configuráveis
- Relatórios de performance
- Top vendedores

#### 2.7 Marketing e Pixels

**Pixels Configuráveis:**
- Google Ads
- Facebook/Instagram
- TikTok Ads
- Taboola
- LinkedIn Ads

**Eventos Rastreados:**
- ViewItem
- AddToCart
- Purchase
- Lead
- Conversion

**Consent Mode:**
- LGPD compliant
- Cookies configuráveis
- Opt-in/Opt-out

#### 2.8 Comunicação e Treinamentos

**Campanhas:**
- Criação de mensagens
- Segmentação de público
- Agendamento
- Métricas de abertura

**Treinamentos:**
- Upload de vídeos
- Integração YouTube
- Quizzes e certificados
- Progresso dos consultores

#### 2.9 Configurações

**Sistema:**
- Percentuais de bônus
- Taxas e limites
- Integrações (APIs)
- Backup e logs

**Usuários Admin:**
- Permissões por cargo
- Logs de auditoria
- 2FA obrigatório

### 3. TECNOLOGIAS

**Frontend:**
- Next.js 14
- React 18
- TailwindCSS
- Recharts
- D3.js
- Framer Motion

**Backend:**
- Node.js
- Supabase
- PostgreSQL
- Redis (cache)

**Deploy:**
- VPS Hostinger
- PM2
- Nginx + SSL
- Porta 5001

---

## 👤 PAINEL CONSULTOR

### 1. VISÃO GERAL

O **Painel do Consultor** é o escritório virtual onde cada consultor gerencia sua rede, vendas, ganhos e treinamentos.

### 2. MÓDULOS PRINCIPAIS

#### 2.1 Dashboard

**KPIs Pessoais:**
- Saldo atual
- Pontos acumulados
- Matrizes ativas
- Ciclos completados
- Diretos ativos
- Nível de carreira (PIN)

**Gráficos:**
- Evolução de ganhos
- Crescimento da rede
- Performance de vendas

#### 2.2 SIGMA (Minha Rede)

**Árvore Genealógica:**
- Visualização interativa
- Até 9 gerações
- Clique para detalhes
- Filtros por status

**Informações:**
```json
{
  "id": "UUID",
  "nome": "string",
  "nivel": 1-9,
  "posicao": {"x": 120, "y": 60},
  "ativo": true|false,
  "diretos": 5,
  "status_ciclo": "ativo|completo|inativo"
}
```

**Cores:**
- 🟢 Verde: Ativo
- ⚫ Cinza: Inativo
- 🟡 Dourado: Qualificado

#### 2.3 Bônus

**Tipos de Bônus:**

✅ **Ciclo (30%):**
- R$ 108 por ciclo
- Pagamento instantâneo

✅ **Profundidade (6.81%):**
- L1: 30%
- L2: 20%
- L3: 15%
- L4: 12%
- L5: 10%
- L6: 8%
- L7-L9: 5%

✅ **Fidelidade (1.25%):**
- Pool mensal
- Distribuição proporcional

✅ **Top SIGMA (4.5%):**
- Top 10 consultores
- Ranking mensal

✅ **Carreira (6.39%):**
- Bônus por PIN
- Trimestral

**Histórico:**
- Todos os bônus recebidos
- Filtros por tipo e período
- Exportação de relatórios

#### 2.4 Carreira

**Meu Progresso:**
- PIN atual
- Próximo nível
- Requisitos faltantes
- Projeção de ganhos

**Requisitos:**
- Ciclos necessários
- Diretos necessários
- Volume de rede
- Tempo estimado

#### 2.5 Wallet (Carteira)

**Saldo:**
- Disponível
- Bloqueado
- Total

**Transações:**
- Depósitos
- Bônus recebidos
- Saques
- Transferências

**Saques:**
- Solicitar via PIX
- Solicitar via TED/DOC
- Histórico de saques
- Status em tempo real

**Chaves PIX:**
- Cadastrar chaves
- Gerenciar chaves
- Chave principal

#### 2.6 RS Shopping (Loja)

**Minha Loja:**
- Link personalizado
- QR Code
- Catálogo de produtos
- Comissões

**Vendas:**
- Pedidos realizados
- Comissões ganhas
- Clientes
- Produtos mais vendidos

**Afiliação:**
- Link de afiliado
- Pixels configurados
- Métricas de conversão

#### 2.7 Comunicação (RS Studio)

**Chat RSA (IA):**
- Assistente inteligente
- Respostas instantâneas
- Consultas sobre:
  - Meu nível
  - Meu saldo
  - Minha rede
  - Próximos passos

**Mensagens:**
- Campanhas da empresa
- Notificações
- Alertas importantes

**Treinamentos:**
- Vídeos disponíveis
- Progresso
- Certificados
- Quizzes

#### 2.8 Perfil

**Dados Pessoais:**
- Editar informações
- Alterar senha
- 2FA

**Documentos (KYC):**
- Upload de documentos
- Status de verificação
- Níveis de KYC

**Configurações:**
- Notificações
- Privacidade
- Preferências

### 3. TECNOLOGIAS

**Frontend:**
- Next.js 14
- React 18
- TailwindCSS
- D3.js (rede)
- Recharts

**Deploy:**
- Porta 5002
- Nginx + SSL

---

## 🛒 PAINEL MARKETPLACE

### 1. VISÃO GERAL

O **RS Shopping** é o marketplace oficial integrado ao ecossistema, com vendas diretas, afiliação e dropshipping.

### 2. FUNCIONALIDADES

#### 2.1 Catálogo

**Produtos:**
- Título e descrição
- Imagens (múltiplas)
- Preço e promoções
- SKU e estoque
- Variações
- Categorias

**Filtros:**
- Por categoria
- Por preço
- Por relevância
- Por avaliação

#### 2.2 Carrinho e Checkout

**Carrinho:**
- Adicionar/remover produtos
- Atualizar quantidades
- Calcular frete
- Aplicar cupons

**Checkout:**
- Dados de entrega
- Método de pagamento:
  - PIX
  - Boleto
  - Cartão de Crédito (até 12x)
  - Cartão de Débito
- Revisão do pedido
- Confirmação

#### 2.3 Pagamentos

**Gateways:**
- MercadoPago
- PagSeguro
- PIX (Asaas)
- Boleto (Asaas)

**Split Automático:**
- Comissão do afiliado
- Crédito na Wallet
- Pontos SIGMA

#### 2.4 Logística

**Fretes Integrados:**
- Correios
- Melhor Envio
- Azul Cargo
- Loggi
- Total Express
- Jadlog
- SuperFrete

**Rastreamento:**
- Código de rastreio
- Status em tempo real
- Notificações automáticas

#### 2.5 Afiliação

**Link Personalizado:**
```
https://marketplace.rsprolipsi.com.br/?ref=CONSULTOR_ID
```

**Comissões:**
- Percentual configurável
- Crédito automático
- Relatórios de vendas

**Pixels:**
- Google Ads
- Facebook/Instagram
- TikTok
- Taboola
- LinkedIn

#### 2.6 Dropshipping

**Fornecedores:**
- Cadastro de parceiros
- Produtos vinculados
- Repasse automático

**Pedidos:**
- Encaminhamento automático
- Confirmação de envio
- Rastreamento

### 3. DESIGN

**Tema:**
- Dark + Gold
- Cards com hover
- Imagens otimizadas
- Responsivo mobile-first

**UX:**
- Busca inteligente
- Filtros rápidos
- Checkout em 3 passos
- Notificações em tempo real

### 4. TECNOLOGIAS

**Frontend:**
- Next.js 14
- TailwindCSS
- Framer Motion

**Deploy:**
- Porta 5003
- Nginx + SSL

---

## 🎨 RS STUDIO

### 1. VISÃO GERAL

O **RS Studio** é o hub de comunicação, IA e treinamento do ecossistema, integrando todos os módulos.

### 2. FUNCIONALIDADES

#### 2.1 Chat RSA (IA)

**Assistente Inteligente:**
- Nome: "Pai Baluco"
- Voz: ObHunter (ElevenLabs)
- Modelo: GPT-4 Turbo

**Papéis:**

🛍️ **Vendedor:**
- Apresentar produtos
- Calcular valores
- Simular ganhos
- Processar pedidos

👥 **Recrutador:**
- Explicar plano
- Calcular ganhos potenciais
- Mostrar carreira
- Responder dúvidas

🎯 **Coach:**
- Consultar nível atual
- Mostrar progresso
- Calcular falta para próximo nível
- Motivar

🆘 **Suporte:**
- Responder FAQ
- Resolver problemas
- Abrir tickets
- Consultar saldo

🎨 **Criador:**
- Gerar imagens (DALL-E)
- Gerar áudio (ElevenLabs)
- Gerar vídeos
- Criar posts

**Acesso a Dados:**
- Nível do usuário
- Saldo da wallet
- Posição na matriz
- Histórico de bônus
- Tamanho da equipe
- Próximo nível

#### 2.2 Base de Conhecimento

**Documentos:**
- Plano de Marketing
- Manuais de produtos
- FAQs
- Políticas
- Scripts de vendas

**Busca Vetorial:**
- Embeddings (OpenAI)
- Busca semântica
- Resultados relevantes

#### 2.3 Treinamentos

**YouTube Integration:**
- Importação automática
- Transcrição (Whisper)
- Resumo automático (GPT-4)
- Quizzes gerados

**Progresso:**
- Vídeos assistidos
- Quizzes completados
- Certificados emitidos
- Pontuação

#### 2.4 Geração de Conteúdo

**Imagens:**
- DALL-E 3
- Qualidade HD
- Estilo configurável
- Cores da marca

**Áudio:**
- ElevenLabs
- Voz ObHunter
- Multilíngue
- Alta qualidade

**Texto:**
- Descrições de produtos
- Posts para redes sociais
- E-mails
- Scripts de vendas

#### 2.5 Notificações

**Eventos:**
- Subiu de nível
- Recebeu bônus
- Ciclo completado
- Novo membro na equipe
- Saque aprovado

**Canais:**
- Chat
- Email
- Push
- WhatsApp

### 3. INTEGRAÇÕES

**Módulos Conectados:**
- Admin (criação de conteúdo)
- Consultor (consumo e interação)
- Marketplace (notificações de pedidos)
- WalletPay (alertas financeiros)
- SIGMA (mensagens de rede)

**APIs:**
- OpenAI (GPT-4, DALL-E, Whisper)
- ElevenLabs (Voz)
- YouTube (Vídeos)
- Supabase (Dados)

### 4. TECNOLOGIAS

**Frontend:**
- Next.js 14
- TailwindCSS
- Chat UI customizado

**Backend:**
- Node.js
- OpenAI API
- ElevenLabs API
- Supabase

**Deploy:**
- Porta 5004
- Nginx + SSL

---

## 🔗 INTEGRAÇÕES

### Fluxo de Dados Entre Módulos:

```
ADMIN
  ├─> Cria campanha → RS STUDIO → Consultores recebem
  ├─> Aprova saque → WALLETPAY → Consultor notificado
  └─> Configura produto → MARKETPLACE → Disponível para venda

CONSULTOR
  ├─> Faz venda → MARKETPLACE → Comissão → WALLETPAY
  ├─> Recruta → SIGMA → Bônus → WALLETPAY
  └─> Pergunta → RS STUDIO (IA) → Resposta com dados reais

MARKETPLACE
  ├─> Venda confirmada → WALLETPAY → Crédito
  ├─> Venda confirmada → SIGMA → Pontos
  └─> Status pedido → RS STUDIO → Notificação

WALLETPAY
  ├─> Saldo atualizado → CONSULTOR → Dashboard
  ├─> Saque solicitado → ADMIN → Aprovação
  └─> Transação → RS STUDIO → Notificação

SIGMA
  ├─> Ciclo completo → WALLETPAY → Bônus
  ├─> Novo nível → RS STUDIO → Parabéns
  └─> Rede atualizada → CONSULTOR → Visualização

RS STUDIO
  ├─> Mensagem criada → CONSULTORES → Recebem
  ├─> Treinamento → CONSULTORES → Assistem
  └─> IA responde → Dados de todos os módulos
```

---

## 🎨 DESIGN SYSTEM

### Paleta de Cores:

```css
/* Primário */
--gold: #C8A74E;
--gold-hover: #B8943F;
--gold-muted: #E6D7A5;

/* Fundo */
--graphite-900: #0F1115;
--graphite-800: #161A21;
--graphite-750: #1B2029;
--graphite-650: #2A303B;

/* Texto */
--zircon-50: #F2F4F8;
--zircon-200: #B7C0CD;
--zircon-350: #93A0B1;

/* Status */
--info: #3BAFDA;
--success: #38C793;
--warning: #E6A23C;
--danger: #EF5A5A;
```

### Tipografia:

```css
/* Títulos */
font-family: 'Inter', sans-serif;
font-weight: 600-700;
font-size: 24-32px;

/* Corpo */
font-family: 'Inter', sans-serif;
font-weight: 400-500;
font-size: 14-16px;

/* Labels */
font-family: 'Inter', sans-serif;
font-weight: 500;
font-size: 12-13px;
```

### Componentes:

**Cards:**
```css
background: #1B2029;
border: 1px solid #2A303B;
border-radius: 16px;
box-shadow: 0 10px 30px rgba(0,0,0,0.45);
```

**Botões:**
```css
/* Primário */
background: #C8A74E;
color: #000;
padding: 12px 24px;
border-radius: 8px;

/* Secundário */
background: #161A21;
color: #F2F4F8;
border: 1px solid #2A303B;
```

**Inputs:**
```css
background: #161A21;
border: 1px solid #2A303B;
border-radius: 8px;
padding: 12px 16px;

/* Focus */
border-color: #C8A74E;
box-shadow: 0 0 0 2px rgba(200,167,78,0.25);
```

### Responsividade:

```css
/* Breakpoints */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

## 🔒 SEGURANÇA

### Autenticação:

✅ **JWT com Refresh Token:**
- Access token: 15 minutos
- Refresh token: 7 dias
- Rotação automática

✅ **2FA:**
- Obrigatório para Admin
- Opcional para Consultor
- TOTP (Google Authenticator)

### Autorização:

✅ **Permissões por Perfil:**
- Admin: Acesso total
- Consultor: Dados próprios
- Logista: Loja própria

✅ **RLS (Row Level Security):**
- Usuários veem apenas próprios dados
- Políticas no Supabase
- Auditoria completa

### Criptografia:

✅ **Em Trânsito:**
- TLS 1.3
- HTTPS obrigatório
- Certificado SSL

✅ **Em Repouso:**
- AES-256
- Dados sensíveis tokenizados
- Chaves PIX criptografadas

### Auditoria:

✅ **Logs:**
- Todas as ações registradas
- IP e timestamp
- Retenção 7 anos
- Imutáveis

✅ **Compliance:**
- LGPD compliant
- KYC obrigatório
- Consent mode
- Políticas de privacidade

---

## 📊 MÉTRICAS E KPIs

### Admin:

- Total de consultores
- Taxa de ativação
- Faturamento mensal
- Bônus pagos
- Crescimento da rede
- Churn rate

### Consultor:

- Saldo atual
- Bônus recebidos
- Ciclos completados
- Diretos ativos
- Nível de carreira
- Vendas realizadas

### Marketplace:

- Total de vendas
- Ticket médio
- Taxa de conversão
- Produtos mais vendidos
- Comissões pagas
- Devoluções

### RS Studio:

- Mensagens enviadas
- Taxa de abertura
- Interações com IA
- Treinamentos completados
- Certificados emitidos
- Satisfação (NPS)

---

## 🚀 ROADMAP

### Fase 1 - Atual (Concluída):
✅ Painéis Admin, Consultor e Marketplace
✅ SIGMA e WalletPay
✅ RS Studio e IA
✅ Integrações completas

### Fase 2 - Q1 2026:
⏳ App Mobile (iOS/Android)
⏳ Gamificação avançada
⏳ BI e Analytics avançado
⏳ Automações de marketing

### Fase 3 - Q2 2026:
⏳ Internacionalização
⏳ Novos métodos de pagamento
⏳ Marketplace de serviços
⏳ API pública

---

## 💛🖤 CONCLUSÃO

O **Ecossistema RS Prólipsi** é uma plataforma completa, integrada e escalável para marketing multinível, com:

✅ **3 Painéis** completos e integrados
✅ **Sistema de IA** avançado
✅ **Marketplace** robusto
✅ **Segurança** de nível bancário
✅ **Design System** unificado
✅ **Documentação** completa

**Status:** ✅ PRODUÇÃO  
**Qualidade:** 🟢 EXCELENTE  
**Pronto para:** 🚀 ESCALA GLOBAL

---

**Documentação gerada em:** 07/11/2025 06:30  
**Versão:** 1.0.0  
**Autor:** RS Prólipsi Tech Team
