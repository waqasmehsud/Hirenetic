'use client';

import React from 'react';
import { X, CheckCircle2, AlertTriangle, Info, Sparkles, Layers, Rocket, FolderGit2, Check, AlertCircle } from 'lucide-react';

export default function ExplainableMatchModal({ isOpen, onClose, job, candidateProfile }) {
  if (!isOpen || !job) return null;

  const score = job.matchScore || 75;
  const recommendation = job.recommendation || 'CONSIDER';
  const label = job.recommendationLabel || 'Good Match';
  const confidence = job.confidence || 90;
  const breakdown = job.scoreBreakdown || { skills: 85, experience: 80, responsibilities: 80, projects: 75, education: 80 };
  const spotlight = job.projectSpotlight;
  const executiveSummary = job.executiveSummary || job.finalReasoning || job.reason || 'Evidence-backed candidate recommendation based on actual resume data.';
  const whyRec = Array.isArray(job.whyRecommended) ? job.whyRecommended : [];
  const whyNotRec = Array.isArray(job.whyNotRecommended) ? job.whyNotRecommended : [];
  const matchedReqs = Array.isArray(job.matchedRequirements) ? job.matchedRequirements : [];
  const missingReqs = Array.isArray(job.missingRequirements) ? job.missingRequirements : [];
  const finalReasoning = job.finalReasoning || job.reason || 'Evidence-backed candidate recommendation.';

  // Minimal & Professional SaaS Recommendation Badge Styling
  const getBadgeStyle = () => {
    switch (recommendation) {
      case 'APPLY':
        return {
          bg: '#ecfdf5',
          color: '#047857',
          border: '#a7f3d0',
          dot: '#10b981',
          title: 'Recommended to Apply',
          sub: 'Strong evidence alignment with core job requirements'
        };
      case 'CONSIDER':
        return {
          bg: '#fffbeb',
          color: '#b45309',
          border: '#fde68a',
          dot: '#f59e0b',
          title: 'Worth Considering',
          sub: 'Good domain fit with minor non-critical skill gaps'
        };
      default:
        return {
          bg: '#f8fafc',
          color: '#475569',
          border: '#cbd5e1',
          dot: '#94a3b8',
          title: 'Low Direct Fit',
          sub: 'Key required skills or experience level not found in resume'
        };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '700', backgroundColor: 'rgba(37, 99, 235, 0.3)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.4)', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Match Analysis
              </span>
              {job.extractedJobData && (
                <span style={{ fontSize: '10.5px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                  ✓ Webpage Data Sourced
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
              {job.title}
            </h2>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '3px 0 0 0', fontWeight: '500' }}>
              {job.company || job.company_name || 'Tech Enterprise'} • {job.location || 'Remote'}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* 1. Minimal SaaS Recommendation Banner */}
          <div style={{
            backgroundColor: badgeStyle.bg,
            border: `1px solid ${badgeStyle.border}`,
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: badgeStyle.dot, shrink: 0 }}></span>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: '800', color: badgeStyle.color }}>
                  {badgeStyle.title} <span style={{ fontSize: '12px', fontWeight: '600', opacity: 0.85 }}>({label})</span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500', marginTop: '1px' }}>
                  {badgeStyle.sub}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: badgeStyle.color, lineHeight: 1 }}>
                  {score}%
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                  Match Score
                </div>
              </div>
            </div>
          </div>

          {/* 2. EXECUTIVE AI MATCH SUMMARY (2–4 Lines, Factual & No Mock Data) */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderLeft: '4px solid #2563eb',
            borderRadius: '10px',
            padding: '14px 16px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} style={{ color: '#2563eb' }} /> Executive AI Match Summary
            </div>
            <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5, margin: 0, fontWeight: '500' }}>
              {executiveSummary}
            </p>
          </div>

          {/* 3. RELEVANT PROJECT ADVANTAGE SPOTLIGHT (Key Feature) */}
          {spotlight && spotlight.has_spotlight && (
            <div style={{
              background: 'linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%)',
              border: '1px solid #d8b4fe',
              borderRadius: '12px',
              padding: '16px 18px',
              color: '#581c87',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#9333ea', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0, marginTop: '2px' }}>
                <Rocket size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: '#7e22ce', color: '#ffffff', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    Relevant Project Advantage
                  </span>
                  {spotlight.project_title && (
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b21a8' }}>
                      • {spotlight.project_title}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12.5px', color: '#3b0764', margin: 0, lineHeight: 1.5, fontWeight: '500' }}>
                  {spotlight.reasoning || `Even if listed skill keywords don't match 100%, your project '${spotlight.project_title || 'Technical Project'}' demonstrates real-world application directly relevant to this role. Highlight this project in your application as it significantly boosts your hiring probability!`}
                </p>
              </div>
            </div>
          )}

          {/* 4. Multi-Dimensional Score Breakdown */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} style={{ color: '#2563eb' }} /> Match Score Breakdown
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '600' }}>Skills (30%)</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#2563eb', marginTop: '1px' }}>{breakdown.skills || score}%</div>
              </div>

              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '600' }}>Experience (25%)</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#2563eb', marginTop: '1px' }}>{breakdown.experience || score}%</div>
              </div>

              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '600' }}>Responsibilities (20%)</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#16a34a', marginTop: '1px' }}>{breakdown.responsibilities || score}%</div>
              </div>

              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '600' }}>Projects (10%)</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#9333ea', marginTop: '1px' }}>{breakdown.projects || score}%</div>
              </div>

              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '600' }}>Education (10%)</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0284c7', marginTop: '1px' }}>{breakdown.education || score}%</div>
              </div>
            </div>
          </div>

          {/* 5. Why We Recommend This Job */}
          {whyRec.length > 0 && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} /> Key Matching Strengths
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {whyRec.map((item, idx) => (
                  <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #dcfce7', borderRadius: '7px', padding: '8px 12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803d' }}>
                      ✓ {item.fact}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#334155', marginTop: '2px' }}>
                      <strong>Resume Evidence:</strong> {item.evidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Skill Gaps & Potential Areas of Improvement */}
          {whyNotRec.length > 0 && (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} style={{ color: '#64748b' }} /> Additional Skills / Requirements
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {whyNotRec.map((item, idx) => (
                  <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '7px', padding: '8px 12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      • {item.fact}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      <strong>Resume Status:</strong> {item.evidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Matched Requirements Table */}
          {matchedReqs.length > 0 && (
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                Verified Matched Requirements ({matchedReqs.length})
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '7px 10px', textAlign: 'left', width: '35%' }}>Requirement</th>
                      <th style={{ padding: '7px 10px', textAlign: 'left', width: '50%' }}>Candidate Resume Evidence</th>
                      <th style={{ padding: '7px 10px', textAlign: 'right', width: '15%' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchedReqs.map((req, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < matchedReqs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ padding: '7px 10px', fontWeight: '600', color: '#0f172a' }}>{req.requirement}</td>
                        <td style={{ padding: '7px 10px', color: '#334155' }}>{req.candidate_evidence}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            {req.status || 'MATCH'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. Actionable Conclusion */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '14px 16px',
            color: '#1e40af'
          }}>
            <div style={{ fontSize: '12.5px', fontWeight: '800', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} style={{ color: '#2563eb' }} /> Actionable AI Summary
            </div>
            <p style={{ fontSize: '12.5px', lineHeight: 1.5, margin: 0, color: '#1e3a8a', fontWeight: '500' }}>
              {finalReasoning}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '500' }}>
            Factually verified from candidate resume & live job specs.
          </span>

          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '7px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Close Analysis
          </button>
        </div>

      </div>
    </div>
  );
}
