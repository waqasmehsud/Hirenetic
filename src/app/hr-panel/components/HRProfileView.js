'use client';

import React, { useState } from 'react';
import { Building2, User, Mail, Phone, Globe, MapPin, Briefcase, Users, Save, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function HRProfileView({ currentUser, onProfileUpdated, addToast }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || currentUser?.full_name || '',
    email: currentUser?.email || '',
    company: currentUser?.company || currentUser?.company_name || '',
    designation: currentUser?.designation || 'Lead HR Manager',
    industry: currentUser?.industry || 'Cybersecurity',
    company_size: currentUser?.company_size || '11-50',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
    website_url: currentUser?.website_url || ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      if (supabase && currentUser?.id) {
        const updatePayload = {
          full_name: formData.name.trim(),
          company_name: formData.company.trim(),
          designation: formData.designation.trim(),
          industry: formData.industry,
          company_size: formData.company_size,
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          website_url: formData.website_url.trim(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('employers_profiles')
          .update(updatePayload)
          .eq('id', currentUser.id);

        if (error) {
          throw error;
        }

        const updatedUserObj = {
          ...currentUser,
          name: formData.name.trim(),
          company: formData.company.trim(),
          designation: formData.designation.trim(),
          industry: formData.industry,
          company_size: formData.company_size,
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          website_url: formData.website_url.trim()
        };

        localStorage.setItem('hr_user', JSON.stringify(updatedUserObj));
        if (onProfileUpdated) onProfileUpdated(updatedUserObj);

        setSuccessMsg('Company profile updated successfully!');
        if (addToast) addToast('success', 'Profile Updated', 'Company profile details saved to database.');
      }
    } catch (err) {
      console.error('HR Profile save error:', err);
      if (addToast) addToast('error', 'Update Failed', err.message || 'Failed to save company profile.');
    } finally {
      setSaving(false);
    }
  };

  const avatarInitials = (formData.name || 'HR').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <section className="view-section active">
      <div className="view-header-bar flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>HR Company Profile</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Manage your recruiter identity, enterprise details, and branding.</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Banner Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#2563eb', color: '#ffffff', fontSize: '22px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyCenter: 'center', shrink: 0 }}>
            {avatarInitials}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{formData.company || 'Company Name'}</h3>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span><User size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {formData.name || 'Recruiter'} ({formData.designation})</span>
              <span><Building2 size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {formData.industry}</span>
            </div>
          </div>
        </div>

        {successMsg && (
          <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', color: '#065f46', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Recruiter Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Sarah Jenkins"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>HR Title / Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                placeholder="e.g. Lead HR Recruiter"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Company / Enterprise Name</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="e.g. CyberLedger / Hirenetic Corp"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Work Email Address (Read-Only)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Industry Sector</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#f8fafc' }}
              >
                <option value="Cybersecurity">Cybersecurity & SecOps</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="FinTech & Enterprise">FinTech & Enterprise</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Company Size</label>
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#f8fafc' }}
              >
                <option value="1-10">1-10 Employees</option>
                <option value="11-50">11-50 Employees</option>
                <option value="51-200">51-200 Employees</option>
                <option value="200+">200+ Enterprise</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Company Location / City</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Islamabad, Pakistan"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Website URL</label>
              <input
                type="text"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://company.com"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              />
            </div>
          </div>

          <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '11px 24px', borderRadius: '10px', background: '#2563eb', color: '#ffffff', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={16} />
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>
      </div>
    </section>
  );
}
