import React from "react";
import { AlertOctagon, PhoneCall, X, ShieldAlert, HeartPulse } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.tsx";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const labels = {
    en: {
      title: "Emergency & Crisis Support",
      sub: "Immediate assistance for acute and time-critical medical situations",
      warningHeader: "DO NOT WAIT FOR AN AI RESPONSE IN AN EMERGENCY:",
      warningBody: "If you or someone nearby is experiencing crushing chest pain, difficulty breathing, sudden paralysis, speech difficulty, intense blood loss, or severe allergic reaction, contact local emergency services immediately.",
      close: "I Understand & Close",
    },
    hi: {
      title: "आपातकालीन एवं संकटकालीन सहायता",
      sub: "गंभीर एवं जीवन-रक्षक चिकित्सीय स्थितियों के लिए तुरंत सहायता",
      warningHeader: "आपात स्थिति में एआई के उत्तर की प्रतीक्षा न करें:",
      warningBody: "यदि आपको या किसी अन्य को छाती में तेज दर्द, सांस लेने में अत्यधिक कठिनाई, चेहरे या हाथ में कमजोरी, बोलने में लड़खड़ाहट या गंभीर एलर्जी हो रही है, तो तुरंत आपातकालीन सेवाओं को कॉल करें।",
      close: "मैं समझ गया, बंद करें",
    },
    mr: {
      title: "आपत्कालीन आणि संकट साहाय्य",
      sub: "तातडीच्या आणि गंभीर वैद्यकीय परिस्थितीसाठी त्वरित संपर्क",
      warningHeader: "आपत्कालीन परिस्थितीत एआय उत्तराची वाट पाहू नका:",
      warningBody: "छातीत असह्य वेदना, श्वास घेण्यास अडचण, शरीराचा भाग सुन्न पडणे, बोलण्यात अडचण किंवा तीव्र रक्तस्त्राव होत असल्यास त्वरित आपत्कालीन सेवेशी संपर्क साधा.",
      close: "मला समजले, बंद करा",
    },
  }[language];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-rose-300 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertOctagon className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{labels.title}</h2>
            <p className="text-xs text-rose-600 font-semibold">{labels.sub}</p>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 mb-5 text-xs text-rose-900 leading-relaxed">
          <p className="font-bold mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-700 inline" />
            {labels.warningHeader}
          </p>
          {labels.warningBody}
        </div>

        <div className="space-y-2.5 mb-6">
          {/* India National Emergency */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800">
                National Emergency (India / भारत / महाराष्ट्र)
              </p>
              <p className="text-xs text-slate-500">Unified 112 / Ambulance 108</p>
            </div>
            <div className="flex gap-2">
              <a
                href="tel:112"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>112</span>
              </a>
              <a
                href="tel:108"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>108</span>
              </a>
            </div>
          </div>

          {/* India Mental Health: Tele-MANAS */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800">
                Tele-MANAS (मानसिक आरोग्य / मानसिक स्वास्थ्य)
              </p>
              <p className="text-xs text-slate-500">24/7 National Mental Health Toll-Free</p>
            </div>
            <a
              href="tel:14416"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-xs"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>14416</span>
            </a>
          </div>

          {/* US / Canada */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800">US & Canada Emergency</p>
              <p className="text-xs text-slate-500">Police, Fire, Ambulance (911)</p>
            </div>
            <a
              href="tel:911"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>911</span>
            </a>
          </div>

          {/* Crisis Lifeline: 988 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800">Suicide & Crisis Lifeline (US/CAN)</p>
              <p className="text-xs text-slate-500">Free, confidential 24/7 crisis support</p>
            </div>
            <a
              href="tel:988"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-xs"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>988</span>
            </a>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            {labels.close}
          </button>
        </div>
      </div>
    </div>
  );
};
