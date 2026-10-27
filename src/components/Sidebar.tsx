import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquareHeart,
  Activity,
  FileSpreadsheet,
  HeartPulse,
  Settings,
  AlertCircle,
  ShieldCheck
} from "lucide-react";

interface SidebarProps {
  onOpenEmergency: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenEmergency, onCloseMobile }) => {
  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/assistant", label: "AI Health Assistant", icon: MessageSquareHeart },
    { to: "/symptoms", label: "Symptom Guidance", icon: Activity },
    { to: "/reports", label: "Medical Reports", icon: FileSpreadsheet },
    { to: "/preventive", label: "Preventive Healthcare", icon: HeartPulse },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E5EDF5] flex flex-col h-full select-none">
      {/* Brand & Logo */}
      <div className="p-5 border-b border-[#E5EDF5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2583F5] to-[#16B8A6] flex items-center justify-center text-white shadow-sm shadow-blue-200">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#172B4D]">IMD Care</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-[#2583F5] border border-blue-100">
                AI Tech
              </span>
            </div>
            <p className="text-xs text-[#718096] font-medium leading-tight">
              Your health, made easier.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#A0AEC0]">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#2583F5] text-white shadow-sm shadow-blue-300 font-semibold"
                    : "text-[#172B4D] hover:bg-[#F6FAFE] hover:text-[#2583F5]"
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Emergency Quick Action & Disclaimer Badge */}
      <div className="p-4 border-t border-[#E5EDF5] space-y-2 bg-[#F6FAFE]/60">
        <button
          onClick={onOpenEmergency}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
          title="Emergency Help & Crisis Contacts"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>Emergency Hotlines</span>
        </button>

        <p className="text-[11px] text-[#718096] leading-tight text-center px-1">
          Informational aid only. Not a substitute for professional clinical advice.
        </p>
      </div>
    </aside>
  );
};
