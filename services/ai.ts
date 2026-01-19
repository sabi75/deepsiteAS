
import { GoogleGenAI, Type } from "@google/genai";
import { FileItem, AIUpdateResponse, AISettings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const SYSTEM_PROMPT = `
You are an expert web developer assistant for the IDE "DeepSiteAS".
Your task is to update a web project based on a user's request.

Instructions:
1. Provide the complete updated content for any file that needs changing.
2. If you need to create a new file, include it in the response.
3. Use modern practices, Tailwind CSS (via CDN) is preferred for styling.
4. Ensure JavaScript is interactive and functional.
5. Return the response in a valid JSON format with "files" (array of {name, content}) and "explanation" (string).
`;

export const updateProjectWithAI = async (
  prompt: string,
  currentFiles: FileItem[],
  settings: AISettings
): Promise<AIUpdateResponse> => {
  const fileContext = currentFiles.map(f => `--- FILE: ${f.name} ---\n${f.content}`).join('\n\n');
  const fullPrompt = `
    ${SYSTEM_PROMPT}
    
    Current project state:
    ${fileContext}

    User Request: "${prompt}"
    
    IMPORTANT: Respond ONLY with a raw JSON object. No markdown wrapping unless required by the specific provider.
  `;

  if (settings.provider === 'gemini') {
    const model = ai.models.generateContent({
      model: settings.modelId || 'gemini-3-pro-preview',
      contents: fullPrompt,
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
                  name: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["name", "content"]
              }
            },
            explanation: { type: Type.STRING }
          },
          required: ["files", "explanation"]
        }
      }
    });

    const response = await model;
    return JSON.parse(response.text || "{}") as AIUpdateResponse;
  }

  // Handle OpenRouter or DeepSeek via generic fetch
  const endpoint = settings.provider === 'openrouter' 
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.deepseek.com/v1/chat/completions';
  
  const apiKey = settings.provider === 'openrouter' ? settings.openRouterKey : settings.deepSeekKey;

  if (!apiKey) {
    throw new Error(`API Key for ${settings.provider} is missing. Please add it in settings.`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...(settings.provider === 'openrouter' ? { 'HTTP-Referer': window.location.origin, 'X-Title': 'DeepSiteAS' } : {})
    },
    body: JSON.stringify({
      model: settings.modelId,
      messages: [{ role: 'user', content: fullPrompt }],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData?.error?.message || `API Error from ${settings.provider}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content) as AIUpdateResponse;
};
