'use client';

import React from 'react';
import { X, Briefcase, Plus, MapPin, DollarSign, Award, Code2, FileText, CheckCircle2 } from 'lucide-react';

export default function PostJobModal({
  isOpen,
  onClose,
  newJobForm,
  setNewJobForm,
  onJobCreated,
  onSubmit
}) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    } else if (onJobCreated) {
      onJobCreated();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '680px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', maxHeight: '92vh', overflowY: 'auto', border: '1px solid #cbd5e1' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Briefcase size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Post a New Job Opening</h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>Configure role requirements, skills stack & compensation for candidate matching</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Job Posting Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 1. Job Title */}
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
              Job Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Python Developer / Cybersecurity SOC Analyst"
              required
              value={newJobForm?.title || ''}
              onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
              style={{ width: '100%', padding: '9.5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#f8fafc' }}
            />
          </div>

          {/* 2. Department & Workplace Type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
                Department / Category *
              </label>
              <select
                value={newJobForm?.dept || 'Engineering'}
                onChange={(e) => setNewJobForm({ ...newJobForm, dept: e.target.value })}
                style={{ width: '100%', padding: '9.5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff' }}
              >
                <option value="Engineering">Software Engineering</option>
                <option value="Cybersecurity">Cybersecurity & SecOps</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Product & Design">Product & UI/UX Design</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
                Workplace Type *
              </label>
              <select
                value={newJobForm?.workplaceType || 'Remote'}
                onChange={(e) => setNewJobForm({ ...newJobForm, workplaceType: e.target.value })}
                style={{ width: '100%', padding: '9.5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff' }}
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* 3. Employment Type & Required Experience & Initial Position Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
                Employment Type *
              </label>
              <select
                value={newJobForm?.type || 'Full-Time'}
                onChange={(e) => setNewJobForm({ ...newJobForm, type: e.target.value })}
                style={{ width: '100%', padding: '9.5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff' }}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
                Experience Level *
              </label>
              <select
                value={newJobForm?.exp || '2+ Years'}
                onChange={(e) => setNewJobForm({ ...newJobForm, exp: e.target.value })}
                style={{ width: '100%', padding: '9.5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff' }}
              >
                <option value="Entry-Level (0-1 yrs)">Entry-Level (0-1 yrs)</option>
                <option value="Mid-Level (2-4 yrs)">Mid-Level (2-4 yrs)</option>
                <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                <option value="Lead / Managerial">Lead / Managerial</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
                Initial Position Setting *
              </label>
              <select
                value={newJobForm?.status || 'Open'}
                onChange={(e) => setNewJobForm({ ...newJobForm, status: e.target.value })}
                style={{ width: '100%', padding: '9.5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', fontWeight: '700', color: newJobForm?.status === 'Closed' ? '#dc2626' : '#16a34a' }}
              >
                <option value="Open">🟢 Open Position (Accepting Applications)</option>
                <option value="Closed">🔴 Closed Position (Applications Paused)</option>
              </select>
            </div>
          </div>

          {/* 4. Location & Salary Range */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
                Location / City *
              </label>
              <input
                type="text"
                placeholder="e.g. Islamabad, Pakistan / Remote"
                required
                value={newJobForm?.location || ''}
                onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                style={{ width: '100%', padding: '9.5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#f8fafc' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
                Salary Range / Compensation
              </label>
              <input
                type="text"
                placeholder="e.g. $80,000 - $110,000 / PKR 250k-400k"
                value={newJobForm?.salary || ''}
                onChange={(e) => setNewJobForm({ ...newJobForm, salary: e.target.value })}
                style={{ width: '100%', padding: '9.5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#f8fafc' }}
              />
            </div>
          </div>

          {/* 5. Required Skills Stack */}
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
              Required Technical Skills Stack (Comma separated) *
            </label>
            <input
              type="text"
              placeholder="Python, Docker, AWS, React, SQL, Wireshark"
              required
              value={newJobForm?.skills || ''}
              onChange={(e) => setNewJobForm({ ...newJobForm, skills: e.target.value })}
              style={{ width: '100%', padding: '9.5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#f8fafc' }}
            />
          </div>

          {/* 6. Job Description */}
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
              Job Description & Overview *
            </label>
            <textarea
              rows={3}
              placeholder="Outline the core objective, mission, and scope of this position..."
              required
              value={newJobForm?.desc || ''}
              onChange={(e) => setNewJobForm({ ...newJobForm, desc: e.target.value })}
              style={{ width: '100%', padding: '9.5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical', background: '#f8fafc' }}
            ></textarea>
          </div>

          {/* 7. Responsibilities & Requirements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
                Key Responsibilities
              </label>
              <textarea
                rows={2}
                placeholder="Day-to-day duties & tasks..."
                value={newJobForm?.responsibilities || ''}
                onChange={(e) => setNewJobForm({ ...newJobForm, responsibilities: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none', resize: 'vertical', background: '#f8fafc' }}
              ></textarea>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '4px', display: 'block' }}>
                Requirements & Qualifications
              </label>
              <textarea
                rows={2}
                placeholder="Degree, certifications, technical proficiency..."
                value={newJobForm?.requirements || ''}
                onChange={(e) => setNewJobForm({ ...newJobForm, requirements: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none', resize: 'vertical', background: '#f8fafc' }}
              ></textarea>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Publish Job Posting
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
