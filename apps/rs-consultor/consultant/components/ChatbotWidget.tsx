import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../ConsultantLayout';
import { GoogleGenAI, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import { IconBot, IconX, IconSend, IconTrash } from '../../components/icons';
import { 
    mockCareerPlan, 
    mockDeepNetwork, 
    mockWalletTransactions, 
    mockShopProducts, 
    mockAffiliateSellers,
    mockCycleSummary,
    mockTopSigmeRanking,
    mockTopSigmePersonalStats,
    mockShopSettings,
    // FIX: Imported countNetworkNodes from data.ts
    countNetworkNodes
} from '../data';
import type { NetworkNode } from '../../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  isStreaming?: boolean;
}

// --- Funções auxiliares para análise de rede ---
const findNodeByName = (node: NetworkNode, name: string): NetworkNode | null => {
    if (node.name.toLowerCase() === name.toLowerCase() && !node.isEmpty) {
        return node;
    }
    if (node.children) {
        for (const child of node.children) {
            const found = findNodeByName(child, name);
            if (found) return found;
        }
    }
    return null;
};

// FIX: Removed duplicated countNetworkNodes function. It is now imported from data.ts.
const countPinsInNetwork = (node: NetworkNode, pinCounts: { [key: string]: number } = {}): { [key: string]: number } => {
    if (!node || node.isEmpty) {
        return pinCounts;
    }
    // Não conta o nó raiz (o próprio usuário) no resumo da equipe
    if (node.level > 0 && node.pin) {
        pinCounts[node.pin] = (pinCounts[node.pin] || 0) + 1;
    }
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => countPinsInNetwork(child, pinCounts));
    }
    return pinCounts;
};


