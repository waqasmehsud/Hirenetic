'use client';

import React from 'react';
import { Search, PlusCircle, LogOut } from 'lucide-react';

export default function Topbar({
  activeView,
  globalSearch,
  setGlobalSearch,
  setActiveView,
  onOpenPostJobModal,
  onLogout
}) {
  const getTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard Overview';
      case 'jobs': return 'Job Postings & Roles';
      case 'applicants': return 'Applicant Management & CV Screening';
      case 'talent-pool': return 'Saved Talent Pool';
      case 'comparison': return 'Candidate Side-by-Side Comparison';
      case 'audit-logs': return 'System & Security Audit Logs';
      default: return 'HR Panel';
    }
  };

  const getSubtitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Real-time metrics, active jobs, and hiring pipeline performance.';
      case 'jobs': return 'Manage active career opportunities and create new job postings.';
      case 'applicants': return 'Review candidate scores, AI analysis, missing skills, and hiring workflow status.';
      case 'talent-pool': return 'Bookmarked high-potential candidates saved for upcoming openings.';
      case 'comparison': return 'Compare skills, years of experience, and AI match scores of candidates.';
      case 'audit-logs': return 'Review role access logs, resume malware scans, and HR activity history.';
      default: return '';
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1 id="page-title">{getTitle()}</h1>
        <p id="page-subtitle">{getSubtitle()}</p>
      </div>

      <div className="topbar-actions">
        <div className="search-box-top">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search candidate or job..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && setActiveView) {
                setActiveView('applicants');
              }
            }}
          />
        </div>
        <button className="btn btn-primary" onClick={onOpenPostJobModal}>
          <PlusCircle size={16} />
          <span>Post New Job</span>
        </button>
        <button 
          className="btn" 
          onClick={onLogout}
          title="Sign Out of Employer Portal"
          style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', gap: '6px', fontWeight: '600' }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
