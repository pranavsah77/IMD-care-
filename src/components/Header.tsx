import React from "react";
import { Menu, Sparkles, AlertTriangle, Shield, Globe, LogIn, UserCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import { Language } from "../i18n/translations.ts";

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
  const { language, setLanguage, t } = useLanguage();
  const { user, openSignInModal } = useAuth();

  const languages: { code: Language; label: string; short: string }[] = [
    { code: "en", label: "English", short: "EN" },
    { code: "hi", label: "हिंदी", short: "HI" },
    { code: "mr", label: "मराठी", short: "MR" },
  ];

  return (
    <header className="h-16 bg-white border-b border-[#E5EDF5] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 text-[#718096] hover:text-[#172B4D] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#718096] bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-[#2583F5]" />
          <span>Problem Statement 6: AI for Smarter Healthcare</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Multilingual Selector */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <div className="pl-1.5 pr-1 text-slate-400">
            <Globe className="w-3.5 h-3.5" />
          </div>
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                language === l.code
                  ? "bg-white text-[#2583F5] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title={l.label}
            >
              <span className="hidden sm:inline">{l.label}</span>
              <span className="sm:hidden">{l.short}</span>
            </button>
          ))}
        </div>

        {/* System & AI Status indicator */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            apiConnected
              ? "bg-teal-50 border-teal-200 text-teal-700"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
          title={
            apiConnected
              ? "Backend and Gemini AI connected"
              : "Backend connected (educational fallback active)"
          }
        >
          <Sparkles className="w-3 h-3 text-current" />
          <span>{apiConnected ? "Gemini Ready" : "Educational Demo"}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              apiConnected ? "bg-teal-500 animate-pulse" : "bg-amber-500"
            }`}
          />
        </div>

        {/* Emergency Trigger Button */}
        <button
          onClick={onOpenEmergency}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
          <span className="hidden sm:inline">{t("emergencySos")}</span>
          <span className="sm:hidden">SOS</span>
        </button>

        {/* User Profile / Sign In Button */}
        <div className="pl-1 sm:pl-2 border-l border-[#E5EDF5]">
          {user.isGuest ? (
            <button
              onClick={openSignInModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2583F5] border border-blue-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t("signIn")}</span>
            </button>
          ) : (
            <button
              onClick={openSignInModal}
              className="flex items-center gap-2 p-1 sm:px-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left"
              title="Click to view profile or switch account"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {user.avatarInitials}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-[#172B4D] leading-tight flex items-center gap-1">
                  <span>{user.name}</span>
                  <UserCheck className="w-3 h-3 text-teal-600" />
                </p>
                <p className="text-[10px] text-[#718096] capitalize">{user.role}</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
