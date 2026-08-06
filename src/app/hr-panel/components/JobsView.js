'use client';

import React, { useState } from 'react';
import { Briefcase, Plus, MapPin, Clock, Award, RefreshCw, Search } from 'lucide-react';

export default function JobsView({
  jobs = [],
  jobFilter = 'all',
  setJobFilter,
  applicants = [],
  loading = false,
  onRefreshJobs,
  onOpenPostJobModal,
  onToggleJobStatus,
  onViewApplicantsForJob
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const safeApplicants = Array.isArray(applicants) ? applicants : [];

  const filteredJobs = safeJobs.filter(job => {
    // Filter by open / closed status
    if (jobFilter === 'open' && job.status !== 'Open') return false;
    if (jobFilter === 'closed' && job.status !== 'Closed') return false;

    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const title = (job.title || '').toLowerCase();
      const dept = (job.dept || '').toLowerCase();
      const location = (job.location || '').toLowerCase();
      const skills = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : '';

      return title.includes(q) || dept.includes(q) || location.includes(q) || skills.includes(q);
    }

    return true;
  });

  return (
    <section className="view-section active">
      {/* View Header Bar */}
      <div className="view-header-bar flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase style={{ color: '#2563eb' }} size={22} />
            Job Postings & Career Listings
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Real-time job openings fetched live from Supabase public.crwl_jobsData database table.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onRefreshJobs}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Fetching DB...' : 'Refresh DB Jobs'}
          </button>

          <button className="btn btn-primary" onClick={onOpenPostJobModal}>
            <Plus size={16} /> Create New Job Posting
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="filter-group" style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`tab-btn ${jobFilter === 'all' ? 'active' : ''}`}
            onClick={() => setJobFilter && setJobFilter('all')}
            style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid #cbd5e1', cursor: 'pointer', background: jobFilter === 'all' ? '#2563eb' : '#ffffff', color: jobFilter === 'all' ? '#ffffff' : '#334155', fontWeight: '600' }}
          >
            All Jobs ({safeJobs.length})
          </button>

          <button
            className={`tab-btn ${jobFilter === 'open' ? 'active' : ''}`}
            onClick={() => setJobFilter && setJobFilter('open')}
            style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid #cbd5e1', cursor: 'pointer', background: jobFilter === 'open' ? '#2563eb' : '#ffffff', color: jobFilter === 'open' ? '#ffffff' : '#334155', fontWeight: '600' }}
          >
            Open Positions
          </button>

          <button
            className={`tab-btn ${jobFilter === 'closed' ? 'active' : ''}`}
            onClick={() => setJobFilter && setJobFilter('closed')}
            style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid #cbd5e1', cursor: 'pointer', background: jobFilter === 'closed' ? '#2563eb' : '#ffffff', color: jobFilter === 'closed' ? '#ffffff' : '#334155', fontWeight: '600' }}
          >
            Closed Positions
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search job title, skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff' }}
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }}></div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>Loading Live Jobs from Supabase...</div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '14px' }}>
          <Briefcase size={40} style={{ strokeWidth: 1.5, color: '#94a3b8', marginBottom: 10 }} />
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>No job postings found</h4>
          <p style={{ fontSize: '13px', marginBottom: '16px' }}>
            {safeJobs.length === 0 ? 'No job records exist in public.crwl_jobsData.' : 'No jobs match your current search and status filter.'}
          </p>
          <button className="btn btn-primary" onClick={onOpenPostJobModal}>
            <Plus size={16} /> Create New Job Posting
          </button>
        </div>
      ) : (
        <div className="jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {filteredJobs.map(job => {
            const applicantCount = safeApplicants.filter(a => {
              const isIdMatch = String(a.jobId || a.job_id) === String(job.id);
              const isTitleMatch = (a.jobTitle || a.title || a.job_title || '').toLowerCase() === (job.title || '').toLowerCase();
              return isIdMatch || isTitleMatch;
            }).length;

            const skills = Array.isArray(job.skills) ? job.skills : [];
            const isOpen = job.status === 'Open';

            return (
              <div className="job-card" key={job.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="job-card-top">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: isOpen ? '#ecfdf5' : '#f1f5f9', color: isOpen ? '#059669' : '#64748b', border: isOpen ? '1px solid #a7f3d0' : '1px solid #e2e8f0' }}>
                      {isOpen ? 'Active / Open' : 'Closed'}
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                      {job.dept || 'Engineering'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '6px', margin: '0 0 6px 0' }}>{job.title}</h4>
                  
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginBottom: '8px' }}>
                    {job.company || 'Hirenetic Enterprise'}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {job.location || 'Remote'}</span>
                    <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {job.type || 'Full-Time'}</span>
                    <span><Award size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {job.exp || 'Mid Level'}</span>
                  </div>

                  {skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {skills.slice(0, 5).map((s, idx) => (
                        <span key={idx} style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', padding: '2px 8px', borderRadius: '6px', fontWeight: '500' }}>
                          {s}
                        </span>
                      ))}
                      {skills.length > 5 && (
                        <span style={{ fontSize: '11px', color: '#64748b', padding: '2px 4px' }}>+{skills.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#475569' }}>{applicantCount} Applicant(s)</span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {onToggleJobStatus && (
                      <button
                        onClick={() => onToggleJobStatus(job.id)}
                        style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        {isOpen ? 'Close' : 'Reopen'}
                      </button>
                    )}
                    {onViewApplicantsForJob && (
                      <button
                        onClick={() => onViewApplicantsForJob(job.id, job.title)}
                        style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        View Applicants
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
