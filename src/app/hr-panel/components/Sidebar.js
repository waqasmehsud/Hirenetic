'use client';

import React from 'react';
import {
  Code2,
  LayoutDashboard,
  Briefcase,
  Users,
  UserCheck,
  Bookmark,
  Columns,
  ShieldCheck,
  Building2,
  Settings,
  LogOut
} from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  activeJobsCount,
  totalApplicantsCount,
  realCandidatesCount = 0,
  currentUser,
  onLogout
}) {
  const name = currentUser?.name || currentUser?.full_name || 'HR Recruiter';
  const role = currentUser?.designation || currentUser?.company || 'Lead HR Manager';
  const avatarInitials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'HR';

  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon" style={{ background: '#2563eb', color: '#ffffff', borderRadius: '8px' }}>
            <Code2 size={18} />
          </div>
          <div className="logo-text">
            <span className="brand-name">Hirenetic</span>
            <span className="brand-sub">HR Employer Portal</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Overview</div>
        <button
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </button>

        <div className="nav-section-title">Recruitment & Candidates</div>
        <button
          className={`nav-item ${activeView === 'all-candidates' ? 'active' : ''}`}
          onClick={() => setActiveView('all-candidates')}
        >
          <UserCheck size={16} />
          <span>All Candidates (DB)</span>
          <span className="badge badge-primary" id="nav-db-candidates-count">{realCandidatesCount || 0}</span>
        </button>
        <button
          className={`nav-item ${activeView === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveView('jobs')}
        >
          <Briefcase size={16} />
          <span>Job Postings</span>
          <span className="badge badge-neutral" id="nav-jobs-count">{activeJobsCount || 0}</span>
        </button>
        <button
          className={`nav-item ${activeView === 'applicants' ? 'active' : ''}`}
          onClick={() => setActiveView('applicants')}
        >
          <Users size={16} />
          <span>Applicants</span>
          <span className="badge badge-neutral" id="nav-applicants-count">{totalApplicantsCount || 0}</span>
        </button>
        <button
          className={`nav-item ${activeView === 'talent-pool' ? 'active' : ''}`}
          onClick={() => setActiveView('talent-pool')}
        >
          <Bookmark size={16} />
          <span>Talent Pool</span>
        </button>
        <button
          className={`nav-item ${activeView === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveView('comparison')}
        >
          <Columns size={16} />
          <span>Candidate Compare</span>
        </button>

        <div className="nav-section-title">Company & Settings</div>
        <button
          className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveView('profile')}
        >
          <Building2 size={16} />
          <span>HR Profile</span>
        </button>
        <button
          className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveView('settings')}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
        <button
          className={`nav-item ${activeView === 'audit-logs' ? 'active' : ''}`}
          onClick={() => setActiveView('audit-logs')}
        >
          <ShieldCheck size={16} />
          <span>Security & Audit</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar" style={{ background: '#2563eb', color: '#ffffff', fontWeight: '700' }}>{avatarInitials}</div>
            <div className="user-info">
              <span className="user-name">{name}</span>
              <span className="user-role">{role}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out of HR Panel"
            style={buttonStyle}
            onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
