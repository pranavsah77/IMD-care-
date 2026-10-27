import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Stethoscope,
  Info,
  RotateCcw,
  AlertOctagon,
  PhoneCall
} from "lucide-react";
import { SymptomScenario } from "../types";

const DEMO_SCENARIOS: SymptomScenario[] = [
  {
    name: "Tension Headache (Mild)",
    ageGroup: "Adult (18-64)",
    mainSymptom: "Dull aching forehead headache and eye fatigue after screen work",
    duration: "1-3 days",
    severity: "Mild (manageable at home)",
    additionalDetails: "No fever, no vision blur, feels like a tight band around head.",
    isEmergencyDemo: false,
  },
  {
    name: "Seasonal Allergies (Moderate)",
    ageGroup: "Adolescent (12-17)",
    mainSymptom: "Sneezing, watery itchy eyes, and mild clear runny nose",
    duration: "4-7 days",
    severity: "Moderate (disrupting routine)",
    additionalDetails: "Occurs mostly outdoors during pollen season; no difficulty breathing.",
    isEmergencyDemo: false,
  },
  {
    name: "Dehydration After Exercise (Mild)",
    ageGroup: "Adult (18-64)",
    mainSymptom: "Dry mouth, mild lightheadedness upon standing, dark yellow urine",
    duration: "Under 24 hours",
    severity: "Mild (manageable at home)",
    additionalDetails: "Exercised for 90 minutes in warm weather without sufficient water.",
    isEmergencyDemo: false,
  },
  {
    name: "CRITICAL: Crushing Chest Pain (Emergency Test)",
    ageGroup: "Adult (18-64)",
    mainSymptom: "Sudden crushing chest pain radiating to left arm and cold sweat",
    duration: "Under 24 hours",
    severity: "Critical / Emergency",
    additionalDetails: "Pressure feels like an elephant sitting on chest; accompanied by severe shortness of breath.",
    isEmergencyDemo: true,
  },
];

