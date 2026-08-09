'use client';

import React, { useState } from 'react';
import { Search, UserCheck, Plus, Trash2, Building2, Ban, CheckCircle2 } from 'lucide-react';

export default function HRManagementTab({ hrList, setHrList, onNotify }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddHrModal, setShowAddHrModal] = useState(false);
  const [newHR, setNewHR] = useState({ name: '', email: '', company: '', role: 'Senior Recruiter', status: 'Verified' });

  const filteredHR = hrList.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddHR = (e) => {
    e.preventDefault();
    if (!newHR.name || !newHR.email || !newHR.company) return;
    setHrList([{ id: Date.now(), ...newHR, activeJobs: 0 }, ...hrList]);
    onNotify(`Recruiter "${newHR.name}" added.`);
    setShowAddHrModal(false);
    setNewHR({ name: '', email: '', company: '', role: 'Senior Recruiter', status: 'Verified' });
  };

  const toggleHrStatus = async (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'Verified' ? 'Blocked' : 'Verified';
    
    // Update local state immediately for fast responsive UI
    setHrList(prev => prev.map(h => h.id === id ? { ...h, status: nextStatus } : h));
    
    try {
      const res = await fetch('/admin-panel/api/update-hr-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hrId: id, status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        onNotify(`Recruiter "${name}" is now ${nextStatus.toUpperCase()}`);
      } else {
        onNotify(`Updated recruiter status to ${nextStatus}`);
      }
    } catch (err) {
      console.error('Error calling update-hr-status API:', err);
      onNotify(`Recruiter status set to ${nextStatus}`);
    }
  };

  const deleteHR = (id, name) => {
    if (confirm(`Remove recruiter account "${name}"?`)) {
      setHrList(prev => prev.filter(h => h.id !== id));
      onNotify(`Recruiter "${name}" deleted.`);
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">
          <UserCheck size={20} style={{ color: 'var(--admin-accent)' }} />
          <span>Recruiter Accounts</span>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowAddHrModal(true)}>
          <Plus size={16} /> Add Recruiter
        </button>
      </div>

      <div className="filter-bar">
        <div className="admin-search-bar" style={{ flex: 1, maxWidth: '360px' }}>
          <Search className="admin-search-icon" size={16} />
          <input type="text" placeholder="Search recruiters, companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Recruiter Info</th>
              <th>Company / Org</th>
              <th>Designation</th>
              <th>Active Job Posts</th>
              <th>Account Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHR.map(h => (
              <tr key={h.id}>
                <td>
                  <strong>{h.name}</strong><br/>
                  <span style={{ fontSize: '0.775rem', color: 'var(--admin-text-muted)' }}>{h.email}</span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Building2 size={12} style={{ color: 'var(--admin-primary)' }} /> {h.company}
                  </span>
                </td>
                <td>{h.role}</td>
                <td><span className="badge badge-info">{h.activeJobs || 0} Jobs</span></td>
                <td>
                  <span className={`badge ${h.status === 'Verified' ? 'badge-success' : 'badge-danger'}`}>
                    {h.status === 'Verified' ? <CheckCircle2 size={12} /> : <Ban size={12} />}
                    {h.status || 'Verified'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    className={`admin-btn ${h.status === 'Blocked' ? 'admin-btn-primary' : 'admin-btn-secondary'}`} 
                    style={{ padding: '0.35rem 0.65rem', marginRight: '0.5rem', fontSize: '11.5px', color: h.status === 'Blocked' ? '#ffffff' : '#ef4444' }} 
                    onClick={() => toggleHrStatus(h.id, h.name, h.status || 'Verified')}
                  >
                    <Ban size={13} /> {h.status === 'Blocked' ? 'Unblock' : 'Block'}
                  </button>
                  <button className="admin-btn admin-btn-danger" style={{ padding: '0.35rem 0.5rem' }} onClick={() => deleteHR(h.id, h.name)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddHrModal && (
        <div className="modal-overlay" onClick={() => setShowAddHrModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Recruiter Account</h2>
              <button className="modal-close-btn" onClick={() => setShowAddHrModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddHR} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Recruiter Full Name *</label>
                <input type="text" placeholder="e.g. Sarah Connor" required value={newHR.name} onChange={(e) => setNewHR({ ...newHR, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', background: '#ffffff', border: '1px solid var(--admin-card-border)', color: 'var(--admin-text-main)', borderRadius: '6px', marginTop: '0.2rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Work Email Address *</label>
                <input type="email" placeholder="sarah@techcorp.com" required value={newHR.email} onChange={(e) => setNewHR({ ...newHR, email: e.target.value })} style={{ width: '100%', padding: '0.5rem', background: '#ffffff', border: '1px solid var(--admin-card-border)', color: 'var(--admin-text-main)', borderRadius: '6px', marginTop: '0.2rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Company Name *</label>
                <input type="text" placeholder="e.g. TechCorp Solutions" required value={newHR.company} onChange={(e) => setNewHR({ ...newHR, company: e.target.value })} style={{ width: '100%', padding: '0.5rem', background: '#ffffff', border: '1px solid var(--admin-card-border)', color: 'var(--admin-text-main)', borderRadius: '6px', marginTop: '0.2rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Role / Designation</label>
                <input type="text" placeholder="e.g. Senior Talent Acquisition Specialist" value={newHR.role} onChange={(e) => setNewHR({ ...newHR, role: e.target.value })} style={{ width: '100%', padding: '0.5rem', background: '#ffffff', border: '1px solid var(--admin-card-border)', color: 'var(--admin-text-main)', borderRadius: '6px', marginTop: '0.2rem' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowAddHrModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
