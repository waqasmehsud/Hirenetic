"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SimulatedJob {
  title: string;
  company: string;
  location: string;
  salary: string;
  score: number;
  reason: string;
  type: "signal" | "caution";
}

const mockJobs: SimulatedJob[] = [
  {
    title: "Frontend Design Engineer",
    company: "Vercel",
    location: "Remote",
    salary: "$140k – $170k",
    score: 94,
    reason:
      "Highly aligned with your React/Next.js and high-fidelity interface design experience.",
    type: "signal",
  },
  {
    title: "AI Agent Developer",
    company: "Cloudflare",
    location: "SF / Hybrid",
    salary: "$160k – $190k",
    score: 82,
    reason:
      "Strong node match for background queue workers and stateful agents SDK architectures.",
    type: "signal",
  },
  {
    title: "Full Stack Developer",
    company: "Supabase",
    location: "Remote / Contract",
    salary: "$80k – $110k",
    score: 58,
    reason:
      "Moderate alignment; requires additional Postgres pgvector and custom RPC scaling experience.",
    type: "caution",
  },
];

const logMessages = [
  "Initializing career telemetry receiver...",
  "Parsing resume payload into structural profile vectors...",
  "Resume vector parsed: [Skills: React, Next.js, Node, VectorDB] [Roles: Web, Product, Frontend]",
  "Sweeping crawler databases for active target company channels...",
  "Scanning company career portals (Supabase, Vercel, Cloudflare, Linear, Stripe)...",
  "Running LLM semantic coupling matrices...",
  "Aligning resonance matching matrix...",
  "Calibration completed. 3 nodes locked within threshold.",
];

