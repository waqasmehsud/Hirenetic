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

  const [newPasscode, setNewPasscode] = useState('');

  const handleUpdatePasscode = () => {
    if (!newPasscode.trim()) {
      alert('Please enter a valid passcode.');
      return;
    }
    localStorage.setItem('hr_admin_passcode', newPasscode.trim());
    setNewPasscode('');
    if (addToast) addToast('success', 'Passcode Updated', 'Admin Security Passcode updated successfully.');
    else alert('Admin Passcode updated successfully!');
  };

  return (
    <section className="view-section active">
      <div className="view-header-bar flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>HR Company Profile & Security</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Manage your recruiter identity, enterprise details, and admin security passcode.</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Banner Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#2563eb', color: '#ffffff', fontSize: '22px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
            {avatarInitials}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{formData.company || 'Company Name'}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>{formData.name} • {formData.designation}</p>
          </div>
        </div>

        {successMsg && (
          <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '10px', fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Account Email (Read-Only)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#f1f5f9', color: '#64748b' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Company / Organization Name</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>HR Designation / Title</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              >
                <option value="Cybersecurity">Cybersecurity & SOC</option>
                <option value="Software Development">Software Development</option>
                <option value="Artificial Intelligence">AI & Data Science</option>
                <option value="Fintech">Fintech</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Company Size</label>
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Location / City</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
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

        {/* Admin Security Passcode Section */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed #cbd5e1' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} style={{ color: '#2563eb' }} /> Admin Security Passcode
          </h4>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px' }}>
            Set or update the passcode required to access the HR Panel lock screen.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="password"
              placeholder="Enter new admin passcode..."
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              style={{ width: '260px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#f8fafc' }}
            />
            <button
              type="button"
              onClick={handleUpdatePasscode}
              style={{ padding: '9px 16px', borderRadius: '8px', background: '#0f172a', color: '#ffffff', fontSize: '12.5px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
            >
              Update Passcode
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
