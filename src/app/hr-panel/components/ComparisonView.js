'use client';

import React from 'react';
import { Columns, ShieldCheck } from 'lucide-react';

export default function ComparisonView({
  applicants = [],
  compareId1,
  setCompareId1,
  compareId2,
  setCompareId2,
  compareCand1: propCand1,
  compareCand2: propCand2,
  getScoreClass,
  getStatusBadgeClass
}) {
  const safeApplicants = Array.isArray(applicants) ? applicants : [];

  const cand1 = propCand1 || safeApplicants.find(a => String(a.id) === String(compareId1)) || safeApplicants[0];
  const cand2 = propCand2 || safeApplicants.find(a => String(a.id) === String(compareId2)) || safeApplicants[1] || safeApplicants[0];

  const safeGetScoreClass = (score = 0) => {
    if (getScoreClass) return getScoreClass(score);
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-med';
    return 'score-low';
  };

  const safeStatusClass = (status = 'Applied') => {
    if (getStatusBadgeClass) return getStatusBadgeClass(status);
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
      <div className="section-intro" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px 20px', borderRadius: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Side-by-Side Candidate Comparison</h3>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0 0' }}>Compare candidate skills, experience, and AI match scores side by side.</p>
        </div>

        {safeApplicants.length > 0 && (
          <div className="comparison-selectors" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={compareId1 || (cand1 ? cand1.id : '')}
              onChange={(e) => setCompareId1 && setCompareId1(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff' }}
            >
              {safeApplicants.map(a => (
                <option value={a.id} key={a.id}>{a.name || a.full_name || 'Candidate'} ({a.matchScore || 0}%)</option>
              ))}
            </select>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 8px', borderRadius: '6px' }}>VS</span>
            <select
              value={compareId2 || (cand2 ? cand2.id : '')}
              onChange={(e) => setCompareId2 && setCompareId2(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff' }}
            >
              {safeApplicants.map(a => (
                <option value={a.id} key={a.id}>{a.name || a.full_name || 'Candidate'} ({a.matchScore || 0}%)</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="comparison-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {safeApplicants.length < 2 && !cand1 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748b', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '14px' }}>
            <Columns size={36} style={{ strokeWidth: 1.5, color: '#94a3b8', marginBottom: 8 }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>At least 2 applicants are required for candidate comparison.</div>
          </div>
        ) : (
          <>
            {/* Candidate 1 Card */}
            {cand1 && (
              <div className="compare-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="compare-head" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                  <div className="candidate-avatar" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px' }}>
                    {(cand1.name || cand1.full_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{cand1.name || cand1.full_name || 'Candidate 1'}</h3>
                    <span className="badge badge-neutral" style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '6px' }}>{cand1.jobTitle || cand1.title || 'Role'}</span>
                  </div>
                </div>

                <div className="compare-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>AI Match Score</span>
                  <span className={`score-pill ${safeGetScoreClass(cand1.matchScore || 0)}`} style={{ padding: '3px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '12px' }}>{cand1.matchScore || 0}%</span>
                </div>

                <div className="compare-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Status</span>
                  <span className={`badge ${safeStatusClass(cand1.status || 'Applied')}`} style={{ padding: '3px 8px', borderRadius: '6px', fontWeight: '600', fontSize: '11.5px' }}>{cand1.status || 'Applied'}</span>
                </div>

                <div className="compare-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Matched Skills</span>
                  <div className="skills-tags-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(Array.isArray(cand1.skills) ? cand1.skills : []).map(s => <span className="skill-tag matched" key={s} style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', padding: '2px 7px', borderRadius: '5px' }}>{s}</span>)}
                  </div>
                </div>

                <div className="compare-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Missing Skills</span>
                  <div className="skills-tags-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {Array.isArray(cand1.missingSkills) && cand1.missingSkills.length > 0 ? (
                      cand1.missingSkills.map(s => <span className="skill-tag missing" key={s} style={{ fontSize: '11px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '2px 7px', borderRadius: '5px' }}>{s}</span>)
                    ) : (
                      <span className="badge badge-success" style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '2px 7px', borderRadius: '5px' }}>None Missing</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Candidate 2 Card */}
            {cand2 && (
              <div className="compare-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="compare-head" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                  <div className="candidate-avatar" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px' }}>
                    {(cand2.name || cand2.full_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{cand2.name || cand2.full_name || 'Candidate 2'}</h3>
                    <span className="badge badge-neutral" style={{ fontSize: '11px', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '6px' }}>{cand2.jobTitle || cand2.title || 'Role'}</span>
                  </div>
                </div>

                <div className="compare-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>AI Match Score</span>
                  <span className={`score-pill ${safeGetScoreClass(cand2.matchScore || 0)}`} style={{ padding: '3px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '12px' }}>{cand2.matchScore || 0}%</span>
                </div>

                <div className="compare-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Status</span>
                  <span className={`badge ${safeStatusClass(cand2.status || 'Applied')}`} style={{ padding: '3px 8px', borderRadius: '6px', fontWeight: '600', fontSize: '11.5px' }}>{cand2.status || 'Applied'}</span>
                </div>

                <div className="compare-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Matched Skills</span>
                  <div className="skills-tags-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(Array.isArray(cand2.skills) ? cand2.skills : []).map(s => <span className="skill-tag matched" key={s} style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', padding: '2px 7px', borderRadius: '5px' }}>{s}</span>)}
                  </div>
                </div>

                <div className="compare-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Missing Skills</span>
                  <div className="skills-tags-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {Array.isArray(cand2.missingSkills) && cand2.missingSkills.length > 0 ? (
                      cand2.missingSkills.map(s => <span className="skill-tag missing" key={s} style={{ fontSize: '11px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '2px 7px', borderRadius: '5px' }}>{s}</span>)
                    ) : (
                      <span className="badge badge-success" style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '2px 7px', borderRadius: '5px' }}>None Missing</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
