'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Code2, Building2, Briefcase, Globe } from 'lucide-react'
import { supabase } from '../supabase'

export default function HRSignupPage() {
  const router = useRouter()

  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [designation, setDesignation] = useState('Lead HR Recruiter')
  const [industry, setIndustry] = useState('Cybersecurity')
  const [companySize, setCompanySize] = useState('11-50')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Redirect if already logged in
  React.useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('hr_user') : null
    if (stored) {
      router.replace('/hr-panel')
    }
  }, [router])

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // Call Server-side API endpoint to guarantee DB insertion into employers_profiles
      const res = await fetch('/hr-panel/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          fullName: fullName.trim(),
          companyName: companyName.trim(),
          designation: designation.trim() || 'Lead HR Recruiter',
          industry,
          companySize
        })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Failed to create employer account in database.')
        setLoading(false)
        return
      }

      // Also authenticate session with Supabase client if possible
      if (supabase) {
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        }).catch(() => {})
      }

      const createdUser = data.user
      const hrUserObj = {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.full_name,
        company: createdUser.company_name,
        designation: createdUser.designation,
        industry: createdUser.industry,
        company_size: createdUser.company_size,
        authenticatedAt: new Date().toISOString()
      }

      localStorage.setItem('hr_user', JSON.stringify(hrUserObj))
      setSuccessMsg('Employer account created and saved in employers_profiles database! Entering workspace...')

      setTimeout(() => {
        router.replace('/hr-panel')
      }, 600)
    } catch (err) {
      console.error('HR Signup Error:', err)
      setErrorMsg('Failed to register employer account. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-white selection:bg-blue-100 selection:text-blue-900">
      
      {/* ========================================== */}
      {/* LEFT PANEL: Employer Branding & Value      */}
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
        
        {/* Glowing Blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-indigo-300/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Top: Branding */}
        <div className="relative z-10 flex items-center gap-2.5">
          <img src="/logo.svg" alt="Hirenetic Logo" className="w-8 h-8 rounded-lg shadow-sm object-cover" />
          <span className="text-[17px] font-semibold text-slate-900 tracking-tight">
            Hirenetic Employer Portal
          </span>
        </div>

        {/* Center: Hero Content */}
        <div className="relative z-10 max-w-[480px] mx-auto w-full mt-auto mb-auto">
          <h1 className="text-[40px] xl:text-[44px] font-bold tracking-tight text-slate-900 leading-[1.15] mb-6">
            Build your high-performing technical team today.
          </h1>
          
          <p className="text-[17px] text-slate-600 leading-relaxed mb-10">
            Create an employer account to post open positions, evaluate candidates with AI Match Scoring, and streamline your recruitment workflow.
          </p>
          
          <div className="space-y-4">
            {[
              "Verified Technical Candidate Profiles",
              "AI Skill Matching & Missing Skill Triage",
              "Automated Employer Dashboard Analytics"
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
          © {new Date().getFullYear()} Hirenetic HR Portal. All rights reserved.
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT PANEL: Employer Registration Form   */}
      {/* ========================================== */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-12 relative bg-white">
        
        {/* Mobile Branding */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2.5">
           <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
             <Code2 className="w-4 h-4" />
          </div>
          <span className="text-[16px] font-semibold text-slate-900 tracking-tight">
            Hirenetic Employer
          </span>
        </div>

        {/* Floating Card */}
        <div className="w-full max-w-[500px] bg-white rounded-[18px] sm:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] sm:border border-slate-200/60 p-6 sm:p-8">
          
          {/* Header */}
          <div className="mb-6 text-center sm:text-left">
            <h2 className="text-[24px] sm:text-[26px] font-bold text-slate-900 tracking-tight mb-1.5">
              Create Employer Account
            </h2>
            <p className="text-[14px] text-slate-500">
              Set up your company workspace to start hiring.
            </p>
          </div>

          <form className="space-y-3.5" onSubmit={handleSignup}>
            
            {/* Input: Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-[13px] font-medium text-slate-700 mb-1">
                Company / Enterprise Name
              </label>
              <input
                id="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="block w-full h-[44px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[14px] text-slate-900 placeholder:text-slate-400 outline-none"
                placeholder="e.g. CyberLedger / Hirenetic Corp"
              />
            </div>

            {/* Inputs: Full Name & Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="fullName" className="block text-[13px] font-medium text-slate-700 mb-1">
                  Your Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full h-[44px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[14px] text-slate-900 placeholder:text-slate-400 outline-none"
                  placeholder="Sarah Jenkins"
                />
              </div>

              <div>
                <label htmlFor="designation" className="block text-[13px] font-medium text-slate-700 mb-1">
                  HR Title
                </label>
                <input
                  id="designation"
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="block w-full h-[44px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[14px] text-slate-900 placeholder:text-slate-400 outline-none"
                  placeholder="Lead HR Recruiter"
                />
              </div>
            </div>

            {/* Selects: Industry & Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="industry" className="block text-[13px] font-medium text-slate-700 mb-1">
                  Industry
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="block w-full h-[44px] px-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[13.5px] text-slate-900 outline-none"
                >
                  <option value="Cybersecurity">Cybersecurity & SecOps</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="FinTech & Enterprise">FinTech & Enterprise</option>
                </select>
              </div>

              <div>
                <label htmlFor="companySize" className="block text-[13px] font-medium text-slate-700 mb-1">
                  Company Size
                </label>
                <select
                  id="companySize"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="block w-full h-[44px] px-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[13.5px] text-slate-900 outline-none"
                >
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="200+">200+ Enterprise</option>
                </select>
              </div>
            </div>

            {/* Input: Work Email */}
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
                className="block w-full h-[44px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[14px] text-slate-900 placeholder:text-slate-400 outline-none"
                placeholder="hr@company.com"
              />
            </div>

            {/* Input: Password */}
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
                className="block w-full h-[44px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-[14px] text-slate-900 placeholder:text-slate-400 outline-none"
                placeholder="••••••••"
              />
            </div>

            {/* Messages */}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[13px] leading-relaxed">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[13px] leading-relaxed flex flex-col gap-2">
                <div>{errorMsg}</div>
                {(errorMsg.toLowerCase().includes('already registered') || errorMsg.toLowerCase().includes('sign in')) && (
                  <Link
                    href="/hr-panel/login"
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[12.5px] transition-colors w-fit"
                  >
                    Click here to Sign In &rarr;
                  </Link>
                )}
              </div>
            )}

            {/* Primary Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] flex items-center justify-center rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-60 text-white text-[15px] font-semibold transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-600/20"
              >
                {loading ? 'Creating Employer Account...' : 'Complete Sign Up'}
              </button>
            </div>
            
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-[14px] text-slate-500">
            Already registered?{' '}
            <Link href="/hr-panel/login" className="font-semibold text-blue-600 hover:underline transition-colors">
              Sign In to HR Workspace
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}
