'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { QuotaBar } from './QuotaBar';

export function ViewApiModal({ isOpen, onClose, api }) {
  const [showKey, setShowKey] = useState(false);

  if (!isOpen || !api) return null;

  const itemGroup = {
    marginBottom: '14px'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    display: 'block'
  };

  const valueStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#0f172a'
  };

  const maskedKey = api.api_key ? `••••••••${api.api_key.slice(-4)}` : '••••••••';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#0f172a' }}>{api.name}</h2>
            <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>{api.category} • {api.provider}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={itemGroup}>
            <span style={labelStyle}>Status</span>
            <div>
              {api.status === 'Active' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                  <CheckCircle size={12} /> Active
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                  <XCircle size={12} /> Disabled
                </span>
              )}
            </div>
          </div>

          <div style={itemGroup}>
            <span style={labelStyle}>Quota Usage & Reset</span>
            <QuotaBar
              limit={api.daily_quota}
              used={api.used_quota || 0}
              refreshCycle={api.refresh_cycle || 'Daily'}
            />
          </div>
        </div>

        <div style={itemGroup}>
          <span style={labelStyle}>API Key Token</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px' }}>
            <span>{showKey ? api.api_key : maskedKey}</span>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {api.base_url && (
          <div style={itemGroup}>
            <span style={labelStyle}>Base URL</span>
            <div style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '12.5px', color: '#334155' }}>{api.base_url}</div>
          </div>
        )}

        {api.model && (
          <div style={itemGroup}>
            <span style={labelStyle}>Model</span>
            <div style={valueStyle}>{api.model}</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={itemGroup}>
            <span style={labelStyle}>Expiration Date</span>
            <div style={valueStyle}>{api.expiration_date ? new Date(api.expiration_date).toLocaleDateString() : 'N/A'}</div>
          </div>

          <div style={itemGroup}>
            <span style={labelStyle}>Last Updated</span>
            <div style={valueStyle}>{api.last_updated ? new Date(api.last_updated).toLocaleDateString() : 'Recent'}</div>
          </div>
        </div>

        {api.notes && (
          <div style={itemGroup}>
            <span style={labelStyle}>Notes</span>
            <div style={{ fontSize: '13px', color: '#475569', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>{api.notes}</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
