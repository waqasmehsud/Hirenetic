'use client';

import React from 'react';
import { Target, AlertTriangle } from 'lucide-react';

export function MatchScoreSummary({ candidate }) {
  const skillsScore = candidate.skillsScore ?? 0;
  const expScore = candidate.expScore ?? 0;
  const projectsScore = candidate.projectsScore ?? 0;
  const overallScore = candidate.overallMatch ?? Math.round((skillsScore + expScore + projectsScore) / 3);

  // Generate warning badges based on crossmatch specifications
  const warnings = [];
  if (!candidate.githubUrl) warnings.push('Missing GitHub');
  if (!candidate.portfolioUrl) warnings.push('Missing Portfolio');
  if (!candidate.linkedinUrl) warnings.push('LinkedIn Not Added');
  if (skillsScore < 70) warnings.push('Skills Not Found');
  if (overallScore < 75 || warnings.length > 0) warnings.push('Manual Review Recommended');

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Target size={18} color="#2563eb" />
        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Match Summary & Score Breakdown</h3>
      </div>

      {/* Percentage Progress Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {/* Skills Match */}
        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600', display: 'block' }}>Skills Match</span>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>{skillsScore}%</div>
        </div>

        {/* Experience Match */}
        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600', display: 'block' }}>Experience Match</span>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{expScore}%</div>
        </div>

        {/* Projects Match */}
        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600', display: 'block' }}>Projects Match</span>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#8b5cf6', marginTop: '4px' }}>{projectsScore}%</div>
        </div>

        {/* Overall Match */}
        <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <span style={{ fontSize: '11.5px', color: '#1d4ed8', fontWeight: '700', display: 'block' }}>Overall Match</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>{overallScore}%</div>
        </div>
      </div>

      {/* Warning Badges Section */}
      <div>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          System Audit Warnings ({warnings.length})
        </span>

        {warnings.length === 0 ? (
          <div style={{ fontSize: '12.5px', color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '6px' }}>
            ✓ Clean Profile — All verification checks passed with zero warnings.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {warnings.map((w) => (
              <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '3px 9px', borderRadius: '5px', fontSize: '11.5px', fontWeight: '600' }}>
                <AlertTriangle size={12} /> {w}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
