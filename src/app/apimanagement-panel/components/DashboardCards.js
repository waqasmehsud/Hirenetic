'use client';

import React from 'react';
import { KeyRound, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export function DashboardCards({ apis }) {
  const totalApis = apis.length;
  const activeApis = apis.filter((a) => a.status === 'Active').length;
  const disabledApis = apis.filter((a) => a.status === 'Disabled').length;

  const expiringSoonCount = apis.filter((a) => {
    if (!a.expiration_date) return false;
    const diffDays = Math.ceil(
      (new Date(a.expiration_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    );
    return diffDays >= 0 && diffDays <= 7;
  }).length;

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
      {/* 1. Total APIs */}
      <div style={cardStyle}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Total APIs</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{totalApis}</div>
        </div>
        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <KeyRound size={20} />
        </div>
      </div>

      {/* 2. Active APIs */}
      <div style={cardStyle}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Active APIs</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{activeApis}</div>
        </div>
        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={20} />
        </div>
      </div>

      {/* 3. Disabled APIs */}
      <div style={cardStyle}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Disabled APIs</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>{disabledApis}</div>
        </div>
        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <XCircle size={20} />
        </div>
      </div>

      {/* 4. Expiring Soon */}
      <div style={cardStyle}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Expiring Soon</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>{expiringSoonCount}</div>
        </div>
        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={20} />
        </div>
      </div>
    </div>
  );
}
