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
    <div className="min-h-screen bg-black text-foreground flex flex-col md:flex-row scanlines">
      <div className="scanner-bar" />

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-muted border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-mono font-extrabold text-lg text-primary tracking-wider neon-text-green">
            &gt;_ LLM_SHEILD
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 font-mono text-primary hover:text-white transition focus:outline-none cursor-pointer"
        >
          {mobileMenuOpen ? "[ CLOSE ]" : "[ MENU ]"}
        </button>
      </header>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`w-64 bg-secondary/80 border-r border-border backdrop-blur-xl flex flex-col p-6 fixed inset-y-0 left-0 z-30 transition-transform transform md:translate-x-0 md:relative ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden md:flex items-center gap-2 mb-8">
          <span className="font-mono font-extrabold text-xl text-primary tracking-widest neon-text-green">
            &gt;_ LLM_SHEILD
          </span>
        </div>

        {/* System Health / Status indicator */}
        <div className="mb-6 p-3 bg-black/60 border border-border/80 rounded flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            SYSTEM STATUS: <span className="text-primary font-bold">SECURE</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 border font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary/5 text-primary border-primary/40 neon-glow-green"
                    : "text-zinc-500 border-transparent hover:text-primary hover:bg-muted/30"
                }`}
              >
                [ {link.name} ]
              </Link>
            );
          })}
        </nav>

        {/* Profile / Footer */}
        <div className="mt-auto pt-6 border-t border-border">
          <div className="mb-4 font-mono">
            <p className="text-[11px] text-zinc-500 truncate">{userEmail}</p>
            <div className="mt-2">
              <span
                className={`inline-block px-2.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                  role === "admin"
                    ? "bg-accent/5 text-accent border-accent/30 neon-glow-red"
                    : "bg-primary/5 text-primary border-primary/30 neon-glow-green"
                }`}
              >
                ROLE: {role}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full text-center py-2 border border-border bg-black font-mono text-xs uppercase tracking-wider text-zinc-500 hover:text-accent hover:border-accent hover:neon-glow-red transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? "TERMINATING..." : "DISCONNECT"}
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-20 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-64px)] md:min-h-screen">
        {children}
      </main>
    </div>
  );
}