export default function WelcomePage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [simulatedScore, setSimulatedScore] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSimulate = (name: string = "resume_waqas_mehsud.pdf") => {
    if (isScanning) return;
    setIsScanning(true);
    setResumeName(name);
    setScanStep(0);
    setTelemetryLogs([]);
    setSimulatedScore(0);
  };

  // Scan simulation stepper logic
  useEffect(() => {
    if (!isScanning) return;

    if (scanStep < logMessages.length) {
      const logTimer = setTimeout(() => {
        setTelemetryLogs((prev) => [
          ...prev,
          `[SYSTEM] ${logMessages[scanStep]}`,
        ]);
        setScanStep((prev) => prev + 1);
      }, 700);
      return () => clearTimeout(logTimer);
    } else {
      // Done logging, count up target score
      const interval = setInterval(() => {
        setSimulatedScore((prev) => {
          if (prev >= 94) {
            clearInterval(interval);
            return 94;
          }
          return prev + 2;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isScanning, scanStep]);

  const triggerMockUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSimulate(file.name);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-paper selection:bg-signal selection:text-ink font-sans flex flex-col relative overflow-hidden">
      {/* Precision grid lines in background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#24304415_1px,transparent_1px),linear-gradient(to_bottom,#24304415_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Nav Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-wire/40 relative z-10">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-8 h-8 border border-wire flex items-center justify-center relative overflow-hidden">
            {/* Pulsing indicator block */}
            <div className="w-2.5 h-2.5 bg-signal animate-pulse" />
            <div className="absolute inset-0 border border-wire opacity-50 pointer-events-none" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-paper">
            HIRENETIC
          </span>
        </Link>

        {/* Secondary Authentication Controls */}
        <div className="flex items-center gap-6 font-mono text-xs">
          <Link
            href="/login"
            className="text-muted-ink hover:text-paper transition-colors tracking-wide"
          >
            [ LOGIN ]
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 border border-wire hover:border-paper hover:bg-wire/20 text-paper transition-all"
          >
            INITIALIZE SESSION
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center max-w-7xl mx-auto px-6 py-12 w-full relative z-10">
        {/* Intro telemetry stats */}
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-wire/60 bg-ink/80 text-muted-ink font-mono text-[10px] tracking-widest uppercase mb-6 rounded-sm">
          <span className="w-1.5 h-1.5 bg-signal rounded-full animate-ping" />
          System Status: Telemetry Sweep Active
        </div>

        {/* Main Headline */}
        <h1 className="text-center font-display font-bold text-4xl sm:text-5xl md:text-7xl tracking-tight max-w-5xl leading-[1.05] uppercase mb-6">
          Calibrate Your Career Signal To Job Resonance
        </h1>

        <p className="text-center text-muted-ink font-sans text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
          An AI-crawled career calibration dashboard. Upload your resume, parse
          structural skill vectors, and watch in real-time as matching job
          channels synchronize with semantic precision.
        </p>

        {/* Action Button Grid */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full max-w-md">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx"
            className="hidden"
          />
          <button
            onClick={triggerMockUpload}
            className="w-full sm:w-auto px-8 py-4 bg-signal hover:bg-emerald-400 text-ink font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-signal/15"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Resume
          </button>

          <button
            onClick={() => handleSimulate()}
            className="w-full sm:w-auto px-8 py-4 border border-wire bg-ink hover:border-paper hover:bg-wire/20 text-paper font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            [ RUN CALIBRATION DEMO ]
          </button>
        </div>

        {/* Live Calibration Dashboard Panel */}
        <div className="w-full max-w-5xl border border-wire bg-ink/75 backdrop-blur-md rounded-lg overflow-hidden flex flex-col items-stretch relative">
          {/* Panel Telemetry Header */}
          <div className="flex items-center justify-between border-b border-wire px-4 py-3 bg-wire/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 border border-wire flex items-center justify-center">
                <span
                  className={`w-1 h-1 rounded-full ${isScanning ? "bg-signal animate-pulse" : "bg-muted-ink"}`}
                />
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-ink uppercase">
                Channel Interface // Calibration_Matrix_v1.0
              </span>
            </div>
            {resumeName && (
              <span className="font-mono text-[10px] text-signal uppercase tracking-wider">
                Source: {resumeName}
              </span>
            )}
          </div>

          {/* Core Simulator UI */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
            {/* Left Column: Source Signal Node (Resume Vector) */}
            <div className="md:col-span-4 p-6 border-b md:border-b-0 md:border-r border-wire flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] text-muted-ink uppercase tracking-widest block mb-4">
                  [ 01. Signal Source ]
                </span>

                <div className="border border-wire bg-wire/5 p-4 rounded-md relative overflow-hidden">
                  {!resumeName ? (
                    <div className="text-center py-8 text-muted-ink space-y-4">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="mx-auto opacity-45"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      <p className="font-mono text-[11px] leading-relaxed">
                        Telemetry receiver idle.
                        <br />
                        Upload a PDF/DOCX resume file to begin career vector
                        analysis.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 font-mono text-[11px] text-paper">
                      <div className="flex items-center justify-between border-b border-wire/60 pb-2">
                        <span className="text-muted-ink">VECTOR STATE:</span>
                        <span className="text-signal animate-pulse">
                          LOCKED
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-ink">{"// DETECTED SKILLS"}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="px-1.5 py-0.5 bg-wire/30 border border-wire text-[10px] text-paper">
                            React
                          </span>
                          <span className="px-1.5 py-0.5 bg-wire/30 border border-wire text-[10px] text-paper">
                            Next.js
                          </span>
                          <span className="px-1.5 py-0.5 bg-wire/30 border border-wire text-[10px] text-paper">
                            TypeScript
                          </span>
                          <span className="px-1.5 py-0.5 bg-wire/30 border border-wire text-[10px] text-paper">
                            AI Agent SDK
                          </span>
                          <span className="px-1.5 py-0.5 bg-wire/30 border border-wire text-[10px] text-paper">
                            Tailwind
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-ink">{"// TARGET ROLES"}</p>
                        <p className="text-paper">
                          Frontend Eng, Design Architect, Full Stack
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-ink">
                          {"// EXPERIENCE FIELD"}
                        </p>
                        <p className="text-paper">
                          3.5 Years Systemic Architecture
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {resumeName && (
                <button
                  onClick={() => {
                    setResumeName(null);
                    setIsScanning(false);
                    setTelemetryLogs([]);
                    setSimulatedScore(0);
                    setScanStep(0);
                  }}
                  className="mt-6 font-mono text-[10px] text-caution hover:text-amber-400 transition-colors uppercase tracking-wider text-left"
                >
                  [ DISCONNECT SOURCE ]
                </button>
              )}
            </div>

            {/* Middle Column: Scanning Telemetry Stream */}
            <div className="md:col-span-4 p-6 border-b md:border-b-0 md:border-r border-wire flex flex-col justify-between bg-wire/5">
              <div>
                <span className="font-mono text-[10px] text-muted-ink uppercase tracking-widest block mb-4">
                  [ 02. Alignment Console ]
                </span>

                <div className="font-mono text-[10px] space-y-2 h-[220px] overflow-y-auto pr-2 custom-scrollbar text-muted-ink border border-wire/60 bg-ink p-3 rounded-md">
                  {telemetryLogs.length === 0 && (
                    <div className="text-center py-16 opacity-45">
                      {"// Telemetry stream ready."}
                      <br />
                      Waiting for signal source connection...
                    </div>
                  )}
                  {telemetryLogs.map((log, index) => (
                    <div
                      key={index}
                      className="leading-relaxed border-l border-wire/60 pl-2"
                    >
                      {log}
                    </div>
                  ))}
                  {isScanning && scanStep < logMessages.length && (
                    <div className="text-signal animate-pulse flex items-center gap-1.5 pl-2">
                      <span className="w-1.5 h-1.5 bg-signal rounded-full" />
                      <span>Calibrating coupling channels...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-wire/40">
                <span className="font-mono text-[10px] text-muted-ink">
                  COUPLING COEFFICIENT:
                </span>
                <span className="font-mono text-[11px] font-bold text-signal">
                  {isScanning && scanStep >= logMessages.length
                    ? `${simulatedScore}.0%`
                    : "0.0%"}
                </span>
              </div>
            </div>

            {/* Right Column: Matched Channels Output */}
            <div className="md:col-span-4 p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] text-muted-ink uppercase tracking-widest block mb-4">
                  [ 03. Resonator Matches ]
                </span>

                <div className="space-y-4">
                  {!isScanning || scanStep < logMessages.length ? (
                    <div className="border border-dashed border-wire/60 p-8 text-center text-muted-ink rounded-md">
                      <span className="font-mono text-[10px]">
                        {
                          "// Match indicators offline until calibration sweeps resolve."
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      {mockJobs.map((job, idx) => {
                        const showResonance = simulatedScore >= job.score;
                        if (!showResonance) return null;

                        return (
                          <div
                            key={idx}
                            className="border border-wire p-3 rounded-md space-y-2 bg-wire/10 hover:bg-wire/20 transition-colors animate-fade-in"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-display font-semibold text-xs text-paper uppercase">
                                  {job.title}
                                </h4>
                                <p className="font-mono text-[9px] text-muted-ink">
                                  {job.company} — {job.location}
                                </p>
                              </div>

                              {/* Resonance score Badge */}
                              <div className="font-mono text-[10px] flex items-center gap-1">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${job.type === "signal" ? "bg-signal" : "bg-caution"}`}
                                />
                                <span
                                  className={
                                    job.type === "signal"
                                      ? "text-signal font-bold"
                                      : "text-caution font-bold"
                                  }
                                >
                                  {job.score}%
                                </span>
                              </div>
                            </div>

                            <p className="font-sans text-[10px] text-muted-ink leading-relaxed border-t border-wire/40 pt-1">
                              {job.reason}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {isScanning && scanStep >= logMessages.length && (
                <div className="pt-4 border-t border-wire/40 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-muted-ink">
                    Calibrated matching target:
                  </span>
                  <Link
                    href="/dashboard"
                    className="text-signal hover:underline"
                  >
                    Access Dashboard →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Details / System Mechanics (Bento-ish features breakdown) */}
      <section className="border-t border-wire/40 bg-wire/5 py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="font-mono text-[10px] text-signal uppercase tracking-widest">
              [ ENGINE MECHANIC 01 ]
            </div>
            <h3 className="font-display text-lg uppercase font-bold text-paper">
              Autonomous Crawler Pipeline
            </h3>
            <p className="font-sans text-sm text-muted-ink leading-relaxed">
              No static scrapers. System runs background LLM crawling agents
              that dynamically navigate web career nodes, pull fresh listings,
              and structure data securely against strict schemas.
            </p>
          </div>

          <div className="space-y-3">
            <div className="font-mono text-[10px] text-signal uppercase tracking-widest">
              [ ENGINE MECHANIC 02 ]
            </div>
            <h3 className="font-display text-lg uppercase font-bold text-paper">
              Semantic Coupling Matrix
            </h3>
            <p className="font-sans text-sm text-muted-ink leading-relaxed">
              Resonance calculations map your structural career vectors against
              job requirements. The matching model provides precision ratings
              from 0 to 100% with context details.
            </p>
          </div>

          <div className="space-y-3">
            <div className="font-mono text-[10px] text-signal uppercase tracking-widest">
              [ ENGINE MECHANIC 03 ]
            </div>
            <h3 className="font-display text-lg uppercase font-bold text-paper">
              Signal Filter Calibration
            </h3>
            <p className="font-sans text-sm text-muted-ink leading-relaxed">
              Configure parameters to sweep only relevant salaries, location
              styles, or resonance threshold scores. Calibrate your control deck
              so you only see signals that fit.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-ink border-t border-wire/40 py-8 px-6 relative z-10 font-mono text-[10px] text-muted-ink">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border border-wire flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-signal" />
            </div>
            <span className="font-bold text-paper">HIRENETIC SYSTEM INC.</span>
          </div>

          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-paper transition-colors">
              [ SECURITY TELEMETRY ]
            </Link>
            <Link href="#" className="hover:text-paper transition-colors">
              [ POLICIES ]
            </Link>
            <span className="text-wire">{"// CORE PROTOCOL V1.0.0"}</span>
          </div>

          <p>
            © 2026 Hirenetic. All telemetry matches logged cryptographically.
          </p>
        </div>
      </footer>
    </div>
  );
}
