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
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-signal selection:text-ink">
      {/* Precision grid lines in background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#24304415_1px,transparent_1px),linear-gradient(to_bottom,#24304415_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main panel card */}
      <div className="max-w-4xl w-full border border-wire bg-ink/75 backdrop-blur-md rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px] relative z-10 shadow-2xl">
        
        {/* Left column: Recovery form (7 cols) */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          
          {/* Brand Logo Header */}
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

          {/* Form container */}
          <div className="my-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-display font-bold text-paper tracking-tight uppercase">
                {isRecovery ? "Update Password" : "Recover Session"}
              </h1>
              <p className="text-[12px] text-muted-ink font-mono">
                {isRecovery
                  ? "[ SET YOUR NEW SECURE ACCESS CREDENTIALS ]"
                  : "[ REQUEST CREDENTIALS LINK TO BE SENT TO YOUR INBOX ]"}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-800/80 text-red-400 text-xs font-mono rounded-sm text-center">
                FAILURE: {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/80 text-signal text-xs font-mono rounded-sm text-center font-bold">
                SUCCESS: {message}
              </div>
            )}

            {isRecovery ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-3">
                  
                  {/* New Password Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="block text-[10px] font-bold text-muted-ink uppercase tracking-widest font-mono"
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
                      className="w-full px-4 py-3 bg-ink/50 border border-wire rounded-sm text-[13px] text-paper placeholder-muted-ink/50 focus:outline-none focus:border-signal transition-all font-mono"
                    />
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-[10px] font-bold text-muted-ink uppercase tracking-widest font-mono"
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
                      className="w-full px-4 py-3 bg-ink/50 border border-wire rounded-sm text-[13px] text-paper placeholder-muted-ink/50 focus:outline-none focus:border-signal transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-signal hover:bg-emerald-400 text-ink font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-signal/15 rounded-sm disabled:opacity-50"
                >
                  {loading ? "Updating key..." : "Update access credentials"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-3.5">
                  
                  {/* Registered Email address input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-[10px] font-bold text-muted-ink uppercase tracking-widest font-mono"
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
                      className="w-full px-4 py-3 bg-ink/50 border border-wire rounded-sm text-[13px] text-paper placeholder-muted-ink/50 focus:outline-none focus:border-signal transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-signal hover:bg-emerald-400 text-ink font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-signal/15 rounded-sm disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Request reset link"}
                </button>
              </form>
            )}
          </div>

          {/* Footer link */}
          <div className="text-center">
            <p className="text-[13px] text-muted-ink">
              Remembered password?{" "}
              <Link
                href="/login"
                className="text-signal hover:underline font-bold transition-colors"
              >
                Back to Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right column: Graphic panel art (5 cols) */}
        <div className="hidden md:col-span-5 p-4 flex-col justify-between relative bg-wire/5 border-l border-wire">
          <div className="h-full w-full rounded-sm relative flex flex-col justify-between p-6 overflow-hidden bg-ink/40 border border-wire/60">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#3ddc97]/5 blur-2xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />

            <div className="flex justify-end">
              <span className="text-[9px] uppercase tracking-widest font-mono bg-wire/30 border border-wire text-muted-ink px-2.5 py-0.5 rounded-sm">
                hirenetic-telemetry
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="text-signal font-mono text-[11px] animate-pulse">
                {"// CALIBRATION ENGINE READY"}
              </div>
              <h3 className="text-xl font-display font-bold leading-snug uppercase tracking-tight text-paper">
                Recover your career resonance dashboard.
              </h3>
              <p className="text-[12px] text-muted-ink leading-relaxed font-sans">
                Reset your access password to resume matching.
              </p>
            </div>

            <div className="text-[10px] text-muted-ink font-mono">
              [ Calibration sweeps logged ]
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-ink font-sans space-y-4 text-paper">
          <div className="w-8 h-8 border border-wire flex items-center justify-center relative overflow-hidden">
            <div className="w-2.5 h-2.5 bg-signal animate-pulse" />
          </div>
          <p className="text-[12px] text-muted-ink tracking-wider animate-pulse font-mono">
            LOADING RECOVERY CONSOLE...
          </p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
