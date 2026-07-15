"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get("error") || null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "github" | "google") => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (oauthError) setError(oauthError.message);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "OAuth initiation failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden scanlines">
      {/* Laser line overlay scan */}
      <div className="scanner-bar" />

      <div className="max-w-md w-full space-y-8 p-8 rounded-none bg-secondary/80 border border-primary/20 backdrop-blur-xl shadow-2xl relative z-10 cyber-panel neon-glow-green">
        <div>
          <h2 className="mt-4 text-center text-2xl font-mono font-extrabold tracking-wider text-white">
            NODE_ACCESS:{" "}
            <span className="text-primary neon-text-green">
              LLM_SHEILD
            </span>
          </h2>
          <p className="mt-2 text-center text-xs font-mono text-zinc-500 uppercase tracking-widest">
            AUTHENTICATE TO INITIALIZE SESSION
          </p>
        </div>

        {error && (
          <div className="p-4 bg-accent/5 border border-accent/30 text-accent text-xs font-mono rounded-none text-center uppercase tracking-wide">
            ACCESS_DENIED: {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label htmlFor="email" className="block font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Email Address
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block font-medium text-zinc-400 uppercase tracking-wider">
                  Secret Key
                </label>
                <Link
                  href="/reset-password"
                  className="text-[11px] text-zinc-500 hover:text-primary transition-all duration-150"
                >
                  [ RECOVER ]
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "INITIALIZING..." : "CONNECT_SESSION"}
            </button>
          </div>
        </form>

        <div className="relative my-6 font-mono text-[10px]">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black/80 px-2 text-zinc-500">OR PROVIDE KEYCARD</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          <button
            onClick={() => handleOAuthLogin("github")}
            className="flex items-center justify-center py-2.5 border border-border bg-black hover:border-primary/40 hover:text-primary transition-all duration-150 cursor-pointer"
          >
            [ GITHUB ]
          </button>
          <button
            onClick={() => handleOAuthLogin("google")}
            className="flex items-center justify-center py-2.5 border border-border bg-black hover:border-primary/40 hover:text-primary transition-all duration-150 cursor-pointer"
          >
            [ GOOGLE ]
          </button>
        </div>

        <p className="mt-8 text-center text-xs font-mono text-zinc-500 uppercase">
          NO REGISTERED NODE?{" "}
          <Link
            href="/signup"
            className="text-primary hover:text-white transition-all font-bold"
          >
            [ CREATE_ACCOUNT ]
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-black font-mono space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-primary tracking-widest animate-pulse">CONNECTING TO SHIELD NODE...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
