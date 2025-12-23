import { GoogleGenAI } from "@google/genai";
import { Platform, CopyFramework, EmojiLevel, PostObjective } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSocialCopy = async (
  topic: string, 
  tone: string, 
  platform: Platform,
  framework: CopyFramework,
  objective: PostObjective,
  emojiLevel: EmojiLevel,
  targetUrl?: string,
  audioBase64?: string, 
  audioMimeType: string = "audio/webm",
  imageBase64?: string,
  imageMimeType: string = "image/jpeg"
): Promise<{ text: string; imageIdea: string; viralScore: number }> => {
  try {
    const parts: any[] = [];
    
    // 1. Add Image if exists (Visual Context)
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64
        }
      });
    }

    // 2. Add Audio if exists (Voice Context)
    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: audioMimeType,
          data: audioBase64
        }
      });
    }

    const platformRules = {
      facebook: "Foque em engajamento, comunidades, parágrafos médios e perguntas.",
      instagram: "Foque em visual, frases curtas, 'quebra de padrão'. Adicione um bloco de 15 a 20 Hashtags relevantes ao final.",
      linkedin: "Tom mais profissional e corporativo ('B2B'). Foco em lições aprendidas, carreira e negócios. Formatação limpa com bullet points."
    };

    const objectiveRules = {
      engagement: "OBJETIVO: Gerar comentários e compartilhamentos. Termine com uma pergunta aberta e provocativa.",
      sales: "OBJETIVO: Venda direta/Conversão. Use gatilhos de urgência e escassez. A CTA deve ser forte para o link/compra.",
      traffic: "OBJETIVO: Cliques no link. Crie curiosidade (Curiosity Gap) que só pode ser saciada clicando.",
      authority: "OBJETIVO: Educar e mostrar expertise. Entregue valor denso e peça para salvar o post."
    };

    const emojiRules = {
      none: "Não use nenhum emoji no texto.",
      minimal: "Use no máximo 1 ou 2 emojis apenas para destaque pontual.",
      standard: "Use emojis de forma equilibrada para quebrar o texto.",
      max: "Use muitos emojis! Um visual vibrante e carregado de emoção em cada frase."
    };

    const frameworkInstructions = {
      livre: "Escreva de forma fluida e natural, priorizando a clareza e o engajamento.",
      aida: "Use o método AIDA: 1. Atenção (Headline chocante), 2. Interesse (Dados/Fatos), 3. Desejo (Benefícios), 4. Ação (CTA clara).",
      pas: "Use o método PAS: 1. Problema (Identifique a dor), 2. Agitação (Torne a dor visível e incômoda), 3. Solução (Apresente o produto/ideia como alívio).",
      bab: "Use o método BAB: 1. Before (Mundo atual com problema), 2. After (Mundo ideal resolvido), 3. Bridge (Como chegar lá - seu produto).",
      storytelling: "Use a Jornada do Herói simplificada: Comece com um contexto, apresente um conflito/desafio, mostre a virada de chave e finalize com a lição aprendida."
    };

    // Construct the text prompt in Portuguese
    let textPrompt = `
      Atue como um estrategista de conteúdo de elite para Redes Sociais, especialista em ${platform.toUpperCase()}.
      
      TAREFA PRINCIPAL:
      Crie um post altamente engajador e viral baseado nas informações fornecidas.

      PARÂMETROS ESTRATÉGICOS:
      - Rede Social Alvo: ${platform} (${platformRules[platform]})
      - Objetivo Principal: ${objectiveRules[objective]}
      - Intensidade de Emojis: ${emojiRules[emojiLevel]}
      - Tom de voz: ${tone}.
      - Estrutura de Escrita (Framework): ${frameworkInstructions[framework]}
      
      CONTEÚDO BASE:
      - Tópico/Texto: "${topic || 'Conteúdo geral'}".
      ${targetUrl ? `- O objetivo final é levar clique para este link: "${targetUrl}".` : ''}
      ${audioBase64 ? '- INSTRUÇÃO DE ÁUDIO: Use o áudio anexado como fonte primária de fatos e emoção.' : ''}
      ${imageBase64 ? '- INSTRUÇÃO VISUAL (IMPORTANTE): Uma imagem do produto/post foi anexada. Analise-a. Se houver texto na imagem, considere-o no contexto. Descreva ou complemente o que é visto na imagem dentro do texto do post.' : ''}
      
      FORMATO DE SAÍDA OBRIGATÓRIO:
      Você deve devolver a resposta separada exatamente pelas strings abaixo.
      
      ---TEXTO---
      (O texto do post aqui, formatado com quebras de linha).
      
      ---VISUAL---
      (Uma descrição de 1 parágrafo da imagem ideal ou "Imagem fornecida usada").
      
      ---SCORE---
      (Apenas um número de 0 a 100 indicando o potencial viral deste post).
    `;

    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: parts
      },
      config: {
        temperature: 0.85,
      }
    });

    const fullText = response.text || "";
    
    // Robust parsing
    const textPart = fullText.split('---TEXTO---')[1]?.split('---VISUAL---')[0] || fullText;
    const visualPart = fullText.split('---VISUAL---')[1]?.split('---SCORE---')[0] || "Imagem relacionada ao tema.";
    const scorePart = fullText.split('---SCORE---')[1] || "85";

    return {
      text: textPart.trim(),
      imageIdea: visualPart.trim(),
      viralScore: parseInt(scorePart.trim()) || 85
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao gerar a copy. Tente uma imagem menor ou verifique sua conexão.");
  }
};

export const refineCopy = async (currentText: string, instruction: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{
          text: `
            Você é um editor de texto especialista.
            TEXTO ORIGINAL:
            "${currentText}"

            SUA TAREFA:
            Reescreva o texto acima seguindo estritamente esta instrução: "${instruction}".
            Mantenha a formatação e o idioma Português Brasil.
            Retorne APENAS o novo texto, sem explicações.
          `
        }]
      }
    });

    return response.text?.trim() || currentText;
  } catch (error) {
    console.error("Refine Error", error);
    throw new Error("Não foi possível refinar o texto.");
  }
};