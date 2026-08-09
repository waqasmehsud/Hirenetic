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
  Sparkles,
  Eye
} from 'lucide-react';

export default function AllCandidatesView({
  realCandidates = [],
  loading = false,
  globalSearch = '',
  onRefresh,
  onSelectCandidate
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');

  const safeCandidates = Array.isArray(realCandidates) ? realCandidates : [];

  const activeQuery = (globalSearch || searchTerm).toLowerCase().trim();

  // Filter candidates based on search term & field filter
  const filteredCandidates = safeCandidates.filter(c => {
    const name = (c.full_name || c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const title = (c.title || c.resume_field || '').toLowerCase();
    const location = (c.location || '').toLowerCase();
    const skillsStr = Array.isArray(c.skills) ? c.skills.join(' ').toLowerCase() : '';
    
    const matchesSearch = !activeQuery || name.includes(activeQuery) || email.includes(activeQuery) || title.includes(activeQuery) || location.includes(activeQuery) || skillsStr.includes(activeQuery);

    const matchesField = fieldFilter === 'all' || 
      (c.resume_field && c.resume_field.toLowerCase().includes(fieldFilter.toLowerCase())) ||
      (c.title && c.title.toLowerCase().includes(fieldFilter.toLowerCase()));

    return matchesSearch && matchesField;
  });

  return (
    <section className="view-section active">
      {/* Domain Filter & Counter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} style={{ color: '#64748b' }} />
          <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#475569' }}>Domain Filter:</span>
          <select
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12.5px',
              outline: 'none',
              background: '#ffffff',
              color: '#334155',
              fontWeight: '600',
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

        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569', padding: '6px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          Candidates Found: <span style={{ color: '#2563eb' }}>{filteredCandidates.length}</span> / {safeCandidates.length}
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
                  justifyContent: 'space-between',
                  height: '100%',
                  minHeight: '380px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  
                  {/* 1. Header: Avatar, Name, Title & Domain Badge (Fixed Alignment) */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', minHeight: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                      }}>
                        {initials}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={name}>
                          {name}
                        </h3>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={title}>
                          {title}
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '10px', fontWeight: '700', background: '#f8fafc', color: '#475569', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0, marginLeft: '8px' }}>
                      {c.resume_field || 'Technical'}
                    </span>
                  </div>

                  {/* 2. Contact Info Box (Fixed Height & Uniform Layout) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '14px', background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9', minHeight: '84px', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={13.5} style={{ color: '#2563eb', flexShrink: 0 }} />
                      <span style={{ color: '#1e293b', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={email}>{email}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={13.5} style={{ color: phone && phone !== 'No Phone' ? '#2563eb' : '#94a3b8', flexShrink: 0 }} />
                      <span style={{ color: phone && phone !== 'No Phone' ? '#475569' : '#94a3b8', fontSize: '11.5px' }}>
                        {phone && phone !== 'No Phone' ? phone : 'Phone Not Provided'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={13.5} style={{ color: '#64748b', flexShrink: 0 }} />
                      <span style={{ color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={location}>{location}</span>
                    </div>
                  </div>

                  {/* 3. Skills Stack Chips (Fixed Height Slot for Perfect Alignment) */}
                  <div style={{ marginBottom: '12px', minHeight: '68px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Skills Stack
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxHeight: '44px', overflow: 'hidden' }}>
                      {skills.length > 0 ? (
                        skills.slice(0, 5).map((sk, idx) => (
                          <span key={idx} style={{ fontSize: '11px', background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                            {sk}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>General Technical Profile</span>
                      )}
                      {skills.length > 5 && (
                        <span style={{ fontSize: '10.5px', color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' }}>
                          +{skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4. AI Provider Notice Slot (Fixed Slot Height) */}
                  <div style={{ minHeight: '26px', marginBottom: '12px' }}>
                    {activeProvider ? (
                      <div style={{ fontSize: '10.5px', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Sparkles size={11} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600' }}>Active LLM: {activeProvider}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '10.5px', color: '#64748b', background: '#f8fafc', border: '1px solid #f1f5f9', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <UserCheck size={11} style={{ color: '#94a3b8' }} />
                        <span style={{ fontWeight: '500' }}>Standard Candidate Profile</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* 5. Card Bottom Action Row (Strictly Anchored to Bottom) */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                    {hasCv ? (
                      <span style={{ color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px' }}>
                        <FileText size={12} /> Real Resume Attached
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '11px', background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>Profile Only</span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectCandidate(c)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: '#0f172a',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                    }}
                  >
                    <Eye size={13} />
                    <span>Profile</span>
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
