import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import { modelName, hasGeminiKey } from "./server/gemini.ts";
import { healthAssistantRouter } from "./server/routes/healthAssistant.ts";
import { symptomGuidanceRouter } from "./server/routes/symptomGuidance.ts";
import { reportSimplifierRouter } from "./server/routes/reportSimplifier.ts";
import { remindersRouter } from "./server/routes/reminders.ts";
import { wellnessTipsRouter } from "./server/routes/wellnessTips.ts";
import { diagnosticsRouter } from "./server/routes/diagnostics.ts";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
const isProd = process.env.NODE_ENV === "production";

// Middleware
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Basic Security & Header sanitization
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// API Routes
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "IMD Care",
    version: "1.0.0",
    geminiKeyConfigured: hasGeminiKey(),
    model: modelName,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/health-assistant", healthAssistantRouter);
app.use("/api/symptom-guidance", symptomGuidanceRouter);
app.use("/api/report-simplifier", reportSimplifierRouter);
app.use("/api/reminders", remindersRouter);
app.use("/api/wellness-tips", wellnessTipsRouter);
app.use("/api/diagnostics", diagnosticsRouter);

// Export Archive Route
app.get("/api/export-archive", (_req: Request, res: Response) => {
  const archivePath = "/tmp/imd-care-source.tar.gz";
  res.download(archivePath, "imd-care-source.tar.gz", (err) => {
    if (err) {
      console.error("Archive download error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Could not generate or download source archive." });
      }
    }
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Internal Server Error:", err?.message || err);
  res.status(err.status || 500).json({
    error: "An unexpected server error occurred.",
    message: err?.message || "Please check server logs.",
  });
});

async function startServer() {
  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`[IMD Care] Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
