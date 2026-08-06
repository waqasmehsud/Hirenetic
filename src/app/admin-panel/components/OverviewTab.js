'use client';

import React from 'react';
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  ShieldCheck, 
  Zap, 
  Activity, 
  FileCheck2,
  TrendingUp,
  ExternalLink
} from 'lucide-react';

export default function OverviewTab({ stats, setActiveTab, onTriggerAction }) {
  return (
    <div>
      {/* Top 4 Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Total Candidates</span>
            <div className="metric-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="metric-value">{stats.totalCandidates}</div>
          <div className="metric-bottom">
            <span className="metric-trend-up">↑ +14.2%</span>
            <span style={{ color: 'var(--admin-text-muted)' }}>from last month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Active Job Listings</span>
            <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div className="metric-value">{stats.activeJobs}</div>
          <div className="metric-bottom">
            <span className="metric-trend-up">↑ +8 new</span>
            <span style={{ color: 'var(--admin-text-muted)' }}>this week</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Verified Recruiters</span>
            <div className="metric-icon-box" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
              <UserCheck size={18} />
            </div>
          </div>
          <div className="metric-value">{stats.hrAccounts}</div>
          <div className="metric-bottom">
            <span className="badge badge-success">{stats.totalApplications || 0} Applications Tracked</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">CV Security Scans</span>
            <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="metric-value">{stats.securityScans}</div>
          <div className="metric-bottom">
            <span className="metric-trend-up">0 threats detected</span>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Operational Metrics & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Quick System Operations */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Zap size={18} style={{ color: 'var(--admin-warning)' }} />
              <span>Quick Operations</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button className="admin-btn admin-btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setActiveTab('candidates')}>
              <Users size={16} /> Filter Candidates
            </button>
            <button className="admin-btn admin-btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setActiveTab('jobs')}>
              <Briefcase size={16} /> Manage Jobs
            </button>
            <button className="admin-btn admin-btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setActiveTab('scripts')}>
              <Activity size={16} /> Run Scripts
            </button>
            <button className="admin-btn admin-btn-primary" style={{ justifyContent: 'center' }} onClick={() => onTriggerAction('System Audit Completed Successfully!')}>
              <FileCheck2 size={16} /> Run Audit Scan
            </button>
          </div>
        </div>

        {/* System Uptime Bars */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <TrendingUp size={18} style={{ color: 'var(--admin-success)' }} />
              <span>System Operational Metrics</span>
            </div>
            <span className="badge badge-success">Healthy</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--admin-text-muted)' }}>Supabase Database API</span>
                <span style={{ color: 'var(--admin-success)', fontWeight: 600 }}>Connected</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '99%', height: '100%', background: 'var(--admin-success)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--admin-text-muted)' }}>GitHub Actions Integration</span>
                <span style={{ color: 'var(--admin-info)', fontWeight: 600 }}>Ready</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '95%', height: '100%', background: 'var(--admin-info)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--admin-text-muted)' }}>AI Resume Classifier Model</span>
                <span style={{ color: 'var(--admin-accent)', fontWeight: 600 }}>Active (v2.4)</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: 'var(--admin-accent)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Log Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <Activity size={18} style={{ color: 'var(--admin-primary)' }} />
            <span>Recent Platform Activity Logs</span>
          </div>
          <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
            View Full Logs
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Trigger</th>
                <th>Action Type</th>
                <th>Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>Today, 14:22</td>
                <td style={{ fontWeight: 600 }}>HR Manager (TechCorp)</td>
                <td>Posted New Job</td>
                <td>Senior Frontend Engineer (Remote)</td>
                <td><span className="badge badge-success">Approved</span></td>
              </tr>
              <tr>
                <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>Today, 13:45</td>
                <td style={{ fontWeight: 600 }}>Candidate (Ahmad R.)</td>
                <td>CV Security Scan</td>
                <td>Security verification scan passed</td>
                <td><span className="badge badge-success">Clean</span></td>
              </tr>
              <tr>
                <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>Today, 11:10</td>
                <td style={{ fontWeight: 600 }}>GitHub Action Runner</td>
                <td>Script Execution</td>
                <td>Automated inventory sync script</td>
                <td><span className="badge badge-info">Executed</span></td>
              </tr>
              <tr>
                <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>Yesterday, 19:04</td>
                <td style={{ fontWeight: 600 }}>Admin System</td>
                <td>Security Alert</td>
                <td>Blocked unauthorized API token attempt</td>
                <td><span className="badge badge-danger">Blocked</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
