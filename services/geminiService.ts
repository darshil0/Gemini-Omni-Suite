import { GoogleGenAI } from '@google/genai';
import { EMAIL_SYSTEM_PROMPT, MODEL_IDS } from '../constants';

// Initialize AI Client
const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY environment variable is missing');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Feature 1: Email Agent ---
export const analyzeEmail = async (emailContent: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IDS.TEXT,
      contents: emailContent,
      config: {
        systemInstruction: EMAIL_SYSTEM_PROMPT,
        temperature: 0.3, // Lower temperature for more consistent classification
      },
    });
    return response.text || 'No analysis generated.';
  } catch (error) {
    console.error('Email analysis failed:', error);
    throw error;
  }
};

// --- Feature 2: Image Editing ---
export const editImage = async (
  base64Image: string,
  prompt: string,
  mimeType: string
): Promise<string> => {
  const ai = getAiClient();
  try {
    // Clean base64 string if it contains header
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: MODEL_IDS.IMAGE,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extract the image from the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${
          part.inlineData.data
        }`;
      }
    }

    throw new Error('No image generated in response');
  } catch (error) {
    console.error('Image editing failed:', error);
    throw error;
  }
};

// --- Feature 3: Live Audio ---
// Note: Live API connection is persistent and stateful, so it's better handled
// directly in the component or a dedicated class instance, rather than a stateless function here.
// However, we export the client creator for consistency.
export { getAiClient };
