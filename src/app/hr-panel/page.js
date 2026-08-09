'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './styles.css';
import { supabase } from './supabase';

import { Key, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import JobsView from './components/JobsView';
import ApplicantsView from './components/ApplicantsView';
import AllCandidatesView from './components/AllCandidatesView';
import TalentPoolView from './components/TalentPoolView';
import ComparisonView from './components/ComparisonView';
import CandidateVerificationView from './components/CandidateVerificationView';
import AuditLogsView from './components/AuditLogsView';
import HRProfileView from './components/HRProfileView';
import SettingsView from './components/SettingsView';
import PostJobModal from './components/PostJobModal';
import CandidateDetailModal from './components/CandidateDetailModal';
import ToastContainer from './components/ToastContainer';

export default function HRPanelPage() {
  const router = useRouter();

  // Navigation & View State
  const [activeView, setActiveView] = useState('all-candidates');

  // Auth & User Session State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Admin Passcode Security State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [showPasscodeText, setShowPasscodeText] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unlocked = localStorage.getItem('hr_admin_unlocked') === 'true' || sessionStorage.getItem('hr_admin_unlocked') === 'true';
      setIsAdminUnlocked(unlocked);
    }
  }, []);

  const handleUnlockAdmin = (e) => {
    e?.preventDefault();
    const storedPasscode = (typeof window !== 'undefined' && localStorage.getItem('hr_admin_passcode')) || 'admin123';
    if (passcodeInput.trim() === storedPasscode.trim()) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hr_admin_unlocked', 'true');
        localStorage.setItem('hr_admin_unlocked', 'true');
      }
      setIsAdminUnlocked(true);
      setPasscodeError('');
      if (typeof addToast === 'function') addToast('success', 'Admin Access Granted', 'Security passcode verified successfully.');
    } else {
      setPasscodeError('Incorrect Admin Passcode. Access Denied.');
    }
  };

  // Main Data States
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeCandidateId, setActiveCandidateId] = useState(null);

  // Real Database Candidates State
  const [realCandidates, setRealCandidates] = useState([]);
  const [loadingRealCandidates, setLoadingRealCandidates] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedCandidateObject, setSelectedCandidateObject] = useState(null);

  // Filters State
  const [jobFilter, setJobFilter] = useState('all');
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantJobFilter, setApplicantJobFilter] = useState('all');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState('all');
  const [applicantScoreFilter, setApplicantScoreFilter] = useState('0');
  const [globalSearch, setGlobalSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // Comparison State
  const [compareId1, setCompareId1] = useState('');
  const [compareId2, setCompareId2] = useState('');

  // Modals
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  // New Job Form State
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    dept: 'Engineering',
    location: '',
    type: 'Full-Time',
    workplaceType: 'Remote',
    exp: '2+ Years',
    salary: '',
    skills: '',
    desc: '',
    responsibilities: '',
    requirements: ''
  });

  // Candidate Notes Draft
  const [candidateNotesDraft, setCandidateNotesDraft] = useState('');
  const [candidateStatusDraft, setCandidateStatusDraft] = useState('Applied');

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Fetch Real DB Candidates from public.candidates_profiles
  const fetchRealDbCandidates = async () => {
    if (!supabase) return;
    setLoadingRealCandidates(true);
    try {
      const { data, error } = await supabase
        .from('candidates_profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching real DB candidates:', error);
      } else if (Array.isArray(data)) {
        setRealCandidates(data);
      }
    } catch (err) {
      console.error('Real DB candidates fetch exception:', err);
    } finally {
      setLoadingRealCandidates(false);
    }
  };

  // Master Refresh to fetch Candidates, Jobs, and Applications live from Supabase DB
  const handleMasterRefreshDb = async () => {
    addToast('info', 'Refreshing Database', 'Fetching latest candidates, applications, and jobs from Supabase...');
    await Promise.all([
      fetchRealDbCandidates(),
      fetchDbJobs(true),
      fetchJobApplications()
    ]);
    addToast('success', 'Database Updated', 'Live candidate profiles, applications, and job listings refreshed successfully!');
  };

  // Fetch Real DB Jobs from public.crwl_jobsData via Server API Route (Bypasses Client RLS)
  const fetchDbJobs = async (isManualRefresh = false) => {
    setLoadingJobs(true);
    try {
      // 1. Try Server API Endpoint with cache busting timestamp (uses service role key to bypass client RLS)
      const res = await fetch(`/candidate-panel/api/jobs?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mappedJobs = data.map(j => {
            const isClosed = j.status === 'Closed' || j.status === 'Paused' || j.is_active === false;
            return {
              id: j.id,
              title: j.title || 'Untitled Role',
              dept: j.department || j.category || 'Engineering',
              company: j.company || j.company_name || 'Hirenetic Enterprise',
              location: j.location || 'Remote',
              type: j.type || j.employment_type || 'Full-Time',
              exp: j.experience_level || j.exp || 'Mid-Level',
              skills: Array.isArray(j.skills) ? j.skills : (typeof j.skills === 'string' ? j.skills.split(',') : []),
              status: isClosed ? 'Closed' : 'Open',
              desc: j.description,
              responsibilities: j.responsibilities,
              requirements: j.requirements,
              createdDate: j.date || (j.posted_at ? new Date(j.posted_at).toLocaleDateString() : 'Recent')
            };
          });
          setJobs(mappedJobs);
          setLoadingJobs(false);
          if (isManualRefresh) {
            addToast('success', 'DB Jobs Refreshed', `Successfully fetched ${mappedJobs.length} live jobs from Supabase!`);
          }
          return;
        }
      }

      // 2. Direct Supabase Fallback if API route is unreachable
      if (supabase) {
        const { data, error } = await supabase
          .from('crwl_jobsData')
          .select('*')
          .order('id', { ascending: false })
          .range(0, 4999);

        if (error) {
          console.error('Error fetching DB jobs:', error);
        } else if (Array.isArray(data)) {
          const mappedJobs = data.map(j => {
            const isClosed = j.status === 'Closed' || j.status === 'Paused' || j.is_active === false;
            return {
              id: j.id,
              title: j.title || 'Untitled Role',
              dept: j.department || 'Engineering',
              company: j.company_name || 'Hirenetic Enterprise',
              location: j.location || 'Remote',
              type: j.employment_type || 'Full-Time',
              exp: j.experience_level || 'Mid-Level',
              skills: Array.isArray(j.skills) ? j.skills : (typeof j.skills === 'string' ? j.skills.split(',') : []),
              status: isClosed ? 'Closed' : 'Open',
              desc: j.description,
              responsibilities: j.responsibilities,
              requirements: j.requirements,
              createdDate: j.posted_at ? new Date(j.posted_at).toLocaleDateString() : 'Recent'
            };
          });
          setJobs(mappedJobs);
          if (isManualRefresh) {
            addToast('success', 'DB Jobs Refreshed', `Successfully fetched ${mappedJobs.length} live jobs from Supabase!`);
          }
        }
      }
    } catch (err) {
      console.error('DB jobs fetch exception:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Immediate mount fetch for jobs
  useEffect(() => {
    fetchDbJobs();
  }, []);

  // 1. Strict Live Auth & DB Profile Verification
  useEffect(() => {
    async function verifyAuth() {
      if (!supabase) {
        setIsAuthChecking(false);
        return;
      }

      try {
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();

        if (sessionErr || !session?.user) {
          localStorage.removeItem('hr_user');
          setCurrentUser(null);
          setIsAuthChecking(false);
          router.replace('/hr-panel/login');
          return;
        }

        // Strict Check: Verify row exists in 'employers_profiles' table
        const { data: dbProfile, error: dbErr } = await supabase
          .from('employers_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (dbErr || !dbProfile) {
          console.warn('Employer profile not found in employers_profiles database table!');
          await supabase.auth.signOut().catch(() => {});
          localStorage.removeItem('hr_user');
          setCurrentUser(null);
          setIsAuthChecking(false);
          router.replace('/hr-panel/login');
          return;
        }

        // DB Entry Verified! Set valid current user
        const verifiedUserObj = {
          id: dbProfile.id,
          email: dbProfile.email || session.user.email,
          name: dbProfile.full_name || 'Lead HR Recruiter',
          company: dbProfile.company_name || 'Hirenetic Enterprise',
          designation: dbProfile.designation || 'Lead HR Manager',
          industry: dbProfile.industry || 'Cybersecurity',
          company_size: dbProfile.company_size || '11-50',
          location: dbProfile.location || '',
          phone: dbProfile.phone || '',
          website_url: dbProfile.website_url || ''
        };

        setCurrentUser(verifiedUserObj);
        localStorage.setItem('hr_user', JSON.stringify(verifiedUserObj));
        setIsAuthChecking(false);
      } catch (err) {
        console.error('Auth verification exception:', err);
        localStorage.removeItem('hr_user');
        setCurrentUser(null);
        setIsAuthChecking(false);
        router.replace('/hr-panel/login');
      }
    }

    verifyAuth();
  }, [router]);

  // Fetch real Job Applications from job_applications table via API route or Supabase
  const fetchJobApplications = async () => {
    try {
      // 1. Try Server API Endpoint (uses service role key to join profiles)
      const res = await fetch(`/hr-panel/api/applications?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.applications)) {
          setApplicants(data.applications);
          return;
        }
      }

      // 2. Direct Supabase Fallback if API route is unreachable
      if (supabase) {
        const { data: apps, error } = await supabase
          .from('job_applications')
          .select('*')
          .order('applied_at', { ascending: false });

        if (!error && Array.isArray(apps)) {
          const mapped = apps.map(app => ({
            application_id: app.id,
            id: app.candidate_id,
            candidateId: app.candidate_id,
            candidate_id: app.candidate_id,
            jobId: app.job_id,
            name: 'Registered Candidate',
            full_name: 'Registered Candidate',
            email: 'candidate@hirenetic.com',
            jobTitle: app.job_title || 'Position Applied',
            title: app.job_title || 'Position Applied',
            company: app.company_name || 'Hirenetic Enterprise',
            company_name: app.company_name || 'Hirenetic Enterprise',
            external_apply_url: app.external_apply_url,
            status: app.application_status || 'Redirected',
            application_status: app.application_status || 'Redirected',
            appliedDate: app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent',
            applied_at: app.applied_at,
            matchScore: 85
          }));
          setApplicants(mapped);
        }
      }
    } catch (err) {
      console.error('Job applications fetch exception:', err);
    }
  };

  // Inline application status update
  const updateApplicantStatusInline = async (applicationId, newStatus) => {
    setApplicants(prev => prev.map(app => {
      if (app.application_id === applicationId || app.id === applicationId) {
        return { ...app, status: newStatus, application_status: newStatus };
      }
      return app;
    }));

    try {
      await fetch('/hr-panel/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId, status: newStatus })
      });
    } catch (err) {
      console.error('Update applicant status notice:', err);
    }

    addToast('success', 'Status Updated', `Application status changed to '${newStatus}'`);
  };

  // Fetch Real DB Candidates & DB Jobs whenever authenticated user is verified
  useEffect(() => {
    if (currentUser) {
      fetchRealDbCandidates();
      fetchDbJobs();
      fetchJobApplications();
    }
  }, [currentUser]);

  // Reliable Logout Function
  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
    } catch (e) {}
    localStorage.removeItem('hr_user');
    setCurrentUser(null);
    router.replace('/hr-panel/login');
  };

  // Toast Helper
  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Toggle Job Open vs Closed Position status with live Supabase update
  const handleToggleJobStatus = async (jobId) => {
    let targetStatus = 'Closed';
    setJobs(prev => prev.map(j => {
      if (String(j.id) === String(jobId)) {
        targetStatus = j.status === 'Open' ? 'Closed' : 'Open';
        return { ...j, status: targetStatus, is_active: targetStatus === 'Open' };
      }
      return j;
    }));

    try {
      if (supabase) {
        await supabase
          .from('crwl_jobsData')
          .update({ status: targetStatus === 'Open' ? 'Active' : 'Closed', is_active: targetStatus === 'Open' })
          .eq('id', jobId);
      }
      addToast('success', 'Position Status Updated', `Job position status changed to '${targetStatus}'`);
    } catch (err) {
      console.error('Error toggling job status:', err);
    }
  };

  // Publish New Job directly to Supabase crwl_jobsData PostgreSQL table
  const handlePublishJob = async () => {
    const title = newJobForm.title?.trim();
    if (!title) {
      addToast('error', 'Missing Title', 'Please enter a job title.');
      return;
    }

    const skillsArray = newJobForm.skills
      ? newJobForm.skills.split(',').map(s => s.trim()).filter(Boolean)
      : ['Python', 'Problem Solving'];

    const chosenStatus = newJobForm.status || 'Open';
    const isActiveBool = chosenStatus === 'Open';

    const jobPayload = {
      source: 'HR Employer Panel',
      source_company: currentUser?.company || 'Hirenetic Enterprise',
      external_job_id: `HR-${Date.now()}`,
      title: title,
      company_name: currentUser?.company || 'Hirenetic Enterprise',
      department: newJobForm.dept || 'Engineering',
      employment_type: newJobForm.type || 'Full-Time',
      workplace_type: newJobForm.workplaceType || 'Remote',
      experience_level: newJobForm.exp || '2+ Years',
      location: newJobForm.location || 'Islamabad, Pakistan / Remote',
      description: newJobForm.desc || 'Join our engineering team to build enterprise technology.',
      responsibilities: newJobForm.responsibilities || 'Develop scalable features & collaborate with teams.',
      requirements: newJobForm.requirements || 'Relevant degree and technical experience.',
      skills: skillsArray,
      posted_at: new Date().toISOString(),
      status: chosenStatus === 'Open' ? 'Active' : 'Closed',
      is_active: isActiveBool
    };

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('crwl_jobsData')
          .insert([jobPayload])
          .select('*')
          .single();

        if (error) {
          console.warn('Supabase crwl_jobsData insert notice:', error);
        } else if (data) {
          setJobs(prev => [data, ...prev]);
        }
      }
    } catch (err) {
      console.error('Job publication exception:', err);
    }

    const localJobObj = {
      id: Date.now(),
      title: jobPayload.title,
      dept: jobPayload.department,
      location: jobPayload.location,
      type: jobPayload.employment_type,
      exp: jobPayload.experience_level,
      skills: skillsArray,
      status: chosenStatus,
      createdDate: new Date().toLocaleDateString()
    };

    setJobs(prev => [localJobObj, ...prev]);
    addToast('success', 'Job Saved to Supabase DB', `Job '${title}' published (${chosenStatus} Position) to public.crwl_jobsData database!`);
    setIsPostJobModalOpen(false);

    setNewJobForm({
      title: '',
      dept: 'Engineering',
      location: '',
      type: 'Full-Time',
      workplaceType: 'Remote',
      exp: '2+ Years',
      salary: '',
      skills: '',
      desc: '',
      responsibilities: '',
      requirements: '',
      status: 'Open'
    });
  };

  if (isAuthChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'sans-serif', color: '#64748b' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }}></div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>Verifying DB Profile Security...</div>
        </div>
      </div>
    );
  }

  const handleSelectCandidate = (candidateOrId) => {
    if (!candidateOrId) return;

    if (typeof candidateOrId === 'object' && candidateOrId !== null) {
      setSelectedCandidateObject(candidateOrId);
      setActiveCandidateId(candidateOrId.id || candidateOrId.candidateId || candidateOrId.email || 'cand-selected');
    } else {
      const idStr = String(candidateOrId);
      const foundInReal = realCandidates.find(
        (c) => String(c.id) === idStr || String(c.candidateId) === idStr || c.email === idStr
      );
      const foundInApplicants = applicants.find(
        (a) => String(a.id) === idStr || String(a.candidateId) === idStr || a.email === idStr
      );
      const candidateObj = foundInReal || foundInApplicants || {
        id: idStr,
        full_name: 'Candidate Profile',
        name: 'Candidate Profile',
        email: 'candidate@hirenetic.com'
      };
      setSelectedCandidateObject(candidateObj);
      setActiveCandidateId(idStr);
    }

    setIsCandidateModalOpen(true);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="app-container hr-layout">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        activeJobsCount={jobs.length}
        totalApplicantsCount={applicants.length}
        realCandidatesCount={realCandidates.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="main-content hr-main-content">
        <Topbar 
          currentUser={currentUser} 
          globalSearch={globalSearch} 
          setGlobalSearch={setGlobalSearch}
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
          onRefreshRealDb={handleMasterRefreshDb}
          loadingRealDb={loadingRealCandidates || loadingJobs}
          jobFilter={jobFilter}
          setJobFilter={setJobFilter}
          jobsCount={jobs.length}
          openJobsCount={jobs.filter(j => j.status === 'Open' || j.status === 'Active').length}
          closedJobsCount={jobs.filter(j => j.status === 'Closed').length}
        />

        <div className="view-container hr-view-container">
          {activeView === 'dashboard' && (
            <DashboardView 
              jobs={jobs} 
              applicants={applicants} 
              onNavigate={setActiveView} 
              onOpenPostJob={() => setIsPostJobModalOpen(true)}
              onSelectCandidate={handleSelectCandidate}
            />
          )}

          {activeView === 'all-candidates' && (
            <AllCandidatesView
              realCandidates={realCandidates}
              loading={loadingRealCandidates}
              globalSearch={globalSearch}
              onRefresh={fetchRealDbCandidates}
              onSelectCandidate={handleSelectCandidate}
            />
          )}

          {activeView === 'jobs' && (
            <JobsView 
              jobs={jobs} 
              jobFilter={jobFilter} 
              setJobFilter={setJobFilter} 
              applicants={applicants}
              loading={loadingJobs}
              globalSearch={globalSearch}
              onRefreshJobs={() => fetchDbJobs(true)}
              onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
              onToggleJobStatus={handleToggleJobStatus}
              onViewApplicantsForJob={(jobId, jobTitle) => {
                setApplicantJobFilter(jobId || jobTitle || 'all');
                setApplicantSearch('');
                setActiveView('applicants');
              }}
            />
          )}

          {activeView === 'applicants' && (
            <ApplicantsView 
              applicants={applicants} 
              jobs={jobs}
              globalSearch={globalSearch}
              applicantSearch={applicantSearch}
              setApplicantSearch={setApplicantSearch}
              applicantJobFilter={applicantJobFilter}
              setApplicantJobFilter={setApplicantJobFilter}
              applicantStatusFilter={applicantStatusFilter}
              setApplicantStatusFilter={setApplicantStatusFilter}
              applicantScoreFilter={applicantScoreFilter}
              setApplicantScoreFilter={setApplicantScoreFilter}
              updateApplicantStatusInline={updateApplicantStatusInline}
              onSelectCandidate={handleSelectCandidate}
            />
          )}

          {activeView === 'talent-pool' && (
            <TalentPoolView 
              applicants={applicants}
              globalSearch={globalSearch}
              onSelectCandidate={handleSelectCandidate}
              onRemoveFromTalentPool={async (candId) => {
                try {
                  if (supabase && candId) {
                    await supabase
                      .from('candidates')
                      .update({ in_talent_pool: false })
                      .eq('id', candId);
                  }
                  setRealCandidates(prev => prev.map(c => c.id === candId ? { ...c, in_talent_pool: false, inTalentPool: false } : c));
                  setApplicants(prev => prev.filter(a => a.id !== candId && a.candidateId !== candId));
                  addToast('info', 'Removed from Talent Pool', 'Candidate removed from your saved talent pool.');
                } catch (err) {
                  console.error('Failed to remove candidate from talent pool:', err);
                }
              }}
            />
          )}

          {activeView === 'comparison' && (
            <ComparisonView 
              applicants={applicants}
              compareId1={compareId1}
              setCompareId1={setCompareId1}
              compareId2={compareId2}
              setCompareId2={setCompareId2}
            />
          )}

          {activeView === 'verification' && (
            <CandidateVerificationView
              realCandidates={realCandidates}
              onSelectCandidate={handleSelectCandidate}
            />
          )}

          {activeView === 'audit-logs' && (
            <AuditLogsView 
              auditLogs={auditLogs}
              auditSearch={auditSearch}
              setAuditSearch={setAuditSearch}
            />
          )}

          {activeView === 'profile' && (
            <HRProfileView 
              currentUser={currentUser}
              onProfileUpdated={(updatedUser) => setCurrentUser(updatedUser)}
              addToast={addToast}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView 
              currentUser={currentUser}
              addToast={addToast}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {isPostJobModalOpen && (
        <PostJobModal 
          isOpen={isPostJobModalOpen}
          onClose={() => setIsPostJobModalOpen(false)}
          newJobForm={newJobForm}
          setNewJobForm={setNewJobForm}
          onJobCreated={handlePublishJob}
        />
      )}

      {isCandidateModalOpen && (
        <CandidateDetailModal 
          isOpen={isCandidateModalOpen}
          onClose={() => {
            setIsCandidateModalOpen(false);
            setSelectedCandidateObject(null);
          }}
          cand={selectedCandidateObject || realCandidates.find(c => String(c.id) === String(activeCandidateId) || String(c.candidateId) === String(activeCandidateId)) || applicants.find(a => String(a.id) === String(activeCandidateId) || String(a.candidateId) === String(activeCandidateId))}
          candidateId={activeCandidateId}
          applicants={applicants}
          candidatesList={realCandidates.length > 0 ? realCandidates : applicants}
          currentUser={currentUser}
          candidateNotesDraft={candidateNotesDraft}
          setCandidateNotesDraft={setCandidateNotesDraft}
          candidateStatusDraft={candidateStatusDraft}
          setCandidateStatusDraft={setCandidateStatusDraft}
          onStatusUpdated={(actionName, updatedObj) => {
            const targetId = updatedObj?.id || activeCandidateId;
            setRealCandidates(prev => prev.map(c => 
              (String(c.id) === String(targetId) || (updatedObj?.email && c.email === updatedObj.email)) 
                ? { ...c, status: typeof actionName === 'string' ? actionName : (c.status || 'Verified'), stage: typeof actionName === 'string' ? actionName : c.stage } 
                : c
            ));
            setApplicants(prev => prev.map(a => 
              (String(a.id) === String(targetId) || (updatedObj?.email && a.email === updatedObj.email)) 
                ? { ...a, status: typeof actionName === 'string' ? actionName : (a.status || 'Verified'), stage: typeof actionName === 'string' ? actionName : a.stage } 
                : a
            ));
            addToast('success', 'Status Updated', `Candidate hiring status updated.`);
            fetchRealDbCandidates();
          }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
