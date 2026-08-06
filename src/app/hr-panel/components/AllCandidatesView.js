'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  RefreshCw,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  FileText,
  CheckCircle2,
  ExternalLink,
  Code2,
  Filter,
  Sparkles
} from 'lucide-react';

export default function AllCandidatesView({
  realCandidates = [],
  loading = false,
  onRefresh,
  onSelectCandidate
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');

  const safeCandidates = Array.isArray(realCandidates) ? realCandidates : [];

  // Filter candidates based on search term & field filter
  const filteredCandidates = safeCandidates.filter(c => {
    const name = (c.full_name || c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const title = (c.title || c.resume_field || '').toLowerCase();
    const location = (c.location || '').toLowerCase();
    const skillsStr = Array.isArray(c.skills) ? c.skills.join(' ').toLowerCase() : '';
    
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || name.includes(query) || email.includes(query) || title.includes(query) || location.includes(query) || skillsStr.includes(query);

    const matchesField = fieldFilter === 'all' || 
      (c.resume_field && c.resume_field.toLowerCase().includes(fieldFilter.toLowerCase())) ||
      (c.title && c.title.toLowerCase().includes(fieldFilter.toLowerCase()));

    return matchesSearch && matchesField;
  });

  return (
    <section className="view-section active">
      {/* Top Header Bar */}
      <div className="view-header-bar flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck style={{ color: '#2563eb' }} size={22} />
            Registered Candidates Directory (Real Database)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Real candidate profiles & parsed resumes fetched directly from Supabase PostgreSQL database.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Fetching DB...' : 'Refresh Real DB'}
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search candidates by name, email, skills, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              outline: 'none',
              background: '#ffffff',
              color: '#0f172a'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} style={{ color: '#64748b' }} />
          <select
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value)}
            style={{
              padding: '9.5px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              background: '#ffffff',
              color: '#334155',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Domains & Fields</option>
            <option value="Software">Software Engineering / Dev</option>
            <option value="Cybersecurity">Cybersecurity & SecOps</option>
            <option value="Data">Data Science & AI</option>
            <option value="Cloud">Cloud & DevOps</option>
          </select>
        </div>

        <div style={{ fontSize: '13px', fontWeight: '600', color: '#475569', padding: '6px 12px', background: '#f1f5f9', borderRadius: '8px' }}>
          Total Candidates: <span style={{ color: '#2563eb' }}>{filteredCandidates.length}</span> / {safeCandidates.length}
        </div>
      </div>

      {/* Real Candidates Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }}></div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>Loading Live Database Candidates...</div>
          <div style={{ fontSize: '12.5px', marginTop: '4px' }}>Querying public.candidates_profiles table in Supabase.</div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <UserCheck size={44} style={{ color: '#94a3b8', strokeWidth: 1.5, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>No Candidates Found</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {safeCandidates.length === 0 ? 'No candidate profiles currently exist in public.candidates_profiles database.' : 'No candidates match your current search and field filters.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {filteredCandidates.map(c => {
            const name = c.full_name || c.name || 'Candidate User';
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CD';
            const email = c.email || 'No Email';
            const phone = c.phone || 'No Phone';
            const title = c.title || c.resume_field || 'Technical Candidate';
            const location = c.location || 'Location Not Set';
            const skills = Array.isArray(c.skills) ? c.skills : [];
            const hasCv = Boolean(c.cv_file_path || c.resume_text);
            const activeProvider = c.active_llm_provider || '';

            return (
              <div
                key={c.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  {/* Card Header: Avatar & Domain Badge */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#2563eb', color: '#ffffff', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
                        {initials}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15.5px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{name}</h3>
                        <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#2563eb', marginTop: '2px' }}>{title}</div>
                      </div>
                    </div>

                    <span style={{ fontSize: '11px', fontWeight: '600', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      {c.resume_field || 'Technical'}
                    </span>
                  </div>

                  {/* Contact Info Row */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={13} style={{ color: '#94a3b8' }} />
                      <span style={{ color: '#334155' }}>{email}</span>
                    </div>
                    {phone && phone !== 'No Phone' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} style={{ color: '#94a3b8' }} />
                        <span>{phone}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} style={{ color: '#94a3b8' }} />
                      <span>{location}</span>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  {skills.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '6px' }}>Skills Stack</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {skills.slice(0, 5).map((sk, idx) => (
                          <span key={idx} style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe', padding: '2px 8px', borderRadius: '6px', fontWeight: '500' }}>
                            {sk}
                          </span>
                        ))}
                        {skills.length > 5 && (
                          <span style={{ fontSize: '11px', color: '#64748b', padding: '2px 4px' }}>+{skills.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Provider Notice */}
                  {activeProvider && (
                    <div style={{ fontSize: '11.5px', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                      <Sparkles size={12} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeProvider}</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom Row: CV Status & View Profile Action */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    {hasCv ? (
                      <span style={{ color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={13} /> Real Resume Attached
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Profile Only</span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectCandidate(c)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: '#2563eb',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>View Profile</span>
                    <ExternalLink size={13} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
