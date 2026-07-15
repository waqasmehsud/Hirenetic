"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derived state from searchParams (calculated during render)
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const isRecoveryParam = !!(code || type === "recovery");

  // Track if we recovered session asynchronously from Supabase Auth
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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

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
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden scanlines">
      {/* Laser line overlay scan */}
      <div className="scanner-bar" />

      <div className="max-w-md w-full space-y-8 p-8 rounded-none bg-secondary/80 border border-primary/20 backdrop-blur-xl shadow-2xl relative z-10 cyber-panel neon-glow-green">
        <div>
          <h2 className="mt-4 text-center text-2xl font-mono font-extrabold tracking-wider text-white">
            {isRecovery ? "ACCESS_UPDATE" : "ACCESS_RECOVERY"}: <span className="text-primary neon-text-green">LLM_SHEILD</span>
          </h2>
          <p className="mt-2 text-center text-xs font-mono text-zinc-500 uppercase tracking-widest">
            {isRecovery
              ? "COMMIT NEW PASSPHRASE SECURELY"
              : "REQUEST TEMPORARY ACCESS SIGNATURE"}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-accent/5 border border-accent/30 text-accent text-xs font-mono rounded-none text-center uppercase tracking-wide">
            RECOVERY_ERROR: {error}
          </div>
        )}

        {message && (
          <div className="p-4 bg-primary/5 border border-primary/30 text-primary text-xs font-mono rounded-none text-center uppercase tracking-wide">
            SYSTEM_MESSAGE: {message}
          </div>
        )}

        {isRecovery ? (
          <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label htmlFor="password" className="block font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  New Master Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 bg-black border border-border rounded-none text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-sm transition placeholder-zinc-700"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-4 py-3 bg-black border border-border rounded-none text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-sm transition placeholder-zinc-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-primary bg-primary text-black hover:bg-black hover:text-primary font-mono text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:neon-glow-green"
              >
                {loading ? "COMMITTING ACCESS..." : "COMMIT_NEW_PASSWORD"}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleRequestReset}>
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label htmlFor="email" className="block font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Registered Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 bg-black border border-border rounded-none text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-sm transition placeholder-zinc-700"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-primary bg-primary text-black hover:bg-black hover:text-primary font-mono text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:neon-glow-green"
              >
                {loading ? "DISPATCHING..." : "DISPATCH_RECOVERY_SIGNATURE"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-xs font-mono text-zinc-500 uppercase">
          BACK TO LOGIN?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-white transition-all font-bold"
          >
            [ RETRACT_TO_LOGIN ]
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
