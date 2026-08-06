'use client';

import React, { useState } from 'react';
import { Search, Users, ShieldCheck, ShieldAlert, Eye, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function CandidatesTab({ candidates, setCandidates, onNotify }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const filteredCandidates = candidates.filter(c => {
    const matchQuery = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                       c.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter || (statusFilter === 'Flagged' && c.securityScan === 'Warning');
    return matchQuery && matchStatus;
  });

  const toggleCandidateStatus = (id) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Verified' ? 'Pending' : 'Verified' } : c));
    onNotify('Candidate status updated!');
  };

  const deleteCandidate = (id, name) => {
    if (confirm(`Remove candidate "${name}"?`)) {
      setCandidates(prev => prev.filter(c => c.id !== id));
      onNotify(`Candidate "${name}" removed.`);
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">
          <Users size={20} style={{ color: 'var(--admin-primary)' }} />
          <span>Candidate Filtering & Database</span>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
          Showing {filteredCandidates.length} results
        </span>
      </div>

      <div className="filter-bar">
        <div className="admin-search-bar" style={{ flex: 1, maxWidth: '360px' }}>
          <Search className="admin-search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search candidates..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Verification Statuses</option>
          <option value="Verified">Verified Only</option>
          <option value="Pending">Pending Only</option>
          <option value="Flagged">Flagged Security Scan</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Target Role</th>
              <th>Location</th>
              <th>Security Scan</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text-main)' }}>{c.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                      {c.email ? c.email : `ID: ${c.id.substring(0, 8)}...`}
                    </span>
                  </div>
                </td>
                <td>{c.role}</td>
                <td>{c.location}</td>
                <td>
                  {c.securityScan === 'Passed' ? (
                    <span className="badge badge-success"><ShieldCheck size={12} /> Clean</span>
                  ) : (
                    <span className="badge badge-warning"><ShieldAlert size={12} /> Warning</span>
                  )}
                </td>
                <td>
                  <button 
                    onClick={() => toggleCandidateStatus(c.id)} 
                    className={`badge ${c.status === 'Verified' ? 'badge-success' : 'badge-neutral'}`} 
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {c.status === 'Verified' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {c.status}
                  </button>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="admin-btn admin-btn-secondary" style={{ padding: '0.35rem 0.65rem', marginRight: '0.5rem' }} onClick={() => setSelectedCandidate(c)}>
                    <Eye size={14} /> Profile
                  </button>
                  <button className="admin-btn admin-btn-danger" style={{ padding: '0.35rem 0.5rem' }} onClick={() => deleteCandidate(c.id, c.name)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Candidate Profile Detail Modal */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Candidate Details</h2>
              <button className="modal-close-btn" onClick={() => setSelectedCandidate(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--admin-text-main)' }}>{selectedCandidate.name}</h3>
                <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Role: {selectedCandidate.role}</p>
                <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.825rem', marginTop: '0.25rem' }}>Location: {selectedCandidate.location}</p>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Skills Tagged:</label>
                <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(selectedCandidate.skills || ['Computer Science']).map((s, i) => (
                    <span key={i} className="badge badge-info">{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="admin-btn admin-btn-secondary" onClick={() => setSelectedCandidate(null)}>Close</button>
                <button 
                  className="admin-btn admin-btn-primary" 
                  onClick={() => {
                    toggleCandidateStatus(selectedCandidate.id);
                    setSelectedCandidate(null);
                  }}
                >
                  Toggle Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
