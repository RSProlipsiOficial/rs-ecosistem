
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly in the named parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAdCreatives = async (niche: string, objective: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 3 high-converting ad variations for a brand in the ${niche} niche with the objective: ${objective}. 
                 Return as a structured JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              description: { type: Type.STRING },
              cta: { type: Type.STRING },
              performanceScore: { type: Type.NUMBER, description: "Predicted performance from 0 to 100" }
            },
            required: ["headline", "description", "cta", "performanceScore"]
          }
        }
      }
    });

    // Access the generated text directly using the .text property (not a method).
    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Error generating creatives:", error);
    return [];
  }
};

export const getSmartAnalysis = async (campaignData: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the RS-ADS AI engine. Analyze this campaign data and provide 3 immediate tactical actions.
                 Data: ${campaignData}
                 Keep it professional, executive-level, and in Portuguese (Brazilian).`,
    });
    // Access the generated text directly using the .text property.
    return response.text || "Analysis unavailable at this moment.";
  } catch (error) {
    console.error("Error analyzing campaign:", error);
    return "Analysis unavailable at this moment.";
  }
};
