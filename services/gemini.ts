
import { GoogleGenAI, Type } from "@google/genai";
import { FileItem, AIUpdateResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const updateProjectWithAI = async (
  prompt: string,
  currentFiles: FileItem[]
): Promise<AIUpdateResponse> => {
  const model = ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      You are an expert web developer assistant for the IDE "DeepSiteAS".
      Your task is to update a web project based on a user's request.
      
      Current files in the project:
      ${currentFiles.map(f => `--- FILE: ${f.name} ---\n${f.content}`).join('\n\n')}

      User Request: "${prompt}"

      Instructions:
      1. Provide the complete updated content for any file that needs changing.
      2. If you need to create a new file, include it in the response.
      3. Use modern practices, Tailwind CSS (via CDN) is preferred for styling.
      4. Ensure JavaScript is interactive and functional.
      5. Return the response in the specified JSON format.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          files: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the file (e.g., index.html)" },
                content: { type: Type.STRING, description: "Full updated content of the file" }
              },
              required: ["name", "content"]
            }
          },
          explanation: { type: Type.STRING, description: "A brief explanation of what was changed" }
        },
        required: ["files", "explanation"]
      }
    }
  });

  const response = await model;
  const result = JSON.parse(response.text || "{}") as AIUpdateResponse;
  return result;
};
