'use client'

import React, { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { BRAND_CONFIG } from '@/theme/branding.config'
import { Sparkles, LayoutDashboard, Link2, Target, LogOut, Code2, Eye, FileText, X, Menu, ShieldCheck } from 'lucide-react'

export default function CandidateTopbar({ activeTab, setActiveTab, userEmail, candidateProfile, onLogout, onOpenWizard }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const dropdownRef = useRef(null)

  const displayName = candidateProfile?.full_name || userEmail?.split('@')[0] || 'Candidate'
  const displayTitle = candidateProfile?.title || 'Cybersecurity / Software Professional'
  const email = candidateProfile?.email || userEmail || ''
  const activeLlm = candidateProfile?.active_llm_provider || ''
  const resumeFilePath = candidateProfile?.cv_file_path || ''
  const resumeText = candidateProfile?.resume_text || ''

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleViewResume = () => {
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
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

  const handleNavClick = (tab) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 16px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        
        {/* Left: Brand & Logo */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} 
          onClick={() => handleNavClick('dashboard')}
        >
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color: '#ffffff',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37,99,235,0.2)'
          }}>
            <Code2 size={20} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--brand-text-main)', letterSpacing: '-0.02em' }}>
              {BRAND_CONFIG.companyName}
            </span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--brand-primary)', backgroundColor: 'var(--brand-primary-light)', border: '1px solid var(--brand-primary-border)', padding: '1px 6px', borderRadius: '10px' }}>
              AI Portal
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links (Hidden on Mobile) */}
        <nav className="desktop-only" style={{ alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleNavClick('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'dashboard' ? '#eff6ff' : 'transparent',
              color: activeTab === 'dashboard' ? '#2563eb' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutDashboard size={16} />
            <span>Matched Jobs</span>
          </button>

          <button
            onClick={() => handleNavClick('verification')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'verification' ? '#eff6ff' : 'transparent',
              color: activeTab === 'verification' ? '#2563eb' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={16} />
            <span>Verification</span>
          </button>

          <button
            onClick={() => handleNavClick('connect-accounts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'connect-accounts' ? '#eff6ff' : 'transparent',
              color: activeTab === 'connect-accounts' ? '#2563eb' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <Link2 size={16} />
            <span>Web Presence</span>
          </button>

          <button
            onClick={() => handleNavClick('interests')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'interests' ? '#eff6ff' : 'transparent',
              color: activeTab === 'interests' ? '#2563eb' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <Target size={16} />
            <span>Career Preferences</span>
          </button>
        </nav>

        {/* Right: Active AI Badge, Avatar & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeLlm && (
            <span className="desktop-only" style={{ fontSize: '11px', fontWeight: '600', color: '#047857', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3.5px 9px', borderRadius: '8px', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> {activeLlm}
            </span>
          )}

          {/* User Avatar Menu Dropdown Trigger */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px',
                borderRadius: '50%',
                border: isDropdownOpen ? '2px solid #2563eb' : '2px solid transparent',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
              title="Account Menu"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e293b, #334155)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '14px',
                position: 'relative'
              }}>
                {displayName.charAt(0).toUpperCase()}
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '9px',
                  height: '9px',
                  backgroundColor: '#10b981',
                  border: '2px solid #ffffff',
                  borderRadius: '50%'
                }}></span>
              </div>
            </button>

            {/* Desktop & Mobile Avatar Dropdown */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '260px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                padding: '8px 0',
                zIndex: 100
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', lineHeight: 1.2 }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: '600', marginTop: '2px' }}>
                    {displayTitle}
                  </div>
                  {email && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {email}
                    </div>
                  )}
                </div>

                <div style={{ padding: '6px' }}>
                  <button
                    onClick={handleViewResume}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', fontSize: '13px', color: '#334155', border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <Eye size={15} color="#2563eb" /> View Current Resume
                  </button>

                  {onOpenWizard && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        onOpenWizard()
                      }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', fontSize: '13px', color: '#334155', border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <Sparkles size={15} color="#2563eb" /> Update Profile & Resume
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      handleNavClick('connect-accounts')
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', fontSize: '13px', color: '#334155', border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <Link2 size={15} color="#64748b" /> Web Presence & Links
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      handleNavClick('interests')
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', fontSize: '13px', color: '#334155', border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <Target size={15} color="#64748b" /> Career Preferences
                  </button>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '4px', paddingTop: '4px', padding: '0 6px 4px 6px' }}>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      if (onLogout) onLogout()
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', fontSize: '13px', fontWeight: '600', color: '#ef4444', border: 'none', background: '#fef2f2', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle Icon (Visible on Mobile only) */}
          <button
            className="mobile-only"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              padding: '6px',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Sheet Menu (Visible when Mobile Hamburger is tapped) */}
      {isMobileMenuOpen && (
        <div className="mobile-only" style={{
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 16px',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <button
            onClick={() => handleNavClick('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: activeTab === 'dashboard' ? '#eff6ff' : 'transparent',
              color: activeTab === 'dashboard' ? '#2563eb' : '#334155',
              textAlign: 'left'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Matched Jobs Feed</span>
          </button>

          <button
            onClick={() => handleNavClick('verification')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: activeTab === 'verification' ? '#eff6ff' : 'transparent',
              color: activeTab === 'verification' ? '#2563eb' : '#334155',
              textAlign: 'left'
            }}
          >
            <ShieldCheck size={18} />
            <span>Verification</span>
          </button>

          <button
            onClick={() => handleNavClick('connect-accounts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: activeTab === 'connect-accounts' ? '#eff6ff' : 'transparent',
              color: activeTab === 'connect-accounts' ? '#2563eb' : '#334155',
              textAlign: 'left'
            }}
          >
            <Link2 size={18} />
            <span>Web Presence & Links</span>
          </button>

          <button
            onClick={() => handleNavClick('interests')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: activeTab === 'interests' ? '#eff6ff' : 'transparent',
              color: activeTab === 'interests' ? '#2563eb' : '#334155',
              textAlign: 'left'
            }}
          >
            <Target size={18} />
            <span>Career Preferences</span>
          </button>

          {onOpenWizard && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                onOpenWizard()
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                textAlign: 'left',
                marginTop: '4px'
              }}
            >
              <Sparkles size={18} />
              <span>Update Profile & Resume</span>
            </button>
          )}
        </div>
      )}

      {/* Resume Preview Text Modal */}
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

    </header>
  )
}
