'use client';

import React from 'react';

export function ApiMonitorCard({ item }) {
  const usagePercentage = Math.min(
    Math.round((item.current_usage / item.monthly_limit) * 100),
    100
  );

  const daysUntilExpiration = Math.ceil(
    (new Date(item.expires_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  const isExpiringSoon = daysUntilExpiration <= 7;
  const isOverQuota = usagePercentage >= 90;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '18px 20px',
      color: '#0f172a'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 2px 0', color: '#0f172a' }}>{item.account_name}</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{item.provider}</span>
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: '6px',
          background: item.is_active && !isExpiringSoon ? '#eff6ff' : '#fffbeb',
          color: item.is_active && !isExpiringSoon ? '#2563eb' : '#d97706',
          border: item.is_active && !isExpiringSoon ? '1px solid #bfdbfe' : '1px solid #fde68a'
        }}>
          {item.is_active ? (isExpiringSoon ? 'Expiring Soon' : 'Active') : 'Disabled'}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ margin: '14px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
          <span>Quota</span>
          <span style={{ fontWeight: 600, color: '#334155' }}>
            {item.current_usage.toLocaleString()} / {item.monthly_limit.toLocaleString()} ({usagePercentage}%)
          </span>
        </div>
        <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
          <div
            style={{
              height: '6px',
              borderRadius: '6px',
              transition: 'width 0.3s ease',
              width: `${usagePercentage}%`,
              backgroundColor: isOverQuota ? '#ef4444' : usagePercentage > 70 ? '#f59e0b' : '#2563eb'
            }}
          />
        </div>
      </div>

      {/* Expiration Metadata */}
      <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
        <span>Reg: {new Date(item.registered_at).toLocaleDateString()}</span>
        <span style={{ color: isExpiringSoon ? '#dc2626' : '#64748b', fontWeight: isExpiringSoon ? 600 : 400 }}>
          Exp: {new Date(item.expires_at).toLocaleDateString()} ({daysUntilExpiration}d left)
        </span>
      </div>
    </div>
  );
}
