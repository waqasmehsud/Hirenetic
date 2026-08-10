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
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Forgot password functionality will be implemented soon!"); }} className="text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline">
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
