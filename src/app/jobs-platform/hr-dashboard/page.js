'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabaseClient'
import { verifyCandidateGithub } from '../githubVerification'
import CandidateWidgetModal from '../CandidateWidgetModal'

export default function HrDashboardPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingWidgetId, setLoadingWidgetId] = useState(null)
  const [activeCandidate, setActiveCandidate] = useState(null)
  const [activeResult, setActiveResult] = useState(null)
  const [activeCvUrl, setActiveCvUrl] = useState(null)

  useEffect(() => {
    async function loadCandidates() {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/jobs-platform/login')
        return
      }

      const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (myProfile?.role !== 'hr') {
        router.push('/jobs-platform/dashboard')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, resume_field, resume_text, github_url, linkedin_url, portfolio_url, cv_file_path, created_at')
        .eq('role', 'candidate')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error && data) setCandidates(data)
      setLoading(false)
    }

    loadCandidates()
  }, [router])

  async function handleSeeWidget(candidate) {
    setLoadingWidgetId(candidate.id)

    const [githubResult, cvUrlResult] = await Promise.all([
      verifyCandidateGithub(candidate.github_url, candidate.resume_text),
      candidate.cv_file_path
        ? supabase.storage.from('cvs').createSignedUrl(candidate.cv_file_path, 300)
        : Promise.resolve({ data: null }),
    ])

    setLoadingWidgetId(null)
    setActiveCandidate(candidate)
    setActiveResult(githubResult)
    setActiveCvUrl(cvUrlResult?.data?.signedUrl || null)
  }

  function closeWidget() {
    setActiveCandidate(null)
    setActiveResult(null)
    setActiveCvUrl(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: 10, height: 10, background: '#2563eb', borderRadius: '50%' }} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Vantage Point — HR View</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Candidates</h1>
          <p style={{ color: '#64748b' }}>Verification only checks accounts the candidate themselves connected.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading candidates...</div>}

        {!loading && candidates.length === 0 && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '3rem', textAlign: 'center' }}>
            No candidates yet.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!loading && candidates.map((candidate) => {
            const isLoadingThis = loadingWidgetId === candidate.id
            return (
              <div key={candidate.id} style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{candidate.full_name || 'Unnamed candidate'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{candidate.resume_field || 'Field not detected yet'}</div>
                  </div>
                  {candidate.github_url && (
                    <button onClick={() => handleSeeWidget(candidate)} disabled={isLoadingThis}>
                      {isLoadingThis ? 'Analyzing...' : 'See Widget'}
                    </button>
                  )}
                </div>
                {!candidate.github_url && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    No GitHub connected — widget unavailable for this candidate.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {activeCandidate && (
        <CandidateWidgetModal candidate={activeCandidate} result={activeResult} cvUrl={activeCvUrl} onClose={closeWidget} />
      )}
    </div>
  )
}