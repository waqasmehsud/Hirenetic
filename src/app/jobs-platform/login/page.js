'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMsg(error.message)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'hr') {
      router.push('/jobs-platform/hr-dashboard')
    } else {
      router.push('/jobs-platform/upload-cv')
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
          <h1>Welcome back to your career hub.</h1>
          <p>Log back in to track your applications, review matched jobs, and manage your profile effortlessly.</p>
        </div>
        <div className="hero-footer">© 2026 Vantage Point. All rights reserved.</div>
      </div>

      <div className="auth-form-section">
        <div className="auth-card-modern">
          <h2>Welcome back</h2>
          <p className="subtitle">Enter your details to see your matched jobs.</p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {errorMsg && <div className="error-text">{errorMsg}</div>}
            <button type="submit" className="btn-submit">Log in</button>
          </form>

          <div className="auth-footer-link">
            New here? <Link href="/jobs-platform/signup">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  )
}