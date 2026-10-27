import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { apiKey, modelName, hasGeminiKey, generateContentWithTimeout, sanitizeModelName } from "../gemini.ts";
import { addDiagnosticLog, getDiagnosticLogs, clearDiagnosticLogs } from "../logger.ts";

export const diagnosticsRouter = Router();

function maskSecret(secret?: string): string {
  if (!secret) return "Not Configured";
  if (secret.length <= 8) return "•••••••• (" + secret.length + " chars)";
  const prefix = secret.slice(0, 6);
  const suffix = secret.slice(-4);
  return `${prefix}...${suffix} (${secret.length} chars)`;
}

// GET /api/diagnostics - Comprehensive system and environment telemetry
diagnosticsRouter.get("/", (_req: Request, res: Response) => {
  const envRawModel = process.env.GEMINI_MODEL || "";
  const rawKey = process.env.GEMINI_API_KEY || "";
  const keySource = process.env.GEMINI_API_KEY
    ? "GEMINI_API_KEY"
    : process.env.GEMINI_MODEL?.startsWith("AQ.") || process.env.GEMINI_MODEL?.startsWith("AIza")
    ? "GEMINI_MODEL (auto-detected key fallback)"
    : "None";

  // Check key validation issues
  const keyIssues: string[] = [];
  if (!apiKey) {
    keyIssues.push("GEMINI_API_KEY is missing from environment. AI operations will use educational demo fallbacks.");
  } else if (apiKey === "MY_GEMINI_API_KEY") {
    keyIssues.push("GEMINI_API_KEY is currently set to placeholder value 'MY_GEMINI_API_KEY'. Please configure a valid key.");
  } else if (apiKey.length < 15) {
    keyIssues.push("Configured key is unusually short (< 15 characters). Standard keys are typically 39+ characters.");
  }

  // Check model validation issues
  const modelIssues: string[] = [];
  const sanitized = sanitizeModelName(envRawModel);
  if (envRawModel && envRawModel !== sanitized) {
    modelIssues.push(`Raw GEMINI_MODEL '${envRawModel}' had unexpected format; automatically sanitized to '${sanitized}'.`);
  }

  // Storage health check
  const dataDir = path.resolve(process.cwd(), "data");
  const remindersFile = path.join(dataDir, "reminders.json");
  let storageStatus = {
    exists: false,
    writable: false,
    readable: false,
    path: remindersFile,
    recordsCount: 0,
    error: null as string | null,
  };

  try {
    if (fs.existsSync(remindersFile)) {
      storageStatus.exists = true;
      const content = fs.readFileSync(remindersFile, "utf-8");
      storageStatus.readable = true;
      const parsed = JSON.parse(content);
      storageStatus.recordsCount = Array.isArray(parsed) ? parsed.length : 0;
      // Test write permission
      fs.accessSync(remindersFile, fs.constants.W_OK);
      storageStatus.writable = true;
    }
  } catch (err: any) {
    storageStatus.error = err.message;
  }

  const memory = process.memoryUsage();

  return res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
      platform: process.platform,
      port: process.env.PORT || "3000",
    },
    apiKeyInspection: {
      configured: Boolean(apiKey && apiKey !== "MY_GEMINI_API_KEY"),
      maskedValue: maskSecret(apiKey),
      source: keySource,
      hasValidPrefix: Boolean(apiKey && (apiKey.startsWith("AIza") || apiKey.startsWith("AQ."))),
      issues: keyIssues,
    },
    modelInspection: {
      rawEnvValue: envRawModel || "(not set in env; using default)",
      resolvedModelName: modelName,
      isSanitized: Boolean(envRawModel && envRawModel !== modelName),
      issues: modelIssues,
      supportedAlternatives: [
        "gemini-3.8-flash",
        "gemini-2.5-flash",
        "gemini-flash-latest",
      ],
    },
    storageHealth: storageStatus,
    processMetrics: {
      uptimeSeconds: Math.floor(process.uptime()),
      heapUsedMb: (memory.heapUsed / 1024 / 1024).toFixed(1),
      heapTotalMb: (memory.heapTotal / 1024 / 1024).toFixed(1),
      rssMb: (memory.rss / 1024 / 1024).toFixed(1),
    },
    recentLogs: getDiagnosticLogs(),
  });
});

