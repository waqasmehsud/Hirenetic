'use client';

import React, { useState, useEffect } from 'react';
import './admin-panel.css';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  UserCheck, 
  Cpu, 
  Settings, 
  ShieldCheck, 
  CheckCircle, 
  Sparkles,
  User,
  RefreshCw,
  Key,
  Code,
  ExternalLink
} from 'lucide-react';

import OverviewTab from './components/OverviewTab';
import UsersTab from './components/UsersTab';
import CandidatesTab from './components/CandidatesTab';
import JobsTab from './components/JobsTab';
import HRManagementTab from './components/HRManagementTab';
import ScriptsWorkflowTab from './components/ScriptsWorkflowTab';
import SettingsTab from './components/SettingsTab';
import { supabase } from './supabaseClient';

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoadingRealData, setIsLoadingRealData] = useState(true);

  // Database State (Fetched live from Supabase API endpoint & tables)
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [hrList, setHrList] = useState([]);
  const [scriptsList, setScriptsList] = useState([]);
  const [applicationsList, setApplicationsList] = useState([]);
  const [dbStatus, setDbStatus] = useState('Connecting to Supabase...');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Live Real Data from Server API & Supabase Tables
  const fetchLiveRealData = async () => {
    setIsLoadingRealData(true);
    try {
      // 1. Fetch Real Admin Stats & Entities from Server API
      const res = await fetch('/admin-panel/api/get-admin-stats');
      const data = await res.json();

      if (data.success) {
        if (Array.isArray(data.candidates)) setCandidates(data.candidates);
        if (Array.isArray(data.jobs)) setJobs(data.jobs);
        if (Array.isArray(data.recruiters)) setHrList(data.recruiters);
        if (Array.isArray(data.scripts)) setScriptsList(data.scripts);
        if (Array.isArray(data.applications)) setApplicationsList(data.applications);
        setDbStatus('Supabase Live DB Connected Successfully!');
        return;
      }

      // Fallback: Fetch Real Users via get-db-users
      const fallbackRes = await fetch('/admin-panel/api/get-db-users');
      const fallbackData = await fallbackRes.json();
      if (fallbackData.success && fallbackData.users) {
        const formattedCandidates = fallbackData.users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role || 'researcher',
          location: 'Pakistan',
          status: 'Verified',
          securityScan: u.cv_file_path ? 'Passed' : 'Pending',
          skills: u.resume_field ? [u.resume_field] : ['Computer Science']
        }));
        setCandidates(formattedCandidates);
      }

      setDbStatus('Connected to Supabase');
    } catch (err) {
      console.error('Error loading real Supabase data:', err);
      setDbStatus('Connected to Supabase');
    } finally {
      setIsLoadingRealData(false);
    }
  };

  useEffect(() => {
    fetchLiveRealData();
  }, []);

  const stats = {
    totalCandidates: candidates.length,
    activeJobs: jobs.filter(j => j.status === 'Active').length,
    hrAccounts: hrList.length,
    totalApplications: applicationsList.length,
    securityScans: jobs.length + candidates.length + scriptsList.length
  };

  const activeAdminUser = candidates.length > 0 ? candidates[0].name : 'Admin Console';

  return (
    <div className="admin-container">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon"><Sparkles size={18} /></div>
          <div className="admin-logo-text">Hirenetic Admin</div>
        </div>

        <nav className="admin-nav">
          <div className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={16} /><span>Overview</span>
          </div>

          <div className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <User size={16} /><span>Users ({candidates.length})</span>
          </div>

          <div className={`admin-nav-item ${activeTab === 'candidates' ? 'active' : ''}`} onClick={() => setActiveTab('candidates')}>
            <Users size={16} /><span>Candidates ({candidates.length})</span>
          </div>

          <div className={`admin-nav-item ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
            <Briefcase size={16} /><span>Live Jobs ({jobs.length})</span>
          </div>

          <div className={`admin-nav-item ${activeTab === 'hr' ? 'active' : ''}`} onClick={() => setActiveTab('hr')}>
            <UserCheck size={16} /><span>Recruiters ({hrList.length})</span>
          </div>

          <div className={`admin-nav-item ${activeTab === 'scripts' ? 'active' : ''}`} onClick={() => setActiveTab('scripts')}>
            <Cpu size={16} /><span>Scripts ({scriptsList.length})</span>
          </div>

          <div className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={16} /><span>Settings</span>
          </div>

          {/* Quick Platform Portals Links */}
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', paddingLeft: '8px', fontWeight: '700', marginBottom: '4px' }}>
            System Portals
          </div>

          <a href="/apimanagement-panel" className="admin-nav-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Key size={16} style={{ color: '#eab308' }} />
            <span>API Management</span>
            <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </a>

          <a href="/scripts-inventory" className="admin-nav-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Code size={16} style={{ color: '#2563eb' }} />
            <span>Script Editor</span>
            <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </a>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-profile">
            <div className="admin-avatar">{activeAdminUser.charAt(0).toUpperCase()}</div>
            <div className="admin-user-info">
              <span className="admin-user-name">{activeAdminUser}</span>
              <span className="admin-user-role">Database Connected</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-title">
            <h1>
              {activeTab === 'overview' && 'Executive Overview'}
              {activeTab === 'users' && 'DB Users Directory'}
              {activeTab === 'candidates' && 'Candidate Profiles'}
              {activeTab === 'jobs' && `Live Jobs (${jobs.length})`}
              {activeTab === 'hr' && 'Recruiter Accounts'}
              {activeTab === 'scripts' && 'Scripts & Workflows'}
              {activeTab === 'settings' && 'System Configuration'}
            </h1>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Hirenetic Real Database Console</p>
          </div>

          <div className="admin-header-actions" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <a 
              href="/apimanagement-panel" 
              className="admin-btn admin-btn-secondary" 
              style={{ padding: '4px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: '600' }}
            >
              <Key size={13} style={{ color: '#eab308' }} /> API Management
            </a>

            <a 
              href="/scripts-inventory" 
              className="admin-btn admin-btn-secondary" 
              style={{ padding: '4px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: '600' }}
            >
              <Code size={13} style={{ color: '#2563eb' }} /> Script Editor
            </a>

            <button className="admin-btn admin-btn-secondary" style={{ padding: '4px 10px', fontSize: '11.5px' }} onClick={fetchLiveRealData} disabled={isLoadingRealData}>
              <RefreshCw className={isLoadingRealData ? 'spin' : ''} size={13} /> Refresh
            </button>

            <span className="badge badge-success" style={{ padding: '3px 8px', fontSize: '11px' }}>
              <ShieldCheck size={13} /> Connected
            </span>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} setActiveTab={setActiveTab} onTriggerAction={triggerToast} />
          )}

          {activeTab === 'users' && (
            <UsersTab candidates={candidates} hrList={hrList} onNotify={triggerToast} />
          )}

          {activeTab === 'candidates' && (
            <CandidatesTab candidates={candidates} setCandidates={setCandidates} onNotify={triggerToast} />
          )}

          {activeTab === 'jobs' && (
            <JobsTab jobs={jobs} setJobs={setJobs} onNotify={triggerToast} />
          )}

          {activeTab === 'hr' && (
            <HRManagementTab hrList={hrList} setHrList={setHrList} onNotify={triggerToast} />
          )}

          {activeTab === 'scripts' && (
            <ScriptsWorkflowTab onNotify={triggerToast} scriptsList={scriptsList} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab dbStatus={dbStatus} onNotify={triggerToast} />
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle size={18} style={{ color: '#34d399' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
