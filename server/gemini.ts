import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
export const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

/**
 * Executes a Gemini generateContent call with a mandatory timeout (default 7500ms).
 * Prevents requests from hanging indefinitely if network egress is delayed.
 */
export async function generateContentWithTimeout(
  params: GenerateContentParameters,
  timeoutMs: number = 7500
): Promise<GenerateContentResponse> {
  if (!ai) {
    throw new Error("Gemini AI client is not initialized. Please verify GEMINI_API_KEY.");
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Gemini API request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    // Unref timer if node
    if (timer && typeof timer.unref === "function") {
      timer.unref();
    }
  });

  return Promise.race([
    ai.models.generateContent(params),
    timeoutPromise
  ]);
}
