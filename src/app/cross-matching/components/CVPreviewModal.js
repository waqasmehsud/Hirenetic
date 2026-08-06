'use client';

import React from 'react';
import { X, FileText } from 'lucide-react';

export function CVPreviewModal({ isOpen, onClose, candidate }) {
  if (!isOpen || !candidate) return null;

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
        maxWidth: '640px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="#2563eb" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#0f172a' }}>{candidate.name} — Resume Preview</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{candidate.email} • {candidate.position}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap' }}>
            {candidate.resumeText || `CURRICULUM VITAE\nName: ${candidate.name}\nEmail: ${candidate.email}\nTarget Role: ${candidate.position}\n\nSUMMARY & EXPERIENCE:\nExtensive background in Software Engineering, Web Development, and Cloud infrastructure. Experienced with React, Node.js, Python, PostgreSQL, and Git version control.\n\nEDUCATION:\nB.S. in Computer Science — Graduated with Honors.`}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
