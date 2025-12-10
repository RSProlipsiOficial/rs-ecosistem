# 🎨 RS STUDIO - DOCUMENTAÇÃO COMPLETA

**Versão:** 1.0.0  
**Data:** 07/11/2025  
**Status:** ✅ SISTEMA COMPLETO

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [RS Assistant (IA)](#rs-assistant)
4. [Base de Conhecimento](#base-de-conhecimento)
5. [Sistema de Treinamento](#sistema-de-treinamento)
6. [Geração de Conteúdo](#geração-de-conteúdo)
7. [Integrações](#integrações)
8. [API Reference](#api-reference)

---

## 🎯 VISÃO GERAL

O **RS Studio** é o hub central de comunicação, inteligência artificial e treinamento do ecossistema RS Prólipsi. Ele conecta todos os módulos através de IA avançada, automações e conteúdo educacional.

### Funcionalidades Principais:

✅ **Chat Inteligente** com IA multimodal  
✅ **Base de Conhecimento** vetorial  
✅ **Treinamentos** integrados com YouTube  
✅ **Geração de Conteúdo** (imagem, áudio, vídeo, texto)  
✅ **Notificações** automáticas  
✅ **Analytics** e métricas  

---

## 🏗️ ARQUITETURA

### Diagrama do Sistema:

```
┌─────────────────────────────────────────────────────┐
│                   RS STUDIO                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         RS ASSISTANT (PAI BALUCO)            │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐         │  │
│  │  │Vendedor│  │Recruta │  │ Coach  │         │  │
│  │  └────────┘  └────────┘  └────────┘         │  │
│  │  ┌────────┐  ┌────────┐                     │  │
│  │  │Suporte │  │Criador │                     │  │
│  │  └────────┘  └────────┘                     │  │
│  └──────────────────────────────────────────────┘  │
│                       │                             │
│         ┌─────────────┼─────────────┐              │
│         │             │             │              │
│  ┌──────▼──────┐ ┌───▼────┐ ┌─────▼──────┐       │
│  │ Knowledge   │ │Training│ │  Content   │       │
│  │    Base     │ │ System │ │ Generation │       │
│  └─────────────┘ └────────┘ └────────────┘       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                  INTEGRAÇÕES                        │
├─────────────────────────────────────────────────────┤
│  OpenAI │ ElevenLabs │ YouTube │ Supabase          │
└─────────────────────────────────────────────────────┘
```

### Tecnologias:

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 14, React 18, TailwindCSS |
| **Backend** | Node.js, Express |
| **IA** | OpenAI GPT-4, DALL-E 3, Whisper |
| **Voz** | ElevenLabs (ObHunter Voice) |
| **Banco** | Supabase + pgvector |
| **Deploy** | VPS Hostinger, PM2, Nginx |

---

## 🤖 RS ASSISTANT (PAI BALUCO)

### 1. VISÃO GERAL

O **RS Assistant**, carinhosamente chamado de **"Pai Baluco"**, é o assistente de IA multimodal que atua em 5 papéis diferentes.

### 2. CONFIGURAÇÃO

```json
{
  "name": "RS Assistant",
  "nickname": "Pai Baluco",
  "voice": "ObHunter (ElevenLabs)",
  "model": "GPT-4 Turbo",
  "personality": {
    "tone": "profissional, motivador e acolhedor",
    "style": "coach e mentor",
    "language": "pt-BR"
  }
}
```

### 3. PAPÉIS DO ASSISTENTE

#### 3.1 🛍️ VENDEDOR

**Capacidades:**
- Apresentar produtos
- Calcular valores e comissões
- Simular ganhos potenciais
- Processar pedidos
- Enviar propostas

**Exemplo de Conversa:**
```
Usuário: "Quanto eu ganho vendendo o produto de R$ 360?"

Pai Baluco: "Ótima pergunta! Vendendo o produto de R$ 360, você ganha:
- Comissão direta: R$ 108 (30%)
- Pontos SIGMA: 1 ciclo
- Bônus de profundidade: até R$ 24,52 (se tiver rede ativa)

Total potencial: R$ 132,52 + pontos para sua carreira! 🎯"
```

#### 3.2 👥 RECRUTADOR

**Capacidades:**
- Explicar plano de marketing
- Calcular ganhos potenciais
- Mostrar plano de carreira
- Responder dúvidas sobre o negócio
- Agendar reuniões

**Exemplo de Conversa:**
```
Usuário: "Como funciona o plano de marketing?"

Pai Baluco: "Vou te explicar de forma simples! 

O plano RS Prólipsi tem 3 pilares:

1️⃣ SIGMA (Matriz 1x6):
- Você completa ciclos de 6 pessoas
- Cada ciclo: R$ 108 de bônus
- Reentradas automáticas

2️⃣ Bônus de Profundidade:
- Ganhe até 9 níveis abaixo
- 6,81% do faturamento total
- Distribuído por nível

3️⃣ Carreira (13 PINs):
- De Iniciante a Cristal
- Bônus trimestral
- Até R$ 256.000 por trimestre

Quer que eu calcule seu potencial de ganhos? 💰"
```

#### 3.3 🎯 COACH

**Capacidades:**
- Consultar nível atual
- Mostrar progresso
- Calcular falta para próximo nível
- Sugerir ações
- Motivar

**Acesso a Dados:**
```sql
-- Consultas que o Coach pode fazer
SELECT nivel_carreira, ciclos_completados, diretos_ativos 
FROM consultores WHERE id = user_id;

SELECT saldo_disponivel, total_bonus 
FROM wallets WHERE user_id = user_id;

SELECT COUNT(*) as tamanho_rede 
FROM downlines WHERE upline_id = user_id;
```

**Exemplo de Conversa:**
```
Usuário: "Qual meu nível atual?"

Pai Baluco: "Olá, campeão! 🎯

Seu Status Atual:
📊 Nível: PIN04 (Ouro)
🔄 Ciclos: 15 completados
👥 Diretos: 6 ativos
💰 Saldo: R$ 2.450,00

Próximo Nível (PIN05 - Platina):
✅ Ciclos: 15/24 (faltam 9)
✅ Diretos: 6/5 (já atingiu!)
📈 Você está a 9 ciclos do Platina!

Continue assim! Você está arrasando! 💪"
```

#### 3.4 🆘 SUPORTE

**Capacidades:**
- Responder FAQ
- Resolver problemas técnicos
- Abrir tickets
- Consultar saldo e transações
- Gerar relatórios

**Base de FAQ:**
- 100+ perguntas frequentes
- Respostas automáticas
- Escalação para humano quando necessário

**Exemplo de Conversa:**
```
Usuário: "Como faço para sacar meu dinheiro?"

Pai Baluco: "Vou te ajudar com o saque! 💸

Passo a passo:
1️⃣ Acesse 'Wallet' no menu
2️⃣ Clique em 'Solicitar Saque'
3️⃣ Escolha o método:
   - PIX (instantâneo, taxa 2%)
   - TED/DOC (1-2 dias, taxa R$ 5)
4️⃣ Informe o valor
5️⃣ Confirme sua chave PIX ou dados bancários

⚠️ Importante:
- Janela de solicitação: dia 1 ao 5
- Pagamento: dia 10 ao 15
- Mínimo: R$ 10
- Máximo diário: R$ 10.000

Seu saldo disponível: R$ 2.450,00

Quer que eu abra a tela de saque para você?"
```

#### 3.5 🎨 CRIADOR

**Capacidades:**
- Gerar imagens (DALL-E 3)
- Gerar áudio (ElevenLabs)
- Gerar vídeos (Runway)
- Criar posts para redes sociais
- Criar páginas de vendas

**Exemplo de Conversa:**
```
Usuário: "Crie uma imagem para divulgar o produto"

Pai Baluco: "Vou criar uma imagem incrível para você! 🎨

Gerando imagem com:
- Produto em destaque
- Cores RS Prólipsi (dourado e preto)
- Estilo profissional e moderno
- Qualidade HD

⏳ Aguarde 10 segundos...

✅ Pronto! Aqui está sua imagem:
[Exibe imagem gerada]

Quer que eu crie também:
- Legenda para Instagram?
- Post para Facebook?
- Story animado?
```

### 4. INTELIGÊNCIA CONTEXTUAL

O assistente tem acesso a **todos os dados do usuário**:

```javascript
// Dados disponíveis para o assistente
const userContext = {
  // Perfil
  id: "uuid",
  nome: "João Silva",
  email: "joao@email.com",
  telefone: "+5511999999999",
  
  // Carreira
  nivel_carreira: "PIN04",
  ciclos_completados: 15,
  diretos_ativos: 6,
  
  // Financeiro
  saldo_disponivel: 2450.00,
  saldo_bloqueado: 200.00,
  total_bonus: 15000.00,
  
  // Rede
  tamanho_rede: 89,
  geracao_mais_profunda: 5,
  
  // Histórico
  ultima_venda: "2025-11-05",
  ultimo_recrutamento: "2025-11-03",
  ultimo_bonus: 108.00
};
```

### 5. LIMITES DE USO

```json
{
  "messagesPerUser": {
    "free": 50,
    "consultant": 200,
    "premium": -1
  },
  "imageGenerations": {
    "free": 5,
    "consultant": 20,
    "premium": 100
  },
  "audioGenerations": {
    "free": 10,
    "consultant": 50,
    "premium": 200
  }
}
```

---

## 📚 BASE DE CONHECIMENTO

### 1. ESTRUTURA

```
knowledge_base/
├── documents/          # Documentos principais
│   ├── plano_marketing.txt
│   ├── manual_produtos.txt
│   ├── politicas.txt
│   └── scripts_vendas.txt
├── faq/               # Perguntas frequentes
│   ├── cadastro.json
│   ├── financeiro.json
│   ├── rede.json
│   └── produtos.json
└── embeddings/        # Vetores para busca
    └── vectors.db
```

### 2. BUSCA VETORIAL

**Tecnologia:** OpenAI text-embedding-ada-002 (1536 dimensões)

**Processo:**
1. Documento é dividido em chunks de 1000 caracteres
2. Cada chunk é transformado em vetor
3. Vetores são armazenados no Supabase (pgvector)
4. Busca por similaridade coseno

**Exemplo de Busca:**
```javascript
// Usuário pergunta
const query = "Como funciona o bônus de fidelidade?";

// Sistema busca documentos similares
const results = await searchKnowledge(query, 0.7, 5);

// Retorna top 5 chunks mais relevantes
// IA usa esses chunks para responder
```

### 3. FAQ AUTOMÁTICO

**Categorias:**
- Cadastro e Login
- Financeiro e Saques
- Rede e SIGMA
- Produtos e Vendas
- Carreira e Bônus
- Suporte Técnico

**Total:** 100+ perguntas com respostas

---

## 🎓 SISTEMA DE TREINAMENTO

### 1. INTEGRAÇÃO YOUTUBE

**Configuração:**
```json
{
  "channelId": "UCRSProlipsiOfficial",
  "playlists": [
    "PLRSProlipsi_Treinamentos",
    "PLRSProlipsi_Produtos",
    "PLRSProlipsi_Carreira"
  ],
  "autoSync": true,
  "syncInterval": 3600
}
```

**Processo Automático:**
1. Sistema busca novos vídeos a cada hora
2. Baixa metadados (título, descrição, duração)
3. Gera transcrição (Whisper)
4. Cria resumo (GPT-4)
5. Gera quiz automático
6. Publica no painel

### 2. PROCESSAMENTO DE VÍDEOS

**Transcrição:**
```javascript
// Whisper API
const transcription = await openai.audio.transcriptions.create({
  file: videoAudio,
  model: "whisper-1",
  language: "pt",
  response_format: "srt"
});
```

**Resumo:**
```javascript
// GPT-4
const summary = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [{
    role: "system",
    content: "Você é um especialista em criar resumos de treinamentos."
  }, {
    role: "user",
    content: `Crie um resumo executivo deste treinamento:\n\n${transcription}`
  }],
  max_tokens: 500
});
```

**Quiz Automático:**
```javascript
// GPT-4 gera 5 perguntas
const quiz = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [{
    role: "system",
    content: "Crie 5 perguntas de múltipla escolha sobre este conteúdo."
  }, {
    role: "user",
    content: transcription
  }]
});
```

### 3. PROGRESSO DO USUÁRIO

**Tracking:**
```sql
-- Tabela training_progress
{
  "user_id": "uuid",
  "video_id": "uuid",
  "progress_percent": 75,
  "last_position": 450,
  "quiz_score": 80,
  "quiz_passed": true,
  "completed_at": "2025-11-07T10:30:00Z"
}
```

**Certificados:**
- Gerados automaticamente ao completar
- PDF com nome do usuário
- QR Code de verificação
- Válido nacionalmente

---

## 🎨 GERAÇÃO DE CONTEÚDO

### 1. IMAGENS (DALL-E 3)

**Configuração:**
```json
{
  "model": "dall-e-3",
  "quality": "hd",
  "size": "1024x1024",
  "style": "vivid"
}
```

**Casos de Uso:**
- Banners de produtos
- Posts para redes sociais
- Imagens de perfil
- Certificados personalizados
- Material de marketing

**Exemplo:**
```javascript
const image = await openai.images.generate({
  model: "dall-e-3",
  prompt: "Produto RS Prólipsi em destaque, fundo preto e dourado, estilo profissional",
  quality: "hd",
  size: "1024x1024"
});
```

### 2. ÁUDIO (ELEVENLABS)

**Configuração:**
```json
{
  "voiceId": "ObHunter_Custom_Voice",
  "model": "eleven_multilingual_v2",
  "stability": 0.75,
  "similarityBoost": 0.75
}
```

**Casos de Uso:**
- Mensagens de boas-vindas
- Parabéns por conquistas
- Narração de treinamentos
- Notificações por voz

**Exemplo:**
```javascript
const audio = await elevenlabs.textToSpeech({
  text: "Parabéns! Você completou seu primeiro ciclo SIGMA!",
  voice_id: "ObHunter_Custom_Voice",
  model_id: "eleven_multilingual_v2"
});
```

### 3. TEXTO (GPT-4)

**Casos de Uso:**
- Descrições de produtos
- Legendas para redes sociais
- E-mails de marketing
- Scripts de vendas
- Respostas automáticas

**Exemplo:**
```javascript
const text = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [{
    role: "system",
    content: "Você é um copywriter especialista em vendas."
  }, {
    role: "user",
    content: "Crie uma legenda para Instagram sobre o produto de R$ 360"
  }]
});
```

---

## 🔗 INTEGRAÇÕES

### 1. OPENAI

**API Key:** `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`

**Modelos Usados:**
- GPT-4 Turbo (chat)
- DALL-E 3 (imagens)
- Whisper (transcrição)
- text-embedding-ada-002 (vetores)

### 2. ELEVENLABS

**API Key:** `sk_d2b6db47fbe02c47f49cf8889568ace549ccabb04226ff53`

**Voz:** ObHunter (customizada)

### 3. YOUTUBE

**API Key:** `AIzaSyC1234567890abcdefghijklmnopqrstuv`

**Canal:** UCRSProlipsiOfficial

### 4. SUPABASE

**URL:** `https://rptkhrboejbwexseikuo.supabase.co`

**Tabelas:**
- assistant_conversations
- assistant_messages
- knowledge_documents
- knowledge_embeddings
- knowledge_faq
- training_videos
- training_progress
- generated_content
- assistant_analytics

---

## 📡 API REFERENCE

### Endpoints de Chat

#### POST /api/chat
Envia mensagem para o assistente

**Request:**
```json
{
  "message": "Qual meu nível atual?",
  "conversation_id": "uuid",
  "role": "coach"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Você está no PIN04 (Ouro)...",
  "conversation_id": "uuid",
  "tokens_used": 150,
  "response_time_ms": 1200
}
```

### Endpoints de Treinamento

#### GET /api/trainings
Lista treinamentos disponíveis

**Response:**
```json
{
  "success": true,
  "trainings": [
    {
      "id": "uuid",
      "title": "Como vender produtos RS",
      "duration": 1200,
      "thumbnail": "url",
      "category": "vendas",
      "level": "iniciante"
    }
  ]
}
```

#### POST /api/trainings/:id/progress
Atualiza progresso

**Request:**
```json
{
  "progress_percent": 75,
  "last_position": 900
}
```

### Endpoints de Conteúdo

#### POST /api/content/generate/image
Gera imagem

**Request:**
```json
{
  "prompt": "Banner de produto dourado",
  "size": "1024x1024"
}
```

**Response:**
```json
{
  "success": true,
  "image_url": "https://...",
  "content_id": "uuid"
}
```

---

## 📊 ANALYTICS

### Métricas Principais:

- **Conversas:** Total, ativas, fechadas
- **Mensagens:** Enviadas, recebidas, tempo de resposta
- **Satisfação:** Rating médio, feedback
- **Treinamentos:** Visualizações, conclusões, aprovação em quizzes
- **Conteúdo:** Imagens geradas, áudios criados, textos produzidos

### Dashboard:

```
┌─────────────────────────────────────┐
│  RS STUDIO ANALYTICS                │
├─────────────────────────────────────┤
│  Conversas Ativas:        1.234     │
│  Mensagens Hoje:          5.678     │
│  Tempo Resposta Médio:    1.2s      │
│  Satisfação (NPS):        4.8/5     │
│  Treinamentos Completos:  456       │
│  Conteúdo Gerado:         789       │
└─────────────────────────────────────┘
```

---

## 💛🖤 CONCLUSÃO

O **RS Studio** é o cérebro do ecossistema RS Prólipsi, oferecendo:

✅ **IA Avançada** com 5 papéis especializados  
✅ **Base de Conhecimento** vetorial e inteligente  
✅ **Treinamentos** automáticos do YouTube  
✅ **Geração de Conteúdo** multimodal  
✅ **Integrações** robustas  
✅ **Analytics** completo  

**Status:** ✅ PRODUÇÃO  
**Qualidade:** 🟢 EXCELENTE  
**Pronto para:** 🚀 TRANSFORMAR VIDAS

---

**Documentação gerada em:** 07/11/2025 06:35  
**Versão:** 1.0.0  
**Autor:** RS Prólipsi Tech Team
