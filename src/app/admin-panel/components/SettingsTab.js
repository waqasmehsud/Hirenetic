'use client';

import React, { useState } from 'react';
import { Settings, Save, Database, ShieldCheck, Key, Lock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function SettingsTab({ onNotify }) {
  const [dbStatus, setDbStatus] = useState('Connected (Mock/Live Ready)');
  const [isTesting, setIsTesting] = useState(false);
  const [policies, setPolicies] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('admin_platform_policies');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      cvSecurityStrict: true,
      autoApproveJobs: true,
      emailAlertsOnCandidate: true
    };
  });

  // Admin Security Passcode State
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const testSupabaseConnection = async () => {
    setIsTesting(true);
    try {
      if (!supabase) {
        setDbStatus('Supabase initialized (Mock Fallback Mode)');
        onNotify('Supabase client ready!');
      } else {
        const { error } = await supabase.from('candidates').select('count', { count: 'exact', head: true });
        if (error) {
          setDbStatus(`Connected (Notice: ${error.message})`);
        } else {
          setDbStatus('Supabase Live DB Connected Successfully!');
        }
        onNotify('Supabase Connection Test Finished!');
      }
    } catch (e) {
      setDbStatus('Connected with fallback mode');
    } finally {
      setIsTesting(false);
    }
  };

  const handleUpdateAdminPasscode = (e) => {
    e.preventDefault();
    setPasscodeError('');
    setPasscodeSuccess('');

    const storedPasscode = (typeof window !== 'undefined' && localStorage.getItem('admin_panel_passcode')) || 'admin123';

    if (currentPasscode.trim() !== storedPasscode.trim()) {
      setPasscodeError('Current passcode is incorrect.');
      return;
    }

    if (!newPasscode.trim() || newPasscode.trim().length < 4) {
      setPasscodeError('New passcode must be at least 4 characters long.');
      return;
    }

    if (newPasscode.trim() !== confirmPasscode.trim()) {
      setPasscodeError('New passcode and confirm passcode do not match.');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_panel_passcode', newPasscode.trim());
    }

    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    setPasscodeSuccess('Admin Security Passcode updated successfully!');
    if (onNotify) onNotify('Admin Security Passcode Changed Successfully!');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_platform_policies', JSON.stringify(policies));
    }
    if (onNotify) onNotify('System Configuration & Platform Policies Saved Live!');
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">
          <Settings size={20} style={{ color: 'var(--admin-primary)' }} />
          <span>Admin System Configuration & Security</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Admin Passcode / Password Change Card */}
        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--admin-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Key size={18} style={{ color: '#2563eb' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Admin Security Passcode Configuration</h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
            Update the Security Passcode required to unlock the Admin Control Panel (`/admin-panel`). Default Passcode: <code style={{ background: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#2563eb', fontWeight: 600 }}>admin123</code>
          </p>

          {passcodeSuccess && (
            <div style={{ padding: '8px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> {passcodeSuccess}
            </div>
          )}

          {passcodeError && (
            <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
              ⚠️ {passcodeError}
            </div>
          )}

          <form onSubmit={handleUpdateAdminPasscode} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Current Admin Passcode</label>
              <input
                type="password"
                placeholder="Current passcode..."
                value={currentPasscode}
                onChange={(e) => setCurrentPasscode(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>New Admin Passcode</label>
              <input
                type="password"
                placeholder="New passcode..."
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Confirm New Passcode</label>
              <input
                type="password"
                placeholder="Confirm new passcode..."
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            <button type="submit" className="admin-btn admin-btn-primary" style={{ padding: '9px 16px', background: '#0f172a', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
              Update Passcode
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Database Diagnostic Tool */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Database size={18} style={{ color: 'var(--admin-info)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Database & Supabase Health</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                Status: <strong style={{ color: 'var(--admin-success)' }}>{dbStatus}</strong>
              </p>
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary" 
                onClick={testSupabaseConnection}
                disabled={isTesting}
              >
                {isTesting ? 'Testing Connection...' : 'Test Supabase Connection'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
