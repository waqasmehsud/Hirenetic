'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabaseClient'

export default function ConnectAccountsPage() {
  const router = useRouter()
  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [portfolio, setPortfolio] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErrorMsg('You need to be logged in.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        github_url: github || null,
        linkedin_url: linkedin || null,
        portfolio_url: portfolio || null,
      })
      .eq('id', user.id)

    setLoading(false)

    if (error) {
      setErrorMsg(`Couldn't save your links: ${error.message}`)
      return
    }

    router.push('/jobs-platform/dashboard?matched=true')
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <div className="auth-card-modern" style={{ width: '100%', maxWidth: '450px' }}>
        <h2>Connect your accounts</h2>
        <p className="subtitle">Optional — recruiters can verify your real GitHub activity against your CV.</p>

        <form onSubmit={handleSave}>
          <div className="input-group">
            <label>GitHub URL</label>
            <input type="url" placeholder="https://github.com/username" value={github} onChange={(e) => setGithub(e.target.value)} />
          </div>
          <div className="input-group">
            <label>LinkedIn URL</label>
            <input type="url" placeholder="https://linkedin.com/in/username" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Portfolio URL</label>
            <input type="url" placeholder="https://yourportfolio.com" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
          </div>

          {errorMsg && <div className="error-text">{errorMsg}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : 'Continue to Dashboard →'}
          </button>
        </form>

        <div className="auth-footer-link">
          <button type="button" onClick={() => router.push('/jobs-platform/dashboard?matched=true')}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}