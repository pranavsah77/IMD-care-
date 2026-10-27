import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Droplets,
  Moon,
  Footprints,
  Pill,
  Calendar,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Clock,
  Bell,
  X,
  FileText,
  AlertCircle
} from "lucide-react";
import { Reminder, WellnessTip } from "../types";

export const PreventiveHealthcare: React.FC = () => {
  // 1. Wellness Tracker state (saved in localStorage)
  const [waterMl, setWaterMl] = useState(() => {
    return parseInt(localStorage.getItem("imd_water") || "1500", 10);
  });
  const [sleepHours, setSleepHours] = useState(() => {
    return parseFloat(localStorage.getItem("imd_sleep") || "7.5");
  });
  const [activityMins, setActivityMins] = useState(() => {
    return parseInt(localStorage.getItem("imd_activity") || "30", 10);
  });
  const [wellnessNote, setWellnessNote] = useState(() => {
    return localStorage.getItem("imd_note") || "Felt energetic after light morning walk.";
  });

  // 2. Reminders state (backed by Express API)
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);

  // Modal state for Add/Edit reminder
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<"medication" | "appointment" | "wellness" | "general">("medication");
  const [modalNote, setModalNote] = useState("");
  const [modalDateTime, setModalDateTime] = useState("");
  const [modalRecurrence, setModalRecurrence] = useState<"none" | "daily" | "weekly" | "monthly">("daily");
  const [modalError, setModalError] = useState<string | null>(null);

  // 3. AI Wellness Tips
  const [tipsCategory, setTipsCategory] = useState("general");
  const [wellnessTips, setWellnessTips] = useState<WellnessTip[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);

  // 4. Browser Notification permission state
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    fetchReminders();
    fetchWellnessTips("general");
  }, []);

  const fetchReminders = async () => {
    try {
      setLoadingReminders(true);
      const res = await fetch("/api/reminders");
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (err) {
      console.error("Failed to load reminders:", err);
    } finally {
      setLoadingReminders(false);
    }
  };

  const fetchWellnessTips = async (category: string) => {
    setLoadingTips(true);
    try {
      const res = await fetch("/api/wellness-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      if (res.ok) {
        const data = await res.json();
        setWellnessTips(data.tips || []);
      }
    } catch (err) {
      console.error("Failed to load tips:", err);
    } finally {
      setLoadingTips(false);
    }
  };

  const handleUpdateWater = (val: number) => {
    const newVal = Math.max(0, Math.min(val, 5000));
    setWaterMl(newVal);
    localStorage.setItem("imd_water", newVal.toString());
  };

  const handleUpdateSleep = (val: number) => {
    const newVal = Math.max(0, Math.min(val, 16));
    setSleepHours(newVal);
    localStorage.setItem("imd_sleep", newVal.toString());
  };

  const handleUpdateActivity = (val: number) => {
    const newVal = Math.max(0, Math.min(val, 300));
    setActivityMins(newVal);
    localStorage.setItem("imd_activity", newVal.toString());
  };

  const handleSaveNote = (text: string) => {
    setWellnessNote(text);
    localStorage.setItem("imd_note", text);
  };

  // Open modal to create
  const handleOpenCreateModal = (defaultType: "medication" | "appointment" = "medication") => {
    setEditingReminder(null);
    setModalTitle("");
    setModalType(defaultType);
    setModalNote("");
    // default to tomorrow at 9 AM
    const tomorrow = new Date(Date.now() + 86400000);
    tomorrow.setHours(9, 0, 0, 0);
    setModalDateTime(tomorrow.toISOString().slice(0, 16));
    setModalRecurrence("daily");
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open modal to edit
  const handleOpenEditModal = (r: Reminder) => {
    setEditingReminder(r);
    setModalTitle(r.title);
    setModalType(r.type);
    setModalNote(r.categoryNote || "");
    setModalDateTime(r.dateTime);
    setModalRecurrence(r.recurrence || "none");
    setModalError(null);
    setIsModalOpen(true);
  };

  // Save Reminder (Create or Update)
  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) {
      setModalError("Please provide a title for the reminder.");
      return;
    }
    if (!modalDateTime) {
      setModalError("Please choose a date and time.");
      return;
    }

    try {
      if (editingReminder) {
        // PUT update
        const res = await fetch(`/api/reminders/${editingReminder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: modalTitle.trim(),
            type: modalType,
            categoryNote: modalNote.trim(),
            dateTime: modalDateTime,
            recurrence: modalRecurrence,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setIsModalOpen(false);
        }
      } else {
        // POST create
        const res = await fetch("/api/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: modalTitle.trim(),
            type: modalType,
            categoryNote: modalNote.trim(),
            dateTime: modalDateTime,
            recurrence: modalRecurrence,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          setReminders((prev) => [created, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Save reminder error:", err);
      setModalError("Failed to save reminder to server.");
    }
  };

  // Toggle complete
  const handleToggleComplete = async (r: Reminder) => {
    try {
      const res = await fetch(`/api/reminders/${r.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !r.completed }),
      });
      if (res.ok) {
        setReminders((prev) =>
          prev.map((item) => (item.id === r.id ? { ...item, completed: !r.completed } : item))
        );
      }
    } catch (err) {
      console.error("Toggle complete error:", err);
    }
  };

  // Delete reminder
  const handleDeleteReminder = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Delete reminder error:", err);
    }
  };

  // Request browser notification
  const handleRequestNotification = async () => {
    if (typeof Notification === "undefined") {
      alert("Browser notifications are not supported on this device/browser.");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationStatus(perm);
    if (perm === "granted") {
      new Notification("IMD Care Health Reminders Active", {
        body: "You will receive reminders when this app is open in your browser tab.",
      });
    }
  };

  // Filter reminders by medication vs appointment
  const medicationReminders = reminders.filter((r) => r.type === "medication");
  const appointmentReminders = reminders.filter((r) => r.type === "appointment");
  const otherReminders = reminders.filter((r) => r.type !== "medication" && r.type !== "appointment");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#16B8A6] flex items-center justify-center">
              <HeartPulse className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="text-xl font-bold text-[#172B4D]">Preventive Healthcare</h1>
          </div>
          <p className="text-xs text-[#718096]">
            Proactive wellness habits, medication schedules, and clinical visit reminders in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notificationStatus !== "granted" ? (
            <button
              onClick={handleRequestNotification}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#2583F5]" />
              <span>Enable Browser Alerts</span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Bell className="w-3.5 h-3.5 text-teal-600" />
              <span>Alerts Enabled</span>
            </span>
          )}
        </div>
      </div>

      {/* Module 1: Wellness Tracker */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#16B8A6]" />
            <h2 className="text-base font-bold text-[#172B4D]">1. Daily Wellness Tracker</h2>
          </div>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#2583F5] border border-blue-100">
            Personal Log
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Water Intake */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  Water Intake
                </span>
                <span className="text-xs font-bold text-blue-700">{waterMl} / 2500 ml</span>
              </div>
              <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((waterMl / 2500) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateWater(waterMl + 250)}
                className="flex-1 py-1 text-xs font-semibold rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                +250 ml
              </button>
              <button
                onClick={() => handleUpdateWater(waterMl + 500)}
                className="flex-1 py-1 text-xs font-semibold rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                +500 ml
              </button>
              <button
                onClick={() => handleUpdateWater(0)}
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Reset water counter"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Sleep Duration */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  Sleep Duration
                </span>
                <span className="text-xs font-bold text-indigo-700">{sleepHours} hrs</span>
              </div>
              <div className="w-full bg-indigo-100 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((sleepHours / 8) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between bg-white px-3 py-1 rounded-lg border border-indigo-200">
              <button
                onClick={() => handleUpdateSleep(Number((sleepHours - 0.5).toFixed(1)))}
                className="text-xs font-bold text-indigo-600 px-2 py-0.5 hover:bg-indigo-50 rounded cursor-pointer"
              >
                -0.5h
              </button>
              <span className="text-xs font-semibold text-slate-700">{sleepHours} Hours</span>
              <button
                onClick={() => handleUpdateSleep(Number((sleepHours + 0.5).toFixed(1)))}
                className="text-xs font-bold text-indigo-600 px-2 py-0.5 hover:bg-indigo-50 rounded cursor-pointer"
              >
                +0.5h
              </button>
            </div>
          </div>

          {/* Physical Activity */}
          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-teal-600" />
                  Physical Activity
                </span>
                <span className="text-xs font-bold text-teal-700">{activityMins} / 45 mins</span>
              </div>
              <div className="w-full bg-teal-100 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((activityMins / 45) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateActivity(activityMins + 15)}
                className="flex-1 py-1 text-xs font-semibold rounded-lg bg-white border border-teal-200 text-teal-600 hover:bg-teal-50 cursor-pointer"
              >
                +15 mins
              </button>
              <button
                onClick={() => handleUpdateActivity(activityMins + 30)}
                className="flex-1 py-1 text-xs font-semibold rounded-lg bg-white border border-teal-200 text-teal-600 hover:bg-teal-50 cursor-pointer"
              >
                +30 mins
              </button>
              <button
                onClick={() => handleUpdateActivity(0)}
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Reset activity"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Daily Wellness Note */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Today's Wellness Note & Reflection:
          </label>
          <input
            type="text"
            value={wellnessNote}
            onChange={(e) => handleSaveNote(e.target.value)}
            placeholder="e.g. Good energy today, rested well, drank ample water."
            className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
          />
        </div>
      </div>

      {/* Modules 2 & 3: Medication Reminders & Appointment Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 2: Medication Reminders */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-[#172B4D]">2. Medication Reminders</h3>
                  <p className="text-[11px] text-[#718096]">Schedule tracking only; non-prescriptive.</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenCreateModal("medication")}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {loadingReminders ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading reminders...</div>
            ) : medicationReminders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No medication reminders scheduled.
              </div>
            ) : (
              <div className="space-y-2.5">
                {medicationReminders.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-start justify-between p-3 rounded-xl border transition-all ${
                      r.completed ? "bg-slate-50/70 border-slate-200 opacity-60" : "bg-white border-[#E5EDF5]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(r)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        {r.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 hover:text-emerald-500" />
                        )}
                      </button>
                      <div>
                        <p className={`text-xs font-bold ${r.completed ? "line-through text-slate-400" : "text-[#172B4D]"}`}>
                          {r.title}
                        </p>
                        {r.categoryNote && (
                          <p className="text-[11px] text-[#718096]">{r.categoryNote}</p>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {r.dateTime ? new Date(r.dateTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Scheduled"}
                          {r.recurrence !== "none" && ` • ${r.recurrence}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(r)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit reminder"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(r.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="mt-4 text-[10px] text-slate-400 leading-tight pt-2 border-t border-slate-100">
            Medication reminders do not alter prescriptions or recommend medication. Always follow your prescribing clinician's instructions.
          </p>
        </div>

        {/* Module 3: Appointment Reminders */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2583F5]" />
                <div>
                  <h3 className="text-sm font-bold text-[#172B4D]">3. Appointment Reminders</h3>
                  <p className="text-[11px] text-[#718096]">Doctor consultations and lab appointments.</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenCreateModal("appointment")}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-[#2583F5] hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {loadingReminders ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading appointments...</div>
            ) : appointmentReminders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No clinical appointments scheduled.
              </div>
            ) : (
              <div className="space-y-2.5">
                {appointmentReminders.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-start justify-between p-3 rounded-xl border transition-all ${
                      r.completed ? "bg-slate-50/70 border-slate-200 opacity-60" : "bg-white border-[#E5EDF5]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(r)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        {r.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 hover:text-blue-500" />
                        )}
                      </button>
                      <div>
                        <p className={`text-xs font-bold ${r.completed ? "line-through text-slate-400" : "text-[#172B4D]"}`}>
                          {r.title}
                        </p>
                        {r.categoryNote && (
                          <p className="text-[11px] text-[#718096]">{r.categoryNote}</p>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {r.dateTime ? new Date(r.dateTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Scheduled"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(r)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit appointment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(r.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="mt-4 text-[10px] text-slate-400 leading-tight pt-2 border-t border-slate-100">
            Appointments persist safely on the server and update your dashboard schedule.
          </p>
        </div>
      </div>

      {/* Module 4: AI Wellness Tips */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EDF5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2583F5]" />
            <div>
              <h3 className="text-base font-bold text-[#172B4D]">4. AI Preventive Wellness Tips</h3>
              <p className="text-xs text-[#718096]">
                General health lifestyle education generated via Gemini API
              </p>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            {["general", "sleep", "hydration", "movement", "stress"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setTipsCategory(cat);
                  fetchWellnessTips(cat);
                }}
                disabled={loadingTips}
                className={`text-xs px-3 py-1 rounded-xl capitalize font-medium transition-all cursor-pointer ${
                  tipsCategory === cat
                    ? "bg-[#2583F5] text-white shadow-xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loadingTips ? (
          <div className="py-8 text-center text-xs text-[#718096] flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-[#2583F5]" />
            <span>Consulting preventive wellness guidelines...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wellnessTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gradient-to-b from-[#F6FAFE] to-white border border-[#E5EDF5] flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#172B4D] mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#16B8A6]" />
                    {tip.title}
                  </h4>
                  <p className="text-xs text-[#718096] leading-relaxed">
                    {tip.advice}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 capitalize mt-3 block font-medium">
                  Category: {tip.category}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-[#718096] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>These tips are educational and do not represent personalized medical treatment plans.</span>
        </div>
      </div>

      {/* Add / Edit Reminder Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5EDF5] relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#172B4D] mb-1">
              {editingReminder ? "Edit Reminder" : "Add Health Reminder"}
            </h3>
            <p className="text-xs text-[#718096] mb-4">
              Keep your medication schedule or appointments organized.
            </p>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveReminder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Reminder Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalType("medication")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      modalType === "medication"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Medication
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalType("appointment")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      modalType === "appointment"
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Appointment
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder={modalType === "medication" ? "e.g. Vitamin D3 (1000 IU)" : "e.g. Dr. Patel - Checkup"}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={modalDateTime}
                  onChange={(e) => setModalDateTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Recurrence
                </label>
                <select
                  value={modalRecurrence}
                  onChange={(e) => setModalRecurrence(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
                >
                  <option value="none">One-time only</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Notes / Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="e.g. Take with water, or Clinic Room 402"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#E5EDF5] rounded-xl focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#2583F5] hover:bg-[#1b6dd4] text-white rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {editingReminder ? "Save Changes" : "Create Reminder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
