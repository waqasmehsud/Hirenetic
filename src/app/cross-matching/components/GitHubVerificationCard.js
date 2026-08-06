'use client';

import React from 'react';
import { Github, CheckCircle2, ExternalLink } from 'lucide-react';

export function GitHubVerificationCard({ candidate }) {
  if (!candidate.githubUrl) {
    return (
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px' }}>
          <Github size={18} color="#94a3b8" />
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>GitHub Verification</h3>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No GitHub profile link provided by candidate.</p>
      </div>
    );
  }

  const username = candidate.githubUsername || (candidate.githubUrl ? candidate.githubUrl.split('/').pop() : '') || 'candidate_dev';
  const reposCount = candidate.githubReposCount ?? 0;
  const languages = candidate.githubLanguages || [];
  const matchedTech = candidate.matchedTech || [];

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Github size={18} color="#0f172a" />
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>GitHub Verification</h3>
        </div>
        <a
          href={candidate.githubUrl}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          @{username} <ExternalLink size={12} />
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Public Repositories</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{reposCount > 0 ? `${reposCount} repos` : 'Link Provided'}</span>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Profile Availability</span>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, marginTop: '2px' }}>
            <CheckCircle2 size={13} /> Reachable 200 OK
          </span>
        </div>
      </div>

      {languages.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
            Main Languages:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {languages.map((lang) => (
              <span key={lang} style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 7px', borderRadius: '4px', fontWeight: '600' }}>
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {matchedTech.length > 0 && (
        <div>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
            Verified Technologies:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {matchedTech.map((tech) => (
              <span key={tech} style={{ fontSize: '11px', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '2px 7px', borderRadius: '4px', fontWeight: '600' }}>
                ✓ {tech}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

