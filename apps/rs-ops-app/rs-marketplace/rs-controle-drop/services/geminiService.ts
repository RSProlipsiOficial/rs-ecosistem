import { GoogleGenAI } from "@google/genai";
import { Order, TrafficSpend, MonthlySummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePerformance = async (
  summary: MonthlySummary,
  traffic: TrafficSpend[]
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      Atue como um consultor sênior de E-commerce e Dropshipping focado em lucratividade (RS Controle Drop).
      
      Analise os seguintes dados financeiros do mês atual:
      
      DRE Gerencial:
      - Faturamento Bruto: R$ ${summary.grossRevenue.toFixed(2)}
      - Receita Líquida: R$ ${summary.netSales.toFixed(2)}
      - Lucro Bruto (Op): R$ ${summary.grossProfit.toFixed(2)}
      - Investimento Tráfego: R$ ${summary.adSpend.toFixed(2)}
      - Lucro Líquido Final: R$ ${summary.netProfit.toFixed(2)}
      
      Indicadores Chave:
      - ROI Global do Negócio: ${summary.globalRoi.toFixed(2)}%
      - Margem Líquida: ${summary.profitMargin.toFixed(2)}%
      - Ticket Médio: R$ ${summary.avgTicket.toFixed(2)}
      - Taxa de Conversão de Leads: ${summary.leadConversionRate.toFixed(2)}%
      - Total de Vendas: ${summary.salesCount} itens (${summary.ordersCount} pedidos)
      
      Dados de Tráfego (Recentes):
      ${JSON.stringify(traffic.slice(-5))}
      
      Forneça uma análise concisa e estratégica em Português (PT-BR) com:
      1. Diagnóstico da saúde financeira atual (estamos queimando caixa ou lucrando bem?).
      2. Uma oportunidade clara de melhoria (ex: aumentar ticket médio, reduzir CPA, trocar criativo, melhorar conversão de leads).
      3. Um alerta se houver algum indicador perigoso (ROI baixo, margem apertada).
      
      Mantenha o tom profissional, direto e encorajador. Use formatação Markdown.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    // FIX: `response.text` is a property, not a method. Changed `response.text()` to `response.text`.
    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro ao analisar dados com Gemini:", error);
    return "Erro ao conectar com a Inteligência Artificial. Verifique sua chave API ou tente novamente mais tarde.";
  }
};