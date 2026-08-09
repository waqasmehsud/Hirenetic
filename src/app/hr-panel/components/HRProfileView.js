'use client';

import React, { useState } from 'react';
import { Building2, User, Mail, Phone, Globe, MapPin, Briefcase, Users, Save, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
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
  const [newPasscode, setNewPasscode] = useState('');

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
    <section className="view-section active" style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Profile Settings Card */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
        
        {/* Profile Header Avatar Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
              color: '#ffffff', 
              fontSize: '22px', 
              fontWeight: '800', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {avatarInitials}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                {formData.company || 'Hirenetic Enterprise'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0', fontWeight: '500' }}>
                {formData.name || 'HR Admin'} • {formData.designation || 'Recruiter'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
            <ShieldCheck size={14} /> Active Recruiter Profile
          </div>
        </div>

        {successMsg && (
          <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '10px', fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Row 1: Full Name & Read-only Email */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={13} style={{ color: '#2563eb' }} /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '9.5px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#0f172a', fontWeight: '500' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={13} style={{ color: '#64748b' }} /> Account Email (Read-Only)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                style={{ width: '100%', padding: '9.5px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', background: '#f8fafc', color: '#64748b', fontWeight: '500' }}
              />
            </div>
          </div>

          {/* Row 2: Company & Designation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={13} style={{ color: '#2563eb' }} /> Company / Organization Name
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '9.5px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#0f172a', fontWeight: '500' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={13} style={{ color: '#2563eb' }} /> HR Designation / Title
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                style={{ width: '100%', padding: '9.5px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#0f172a', fontWeight: '500' }}
              />
            </div>
          </div>

          {/* Row 3: Industry & Company Size */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={13} style={{ color: '#2563eb' }} /> Industry Sector
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                style={{ width: '100%', padding: '9.5px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#0f172a', fontWeight: '600', cursor: 'pointer' }}
              >
                <option value="Cybersecurity">Cybersecurity & SOC</option>
                <option value="Software Development">Software Development</option>
                <option value="Artificial Intelligence">AI & Data Science</option>
                <option value="Fintech">Fintech</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={13} style={{ color: '#2563eb' }} /> Company Size
              </label>
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleChange}
                style={{ width: '100%', padding: '9.5px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#0f172a', fontWeight: '600', cursor: 'pointer' }}
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>

          {/* Row 4: Phone & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={13} style={{ color: '#2563eb' }} /> Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                style={{ width: '100%', padding: '9.5px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#0f172a', fontWeight: '500' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} style={{ color: '#2563eb' }} /> Location / City
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Islamabad, Pakistan"
                style={{ width: '100%', padding: '9.5px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#0f172a', fontWeight: '500' }}
              />
            </div>
          </div>

          {/* Row 5: Website URL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={13} style={{ color: '#2563eb' }} /> Website URL
              </label>
              <input
                type="text"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://hirenetic.com"
                style={{ width: '100%', padding: '9.5px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#0f172a', fontWeight: '500' }}
              />
            </div>
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '9.5px 22px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
              }}
            >
              <Save size={15} />
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>
      </div>

      {/* Admin Security Passcode Card */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={16} style={{ color: '#2563eb' }} /> Admin Security Passcode
        </h4>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 16px', fontWeight: '500' }}>
          Set or update the passcode required to access the HR Panel lock screen.
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="password"
            placeholder="Enter new admin passcode..."
            value={newPasscode}
            onChange={(e) => setNewPasscode(e.target.value)}
            style={{ width: '280px', padding: '8.5px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#f8fafc', color: '#0f172a' }}
          />
          <button
            type="button"
            onClick={handleUpdatePasscode}
            style={{ padding: '8.5px 18px', borderRadius: '8px', background: '#0f172a', color: '#ffffff', fontSize: '12.5px', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.2)' }}
          >
            Update Passcode
          </button>
        </div>
      </div>

    </section>
  );
}
