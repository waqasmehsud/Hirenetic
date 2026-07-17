"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userEmail: string;
  role: "user" | "admin" | "anonymous";
}

export default function DashboardLayoutClient({
  children,
  userEmail,
  role,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out failed", err);
    } finally {
      setLoading(false);
    }
  };

  const navLinks = [
    { name: "Dashboard Console", href: "/dashboard" },
    { name: "Job Crawler", href: "/dashboard/crawler" },
    { name: "LLM API Management", href: "/dashboard/llm-api" },
  ];

  return (
    <div className="min-h-screen bg-[#080c16] text-white flex flex-col md:flex-row font-sans selection:bg-indigo-500/35 relative">
      {/* Background glowing blobs */}
      <div className="glow-blob w-[400px] h-[400px] bg-indigo-500 top-[10%] left-[-10%] opacity-20" />
      <div className="glow-blob w-[400px] h-[400px] bg-emerald-500 bottom-[10%] right-[-10%] opacity-15" />

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 12 12 18 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-[#3ddc97] to-emerald-400 bg-clip-text text-transparent">
            HIRENETIC
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="px-4 py-1.5 text-[12px] font-bold tracking-wide border border-slate-800 bg-slate-950/70 rounded-full transition active:scale-95 cursor-pointer text-slate-300"
        >
          {mobileMenuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`w-66 bg-slate-900/60 border-r border-slate-800/80 flex flex-col p-6 fixed inset-y-0 left-0 z-30 transition-transform transform md:translate-x-0 md:relative backdrop-blur-xl ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Desktop Logo Header */}
        <div className="hidden md:flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/40">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 12 12 18 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-extrabold text-xl bg-gradient-to-r from-[#3ddc97] to-emerald-400 bg-clip-text text-transparent uppercase tracking-wider">
            HIRENETIC
          </span>
        </div>

        {/* Dashboard Status Card */}
        <div className="mb-8 p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </div>
          <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider font-mono">
            status:{" "}
            <span className="text-[#3ddc97] font-semibold">
              sweep active
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 text-[14px] font-bold transition-all rounded-xl cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-850/60"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile / Footer */}
        <div className="mt-auto pt-6 border-t border-slate-800/80">
          <div className="mb-4">
            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest font-bold">
              authenticated as
            </p>
            <p className="text-[13px] text-slate-300 font-semibold truncate mt-1">
              {userEmail}
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold border border-indigo-900/60 bg-indigo-950/30 text-indigo-400 rounded-full uppercase tracking-wider font-mono">
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full text-center py-2.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 text-[13px] font-bold text-slate-300 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "Terminating..." : "Terminate Session"}
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-64px)] md:min-h-screen relative z-10">
        {children}
      </main>
    </div>
  );
}