// POST /api/diagnostics/probe - Active live test probe against Google Gemini API
diagnosticsRouter.post("/probe", async (_req: Request, res: Response) => {
  addDiagnosticLog("info", "gemini", "Initiating active live connection probe to Gemini API...");
  const startTime = Date.now();

  if (!hasGeminiKey()) {
    const errorMsg = "No GEMINI_API_KEY configured in environment.";
    addDiagnosticLog("warn", "gemini", errorMsg);
    return res.status(503).json({
      success: false,
      latencyMs: 0,
      stage: "configuration",
      errorCode: "MISSING_API_KEY",
      errorMessage: errorMsg,
      recommendation: "Set GEMINI_API_KEY in Google AI Studio Secrets or your .env file to enable live AI capabilities.",
    });
  }

  try {
    const response = await generateContentWithTimeout(
      {
        model: modelName,
        contents: "Respond with the single word: PONG",
      },
      8000
    );

    const latencyMs = Date.now() - startTime;
    const text = (response?.text || "").trim();

    addDiagnosticLog("info", "gemini", `Live probe succeeded in ${latencyMs}ms. Response: '${text}'`);

    return res.json({
      success: true,
      latencyMs,
      testedModel: modelName,
      modelResponse: text,
      message: "Connection to Gemini API established successfully.",
    });
  } catch (probeError: any) {
    const latencyMs = Date.now() - startTime;
    const rawMessage = probeError?.message || String(probeError);
    let errorCode = "UNKNOWN_ERROR";
    let recommendation = "Review network connectivity and model settings.";

    if (rawMessage.includes("timed out")) {
      errorCode = "NETWORK_TIMEOUT";
      recommendation = "The request timed out after 8000ms. In preview containers, outbound network egress to generativelanguage.googleapis.com may be delayed or restricted. The app automatically provides graceful educational fallbacks.";
    } else if (rawMessage.includes("API_KEY_INVALID") || rawMessage.includes("UNAUTHENTICATED") || rawMessage.includes("401") || rawMessage.includes("403")) {
      errorCode = "INVALID_API_KEY";
      recommendation = "The API key was rejected by Google Gemini. Please re-check your key in Google AI Studio Settings > Secrets.";
    } else if (rawMessage.includes("RESOURCE_EXHAUSTED") || rawMessage.includes("429")) {
      errorCode = "QUOTA_EXCEEDED";
      recommendation = "Gemini API rate limit or quota exceeded for this project. Wait a few moments or upgrade billing.";
    } else if (rawMessage.includes("unexpected model name format") || rawMessage.includes("INVALID_ARGUMENT") || rawMessage.includes("400")) {
      errorCode = "INVALID_MODEL_FORMAT";
      recommendation = `The model name '${modelName}' was rejected by the API. Ensure GEMINI_MODEL is set to a valid model alias such as 'gemini-3.8-flash'.`;
    } else if (rawMessage.includes("503") || rawMessage.includes("UNAVAILABLE") || rawMessage.includes("high demand")) {
      errorCode = "MODEL_HIGH_DEMAND_503";
      recommendation = "Google's Gemini model endpoint is temporarily reporting high traffic / capacity demand (503 UNAVAILABLE). The platform automatically engages verified educational fallbacks so you can continue using all features without disruption.";
    } else if (rawMessage.includes("ENOTFOUND") || rawMessage.includes("ECONNREFUSED") || rawMessage.includes("fetch failed")) {
      errorCode = "NETWORK_ERROR";
      recommendation = "Failed to establish TCP connection with Google's API endpoint. Check internet access or proxy configuration.";
    }

    addDiagnosticLog("error", "gemini", `Live probe failed (${errorCode}): ${rawMessage}`, {
      latencyMs,
      errorCode,
      model: modelName,
    });

    return res.status(502).json({
      success: false,
      latencyMs,
      testedModel: modelName,
      errorCode,
      errorMessage: rawMessage,
      recommendation,
    });
  }
});

// POST /api/diagnostics/clear-logs
diagnosticsRouter.post("/clear-logs", (_req: Request, res: Response) => {
  clearDiagnosticLogs();
  return res.json({ success: true, message: "Diagnostic logs cleared." });
});
