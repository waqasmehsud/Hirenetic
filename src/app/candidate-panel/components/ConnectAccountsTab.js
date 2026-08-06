'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link2, Github, Linkedin, Globe, CheckCircle, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react'

export default function ConnectAccountsTab({ user, onSaved }) {
  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [portfolio, setPortfolio] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function loadCurrentLinks() {
      if (!user || !supabase) return
      try {
        const { data } = await supabase
          .from('candidates_profiles')
          .select('github_url, linkedin_url, portfolio_url')
          .eq('id', user.id)
          .single()

        if (data) {
          setGithub(data.github_url || '')
          setLinkedin(data.linkedin_url || '')
          setPortfolio(data.portfolio_url || '')
        }
      } catch (err) {
        console.log('Web presence fetch notice:', err)
      }
    }
    loadCurrentLinks()
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (!user) {
      setErrorMsg('You need to be logged in to save links.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('candidates_profiles')
        .update({
          github_url: github.trim(),
          linkedin_url: linkedin.trim(),
          portfolio_url: portfolio.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        setErrorMsg(`Couldn't save links: ${error.message}`)
      } else {
        setSuccessMsg('Web presence & social accounts saved successfully!')
        if (onSaved) onSaved()
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('An error occurred while saving your social links.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tab-container" style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Main Card */}
      <div className="dashboard-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(37,99,235,0.12)' }}>
            <Link2 size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Web Presence & Social Links</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, marginTop: '2px' }}>Connect external developer accounts so recruiters can verify your code repositories & work.</p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* GitHub Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Github size={16} color="#2563eb" /> GitHub Profile
              </label>
              {github ? (
                <a href={`https://${github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 3 }}>
                  Test Link <ExternalLink size={12} />
                </a>
              ) : (
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Not Connected</span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. github.com/waqasmehsud"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13.5px', outline: 'none', transition: 'all 0.15s ease' }}
            />
          </div>

          {/* LinkedIn Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Linkedin size={16} color="#2563eb" /> LinkedIn Profile
              </label>
              {linkedin ? (
                <a href={`https://${linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 3 }}>
                  Test Link <ExternalLink size={12} />
                </a>
              ) : (
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Not Connected</span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. linkedin.com/in/waqas-khan"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13.5px', outline: 'none', transition: 'all 0.15s ease' }}
            />
          </div>

          {/* Portfolio Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} color="#2563eb" /> Personal Portfolio / Website
              </label>
              {portfolio ? (
                <a href={`https://${portfolio.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 3 }}>
                  Test Link <ExternalLink size={12} />
                </a>
              ) : (
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Not Connected</span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. waqasmehsud.dev"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13.5px', outline: 'none', transition: 'all 0.15s ease' }}
            />
          </div>

          {successMsg && (
            <div style={{ fontSize: '13px', color: '#047857', background: '#ecfdf5', padding: '12px 16px', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ fontSize: '13px', color: '#b91c1c', background: '#fef2f2', padding: '12px 16px', borderRadius: '10px', border: '1px solid #fecaca' }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
              transition: 'all 0.15s ease'
            }}
          >
            {loading ? 'Saving Web Presence...' : 'Save Web Presence Links'}
          </button>
        </form>
      </div>

    </div>
  )
}
