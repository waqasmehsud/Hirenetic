'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../supabaseClient'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('candidate') // 'candidate' or 'hr'
  const [errorMsg, setErrorMsg] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: role } },
    })

    if (error) {
      setErrorMsg(error.message)
    } else if (role === 'hr') {
      router.push('/jobs-platform/hr-dashboard')
    } else {
      router.push('/jobs-platform/onboarding')
    }
  }

  return (
    <div className="split-auth-container">
      <div className="auth-hero">
        <div className="brand-logo">
          <div className="dot" />
          <span>Vantage Point</span>
        </div>
        <div className="hero-content">
          <h1>Accelerate your career with precision matching.</h1>
          <p>Upload your CV, connect your portfolio, and let intelligent role-matching put your skills directly in front of top recruiters.</p>
        </div>
        <div className="hero-footer">© 2026 Vantage Point. All rights reserved.</div>
      </div>

      <div className="auth-form-section">
        <div className="auth-card-modern">
          <h2>Create your account</h2>
          <p className="subtitle">Get started in seconds — enter your details below.</p>

          <form onSubmit={handleSignup}>
            <div className="role-selector">
              <button type="button" className={`role-btn ${role === 'candidate' ? 'active' : ''}`} onClick={() => setRole('candidate')}>
                Candidate
              </button>
              <button type="button" className={`role-btn ${role === 'hr' ? 'active' : ''}`} onClick={() => setRole('hr')}>
                HR / Recruiter
              </button>
            </div>

            <div className="input-group">
              <label>Full name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {errorMsg && <div className="error-text">{errorMsg}</div>}

            <button type="submit" className="btn-submit">Create account</button>
          </form>

          <div className="auth-footer-link">
            Already have an account? <Link href="/jobs-platform/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}