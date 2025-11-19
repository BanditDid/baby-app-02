import { GoogleGenAI, Type } from "@google/genai";
import { Mood, GeminiAnalysisResult } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is expected to be available.
const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API Key not found. AI features will be disabled.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
}

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<GeminiAnalysisResult | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: `Analyze this photo of a child. 
            1. Determine the mood from these options: Happy, Crying, Sad, Sleeping, Playful, Neutral.
            2. Write a short, heartwarming caption (max 1 sentence) as if written by a loving parent.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: {
              type: Type.STRING,
              enum: [
                Mood.HAPPY,
                Mood.CRYING,
                Mood.SAD,
                Mood.SLEEPING,
                Mood.PLAYFUL,
                Mood.NEUTRAL
              ]
            },
            suggestedNote: {
              type: Type.STRING
            }
          },
          required: ["mood", "suggestedNote"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as GeminiAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return null;
  }
};
