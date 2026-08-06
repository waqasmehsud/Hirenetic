'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { FIELDS } from '../fieldClassifier'
import { Target, CheckCircle, Shield, Code, Server, Cloud, Cpu, BarChart2, Briefcase, Check } from 'lucide-react'

const DOMAIN_CARDS = [
  { id: FIELDS.CYBERSECURITY || 'Cybersecurity', name: 'Cybersecurity & Blue Team', desc: 'SOC operations, Snort rules, threat detection & incident response.', icon: Shield, color: '#2563eb' },
  { id: FIELDS.FRONTEND || 'Frontend Development', name: 'Frontend Web Engineering', desc: 'React, Next.js, UI/UX components & modern JavaScript.', icon: Code, color: '#0284c7' },
  { id: FIELDS.BACKEND || 'Backend Development', name: 'Backend & Systems Architecture', desc: 'Node.js, Python, PostgreSQL databases, REST & gRPC APIs.', icon: Server, color: '#7c3aed' },
  { id: FIELDS.CLOUD_DEVOPS || 'Cloud / DevOps', name: 'Cloud Infrastructure & DevOps', desc: 'AWS, Docker containers, Kubernetes, CI/CD & Terraform.', icon: Cloud, color: '#059669' },
  { id: FIELDS.AI_ML || 'AI / ML Engineering', name: 'AI, LLMs & Machine Learning', desc: 'PyTorch, Gemini & OpenAI APIs, RAG pipelines & NLP models.', icon: Cpu, color: '#d97706' },
  { id: FIELDS.DATA_SCIENCE || 'Data Science', name: 'Data Science & Analytics', desc: 'Data pipelines, SQL, Pandas, business intelligence & visualization.', icon: BarChart2, color: '#dc2626' }
]

export default function InterestsTab({ user, onSaved }) {
  const [selectedField, setSelectedField] = useState(DOMAIN_CARDS[0].id)
  const [jobType, setJobType] = useState('Both')
  const [workEnv, setWorkEnv] = useState('all')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function loadInterests() {
      if (!user || !supabase) return
      try {
        const { data } = await supabase
          .from('candidates_profiles')
          .select('resume_field, preferred_job_type, interests')
          .eq('id', user.id)
          .single()

        if (data) {
          if (data.resume_field) setSelectedField(data.resume_field)
          if (data.preferred_job_type) setJobType(data.preferred_job_type)
        }
      } catch (err) {
        console.log('Interests fetch notice:', err)
      }
    }
    loadInterests()
  }, [user])

  const handleSaveInterests = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (!user) {
      setErrorMsg('You need to be logged in to save preferences.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('candidates_profiles')
        .update({
          resume_field: selectedField,
          interests: [selectedField],
          preferred_job_type: jobType,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        setErrorMsg(`Couldn't save preferences: ${error.message}`)
      } else {
        setSuccessMsg('Career field & job matching preferences updated!')
        if (onSaved) onSaved()
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('An error occurred while saving your preferences.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tab-container" style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div className="dashboard-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(37,99,235,0.12)' }}>
            <Target size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Target Career Field & Preferences</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, marginTop: '2px' }}>Customize your primary domain to filter live AI-matched job opportunities.</p>
          </div>
        </div>

        <form onSubmit={handleSaveInterests} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Visual Domain Grid Cards */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '12px' }}>
              Select Primary Career Domain
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
              {DOMAIN_CARDS.map((card) => {
                const Icon = card.icon
                const isSelected = selectedField.toLowerCase().includes(card.id.toLowerCase()) || card.id.toLowerCase().includes(selectedField.toLowerCase())

                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedField(card.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${card.color}` : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: isSelected ? `${card.color}15` : '#f1f5f9', color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} />
                      </div>
                      {isSelected && (
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: card.color, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                      {card.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
                      {card.desc}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Preferences Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Employment Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13.5px', color: '#0f172a', outline: 'none' }}
              >
                <option value="Both">Both Jobs & Internships</option>
                <option value="Internship">Cybersecurity / Tech Internships Only</option>
                <option value="Full-time">Full-Time Positions Only</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Location Preference
              </label>
              <select
                value={workEnv}
                onChange={(e) => setWorkEnv(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13.5px', color: '#0f172a', outline: 'none' }}
              >
                <option value="all">All Locations (PK & Global)</option>
                <option value="pk">🇵🇰 Pakistan Roles Only</option>
                <option value="remote">🌍 Global & Remote Only</option>
              </select>
            </div>
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
            {loading ? 'Saving Preferences...' : 'Update Career Preferences'}
          </button>

        </form>
      </div>

    </div>
  )
}
