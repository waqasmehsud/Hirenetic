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
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out failed", err);
    } finally {
      setLoading(false);
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/" },
    ...(role === "admin" ? [{ name: "Admin Panel", href: "/admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            LLM-SHEILD
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white transition focus:outline-none"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`w-64 bg-zinc-900/40 border-r border-zinc-800/80 backdrop-blur-xl flex flex-col p-6 fixed inset-y-0 left-0 z-30 transition-transform transform md:translate-x-0 md:relative ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden md:flex items-center gap-2 mb-8">
          <span className="font-extrabold text-2xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            LLM-SHEILD
          </span>
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
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile / Footer */}
        <div className="mt-auto pt-6 border-t border-zinc-800/80">
          <div className="mb-4">
            <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                role === "admin"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {role}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full text-center py-2.5 px-4 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing out..." : "Sign Out"}
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
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-64px)] md:min-h-screen">
        {children}
      </main>
    </div>
  );
}
