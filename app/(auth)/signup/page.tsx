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
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden scanlines">
      {/* Scanning bar overlay */}
      <div className="scanner-bar" />

      <div className="max-w-md w-full space-y-8 p-8 rounded-none bg-secondary/80 border border-primary/20 backdrop-blur-xl shadow-2xl relative z-10 cyber-panel neon-glow-green">
        <div>
          <h2 className="mt-4 text-center text-2xl font-mono font-extrabold tracking-wider text-white">
            NODE_REGISTRATION: <span className="text-primary neon-text-green">LLM_SHEILD</span>
          </h2>
          <p className="mt-2 text-center text-xs font-mono text-zinc-500 uppercase tracking-widest">
            INITIALIZE NEW OPERATOR PROFILE
          </p>
        </div>

        {error && (
          <div className="p-4 bg-accent/5 border border-accent/30 text-accent text-xs font-mono rounded-none text-center uppercase tracking-wide">
            REGISTRATION_ERROR: {error}
          </div>
        )}

        {success ? (
          <div className="p-6 bg-primary/5 border border-primary/30 text-primary text-center space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">REGISTRATION SUCCESSFUL</h3>
            <p className="text-zinc-400">
              PLEASE CHECK YOUR EMAIL TO VERIFY YOUR NODE ACCESS STATUS.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-xs font-bold text-black bg-primary border border-primary px-6 py-2.5 hover:bg-black hover:text-primary transition-all cursor-pointer hover:neon-glow-green"
            >
              [ RETRACT TO LOGIN ]
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label htmlFor="name" className="block font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Full Operator Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-3 bg-black border border-border rounded-none text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-sm transition placeholder-zinc-700"
                  placeholder="John Doe"
                />
              </div>

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
                <label htmlFor="password" className="block font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Master Password
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
                  Confirm Password
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
                {loading ? "REGISTERING..." : "COMMIT_OPERATOR_SIGNUP"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-xs font-mono text-zinc-500 uppercase">
          ALREADY CONNECTED?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-white transition-all font-bold"
          >
            [ DISCONNECT_AND_SIGNIN ]
          </Link>
        </p>
      </div>
    </div>
  );
}
