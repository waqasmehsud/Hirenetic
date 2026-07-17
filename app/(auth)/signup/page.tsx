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
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-signal selection:text-ink">
      {/* Precision grid lines in background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#24304415_1px,transparent_1px),linear-gradient(to_bottom,#24304415_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main panel card */}
      <div className="max-w-4xl w-full border border-wire bg-ink/75 backdrop-blur-md rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px] relative z-10 shadow-2xl">
        
        {/* Left column: Signup form (7 cols) */}
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
                Initialize Profile
              </h1>
              <p className="text-[12px] text-muted-ink font-mono">
                [ SETUP YOUR CAREER CALIBRATION CREDENTIALS ]
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-800/80 text-red-400 text-xs font-mono rounded-sm text-center">
                CONNECTION FAILURE: {error}
              </div>
            )}

            {success ? (
              <div className="p-6 bg-ink/50 border border-wire text-center space-y-4 rounded-sm">
                <h3 className="text-md font-display font-bold text-white uppercase tracking-wider">
                  Registration Successful
                </h3>
                <p className="text-muted-ink text-[12px] leading-relaxed">
                  Please verify your credentials via the activation link sent to your email inbox.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-4 py-3 px-8 bg-signal hover:bg-emerald-400 text-ink font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-sm shadow-md"
                >
                  Proceed to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-3">
                  
                  {/* Full Name input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="block text-[10px] font-bold text-muted-ink uppercase tracking-widest font-mono"
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
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 bg-ink/50 border border-wire rounded-sm text-[13px] text-paper placeholder-muted-ink/50 focus:outline-none focus:border-signal transition-all font-mono"
                    />
                  </div>

                  {/* Email address input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-[10px] font-bold text-muted-ink uppercase tracking-widest font-mono"
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
                      className="w-full px-4 py-3 bg-ink/50 border border-wire rounded-sm text-[13px] text-paper placeholder-muted-ink/50 focus:outline-none focus:border-signal transition-all font-mono"
                    />
                  </div>

                  {/* Password input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="block text-[10px] font-bold text-muted-ink uppercase tracking-widest font-mono"
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
                      className="w-full px-4 py-3 bg-ink/50 border border-wire rounded-sm text-[13px] text-paper placeholder-muted-ink/50 focus:outline-none focus:border-signal transition-all font-mono"
                    />
                  </div>

                  {/* Confirm Password input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-[10px] font-bold text-muted-ink uppercase tracking-widest font-mono"
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
                      className="w-full px-4 py-3 bg-ink/50 border border-wire rounded-sm text-[13px] text-paper placeholder-muted-ink/50 focus:outline-none focus:border-signal transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-signal hover:bg-emerald-400 text-ink font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-signal/15 rounded-sm disabled:opacity-50"
                >
                  {loading ? "Initializing profile..." : "Initialize Session"}
                </button>
              </form>
            )}
          </div>

          {/* Footer link */}
          <div className="text-center">
            <p className="text-[13px] text-muted-ink">
              Already have a node?{" "}
              <Link
                href="/login"
                className="text-signal hover:underline font-bold transition-colors"
              >
                Sign in
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
                {"// CALIBRATION SYSTEM ACTIVE"}
              </div>
              <h3 className="text-xl font-display font-bold leading-snug uppercase tracking-tight text-paper">
                Lock in career alignment vectors.
              </h3>
              <p className="text-[12px] text-muted-ink leading-relaxed font-sans">
                Calibrate your skills and experience to lock onto career channels.
              </p>
            </div>

            <div className="text-[10px] text-muted-ink font-mono">
              [ Calibrated matches logged ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
