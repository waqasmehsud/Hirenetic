"use client";

import { useState, useMemo } from "react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Remote" | "Hybrid" | "In-Office";
  minSalary: number;
  maxSalary: number;
  score: number;
  reason: string;
  skills: string[];
}

const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Frontend Design Engineer",
    company: "Vercel",
    location: "Remote",
    type: "Remote",
    minSalary: 140,
    maxSalary: 170,
    score: 94,
    reason: "Highly aligned with your React/Next.js and high-fidelity interface design experience. Strong match in UI/UX telemetry nodes.",
    skills: ["React", "Next.js", "Tailwind", "UI/UX"],
  },
  {
    id: "job-2",
    title: "AI Agent Developer",
    company: "Cloudflare",
    location: "SF / Hybrid",
    type: "Hybrid",
    minSalary: 160,
    maxSalary: 190,
    score: 82,
    reason: "Strong node match for background queue workers, stateful agents SDK, and Cloudflare Workers runtime capabilities.",
    skills: ["TypeScript", "AI Agent SDK", "Workers", "Next.js"],
  },
  {
    id: "job-3",
    title: "Product Engineer",
    company: "Linear",
    location: "Remote",
    type: "Remote",
    minSalary: 150,
    maxSalary: 180,
    score: 89,
    reason: "Excellent overlap in state management, fast interactions design, and clean Git-integrated workflow architectures.",
    skills: ["React", "TypeScript", "State Management", "Tailwind"],
  },
  {
    id: "job-4",
    title: "Senior React Architect",
    company: "Stripe",
    location: "NYC / Hybrid",
    type: "Hybrid",
    minSalary: 180,
    maxSalary: 220,
    score: 76,
    reason: "Good alignment in payment flow integrations and complex React layouts, but cautions on intensive backend SQL requirements.",
    skills: ["React", "TypeScript", "SQL", "Web Perf"],
  },
  {
    id: "job-5",
    title: "Full Stack Developer",
    company: "Supabase",
    location: "Remote / Contract",
    type: "Remote",
    minSalary: 80,
    maxSalary: 110,
    score: 58,
    reason: "Moderate alignment; requires additional Postgres pgvector and custom RPC database scaling experience.",
    skills: ["Postgres", "SQL", "Next.js", "TypeScript"],
  },
];

