'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabaseClient'
import { FIELDS } from '../fieldClassifier'

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedField, setSelectedField] = useState(Object.values(FIELDS)[0])
  const [jobType, setJobType] = useState('Full-time')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fields = Object.values(FIELDS)

  const handleSaveInterests = async (e) => {
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
      .update({ resume_field: selectedField })
      .eq('id', user.id)

    setLoading(false)

    if (error) {
      setErrorMsg(`Couldn't save your interests: ${error.message}`)
      return
    }

    router.push('/jobs-platform/upload-cv')
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <div className="auth-card-modern" style={{ width: '100%', maxWidth: '450px' }}>
        <h2>Welcome! Tell us your field</h2>
        <p className="subtitle">This is your default match — we'll refine it further once you upload your CV.</p>

        <form onSubmit={handleSaveInterests}>
          <div className="input-group">
            <label>Primary Field / Profession</label>
            <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
              {fields.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Looking For</label>
            <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
              <option value="Full-time">Full-time Jobs</option>
              <option value="Internship">Internships</option>
              <option value="Both">Both Jobs & Internships</option>
            </select>
          </div>

          {errorMsg && <div className="error-text">{errorMsg}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : 'Continue to CV Upload →'}
          </button>
        </form>
      </div>
    </div>
  )
}