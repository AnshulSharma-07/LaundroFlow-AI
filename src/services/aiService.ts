import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseLaundryOrder(input: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following laundry order description into a structured JSON format. 
      Input description: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customerName: { type: Type.STRING },
            customerPhone: { type: Type.STRING },
            garments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "e.g., Shirt, Pants, Saree" },
                  quantity: { type: Type.INTEGER }
                },
                required: ["type", "quantity"]
              }
            }
          },
          required: ["customerName", "garments"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("AI Order Parsing Error:", error);
    return null;
  }
}
