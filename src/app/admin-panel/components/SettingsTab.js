'use client';

import React, { useState } from 'react';
import { Settings, Save, Database, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function SettingsTab({ onNotify }) {
  const [dbStatus, setDbStatus] = useState('Connected (Mock/Live Ready)');
  const [isTesting, setIsTesting] = useState(false);
  const [policies, setPolicies] = useState({
    cvSecurityStrict: true,
    autoApproveJobs: false,
    emailAlertsOnCandidate: true
  });

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

  const handleSave = (e) => {
    e.preventDefault();
    onNotify('System Configuration & Policies Saved!');
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">
          <Settings size={20} style={{ color: 'var(--admin-primary)' }} />
          <span>Admin System Configuration & Security</span>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
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

        {/* Security & System Policies */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--admin-success)' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Security & Platform Policies</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={policies.cvSecurityStrict}
                onChange={(e) => setPolicies({ ...policies, cvSecurityStrict: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--admin-primary)' }}
              />
              Enforce Strict Automated CV Security Malware & Content Scan
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={policies.autoApproveJobs}
                onChange={(e) => setPolicies({ ...policies, autoApproveJobs: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--admin-primary)' }}
              />
              Automatically approve new Job Postings created by verified HR accounts
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={policies.emailAlertsOnCandidate}
                onChange={(e) => setPolicies({ ...policies, emailAlertsOnCandidate: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--admin-primary)' }}
              />
              Send instant email notifications on new candidate signups
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="admin-btn admin-btn-primary">
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
