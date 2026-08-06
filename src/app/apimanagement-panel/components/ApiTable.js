'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Edit, Trash2, Info, CheckCircle, XCircle, Play } from 'lucide-react';
import { QuotaBar } from './QuotaBar';

export function ApiTable({ apis, onView, onEdit, onDelete, onTest }) {
  const [visibleKeyIds, setVisibleKeyIds] = useState({});

  const toggleKeyVisibility = (id) => {
    setVisibleKeyIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'LLM': return <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>🤖 LLM</span>;
      case 'Job API': return <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>💼 Job API</span>;
      case 'Scraper': return <span style={{ background: '#fffbeb', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>🕷️ Scraper</span>;
      default: return <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>🔧 {category}</span>;
    }
  };

  if (!apis || apis.length === 0) {
    return (
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>No API keys configured</div>
        <p style={{ fontSize: '13px', margin: '0 0 16px 0', color: '#64748b' }}>Get started by adding your first API key to manage quotas and reset timers.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <th style={{ padding: '12px 16px' }}>Name</th>
            <th style={{ padding: '12px 16px' }}>Category</th>
            <th style={{ padding: '12px 16px' }}>Provider</th>
            <th style={{ padding: '12px 16px' }}>API Key</th>
            <th style={{ padding: '12px 16px', minWidth: '200px' }}>Quota Usage & Reset Bar</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
            <th style={{ padding: '12px 16px' }}>Expiration</th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {apis.map((api) => {
            const isKeyVisible = visibleKeyIds[api.id];
            const maskedKey = api.api_key ? `••••••••${api.api_key.slice(-4)}` : '••••••••';
            const displayKey = isKeyVisible ? api.api_key : maskedKey;

            const isExpired = api.expiration_date && new Date(api.expiration_date) < new Date();
            const isExceeded = api.is_exceeded || api.status === 'Disabled';

            return (
              <tr key={api.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{api.name}</td>
                <td style={{ padding: '12px 16px' }}>{getCategoryBadge(api.category)}</td>
                <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 500 }}>{api.provider}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#334155' }}>{displayKey}</span>
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility(api.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px' }}
                      title={isKeyVisible ? 'Hide Key' : 'Show Key'}
                    >
                      {isKeyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <QuotaBar
                    limit={api.daily_quota}
                    used={api.used_quota || (isExceeded ? api.daily_quota || 1500 : 0)}
                    refreshCycle={api.refresh_cycle || 'Daily'}
                    isExceeded={isExceeded}
                  />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {api.status === 'Active' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                      <CheckCircle size={12} /> Active
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                      <XCircle size={12} /> Disabled
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: isExpired ? '#dc2626' : '#64748b', fontWeight: isExpired ? 600 : 400 }}>
                  {api.expiration_date ? new Date(api.expiration_date).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onTest && onTest(api)}
                      style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '5px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}
                      title="Test API Connection"
                    >
                      <Play size={13} fill="#16a34a" /> Test
                    </button>
                    <button
                      onClick={() => onView(api)}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '5px', padding: '4px 8px', cursor: 'pointer' }}
                      title="View Details"
                    >
                      <Info size={14} />
                    </button>
                    <button
                      onClick={() => onEdit(api)}
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: '5px', padding: '4px 8px', cursor: 'pointer' }}
                      title="Edit API"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(api)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '5px', padding: '4px 8px', cursor: 'pointer' }}
                      title="Delete API"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
