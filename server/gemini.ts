import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

/**
 * Validates and sanitizes the Gemini model name.
 * Strips 'models/' prefixes and ensures invalid environment tokens (such as keys accidentally
 * placed in GEMINI_MODEL) are replaced with the standard supported model.
 */
export function sanitizeModelName(inputModel?: string): string {
  if (!inputModel || typeof inputModel !== "string") {
    return "gemini-3.8-flash";
  }
  let cleaned = inputModel.trim();
  if (cleaned.startsWith("models/")) {
    cleaned = cleaned.replace(/^models\//, "");
  }
  // Check if it looks like a valid model name (e.g. gemini-3.8-flash, gemini-2.5-flash, etc.)
  if (/^gemini-[a-zA-Z0-9.-]+$/i.test(cleaned) || /^lyria-[a-zA-Z0-9.-]+$/i.test(cleaned)) {
    return cleaned;
  }
  // Fallback to standard model
  return "gemini-3.8-flash";
}

function resolveApiKey(): string {
  const envKey = process.env.GEMINI_API_KEY?.trim();
  if (envKey && envKey !== "MY_GEMINI_API_KEY" && envKey.length > 5) {
    return envKey;
  }
  // If an API key was accidentally placed in GEMINI_MODEL (e.g. starts with AQ. or AIza)
  const modelEnv = process.env.GEMINI_MODEL?.trim();
  if (modelEnv && (modelEnv.startsWith("AQ.") || modelEnv.startsWith("AIza"))) {
    return modelEnv;
  }
  return "";
}

export const apiKey = resolveApiKey();
export const modelName = sanitizeModelName(process.env.GEMINI_MODEL);

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
  return Boolean(resolveApiKey().length > 0);
}

/**
 * Executes a Gemini generateContent call with model name sanitization and a timeout.
 * Prevents requests from hanging indefinitely or failing due to unexpected model name format.
 */
export async function generateContentWithTimeout(
  params: any,
  timeoutMs: number = 7500
): Promise<any> {
  if (!ai) {
    throw new Error("Gemini AI client is not initialized. Please verify GEMINI_API_KEY.");
  }

  // Ensure model is guaranteed valid
  const safeModel = sanitizeModelName(params.model || modelName);
  const safeParams = {
    ...params,
    model: safeModel,
  };

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Gemini API request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    if (timer && typeof timer.unref === "function") {
      timer.unref();
    }
  });

  return Promise.race([
    ai.models.generateContent(safeParams),
    timeoutPromise
  ]);
}
