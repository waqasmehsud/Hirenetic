'use client';

import React from 'react';
import { BRAND_CONFIG } from '@/theme/branding.config';
import {
  Code2,
  LayoutDashboard,
  Briefcase,
  Users,
  UserCheck,
  Bookmark,
  Building2,
  LogOut
} from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  activeJobsCount,
  totalApplicantsCount,
  realCandidatesCount = 0,
  currentUser,
  onLogout
}) {
  const name = currentUser?.name || currentUser?.full_name || 'HR Recruiter';
  const role = currentUser?.designation || currentUser?.company || 'Lead HR Manager';
  const avatarInitials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'HR';

  const navItems = [
    {
      section: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      section: 'Recruitment & Candidates',
      items: [
        { id: 'all-candidates', label: 'Candidates DB', icon: UserCheck, count: realCandidatesCount },
        { id: 'jobs', label: 'Job Postings', icon: Briefcase, count: activeJobsCount },
        { id: 'applicants', label: 'Applicants', icon: Users, count: totalApplicantsCount },
        { id: 'talent-pool', label: 'Talent Pool', icon: Bookmark }
      ]
    },
    {
      section: 'Account',
      items: [
        { id: 'profile', label: 'HR Profile & Settings', icon: Building2 }
      ]
    }
  ];

  return (
    <aside style={{
      width: '250px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 50
    }}>
      {/* Brand Header */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/logo.svg" 
            alt="Hirenetic Logo" 
            style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a', letterSpacing: '-0.3px' }}>
              {BRAND_CONFIG.companyName}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
              HR Employer Portal
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav style={{ padding: '14px 10px', flex: 1, overflowY: 'auto' }}>
        {navItems.map((group, gIdx) => (
          <div key={gIdx} style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '10.5px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#94a3b8',
              padding: '6px 12px',
              marginBottom: '4px'
            }}>
              {group.section}
            </div>

            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8.5px 12px',
                    border: 'none',
                    background: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#2563eb' : '#475569',
                    fontSize: '13px',
                    fontWeight: isActive ? '700' : '500',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    gap: '10px',
                    marginBottom: '2px',
                    transition: 'all 0.15s ease',
                    borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent'
                  }}
                >
                  <Icon size={16} style={{ color: isActive ? '#2563eb' : '#64748b' }} />
                  <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                  {item.count !== undefined && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '12px',
                      background: isActive ? '#dbeafe' : '#f1f5f9',
                      color: isActive ? '#1e40af' : '#475569'
                    }}>
                      {item.count || 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer User Profile */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {avatarInitials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ fontWeight: '700', fontSize: '12.5px', color: '#0f172a', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {name}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out of HR Panel"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'color 0.15s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#dc2626'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
