import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquareHeart,
  Activity,
  FileSpreadsheet,
  HeartPulse,
  ArrowRight,
  Droplets,
  Moon,
  Footprints,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  Plus
} from "lucide-react";
import { Reminder } from "../types";
import { useLanguage } from "../context/LanguageContext.tsx";
import { useAuth } from "../context/AuthContext.tsx";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, openSignInModal } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);

  // Wellness summary state (stored in local storage for responsiveness)
  const [waterMl, setWaterMl] = useState(() => {
    const saved = localStorage.getItem("imd_water");
    return saved ? parseInt(saved, 10) : 1500;
  });

  const [sleepHours, setSleepHours] = useState(() => {
    const saved = localStorage.getItem("imd_sleep");
    return saved ? parseFloat(saved) : 7.2;
  });

  const [activityMinutes, setActivityMinutes] = useState(() => {
    const saved = localStorage.getItem("imd_activity");
    return saved ? parseInt(saved, 10) : 35;
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoadingReminders(true);
      const res = await fetch("/api/reminders");
      if (res.ok) {
        const data = await res.json();
        setReminders(data.slice(0, 3)); // show top 3 upcoming
      }
    } catch (err) {
      console.warn("Failed to fetch reminders:", err);
    } finally {
      setLoadingReminders(false);
    }
  };

  const handleToggleReminder = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      if (res.ok) {
        setReminders((prev) =>
          prev.map((r) => (r.id === id ? { ...r, completed: !currentStatus } : r))
        );
      }
    } catch (err) {
      console.error("Failed to toggle reminder:", err);
    }
  };

  const quickAddWater = (amount: number) => {
    const updated = Math.min(waterMl + amount, 4000);
    setWaterMl(updated);
    localStorage.setItem("imd_water", updated.toString());
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 18) return t("goodAfternoon");
    return t("goodEvening");
  };

  const featureCards = [
    {
      title: t("card1Title"),
      description: t("card1Desc"),
      icon: MessageSquareHeart,
      to: "/assistant",
      accent: "text-[#2583F5] bg-blue-50 border-blue-100",
      btnText: t("card1Btn"),
    },
    {
      title: t("card2Title"),
      description: t("card2Desc"),
      icon: Activity,
      to: "/symptoms",
      accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
      btnText: t("card2Btn"),
    },
    {
      title: t("card3Title"),
      description: t("card3Desc"),
      icon: FileSpreadsheet,
      to: "/reports",
      accent: "text-indigo-600 bg-indigo-50 border-indigo-100",
      btnText: t("card3Btn"),
    },
    {
      title: t("card4Title"),
      description: t("card4Desc"),
      icon: HeartPulse,
      to: "/preventive",
      accent: "text-[#16B8A6] bg-teal-50 border-teal-100",
      btnText: t("card4Btn"),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Greeting Banner */}
      <div className="bg-gradient-to-r from-white via-white to-blue-50/50 rounded-2xl p-6 sm:p-8 border border-[#E5EDF5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {t("platformReady")}
            </span>
            {user && !user.isGuest && (
              <span className="text-xs font-bold text-[#2583F5] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {user.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
            {getGreeting()} {user && !user.isGuest ? `, ${user.name}` : ""}
          </h1>
          <p className="text-[#718096] text-sm sm:text-base mt-1 max-w-xl">
            {t("howCanWeHelp")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user.isGuest && (
            <button
              onClick={openSignInModal}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {t("signIn")}
            </button>
          )}
          <button
            onClick={() => navigate("/assistant")}
            className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#2583F5] hover:bg-[#1b6dd4] text-white font-semibold text-sm shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5 self-start md:self-auto cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t("askAiAssistant")}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Main 4 Feature Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#718096]">
            Core Health Modules
          </h2>
          <span className="text-xs text-[#718096]">Select a module to begin</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                onClick={() => navigate(card.to)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(card.to);
                  }
                }}
                tabIndex={0}
                role="button"
                className="group bg-white rounded-2xl p-5 border border-[#E5EDF5] hover:border-[#2583F5]/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between focus:outline-hidden focus:ring-2 focus:ring-[#2583F5] focus:ring-offset-2"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${card.accent}`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#2583F5] group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-base font-bold text-[#172B4D] group-hover:text-[#2583F5] transition-colors mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#718096] leading-relaxed mb-4">
                    {card.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#2583F5]">
                  <span>{card.btnText}</span>
                  <span className="text-[11px] font-normal text-slate-400">Tap to open</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Upcoming Reminders & Compact Wellness Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Reminders */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2583F5]" />
                <h3 className="text-sm font-bold text-[#172B4D]">{t("upcomingReminders")}</h3>
              </div>
              <button
                onClick={() => navigate("/preventive")}
                className="text-xs font-semibold text-[#2583F5] hover:underline cursor-pointer"
              >
                {t("manageAll")}
              </button>
            </div>

            {loadingReminders ? (
              <div className="space-y-2 py-4">
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#718096] bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p>{t("noRemindersToday")}</p>
                <button
                  onClick={() => navigate("/preventive")}
                  className="mt-2 text-[#2583F5] font-semibold hover:underline cursor-pointer"
                >
                  + {t("addReminder")}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`flex items-start justify-between p-3 rounded-xl border transition-colors ${
                      rem.completed
                        ? "bg-slate-50/70 border-slate-200 text-slate-400"
                        : "bg-white border-[#E5EDF5] hover:border-blue-200 text-[#172B4D]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleReminder(rem.id, rem.completed)}
                        className="mt-0.5 text-slate-400 hover:text-[#2583F5] transition-colors cursor-pointer"
                        title={rem.completed ? "Mark as active" : "Mark as completed"}
                      >
                        {rem.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 hover:text-[#2583F5]" />
                        )}
                      </button>
                      <div>
                        <p className={`text-xs font-semibold ${rem.completed ? "line-through text-slate-400" : "text-[#172B4D]"}`}>
                          {rem.title}
                        </p>
                        {rem.categoryNote && (
                          <p className="text-[11px] text-[#718096] line-clamp-1">{rem.categoryNote}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {rem.dateTime ? new Date(rem.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Today"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#718096]">
            <span>Click any item to toggle completion status.</span>
            <button
              onClick={() => navigate("/preventive")}
              className="text-[#2583F5] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("addReminder")}</span>
            </button>
          </div>
        </div>

        {/* Right: Compact Wellness Summary */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#16B8A6]" />
                <h3 className="text-sm font-bold text-[#172B4D]">{t("wellnessSummary")}</h3>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#2583F5] border border-blue-100">
                {t("syntheticDemo")}
              </span>
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              {/* Water */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-medium text-[#172B4D]">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    {t("hydration")}
                  </span>
                  <span className="text-[#718096] font-semibold">
                    {waterMl} / 2500 ml
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((waterMl / 2500) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex gap-2 mt-1.5">
                  <button
                    onClick={() => quickAddWater(250)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 cursor-pointer"
                  >
                    +250ml
                  </button>
                  <button
                    onClick={() => quickAddWater(500)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 cursor-pointer"
                  >
                    +500ml
                  </button>
                </div>
              </div>

              {/* Sleep */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-medium text-[#172B4D]">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    {t("sleepDuration")}
                  </span>
                  <span className="text-[#718096] font-semibold">
                    {sleepHours} hrs (Goal: 8.0)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((sleepHours / 8) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Activity */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-medium text-[#172B4D]">
                    <Footprints className="w-3.5 h-3.5 text-emerald-500" />
                    {t("dailyMovement")}
                  </span>
                  <span className="text-[#718096] font-semibold">
                    {activityMinutes} / 45 mins
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((activityMinutes / 45) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[#718096]">{t("tagline")}</span>
            <button
              onClick={() => navigate("/preventive")}
              className="text-[#16B8A6] font-semibold hover:underline cursor-pointer"
            >
              {t("openTracker")} &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
