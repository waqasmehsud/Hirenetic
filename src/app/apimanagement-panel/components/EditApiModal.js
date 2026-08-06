'use client';

import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

export function EditApiModal({ isOpen, onClose, api, onSave }) {
  const [showKey, setShowKey] = useState(false);
  const [formData, setFormData] = useState({
    api_key: '',
    daily_quota: '',
    used_quota: '0',
    refresh_cycle: 'Daily',
    expiration_date: '',
    notes: '',
    status: 'Active',
  });

  useEffect(() => {
    if (api) {
      setFormData({
        api_key: api.api_key || '',
        daily_quota: api.daily_quota ? String(api.daily_quota) : '',
        used_quota: api.used_quota !== undefined && api.used_quota !== null ? String(api.used_quota) : '0',
        refresh_cycle: api.refresh_cycle || 'Daily',
        expiration_date: api.expiration_date || '',
        notes: api.notes || '',
        status: api.status || 'Active',
      });
    }
  }, [api]);

  if (!isOpen || !api) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedApi = {
      ...api,
      api_key: formData.api_key.trim(),
      daily_quota: formData.daily_quota ? Number(formData.daily_quota) : null,
      used_quota: formData.used_quota ? Number(formData.used_quota) : 0,
      refresh_cycle: formData.refresh_cycle || 'Daily',
      expiration_date: formData.expiration_date || null,
      notes: formData.notes.trim() || null,
      status: formData.status,
      last_updated: new Date().toISOString(),
    };

    onSave(updatedApi);
    onClose();
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '4px'
  };

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
        maxWidth: '520px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Edit API Key</h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>{api.name} ({api.provider})</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={inputStyle}
            >
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>API Key</label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type={showKey ? 'text' : 'password'}
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                style={{ ...inputStyle, paddingRight: '36px' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Quota Limit</label>
              <input
                type="number"
                placeholder="1000"
                value={formData.daily_quota}
                onChange={(e) => setFormData({ ...formData, daily_quota: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Expiration Date</label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Used Quota (Count)</label>
              <input
                type="number"
                placeholder="0"
                value={formData.used_quota}
                onChange={(e) => setFormData({ ...formData, used_quota: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Refresh Cycle</label>
              <select
                value={formData.refresh_cycle}
                onChange={(e) => setFormData({ ...formData, refresh_cycle: e.target.value })}
                style={inputStyle}
              >
                <option value="Daily">Daily (00:00 UTC)</option>
                <option value="Monthly">Monthly (1st UTC)</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              rows={3}
              placeholder="Usage context or update notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
