'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { classifyText } from '../fieldClassifier'
import { scanPDFForThreats } from '../cvSecurityScan'
import { FileUp, ShieldCheck, CheckCircle, AlertTriangle, Sparkles, ExternalLink, FileText, Eye, Download, User, MapPin, Phone, Mail, Github, Linkedin, Globe } from 'lucide-react'

// Real PDF Text Extractor using pdfjs-dist with Y-coordinate line break detection
async function extractTextFromPDF(file) {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    const version = pdfjsLib.version || '3.11.174'
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const content = await page.getTextContent()
      let lastY = null
      let pageText = ''

      for (const item of content.items) {
        if (!item.str) continue
        const currentY = item.transform ? item.transform[5] : null
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 6) {
          pageText += '\n'
        } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
          pageText += ' '
        }
        pageText += item.str
        if (currentY !== null) lastY = currentY
      }
      fullText += pageText + '\n'
    }
    return fullText
  } catch (err) {
    console.error('PDF text extraction error:', err)
    return ''
  }
}

export default function UploadCVTab({ user, onUploadSuccess, onOpenWizard }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [detectedField, setDetectedField] = useState(null)
  const [activeProvider, setActiveProvider] = useState('')
  const [parseError, setParseError] = useState('')
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('')

  // Current Stored Profile State
  const [currentProfile, setCurrentProfile] = useState(null)
  const [cvPublicUrl, setCvPublicUrl] = useState('')
  const [showTextModal, setShowTextModal] = useState(false)

  // Load current candidate profile details from Supabase DB
  useEffect(() => {
    async function loadCandidateCurrentProfile() {
      if (!user || !supabase) return
      try {
        const { data: profile } = await supabase
          .from('candidates_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setCurrentProfile(profile)
          if (profile.cv_file_path) {
            const { data: publicUrlData } = supabase.storage.from('cvs').getPublicUrl(profile.cv_file_path)
            if (publicUrlData?.publicUrl) {
              setCvPublicUrl(publicUrlData.publicUrl)
            }
          }
        }
      } catch (err) {
        console.log('Current profile load notice:', err)
      }
    }
    loadCandidateCurrentProfile()
  }, [user])

  const handleComplete = async (e) => {
    e.preventDefault()
    setLoading(true)
    setParseError('')
    setUploadSuccessMsg('')

    try {
      if (!user) {
        setParseError('Please log in to upload your CV.')
        setLoading(false)
        return
      }

      if (!file) {
        setParseError('Please choose a PDF resume file.')
        setLoading(false)
        return
      }

      // 1. Threat Scan
      setStatusText('Scanning file security & threats...')
      const scanResult = await scanPDFForThreats(file)
      if (!scanResult.safe) {
        setParseError(`Security Block: ${scanResult.warnings.join(', ')}.`)
        setLoading(false)
        return
      }

      // 2. Text Extraction
      setStatusText('Extracting document text with Y-coordinate layout...')
      let resumeText = ''
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        resumeText = await extractTextFromPDF(file)
      } else {
        resumeText = await file.text()
      }

      // 3. AI Multi-LLM Analysis API Call
      setStatusText('Running AI Multi-LLM Failover Engine...')
      const aiRes = await fetch('/candidate-panel/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      })

      let aiPayload = {}
      let providerName = 'Built-in AI Parser'

      if (aiRes.ok) {
        const aiJson = await aiRes.json()
        if (aiJson.success && aiJson.data) {
          aiPayload = aiJson.data
          providerName = aiJson.provider || 'AI Engine'
          setActiveProvider(providerName)
          setDetectedField(aiPayload.recommendedDomain || aiPayload.title || classifyText(resumeText))
        }
      }

      // 4. File Vault Storage
      setStatusText('Saving resume to secure vault...')
      let filePath = ''
      try {
        filePath = `${user.id}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage.from('cvs').upload(filePath, file)
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('cvs').getPublicUrl(filePath)
          if (publicUrlData?.publicUrl) setCvPublicUrl(publicUrlData.publicUrl)
        } else {
          console.log('Storage upload notice:', uploadError.message)
        }
      } catch (stErr) {
        console.log('Storage bucket upload notice (create cvs bucket in Supabase):', stErr)
      }

      // 5. Save Full Candidate Profile to DB
      setStatusText('Updating complete candidate profile...')
      const fieldToSave = aiPayload.recommendedDomain || aiPayload.title || classifyText(resumeText)

      const profilePayload = {
        id: user.id,
        email: user.email,
        full_name: aiPayload.fullName || user?.user_metadata?.full_name || 'Candidate User',
        title: aiPayload.title || 'Software Professional',
        phone: aiPayload.phone || '',
        location: aiPayload.location || '',
        bio: aiPayload.bio || '',
        skills: aiPayload.skills || [],
        projects: aiPayload.projects || [],
        certifications: aiPayload.certifications || [],
        experience: aiPayload.experience || [],
        education: aiPayload.education || [],
        github_url: aiPayload.github_url || '',
        linkedin_url: aiPayload.linkedin_url || '',
        portfolio_url: aiPayload.portfolio_url || '',
        resume_field: fieldToSave,
        resume_text: resumeText.slice(0, 8000),
        llm_parsed_json: aiPayload,
        active_llm_provider: providerName,
        cv_file_path: filePath,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      }

      await supabase.from('candidates_profiles').upsert(profilePayload)
      setCurrentProfile(profilePayload)

      setLoading(false)
      setUploadSuccessMsg(`CV successfully analyzed via ${providerName} and profile saved!`)
      if (onUploadSuccess) onUploadSuccess(fieldToSave)
    } catch (err) {
      console.error(err)
      setParseError('Failed to parse PDF resume. Please ensure it is a valid PDF file.')
      setLoading(false)
    }
  }

  const handleOpenCurrentCV = () => {
    if (cvPublicUrl) {
      window.open(cvPublicUrl, '_blank')
    } else if (currentProfile?.resume_text) {
      setShowTextModal(true)
    } else {
      alert('No CV file found in storage.')
    }
  }

  return (
    <div className="tab-container" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Stored Resume Quick Bar */}
      {currentProfile && (
        <div className="dashboard-card" style={{ background: '#ffffff', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Active Resume: {currentProfile.full_name || 'Candidate CV'}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Field: <strong>{currentProfile.resume_field || currentProfile.title || 'Tech'}</strong></span>
                  {currentProfile.active_llm_provider && (
                    <span style={{ color: '#059669', fontWeight: '600' }}>• {currentProfile.active_llm_provider}</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={handleOpenCurrentCV}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
              >
                <Eye size={14} /> View Current CV
              </button>
              {onOpenWizard && (
                <button 
                  type="button" 
                  onClick={() => onOpenWizard()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                >
                  <Sparkles size={14} /> Open Full Wizard
                </button>
              )}
            </div>
          </div>

          {/* Social Accounts Quick Badges */}
          {(currentProfile.github_url || currentProfile.linkedin_url || currentProfile.portfolio_url) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px' }}>
              {currentProfile.github_url && (
                <a href={`https://${currentProfile.github_url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#334155', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                  <Github size={13} color="#2563eb" /> {currentProfile.github_url}
                </a>
              )}
              {currentProfile.linkedin_url && (
                <a href={`https://${currentProfile.linkedin_url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#334155', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                  <Linkedin size={13} color="#2563eb" /> {currentProfile.linkedin_url}
                </a>
              )}
              {currentProfile.portfolio_url && (
                <a href={`https://${currentProfile.portfolio_url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#334155', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                  <Globe size={13} color="#2563eb" /> {currentProfile.portfolio_url}
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Upload / Re-Upload CV Card */}
      <div className="dashboard-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileUp size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {currentProfile ? 'Re-Upload & Update Resume' : 'Resume AI Parsing & Security Vault'}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Upload your PDF CV for automated multi-LLM field extraction & malware scanning.</p>
          </div>
        </div>

        <form onSubmit={handleComplete}>
          <div className="input-group">
            <label>Select PDF Resume</label>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            {statusText && <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '6px', fontWeight: '500' }}>{statusText}</div>}
          </div>

          {detectedField && !loading && (
            <div style={{ fontSize: '0.875rem', color: '#047857', background: '#ecfdf5', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} />
              Domain Field: <strong>{detectedField}</strong> {activeProvider && `(${activeProvider})`}
            </div>
          )}

          {uploadSuccessMsg && (
            <div style={{ fontSize: '0.875rem', color: '#047857', background: '#ecfdf5', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #a7f3d0' }}>
              {uploadSuccessMsg}
            </div>
          )}

          {parseError && (
            <div className="error-text">
              <AlertTriangle size={15} style={{ marginRight: 6 }} /> {parseError}
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? statusText || 'Processing...' : 'Analyze Resume & Save Profile'}
          </button>
        </form>
      </div>

      {/* Text Modal Preview if PDF viewer is unavailable */}
      {showTextModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '600px', width: '100%', padding: '24px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', pb: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Extracted Resume Text</h3>
              <button onClick={() => setShowTextModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '16px', borderRadius: '10px', fontSize: '12.5px', fontFamily: 'monospace', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {currentProfile?.resume_text || 'No raw text stored.'}
            </div>
            <div style={{ display: 'flex', justifyEnd: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setShowTextModal(false)} className="btn-secondary">Close Preview</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
