'use client';

import React, { useState } from 'react';
import { Settings, Lock, Bell, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { supabase } from '../supabase';

export default function SettingsView({ currentUser, addToast }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  // Preference Toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoShortlist, setAutoShortlist] = useState(true);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassError('');

    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setPassLoading(true);

    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword.trim()
        });

        if (error) throw error;

        setPassMsg('Password updated successfully in Supabase Auth!');
        setNewPassword('');
        setConfirmPassword('');
        if (addToast) addToast('success', 'Password Changed', 'Your HR account password has been updated.');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setPassError(err.message || 'Failed to update password.');
      if (addToast) addToast('error', 'Update Failed', err.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <section className="view-section active">
      <div className="view-header-bar flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>HR Panel Account Settings</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Manage credentials, security preferences, and recruitment notifications.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', maxWidth: '960px' }}>
        
        {/* Account Security: Change Password */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Change Password</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Update your Supabase Auth account password</span>
            </div>
          </div>

          {passMsg && (
            <div style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '12.5px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} />
              <span>{passMsg}</span>
            </div>
          )}

          {passError && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '12.5px', marginBottom: '14px' }}>
              {passError}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              style={{ padding: '10px 18px', borderRadius: '10px', background: '#2563eb', color: '#ffffff', fontSize: '13.5px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px', opacity: passLoading ? 0.7 : 1 }}
            >
              <Lock size={15} />
              {passLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Preferences & Notifications */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Notification & Automation</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Configure email alerts & recruitment automation</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#0f172a' }}>Instant Email Notifications</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Receive instant emails on new candidate applications</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#0f172a' }}>Auto-Shortlist High Match Candidates</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Highlight candidates with 85%+ AI match score</div>
              </div>
              <input
                type="checkbox"
                checked={autoShortlist}
                onChange={(e) => setAutoShortlist(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} style={{ color: '#2563eb', shrink: 0 }} />
              <span>Role-Based Access Control (RBAC) & CV Threat Scans are active for this employer workspace.</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
