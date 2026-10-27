import React, { useState } from "react";
import { Info, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.tsx";

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  if (dismissed) return null;

  return (
    <div className="bg-blue-50/90 border-b border-blue-100 px-4 py-2 text-xs text-[#172B4D] flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <Info className="w-4 h-4 text-[#2583F5] flex-shrink-0" />
        <p className="leading-snug">
          <strong className="font-semibold text-[#2583F5]">Notice: </strong>
          {t("disclaimerText")}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors ml-2 cursor-pointer"
        aria-label="Dismiss disclaimer banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
