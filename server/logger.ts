export interface LogEvent {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  category: "api" | "gemini" | "safety" | "reminders" | "network" | "system";
  message: string;
  details?: any;
}

const MAX_LOGS = 60;
const logBuffer: LogEvent[] = [
  {
    id: "init-1",
    timestamp: new Date().toISOString(),
    level: "info",
    category: "system",
    message: "IMD Care diagnostic logger initialized.",
  }
];

export function addDiagnosticLog(
  level: "info" | "warn" | "error" | "debug",
  category: "api" | "gemini" | "safety" | "reminders" | "network" | "system",
  message: string,
  details?: any
) {
  const event: LogEvent = {
    id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    details: details ? (typeof details === "object" ? JSON.parse(JSON.stringify(details)) : String(details)) : undefined,
  };

  logBuffer.unshift(event);
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.pop();
  }
}

export function getDiagnosticLogs(): LogEvent[] {
  return [...logBuffer];
}

export function clearDiagnosticLogs() {
  logBuffer.length = 0;
  addDiagnosticLog("info", "system", "Diagnostic logs cleared by user.");
}