const ChatbotWidget: React.FC = () => {
  const { user, credits, setCredits } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const chatHistoryRef = useRef<Array<{ role: 'user' | 'model'; parts: any[] }>>([]);

  // --- Funções de Acesso a Dados (Ferramentas para a IA) ---
  const tools = {
    getConsultantData: ({ fields }: { fields: string | string[] }): { [key: string]: any } => {
      console.log('Function Call: getConsultantData', { fields });
      const requestedData: { [key: string]: any } = {};
      const fieldsAsArray = Array.isArray(fields) ? fields : [fields];
      fieldsAsArray.forEach(field => {
        if (field in user) {
          requestedData[field] = user[field as keyof typeof user];
        }
      });
      return requestedData;
    },
    getSigmeCareerPlanData: (): object => {
        console.log('Function Call: getSigmeCareerPlanData');
        const { pinTable, currentCycles } = mockCareerPlan;
        const currentPin = user.pin || 'Iniciante';

        let nextPin = null;
        const currentPinIndex = pinTable.findIndex(p => p.pin === currentPin);

        if (currentPinIndex !== -1 && currentPinIndex < pinTable.length - 1) {
            nextPin = pinTable[currentPinIndex + 1];
        }

        return {
            currentPin: currentPin,
            currentCycles: currentCycles,
            nextPin: nextPin?.pin || 'N/A',
            cyclesForNextPin: nextPin?.cycles || 0,
            cyclesNeeded: nextPin ? Math.max(0, nextPin.cycles - currentCycles) : 0,
        };
    },
    getGlobalCycleData: (): object => {
        console.log('Function Call: getGlobalCycleData');
        return {
            summary: mockCycleSummary,
            totalCompletedAllLevels: mockCycleSummary.reduce((acc, level) => acc + level.completed, 0)
        };
    },
    getTopSigmeData: (): object => {
        console.log('Function Call: getTopSigmeData');
        const userRank = mockTopSigmeRanking.find(r => r.name === user.name);
        return {
            userRank: userRank || { position: 'Não ranqueado', earnings: 0 },
            personalStats: mockTopSigmePersonalStats,
            top10Ranking: mockTopSigmeRanking,
        };
    },
    getNetworkData: ({ query, params }: { query: 'count_directs' | 'count_total' | 'list_directs' | 'get_downline_info' | 'count_downline' | 'summarize_by_pin', params?: { name: string } }): object => {
        console.log('Function Call: getNetworkData', { query, params });
        switch (query) {
            case 'count_directs':
                return { directCount: mockDeepNetwork.children.filter(c => !c.isEmpty).length };
            case 'count_total':
                return { totalCount: countNetworkNodes(mockDeepNetwork) - 1 };
            case 'list_directs':
                return { directs: mockDeepNetwork.children.filter(c => !c.isEmpty).map(c => ({ name: c.name, pin: c.pin })) };
            case 'get_downline_info': {
                if (!params?.name) return { error: "O nome do consultor é necessário." };
                const node = findNodeByName(mockDeepNetwork, params.name);
                if (!node) return { error: `Consultor '${params.name}' não encontrado na sua rede.` };
                return {
                    name: node.name,
                    directCount: node.children.filter(c => !c.isEmpty).length,
                };
            }
            case 'count_downline': {
                if (!params?.name) return { error: "O nome do consultor é necessário." };
                const node = findNodeByName(mockDeepNetwork, params.name);
                if (!node) return { error: `Consultor '${params.name}' não encontrado na sua rede.` };
                return { name: node.name, totalInMatrix: countNetworkNodes(node) - 1 };
            }
            case 'summarize_by_pin': {
                const counts = countPinsInNetwork(mockDeepNetwork);
                return { pinSummary: counts };
            }
            default:
                return { error: "Query de rede não suportada." };
        }
    },
    getWalletData: ({ query, filters }: { query: 'get_balance' | 'summarize_by_type', filters?: any }): object => {
        console.log('Function Call: getWalletData', { query, filters });
        if (query === 'get_balance') {
            const balance = mockWalletTransactions.reduce((acc, t) => acc + t.amount, 0);
            return { balance };
        }
        if (query === 'summarize_by_type') {
            const summary = mockWalletTransactions.reduce((acc, t) => {
                if (t.amount > 0) {
                    acc[t.type] = (acc[t.type] || 0) + t.amount;
                }
                return acc;
            }, {} as { [key: string]: number });
            return summary;
        }
        return { error: "Query não suportada." };
    },
    getShopData: ({ query }: { query: 'list_dropshipping_products' | 'list_affiliate_sellers' }): object => {
        console.log('Function Call: getShopData', { query });
        if (query === 'list_dropshipping_products') {
            return {
                products: mockShopProducts
                    .filter(p => p.category === 'RS Dropshipping')
                    .map(({ name, price }) => ({ name, price }))
            };
        }
        if (query === 'list_affiliate_sellers') {
            return {
                sellers: mockAffiliateSellers.map(({ name, category, commissionRate }) => ({ name, category, commissionRate }))
            };
        }
        return { error: "Query não suportada." };
    },
    getAffiliatePartnerInfo: ({ sellerName }: { sellerName: string }): object => {
        console.log('Function Call: getAffiliatePartnerInfo', { sellerName });
        const seller = mockAffiliateSellers.find(s => s.name.toLowerCase().includes(sellerName.toLowerCase()));

        if (!seller) {
            return { error: `Lojista parceiro '${sellerName}' não encontrado.` };
        }

        const userRef = user.id;
        const consultantSlug = mockShopSettings.storeSlug;

        const partnerStoreLink = `https://rsprolipsi.com/loja/${seller.id}?ref=${userRef}`;
        const myGeneralStoreLink = `https://rsprolipsi.com/loja/${consultantSlug}`;
        
        const prewrittenAdText = `🚀 Lançamento na ${seller.name}! 🚀\n\nEncontre os melhores produtos da categoria ${seller.category} e aproveite ofertas exclusivas. Ao comprar pelo meu link, você me ajuda a crescer e ainda garante produtos de alta qualidade!\n\n✨ Ganhe ${seller.commissionRate}% de comissão em cada venda! ✨\n\nClique e confira: ${partnerStoreLink}`;

        return {
            name: seller.name,
            category: seller.category,
            commissionRate: seller.commissionRate,
            links: {
                partnerStoreLink,
                myGeneralStoreLink
            },
            prewrittenAdText
        };
    },
  };
  
  // --- Declarações de Funções para o Gemini ---
  const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'getConsultantData',
        description: "Obtém dados pessoais e de negócios do consultor logado. Essencial para responder perguntas sobre 'meu/minha', como 'qual é o meu ID?', 'meu email', 'meu link de indicação', ou 'o link da minha loja'. Campos comuns: 'name', 'email', 'idConsultor', 'linkIndicacao' (para cadastrar novas pessoas), 'linkAfiliado' (a loja pessoal na RS Shop).",
        parameters: { type: Type.OBJECT, properties: { fields: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['fields'] },
    },
    {
        name: 'getSigmeCareerPlanData',
        description: 'Retorna informações sobre o plano de carreira SIGME: PIN atual, ciclos atuais, próximo PIN e ciclos necessários.',
        parameters: { type: Type.OBJECT, properties: {} },
    },
    {
        name: 'getGlobalCycleData',
        description: 'Obtém dados sobre os Ciclos Globais Universais, como quantos ciclos foram concluídos em cada nível (L1, L2, etc).',
        parameters: { type: Type.OBJECT, properties: {} },
    },
    {
        name: 'getTopSigmeData',
        description: 'Busca informações sobre o ranking Top Sigme, incluindo a posição e ganhos do consultor atual e o ranking geral.',
        parameters: { type: Type.OBJECT, properties: {} },
    },
    {
        name: 'getNetworkData',
        description: "Obtém informações e análises sobre a rede de consultores. Queries disponíveis: 'count_directs', 'count_total', 'list_directs', 'get_downline_info' (requer 'name'), 'count_downline' (requer 'name'), 'summarize_by_pin' (para contar graduados por PIN).",
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: "O tipo de análise a ser feita: 'count_directs', 'count_total', 'list_directs', 'get_downline_info', 'count_downline', 'summarize_by_pin'." },
                params: { type: Type.OBJECT, properties: { name: { type: Type.STRING, description: "Nome do consultor para buscas específicas (get_downline_info, count_downline)." } } }
            },
            required: ['query'],
        }
    },
    {
        name: 'getWalletData',
        description: "Acessa os dados financeiros da RS Wallet Pay.",
        parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING, description: "Tipo de consulta: 'get_balance', 'summarize_by_type'." } }, required: ['query'] },
    },
    {
        name: 'getShopData',
        description: "Acessa informações gerais da RS Shop, como listar produtos ou parceiros.",
        parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING, description: "Tipo de consulta: 'list_dropshipping_products', 'list_affiliate_sellers'." } }, required: ['query'] }
    },
    {
        name: 'getAffiliatePartnerInfo',
        description: "Obtém todas as informações de marketing para um lojista parceiro, incluindo os diferentes links de afiliado e um texto de divulgação (copy) sugerido para campanhas.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                sellerName: { type: Type.STRING, description: "O nome do lojista parceiro a ser buscado. Ex: 'Tech Store Brasil'." },
            },
            required: ['sellerName'],
        }
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 112; 
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);


  const systemInstruction = `Você é a RSIA, a coach virtual e analista de negócios especialista do 'Escritório Virtual' da RS Prólipsi. Sua missão é ser uma parceira indispensável, com acesso total a TODOS os dados da plataforma para fornecer respostas precisas e estratégias para o consultor.

**Seu Processo Mental:**
1.  **Analisar a Pergunta:** Qual é a informação exata que o consultor precisa? A pergunta é sobre dados **pessoais** do consultor ("meu", "minha") ou sobre dados **gerais** da plataforma (parceiros, outros consultores)?
2.  **Mapear para Ferramenta:**
    *   Se for sobre dados **pessoais**, use \`getConsultantData\` primeiro.
    *   Se for sobre parceiros de afiliação, use \`getAffiliatePartnerInfo\`.
    *   Se for sobre a rede, use \`getNetworkData\`.
3.  **Selecionar e Executar a Ferramenta:** Escolha a função exata para obter os dados. NUNCA responda sem antes consultar uma ferramenta se os dados não forem de conhecimento geral.
4.  **Formular a Resposta:** Use os dados retornados pela ferramenta para construir uma resposta completa, precisa e útil.

**Regras de Ouro para Links e Dados Pessoais:**
-   Se o usuário pedir **"o link da minha loja"**, **"meu link de afiliado"**, ou algo similar, a resposta correta está no campo \`linkAfiliado\`. Use \`getConsultantData({ fields: ['linkAfiliado'] })\`.
-   Se o usuário pedir **"meu link de indicação"** ou **"link de cadastro"**, a resposta correta está no campo \`linkIndicacao\`. Use \`getConsultantData({ fields: ['linkIndicacao'] })\`.
-   **NÃO CONFUNDA!** \`getAffiliatePartnerInfo\` é **APENAS** para lojistas parceiros externos (ex: Tech Store Brasil). **NUNCA** use essa função para encontrar os links pessoais do consultor.

**SEU ACESSO TOTAL AO ESCRITÓRIO VIRTUAL (Ferramentas):**

*   **Dados do Consultor Logado (A MAIS IMPORTANTE):**
    *   \`getConsultantData({ fields: ['campo1', 'campo2'] })\`: Use para "qual meu email?", "qual meu link da loja?". Campos disponíveis: 'name', 'email', 'idConsultor', 'linkIndicacao', 'linkAfiliado'.

*   **Marketing de Afiliados (Parceiros Externos):**
    *   \`getAffiliatePartnerInfo({ sellerName: 'NOME DA LOJA' })\`: Use para "gere uma copy para a Beleza Natural Cosméticos".

*   **Análise de Rede:**
    *   \`getNetworkData({ query: '...' })\`: Use para perguntas sobre a estrutura da rede, como "quantos graduados eu tenho?".

*   **Financeiro (Wallet), Ciclo Global, Carreira, etc.:**
    *   Use as funções correspondentes (\`getWalletData\`, \`getGlobalCycleData\`, etc.) para dados específicos dessas áreas.

**Regras Críticas:**
-   **VOCÊ TEM ACESSO A TUDO. NUNCA DIGA "NÃO TENHO ACESSO".** Se a pergunta for sobre os dados do painel, use a ferramenta correta.
-   Seja proativa na ajuda, mas **NÃO FAÇA PERGUNTAS OU DÊ SUGESTÕES** se o usuário não pedir. Apenas responda diretamente à pergunta.
-   Responda em português do Brasil.`;

  useEffect(() => {
    if (isOpen) {
        try {
            const savedHistory = localStorage.getItem('rsia_chat_history');
            if (savedHistory) {
                const parsedHistory = JSON.parse(savedHistory);
                if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                    chatHistoryRef.current = parsedHistory;
                    const loadedMessages: Message[] = parsedHistory.flatMap((entry, index) => {
                       if (entry.role === 'user' && entry.parts[0].text) {
                           return { id: Date.now() + index, sender: 'user', text: entry.parts[0].text };
                       }
                       if (entry.role === 'model' && entry.parts[0].text) {
                           return { id: Date.now() + index, sender: 'bot', text: entry.parts[0].text };
                       }
                       return []; // Ignore function calls/responses for UI display
                    });
                    setMessages(loadedMessages);
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
            localStorage.removeItem('rsia_chat_history');
        }

        // Only show welcome message if history is empty
        if (messages.length === 0) {
            const welcomeMessage = `Olá, ${user.name}! Sou a RSIA, sua coach virtual. Como posso ajudar a impulsionar seus negócios hoje?`;
            setMessages([{ id: Date.now(), sender: 'bot', text: welcomeMessage }]);
        }
    }
  }, [isOpen]);

    const handleClearHistory = () => {
        if (confirm('Tem certeza de que deseja limpar o histórico da conversa?')) {
            setMessages([]);
            chatHistoryRef.current = [];
            localStorage.removeItem('rsia_chat_history');
            const welcomeMessage = `Olá, ${user.name}! Sou a RSIA, sua coach virtual. Como posso ajudar a impulsionar seus negócios hoje?`;
            setMessages([{ id: Date.now(), sender: 'bot', text: welcomeMessage }]);
        }
    };
  
  const processFunctionCall = async (response: GenerateContentResponse): Promise<string> => {
      const functionCalls = response.functionCalls;
      if (!functionCalls || functionCalls.length === 0) {
          return response.text;
      }
      
      const fc = functionCalls[0];
      const tool = tools[fc.name as keyof typeof tools];
      if (!tool) {
          throw new Error(`Function ${fc.name} not found.`);
      }

      // @ts-ignore
      const result = tool(fc.args);

      chatHistoryRef.current.push({
          role: 'model',
          parts: [{ functionCall: fc }],
      });
      chatHistoryRef.current.push({
          role: 'user',
          parts: [{ functionResponse: { name: fc.name, response: { result } } }],
      });
      
      const finalResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: chatHistoryRef.current,
          config: { systemInstruction, tools: [{ functionDeclarations }] }
      });
      
      return processFunctionCall(finalResponse);
  };

  const handleSendMessage = async (prompt: string) => {
    if (!prompt.trim() || isLoading || credits <= 0) return;

    setError(null);
    setCredits(prev => Math.max(0, prev - 1));
    const userMessage: Message = { id: Date.now(), sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const botMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botMessageId, sender: 'bot', text: '', isStreaming: true }]);
    
    chatHistoryRef.current.push({ role: 'user', parts: [{ text: prompt }] });
    
    try {
        const initialResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: chatHistoryRef.current,
            config: { systemInstruction, tools: [{ functionDeclarations }] }
        });

        const finalText = await processFunctionCall(initialResponse);
        
        setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: finalText, isStreaming: false } : msg
        ));
        
        chatHistoryRef.current.push({ role: 'model', parts: [{ text: finalText }] });

    } catch (error) {
        console.error("Gemini stream error:", error);
        const errorMessage = "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.";
        setError(errorMessage);
        setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: errorMessage, isStreaming: false } : msg
        ));
    } finally {
        setIsLoading(false);
         try {
            localStorage.setItem('rsia_chat_history', JSON.stringify(chatHistoryRef.current));
        } catch (error) {
            console.error("Failed to save chat history:", error);
        }
    }
  };


  const fabClass = "fixed bottom-5 right-5 h-16 w-16 bg-brand-gold rounded-full flex items-center justify-center shadow-lg shadow-brand-gold/30 cursor-pointer transform hover:scale-110 transition-transform z-50";
  const chatWindowClass = `fixed bottom-24 right-5 w-[90vw] max-w-sm h-[70vh] max-h-[600px] bg-brand-gray-dark/90 backdrop-blur-md border border-brand-gray-light rounded-xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`;
    
  return (
    <>
      <style>{`
        .typing-cursor {
            display: inline-block;
            width: 8px;
            height: 1rem;
            background-color: #E5E7EB;
            animation: blink 1s step-end infinite;
            margin-left: 4px;
        }
        @keyframes blink {
            from, to { background-color: transparent; }
            50% { background-color: #E5E7EB; }
        }
      `}</style>
      <button onClick={() => setIsOpen(!isOpen)} className={fabClass} aria-label="Abrir chatbot RSIA">
        {isOpen ? <IconX size={32} className="text-brand-dark" /> : <IconBot size={32} className="text-brand-dark" />}
      </button>

      <div className={chatWindowClass}>
        <header className="p-4 border-b border-brand-gray flex justify-between items-center">
            <div className="flex items-center gap-3">
                 <div>
                    <h3 className="font-bold text-white">RSIA - Sua Coach Virtual</h3>
                    <p className="text-xs text-green-400 flex items-center"><span className="h-2 w-2 bg-green-400 rounded-full mr-1.5"></span>Online</p>
                </div>
                <button onClick={handleClearHistory} title="Limpar histórico" className="text-gray-400 hover:text-white">
                    <IconTrash size={18} />
                </button>
            </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-brand-gold">{credits}</p>
            <p className="text-xs text-gray-400">Créditos</p>
          </div>
        </header>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.sender === 'bot' && <IconBot size={24} className="text-brand-gold flex-shrink-0 mt-1" />}
              <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-gold text-brand-dark rounded-br-none' : 'bg-brand-gray-light text-white rounded-bl-none'}`}>
                <div className="text-sm whitespace-pre-wrap">{msg.text}{msg.isStreaming && <span className="typing-cursor"></span>}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {error && <div className="px-4 pb-2 text-center text-sm text-red-400">{error}</div>}

        {credits > 0 ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className="p-3 border-t border-brand-gray flex items-center gap-2">
            <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(inputValue);
                    }
                }}
                placeholder="Converse com sua coach..."
                className="flex-1 bg-brand-gray border border-brand-gray-light rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none max-h-28"
                disabled={isLoading}
            />
            <button type="submit" className="h-10 w-10 bg-brand-gold rounded-full flex items-center justify-center flex-shrink-0 text-brand-dark disabled:opacity-50" disabled={isLoading || !inputValue.trim()}>
                <IconSend size={20} />
            </button>
            </form>
        ) : (
            <div className="p-4 border-t border-brand-gray text-center">
                <p className="text-sm text-yellow-400 font-semibold">Você utilizou todos os seus créditos.</p>
                <NavLink 
                    to="/consultant/shop/marketplace"
                    onClick={() => setIsOpen(false)}
                    className="mt-2 block w-full bg-brand-gold text-brand-dark text-sm font-bold py-2 rounded-lg hover:bg-yellow-300"
                >
                    Comprar Créditos na RS Shop
                </NavLink>
            </div>
        )}
      </div>
    </>
  );
};

export default ChatbotWidget;