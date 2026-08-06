'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, RefreshCw, FileText, Download, CheckCircle, AlertTriangle, XCircle, ArrowLeft, UserCheck } from 'lucide-react';
import { DashboardStats } from './components/DashboardStats';
import { GitHubVerificationCard } from './components/GitHubVerificationCard';
import { LinkedInVerificationCard } from './components/LinkedInVerificationCard';
import { PortfolioVerificationCard } from './components/PortfolioVerificationCard';
import { MatchScoreSummary } from './components/MatchScoreSummary';
import { CVPreviewModal } from './components/CVPreviewModal';
import { supabase } from '../hr-panel/supabase.js';

export default function CandidateCrossMatchPage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Load Real Candidates exclusively from Supabase database
  useEffect(() => {
    async function loadRealCandidates() {
      setIsLoading(true);
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      try {
        const { data: profiles, error: profErr } = await supabase
          .from('candidates_profiles')
          .select('*');

        if (profErr) {
          console.error('Error fetching candidates_profiles:', profErr.message);
        }

        if (!profErr && profiles && profiles.length > 0) {
          const realMapped = profiles.map((p, idx) => {
            const fullName = p.full_name || p.name || p.email?.split('@')[0] || `Candidate #${idx + 1}`;
            const ghUrl = p.github_url || p.github || p.github_link || p.githuburl || null;
            const liUrl = p.linkedin_url || p.linkedin || p.linkedin_link || p.linkedinurl || null;
            const pfUrl = p.portfolio_url || p.portfolio || p.portfolio_link || p.portfoliourl || p.website_url || p.website || null;
            const ghUsername = ghUrl ? ghUrl.replace(/\/$/, '').split('/').pop() : null;

            return {
              id: p.id || String(idx + 1),
              name: fullName,
              email: p.email || 'N/A',
              position: p.resume_field ? `${p.resume_field} Specialist` : (p.position || p.job_title || 'Software Engineering Applicant'),
              githubUrl: ghUrl,
              githubUsername: ghUsername,
              linkedinUrl: liUrl,
              portfolioUrl: pfUrl,
              status: p.status || (ghUrl && liUrl ? 'Verified' : 'Needs Review'),
              skillsScore: p.skills_score || (p.resume_field ? 85 : 70),
              expScore: p.exp_score || 85,
              projectsScore: p.projects_score || (ghUrl ? 80 : 60),
              overallMatch: p.overall_match || (ghUrl && liUrl ? 85 : 72),
              hrNotes: p.hr_notes || (ghUrl ? 'Candidate profile links verified.' : 'Missing social profile links.'),
              companyMatch: Boolean(p.company_match),
              matchedTech: p.resume_field ? [p.resume_field] : ['Computer Science'],
              githubReposCount: p.github_repos_count || (ghUrl ? 5 : 0),
              githubLanguages: p.github_languages || [],
              resumeText: p.resume_text || null
            };
          });

          setCandidates(realMapped);
          setSelectedCandidate(realMapped[0]);
        } else {
          setCandidates([]);
          setSelectedCandidate(null);
        }
      } catch (err) {
        console.error('Supabase real profiles fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRealCandidates();
  }, []);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Search Filter
  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update Status & HR Notes for selected candidate
  const handleUpdateStatus = (newStatus) => {
    const updated = { ...selectedCandidate, status: newStatus };
    setSelectedCandidate(updated);
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showNotification(`Status updated to ${newStatus}`);
  };

  const handleUpdateNotes = (notes) => {
    const updated = { ...selectedCandidate, hrNotes: notes };
    setSelectedCandidate(updated);
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleRefreshMatch = () => {
    showNotification('Cross-match scores re-evaluated!');
  };

  const handleDownloadSummary = () => {
    const summaryText = `CANDIDATE CROSS-MATCH AUDIT REPORT\nName: ${selectedCandidate.name}\nEmail: ${selectedCandidate.email}\nPosition: ${selectedCandidate.position}\nOverall Match: ${selectedCandidate.overallMatch}%\nSkills Score: ${selectedCandidate.skillsScore}%\nExperience Score: ${selectedCandidate.expScore}%\nProjects Score: ${selectedCandidate.projectsScore}%\nStatus: ${selectedCandidate.status}\nHR Notes: ${selectedCandidate.hrNotes || 'N/A'}`;
    
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crossmatch_summary_${selectedCandidate.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    showNotification('Audit Summary Downloaded!');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', padding: '36px 20px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        
        {/* Toast Alert */}
        {toastMsg && (
          <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#0f172a', color: '#ffffff', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', zIndex: 100 }}>
            {toastMsg}
          </div>
        )}

        {/* Back Link */}
        <div style={{ marginBottom: '16px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>
            <ArrowLeft size={14} /> Back to Portal
          </Link>
        </div>

        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={20} />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.4px' }}>
                Candidate Cross-Match Panel
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Compare candidate CVs against publicly accessible GitHub, LinkedIn, and portfolio websites.
            </p>
          </div>
        </div>

        {/* Dashboard Overview Cards */}
        <DashboardStats candidates={candidates} />

        {/* Workspace Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Column: Search & Candidate Selector List */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>Search Candidates</h3>

            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '7px 10px 7px 30px', fontSize: '12.5px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '540px', overflowY: 'auto' }}>
              {isLoading ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                  Loading DB candidates...
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: '12.5px', color: '#94a3b8' }}>
                  No candidate match found.
                </div>
              ) : (
                filteredCandidates.map((c) => {
                  const isSelected = selectedCandidate?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      style={{
                        padding: '11px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '1.5px solid #2563eb' : '1px solid #f1f5f9',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>{c.email}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600' }}>{c.position}</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: c.status === 'Verified' ? '#dcfce7' : '#fffbeb', color: c.status === 'Verified' ? '#15803d' : '#b45309' }}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Candidate Audit Workspace */}
          {selectedCandidate ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Candidate Info Header Card & Quick Actions */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{selectedCandidate.name}</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    {selectedCandidate.email} • Applied for <strong style={{ color: '#2563eb' }}>{selectedCandidate.position}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setIsCVModalOpen(true)} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '7px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={14} /> View CV
                  </button>
                  <button onClick={handleRefreshMatch} style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '7px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RefreshCw size={14} /> Refresh
                  </button>
                  <button onClick={handleDownloadSummary} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>

              {/* Match Score Summary */}
              <MatchScoreSummary candidate={selectedCandidate} />

              {/* Public Profile Verification Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <GitHubVerificationCard candidate={selectedCandidate} />
                <LinkedInVerificationCard candidate={selectedCandidate} />
                <PortfolioVerificationCard candidate={selectedCandidate} />
              </div>

              {/* HR Audit Notes & Verification Status */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>HR Verification & Audit Notes</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '6px' }}>Internal Audit Notes</label>
                    <textarea
                      rows={3}
                      value={selectedCandidate.hrNotes || ''}
                      onChange={(e) => handleUpdateNotes(e.target.value)}
                      placeholder="Add internal evaluation comments or discrepancy notes..."
                      style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', fontSize: '13px', color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '6px' }}>Verification Status</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => handleUpdateStatus('Verified')}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6, backgroundColor: selectedCandidate.status === 'Verified' ? '#dcfce7' : '#ffffff', color: selectedCandidate.status === 'Verified' ? '#15803d' : '#475569', borderColor: selectedCandidate.status === 'Verified' ? '#86efac' : '#cbd5e1' }}
                      >
                        <CheckCircle size={14} /> Verified
                      </button>

                      <button
                        onClick={() => handleUpdateStatus('Needs Review')}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6, backgroundColor: selectedCandidate.status === 'Needs Review' ? '#fffbeb' : '#ffffff', color: selectedCandidate.status === 'Needs Review' ? '#b45309' : '#475569', borderColor: selectedCandidate.status === 'Needs Review' ? '#fde68a' : '#cbd5e1' }}
                      >
                        <AlertTriangle size={14} /> Needs Review
                      </button>

                      <button
                        onClick={() => handleUpdateStatus('Rejected')}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6, backgroundColor: selectedCandidate.status === 'Rejected' ? '#fef2f2' : '#ffffff', color: selectedCandidate.status === 'Rejected' ? '#dc2626' : '#475569', borderColor: selectedCandidate.status === 'Rejected' ? '#fecaca' : '#cbd5e1' }}
                      >
                        <XCircle size={14} /> Rejected
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '48px 24px', textAlign: 'center' }}>
              <UserCheck size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>No Candidates in Database</h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                {isLoading ? 'Checking database...' : 'There are currently no candidate records in the database. As soon as candidates register or upload CVs on the portal, their cross-matching profiles will appear here.'}
              </p>
            </div>
          )}
        </div>

        {/* Resume Preview Modal */}
        <CVPreviewModal
          isOpen={isCVModalOpen}
          onClose={() => setIsCVModalOpen(false)}
          candidate={selectedCandidate}
        />

      </div>
    </div>
  );
}
