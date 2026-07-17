"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: "user",
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c16] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-indigo-500/35">
      {/* Background glowing blobs */}
      <div className="glow-blob w-[400px] h-[400px] bg-indigo-500 top-[-10%] left-[-10%] opacity-20" />
      <div className="glow-blob w-[400px] h-[400px] bg-emerald-500 bottom-[-10%] right-[-10%] opacity-20" />

      {/* Main glassmorphic wrapper */}
      <div className="max-w-4xl w-full bg-slate-900/60 border border-slate-800 rounded-[32px] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px] shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Left column: Login form (7 cols) */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
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
            <span className="font-extrabold text-lg bg-gradient-to-r from-[#3ddc97] to-emerald-400 bg-clip-text text-transparent uppercase tracking-wider">
              HIRENETIC
            </span>
          </Link>

          {/* Form */}
          <div className="my-6 space-y-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Initialize Profile
              </h1>
              <p className="text-[13px] text-slate-400">
                Setup your career calibration profile.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-950/30 border border-rose-900/60 text-rose-400 text-[13px] rounded-xl text-center">
                Registration error: {error}
              </div>
            )}

            {success ? (
              <div className="p-6 bg-slate-950/40 border border-slate-800 text-center space-y-4 rounded-2xl">
                <h3 className="text-lg font-bold text-white">
                  Registration Successful
                </h3>
                <p className="text-slate-400 text-[13px] leading-relaxed">
                  Please verify your credentials via the activation link sent to
                  your email inbox.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-4 py-3 px-8 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl text-[14px] transition-all shadow-md"
                >
                  Proceed to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-3.5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>

                  {/* Email address */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-[14px] rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-lg"
                >
                  {loading ? "Initializing profile..." : "Initialize Session"}
                </button>
              </form>
            )}
          </div>

          {/* Footer link */}
          <div className="text-center">
            <p className="text-[13px] text-slate-400">
              Already have a node?{" "}
              <Link
                href="/login"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right column: Graphic panel art (5 cols) */}
        <div className="hidden md:col-span-5 p-4 flex-col justify-between relative bg-slate-950/40 border-l border-slate-800">
          <div className="h-full w-full rounded-[24px] relative flex flex-col justify-between p-6 overflow-hidden bg-gradient-to-b from-indigo-950/30 to-slate-950/60 border border-slate-800/80">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full" />

            <div className="flex justify-end">
              <span className="text-[9px] uppercase tracking-widest font-mono bg-indigo-950 border border-indigo-800/60 text-indigo-400 px-2.5 py-0.5 rounded-full">
                hirenetic-telemetry
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="text-emerald-400 font-mono text-[11px] animate-pulse">
                {"// CALIBRATION SYSTEM ACTIVE"}
              </div>
              <h3 className="text-xl font-bold leading-snug">
                Lock in career alignment vectors.
              </h3>
              <p className="text-[12px] text-slate-400 leading-relaxed">
                Calibrate your skills and experience to lock onto career channels.
              </p>
            </div>

            <div className="text-[11px] text-slate-600 font-mono">
              Calibrated matches logged.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
