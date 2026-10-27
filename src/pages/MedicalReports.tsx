import React, { useState } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  HelpCircle,
  Stethoscope,
  Filter,
  FileCode2
} from "lucide-react";
import { ReportAnalysis, LabTestItem } from "../types";

const SYNTHETIC_SAMPLE_REPORT = `METROPOLITAN CLINICAL LABORATORY
PATIENT: DEMO_GUEST_0492 (SYNTHETIC RECORD FOR IDEATHON DEMONSTRATION)
ORDERING PHYSICIAN: Dr. S. Patel, MD
SPECIMEN: Serum / Whole Blood
COLLECTION DATE: Oct 2026

TEST NAME                      RESULT     UNITS       REFERENCE INTERVAL   FLAG
---------------------------------------------------------------------------------
Fasting Blood Glucose          104        mg/dL       70 - 99              HIGH
Total Cholesterol              218        mg/dL       125 - 200            HIGH
HDL Cholesterol (Good)         54         mg/dL       > 40                 NORMAL
LDL Cholesterol (Calc)         138        mg/dL       < 100                HIGH
Triglycerides                  130        mg/dL       < 150                NORMAL
Blood Urea Nitrogen (BUN)      15         mg/dL       7 - 20               NORMAL
Serum Creatinine               0.90       mg/dL       0.70 - 1.30          NORMAL
eGFR (CKD-EPI)                 > 90       mL/min      > 60                 NORMAL
Sodium                         140        mmol/L      136 - 145            NORMAL
Potassium                      4.2        mmol/L      3.5 - 5.1            NORMAL
Alanine Aminotransferase (ALT) 24         U/L         7 - 56               NORMAL
Aspartate Aminotrans (AST)     21         U/L         10 - 40              NORMAL
Total Protein                  7.1        g/dL        6.0 - 8.3            NORMAL

NOTES: Fasting specimen. Mild borderline elevations noted in fasting blood glucose and calculated LDL cholesterol. Correlate clinically with dietary history and cardiovascular risk profile.`;

