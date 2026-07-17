"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derived state from searchParams
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const isRecoveryParam = !!(code || type === "recovery");

  // Track recovery session asynchronously
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const isRecovery = isRecoveryParam || hasRecoverySession;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isRecoveryParam) return;

    const supabase = createBrowserSupabaseClient();
    let isMounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (isMounted && data.user) {
        setHasRecoverySession(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isRecoveryParam]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage("Password reset instructions have been sent to your email.");
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
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
        {/* Left column: form (7 cols) */}
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

          {/* Form container */}
          <div className="my-6 space-y-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {isRecovery ? "Update Password" : "Recover Session"}
              </h1>
              <p className="text-[13px] text-slate-400">
                {isRecovery
                  ? "Set your new secure access credentials."
                  : "Request credentials link to be sent to your inbox."}
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-950/30 border border-rose-900/60 text-rose-400 text-[13px] rounded-xl text-center">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/60 text-emerald-400 text-[13px] rounded-xl text-center font-semibold">
                {message}
              </div>
            )}

            {isRecovery ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-3.5">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      New Password
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
                      Confirm New Password
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-[14px] rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-lg"
                >
                  {loading ? "Updating key..." : "Update access credentials"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-3.5">
                  {/* Email address */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      Registered Email address
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-[14px] rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-lg"
                >
                  {loading ? "Sending..." : "Request reset link"}
                </button>
              </form>
            )}
          </div>

          {/* Footer link */}
          <div className="text-center">
            <p className="text-[13px] text-slate-400">
              Remembered password?{" "}
              <Link
                href="/login"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Back to Sign in
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
                {"// CALIBRATION ENGINE READY"}
              </div>
              <h3 className="text-xl font-bold leading-snug">
                Recover your career resonance dashboard.
              </h3>
              <p className="text-[12px] text-slate-400 leading-relaxed">
                Reset your access password to resume matching.
              </p>
            </div>

            <div className="text-[11px] text-slate-600 font-mono">
              Calibration sweeps logged.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#080c16] font-sans space-y-4 text-white">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-slate-400 tracking-wider animate-pulse">
            Loading recovery console...
          </p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
