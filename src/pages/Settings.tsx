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
  ExternalLink
} from "lucide-react";

interface HealthStatus {
  status: string;
  app: string;
  version: string;
  geminiKeyConfigured: boolean;
  model: string;
  uptime: number;
  timestamp: string;
}

export const Settings: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [clearSuccess, setClearSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.error("Health check error:", err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleClearLocalStorage = () => {
    if (window.confirm("Clear locally cached wellness notes, water counts, and sleep logs?")) {
      localStorage.removeItem("imd_water");
      localStorage.removeItem("imd_sleep");
      localStorage.removeItem("imd_activity");
      localStorage.removeItem("imd_note");
      setClearSuccess("Local browser storage cleared successfully.");
      setTimeout(() => setClearSuccess(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#172B4D] flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#172B4D]">Settings & Privacy Center</h1>
            <p className="text-xs text-[#718096]">
              Data management, safety protocols, and platform telemetry
            </p>
          </div>
        </div>

        <button
          onClick={checkHealth}
          disabled={loadingHealth}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? "animate-spin" : ""}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {clearSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{clearSuccess}</span>
        </div>
      )}

      {/* Backend & AI Integration Status */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#2583F5]" />
            <h2 className="text-sm font-bold text-[#172B4D]">System Status & Architecture</h2>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
            Node.js / Express
          </span>
        </div>

        {health ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Server API</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Operational
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Gemini AI Model</span>
              <span className="font-bold text-[#172B4D] mt-0.5 block truncate">
                {health.model || "gemini-3.8-flash"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">API Key Status</span>
              <span className={`font-bold mt-0.5 flex items-center gap-1 ${health.geminiKeyConfigured ? "text-emerald-600" : "text-amber-600"}`}>
                <Sparkles className="w-3.5 h-3.5" />
                {health.geminiKeyConfigured ? "Configured & Active" : "Fallback Demo Mode"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Server Uptime</span>
              <span className="font-bold text-slate-700 mt-0.5 block">
                {Math.floor(health.uptime)} seconds
              </span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-400">Loading system status...</div>
        )}
      </div>

      {/* Privacy & Ethical Safeguards */}
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

      {/* Emergency Hotlines Directory */}
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

      {/* Hackathon Project Attribution */}
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
