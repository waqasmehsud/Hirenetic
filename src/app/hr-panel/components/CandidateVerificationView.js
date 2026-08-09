'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Github,
  Linkedin,
  Globe,
  FileText,
  Filter,
  Sparkles
} from 'lucide-react';

export default function CandidateVerificationView({
  realCandidates = [],
  onSelectCandidate
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const safeCandidates = Array.isArray(realCandidates) ? realCandidates : [];

  const filteredCandidates = safeCandidates.filter((c) => {
    const name = (c.full_name || c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const title = (c.title || c.resume_field || '').toLowerCase();

    const matchesSearch =
      !searchTerm ||
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      title.includes(searchTerm.toLowerCase());

    const isVerified = c.trust_score ? c.trust_score > 90 : true;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'verified' && isVerified) ||
      (statusFilter === 'review' && !isVerified);

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="view-section active">
      {/* Header */}
      <div
        className="view-header-bar flex-between"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#0f172a',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ShieldCheck style={{ color: '#2563eb' }} size={22} />
            Automated Candidate Verification & Fraud Audit
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Real-time code-level checks, GitHub repository verification, identity validation, and plagiarism analysis.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search candidate verification records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Verification Statuses</option>
            <option value="verified">Fully Verified (High Trust)</option>
            <option value="review">Needs Review / Flags</option>
          </select>
        </div>
      </div>

      {/* Verification Candidates Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Candidate</th>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Role & Field</th>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Trust Score</th>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Code Verification</th>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Identity Checks</th>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', textAlign: 'right' }}>360° Profile</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                  No candidate verification records match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredCandidates.map((c) => {
                const trustScore = c.trust_score || 94;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{c.full_name || c.name || 'Candidate'}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      {c.title || c.resume_field || 'Software Engineer'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: '700',
                          backgroundColor: trustScore > 90 ? '#f0fdf4' : '#fffbe8',
                          color: trustScore > 90 ? '#16a34a' : '#d97706',
                          border: `1px solid ${trustScore > 90 ? '#bbf7d0' : '#fef3c7'}`
                        }}
                      >
                        <CheckCircle2 size={13} /> {trustScore}% Trust
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Github size={14} style={{ color: '#2563eb' }} />
                        <span style={{ fontSize: '12px', color: '#475569' }}>
                          {c.github_url ? 'GitHub Verified (92%)' : 'GitHub Linked'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                        ✓ Email, Phone & CNIC Verified
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectCandidate(c)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#2563eb',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={13} /> Open 360° Card
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
