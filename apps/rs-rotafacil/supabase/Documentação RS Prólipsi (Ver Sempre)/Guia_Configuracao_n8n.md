# Guia de Configuração: Chatbot WhatsApp Inteligente (n8n + Evolution API)

Este guia explica como configurar o fluxo de automação para que o seu WhatsApp responda automaticamente usando Inteligência Artificial (GPT).

## 1. Importar o Fluxo no n8n

1. Abra o seu n8n no RS RotaFácil (aba **Fluxos Inteligentes**).
2. Se estiver usando localmente fora do app, acesse `http://localhost:5678`.
3. Clique em **Workflows** > **Add Workflow**.
4. No canto superior direito, clique nos três pontos (menu) e selecione **Import from File**.
5. Selecione o arquivo: `external/n8n/templates/whatsapp-base-flow.json`.

## 2. Configurar Variáveis de Ambiente

No nó chamado **"Configurações"**, altere os seguintes campos para refletir o seu ambiente:
- `EVOLUTION_API_URL`: A URL da sua Evolution API (Ex: `http://localhost:8080`).
- `EVOLUTION_API_TOKEN`: A sua chave API (apikey) configurada na Evolution.
- `AI_PROMPT`: O "System Prompt" que define a personalidade do robô.

## 3. Configurar Credenciais da IA (OpenAI)

Este fluxo usa o nó da OpenAI. Você precisará de uma chave API:

1. Clique no nó **"Chatbot GPT"**.
2. No campo **Credential for OpenAI**, clique em **Create New Credential**.
3. Insira sua **OpenAI API Key**.
4. Clique em **Save**.
5. Ative o workflow (interruptor no topo da tela).

## 4. Vincular o Webhook na Evolution API

Para que o n8n "escute" as mensagens que chegam no WhatsApp:

1. No n8n, abra o nó chamado **"Webhook Evolution"**.
2. Copie a **Webhook URL** (Dica: Use a URL de *Production* para uso real).
3. Na Evolution API, vá em **Webhooks** e crie um novo:
   - **URL**: A URL que você copiou do n8n.
   - **Eventos**: Marque `MESSAGES_UPSERT`.
4. Salve e teste enviando um "Oi" para o WhatsApp conectado.

---
**IMPORTANTE:** O n8n deve estar rodando para que as respostas funcionem. Se você fechar o servidor n8n, o bot parará de responder.
