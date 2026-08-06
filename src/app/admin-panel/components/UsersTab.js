'use client';

import React, { useState } from 'react';
import { Search, Users, CheckCircle2, Mail } from 'lucide-react';

export default function UsersTab({ candidates, hrList, onNotify }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Pure Real Database Users
  const realUsers = [
    ...candidates.map(c => ({ 
      id: c.id, 
      name: c.name, 
      email: c.email || null, 
      role: c.role === 'researcher' ? 'Researcher / Candidate' : (c.role || 'Candidate'), 
      detail: c.skills ? c.skills.join(', ') : 'Registered Profile', 
      status: c.status || 'Verified' 
    })),
    ...hrList.map(h => ({ 
      id: h.id, 
      name: h.name, 
      email: h.email || null, 
      role: 'HR / Recruiter', 
      detail: h.company || 'Recruiter Account', 
      status: h.status || 'Verified' 
    }))
  ];

  const filteredUsers = realUsers.filter(u => {
    const matchQuery = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                       u.detail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchQuery && matchRole;
  });

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">
          <Users size={20} style={{ color: 'var(--admin-primary)' }} />
          <span>Real Supabase Database Users Directory</span>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
          DB Users Count: {filteredUsers.length}
        </span>
      </div>

      {/* Search and Role Filter Bar */}
      <div className="filter-bar">
        <div className="admin-search-bar" style={{ flex: 1, maxWidth: '360px' }}>
          <Search className="admin-search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search real DB users..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Real DB User Roles</option>
          <option value="researcher">Researcher Users</option>
          <option value="candidate">Candidate Users</option>
          <option value="hr">HR / Recruiters</option>
        </select>
      </div>

      {/* Users Data Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Info (Full Name)</th>
              <th>DB Assigned Role</th>
              <th>Profile Field / Specialization</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-muted)' }}>
                  No users found in database profiles table.
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong><br/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                      {u.email ? u.email : `ID: ${u.id.substring(0, 8)}...`}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info"><Users size={12} /> {u.role}</span>
                  </td>
                  <td>{u.detail}</td>
                  <td>
                    <span className={`badge ${u.status === 'Verified' ? 'badge-success' : 'badge-neutral'}`}>
                      <CheckCircle2 size={12} /> {u.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="admin-btn admin-btn-secondary" 
                      style={{ padding: '0.35rem 0.65rem' }}
                      onClick={() => onNotify(`Selected profile for ${u.name}`)}
                    >
                      <Mail size={14} /> Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