export default function DashboardHome() {
  // Calibration Control Deck States
  const [minScore, setMinScore] = useState<number>(60);
  const [minSalary, setMinSalary] = useState<number>(100);
  const [locationFilter, setLocationFilter] = useState<string>("ALL");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);

  // Filtered jobs memo
  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      if (job.score < minScore) return false;
      if (job.maxSalary < minSalary) return false;
      if (locationFilter !== "ALL" && job.type !== locationFilter) return false;
      return true;
    });
  }, [minScore, minSalary, locationFilter]);

  // Simulate channel connection
  const handleConnectChannel = (job: Job) => {
    setIsConnecting(true);
    setConnectionLogs([]);
    setSelectedJob(job);

    const logMessages = [
      `[SYSTEM] Connecting to ${job.company} career endpoint...`,
      `[SECURE] Synchronizing OAuth scope vectors...`,
      `[SECURE] Injecting resume telemetry profile...`,
      `[SUCCESS] Bidirectional channel established with ${job.company}.`,
      `[INFO] Target resonance match confirmed at ${job.score}%.`,
      `[READY] Calibration complete. Session logged cryptographically.`,
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < logMessages.length) {
        setConnectionLogs((prev) => [...prev, logMessages[currentLog]]);
        currentLog++;
      } else {
        clearInterval(interval);
        setIsConnecting(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-10 text-white font-sans relative">
      {/* 1. Dashboard Header */}
      <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-[28px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden backdrop-blur-md">
        {/* Colorful gradient glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-tr from-[#3ddc97]/30 to-indigo-500/20 opacity-20 blur-3xl rounded-full pointer-events-none" />

        <div className="space-y-3 z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase bg-slate-950 border border-slate-800 text-[#3ddc97] rounded-full tracking-wider font-mono">
            <span className="w-1.5 h-1.5 bg-[#3ddc97] rounded-full animate-ping" />
            Calibration Telemetry Sweeping
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Calibrate your career telemetry signal. Optimize matching resonance.
          </h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            Monitor real-time semantic matches, configure your signal control deck, and securely connect profile vectors to target company endpoints.
          </p>
        </div>
      </div>

      {/* 2. Calibration stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Resonance Channels
          </span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {filteredJobs.length} active
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Avg Resonance
          </span>
          <span className="text-2xl font-extrabold text-[#3ddc97] mt-1 block font-mono">
            {filteredJobs.length > 0
              ? `${Math.round(filteredJobs.reduce((acc, curr) => acc + curr.score, 0) / filteredJobs.length)}%`
              : "0%"}
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Source Signal
          </span>
          <span className="text-sm font-bold text-indigo-400 mt-2 block truncate">
            waqas_mehsud_resume.pdf
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Signal Integrity
          </span>
          <span className="text-2xl font-extrabold text-purple-400 mt-1 block">
            Optimal (99.8%)
          </span>
        </div>
      </div>

      {/* 3. Main Dashboard Layout (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Calibration Control Deck & Vector State */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Signal Control Deck Panel */}
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6 backdrop-blur-md">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
              [ Signal Control Deck ]
            </h3>
            
            {/* Resonance Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">MIN RESONANCE:</span>
                <span className="text-[#3ddc97] font-bold">{minScore}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3ddc97]"
              />
            </div>

            {/* Salary Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">MIN SALARY:</span>
                <span className="text-[#3ddc97] font-bold">${minSalary}k</span>
              </div>
              <input
                type="range"
                min="80"
                max="200"
                step="10"
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3ddc97]"
              />
            </div>

            {/* Location Checkboxes */}
            <div className="space-y-2">
              <span className="block text-xs font-mono text-slate-400">LOCATION TELEMETRY:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {["ALL", "Remote", "Hybrid", "In-Office"].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocationFilter(loc)}
                    className={`px-3 py-1.5 font-mono text-[10px] uppercase font-bold border rounded-lg transition-all ${
                      locationFilter === loc
                        ? "bg-[#3ddc97] border-[#3ddc97] text-slate-950 shadow-md shadow-[#3ddc97]/25"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Source Vector State Panel */}
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-md">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
              [ Resume Vector State ]
            </h3>
            <div className="space-y-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block mb-1">DETAILED VECTORS:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["React", "Next.js", "TypeScript", "AI Agent SDK", "Tailwind", "Postgres", "SQL"].map((s) => (
                    <span key={s} className="px-2 py-0.5 border border-slate-800 bg-slate-950/50 rounded text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">TARGET ROLES:</span>
                <p className="text-slate-300 font-sans leading-relaxed">
                  Frontend Design Eng, AI Agent Dev, Full Stack Developer
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Matched Job Channels */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Calibrated Resonance Channels
              </h1>
              <p className="text-[13px] text-slate-400 mt-1">
                Real-time job matching portals within the current configuration threshold limits.
              </p>
            </div>
          </div>

          {/* If no jobs matched */}
          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-slate-900/40 border border-slate-850/80 rounded-[24px] text-center space-y-5">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-600 animate-pulse"
              >
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 12 12 18 12 22Z" />
              </svg>
              <p className="text-[14px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                No Resonance Channels Found
              </p>
              <p className="text-[13px] text-slate-500 max-w-sm">
                Adjust your calibration deck (lower resonance threshold or salary limits) to lock onto active channels.
              </p>
            </div>
          ) : (
            /* Grid of matched jobs */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-900/50 border border-slate-850/80 rounded-[24px] p-6 flex flex-col justify-between hover:border-[#3ddc97]/50 transition-all shadow-md group relative overflow-hidden"
                >
                  <div>
                    {/* Header: Company, Location and Resonance score */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-850/60 pb-3 mb-4">
                      <div>
                        <h4 className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                          {job.company} — {job.location}
                        </h4>
                        <span className="inline-block mt-1 px-2 py-0.5 border border-slate-800 bg-slate-950/40 text-slate-400 font-mono text-[9px] uppercase font-bold rounded">
                          {job.type}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] flex items-center gap-1.5 bg-slate-950 px-2 py-1 border border-slate-800 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc97]" />
                        <span className="text-[#3ddc97] font-extrabold">{job.score}%</span>
                      </div>
                    </div>

                    <h3 className="text-[16px] font-bold text-white group-hover:text-[#3ddc97] transition-colors leading-snug">
                      {job.title}
                    </h3>
                    <p className="text-slate-400 text-[12px] mt-3 leading-relaxed">
                      {job.reason}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-4">
                      {job.skills.map((skill) => (
                        <span key={skill} className="px-1.5 py-0.5 text-[9px] font-mono border border-slate-850 bg-slate-950/30 text-slate-400 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-850/60 flex items-center justify-between">
                    <span className="text-[12px] text-[#3ddc97] font-semibold font-mono">
                      ${job.minSalary}k – ${job.maxSalary}k
                    </span>

                    <button
                      onClick={() => handleConnectChannel(job)}
                      className="px-3.5 py-2 bg-slate-950 hover:bg-[#3ddc97] text-slate-300 hover:text-slate-950 border border-slate-800 hover:border-[#3ddc97] rounded-xl text-[11px] font-mono uppercase font-extrabold transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      Connect Channel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 4. Connection Terminal Log (Modal) */}
      {selectedJob && (isConnecting || connectionLogs.length > 0) && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/85 backdrop-blur-sm px-4">
          <div className="bg-slate-950 border border-slate-850 rounded-[24px] p-6 max-w-lg w-full space-y-4 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-white font-mono text-[12px]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-indigo-400">
                CONNECTION_TELEMETRY // {selectedJob.company.toUpperCase()}_GATEWAY
              </span>
              {!isConnecting && (
                <button
                  onClick={() => {
                    setSelectedJob(null);
                    setConnectionLogs([]);
                  }}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  [ CLOSE ]
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 min-h-48 max-h-64 overflow-y-auto custom-scrollbar text-slate-300">
              {connectionLogs.map((log, index) => (
                <div key={index} className="leading-relaxed pl-2 border-l border-[#3ddc97]">
                  {log}
                </div>
              ))}
              {isConnecting && (
                <div className="text-[#3ddc97] animate-pulse flex items-center gap-1.5 pl-2">
                  <span className="w-1.5 h-1.5 bg-[#3ddc97] rounded-full" />
                  <span>Synchronizing...</span>
                </div>
              )}
            </div>

            {!isConnecting && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedJob(null);
                    setConnectionLogs([]);
                  }}
                  className="px-5 py-2.5 bg-[#3ddc97] hover:bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer font-sans text-xs"
                >
                  Channel Operational
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
