'use client';

import React from 'react';
import { Linkedin, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export function LinkedInVerificationCard({ candidate }) {
  if (!candidate.linkedinUrl) {
    return (
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px' }}>
          <Linkedin size={18} color="#94a3b8" />
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>LinkedIn Verification</h3>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No LinkedIn profile link added by candidate.</p>
      </div>
    );
  }

  const comparisonItems = [
    { label: 'Job Titles', status: candidate.position ? 'Match' : 'Not Specified', detail: candidate.position || 'Not specified' },
    { label: 'Company Experience', status: candidate.company ? (candidate.companyMatch ? 'Match' : 'Partial Match') : 'Pending Verification', detail: candidate.company || 'Profile link provided' },
    { label: 'Education Degree', status: candidate.education ? 'Match' : 'Not Specified', detail: candidate.education || 'Not specified' },
    { label: 'Skills Alignment', status: candidate.skillsScore ? (candidate.skillsScore > 80 ? 'Match' : 'Review Required') : 'Pending', detail: candidate.skillsScore ? `${candidate.skillsScore}% alignment` : 'Pending evaluation' },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Linkedin size={18} color="#0a66c2" />
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>LinkedIn Verification</h3>
        </div>
        <a
          href={candidate.linkedinUrl}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: '12px', color: '#0a66c2', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          View Profile <ExternalLink size={12} />
        </a>
      </div>

      <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        CV vs LinkedIn Comparison Matrix
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {comparisonItems.map((item) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#0f172a' }}>{item.label}</div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>{item.detail}</div>
            </div>
            <div>
              {item.status === 'Match' ? (
                <span style={{ fontSize: '11px', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <CheckCircle2 size={12} /> Match
                </span>
              ) : (
                <span style={{ fontSize: '11px', backgroundColor: '#fffbeb', color: '#b45309', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <AlertTriangle size={12} /> {item.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
