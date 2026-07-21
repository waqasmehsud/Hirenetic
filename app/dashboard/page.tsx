"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function DashboardHome() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hi! I'm your AI Career Match Assistant. Ask me anything about your matched jobs, resume optimizations, or career suggestions!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null); // null = loading, true = has key, false = no key
  const [checkingKey, setCheckingKey] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user has a Gemini key configured on mount
  useEffect(() => {
    async function checkKey() {
      try {
        const res = await fetch("/api/llm-api/keys");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            interface KeyInfo {
              modelName: string;
              isConfigured: boolean;
            }
            const geminiKey = data.keys.find(
              (k: KeyInfo) => k.modelName.startsWith("Gemini") && k.isConfigured
            );
            setHasKey(!!geminiKey);
          }
        }
      } catch (err) {
        console.error("Error checking Gemini key:", err);
      } finally {
        setCheckingKey(false);
      }
    }
    checkKey();
  }, []);

  // Auto scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to state
    const newMessages = [...messages, { role: "user", text: userMessage } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      } else {
        const errMsg = data.message || "An error occurred while getting response.";
        if (data.error === "NO_GEMINI_KEY") {
          setHasKey(false);
        }
        setMessages((prev) => [
          ...prev,
          { role: "model", text: `⚠️ ${errMsg}` },
        ]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "⚠️ Network error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingKey) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-mono text-xs animate-pulse">
        Initializing AI Assistant Gateway...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white font-sans max-w-4xl mx-auto relative min-h-[75vh] flex flex-col justify-between">
      <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-tr from-[#3ddc97]/15 to-indigo-500/5 opacity-20 blur-3xl rounded-full pointer-events-none" />

      {/* Header Banner */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl relative overflow-hidden backdrop-blur-md shrink-0">
        <div className="space-y-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase bg-slate-950 border border-slate-800 text-[#3ddc97] rounded-full tracking-wider font-mono">
            <span className="w-1.5 h-1.5 bg-[#3ddc97] rounded-full animate-pulse" />
            AI Partner Active
          </span>
          <h2 className="text-xl font-bold tracking-tight leading-tight">
            AI Career & Matching Assistant
          </h2>
          <p className="text-[12px] text-slate-400">
            Ask questions, ask for resume improvement tips, or seek insights on matching job opportunities.
          </p>
        </div>
      </div>

      {hasKey === false ? (
        /* Alert Box if key is missing */
        <div className="flex-1 flex flex-col justify-center items-center py-12 text-center shrink-0">
          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-3xl max-w-md space-y-6 backdrop-blur-md shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
              ⚠️
            </div>
            <div className="space-y-2">
              <h3 className="text-md font-bold text-white font-mono uppercase tracking-wide">
                API Key Required
              </h3>
              <p className="text-[12px] text-slate-400 leading-relaxed font-sans">
                To enable the AI Chat Assistant, please add a <strong>Google Gemini</strong> API key in your LLM configuration dashboard.
              </p>
            </div>
            <Link
              href="/dashboard/llm-api"
              className="inline-block px-6 py-2.5 bg-[#3ddc97] hover:bg-[#32c284] text-slate-950 font-bold uppercase tracking-wider text-[11px] rounded-xl transition-all shadow-md shadow-[#3ddc97]/10"
            >
              Configure API Keys
            </Link>
          </div>
        </div>
      ) : (
        /* Chat Box Interface */
        <div className="flex-1 min-h-[450px] bg-slate-900/20 border border-slate-800 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md shadow-inner relative">
          
          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[500px] custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600/90 text-white rounded-br-none shadow-md shadow-indigo-900/20"
                      : "bg-slate-900/80 border border-slate-800/60 text-slate-200 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {/* Loading reply bubble */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900/80 border border-slate-800/60 text-slate-400 p-4 rounded-2xl rounded-bl-none text-[13px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-800/60 bg-slate-950/60 flex items-center gap-3 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "Please wait for AI response..." : "Ask me anything about resume match, jobs..."}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3ddc97] rounded-xl font-mono"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 bg-[#3ddc97] hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold uppercase tracking-wider text-[11px] rounded-xl transition-all shrink-0 font-sans cursor-pointer active:scale-95 shadow-md shadow-[#3ddc97]/10"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