export const SymptomGuidance: React.FC = () => {
  const [ageGroup, setAgeGroup] = useState("Adult (18-64)");
  const [mainSymptom, setMainSymptom] = useState("");
  const [duration, setDuration] = useState("1-3 days");
  const [severity, setSeverity] = useState("Mild (manageable at home)");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);

  const handleSelectScenario = (scenario: SymptomScenario) => {
    setAgeGroup(scenario.ageGroup);
    setMainSymptom(scenario.mainSymptom);
    setDuration(scenario.duration);
    setSeverity(scenario.severity);
    setAdditionalDetails(scenario.additionalDetails);
    setValidationError(null);
    setResults(null);
  };

  const handleClearForm = () => {
    setMainSymptom("");
    setAdditionalDetails("");
    setDuration("1-3 days");
    setSeverity("Mild (manageable at home)");
    setValidationError(null);
    setResults(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainSymptom.trim()) {
      setValidationError("Please describe your main symptom before requesting guidance.");
      return;
    }

    setValidationError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/symptom-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageGroup,
          mainSymptom: mainSymptom.trim(),
          duration,
          severity,
          additionalDetails: additionalDetails.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze symptoms.");
      }
      setResults(data);
    } catch (err: any) {
      console.error("Symptom guidance error:", err);
      setValidationError(err.message || "Unable to reach symptom guidance service. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="text-xl font-bold text-[#172B4D]">Smart Symptom Guidance</h1>
          </div>
          <p className="text-xs text-[#718096]">
            Structured educational health insights and red-flag evaluations. This tool does not provide diagnoses.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600">
          <ShieldAlert className="w-4 h-4 text-[#2583F5] flex-shrink-0" />
          <span>Deterministic safety safeguards active</span>
        </div>
      </div>

      {/* Synthetic Scenarios Picker */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EDF5] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#172B4D]">
            <Sparkles className="w-3.5 h-3.5 text-[#2583F5]" />
            <span>Try Synthetic Demo Scenarios (One-Click):</span>
          </div>
          <span className="text-[10px] text-[#718096] uppercase font-semibold">Hackathon Presets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {DEMO_SCENARIOS.map((sc) => (
            <button
              key={sc.name}
              onClick={() => handleSelectScenario(sc)}
              className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                sc.isEmergencyDemo
                  ? "bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 text-rose-900"
                  : "bg-slate-50 hover:bg-blue-50/60 border-slate-200 hover:border-blue-200 text-[#172B4D]"
              }`}
            >
              <div className="font-bold mb-0.5 flex items-center gap-1">
                {sc.isEmergencyDemo && <AlertTriangle className="w-3 h-3 text-rose-600 flex-shrink-0" />}
                <span>{sc.name}</span>
              </div>
              <p className="text-[11px] text-[#718096] line-clamp-2">{sc.mainSymptom}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#172B4D] border-b border-slate-100 pb-2">
          Symptom Intake Assessment
        </h2>

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Age Group */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Age Group *
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
            >
              <option value="Infant / Child (0-11)">Infant / Child (0-11)</option>
              <option value="Adolescent (12-17)">Adolescent (12-17)</option>
              <option value="Adult (18-64)">Adult (18-64)</option>
              <option value="Older Adult (65+)">Older Adult (65+)</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Duration of Symptoms *
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
            >
              <option value="Under 24 hours">Under 24 hours</option>
              <option value="1-3 days">1-3 days</option>
              <option value="4-7 days">4-7 days</option>
              <option value="1-2 weeks">1-2 weeks</option>
              <option value="Over 2 weeks">Over 2 weeks</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Perceived Severity *
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
            >
              <option value="Mild (manageable at home)">Mild (manageable at home)</option>
              <option value="Moderate (disrupting routine)">Moderate (disrupting routine)</option>
              <option value="Severe (unbearable discomfort)">Severe (unbearable discomfort)</option>
              <option value="Critical / Emergency">Critical / Emergency</option>
            </select>
          </div>
        </div>

        {/* Main Symptom */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Primary Symptom / Description *
          </label>
          <input
            type="text"
            value={mainSymptom}
            onChange={(e) => setMainSymptom(e.target.value)}
            placeholder="e.g., Dull throbbing headache on forehead, or mild sore throat when swallowing"
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
          />
        </div>

        {/* Additional Details */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Additional Details & Context (Optional)
          </label>
          <textarea
            rows={2}
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            placeholder="Mention any related factors (e.g., recent exercise, lack of sleep, known allergies, no fever)"
            className="w-full text-xs sm:text-sm px-3.5 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleClearForm}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2583F5] hover:bg-[#1b6dd4] disabled:bg-slate-300 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Evaluating Symptoms...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Get Guidance</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Structured Guidance Results */}
      {results && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Emergency Alert Header if Red Flag */}
          {results.isEmergency ? (
            <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-6 text-rose-950 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                  <AlertOctagon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-900">
                    High Priority Warning: Urgent Medical Attention Recommended
                  </h3>
                  <p className="text-xs text-rose-700">
                    Deterministic red-flag check triggered. Guidance evaluated immediately without delay.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-semibold mb-3">
                {results.summaryNote}
              </p>

              <div className="bg-white/80 p-3.5 rounded-xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-rose-900">Emergency Actions:</p>
                  <p className="text-rose-700">Call 911 (US/Canada) or 112 (EU) or proceed to the nearest emergency department.</p>
                </div>
                <a
                  href="tel:911"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-2 flex-shrink-0 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 911 Now</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold">Preliminary Guidance Generated</h3>
                <p className="text-xs text-emerald-800">{results.summaryNote}</p>
              </div>
            </div>
          )}

          {/* 4 Required Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 1: Possible General Explanations */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5EDF5] shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <HelpCircle className="w-4 h-4 text-[#2583F5]" />
                <h4 className="text-xs sm:text-sm font-bold text-[#172B4D]">
                  1. Possible General Explanations
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-[#172B4D]">
                {results.explanations.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 2: General Self-Care */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5EDF5] shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs sm:text-sm font-bold text-[#172B4D]">
                  2. General Self-Care Information
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-[#172B4D]">
                {results.selfCare.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 3: When to Contact Doctor */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5EDF5] shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs sm:text-sm font-bold text-[#172B4D]">
                  3. When to Contact a Healthcare Professional
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-[#172B4D]">
                {results.whenToContactDoctor.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4: Warning Signs */}
            <div className="bg-white rounded-2xl p-5 border border-rose-200 bg-rose-50/20 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-rose-100">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs sm:text-sm font-bold text-rose-900">
                  4. Warning Signs Requiring Urgent / Emergency Care
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-rose-900">
                {results.warningSigns.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E5EDF5] flex items-center gap-2 text-xs text-[#718096]">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <p className="leading-snug">{results.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};
