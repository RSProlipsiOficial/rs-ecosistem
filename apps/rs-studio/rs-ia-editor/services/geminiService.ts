import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedCopy } from "../types";

// Helper to get API client. Expects process.env.API_KEY to be available.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getAiClient();
  
  // Mapping our internal IDs to Gemini supported aspect ratios
  let validRatio = "1:1";
  if (aspectRatio === '9:16') validRatio = "9:16";
  if (aspectRatio === '16:9') validRatio = "16:9";
  if (aspectRatio === '3:4') validRatio = "3:4";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: validRatio as any,
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated.");
};

export const enhancePrompt = async (simplePrompt: string): Promise<string> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Act as a professional Midjourney/DALL-E prompt engineer. 
    Rewrite the following simple prompt to be highly detailed, sophisticated, and artistic.
    Focus on lighting, texture, camera angle, and luxury aesthetics (gold/black themes if applicable).
    
    Simple prompt: "${simplePrompt}"
    
    Return ONLY the improved prompt text, no explanations.`,
  });

  return response.text?.trim() || simplePrompt;
};

export const generateCopy = async (context: string, imageBase64?: string | null): Promise<GeneratedCopy> => {
  const ai = getAiClient();

  const parts: any[] = [];
  
  // If an image is provided, add it to the request (Multimodal)
  if (imageBase64) {
    // Strip the data:image/png;base64, prefix if present
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
    parts.push({
      inlineData: {
        mimeType: 'image/png', // Assuming PNG for canvas exports/uploads
        data: cleanBase64
      }
    });
    
    parts.push({
      text: `Analyze this ad creative image visually. Based on its mood, colors, and subject, create sophisticated ad copy.
      Context/Offer provided by user: ${context}.
      Required: A Headline (short, punchy), Body (persuasive, max 2 lines), and CTA.
      Tone: Minimalist, Luxury, High-end.`
    });
  } else {
    parts.push({
      text: `Create text for a sophisticated, minimalist ad.
      Context: ${context}.
      Required: A Headline (short, punchy), Body (persuasive, max 2 lines), and CTA.
      Tone: Minimalist, Luxury, High-end.`
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: parts
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          body: { type: Type.STRING },
          cta: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No text generated");

  return JSON.parse(text) as GeneratedCopy;
};