export const MedicalReports: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [reportText, setReportText] = useState("");
  const [isSampleLoaded, setIsSampleLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "flagged" | "normal">("all");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds maximum allowable size of 10MB.");
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf", "text/plain"];
    if (!validTypes.includes(file.type)) {
      setError("Supported file formats are PNG, JPEG, WEBP, PDF, and TXT.");
      return;
    }

    setSelectedFile(file);
    setIsSampleLoaded(false);

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReportText((e.target?.result as string) || "");
        setFileBase64(null);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = (e.target?.result as string) || "";
        setFileBase64(base64Data);
        setReportText("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLoadSample = () => {
    setSelectedFile(null);
    setFileBase64(null);
    setReportText(SYNTHETIC_SAMPLE_REPORT);
    setIsSampleLoaded(true);
    setError(null);
    setAnalysis(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileBase64(null);
    setReportText("");
    setIsSampleLoaded(false);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!reportText && !fileBase64) {
      setError("Please upload a medical report file or load the sample report first.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        isSample: isSampleLoaded,
      };

      if (fileBase64 && selectedFile) {
        payload.fileBase64 = fileBase64;
        payload.mimeType = selectedFile.type;
        payload.fileName = selectedFile.name;
      } else {
        payload.reportText = reportText;
        payload.fileName = isSampleLoaded ? "Synthetic_CMP_Lipid_Panel.txt" : "Manual_Entry.txt";
      }

      const res = await fetch("/api/report-simplifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to simplify laboratory report.");
      }

      setAnalysis(data);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "An error occurred while analyzing the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = analysis?.tests.filter((t) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "flagged") return t.status === "high" || t.status === "low" || t.status === "abnormal";
    if (filterStatus === "normal") return t.status === "normal";
    return true;
  }) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="text-xl font-bold text-[#172B4D]">Medical Report Simplifier</h1>
          </div>
          <p className="text-xs text-[#718096]">
            Understand laboratory results, reference ranges, and test definitions in plain English without confusion.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors self-start md:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Try Sample Report (Synthetic CMP)</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#172B4D] border-b border-slate-100 pb-2">
          Upload or Inspect Laboratory Document
        </h2>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and Drop Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#E5EDF5] hover:border-[#2583F5]/60 bg-[#F6FAFE]/50 rounded-2xl p-6 sm:p-8 text-center transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2583F5] mx-auto flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6 stroke-[2]" />
          </div>

          <p className="text-sm font-bold text-[#172B4D] mb-1">
            Drag & drop your lab report here, or browse files
          </p>
          <p className="text-xs text-[#718096] mb-4">
            Supports PNG, JPEG, WEBP, PDF, and TXT files up to 10MB
          </p>

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-xs transition-colors">
            <FileText className="w-4 h-4 text-[#2583F5]" />
            <span>Browse Local File</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Selected File or Sample Report Badge */}
        {(selectedFile || isSampleLoaded) && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2583F5] flex items-center justify-center flex-shrink-0">
                <FileCode2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#172B4D]">
                  {selectedFile ? selectedFile.name : "Synthetic_CMP_Lipid_Panel.txt (Sample)"}
                </p>
                <p className="text-[11px] text-[#718096]">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for analysis`
                    : "Synthetic hackathon demonstration data loaded"}
                </p>
              </div>
            </div>

            <button
              onClick={handleRemoveFile}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Text preview of sample report */}
        {isSampleLoaded && reportText && (
          <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40 border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">// PREVIEW OF LOADED DEMONSTRATION RECORD:</div>
            <pre className="whitespace-pre">{reportText}</pre>
          </div>
        )}

        {/* Analyze Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleAnalyze}
            disabled={loading || (!selectedFile && !reportText && !fileBase64)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2583F5] hover:bg-[#1b6dd4] disabled:bg-slate-200 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Simplifying Lab Report with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Analysis Results (7 Required Sections) */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Section 1: Summary of the report */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2583F5]" />
                <h3 className="text-base font-bold text-[#172B4D]">
                  1. Report Summary
                </h3>
              </div>
              {analysis.isSyntheticSample && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#2583F5] border border-blue-100">
                  Synthetic Sample
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#172B4D] leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Sections 2, 3, 4, 5: Tests Table / Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#172B4D]">
                  2-5. Measured Tests, Values & Reference Intervals
                </h3>
                <p className="text-xs text-[#718096]">
                  What each test measures, reported units, reference ranges, and explicit flags
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    filterStatus === "all" ? "bg-white text-[#2583F5] shadow-xs font-bold" : "text-slate-600"
                  }`}
                >
                  All ({analysis.tests.length})
                </button>
                <button
                  onClick={() => setFilterStatus("flagged")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    filterStatus === "flagged" ? "bg-white text-rose-600 shadow-xs font-bold" : "text-slate-600"
                  }`}
                >
                  Flagged (High/Low)
                </button>
                <button
                  onClick={() => setFilterStatus("normal")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    filterStatus === "normal" ? "bg-white text-emerald-600 shadow-xs font-bold" : "text-slate-600"
                  }`}
                >
                  Normal
                </button>
              </div>
            </div>

            {/* Test Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTests.map((test, idx) => {
                const isHigh = test.status === "high";
                const isLow = test.status === "low";
                const isNormal = test.status === "normal";

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isHigh || isLow
                        ? "bg-amber-50/40 border-amber-200"
                        : "bg-slate-50/60 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#172B4D]">
                          {test.testName}
                        </h4>
                        <p className="text-[11px] text-[#718096]">
                          {test.whatItMeasures}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md flex-shrink-0 border ${
                          isHigh
                            ? "bg-rose-100 text-rose-700 border-rose-200"
                            : isLow
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {test.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white/80 p-2.5 rounded-lg border border-slate-100 mb-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Reported Value</span>
                        <span className="font-bold text-[#172B4D]">
                          {test.measuredValue} {test.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Printed Ref Range</span>
                        <span className="font-semibold text-slate-600">
                          {test.referenceRange || "None specified"}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      {test.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6: General Explanations of Findings */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-[#172B4D]">
                6. General Explanations of Findings
              </h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#172B4D]">
              {analysis.generalExplanations.map((exp, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{exp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 7: Questions to Ask Your Doctor */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-[#172B4D]">
                7. Questions to Ask a Healthcare Professional
              </h3>
            </div>
            <p className="text-xs text-[#718096] mb-3">
              Take these suggested questions to your next appointment to guide your conversation:
            </p>
            <div className="space-y-2">
              {analysis.questionsForDoctor.map((q, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs sm:text-sm text-indigo-950">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unreadable notes if any */}
          {analysis.unreadableNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="font-semibold">Legibility / Processing Note:</strong>
                <p>{analysis.unreadableNotes}</p>
              </div>
            </div>
          )}

          {/* Safeguard & Disclaimer Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-[#718096] flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="leading-snug">{analysis.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};
