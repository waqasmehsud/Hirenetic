'use client';

import React from 'react';
import { Search, Briefcase, Filter, Percent, Users, ShieldCheck, ExternalLink, Calendar } from 'lucide-react';

export default function ApplicantsView({
  jobs = [],
  applicants = [],
  filteredApplicants: propFilteredApplicants,
  applicantSearch = '',
  setApplicantSearch,
  applicantJobFilter = 'all',
  setApplicantJobFilter,
  applicantStatusFilter = 'all',
  setApplicantStatusFilter,
  applicantScoreFilter = '0',
  setApplicantScoreFilter,
  getScoreClass,
  updateApplicantStatusInline,
  onOpenCandidateModal,
  onSelectCandidate
}) {
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const safeApplicants = Array.isArray(applicants) ? applicants : [];

  const filteredApplicants = propFilteredApplicants || safeApplicants.filter(cand => {
    if (applicantJobFilter !== 'all') {
      const filterVal = String(applicantJobFilter).toLowerCase();
      const isIdMatch = String(cand.jobId || cand.job_id).toLowerCase() === filterVal;
      const isTitleMatch = (cand.jobTitle || cand.title || cand.job_title || '').toLowerCase() === filterVal;
      
      const selectedJob = safeJobs.find(j => String(j.id).toLowerCase() === filterVal || (j.title || '').toLowerCase() === filterVal);
      const isSelectedJobTitleMatch = selectedJob && (cand.jobTitle || cand.title || cand.job_title || '').toLowerCase() === (selectedJob.title || '').toLowerCase();

      if (!isIdMatch && !isTitleMatch && !isSelectedJobTitleMatch) return false;
    }
    if (applicantStatusFilter !== 'all' && (cand.status || cand.application_status) !== applicantStatusFilter) return false;
    if (Number(applicantScoreFilter) > 0 && (cand.matchScore || 0) < Number(applicantScoreFilter)) return false;
    if (applicantSearch.trim()) {
      const q = applicantSearch.toLowerCase();
      const nameMatch = (cand.name || cand.full_name || '').toLowerCase().includes(q);
      const emailMatch = (cand.email || '').toLowerCase().includes(q);
      const titleMatch = (cand.jobTitle || cand.title || cand.job_title || '').toLowerCase().includes(q);
      const companyMatch = (cand.company || cand.company_name || '').toLowerCase().includes(q);
      return nameMatch || emailMatch || titleMatch || companyMatch;
    }
    return true;
  });

  const safeGetScoreClass = (score = 0) => {
    if (getScoreClass) return getScoreClass(score);
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-med';
    return 'score-low';
  };

  const handleSelect = (id) => {
    if (onSelectCandidate) onSelectCandidate(id);
    else if (onOpenCandidateModal) onOpenCandidateModal(id);
  };

  return (
    <section className="view-section active">
      {/* Filters and Search Bar */}
      <div className="filter-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}>
        <div className="filter-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div className="filter-field search-field">
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Search size={14} /> Search Applicant</label>
            <input
              type="text"
              placeholder="Search by name, email, company or title..."
              value={applicantSearch}
              onChange={(e) => setApplicantSearch && setApplicantSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div className="filter-field">
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> Job Opening</label>
            <select
              value={applicantJobFilter}
              onChange={(e) => setApplicantJobFilter && setApplicantJobFilter(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            >
              <option value="all">All Job Openings</option>
              {safeJobs.map(j => <option value={j.id} key={j.id}>{j.title}</option>)}
            </select>
          </div>

          <div className="filter-field">
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Filter size={14} /> Status</label>
            <select
              value={applicantStatusFilter}
              onChange={(e) => setApplicantStatusFilter && setApplicantStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            >
              <option value="all">All Statuses</option>
              <option value="Redirected">Redirected</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-field">
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Percent size={14} /> Min Match Score</label>
            <select
              value={applicantScoreFilter}
              onChange={(e) => setApplicantScoreFilter && setApplicantScoreFilter(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            >
              <option value="0">All Scores (0%+)</option>
              <option value="80">High Match (80%+)</option>
              <option value="60">Medium Match (60%+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
        <div className="card-body no-padding">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Candidate</th>
                <th style={{ padding: '12px 16px' }}>Target Role & Company</th>
                <th style={{ padding: '12px 16px' }}>Applied Date</th>
                <th style={{ padding: '12px 16px' }}>Match Score</th>
                <th style={{ padding: '12px 16px' }}>Security Scan</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                    <Users size={32} style={{ strokeWidth: 1.5, color: 'var(--text-light)', marginBottom: 8 }} />
                    <div>No applications found matching the current filter parameters.</div>
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((cand, idx) => (
                  <tr key={cand.application_id || cand.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="candidate-cell" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="candidate-avatar" style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
                          {(cand.name || cand.full_name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="candidate-info">
                          <div className="candidate-name" style={{ fontWeight: '600', color: '#0f172a', fontSize: '13.5px' }}>{cand.name || cand.full_name || 'Candidate'}</div>
                          <div className="candidate-email" style={{ fontSize: '12px', color: '#64748b' }}>{cand.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155', fontWeight: '500' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{cand.jobTitle || cand.title || cand.job_title || 'Position Applied'}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        {cand.company || cand.company_name || 'Hirenetic Enterprise'}
                        {cand.external_apply_url && (cand.external_apply_url.startsWith('http://') || cand.external_apply_url.startsWith('https://')) ? (
                          <a href={cand.external_apply_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }} title="External Apply Link">
                            <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span style={{ fontSize: '10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>
                            Direct HR Apply
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} color="#94a3b8" />
                        {cand.appliedDate || (cand.applied_at ? new Date(cand.applied_at).toLocaleDateString() : 'Recent')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`score-pill ${safeGetScoreClass(cand.matchScore || 0)}`} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        {cand.matchScore || 0}% Match
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px' }}>
                        <ShieldCheck size={12} />
                        Clean PDF
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        className="form-control"
                        style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: '#ffffff', color: '#0f172a', fontWeight: '600' }}
                        value={cand.status || cand.application_status || 'Redirected'}
                        onChange={(e) => updateApplicantStatusInline && updateApplicantStatusInline(cand.application_id || cand.id, e.target.value)}
                      >
                        <option value="Redirected">Redirected</option>
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button className="btn btn-sm btn-primary" onClick={() => handleSelect(cand.candidateId || cand.candidate_id || cand.id)} style={{ padding: '6px 12px', fontSize: '12px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                        View AI Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
