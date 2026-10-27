import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Sparkles,
  Server,
  AlertTriangle,
  Lock,
  PhoneCall,
  CheckCircle2,
  RefreshCw,
  Activity,
  Terminal,
  Cpu,
  Database,
  Key,
  Copy,
  Check,
  Zap,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  User as UserIcon,
  LogIn
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext.tsx";
import { useAuth, DEMO_PROFILES } from "../context/AuthContext.tsx";

interface DiagnosticData {
  status: string;
  timestamp: string;
  environment: {
    nodeEnv: string;
    nodeVersion: string;
    platform: string;
    port: string;
  };
  apiKeyInspection: {
    configured: boolean;
    maskedValue: string;
    source: string;
    hasValidPrefix: boolean;
    issues: string[];
  };
  modelInspection: {
    rawEnvValue: string;
    resolvedModelName: string;
    isSanitized: boolean;
    issues: string[];
    supportedAlternatives: string[];
  };
  storageHealth: {
    exists: boolean;
    writable: boolean;
    readable: boolean;
    path: string;
    recordsCount: number;
    error: string | null;
  };
  processMetrics: {
    uptimeSeconds: number;
    heapUsedMb: string;
    heapTotalMb: string;
    rssMb: string;
  };
  recentLogs: Array<{
    id: string;
    timestamp: string;
    level: "info" | "warn" | "error" | "debug";
    category: string;
    message: string;
    details?: any;
  }>;
}

interface ProbeResult {
  success: boolean;
  latencyMs: number;
  testedModel?: string;
  modelResponse?: string;
  errorCode?: string;
  errorMessage?: string;
  recommendation?: string;
  stage?: string;
}

