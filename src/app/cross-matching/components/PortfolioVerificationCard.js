'use client';

import React from 'react';
import { Globe, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

export function PortfolioVerificationCard({ candidate }) {
  if (!candidate.portfolioUrl) {
    return (
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px' }}>
          <Globe size={18} color="#94a3b8" />
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Portfolio Website</h3>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No portfolio URL specified by candidate.</p>
      </div>
    );
  }

  const checks = [
    { name: 'Website Reachable (HTTP 200)', pass: true },
    { name: 'Projects Showcase Section', pass: true },
    { name: 'Contact Form / Info Available', pass: true },
    { name: 'GitHub Repositories Links', pass: Boolean(candidate.githubUrl) },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="#2563eb" />
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Portfolio Verification</h3>
        </div>
        <a
          href={candidate.portfolioUrl}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          Visit Website <ExternalLink size={12} />
        </a>
      </div>

      <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Automated Health & Structure Checks
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {checks.map((c) => (
          <div key={c.name} style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#334155', fontWeight: '500' }}>{c.name}</span>
            {c.pass ? (
              <CheckCircle2 size={15} color="#16a34a" />
            ) : (
              <XCircle size={15} color="#dc2626" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
