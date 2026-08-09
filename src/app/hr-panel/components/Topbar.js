'use client';

import React from 'react';
import { Search, PlusCircle, RefreshCw } from 'lucide-react';

export default function Topbar({
  activeView,
  globalSearch,
  setGlobalSearch,
  setActiveView,
  onOpenPostJobModal,
  onRefreshRealDb,
  loadingRealDb,
  jobFilter = 'all',
  setJobFilter,
  jobsCount = 0,
  openJobsCount = 0,
  closedJobsCount = 0
}) {
  const getTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard Overview';
      case 'jobs': return 'Job Postings & Roles';
      case 'applicants': return 'Applicant Management & CV Screening';
      case 'all-candidates': return 'Registered Candidates Directory';
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
      case 'all-candidates': return 'Real candidate profiles and parsed resumes fetched directly from database.';
      case 'talent-pool': return 'Bookmarked high-potential candidates saved for upcoming openings.';
      case 'comparison': return 'Compare skills, years of experience, and AI match scores of candidates.';
      case 'audit-logs': return 'Review role access logs, resume malware scans, and HR activity history.';
      default: return '';
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeView) {
      case 'jobs': return 'Search job title, skills...';
      case 'all-candidates': return 'Search candidate name, email, skills...';
      case 'applicants': return 'Search applicants...';
      default: return 'Search candidate or job...';
    }
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {/* Title Section */}
      <div style={{ minWidth: '220px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          {getTitle()}
        </h1>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0', fontWeight: '500' }}>
          {getSubtitle()}
        </p>
      </div>

      {/* Topbar Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: '1', justifyContent: 'flex-end' }}>
        
        {/* Job Status Filter Pills (Only Visible when activeView === 'jobs') */}
        {activeView === 'jobs' && setJobFilter && (
          <div style={{ display: 'flex', gap: '6px', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setJobFilter('all')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                background: jobFilter === 'all' ? '#2563eb' : 'transparent',
                color: jobFilter === 'all' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              All Jobs ({jobsCount})
            </button>

            <button
              onClick={() => setJobFilter('open')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                background: jobFilter === 'open' ? '#2563eb' : 'transparent',
                color: jobFilter === 'open' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              Open Positions ({openJobsCount})
            </button>

            <button
              onClick={() => setJobFilter('closed')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                background: jobFilter === 'closed' ? '#2563eb' : 'transparent',
                color: jobFilter === 'closed' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              Closed Positions ({closedJobsCount})
            </button>
          </div>
        )}

        {/* View-Specific Search Box */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && setActiveView) {
                if (activeView !== 'all-candidates' && activeView !== 'jobs') {
                  setActiveView('applicants');
                }
              }
            }}
            style={{
              width: '100%',
              padding: '7.5px 12px 7.5px 34px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12.5px',
              outline: 'none',
              background: '#ffffff',
              color: '#0f172a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        {/* Post New Job Button */}
        <button
          onClick={onOpenPostJobModal}
          style={{
            padding: '7.5px 14px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            fontSize: '12.5px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
          }}
        >
          <PlusCircle size={15} />
          <span>Post New Job</span>
        </button>

        {/* Master Database Refresh Button */}
        <button
          onClick={onRefreshRealDb}
          disabled={loadingRealDb}
          title="Refresh live candidates & job postings directly from Supabase PostgreSQL Database"
          style={{
            padding: '7.5px 14px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontSize: '12.5px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <RefreshCw size={14} style={{ animation: loadingRealDb ? 'spin 1s linear infinite' : 'none', color: '#2563eb' }} />
          <span>{loadingRealDb ? 'Refreshing...' : 'Refresh'}</span>
        </button>

      </div>
    </header>
  );
}
