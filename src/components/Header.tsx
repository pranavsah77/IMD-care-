import React from "react";
import { Menu, Bell, Sparkles, AlertTriangle, Shield } from "lucide-react";

interface HeaderProps {
  onToggleMobileNav: () => void;
  onOpenEmergency: () => void;
  apiConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileNav,
  onOpenEmergency,
  apiConnected,
}) => {
  return (
    <header className="h-16 bg-white border-b border-[#E5EDF5] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 text-[#718096] hover:text-[#172B4D] hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#718096] bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-[#2583F5]" />
          <span>Problem Statement 6: AI for Smarter Healthcare</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System & AI Status indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            apiConnected
              ? "bg-teal-50 border-teal-200 text-teal-700"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
          title={
            apiConnected
              ? "Backend and Gemini AI connected"
              : "Backend connected (demo mode active if AI key missing)"
          }
        >
          <Sparkles className="w-3 h-3 text-current" />
          <span className="hidden md:inline">
            {apiConnected ? "Gemini 3.8 Flash Ready" : "Demo Mode"}
          </span>
          <span className="md:hidden">AI</span>
          <span
            className={`w-2 h-2 rounded-full ${
              apiConnected ? "bg-teal-500 animate-pulse" : "bg-amber-500"
            }`}
          />
        </div>

        {/* Emergency Trigger Button */}
        <button
          onClick={onOpenEmergency}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Emergency SOS</span>
          <span className="sm:hidden">SOS</span>
        </button>

        {/* User / Ideathon Demo Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E5EDF5]">
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-[#2583F5]">
            IC
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-[#172B4D] leading-tight">Demo Guest</p>
            <p className="text-[10px] text-[#718096]">Ideathon Reviewer</p>
          </div>
        </div>
      </div>
    </header>
  );
};
