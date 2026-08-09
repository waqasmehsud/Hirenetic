'use client';

import React, { useState } from 'react';
import { Bookmark, Eye, Trash2, Search, Filter } from 'lucide-react';

export default function TalentPoolView({
  applicants = [],
  talentPoolCandidates: propTalentPool,
  globalSearch = '',
  getScoreClass,
  onOpenCandidateModal,
  onSelectCandidate,
  onRemoveFromTalentPool
}) {
  const [localSearch, setLocalSearch] = useState('');
  const safeApplicants = Array.isArray(applicants) ? applicants : [];
  
  const rawTalentPool = propTalentPool || safeApplicants.filter(a => a.bookmarked || a.isTalentPool || (a.matchScore && a.matchScore >= 80));

  const activeQuery = (globalSearch || localSearch).trim().toLowerCase();

  const filteredTalent = rawTalentPool.filter(cand => {
    if (!activeQuery) return true;
    const name = (cand.name || cand.full_name || '').toLowerCase();
    const email = (cand.email || '').toLowerCase();
    const title = (cand.jobTitle || cand.title || '').toLowerCase();
    const skillsStr = Array.isArray(cand.skills) ? cand.skills.join(' ').toLowerCase() : '';
    return name.includes(activeQuery) || email.includes(activeQuery) || title.includes(activeQuery) || skillsStr.includes(activeQuery);
  });

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
      
      {/* Counter & Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
          Saved High-Potential Talent Pool Candidates
        </div>
        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569', padding: '6px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          Bookmarked Candidates: <span style={{ color: '#2563eb' }}>{filteredTalent.length}</span> / {rawTalentPool.length}
        </div>
      </div>

      {/* Candidates Equal-Height Grid */}
      <div className="talent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
        {filteredTalent.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748b', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '14px' }}>
            <Bookmark size={38} style={{ strokeWidth: 1.5, color: '#94a3b8', marginBottom: 10 }} />
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>No talent pool candidates found</div>
            <div style={{ fontSize: '12.5px', marginTop: '4px', color: '#64748b' }}>
              {rawTalentPool.length === 0 
                ? 'Bookmark high-potential candidates from candidate profiles to save them here.' 
                : 'No bookmarked candidate matches your search term.'}
            </div>
          </div>
        ) : (
          filteredTalent.map(cand => {
            const skills = Array.isArray(cand.skills) ? cand.skills : [];
            const displaySkills = skills.slice(0, 5);
            const extraSkillsCount = skills.length - displaySkills.length;
            const scoreNum = cand.matchScore || cand.score || 85;

            return (
              <div 
                className="talent-card" 
                key={cand.id || cand.candidate_id || Math.random()} 
                style={{ 
                  background: '#ffffff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '14px', 
                  padding: '18px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  minHeight: '260px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Header Slot */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', minHeight: '46px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: '38px', 
                      height: '38px', 
                      borderRadius: '10px', 
                      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
                      color: '#ffffff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: '800', 
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {(cand.name || cand.full_name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cand.name || cand.full_name || 'Candidate'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cand.jobTitle || cand.title || 'Software & Tech Opportunity'}
                      </span>
                    </div>
                  </div>

                  <span className={`score-pill ${safeGetScoreClass(scoreNum)}`} style={{ fontSize: '12px', fontWeight: '800', padding: '3px 9px', borderRadius: '6px', flexShrink: 0 }}>
                    {scoreNum}%
                  </span>
                </div>

                {/* Skills Stack Fixed Slot */}
                <div style={{ marginTop: '14px', minHeight: '64px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                    Key Verified Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {displaySkills.length > 0 ? (
                      displaySkills.map((s, idx) => (
                        <span key={idx} style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                          {s}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8', italic: 'true' }}>General Technical Stack</span>
                    )}
                    {extraSkillsCount > 0 && (
                      <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '2px 7px', borderRadius: '6px', fontWeight: '700' }}>
                        +{extraSkillsCount} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons Anchored to Bottom */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleSelect(cand.id || cand.candidate_id)} 
                    style={{ 
                      flex: 1, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '5px', 
                      fontSize: '12px', 
                      padding: '7px 12px', 
                      borderRadius: '8px', 
                      border: '1px solid #cbd5e1', 
                      background: '#ffffff', 
                      color: '#0f172a',
                      cursor: 'pointer', 
                      fontWeight: '700',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <Eye size={13} style={{ color: '#2563eb' }} /> Profile
                  </button>
                  {onRemoveFromTalentPool && (
                    <button 
                      onClick={() => onRemoveFromTalentPool(cand.id || cand.candidate_id)} 
                      title="Remove from Saved Talent Pool"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '4px', 
                        fontSize: '12px', 
                        padding: '7px 12px', 
                        borderRadius: '8px', 
                        border: '1px solid #fecaca', 
                        background: '#fef2f2', 
                        color: '#dc2626', 
                        cursor: 'pointer', 
                        fontWeight: '700' 
                      }}
                    >
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
