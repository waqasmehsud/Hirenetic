"use client";

import { useState, useEffect } from "react";

interface SavedKey {
  modelName: string;
  isConfigured: boolean;
  maskedKey: string;
  requestsRemaining: number;
  tokensRemaining: number;
  refreshTime: string;
}

export default function LLMAPIManagement() {
  const [keys, setKeys] = useState<SavedKey[]>([]);
  const [selectedModel, setSelectedModel] = useState("Gemini 3.5 Flash");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const modelOptions = [
    "Gemini 3.5 Flash",
    "Gemini 2.5 Flash",
    "Gemini 2.0 Flash",
    "Gemini 1.5 Flash",
    "Gemini 1.5 Pro",
    "OpenAI GPT-4o",
    "OpenAI GPT-4o-mini",
    "Anthropic Claude 3.5 Sonnet",
    "DeepSeek V3",
  ];

  // Fetch configured keys on mount
  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/llm-api/keys");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setKeys(data.keys || []);
        }
      }
    } catch (err) {
      console.error("Error fetching API keys:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setMessage({ text: "Please enter a valid API key.", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/llm-api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName: selectedModel,
          apiKey: apiKey.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ text: `${selectedModel} API key saved successfully!`, type: "success" });
        setApiKey("");
        fetchKeys(); // reload keys list
      } else {
        setMessage({ text: data.error || "Failed to save API key.", type: "error" });
      }
    } catch (err) {
      console.error("Save API key error:", err);
      setMessage({ text: "An error occurred while saving the key.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async (modelName: string) => {
    if (!confirm(`Are you sure you want to remove the API key for ${modelName}?`)) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/llm-api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelName }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ text: `${modelName} API key removed successfully!`, type: "success" });
        fetchKeys(); // reload keys list
      } else {
        setMessage({ text: data.error || "Failed to remove API key.", type: "error" });
      }
    } catch (err) {
      console.error("Delete API key error:", err);
      setMessage({ text: "An error occurred while deleting the key.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (isoString: string) => {
    try {
      const diff = new Date(isoString).getTime() - Date.now();
      if (diff <= 0) return "soon";
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hrs}h ${mins}m`;
    } catch {
      return "24h";
    }
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
            Manage credentials for downstream Large Language Models. Register your Google Gemini, OpenAI, or Claude API keys securely to power the automated resume matcher.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 border text-xs font-mono rounded-xl text-center font-bold tracking-wider ${
            message.type === "success"
              ? "bg-emerald-950/30 border-emerald-800 text-[#3ddc97]"
              : "bg-rose-950/30 border-rose-800 text-rose-400"
          }`}
        >
          {message.type === "success" ? "SUCCESS" : "ERROR"}: {message.text}
        </div>
      )}

      {/* Grid Layout: Form & Saved Configured Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Save Key Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-5 backdrop-blur-md">
            <div>
              <h3 className="text-md font-bold text-white tracking-tight">
                Link New API Key
              </h3>
              <p className="text-[12px] text-slate-400 mt-1">
                Keys are encrypted and bound to your session profile.
              </p>
            </div>

            <form onSubmit={handleAddKey} className="space-y-4 font-mono text-[12px]">
              {/* Select Model */}
              <div className="space-y-2">
                <label className="block text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  Target LLM Model:
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-[#3ddc97] rounded-xl cursor-pointer font-mono"
                >
                  {modelOptions.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key Input */}
              <div className="space-y-2">
                <label className="block text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  API Key Credential:
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste credentials key here..."
                    className="w-full pl-4 pr-12 py-3 bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-[#3ddc97] transition-all rounded-xl font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white transition-colors"
                  >
                    {showKey ? (
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#3ddc97] hover:bg-emerald-400 text-slate-950 font-sans font-bold uppercase tracking-wider transition-all rounded-xl cursor-pointer disabled:opacity-50 text-xs shadow-md shadow-[#3ddc97]/15"
              >
                {isLoading ? "Saving API Key..." : "Save API Key"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Active Saved Credentials (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
            <div>
              <h3 className="text-md font-bold text-white tracking-tight">
                Active Configurations
              </h3>
              <p className="text-[12px] text-slate-400 mt-1">
                Currently registered models and remaining API limits usage tracking.
              </p>
            </div>

            <div className="divide-y divide-slate-850/60 font-mono text-[11px]">
              {isFetching ? (
                <div className="py-8 text-center text-slate-500 animate-pulse">
                  Loading saved configuration keys...
                </div>
              ) : keys.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  No active API keys registered yet. Fill out the form to register keys.
                </div>
              ) : (
                keys.map((k) => (
                  <div
                    key={k.modelName}
                    className="py-4 space-y-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-bold text-white uppercase text-[11px] block">
                          {k.modelName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {k.isConfigured ? k.maskedKey : "Not Configured"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {k.isConfigured && (
                          <button
                            type="button"
                            onClick={() => handleDeleteKey(k.modelName)}
                            className="px-2.5 py-1 text-[9px] border border-rose-950 bg-rose-950/20 hover:bg-rose-950/60 text-rose-400 font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            [ Remove Key ]
                          </button>
                        )}
                        {k.isConfigured ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-emerald-950/60 bg-emerald-950/30 text-[#3ddc97] font-bold rounded-lg uppercase text-[9px]">
                            <span className="w-1.5 h-1.5 bg-[#3ddc97] rounded-full animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-slate-800 bg-slate-950/50 text-slate-500 font-bold rounded-lg uppercase text-[9px]">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rate limits indicators details under configured keys */}
                    {k.isConfigured && (
                      <div className="grid grid-cols-3 gap-2 pt-1 pb-1.5 border-t border-slate-850/40 text-[9.5px] text-slate-400">
                        <div className="space-y-0.5">
                          <span className="text-slate-500 block uppercase font-bold text-[8.5px]">Requests Left:</span>
                          <span className="text-slate-200 font-semibold">{k.requestsRemaining.toLocaleString()} / 1,500</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-500 block uppercase font-bold text-[8.5px]">Tokens Left:</span>
                          <span className="text-slate-200 font-semibold">{k.tokensRemaining.toLocaleString()} / 1,000,000</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-500 block uppercase font-bold text-[8.5px]">Refresh Time:</span>
                          <span className="text-indigo-400 font-semibold">{formatTimeRemaining(k.refreshTime)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
