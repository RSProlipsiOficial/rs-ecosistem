
import { GoogleGenAI } from "@google/genai";
import { CDProfile, Order, Product } from "../types";

// Helper to initialize Gemini safely
const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCDAnalysis = async (
  profile: CDProfile,
  orders: Order[],
  products: Product[],
  input: { text?: string; audio?: string; mimeType?: string }
): Promise<string> => {
  const ai = getGeminiClient();
  if (!ai) return "Erro: Chave de API não configurada. Verifique suas configurações de ambiente.";

  // Serializa os dados para a IA entender o contexto
  // Limitamos os pedidos aos últimos 10 para economizar tokens e focar no recente
  const recentOrders = orders.slice(0, 10);
  
  // Focamos nos produtos que têm estoque ou que deveriam ter
  const simplifiedProducts = products.map(p => ({
    name: p.name,
    stock: p.stockLevel,
    min: p.minStock,
    price: p.price,
    points: p.points,
    batches: p.batches?.map(b => ({ code: b.code, expires: b.expirationDate, qty: b.quantity }))
  }));

  const systemContext = `
    Você é a "RS-IA", a inteligência artificial oficial do Centro de Distribuição RS Prólipsi.
    Sua missão é ajudar o gerente ${profile.managerName} a otimizar o estoque, evitar perdas por validade e sugerir compras.
    
    DADOS DO CD:
    - Saldo: R$ ${profile.walletBalance}
    - Tipo: ${profile.type}
    - Gerente: ${profile.managerName}
    
    ESTOQUE ATUAL (JSON Resumido):
    ${JSON.stringify(simplifiedProducts)}

    PEDIDOS RECENTES (Apenas últimos 10):
    ${JSON.stringify(recentOrders.map(o => ({ id: o.id, date: o.date, total: o.total, points: o.totalPoints, status: o.status, items: o.items })))}

    DIRETRIZES:
    1. Seja direto, profissional e use a linguagem de gestão logística/MMN (Marketing Multinível).
    2. Se perguntarem sobre VALIDADE, analise os campos 'batches' e 'expires' nos produtos.
    3. Se perguntarem sobre COMPRAS, compare 'stock' com 'min' (Estoque Mínimo).
    4. Se o usuário enviar ÁUDIO, transcreva mentalmente e responda à dúvida dele.
    5. Responda em Markdown. Use negrito para destacar números importantes.
    6. Se o usuário pedir uma "Simulação" ou "Projeção", use os dados de pedidos recentes para estimar (extrapolar) a necessidade futura.
  `;

  try {
    const parts: any[] = [{ text: systemContext }];

    // Se tiver áudio, adiciona como parte inline
    if (input.audio) {
        parts.push({
            inlineData: {
                mimeType: input.mimeType || 'audio/webm',
                data: input.audio
            }
        });
        parts.push({ text: "\n\n(O usuário enviou um áudio. Responda à pergunta ou comando contido no áudio acima, considerando o contexto do estoque.)" });
    }

    // Se tiver texto, adiciona também
    if (input.text) {
        parts.push({ text: "\n\nPERGUNTA DO USUÁRIO:\n" + input.text });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: parts }
      ],
    });
    return response.text || "A RS-IA processou sua solicitação, mas não gerou texto de resposta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro de conexão com a RS-IA. Tente novamente em instantes.";
  }
};
