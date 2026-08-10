'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'
import './candidate-panel.css'

import OnboardingWizard from './components/OnboardingWizard'
import CandidateTopbar from './components/CandidateTopbar'
import DashboardTab from './components/DashboardTab'
import UploadCVTab from './components/UploadCVTab'
import ConnectAccountsTab from './components/ConnectAccountsTab'
import InterestsTab from './components/InterestsTab'
import VerificationTab from './components/VerificationTab'

export default function CandidatePanelPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [candidateProfile, setCandidateProfile] = useState(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(true)

  // Job Data & Filters State
  const [rawJobs, setRawJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [matchField, setMatchField] = useState(null)
  const [region, setRegion] = useState('all')
  const [dynamicLlmProvider, setDynamicLlmProvider] = useState(null)

  // 1. Auth Guard & Full Candidate Profile Fetch
  useEffect(() => {
    async function verifyCandidateAuth() {
      if (!supabase) {
        router.replace('/candidate-panel/login')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.replace('/candidate-panel/login')
        return
      }

      setUser(session.user)

      // Fetch complete candidate profile details
      try {
        const { data: profile } = await supabase
          .from('candidates_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setCandidateProfile(profile)
          if (profile.resume_field) {
            setMatchField(profile.resume_field)
          }

          // If candidate completed onboarding or uploaded CV previously, skip wizard directly to dashboard
          if (profile.onboarding_completed || profile.cv_file_path || profile.resume_text) {
            setShowOnboarding(false)
          } else {
            setShowOnboarding(true)
          }
        } else {
          setShowOnboarding(true)
        }
      } catch (err) {
        console.log('Profile verification notice:', err)
        setShowOnboarding(false)
      } finally {
        setIsAuthChecking(false)
      }
    }

    verifyCandidateAuth()
  }, [router])

  // 2. Fetch Jobs Feed
  useEffect(() => {
    async function fetchJobs() {
      if (isAuthChecking) return
      setLoadingJobs(true)
      try {
        const res = await fetch('/candidate-panel/api/jobs')
        if (res.ok) {
          const jobsData = await res.json()
          if (Array.isArray(jobsData)) {
            setRawJobs(jobsData)
          }
        }
      } catch (err) {
        console.error('API jobs fetch notice:', err)
      } finally {
        setLoadingJobs(false)
      }
    }

    fetchJobs()
  }, [isAuthChecking])

  const handleLogout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch (e) {}
    }
    router.replace('/candidate-panel/login')
  }

  const handleProfileUpdate = (updatedField) => {
    if (updatedField) setMatchField(updatedField)
    // Refresh profile state
    if (supabase && user?.id) {
      supabase.from('candidates_profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) setCandidateProfile(data)
      })
    }
  }

  if (isAuthChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: '#f8fafc', color: '#64748b' }}>
        <div style={{ textAlign: 'center', margin: 'auto' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Loading Candidate Portal...</div>
          <div style={{ fontSize: '13px' }}>Verifying account authentication & profile data.</div>
        </div>
      </div>
    )
  }

  // If candidate has not completed onboarding, render 3-Step Onboarding Wizard
  if (showOnboarding) {
    return (
      <OnboardingWizard
        user={user}
        onComplete={() => {
          setShowOnboarding(false)
          handleProfileUpdate()
        }}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Navigation Bar with Hirenetic Branding & Tabs */}
      <CandidateTopbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={user?.email}
        candidateProfile={candidateProfile}
        dynamicLlmProvider={dynamicLlmProvider}
        onLogout={handleLogout}
        onOpenWizard={() => setShowOnboarding(true)}
      />

      {/* Dynamic Full-Width Tab Body Content */}
      <main style={{ padding: '28px 24px', maxWidth: '1280px', width: '100%', margin: '0 auto', flex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardTab
            rawJobs={rawJobs}
            loading={loadingJobs}
            matchField={matchField}
            region={region}
            setRegion={setRegion}
            isMatchedMode={Boolean(matchField)}
            candidateProfile={candidateProfile}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenWizard={() => setShowOnboarding(true)}
            onLlmProviderUpdate={setDynamicLlmProvider}
          />
        )}

        {activeTab === 'upload-cv' && (
          <UploadCVTab
            user={user}
            onOpenWizard={() => setShowOnboarding(true)}
            onUploadSuccess={(field) => {
              handleProfileUpdate(field)
              setActiveTab('dashboard')
            }}
          />
        )}

        {activeTab === 'verification' && (
          <VerificationTab
            candidateProfile={candidateProfile}
            onRefreshProfile={handleProfileUpdate}
          />
        )}

        {activeTab === 'connect-accounts' && (
          <ConnectAccountsTab
            user={user}
            onSaved={() => {
              handleProfileUpdate()
              setActiveTab('dashboard')
            }}
          />
        )}

        {activeTab === 'interests' && (
          <InterestsTab
            user={user}
            onSaved={() => {
              handleProfileUpdate()
              setActiveTab('dashboard')
            }}
          />
        )}
      </main>
    </div>
  )
}
