'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { isPakistanJob } from '../regionFilter'
import { jobMatchesField } from '../fieldClassifier'
import { Briefcase, MapPin, Phone, Mail, Award, FolderGit2, Sparkles, ExternalLink, RefreshCw, Eye, FileText, X, CheckCircle2, MinusCircle, Target, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'

export default function DashboardTab({
  rawJobs,
  loading,
  matchField,
  region,
  setRegion,
  isMatchedMode,
  candidateProfile,
  onNavigateTab,
  onOpenWizard
}) {
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState(null)

  // Internal HR Job Application State
  const [selectedInternalJobForApply, setSelectedInternalJobForApply] = useState(null)
  const [submittingInternalApply, setSubmittingInternalApply] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState(new Set())

  // LLM Recommendations State
  const [llmRecommendations, setLlmRecommendations] = useState([])
  const [loadingLlm, setLoadingLlm] = useState(false)
  const [hasRunLlm, setHasRunLlm] = useState(false)
  const [llmError, setLlmError] = useState(null)

  // Trigger LLM Recommendation API call
  const handleRunLlmRecommendations = async () => {
    setLoadingLlm(true)
    setLlmError(null)
    try {
      const payload = candidateProfile ? { userId: candidateProfile.id, candidateProfile } : {}
      const res = await fetch('/candidate-panel/api/recommend-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success && Array.isArray(data.recommendations)) {
        setLlmRecommendations(data.recommendations)
        setHasRunLlm(true)
      } else {
        setLlmError(data.error || 'Failed to parse LLM job match recommendations')
      }
    } catch (err) {
      console.error('LLM Recommendation fetch exception:', err)
      setLlmError(err.message)
    } finally {
      setLoadingLlm(false)
    }
  }

  // Auto-trigger LLM matching once when candidateProfile loads
  useEffect(() => {
    if (candidateProfile && !hasRunLlm && !loadingLlm) {
      handleRunLlmRecommendations()
    }
  }, [candidateProfile])

  // 1. Field Classifier Filter
  const fieldFilteredJobs = useMemo(
    () => (matchField ? rawJobs.filter((job) => jobMatchesField(job, matchField)) : rawJobs),
    [rawJobs, matchField]
  )

  // 2. Base Jobs List
  const baseJobs = useMemo(() => {
    return fieldFilteredJobs
  }, [fieldFilteredJobs])

  // 3. Dynamic Source List (LLM vs Base)
  const sourceJobsList = useMemo(() => {
    if (hasRunLlm && llmRecommendations.length > 0) {
      return llmRecommendations
    }
    return baseJobs
  }, [hasRunLlm, llmRecommendations, baseJobs])

  // 4. Region Filter (Applies strictly to both LLM and Base Jobs)
  const displayJobsList = useMemo(() => {
    if (region === 'pk') return sourceJobsList.filter(isPakistanJob)
    if (region === 'global') return sourceJobsList.filter((job) => !isPakistanJob(job))
    return sourceJobsList
  }, [sourceJobsList, region])

  const pkCount = useMemo(() => sourceJobsList.filter(isPakistanJob).length, [sourceJobsList])
  const globalCount = useMemo(() => sourceJobsList.filter((j) => !isPakistanJob(j)).length, [sourceJobsList])

  const fullName = candidateProfile?.full_name || 'Candidate'
  const title = candidateProfile?.title || 'Cybersecurity / Software Professional'
  const phone = candidateProfile?.phone || ''
  const location = candidateProfile?.location || ''
  const email = candidateProfile?.email || ''
  const bio = candidateProfile?.bio || ''
  const skills = Array.isArray(candidateProfile?.skills) ? candidateProfile.skills : []
  const projectsCount = Array.isArray(candidateProfile?.projects) ? candidateProfile.projects.length : 0
  const certsCount = Array.isArray(candidateProfile?.certifications) ? candidateProfile.certifications.length : 0
  const resumeFilePath = candidateProfile?.cv_file_path || ''
  const resumeText = candidateProfile?.resume_text || ''

  // Handle Application tracking (External Redirect vs Internal HR Job Modal)
  const handleApplyClick = async (e, job, applyUrl) => {
    if (e && e.preventDefault) e.preventDefault()

    const isExternalUrl = applyUrl && 
                          applyUrl.trim().length > 5 && 
                          (applyUrl.startsWith('http://') || applyUrl.startsWith('https://')) && 
                          applyUrl !== '#'

    if (isExternalUrl) {
      const candidateId = candidateProfile?.id
      if (candidateId) {
        const payload = {
          candidate_id: candidateId,
          job_id: job.id ? String(job.id) : null,
          company_name: job.company || job.company_name || 'Hirenetic Enterprise',
          job_title: job.title || 'Untitled Role',
          external_apply_url: applyUrl,
          application_source: 'Candidate Portal External Redirect',
          application_status: 'Redirected'
        }

        try {
          fetch('/candidate-panel/api/apply-job', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch((err) => console.error('Application tracking notice:', err))
        } catch (err) {
          console.error('Application tracking exception:', err)
        }
      }

      window.open(applyUrl, '_blank')
    } else {
      // Internal HR Posted Job -> Open In-Platform Application Modal!
      setSelectedInternalJobForApply(job)
    }
  }

  const handleSubmitInternalApply = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!selectedInternalJobForApply) return

    setSubmittingInternalApply(true)
    try {
      const candidateId = candidateProfile?.id || 'anonymous-candidate'
      const payload = {
        candidate_id: candidateId,
        job_id: selectedInternalJobForApply.id ? String(selectedInternalJobForApply.id) : null,
        company_name: selectedInternalJobForApply.company || selectedInternalJobForApply.company_name || 'Hirenetic Enterprise',
        job_title: selectedInternalJobForApply.title || 'Untitled Role',
        external_apply_url: 'Internal Platform Application',
        application_source: 'Hirenetic HR Portal Direct',
        application_status: 'Applied'
      }

      const res = await fetch('/candidate-panel/api/apply-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      if (data.success) {
        setAppliedJobIds(prev => new Set([...prev, String(selectedInternalJobForApply.id)]))
        alert(`Application for "${selectedInternalJobForApply.title}" submitted successfully to HR!`)
        setSelectedInternalJobForApply(null)
      } else {
        alert(`Notice: ${data.error || 'Unable to submit application'}`)
      }
    } catch (err) {
      console.error('Error submitting internal job application:', err)
      alert('Failed to submit application. Please check connection.')
    } finally {
      setSubmittingInternalApply(false)
    }
  }

  const handleViewResume = () => {
    if (resumeFilePath && supabase) {
      const { data } = supabase.storage.from('cvs').getPublicUrl(resumeFilePath)
      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank')
        return
      }
    }
    if (resumeText) {
      setShowResumeModal(true)
    } else {
      alert('No CV resume file or text found in your candidate profile.')
    }
  }

  return (
    <div className="tab-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. Candidate Profile Header Cards */}
      {candidateProfile && (
        <>
          {/* Desktop Executive Card */}
          <div className="dashboard-card desktop-only" style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)', borderLeft: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {fullName}
                  </h2>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#2563eb', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 9px', borderRadius: '20px' }}>
                    {matchField || title}
                  </span>
                </div>
                
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '10px' }}>
                  {title}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                  {email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={13} color="#2563eb" /> {email}</span>}
                  {phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={13} color="#2563eb" /> {phone}</span>}
                  {location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} color="#2563eb" /> {location}</span>}
                </div>

                {bio && (
                  <p style={{ fontSize: '12.5px', color: '#334155', background: '#f1f5f9', padding: '10px 12px', borderRadius: '8px', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    {bio}
                  </p>
                )}

                {skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginRight: '4px' }}>Skills:</span>
                    {skills.slice(0, 8).map((sk) => (
                      <span key={sk} style={{ fontSize: '11px', fontWeight: '600', color: '#1e40af', background: '#eff6ff', border: '1px solid #dbeafe', padding: '2px 7px', borderRadius: '6px' }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {projectsCount > 0 && (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FolderGit2 size={14} color="#2563eb" /> {projectsCount} Projects
                    </span>
                  )}
                  {certsCount > 0 && (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Award size={14} color="#059669" /> {certsCount} Certs
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button 
                    type="button" 
                    onClick={handleViewResume}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#2563eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={14} /> View Resume
                  </button>

                  <button 
                    type="button" 
                    onClick={() => onOpenWizard ? onOpenWizard() : onNavigateTab('upload-cv')}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={14} /> Update Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Profile Bar */}
          <div className="dashboard-card mobile-only" style={{ background: '#ffffff', borderLeft: '4px solid #2563eb', padding: '14px', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>{fullName}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '500' }}>{title}</div>
                </div>
              </div>

              <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#2563eb', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                {matchField || 'Tech'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              <button 
                type="button" 
                onClick={handleViewResume}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 10px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#2563eb',
                  borderRadius: '7px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Eye size={13} /> View Resume
              </button>

              <button 
                type="button" 
                onClick={() => onOpenWizard ? onOpenWizard() : onNavigateTab('upload-cv')}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 10px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={13} /> Update Profile
              </button>
            </div>
          </div>
        </>
      )}

      {/* 2. LLM Recommendation Control Banner */}
      <div className="dashboard-card" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#ffffff', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <Sparkles size={18} style={{ color: '#a855f7' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                LLM AI Job Recommendation Engine
              </h2>
              <span style={{ fontSize: '10px', fontWeight: '700', background: 'rgba(168,85,247,0.25)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.4)', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                Gemini & Groq
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
              AI analyzes your Skills, Experience, Education, Projects & Certifications against live openings.
            </p>
          </div>

          <button
            onClick={handleRunLlmRecommendations}
            disabled={loadingLlm}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} style={{ animation: loadingLlm ? 'spin 1s linear infinite' : 'none' }} />
            {loadingLlm ? 'Analyzing...' : 'Run LLM AI Matching'}
          </button>
        </div>

        {/* Region Filter Badges inside banner */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginRight: '2px' }}>Region Filter:</span>
          
          <button
            onClick={() => setRegion('all')}
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '11.5px',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              background: region === 'all' ? '#2563eb' : 'rgba(255,255,255,0.1)',
              color: '#ffffff'
            }}
          >
            All Active ({sourceJobsList.length})
          </button>

          <button
            onClick={() => setRegion('pk')}
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '11.5px',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              background: region === 'pk' ? '#2563eb' : 'rgba(255,255,255,0.1)',
              color: '#ffffff'
            }}
          >
            🇵🇰 Pakistan ({pkCount})
          </button>

          <button
            onClick={() => setRegion('global')}
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '11.5px',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              background: region === 'global' ? '#2563eb' : 'rgba(255,255,255,0.1)',
              color: '#ffffff'
            }}
          >
            🌍 Global & Remote ({globalCount})
          </button>
        </div>
      </div>

      {/* 3. Loading & Error States */}
      {(loading || loadingLlm) && (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
          <RefreshCw size={24} className="spin-icon" style={{ marginBottom: 8, color: '#7c3aed' }} />
          <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>Executing LLM AI Relevance Analysis...</div>
        </div>
      )}

      {llmError && !loadingLlm && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}>
          LLM Matching Notice: {llmError}. Fallback scoring active.
        </div>
      )}

      {/* 4. SLEEK MINIMAL COMPACT JOBS TABLE (Not Bulky, Compact Font Sizes) */}
      {!loading && !loadingLlm && displayJobsList.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
          <Briefcase size={32} color="#94a3b8" style={{ marginBottom: 8 }} />
          <h3 style={{ fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>No openings found for region '{region.toUpperCase()}'</h3>
          <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>Try switching region filters or update your CV profile.</p>
          <button className="btn-secondary" onClick={() => setRegion('all')} style={{ fontSize: '12px' }}>
            Show All Region Jobs
          </button>
        </div>
      ) : (!loading && !loadingLlm && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={14} style={{ color: '#2563eb' }} />
              Ranked Jobs ({displayJobsList.length}) • Filtered by Region: <strong style={{ color: '#2563eb' }}>{region.toUpperCase()}</strong>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Sorted Highest → Lowest Match Score</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
              <thead>
                <tr style={{ background: '#ffffff', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 14px', width: '10%' }}>AI Score</th>
                  <th style={{ padding: '10px 14px', width: '28%' }}>Job Position & Domain</th>
                  <th style={{ padding: '10px 14px', width: '20%' }}>Company</th>
                  <th style={{ padding: '10px 14px', width: '18%' }}>Location / Type</th>
                  <th style={{ padding: '10px 14px', width: '16%' }}>Matched Skills</th>
                  <th style={{ padding: '10px 14px', width: '8%', textAlign: 'right' }}>Apply</th>
                </tr>
              </thead>
              <tbody>
                {displayJobsList.map((job, idx) => {
                  const score = job.matchScore || 80;
                  const reason = job.reason || 'Recommended based on technical candidate profile.';
                  const matchedSkills = Array.isArray(job.matchedSkills) ? job.matchedSkills : (Array.isArray(job.skills) ? job.skills.slice(0, 3) : []);
                  const missingSkills = Array.isArray(job.missingSkills) ? job.missingSkills : [];
                  const applyUrl = job.url || job.job_url || job.apply_url || '#';
                  const isExpanded = expandedJobId === job.id;

                  return (
                    <React.Fragment key={job.id || idx}>
                      <tr 
                        style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa', transition: 'background 0.15s' }}
                      >
                        {/* 1. Match Score Column */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: score >= 85 ? '#16a34a' : '#2563eb' }}>
                              {score}%
                            </span>
                            <div style={{ width: '42px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${score}%`, height: '100%', background: score >= 85 ? '#16a34a' : '#2563eb', borderRadius: '2px' }}></div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Job Position Column */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', wordBreak: 'break-word' }}>
                              {job.title}
                            </span>
                            {job.department && (
                              <span style={{ fontSize: '10px', fontWeight: '600', background: '#eff6ff', color: '#2563eb', padding: '1px 6px', borderRadius: '4px' }}>
                                {job.department}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Company Column */}
                        <td style={{ padding: '10px 14px', fontSize: '12px', color: '#334155', fontWeight: '600' }}>
                          {job.company || job.company_name || 'Hirenetic Enterprise'}
                        </td>

                        {/* 4. Location & Type */}
                        <td style={{ padding: '10px 14px', fontSize: '11.5px', color: '#64748b' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <MapPin size={11} color="#94a3b8" /> {job.location || 'Remote'}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#94a3b8', marginLeft: '6px' }}>
                            • {job.type || 'Full-time'}
                          </span>
                        </td>

                        {/* 5. Matched Skills Summary Chips */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {matchedSkills.slice(0, 3).map((sk, sIdx) => (
                              <span key={sIdx} style={{ fontSize: '10px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '1px 5px', borderRadius: '4px', fontWeight: '500' }}>
                                {sk}
                              </span>
                            ))}
                            {matchedSkills.length > 3 && (
                              <span style={{ fontSize: '10px', color: '#64748b' }}>+{matchedSkills.length - 3}</span>
                            )}
                          </div>
                        </td>

                        {/* 6. Action Column */}
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                              style={{ border: 'none', background: '#f1f5f9', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
                              title="Toggle LLM Reason"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {job.status === 'Closed' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '4px 8px', fontSize: '11px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '600' }}>
                                Closed
                              </span>
                            ) : appliedJobIds.has(String(job.id)) ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '4px 8px', fontSize: '11px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '6px', fontWeight: '700' }}>
                                <CheckCircle2 size={12} /> Applied
                              </span>
                            ) : (
                              <button
                                onClick={(e) => handleApplyClick(e, job, applyUrl)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '4px 10px', fontSize: '11.5px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                              >
                                Apply {applyUrl && applyUrl !== '#' && (applyUrl.startsWith('http://') || applyUrl.startsWith('https://')) && <ExternalLink size={10} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable LLM Analysis Row */}
                      {isExpanded && (
                        <tr style={{ background: '#faf5ff', borderBottom: '1px solid #e2e8f0' }}>
                          <td colSpan={6} style={{ padding: '12px 16px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              
                              {/* 1. Score Breakdown Badges */}
                              {job.scoreBreakdown && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#6d28d9' }}>Multi-Dimensional Score:</span>
                                  <span style={{ fontSize: '10.5px', background: '#f3e8ff', color: '#6d28d9', padding: '2px 7px', borderRadius: '5px', fontWeight: '600', border: '1px solid #d8b4fe' }}>
                                    Skills: {job.scoreBreakdown.skills || 85}%
                                  </span>
                                  <span style={{ fontSize: '10.5px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 7px', borderRadius: '5px', fontWeight: '600', border: '1px solid #bfdbfe' }}>
                                    Domain: {job.scoreBreakdown.domain || 90}%
                                  </span>
                                  <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#047857', padding: '2px 7px', borderRadius: '5px', fontWeight: '600', border: '1px solid #a7f3d0' }}>
                                    Experience: {job.scoreBreakdown.experience || 85}%
                                  </span>
                                  <span style={{ fontSize: '10.5px', background: '#fffbeb', color: '#b45309', padding: '2px 7px', borderRadius: '5px', fontWeight: '600', border: '1px solid #fde68a' }}>
                                    Projects: {job.scoreBreakdown.projects || 80}%
                                  </span>
                                </div>
                              )}

                              {/* 2. Reason */}
                              <div>
                                <div style={{ fontWeight: '700', color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', marginBottom: '2px' }}>
                                  <Sparkles size={12} /> AI Recommendation Reason:
                                </div>
                                <div style={{ color: '#334155', lineHeight: 1.4 }}>{reason}</div>
                              </div>

                              {/* 3. Gap Skills */}
                              {missingSkills.length > 0 && (
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626' }}>Gap Skills to Learn:</span>
                                  {missingSkills.map((ms, idx) => (
                                    <span key={idx} style={{ fontSize: '10px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                      {ms}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* 4. Actionable Tip */}
                              {job.suggestedAction && (
                                <div style={{ background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: '7px', padding: '6px 10px', fontSize: '11.5px', color: '#581c87', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Sparkles size={13} style={{ color: '#a855f7', flexShrink: 0 }} />
                                  <span><strong>Pro Candidate Tip:</strong> {job.suggestedAction}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))
      }

      {/* In-Platform Application Modal for Internal HR Posted Jobs */}
      {selectedInternalJobForApply && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                  Direct In-Platform Job Application
                </span>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '6px 0 2px 0' }}>
                  {selectedInternalJobForApply.title}
                </h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, fontWeight: '500' }}>
                  {selectedInternalJobForApply.company || selectedInternalJobForApply.company_name || 'Hirenetic Enterprise'} • {selectedInternalJobForApply.location || 'Remote'}
                </p>
              </div>
              <button onClick={() => setSelectedInternalJobForApply(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Candidate Summary Card */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Applicant Profile Details:</div>
              <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '13px' }}>{fullName} ({email || 'Candidate Email'})</div>
              <div style={{ color: '#64748b' }}>
                Attached CV: <strong style={{ color: resumeFilePath || resumeText ? '#16a34a' : '#d97706' }}>{resumeFilePath ? 'PDF Resume Attached' : (resumeText ? 'Profile Resume Attached' : 'Not Uploaded Yet')}</strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
              <button 
                onClick={() => setSelectedInternalJobForApply(null)}
                style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>

              <button 
                onClick={handleSubmitInternalApply}
                disabled={submittingInternalApply}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', fontSize: '12.5px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                {submittingInternalApply ? <RefreshCw size={14} className="spin-icon" /> : <Sparkles size={14} />}
                {submittingInternalApply ? 'Submitting...' : 'Submit Application to HR'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Resume Text Modal Preview */}
      {showResumeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '640px', width: '100%', padding: '20px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#2563eb" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Active Resume Content</h3>
              </div>
              <button onClick={() => setShowResumeModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {resumeText || 'No raw text stored.'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button onClick={() => setShowResumeModal(false)} className="btn-secondary">Close Preview</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
