'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Code2 } from 'lucide-react'
import { supabase } from '../supabaseClient'

function extractErrorMessage(err, defaultMsg = 'An error occurred during account creation. Please try again.') {
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

export default function CandidateSignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.')
      return
    }

    if (!termsAccepted) {
      setErrorMsg('You must agree to the Terms & Privacy Policy to create an account.')
      return
    }

    setLoading(true)

    try {
      if (supabase) {
        await supabase.auth.signOut().catch(() => {})
      }

      // 1. Try server-side API endpoint for candidate signup
      let apiSuccess = false
      try {
        const res = await fetch('/candidate-panel/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
            fullName: fullName.trim()
          })
        })

        const data = await res.json()

        if (res.ok && data.success) {
          apiSuccess = true
          // Sign in session with Supabase client
          if (supabase) {
            await supabase.auth.signInWithPassword({
              email: email.trim(),
              password: password.trim()
            }).catch(() => {})
          }
          router.replace('/candidate-panel')
          return
        } else if (data && data.error) {
          const formattedErr = extractErrorMessage(data.error, 'Failed to create candidate account. Please try again.')
          setErrorMsg(formattedErr)
          setLoading(false)
          return
        }
      } catch (apiErr) {
        console.warn('Backend API signup fallback to client auth:', apiErr)
      }

      // 2. Client-side fallback if backend API endpoint was unavailable
      if (!apiSuccess && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: { data: { full_name: fullName.trim(), role: 'candidate' } },
        })

        if (error) {
          const errText = extractErrorMessage(error, 'An error occurred during candidate registration.')
          if (errText.toLowerCase().includes('rate limit')) {
            setErrorMsg('⚠️ Email rate limit exceeded: Supabase prevents sending too many confirmation emails in a short time. Please wait 5-10 minutes, or try again later.')
          } else {
            setErrorMsg(errText)
          }
          setLoading(false)
          return
        }

        if (data?.session) {
          router.replace('/candidate-panel')
        } else {
          await supabase.auth.signOut().catch(() => {})
          setSubmittedEmail(email.trim())
          setIsSuccess(true)
        }
      }
    } catch (err) {
      console.error('Signup exception:', err)
      setErrorMsg(extractErrorMessage(err, 'An error occurred during account creation. Please try again.'))
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
            Find opportunities that fit your potential.
          </h1>
          
          <p className="text-[17px] text-slate-600 leading-relaxed mb-10">
            Build your professional profile, upload your resume, connect your portfolio, and let intelligent AI matching recommend jobs tailored to your skills.
          </p>
          
          <div className="space-y-4">
            {[
              "AI Resume Matching",
              "GitHub & Portfolio Analysis",
              "Smart Job Recommendations"
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
          
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                <Check className="w-8 h-8" strokeWidth={2.5} />
              </div>
              <h2 className="text-[22px] font-bold text-slate-900 tracking-tight mb-2">
                Verify Your Email Address
              </h2>
              <p className="text-[14px] text-slate-600 leading-relaxed mb-6">
                Account created successfully! We sent a confirmation email to <strong className="text-slate-900">{submittedEmail}</strong>.
              </p>
              <div className="p-4 bg-blue-50/80 border border-blue-200/60 rounded-xl text-[13px] text-blue-900 text-left mb-6 leading-relaxed">
                🔒 <strong>Security Policy:</strong> You must click the verification link in your email inbox before logging into your candidate portal.
              </div>
              <button
                type="button"
                className="w-full h-[48px] flex items-center justify-center rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-[15px] font-medium transition-colors shadow-sm"
                onClick={() => router.push('/candidate-panel/login')}
              >
                Proceed to Login
              </button>
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="mb-6 text-center sm:text-left">
                <h2 className="text-[24px] sm:text-[26px] font-bold text-slate-900 tracking-tight mb-1.5">
                  Create your account
                </h2>
                <p className="text-[14px] text-slate-500">
                  Join thousands of candidates discovering better opportunities.
                </p>
              </div>

              <form className="space-y-3.5" onSubmit={handleSignup}>
                
                {/* Input: Full Name */}
                <div>
                  <label htmlFor="name" className="block text-[13px] font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full h-[46px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[14px] text-slate-900 placeholder:text-slate-400 outline-none"
                    placeholder="e.g. Alex Morgan"
                  />
                </div>

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

                {/* Password & Confirm Password Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="password" className="block text-[13px] font-medium text-slate-700 mb-1">
                      Password
                    </label>
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

                  <div>
                    <label htmlFor="confirm-password" className="block text-[13px] font-medium text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full h-[46px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[14px] text-slate-900 placeholder:text-slate-400 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Checkbox: Terms */}
                <div className="flex items-start gap-2.5 pt-0.5">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-[17px] h-[17px] rounded border-slate-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0 bg-white transition-colors cursor-pointer"
                    />
                  </div>
                  <label htmlFor="terms" className="text-[13px] text-slate-600 leading-relaxed cursor-pointer">
                    I agree to the <a href="#" className="text-slate-900 font-medium hover:underline">Terms</a> & <a href="#" className="text-slate-900 font-medium hover:underline">Privacy Policy</a>
                  </label>
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[13px] leading-relaxed flex flex-col gap-2">
                    <div>{extractErrorMessage(errorMsg)}</div>
                    {(String(errorMsg).toLowerCase().includes('already registered') || String(errorMsg).toLowerCase().includes('sign in')) && (
                      <Link
                        href="/candidate-panel/login"
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[12.5px] transition-colors w-fit"
                      >
                        Click here to Sign In &rarr;
                      </Link>
                    )}
                  </div>
                )}

                {/* Primary Submit Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[48px] flex items-center justify-center rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-60 text-white text-[15px] font-medium transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-4 focus:ring-blue-600/20"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
                
              </form>



              {/* Login Link */}
              <div className="mt-6 text-center text-[14px] text-slate-500">
                Already have an account?{' '}
                <Link href="/candidate-panel/login" className="font-semibold text-slate-900 hover:text-blue-600 hover:underline transition-colors">
                  Sign In
                </Link>
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  )
}
