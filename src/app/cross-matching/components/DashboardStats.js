'use client';

import React from 'react';
import { Users, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export function DashboardStats({ candidates }) {
  const total = candidates.length;
  const verified = candidates.filter((c) => c.status === 'Verified').length;
  const needsReview = candidates.filter((c) => c.status === 'Needs Review' || c.status === 'Pending').length;

  const totalScoreSum = candidates.reduce((sum, c) => sum + (c.overallMatch || 0), 0);
  const avgScore = total > 0 ? Math.round(totalScoreSum / total) : 0;

  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {/* Total Candidates Checked */}
      <div style={cardStyle}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Total Checked</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{total}</div>
        </div>
        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={20} />
        </div>
      </div>

      {/* Verified Candidates */}
      <div style={cardStyle}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Verified</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{verified}</div>
        </div>
        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={20} />
        </div>
      </div>

      {/* Needs Review */}
      <div style={cardStyle}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Needs Review</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>{needsReview}</div>
        </div>
        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle size={20} />
        </div>
      </div>

      {/* Average Match Score */}
      <div style={cardStyle}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Avg Match Score</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>{avgScore}%</div>
        </div>
        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={20} />
        </div>
      </div>
    </div>
  );
}
