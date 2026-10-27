import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar.tsx";
import { Header } from "./components/Header.tsx";
import { DisclaimerBanner } from "./components/DisclaimerBanner.tsx";
import { EmergencyModal } from "./components/EmergencyModal.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";
import { HealthAssistant } from "./pages/HealthAssistant.tsx";
import { SymptomGuidance } from "./pages/SymptomGuidance.tsx";
import { MedicalReports } from "./pages/MedicalReports.tsx";
import { PreventiveHealthcare } from "./pages/PreventiveHealthcare.tsx";
import { Settings } from "./pages/Settings.tsx";
import { X } from "lucide-react";

export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);

  useEffect(() => {
    // Check backend health on initial load
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setApiConnected(Boolean(data.geminiKeyConfigured));
      })
      .catch((err) => {
        console.warn("Backend health check failed:", err);
        setApiConnected(false);
      });
  }, []);

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#F6FAFE] overflow-hidden text-[#172B4D]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full flex-shrink-0">
          <Sidebar onOpenEmergency={() => setEmergencyOpen(true)} />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative z-50 w-72 bg-white h-full shadow-2xl flex flex-col">
              <button
                onClick={() => setMobileNavOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
              <Sidebar
                onOpenEmergency={() => {
                  setMobileNavOpen(false);
                  setEmergencyOpen(true);
                }}
                onCloseMobile={() => setMobileNavOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Header */}
          <Header
            onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
            onOpenEmergency={() => setEmergencyOpen(true)}
            apiConnected={apiConnected}
          />

          {/* Persistent Healthcare Disclaimer Banner */}
          <DisclaimerBanner />

          {/* Page Route Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assistant" element={<HealthAssistant />} />
              <Route path="/symptoms" element={<SymptomGuidance />} />
              <Route path="/reports" element={<MedicalReports />} />
              <Route path="/preventive" element={<PreventiveHealthcare />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global Emergency Modal */}
        <EmergencyModal
          isOpen={emergencyOpen}
          onClose={() => setEmergencyOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}
