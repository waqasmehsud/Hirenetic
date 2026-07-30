'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../supabaseClient'
import { jobMatchesField } from '../fieldClassifier'
import { isPakistanJob } from '../regionFilter'

function DashboardContent() {
  const [rawJobs, setRawJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchField, setMatchField] = useState(null)
  const [region, setRegion] = useState('all')
  const router = useRouter()
  const searchParams = useSearchParams()

  const matchedParam = searchParams.get('matched')
  const isMatchedMode = matchedParam === null ? true : matchedParam === 'true'

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/jobs-platform/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('resume_field')
        .eq('id', user.id)
        .single()

      const activeField = isMatchedMode ? profile?.resume_field || null : null
      setMatchField(activeField)

      try {
        const res = await fetch('/jobs-platform/api/jobs')
        if (res.ok) {
          const jobsData = await res.json()
          if (Array.isArray(jobsData)) {
            setRawJobs(jobsData)
          }
        }
      } catch (err) {
        console.error('Error fetching jobs from API:', err)
      }

      setLoading(false)
    }

    loadData()
  }, [isMatchedMode, router])

  const fieldFilteredJobs = useMemo(
    () => (matchField ? rawJobs.filter((job) => jobMatchesField(job, matchField)) : rawJobs),
    [rawJobs, matchField]
  )

  const jobs = useMemo(() => {
    if (region === 'pk') return fieldFilteredJobs.filter(isPakistanJob)
    if (region === 'global') return fieldFilteredJobs.filter((job) => !isPakistanJob(job))
    return fieldFilteredJobs
  }, [fieldFilteredJobs, region])

  const pkCount = useMemo(() => fieldFilteredJobs.filter(isPakistanJob).length, [fieldFilteredJobs])

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 12, height: 12, background: '#2563eb', borderRadius: '50%', boxShadow: '0 0 10px rgba(37, 99, 235, 0.4)' }} />
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#0f172a' }}>Vantage Point Daily Feed</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={() => router.push('/jobs-platform/onboarding')}>Update Interests</button>
            <button className="btn-secondary" onClick={() => router.push('/jobs-platform/upload-cv')}>Re-upload CV</button>
          </div>
        </div>

        <div className="dashboard-card">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
            {isMatchedMode ? `🎯 Daily Matches: ${matchField || 'Set your interests'}` : '📂 All Jobs & Internships'}
          </h1>
          <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>
            {isMatchedMode ? 'Newest roles matching your CV and interests, refreshed daily.' : 'Browsing all listings.'}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={`filter-badge ${region === 'all' ? 'active' : ''}`} onClick={() => setRegion('all')}>All ({fieldFilteredJobs.length})</button>
            <button className={`filter-badge ${region === 'pk' ? 'active' : ''}`} onClick={() => setRegion('pk')}>🇵🇰 Pakistan ({pkCount})</button>
            <button className={`filter-badge ${region === 'global' ? 'active' : ''}`} onClick={() => setRegion('global')}>🌍 Global & Remote</button>
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading daily opportunities...</div>}

        {!loading && jobs.length === 0 && (
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>No active listings found for this category.</p>
            <button className="btn-secondary" onClick={() => router.push('/jobs-platform/dashboard?matched=false')}>
              Browse all available fields →
            </button>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div style={{ background: '#ffffff', borderRadius: '0.875rem', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <th style={{ padding: '1rem 1.25rem', width: '32%' }}>Job Title</th>
                  <th style={{ padding: '1rem 1.25rem', width: '20%' }}>Company</th>
                  <th style={{ padding: '1rem 1.25rem', width: '18%' }}>Location</th>
                  <th style={{ padding: '1rem 1.25rem', width: '14%' }}>Type</th>
                  <th style={{ padding: '1rem 1.25rem', width: '10%' }}>Posted</th>
                  <th style={{ padding: '1rem 1.25rem', width: '6%', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const title = job.title || 'Untitled Role'
                  const company = job.company_name || job.company || job.source_company || 'Company'
                  const loc = job.location || [job.city, job.country].filter(Boolean).join(', ') || 'Remote'
                  const type = job.employment_type || job.workplace_type || job.job_type || 'Full-time'
                  const link = job.apply_url || job.job_url || job.url || '#'
                  const rawDate = job.posted_at || job.created_at
                  const dateStr = rawDate ? new Date(rawDate).toLocaleDateString() : 'Recent'

                  return (
                    <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.925rem', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '1.1rem 1.25rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>{title}</td>
                      <td style={{ padding: '1.1rem 1.25rem', color: '#334155', fontWeight: 500 }}>{company}</td>
                      <td style={{ padding: '1.1rem 1.25rem', color: '#64748b' }}>📍 {loc}</td>
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.3rem 0.65rem', borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block' }}>
                          {type}
                        </span>
                      </td>
                      <td style={{ padding: '1.1rem 1.25rem', color: '#94a3b8', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{dateStr}</td>
                      <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {link && link !== '#' ? (
                          <a href={link} target="_blank" rel="noreferrer" style={{ background: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '0.45rem 0.9rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.825rem', display: 'inline-block', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)' }}>
                            Apply ↗
                          </a>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}