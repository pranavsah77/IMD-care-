import React from "react";
import { AlertOctagon, PhoneCall, X, ShieldAlert, HeartPulse } from "lucide-react";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-rose-300 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertOctagon className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Emergency & Crisis Support</h2>
            <p className="text-xs text-rose-600 font-semibold">Immediate assistance for acute situations</p>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 mb-5 text-xs text-rose-900 leading-relaxed">
          <p className="font-bold mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-700 inline" />
            DO NOT WAIT FOR AN AI RESPONSE IN AN EMERGENCY:
          </p>
          If you or someone nearby is experiencing crushing chest pain, difficulty breathing, sudden paralysis, speech difficulty, intense blood loss, or severe allergic reaction, contact local emergency services immediately.
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800">General Emergency (US / Canada)</p>
              <p className="text-xs text-slate-500">Police, Ambulance, Fire</p>
            </div>
            <a
              href="tel:911"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition-colors shadow-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>911</span>
            </a>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800">EU & International Emergency</p>
              <p className="text-xs text-slate-500">European Unified Emergency Services</p>
            </div>
            <a
              href="tel:112"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition-colors shadow-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>112</span>
            </a>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800">Suicide & Crisis Lifeline</p>
              <p className="text-xs text-slate-500">Free, confidential 24/7 mental health crisis support</p>
            </div>
            <a
              href="tel:988"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <HeartPulse className="w-4 h-4" />
              <span>988</span>
            </a>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800">Poison Control Center (US)</p>
              <p className="text-xs text-slate-500">Toxic exposure & poison emergency advice</p>
            </div>
            <a
              href="tel:18002221222"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>1-800-222-1222</span>
            </a>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