export const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, openSignInModal, switchProfile, logout } = useAuth();

  const [diagnostics, setDiagnostics] = useState<DiagnosticData | null>(null);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null);
  const [runningProbe, setRunningProbe] = useState(false);
  const [logFilter, setLogFilter] = useState<"all" | "error" | "warn" | "info">("all");
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [clearSuccess, setClearSuccess] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    setLoadingDiagnostics(true);
    try {
      const res = await fetch("/api/diagnostics");
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data);
      }
    } catch (err) {
      console.error("Failed to fetch diagnostics:", err);
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  const runLiveProbe = async () => {
    setRunningProbe(true);
    setProbeResult(null);
    try {
      const res = await fetch("/api/diagnostics/probe", { method: "POST" });
      const data = await res.json();
      setProbeResult(data);
      // Refresh logs after probe
      fetchDiagnostics();
    } catch (err: any) {
      setProbeResult({
        success: false,
        latencyMs: 0,
        errorCode: "CLIENT_FETCH_ERROR",
        errorMessage: err?.message || "Failed to contact diagnostic endpoint.",
        recommendation: "Ensure the local Node.js / Express dev server is running on port 3000.",
      });
    } finally {
      setRunningProbe(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch("/api/diagnostics/clear-logs", { method: "POST" });
      if (res.ok) {
        setClearSuccess("Diagnostic logs cleared.");
        fetchDiagnostics();
        setTimeout(() => setClearSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Failed to clear logs:", err);
    }
  };

  const handleCopyLogs = () => {
    if (!diagnostics) return;
    const report = {
      diagnostics,
      lastProbe: probeResult,
      clientTime: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2500);
  };

  const handleClearLocalStorage = () => {
    localStorage.removeItem("imd_water");
    localStorage.removeItem("imd_sleep");
    localStorage.removeItem("imd_activity");
    localStorage.removeItem("imd_note");
    setClearSuccess("Local browser storage cleared successfully.");
    setTimeout(() => setClearSuccess(null), 3000);
  };

  const filteredLogs = diagnostics?.recentLogs.filter((log) => {
    if (logFilter === "all") return true;
    return log.level === logFilter;
  }) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2583F5] flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#172B4D]">Settings & Diagnostics Center</h1>
            <p className="text-xs text-[#718096]">
              Deep connection diagnostics, environment inspection, and safety verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDiagnostics}
            disabled={loadingDiagnostics}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDiagnostics ? "animate-spin" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {clearSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{clearSuccess}</span>
        </div>
      )}

      {/* LANGUAGE & USER ACCOUNT PREFERENCES */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Globe className="w-5 h-5 text-[#2583F5]" />
          <div>
            <h2 className="text-base font-bold text-[#172B4D]">
              Language & Sign-In Options (भाषा व खाते)
            </h2>
            <p className="text-xs text-[#718096]">
              Switch application language across English, Hindi, and Marathi, and manage your account persona.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Multilingual Selector */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#2583F5]" />
                  Active Display Language
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#2583F5]">
                  {language === "hi" ? "हिंदी (Hindi)" : language === "mr" ? "मराठी (Marathi)" : "English"}
                </span>
              </div>
              <p className="text-xs text-[#718096] mb-3">
                Changes UI navigation, guidance checklists, laboratory summaries, and Gemini prompt directives.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  language === "en"
                    ? "bg-[#2583F5] text-white border-[#2583F5] shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  language === "hi"
                    ? "bg-[#2583F5] text-white border-[#2583F5] shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setLanguage("mr")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  language === "mr"
                    ? "bg-[#2583F5] text-white border-[#2583F5] shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                मराठी (Marathi)
              </button>
            </div>
          </div>

          {/* User Sign-In Profile */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-[#16B8A6]" />
                  Active User Profile
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  {user.role}
                </span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-teal-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user.avatarInitials}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172B4D]">{user.name}</p>
                  <p className="text-[11px] text-[#718096]">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openSignInModal()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#2583F5] hover:bg-[#1b6dd4] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{user.isGuest ? t("signIn") : "Switch Persona / Sign In"}</span>
              </button>
              {!user.isGuest && (
                <button
                  type="button"
                  onClick={() => logout()}
                  className="py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {t("signOut")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE LIVE CONNECTION INSPECTOR */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#2583F5]" />
            <div>
              <h2 className="text-base font-bold text-[#172B4D]">
                Live Gemini API Connection Probe
              </h2>
              <p className="text-xs text-[#718096]">
                Sends an active roundtrip probe to detect egress timeouts, invalid keys, or model errors.
              </p>
            </div>
          </div>

          <button
            onClick={runLiveProbe}
            disabled={runningProbe}
            className="flex items-center gap-2 px-4 py-2 bg-[#2583F5] hover:bg-[#1b6dd4] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Zap className={`w-3.5 h-3.5 ${runningProbe ? "animate-spin" : ""}`} />
            <span>{runningProbe ? "Probing Connection..." : "Run Connection Probe"}</span>
          </button>
        </div>

        {/* Probe Outcome Card */}
        {probeResult ? (
          <div
            className={`p-5 rounded-2xl border transition-all ${
              probeResult.success
                ? "bg-teal-50/70 border-teal-200 text-teal-950"
                : probeResult.errorCode === "NETWORK_TIMEOUT"
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : "bg-rose-50 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                {probeResult.success ? (
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold">
                    {probeResult.success
                      ? "Gemini API Connection: Healthy & Verified"
                      : `Connection Probe Issue: ${probeResult.errorCode || "Failed"}`}
                  </h3>
                  <p className="text-xs opacity-80">
                    {probeResult.success
                      ? `Model ${probeResult.testedModel || "gemini-3.8-flash"} responded successfully.`
                      : probeResult.errorMessage}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white/80 border border-slate-200 flex-shrink-0">
                {probeResult.latencyMs} ms
              </span>
            </div>

            {/* Granular Recommendation Box */}
            {probeResult.recommendation && (
              <div className="bg-white/90 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-slate-800">
                  <HelpCircle className="w-3.5 h-3.5 text-[#2583F5]" />
                  Granular Diagnosis & Next Steps:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {probeResult.recommendation}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#718096] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>No probe executed yet this session. Click "Run Connection Probe" to test live API roundtrip.</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Idle</span>
          </div>
        )}
      </div>

      {/* SECTION 2: GRANULAR ENVIRONMENT & TELEMETRY INSPECTION */}
      {diagnostics && (
        <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Server className="w-5 h-5 text-[#2583F5]" />
            <div>
              <h2 className="text-base font-bold text-[#172B4D]">
                Environment Variables & Secrets Inspection
              </h2>
              <p className="text-xs text-[#718096]">
                Non-sensitive verification of runtime configurations and storage state
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* API Key Health */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#2583F5]" />
                    GEMINI_API_KEY
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      diagnostics.apiKeyInspection.configured
                        ? "bg-teal-100 text-teal-800 border border-teal-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {diagnostics.apiKeyInspection.configured ? "Present" : "Missing"}
                  </span>
                </div>
                <div className="text-xs space-y-1 mt-2">
                  <p className="text-slate-500 text-[11px]">Masked Fingerprint:</p>
                  <code className="text-xs font-mono font-bold text-[#172B4D] bg-white px-2 py-1 rounded block border border-slate-200">
                    {diagnostics.apiKeyInspection.maskedValue}
                  </code>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Source: <span className="font-semibold">{diagnostics.apiKeyInspection.source}</span>
                  </p>
                </div>
              </div>

              {diagnostics.apiKeyInspection.issues.length > 0 && (
                <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                  {diagnostics.apiKeyInspection.issues[0]}
                </div>
              )}
            </div>

            {/* Model Name Health */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    GEMINI_MODEL
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      diagnostics.modelInspection.isSanitized
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-teal-100 text-teal-800 border border-teal-200"
                    }`}
                  >
                    {diagnostics.modelInspection.isSanitized ? "Sanitized" : "Standard"}
                  </span>
                </div>
                <div className="text-xs space-y-1 mt-2">
                  <p className="text-slate-500 text-[11px]">Active Resolved Model:</p>
                  <code className="text-xs font-mono font-bold text-indigo-700 bg-white px-2 py-1 rounded block border border-slate-200">
                    {diagnostics.modelInspection.resolvedModelName}
                  </code>
                  <p className="text-[11px] text-slate-500 mt-1 truncate" title={diagnostics.modelInspection.rawEnvValue}>
                    Raw Env: <span className="font-mono text-[10px]">{diagnostics.modelInspection.rawEnvValue}</span>
                  </p>
                </div>
              </div>

              {diagnostics.modelInspection.issues.length > 0 && (
                <div className="mt-3 p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-snug">
                  {diagnostics.modelInspection.issues[0]}
                </div>
              )}
            </div>

            {/* Storage & DB Health */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-600" />
                    Persistent Store
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      diagnostics.storageHealth.writable
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {diagnostics.storageHealth.writable ? "R/W OK" : "Read-Only"}
                  </span>
                </div>
                <div className="text-xs space-y-1 mt-2">
                  <p className="text-slate-500 text-[11px]">Reminders Store:</p>
                  <code className="text-[10px] font-mono text-[#172B4D] bg-white px-2 py-1 rounded block border border-slate-200 truncate" title={diagnostics.storageHealth.path}>
                    {diagnostics.storageHealth.path.split("/").slice(-2).join("/")}
                  </code>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Active Records: <span className="font-bold text-[#172B4D]">{diagnostics.storageHealth.recordsCount}</span>
                  </p>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Uptime: {diagnostics.processMetrics.uptimeSeconds}s</span>
                <span>RSS: {diagnostics.processMetrics.rssMb} MB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: DETAILED DIAGNOSTIC LOG VIEWER */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#2583F5]" />
            <div>
              <h2 className="text-base font-bold text-[#172B4D]">
                Detailed Diagnostic Log Stream
              </h2>
              <p className="text-xs text-[#718096]">
                Live in-memory events capturing API roundtrips, timeouts, fallbacks, and safety detections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Log level filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
              {(["all", "error", "warn", "info"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all cursor-pointer ${
                    logFilter === lvl
                      ? "bg-white text-[#2583F5] font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Copy diagnostic report to clipboard"
            >
              {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLogs ? "Copied" : "Copy Logs"}</span>
            </button>

            <button
              onClick={handleClearLogs}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Clear log buffer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Log Stream Container */}
        <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs max-h-72 overflow-y-auto space-y-2 border border-slate-800">
          {filteredLogs.length === 0 ? (
            <p className="text-slate-500 py-4 text-center">No log events matching filter.</p>
          ) : (
            filteredLogs.map((log) => {
              const isError = log.level === "error";
              const isWarn = log.level === "warn";

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-2.5 border-b border-slate-900 pb-2 hover:bg-slate-900/60 p-1 rounded transition-colors"
                >
                  <span className="text-[10px] text-slate-500 flex-shrink-0 pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>

                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                      isError
                        ? "bg-rose-900 text-rose-200"
                        : isWarn
                        ? "bg-amber-900 text-amber-200"
                        : "bg-blue-900 text-blue-200"
                    }`}
                  >
                    {log.level}
                  </span>

                  <span className="text-[10px] text-indigo-400 font-semibold flex-shrink-0">
                    [{log.category}]
                  </span>

                  <div className="flex-1 text-slate-300 break-words leading-relaxed">
                    <span>{log.message}</span>
                    {log.details && (
                      <pre className="text-[10px] text-slate-400 mt-1 bg-slate-900 p-1.5 rounded overflow-x-auto">
                        {typeof log.details === "object" ? JSON.stringify(log.details, null, 2) : String(log.details)}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Collapsible Raw JSON Telemetry */}
        <div className="pt-2">
          <button
            onClick={() => setShowRawJson((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs text-[#2583F5] font-semibold hover:underline cursor-pointer"
          >
            {showRawJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showRawJson ? "Hide Raw Diagnostic JSON" : "Inspect Raw Diagnostic JSON"}</span>
          </button>

          {showRawJson && diagnostics && (
            <pre className="mt-2 p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* SECTION 4: PRIVACY, LOCAL STORAGE & SAFEGUARDS */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Lock className="w-4 h-4 text-[#16B8A6]" />
          <h2 className="text-sm font-bold text-[#172B4D]">Data Privacy & Security Protocols</h2>
        </div>

        <div className="space-y-3 text-xs text-[#718096] leading-relaxed">
          <div className="flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-[#2583F5] mt-0.5 flex-shrink-0" />
            <p>
              <strong className="text-[#172B4D]">Zero Permanent Medical Chat Retention: </strong>
              Symptom entries and AI chat conversations are transiently evaluated in-session. They are never saved to a permanent database or sold to third parties.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-[#2583F5] mt-0.5 flex-shrink-0" />
            <p>
              <strong className="text-[#172B4D]">No Client-Side Secrets: </strong>
              All Gemini API credentials and requests are isolated exclusively on the Node.js backend. No API keys are bundled or exposed to the browser.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-[#2583F5] mt-0.5 flex-shrink-0" />
            <p>
              <strong className="text-[#172B4D]">Non-Diagnostic Safeguards: </strong>
              This platform adheres strictly to health literacy guidelines. It does not output definitive clinical diagnoses, prescribe prescription pharmaceuticals, or override in-person clinical consultations.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#172B4D]">Local Device Cache</p>
            <p className="text-[11px] text-[#718096]">Clear stored water, sleep, and activity values from this browser.</p>
          </div>

          <button
            onClick={handleClearLocalStorage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local Cache</span>
          </button>
        </div>
      </div>

      {/* SECTION 5: EMERGENCY HOTLINES DIRECTORY */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <PhoneCall className="w-4 h-4 text-rose-600" />
          <h2 className="text-sm font-bold text-[#172B4D]">Emergency Hotlines Directory</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
            <div>
              <p className="font-bold text-[#172B4D]">US / Canada Emergency</p>
              <p className="text-slate-500">Police, Fire, Ambulance</p>
            </div>
            <a href="tel:911" className="font-bold text-rose-600 px-2.5 py-1 rounded bg-white border border-rose-200 hover:bg-rose-50">
              911
            </a>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
            <div>
              <p className="font-bold text-[#172B4D]">EU / International</p>
              <p className="text-slate-500">Unified Emergency</p>
            </div>
            <a href="tel:112" className="font-bold text-rose-600 px-2.5 py-1 rounded bg-white border border-rose-200 hover:bg-rose-50">
              112
            </a>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
            <div>
              <p className="font-bold text-[#172B4D]">Suicide & Crisis Lifeline</p>
              <p className="text-slate-500">24/7 Free & Confidential</p>
            </div>
            <a href="tel:988" className="font-bold text-indigo-600 px-2.5 py-1 rounded bg-white border border-indigo-200 hover:bg-indigo-50">
              988
            </a>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
            <div>
              <p className="font-bold text-[#172B4D]">Poison Control (US)</p>
              <p className="text-slate-500">Toxic Ingestion Advice</p>
            </div>
            <a href="tel:18002221222" className="font-bold text-amber-600 px-2.5 py-1 rounded bg-white border border-amber-200 hover:bg-amber-50">
              1-800-222-1222
            </a>
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-[#718096]">
        <p className="font-semibold text-[#172B4D]">
          IMD Care — Problem Statement 6: AI for Smarter Healthcare
        </p>
        <p className="mt-0.5">
          AI Tech Ideathon Demonstration Prototype • Built with React, Tailwind CSS, Express, and Google Gemini API.
        </p>
      </div>
    </div>
  );
};
