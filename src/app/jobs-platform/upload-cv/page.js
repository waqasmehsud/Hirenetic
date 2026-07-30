'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabaseClient'
import { classifyText } from '../fieldClassifier'
import { scanPDFForThreats } from '../cvSecurityScan'

async function extractTextFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist')
  const version = pdfjsLib.version || '3.11.174'
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    fullText += content.items.map((item) => item.str).join(' ') + '\n'
  }
  return fullText
}

export default function UploadCVPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [detectedField, setDetectedField] = useState(null)
  const [parseError, setParseError] = useState('')

  const handleComplete = async (e) => {
    e.preventDefault()
    setLoading(true)
    setParseError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setParseError('You need to be logged in to upload a CV.')
        setLoading(false)
        return
      }

      if (!file) {
        setParseError('Please choose a PDF file.')
        setLoading(false)
        return
      }

      setStatusText('Checking file safety...')
      const scanResult = await scanPDFForThreats(file)
      if (!scanResult.safe) {
        setParseError(`This file was blocked for safety: ${scanResult.warnings.join(', ')}.`)
        setLoading(false)
        return
      }

      setStatusText('Reading your CV...')
      const resumeText = await extractTextFromPDF(file)
      const resumeField = classifyText(resumeText)
      setDetectedField(resumeField)

      setStatusText('Uploading your CV file...')
      const filePath = `${user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage.from('cvs').upload(filePath, file)
      if (uploadError) {
        setParseError(`Couldn't upload your CV file: ${uploadError.message}`)
        setLoading(false)
        return
      }

      setStatusText('Saving your profile...')
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          resume_text: resumeText.slice(0, 8000),
          resume_field: resumeField,
          cv_file_path: filePath,
        })
        .eq('id', user.id)

      if (updateError) {
        setParseError(`Couldn't save your profile: ${updateError.message}`)
        setLoading(false)
        return
      }

      setLoading(false)
      router.push('/jobs-platform/connect-accounts')
    } catch (err) {
      console.error(err)
      setParseError('Something went wrong reading that PDF.')
      setLoading(false)
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
          <h1>AI-Powered Career Matching.</h1>
          <p>We read your CV to match you with the right local and remote jobs and internships.</p>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-card-modern">
          <h2>Upload your CV</h2>
          <p className="subtitle">PDF only for now — we'll read it and detect your field automatically.</p>

          <form onSubmit={handleComplete}>
            <div className="input-group">
              <label>Upload CV (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required />
              {statusText && <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '4px' }}>{statusText}</div>}
            </div>

            {detectedField && !loading && (
              <div style={{ fontSize: '0.85rem', color: '#2563eb', marginBottom: '1rem' }}>
                Detected field: <strong>{detectedField}</strong>
              </div>
            )}

            {parseError && <div className="error-text">{parseError}</div>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? statusText || 'Working...' : 'Analyze CV & View Matched Jobs'}
            </button>
          </form>

          <div className="auth-footer-link">
            <button type="button" onClick={() => router.push('/jobs-platform/dashboard?matched=false')}>
              Skip for now → Browse all jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}