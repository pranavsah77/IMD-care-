import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Trash2,
  Sparkles,
  AlertTriangle,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Info,
  Globe
} from "lucide-react";
import { ChatMessage } from "../types";
import { useLanguage } from "../context/LanguageContext.tsx";

export const HealthAssistant: React.FC = () => {
  const { language, t } = useLanguage();

  const getInitialMessage = (): ChatMessage => ({
    id: "welcome-1",
    role: "assistant",
    content: t("aiIntro"),
    timestamp: "Just now",
    disclaimer: t("disclaimerText")
  });

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions = [t("q1"), t("q2"), t("q3"), t("q4")];

  // Update initial welcome message when language changes if no conversation started
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === "welcome-1") {
      setMessages([getInitialMessage()]);
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend !== undefined ? textToSend : input).trim();
    if (!messageContent || loading) return;

    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/health-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          conversationHistory: historyPayload,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to receive response from healthcare assistant.");
      }

      const botMessage: ChatMessage = {
        id: "bot-" + Date.now(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEmergency: data.isEmergency,
        disclaimer: data.disclaimer,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error("Chat Error:", err);
      setErrorMessage(err.message || "An error occurred while contacting the assistant. Please check your network and retry.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleClearChat = () => {
    if (messages.length > 1 && window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([getInitialMessage()]);
      setErrorMessage(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Title Bar */}
      <div className="bg-white rounded-t-2xl p-4 border border-[#E5EDF5] border-b-0 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#2583F5] flex items-center justify-center">
            <Bot className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#172B4D]">{t("assistant")}</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                {language === "hi" ? "हिंदी एआई" : language === "mr" ? "मराठी एआई" : "Educational AI"}
              </span>
            </div>
            <p className="text-xs text-[#718096]">
              {language === "hi"
                ? "शब्दावली, लक्षण और दैनिक स्वास्थ्य के बारे में हिंदी में पूछें"
                : language === "mr"
                ? "वैद्यकीय संज्ञा, लक्षणे आणि दैनंदिन आरोग्याविषयी मराठीत विचारा"
                : "Ask questions about terminology, symptoms, and daily wellness"}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-slate-200 cursor-pointer"
          title="Clear all chat messages"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("clearChat")}</span>
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 bg-[#F6FAFE]/50 border border-[#E5EDF5] p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.role === "user"
                  ? "bg-[#2583F5] text-white"
                  : msg.isEmergency
                  ? "bg-rose-600 text-white"
                  : "bg-teal-600 text-white"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#2583F5] text-white rounded-tr-xs"
                  : msg.isEmergency
                  ? "bg-rose-50 border border-rose-300 text-rose-950 rounded-tl-xs"
                  : "bg-white border border-[#E5EDF5] text-[#172B4D] rounded-tl-xs"
              }`}
            >
              {msg.isEmergency && (
                <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-2 pb-1.5 border-b border-rose-200">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Immediate Medical Notice / आपातकालीन सूचना</span>
                </div>
              )}

              <div className="whitespace-pre-line space-y-2">
                {msg.content}
              </div>

              <div className="mt-2.5 pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                <span>{msg.timestamp}</span>
                {msg.role === "assistant" && (
                  <span className="flex items-center gap-1 text-[9px] text-[#718096]">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    Educational
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-[#E5EDF5] rounded-2xl rounded-tl-xs p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-[#718096]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2583F5]" />
                <span>{t("thinking")}</span>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="text-xs font-bold underline hover:text-rose-800 ml-3 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div className="bg-white px-4 py-2 border-x border-[#E5EDF5]">
        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-[#718096]">
          <Sparkles className="w-3 h-3 text-[#2583F5]" />
          <span>{t("suggestedQuestions")}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#F6FAFE] hover:bg-blue-50 text-[#172B4D] hover:text-[#2583F5] border border-[#E5EDF5] transition-all cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input & Persistent Disclaimer */}
      <div className="bg-white rounded-b-2xl p-4 border border-[#E5EDF5] border-t-0 shadow-xs space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("askPlaceholder")}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-[#E5EDF5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2583F5] focus:bg-white text-[#172B4D] placeholder-slate-400 transition-all"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-[#2583F5] hover:bg-[#1b6dd4] disabled:bg-slate-200 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t("send")}</span>
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#718096] text-center pt-1">
          <Info className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span>{t("disclaimerText")}</span>
        </div>
      </div>
    </div>
  );
};
