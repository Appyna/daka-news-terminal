
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getGeminiContext = async (title: string, content: string, language: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a short, professional analysis and context for this news item in ${language}. Title: ${title}. Content: ${content}. Return a JSON object with 'analysis' and 'tags'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["analysis", "tags"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini context error:", error);
    return null;
  }
};

export const translateTitle = async (title: string, targetLang: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following news title to ${targetLang}: "${title}". Return only the translated text.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini translation error:", error);
    return title;
  }
};
