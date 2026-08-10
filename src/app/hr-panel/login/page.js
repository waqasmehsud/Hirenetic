'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Code2, AlertCircle } from 'lucide-react'
import { supabase } from '../supabase'

export default function HRLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Redirect if valid session already exists
  React.useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('hr_user') : null
    if (stored) {
      router.replace('/hr-panel')
    }
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      if (!supabase) {
        setErrorMsg('Database connection unavailable. Please refresh.')
        setLoading(false)
        return
      }

      // Purge lingering sessions
      await supabase.auth.signOut().catch(() => {})

      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (authError || !authData?.user) {
        setErrorMsg('Account does not exist or credentials incorrect. Please register a new employer account.')
        setLoading(false)
        return
      }

      const userId = authData.user.id

      // 2. Database Verification in 'employers_profiles' Table
      const cleanEmail = email.trim().toLowerCase()
      const { data: employerProfiles, error: profileErr } = await supabase
        .from('employers_profiles')
        .select('*')
        .or(`id.eq.${userId},email.eq.${cleanEmail}`)

      const employerProfile = (employerProfiles && employerProfiles.length > 0) ? employerProfiles[0] : null

      // Strict Rule: If not in employers_profiles DB table, DENY ACCESS!
      if (profileErr || !employerProfile) {
        await supabase.auth.signOut().catch(() => {})
        localStorage.removeItem('hr_user')
        setErrorMsg('Account does not exist in employers_profiles database! Please register a new employer account.')
        setLoading(false)
        return
      }

      // 3. Save Verified DB Profile Session
      const hrSession = {
        id: employerProfile.id,
        email: employerProfile.email,
        name: employerProfile.full_name,
        company: employerProfile.company_name,
        designation: employerProfile.designation,
        industry: employerProfile.industry,
        company_size: employerProfile.company_size,
        authenticatedAt: new Date().toISOString()
      }

      localStorage.setItem('hr_user', JSON.stringify(hrSession))
      router.replace('/hr-panel')
    } catch (err) {
      console.error('HR Login Error:', err)
      setErrorMsg('An error occurred. Please verify your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-white selection:bg-blue-100 selection:text-blue-900">
      
      {/* LEFT PANEL: Employer Hero & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#EEF6FF] to-[#F8FBFF] p-12 flex-col justify-between relative overflow-hidden border-r border-slate-100">
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
        
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-indigo-300/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-2.5">
          <img src="/logo.svg" alt="Hirenetic Logo" className="w-8 h-8 rounded-lg shadow-sm object-cover" />
          <span className="text-[17px] font-semibold text-slate-900 tracking-tight">
            Hirenetic Employer Portal
          </span>
        </div>

        <div className="relative z-10 max-w-[480px] mx-auto w-full mt-auto mb-auto">
          <h1 className="text-[40px] xl:text-[44px] font-bold tracking-tight text-slate-900 leading-[1.15] mb-6">
            Recruit top technical talent with AI Precision.
          </h1>
          
          <p className="text-[17px] text-slate-600 leading-relaxed mb-10">
            Access your verified employer account to manage job postings, review AI candidate match rankings, and evaluate applicant portfolios.
          </p>
          
          <div className="space-y-4">
            {[
              "Real employers_profiles Database Verification",
              "Automated Candidate Resume Triage",
              "Verified Employer Recruiter Dashboard"
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

        <div className="relative z-10 text-[13px] text-slate-500 font-medium">
          © {new Date().getFullYear()} Hirenetic HR Portal. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL: Employer Login Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-12 relative bg-white">
        <div className="w-full max-w-[480px] bg-white rounded-[18px] sm:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] sm:border border-slate-200/60 p-6 sm:p-8">
          
          <div className="mb-6 text-center sm:text-left">
            <h2 className="text-[24px] sm:text-[26px] font-bold text-slate-900 tracking-tight mb-1.5">
              Employer Sign In
            </h2>
            <p className="text-[14px] text-slate-500">
              Please enter your verified employer credentials.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-slate-700 mb-1">
                Work Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full h-[46px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[14px] text-slate-900 placeholder:text-slate-400 outline-none"
                placeholder="hr@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full h-[46px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[14px] text-slate-900 placeholder:text-slate-400 outline-none"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[13px] leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] flex items-center justify-center rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-60 text-white text-[15px] font-semibold transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-600/20"
              >
                {loading ? 'Verifying DB Account...' : 'Sign In to HR Workspace'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-[14px] text-slate-500">
            Don't have an employer account?{' '}
            <Link href="/hr-panel/signup" className="font-semibold text-blue-600 hover:underline transition-colors">
              Register Company Account
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}
