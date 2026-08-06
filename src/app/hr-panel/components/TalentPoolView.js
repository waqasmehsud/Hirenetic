'use client';

import React from 'react';
import { Bookmark, Award, Trash2, Eye } from 'lucide-react';

export default function TalentPoolView({
  applicants = [],
  talentPoolCandidates: propTalentPool,
  getScoreClass,
  onOpenCandidateModal,
  onSelectCandidate,
  onRemoveFromTalentPool
}) {
  const safeApplicants = Array.isArray(applicants) ? applicants : [];
  const talentPoolCandidates = propTalentPool || safeApplicants.filter(a => a.bookmarked || a.isTalentPool || (a.matchScore && a.matchScore >= 80));

  const handleSelect = (id) => {
    if (onSelectCandidate) onSelectCandidate(id);
    else if (onOpenCandidateModal) onOpenCandidateModal(id);
  };

  const safeGetScoreClass = (score = 0) => {
    if (getScoreClass) return getScoreClass(score);
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-med';
    return 'score-low';
  };

  return (
    <section className="view-section active">
      <div className="section-intro" style={{ marginBottom: 20, background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px 20px', borderRadius: '14px' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Saved Talent Pool</h3>
        <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0 0' }}>High-potential candidates bookmarked for future recruitment cycles.</p>
      </div>

      <div className="talent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {talentPoolCandidates.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748b', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '14px' }}>
            <Bookmark size={36} style={{ strokeWidth: 1.5, color: '#94a3b8', marginBottom: 8 }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>No candidates saved in the talent pool yet.</div>
            <div style={{ fontSize: '12.5px', marginTop: '4px', color: '#64748b' }}>Bookmark high-potential candidates from their AI profiles to save them here.</div>
          </div>
        ) : (
          talentPoolCandidates.map(cand => {
            const skills = Array.isArray(cand.skills) ? cand.skills : [];
            return (
              <div className="talent-card" key={cand.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="talent-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="candidate-cell" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="candidate-avatar" style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13.5px' }}>
                      {(cand.name || cand.full_name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="candidate-info">
                      <span className="candidate-name" style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block' }}>{cand.name || cand.full_name || 'Candidate'}</span>
                      <span className="candidate-email" style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>{cand.jobTitle || cand.title || 'Software Opportunity'}</span>
                    </div>
                  </div>
                  <span className={`score-pill ${safeGetScoreClass(cand.matchScore || 0)}`} style={{ fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                    {cand.matchScore || 0}%
                  </span>
                </div>

                <div className="skills-tags-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {skills.map(s => <span className="skill-tag" key={s} style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', padding: '2px 7px', borderRadius: '5px' }}>{s}</span>)}
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <button className="btn btn-sm btn-outline" onClick={() => handleSelect(cand.id)} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: '600' }}>
                    <Eye size={13} /> Details
                  </button>
                  {onRemoveFromTalentPool && (
                    <button className="btn btn-sm btn-danger" onClick={() => onRemoveFromTalentPool(cand.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
