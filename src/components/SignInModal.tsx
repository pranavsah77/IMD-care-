import React, { useState } from "react";
import { X, Lock, Mail, User, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth, DEMO_PROFILES, UserProfile } from "../context/AuthContext.tsx";
import { useLanguage } from "../context/LanguageContext.tsx";

export const SignInModal: React.FC = () => {
  const { isModalOpen, closeSignInModal, loginWithEmail, loginWithGoogle, switchProfile, user } = useAuth();
  const { t, setLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState<"email" | "quick">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isModalOpen) return null;

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    setError(null);
    loginWithEmail(email, name);
  };

  const handleSelectProfile = (p: UserProfile) => {
    switchProfile(p);
    if (p.preferredLanguage) {
      setLanguage(p.preferredLanguage);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5EDF5] relative">
        <button
          onClick={closeSignInModal}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2583F5] to-[#16B8A6] flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#172B4D]">{t("welcomeBack")}</h2>
            <p className="text-xs text-[#718096]">{t("loginSubtitle")}</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "email" ? "bg-white text-[#2583F5] shadow-xs" : "text-slate-600"
            }`}
          >
            Email / Credentials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quick")}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "quick" ? "bg-white text-[#2583F5] shadow-xs" : "text-slate-600"
            }`}
          >
            Quick Profile Switch
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {activeTab === "email" ? (
          <div className="space-y-4">
            {/* Google 1-Click Demo Login */}
            <button
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700 shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t("continueWithGoogle")}</span>
            </button>

            <div className="flex items-center gap-3 my-2 text-slate-400 text-[11px]">
              <div className="flex-1 border-t border-slate-200"></div>
              <span>OR EMAIL SIGN IN</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmitEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Patil or Priya Sharma"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  {t("emailLabel")} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  {t("passwordLabel")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Any password for demo)"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#2583F5] hover:bg-[#1b6dd4] text-white font-bold text-xs shadow-md shadow-blue-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t("signIn")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#718096] mb-2">
              Select a pre-configured persona for instant demo testing:
            </p>

            {DEMO_PROFILES.map((p) => {
              const isActive = user.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProfile(p)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-50/70 border-[#2583F5] text-[#172B4D]"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-teal-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {p.avatarInitials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#172B4D]">{p.name}</p>
                      <p className="text-[11px] text-[#718096] capitalize">
                        {p.role} • {p.preferredLanguage === "hi" ? "हिंदी (Hindi)" : p.preferredLanguage === "mr" ? "मराठी (Marathi)" : "English"}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2583F5]" />
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Select</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#718096]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Hackathon Privacy: Safe Local Session
          </span>
          <button
            onClick={() => {
              switchProfile(DEMO_PROFILES[0]);
              closeSignInModal();
            }}
            className="text-[#2583F5] font-semibold hover:underline cursor-pointer"
          >
            {t("continueAsGuest")}
          </button>
        </div>
      </div>
    </div>
  );
};
