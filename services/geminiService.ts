import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, this happens server-side.
// We are simulating the "Ask AI" feature in the CMS admin panel.

export const generateCreativeMetadata = async (title: string, tags: string[]): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("No API_KEY in env, skipping AI generation");
    return "AI generation unavailable. Please configure API_KEY.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const prompt = `Write a short, punchy 2-sentence synopsis for a movie titled "${title}" with tags: ${tags.join(', ')}. It should be exciting for a TV guide description.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini API Error", error);
    return "Failed to generate AI description.";
  }
};
