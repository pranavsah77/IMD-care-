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
import { useLanguage } from "../context/LanguageContext.tsx";

export const SymptomGuidance: React.FC = () => {
  const { language, t } = useLanguage();

  const scenariosByLang: Record<string, SymptomScenario[]> = {
    en: [
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
        name: "Dehydration (Mild)",
        ageGroup: "Adult (18-64)",
        mainSymptom: "Dry mouth, mild lightheadedness upon standing, dark yellow urine",
        duration: "Under 24 hours",
        severity: "Mild (manageable at home)",
        additionalDetails: "Exercised for 90 minutes in warm weather without sufficient water.",
        isEmergencyDemo: false,
      },
      {
        name: "CRITICAL: Chest Pain (Emergency Test)",
        ageGroup: "Adult (18-64)",
        mainSymptom: "Sudden crushing chest pain radiating to left arm and cold sweat",
        duration: "Under 24 hours",
        severity: "Critical / Emergency",
        additionalDetails: "Pressure feels like an elephant sitting on chest; accompanied by severe shortness of breath.",
        isEmergencyDemo: true,
      },
    ],
    hi: [
      {
        name: "तनाव सिरदर्द (हल्का)",
        ageGroup: "Adult (18-64)",
        mainSymptom: "स्क्रीन पर काम के बाद माथे में हल्का दर्द और आंखों में खिंचाव",
        duration: "1-3 days",
        severity: "Mild (manageable at home)",
        additionalDetails: "बुखार नहीं है, आंखों में धुंधलापन नहीं है।",
        isEmergencyDemo: false,
      },
      {
        name: "मौसमी एलर्जी (मध्यम)",
        ageGroup: "Adolescent (12-17)",
        mainSymptom: "छींक आना, आंखों में खुजली और पानी, हल्का जुकाम",
        duration: "4-7 days",
        severity: "Moderate (disrupting routine)",
        additionalDetails: "धूल या परागकणों के संपर्क में आने पर बढ़ता है।",
        isEmergencyDemo: false,
      },
      {
        name: "पानी की कमी / डिहाइड्रेशन (हल्का)",
        ageGroup: "Adult (18-64)",
        mainSymptom: "मुंह सूखना, उठने पर हल्का चक्कर आना, गहरा पीला मूत्र",
        duration: "Under 24 hours",
        severity: "Mild (manageable at home)",
        additionalDetails: "धूप में शारीरिक कार्य के बाद पानी कम पिया।",
        isEmergencyDemo: false,
      },
      {
        name: "आपातकालीन टेस्ट: छाती में तेज दर्द",
        ageGroup: "Adult (18-64)",
        mainSymptom: "छाती में अचानक तेज दबाव जो बाएं हाथ में फैल रहा है और सांस फूल रही है",
        duration: "Under 24 hours",
        severity: "Critical / Emergency",
        additionalDetails: "पसीना आ रहा है और अत्यधिक बेचैनी है।",
        isEmergencyDemo: true,
      },
    ],
    mr: [
      {
        name: "डोकेदुखी व ताण (सौम्य)",
        ageGroup: "Adult (18-64)",
        mainSymptom: "स्क्रीन पाहिल्यावर कपाळात होणारी मंद डोकेदुखी आणि डोळ्यांवर ताण",
        duration: "1-3 days",
        severity: "Mild (manageable at home)",
        additionalDetails: "ताप नाही, डोळ्यांना अंधारी नाही.",
        isEmergencyDemo: false,
      },
      {
        name: "हंगामी ऍलर्जी (मध्यम)",
        ageGroup: "Adolescent (12-17)",
        mainSymptom: "शिंका येणे, डोळे चुरचुरणे आणि नाक वाहणे",
        duration: "4-7 days",
        severity: "Moderate (disrupting routine)",
        additionalDetails: "धूळ किंवा परागकण संपर्कात आल्यावर त्रास वाढतो.",
        isEmergencyDemo: false,
      },
      {
        name: "पाण्याची कमतरता (सौम्य)",
        ageGroup: "Adult (18-64)",
        mainSymptom: "तोंड सुकणे, उभे राहिल्यावर हलकी गरगर आणि गडद लघवी",
        duration: "Under 24 hours",
        severity: "Mild (manageable at home)",
        additionalDetails: "उन्हात फिरल्यामुळे पुरेसे पाणी पिणे झाले नाही.",
        isEmergencyDemo: false,
      },
      {
        name: "आपत्कालीन टेस्ट: छातीत असह्य वेदना",
        ageGroup: "Adult (18-64)",
        mainSymptom: "छातीत अचानक प्रचंड दाब, डाव्या हाताकडे जाणारी कळ आणि धाप लागणे",
        duration: "Under 24 hours",
        severity: "Critical / Emergency",
        additionalDetails: "थंड घाम येत आहे आणि श्वास घेण्यास अडचण.",
        isEmergencyDemo: true,
      },
    ],
  };

  const currentScenarios = scenariosByLang[language] || scenariosByLang.en;

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
          language,
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
            <h1 className="text-xl font-bold text-[#172B4D]">{t("symptomTitle")}</h1>
          </div>
          <p className="text-xs text-[#718096]">
            {t("symptomSubtitle")}
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
            <span>{t("tryPresets")}</span>
          </div>
          <span className="text-[10px] text-[#718096] uppercase font-semibold">
            {language === "hi" ? "हिंदी परिदृश्य" : language === "mr" ? "मराठी परिस्थिती" : "Hackathon Presets"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {currentScenarios.map((sc) => (
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
          {t("symptomTitle")}
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
              {t("ageGroup")} *
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
            >
              <option value="Infant / Child (0-11)">Infant / Child (0-11) / बाळ व लहान मूल</option>
              <option value="Adolescent (12-17)">Adolescent (12-17) / किशोरवयीन</option>
              <option value="Adult (18-64)">Adult (18-64) / प्रौढ (वय १८-६४)</option>
              <option value="Older Adult (65+)">Older Adult (65+) / ज्येष्ठ नागरिक (६५+)</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              {t("duration")} *
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
            >
              <option value="Under 24 hours">Under 24 hours / २४ तासांपेक्षा कमी</option>
              <option value="1-3 days">1-3 days / १ ते ३ दिवस</option>
              <option value="4-7 days">4-7 days / ४ ते ७ दिवस</option>
              <option value="1-2 weeks">1-2 weeks / १ ते २ आठवडे</option>
              <option value="Over 2 weeks">Over 2 weeks / २ आठवड्यांपेक्षा जास्त</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              {t("severity")} *
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
            >
              <option value="Mild (manageable at home)">Mild / सौम्य (घरी सांभाळता येण्याजोगे)</option>
              <option value="Moderate (disrupting routine)">Moderate / मध्यम (रोजच्या कामात व्यत्यय)</option>
              <option value="Severe (unbearable discomfort)">Severe / तीव्र (असह्य वेदना)</option>
              <option value="Critical / Emergency">Critical / Emergency / अतिगंभीर (तातडीची मदत)</option>
            </select>
          </div>
        </div>

        {/* Main Symptom */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            {t("mainSymptom")} *
          </label>
          <input
            type="text"
            value={mainSymptom}
            onChange={(e) => setMainSymptom(e.target.value)}
            placeholder={
              language === "hi"
                ? "उदा: माथे पर हल्का दबाव और दर्द, या गले में खराश"
                : language === "mr"
                ? "उदा: कपाळात होणारी डोकेदुखी, किंवा घसा दुखणे"
                : "e.g., Dull throbbing headache on forehead, or mild sore throat when swallowing"
            }
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
          />
        </div>

        {/* Additional Details */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            {t("additionalDetails")}
          </label>
          <textarea
            rows={2}
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            placeholder={
              language === "hi"
                ? "अतिरिक्त माहिती: स्क्रीन पर काम, नींद की कमी, बुखार नहीं है..."
                : language === "mr"
                ? "अतिरिक्त माहिती: कॉम्प्युटरवर काम, झोप कमी झाली, ताप नाही..."
                : "Mention any related factors (e.g., recent exercise, lack of sleep, known allergies, no fever)"
            }
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
            <span>{t("clearForm")}</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2583F5] hover:bg-[#1b6dd4] disabled:bg-slate-300 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>{t("evaluating")}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t("getGuidance")}</span>
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
                    {language === "hi"
                      ? "उच्च प्राथमिकता चेतावनी: तत्काल चिकित्सीय देखभाल की आवश्यकता"
                      : language === "mr"
                      ? "अति तातडीची चेतावणी: त्वरित वैद्यकीय मदत आवश्यक"
                      : "High Priority Warning: Urgent Medical Attention Recommended"}
                  </h3>
                  <p className="text-xs text-rose-700">
                    Deterministic red-flag check triggered. Evaluated immediately without delay.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-semibold mb-3">
                {results.summaryNote}
              </p>

              <div className="bg-white/80 p-3.5 rounded-xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-rose-900">Emergency Actions / आपत्कालीन कृती:</p>
                  <p className="text-rose-700">
                    Call 112 / 108 (India) or 911 (US/Canada) or proceed to the nearest emergency department right away.
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href="tel:112"
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 112 (India)</span>
                  </a>
                  <a
                    href="tel:911"
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>911</span>
                  </a>
                </div>
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
                  {t("explTitle")}
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
                  {t("selfCareTitle")}
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
                  {t("doctorTitle")}
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
                  {t("warningTitle")}
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
