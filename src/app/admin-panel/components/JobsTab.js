'use client';

import React, { useState } from 'react';
import { Search, Briefcase, Trash2, Building2, DollarSign } from 'lucide-react';

export default function JobsTab({ jobs, setJobs, onNotify }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredJobs = jobs.filter(j => {
    const matchQuery = j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       j.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const toggleJobStatus = (id) => {
    setJobs(prev => prev.map(j => {
      if (j.id === id) {
        const next = j.status === 'Active' ? 'Paused' : j.status === 'Paused' ? 'Closed' : 'Active';
        onNotify(`Job status changed to ${next}`);
        return { ...j, status: next };
      }
      return j;
    }));
  };

  const deleteJob = (id, title) => {
    if (confirm(`Remove job listing "${title}" from platform?`)) {
      setJobs(prev => prev.filter(j => j.id !== id));
      onNotify(`Job listing "${title}" removed.`);
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">
          <Briefcase size={20} style={{ color: 'var(--admin-primary)' }} />
          <span>Job Listings Control & Monitoring</span>
        </div>
        <span className="badge badge-info" style={{ padding: '0.4rem 0.75rem' }}>
          HR Job Posting Permission Enforced
        </span>
      </div>

      <p style={{ fontSize: '0.825rem', color: 'var(--admin-text-muted)', marginBottom: '1.25rem' }}>
        Note: Admin monitors, pauses, closes, or deletes platform job listings. New job creation is restricted to HR Recruiter accounts.
      </p>

      <div className="filter-bar">
        <div className="admin-search-bar" style={{ flex: 1, maxWidth: '360px' }}>
          <Search className="admin-search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search jobs or companies..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Job Statuses</option>
          <option value="Active">Active Listings</option>
          <option value="Paused">Paused Listings</option>
          <option value="Closed">Closed Listings</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Job Title & Company</th>
              <th>Location / Type</th>
              <th>Salary Range</th>
              <th>Applicants</th>
              <th>Status Control</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-muted)' }}>
                  No job listings found matching your search.
                </td>
              </tr>
            ) : (
              filteredJobs.map(j => (
                <tr key={j.id}>
                  <td>
                    <strong>{j.title}</strong><br/>
                    <span style={{ fontSize: '0.775rem', color: 'var(--admin-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Building2 size={12} /> {j.company}
                    </span>
                  </td>
                  <td>{j.location} ({j.type})</td>
                  <td><span className="badge badge-neutral"><DollarSign size={12} /> {j.salary}</span></td>
                  <td><span className="badge badge-info">{j.applicantsCount} Applicants</span></td>
                  <td>
                    <button 
                      onClick={() => toggleJobStatus(j.id)} 
                      className={`badge ${j.status === 'Active' ? 'badge-success' : j.status === 'Paused' ? 'badge-warning' : 'badge-danger'}`} 
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click to toggle status (Active -> Paused -> Closed)"
                    >
                      {j.status}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="admin-btn admin-btn-danger" 
                      style={{ padding: '0.35rem 0.5rem' }} 
                      onClick={() => deleteJob(j.id, j.title)}
                      title="Delete job listing"
                    >
                      <Trash2 size={14} />
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
