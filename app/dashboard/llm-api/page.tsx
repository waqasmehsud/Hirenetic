"use client";

import { useState } from "react";

interface APIKeyConfig {
  provider: string;
  name: string;
  key: string;
  status: "Connected" | "Not Configured";
  isVisible: boolean;
}

export default function LLMAPIManagement() {
  const [configs, setConfigs] = useState<APIKeyConfig[]>([
    {
      provider: "openai",
      name: "OpenAI API",
      key: "sk-proj-••••••••••••••••••••••••••••",
      status: "Connected",
      isVisible: false,
    },
    {
      provider: "anthropic",
      name: "Anthropic Claude API",
      key: "",
      status: "Not Configured",
      isVisible: false,
    },
    {
      provider: "gemini",
      name: "Google Gemini API",
      key: "AIzaSy••••••••••••••••••••••••••••",
      status: "Connected",
      isVisible: false,
    },
    {
      provider: "deepseek",
      name: "DeepSeek API",
      key: "",
      status: "Not Configured",
      isVisible: false,
    },
  ]);

  const [activeModel, setActiveModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleKeyChange = (provider: string, value: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.provider === provider ? { ...c, key: value } : c))
    );
  };

  const toggleVisibility = (provider: string) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.provider === provider ? { ...c, isVisible: !c.isVisible } : c
      )
    );
  };

  const handleSave = (provider: string, name: string) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.provider === provider
          ? {
              ...c,
              status: c.key.trim().length > 0 ? "Connected" : "Not Configured",
            }
          : c
      )
    );
    setSaveSuccess(`${name} configuration synced successfully!`);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  return (
    <div className="space-y-10 text-white font-sans relative">
      {/* Header Banner */}
      <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-[28px] relative overflow-hidden backdrop-blur-md">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-tr from-[#3ddc97]/20 to-indigo-500/10 opacity-15 blur-3xl rounded-full pointer-events-none" />

        <div className="space-y-3 z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase bg-slate-950 border border-slate-800 text-[#3ddc97] rounded-full tracking-wider font-mono">
            Gateway Guard Active
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight uppercase">
            LLM API Gateway Manager
          </h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            Manage credentials for downstream Large Language Models. Calibrate model temperature, token budgets, and routing rules used during CV analysis and matches.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-800 text-signal text-xs font-mono rounded-sm text-center font-bold tracking-wider animate-bounce">
          SUCCESS: {saveSuccess}
        </div>
      )}

      {/* Grid Layout: Providers & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Keys Configuration (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight border-b border-slate-800/80 pb-3">
            Active Provider Credentials
          </h3>

          <div className="space-y-4">
            {configs.map((config) => (
              <div
                key={config.provider}
                className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md hover:border-slate-700/60 transition-all"
              >
                {/* Provider Logo & status */}
                <div className="space-y-1 md:w-1/4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        config.status === "Connected"
                          ? "bg-[#3ddc97] animate-pulse"
                          : "bg-slate-600"
                      }`}
                    />
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-tight">
                      {config.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Status: {config.status}
                  </span>
                </div>

                {/* Key Inputs */}
                <div className="flex-1 flex gap-2">
                  <div className="relative w-full">
                    <input
                      type={config.isVisible ? "text" : "password"}
                      value={config.key}
                      onChange={(e) =>
                        handleKeyChange(config.provider, e.target.value)
                      }
                      placeholder={
                        config.status === "Connected"
                          ? "••••••••••••••••••••••••••••"
                          : "Enter API credential key..."
                      }
                      className="w-full pl-4 pr-12 py-3 bg-slate-950 border border-slate-800 text-xs font-mono text-paper placeholder-slate-600 focus:outline-none focus:border-signal transition-all rounded-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(config.provider)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white transition-colors"
                    >
                      {config.isVisible ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.421 0 .628C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Save button */}
                <button
                  type="button"
                  onClick={() => handleSave(config.provider, config.name)}
                  className="px-4 py-3 border border-wire bg-ink hover:border-paper hover:bg-wire/20 text-paper font-mono text-xs uppercase tracking-wider transition-all rounded-sm cursor-pointer"
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Global Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight border-b border-slate-800/80 pb-3">
            Routing Settings
          </h3>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6 backdrop-blur-md">
            
            {/* Model selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Primary Match Model
              </label>
              <select
                value={activeModel}
                onChange={(e) => setActiveModel(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-signal rounded-sm"
              >
                <option value="gpt-4o">gpt-4o (OpenAI)</option>
                <option value="gpt-4-turbo">gpt-4-turbo (OpenAI)</option>
                <option value="claude-3-5-sonnet">claude-3-5-sonnet (Anthropic)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (Google)</option>
                <option value="deepseek-chat">deepseek-chat (DeepSeek)</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                <span>Model Temperature</span>
                <span className="text-signal font-bold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3ddc97]"
              />
              <span className="block text-[10px] text-slate-500 font-mono">
                Lower values are logical & structured, higher values creative.
              </span>
            </div>

            {/* Token budget Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                <span>Max Output Tokens</span>
                <span className="text-[#3ddc97] font-bold">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="256"
                max="4096"
                step="128"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3ddc97]"
              />
              <span className="block text-[10px] text-slate-500 font-mono">
                Controls the maximum length of model responses.
              </span>
            </div>

            {/* Save settings button */}
            <button
              type="button"
              onClick={() => {
                setSaveSuccess("Global routing parameters updated!");
                setTimeout(() => setSaveSuccess(null), 3000);
              }}
              className="w-full py-3 bg-[#3ddc97] hover:bg-emerald-400 text-ink font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-sm cursor-pointer shadow-md"
            >
              Update Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
