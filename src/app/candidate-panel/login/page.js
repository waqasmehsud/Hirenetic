'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Code2 } from 'lucide-react'
import { supabase } from '../supabaseClient'

function extractErrorMessage(err, defaultMsg = 'An error occurred during login. Please try again.') {
  if (!err) return defaultMsg

  let msg = ''
  if (typeof err === 'string') {
    msg = err.trim()
  } else if (typeof err === 'object') {
    if (typeof err.error === 'string') {
      msg = err.error.trim()
    } else if (typeof err.message === 'string') {
      msg = err.message.trim()
    } else if (typeof err.msg === 'string') {
      msg = err.msg.trim()
    } else if (typeof err.error_description === 'string') {
      msg = err.error_description.trim()
    } else {
      try {
        const str = JSON.stringify(err)
        if (str && str !== '{}' && str !== '[]') {
          msg = str
        }
      } catch (e) {}
    }
  }

  if (!msg || msg === '{}' || msg === '[]' || msg === '[object Object]' || msg === 'undefined' || msg === 'null') {
    return defaultMsg
  }

  return msg
}

export default function CandidateLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      if (supabase) {
        await supabase.auth.signOut().catch(() => {})
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        const errText = extractErrorMessage(error, 'Invalid credentials or login failed.')
        if (errText.toLowerCase().includes('email not confirmed')) {
          setErrorMsg('⚠️ Your email address has not been confirmed yet. Please check your inbox and click the verification link before logging in.')
        } else {
          setErrorMsg(errText)
        }
        return
      }

      if (data?.session) {
        router.replace('/candidate-panel')
      }
    } catch (err) {
      console.error('Login exception:', err)
      setErrorMsg(extractErrorMessage(err, 'An error occurred during login. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-white selection:bg-blue-100 selection:text-blue-900">
      
      {/* ========================================== */}
      {/* LEFT PANEL: Branding & Value Proposition   */}
      {/* ========================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#EEF6FF] to-[#F8FBFF] p-12 flex-col justify-between relative overflow-hidden border-r border-slate-100">
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M0 32V0h32" fill="none" stroke="currentColor" strokeWidth="1"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"></rect>
          </svg>
        </div>
        
        {/* Soft Glowing Blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-indigo-300/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Top: Branding */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
             <Code2 className="w-4 h-4" />
          </div>
          <span className="text-[17px] font-semibold text-slate-900 tracking-tight">
            Candidate Portal
          </span>
        </div>

        {/* Center: Hero Content */}
        <div className="relative z-10 max-w-[480px] mx-auto w-full mt-auto mb-auto">
          <h1 className="text-[40px] xl:text-[44px] font-bold tracking-tight text-slate-900 leading-[1.15] mb-6">
            Welcome back. Continue your career journey.
          </h1>
          
          <p className="text-[17px] text-slate-600 leading-relaxed mb-10">
            Access your candidate portal to update your profile, track application statuses, and explore AI-matched tech roles.
          </p>
          
          <div className="space-y-4">
            {[
              "Track Application Statuses",
              "Update Resume & Social Links",
              "View Verified Match Scores"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200/50">
                  <Check className="w-3.5 h-3.5 text-blue-700" strokeWidth={3} />
                </div>
                <span className="text-[15px] font-medium text-slate-800">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Footer */}
        <div className="relative z-10 text-[13px] text-slate-500 font-medium">
          © {new Date().getFullYear()} Candidate Portal. All rights reserved.
        </div>
      </div>


      {/* ========================================== */}
      {/* RIGHT PANEL: Authentication Form           */}
      {/* ========================================== */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-12 relative bg-white">
        
        {/* Mobile-only branding */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2.5">
           <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
             <Code2 className="w-4 h-4" />
          </div>
          <span className="text-[16px] font-semibold text-slate-900 tracking-tight">
            Candidate Portal
          </span>
        </div>

        {/* The Floating Card */}
        <div className="w-full max-w-[520px] bg-white rounded-[18px] sm:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] sm:border border-slate-200/60 p-6 sm:p-8">
          
          {/* Form Header */}
          <div className="mb-6 text-center sm:text-left">
            <h2 className="text-[24px] sm:text-[26px] font-bold text-slate-900 tracking-tight mb-1.5">
              Log in to your account
            </h2>
            <p className="text-[14px] text-slate-500">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form className="space-y-3.5" onSubmit={handleLogin}>
            
            {/* Input: Email Address */}
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-slate-700 mb-1">
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
                className="block w-full h-[46px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[14px] text-slate-900 placeholder:text-slate-400 outline-none"
                placeholder="you@company.com"
              />
            </div>

            {/* Input: Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-[13px] font-medium text-slate-700">
                  Password
                </label>
                <a href="#" className="text-[13px] font-medium text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full h-[46px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[14px] text-slate-900 placeholder:text-slate-400 outline-none"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[13px] leading-relaxed">
                {extractErrorMessage(errorMsg, 'Invalid credentials or login failed.')}
              </div>
            )}

            {/* Primary Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] flex items-center justify-center rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-60 text-white text-[15px] font-medium transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-4 focus:ring-blue-600/20"
              >
                {loading ? 'Authenticating...' : 'Log in'}
              </button>
            </div>
            
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="h-[1px] flex-1 bg-slate-200"></div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Or</span>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>

          {/* Social Buttons Side-by-Side */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className="h-[44px] flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[13px] font-medium text-slate-700 transition-colors focus:outline-none focus:ring-4 focus:ring-slate-100"
              title="Continue with Google"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-xs sm:text-sm font-medium">Google</span>
            </button>
            
            <button
              type="button"
              className="h-[44px] flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[13px] font-medium text-slate-700 transition-colors focus:outline-none focus:ring-4 focus:ring-slate-100"
              title="Continue with LinkedIn"
            >
               <svg className="w-4 h-4 shrink-0 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.064-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
               </svg>
              <span className="text-xs sm:text-sm font-medium">LinkedIn</span>
            </button>

            <button
              type="button"
              className="h-[44px] flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[13px] font-medium text-slate-700 transition-colors focus:outline-none focus:ring-4 focus:ring-slate-100"
              title="Continue with GitHub"
            >
               <svg className="w-4 h-4 shrink-0 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
               </svg>
              <span className="text-xs sm:text-sm font-medium">GitHub</span>
            </button>
          </div>

          {/* Signup Link */}
          <div className="mt-6 text-center text-[14px] text-slate-500">
            Don't have an account?{' '}
            <Link href="/candidate-panel/signup" className="font-semibold text-slate-900 hover:text-blue-600 hover:underline transition-colors">
              Create an account
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}
