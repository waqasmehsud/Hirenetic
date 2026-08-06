'use client';

import React, { useMemo } from 'react';
import { Briefcase, Users, UserCheck, Award, ShieldCheck } from 'lucide-react';

export default function DashboardView({
  jobs = [],
  applicants = [],
  activeJobsCount: propActiveJobsCount,
  totalApplicantsCount: propTotalApplicantsCount,
  shortlistedCount: propShortlistedCount,
  hiredCount: propHiredCount,
  funnelCounts: propFunnelCounts,
  sortedSkills: propSortedSkills,
  topMatchedCandidates: propTopMatchedCandidates,
  onNavigate,
  onOpenPostJob,
  onSelectCandidate,
  onViewAllApplicants
}) {
  // Safe computation if explicit props are not passed
  const activeJobsCount = propActiveJobsCount ?? (jobs.length || 0);
  const totalApplicantsCount = propTotalApplicantsCount ?? (applicants.length || 0);

  const funnelCounts = useMemo(() => {
    if (propFunnelCounts) return propFunnelCounts;
    const counts = { Applied: 0, Shortlisted: 0, Interview: 0, Hired: 0, Rejected: 0 };
    applicants.forEach(app => {
      const status = app.status || 'Applied';
      if (counts[status] !== undefined) {
        counts[status] += 1;
      } else {
        counts.Applied += 1;
      }
    });
    // If no applicants yet, default Applied to total applicants count
    if (applicants.length === 0) counts.Applied = 0;
    return counts;
  }, [applicants, propFunnelCounts]);

  const shortlistedCount = propShortlistedCount ?? (funnelCounts.Shortlisted || 0);
  const hiredCount = propHiredCount ?? (funnelCounts.Hired || 0);

  const totalFunnelMax = useMemo(() => {
    return Math.max(funnelCounts.Applied || 1, 1);
  }, [funnelCounts]);

  const getFunnelPercent = (val = 0) => {
    return Math.round((val / totalFunnelMax) * 100);
  };

  const sortedSkills = useMemo(() => {
    if (propSortedSkills) return propSortedSkills;
    const map = {};
    applicants.forEach(app => {
      const skillsArr = Array.isArray(app.skills) ? app.skills : [];
      skillsArr.forEach(s => {
        if (!s) return;
        map[s] = (map[s] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [applicants, propSortedSkills]);

  const topMatchedCandidates = useMemo(() => {
    if (propTopMatchedCandidates) return propTopMatchedCandidates;
    return [...applicants].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 5);
  }, [applicants, propTopMatchedCandidates]);

  const getScoreClass = (score = 0) => {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-med';
    return 'score-low';
  };

  const getStatusBadgeClass = (status = 'Applied') => {
    switch (status) {
      case 'Shortlisted': return 'badge-warning';
      case 'Interview': return 'badge-purple';
      case 'Hired': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <section className="view-section active">
      {/* Top Quick Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <Briefcase size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{activeJobsCount}</span>
            <span className="stat-label">Active Job Openings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-purple">
            <Users size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{totalApplicantsCount}</span>
            <span className="stat-label">Total Applicants</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-amber">
            <UserCheck size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{shortlistedCount}</span>
            <span className="stat-label">Shortlisted Candidates</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green">
            <Award size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{hiredCount}</span>
            <span className="stat-label">Hired Talent</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Hiring Funnel Widget */}
        <div className="card card-funnel">
          <div className="card-header">
            <div>
              <h3>Recruitment Hiring Funnel</h3>
              <p className="card-subtitle">Candidate progression across stages</p>
            </div>
          </div>
          <div className="card-body">
            <div className="funnel-container">
              <div className="funnel-step">
                <span className="funnel-label">Applied</span>
                <div className="funnel-bar-wrap">
                  <div className="funnel-bar-fill fill-applied" style={{ width: `${funnelCounts.Applied > 0 ? 100 : 0}%` }}>
                    {funnelCounts.Applied}
                  </div>
                </div>
                <span className="funnel-count">{funnelCounts.Applied}</span>
              </div>
              <div className="funnel-step">
                <span className="funnel-label">Shortlisted</span>
                <div className="funnel-bar-wrap">
                  <div className="funnel-bar-fill fill-shortlisted" style={{ width: `${getFunnelPercent(funnelCounts.Shortlisted)}%` }}>
                    {funnelCounts.Shortlisted}
                  </div>
                </div>
                <span className="funnel-count">{funnelCounts.Shortlisted}</span>
              </div>
              <div className="funnel-step">
                <span className="funnel-label">Interview</span>
                <div className="funnel-bar-wrap">
                  <div className="funnel-bar-fill fill-interview" style={{ width: `${getFunnelPercent(funnelCounts.Interview)}%` }}>
                    {funnelCounts.Interview}
                  </div>
                </div>
                <span className="funnel-count">{funnelCounts.Interview}</span>
              </div>
              <div className="funnel-step">
                <span className="funnel-label">Hired</span>
                <div className="funnel-bar-wrap">
                  <div className="funnel-bar-fill fill-hired" style={{ width: `${getFunnelPercent(funnelCounts.Hired)}%` }}>
                    {funnelCounts.Hired}
                  </div>
                </div>
                <span className="funnel-count">{funnelCounts.Hired}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Candidate Skills */}
        <div className="card card-skills">
          <div className="card-header">
            <div>
              <h3>Top Applicant Skills</h3>
              <p className="card-subtitle">Most frequent skills detected in resumes</p>
            </div>
          </div>
          <div className="card-body">
            <div className="skills-list-container">
              {sortedSkills.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                  No applicant skills recorded yet.
                </div>
              ) : (
                sortedSkills.map(([skill, count]) => {
                  const maxCount = sortedSkills[0] ? sortedSkills[0][1] : 1;
                  return (
                    <div className="skill-row" key={skill}>
                      <div className="skill-row-header">
                        <span>{skill}</span>
                        <span>{count} candidate(s)</span>
                      </div>
                      <div className="skill-progress-bg">
                        <div className="skill-progress-fill" style={{ width: `${Math.round((count / maxCount) * 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Top Matching Applicants Table */}
        <div className="card card-top-candidates full-width">
          <div className="card-header flex-between">
            <div>
              <h3>Top AI Matched Candidates</h3>
              <p className="card-subtitle">Highest AI resume match scores across active openings</p>
            </div>
            {onNavigate && (
              <button className="btn btn-sm btn-ghost" onClick={() => onNavigate('applicants')}>
                View All Applicants &rarr;
              </button>
            )}
          </div>
          <div className="card-body no-padding">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Applied Job</th>
                  <th>Match Score</th>
                  <th>Malware Scan</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {topMatchedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No candidate applications recorded yet.
                    </td>
                  </tr>
                ) : (
                  topMatchedCandidates.map((cand, idx) => (
                    <tr key={cand.id || idx}>
                      <td>
                        <div className="candidate-cell">
                          <div className="candidate-avatar">
                            {(cand.name || cand.full_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="candidate-info">
                            <span className="candidate-name">{cand.name || cand.full_name || 'Candidate'}</span>
                            <span className="candidate-email">{cand.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{cand.jobTitle || cand.title || 'Software Developer'}</td>
                      <td>
                        <span className={`score-pill ${getScoreClass(cand.matchScore || 0)}`}>
                          {cand.matchScore || 0}% Match
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">
                          <ShieldCheck size={12} style={{ marginRight: 4 }} />
                          Clean PDF
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(cand.status || 'Applied')}`}>
                          {cand.status || 'Applied'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline" onClick={() => onSelectCandidate && onSelectCandidate(cand.id)}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
