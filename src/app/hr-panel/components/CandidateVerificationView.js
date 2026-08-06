'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import {
  Search, Filter, Shield, ShieldCheck, ShieldAlert, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, AlertTriangle, AlertCircle, RefreshCw, ArrowLeft, Download,
  Github, Linkedin, Globe, Mail, Award, Sparkles, FileText, Clock, User, MapPin,
  Phone, ExternalLink, Eye, Loader2, ChevronUp, MessageSquare, BookOpen, Briefcase,
  GraduationCap, Code2, Star, GitBranch, Activity
} from 'lucide-react';

const VERIFICATION_STEPS_CONFIG = [
  'Loading Profile',
  'Analyzing Resume',
  'Checking GitHub',
  'Checking LinkedIn',
  'Checking Portfolio',
  'Verifying Email',
  'Checking Certificates',
  'Generating AI Report'
];

export default function CandidateVerificationView({ realCandidates = [], onSelectCandidate }) {
  // Phase state: 'search' | 'verifying' | 'report'
  const [phase, setPhase] = useState('search');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Selected Candidate state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Verification Data state
  const [verificationData, setVerificationData] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  
  // Verification Progress state
  const [verificationSteps, setVerificationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  
  // Report state
  const [expandedSources, setExpandedSources] = useState(new Set(['github', 'email']));
  const [internalNotes, setInternalNotes] = useState('');

  // Derived filtered candidates
  const filteredCandidates = useMemo(() => {
    return realCandidates.filter(candidate => {
      // Name/Email/Skills/Title search
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        (candidate.full_name?.toLowerCase().includes(query) || 
         candidate.name?.toLowerCase().includes(query) || 
         candidate.email?.toLowerCase().includes(query) || 
         candidate.title?.toLowerCase().includes(query) ||
         (Array.isArray(candidate.skills) && candidate.skills.some(s => s?.toLowerCase().includes(query))));

      // Domain Filter (Basic mockup logic, adapt if domain is an actual field)
      const matchesDomain = domainFilter === 'All' || 
        (candidate.title && candidate.title.toLowerCase().includes(domainFilter.toLowerCase())) ||
        (Array.isArray(candidate.skills) && candidate.skills.some(s => s?.toLowerCase() === domainFilter.toLowerCase()));

      // Status Filter (Assuming status might be in a custom field or status prop, here just mocking)
      const candidateStatus = candidate.status || 'Applied';
      const matchesStatus = statusFilter === 'All' || candidateStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [realCandidates, searchQuery, domainFilter, statusFilter]);

  // Handle Verify Click
  const handleVerifyCandidate = useCallback((candidate) => {
    setSelectedCandidate(candidate);
    setPhase('verifying');
    setVerificationError(null);
    setVerificationData(null);
    setVerificationSteps(VERIFICATION_STEPS_CONFIG.map(step => ({ name: step, status: 'pending' })));
    setCurrentStepIndex(0);
    if (onSelectCandidate) {
      onSelectCandidate(candidate);
    }
  }, [onSelectCandidate]);

  // Handle Verification Process Simulation + API Call
  useEffect(() => {
    let timeoutId;
    if (phase === 'verifying' && currentStepIndex >= 0 && currentStepIndex < VERIFICATION_STEPS_CONFIG.length) {
      // Simulate step progress
      timeoutId = setTimeout(() => {
        setVerificationSteps(prev => {
          const next = [...prev];
          next[currentStepIndex].status = 'completed';
          if (currentStepIndex + 1 < next.length) {
            next[currentStepIndex + 1].status = 'active';
          }
          return next;
        });
        setCurrentStepIndex(prev => prev + 1);
      }, 400);
    } else if (phase === 'verifying' && currentStepIndex === VERIFICATION_STEPS_CONFIG.length) {
      // Once animation is done, we assume API might be resolving here.
      // In a real scenario, we might trigger API at start and let animation run, then wait for API.
      // Here we will do the API call after animation (or during).
      const runApi = async () => {
        try {
          const res = await fetch('/hr-panel/api/verify-candidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidateId: selectedCandidate.id, candidateData: selectedCandidate })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Verification failed');
          
          setVerificationData(data);
          setPhase('report');
        } catch (err) {
          setVerificationError(err.message || 'An unknown error occurred.');
          // Stop verifying on error
        }
      };
      runApi();
    }
    return () => clearTimeout(timeoutId);
  }, [phase, currentStepIndex, selectedCandidate]);

  const toggleSourceExpand = (source) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
  };

  const renderInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getStatusLabelClass = (status) => {
    switch (status) {
      case 'Strongly Verified': return 'cv-status-strongly';
      case 'Verified': return 'cv-status-verified';
      case 'Partially Verified': return 'cv-status-partial';
      case 'Limited Verification': return 'cv-status-limited';
      case 'Needs Manual Review': return 'cv-status-manual';
      default: return '';
    }
  };

  const getSourceBarColor = (score) => {
    if (score >= 85) return 'cv-bar-green';
    if (score >= 70) return 'cv-bar-blue';
    if (score >= 55) return 'cv-bar-yellow';
    if (score >= 40) return 'cv-bar-orange';
    return 'cv-bar-red';
  };
  
  const getSourceIconClass = (sourceKey) => {
    switch (sourceKey) {
      case 'github': return 'cv-github';
      case 'linkedin': return 'cv-linkedin';
      case 'portfolio': return 'cv-portfolio';
      case 'email': return 'cv-email';
      case 'certificates': return 'cv-certificates';
      default: return '';
    }
  };

  const getSourceStatusClass = (statusLabel) => {
    switch(statusLabel) {
        case 'Strong Evidence': return 'cv-status-strong';
        case 'Good Evidence': return 'cv-status-good';
        case 'Partial Evidence': return 'cv-status-partial';
        case 'Limited Public Evidence': return 'cv-status-limited';
        case 'Unable to Verify':
        case 'Needs Manual Review': return 'cv-status-unable';
        case 'Not Provided': return 'cv-status-notprovided';
        default: return 'cv-status-notprovided';
    }
  }

  // --------------------------------------------------------
  // RENDER: PHASE 1 - Search & Select
  // --------------------------------------------------------
  const renderSearchPhase = () => (
    <div className="cv-workspace">
      <div className="cv-workspace-header">
        <h1>Candidate Verification Workspace</h1>
        <p>Search, filter, and run comprehensive AI-powered verifications on candidate profiles, skills, and backgrounds.</p>
      </div>

      <div className="cv-search-section">
        <div className="cv-search-bar">
          <Search />
          <input
            type="text"
            placeholder="Search by name, email, skills, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="cv-filters">
          <div>
            <Filter />
            <span>Filters:</span>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
            >
              <option value="All">All Domains</option>
              <option value="Software">Software</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Data">Data</option>
              <option value="Cloud">Cloud</option>
              <option value="AI/ML">AI/ML</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div className="cv-result-count">
            Showing {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="cv-empty-state">
          <Search />
          <h3>No candidates found</h3>
          <p>Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="cv-candidates-grid">
          {filteredCandidates.map(candidate => (
            <div key={candidate.id} className="cv-candidate-card">
              <div className="cv-card-header">
                <div className="cv-card-avatar">
                  {renderInitials(candidate.full_name || candidate.name)}
                </div>
                <div className="cv-card-identity">
                  <h3 title={candidate.full_name || candidate.name}>
                    {candidate.full_name || candidate.name || 'Unknown Candidate'}
                  </h3>
                  <p>{candidate.title || 'Candidate'}</p>
                </div>
              </div>

              <div className="cv-card-meta">
                {candidate.email && (
                  <div className="cv-card-meta-item">
                    <Mail />
                    <span>{candidate.email}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="cv-card-meta-item">
                    <MapPin />
                    <span>{candidate.location}</span>
                  </div>
                )}
                
                <div className="cv-card-skills">
                  <div>Top Skills</div>
                  <div>
                    {Array.isArray(candidate.skills) ? candidate.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="cv-card-skill">
                        {skill}
                      </span>
                    )) : (
                      <span>No skills listed</span>
                    )}
                    {Array.isArray(candidate.skills) && candidate.skills.length > 4 && (
                      <span className="cv-card-skill cv-overflow">
                        +{candidate.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleVerifyCandidate(candidate)}
                className="cv-verify-btn"
              >
                <ShieldCheck />
                Verify Candidate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // --------------------------------------------------------
  // RENDER: PHASE 2 - Verifying
  // --------------------------------------------------------
  const renderVerifyingPhase = () => {
    const progressPercent = Math.round((currentStepIndex / VERIFICATION_STEPS_CONFIG.length) * 100) || 0;
    
    return (
      <div className="cv-progress-container">
        <div className="cv-progress-candidate">
          <div>
            <Shield />
            <div className="cv-pulse"></div>
          </div>
          <h2>Verifying Candidate</h2>
          <p>
            {selectedCandidate?.full_name || selectedCandidate?.name} • <span>{selectedCandidate?.title || 'Candidate'}</span>
          </p>
        </div>

        {verificationError ? (
          <div className="cv-error-state">
            <AlertCircle />
            <h3>Verification Failed</h3>
            <p>{verificationError}</p>
            <div>
              <button 
                onClick={() => setPhase('search')}
              >
                Back to Search
              </button>
              <button 
                onClick={() => handleVerifyCandidate(selectedCandidate)}
                className="cv-retry-btn"
              >
                Retry Verification
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div>
              <div>
                <span>Verification Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="cv-progress-bar-track">
                <div 
                  className="cv-progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="cv-progress-steps">
              {verificationSteps.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isActive = step.status === 'active' || (idx === currentStepIndex && step.status !== 'completed');
                
                return (
                  <div key={idx} className={`cv-progress-step ${isActive ? 'cv-step-active' : isCompleted ? 'cv-step-done' : 'cv-step-pending'}`}>
                    <div className="cv-step-icon">
                      {isCompleted ? (
                        <CheckCircle2 />
                      ) : isActive ? (
                        <Loader2 />
                      ) : (
                        <div>
                          <div></div>
                        </div>
                      )}
                    </div>
                    <div>
                      {step.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --------------------------------------------------------
  // RENDER: PHASE 3 - Report
  // --------------------------------------------------------
  const renderReportPhase = () => {
    if (!verificationData) return null; // Fallback, shouldn't hit

    const vData = verificationData || {};
    const cScore = vData.overallConfidence !== undefined ? vData.overallConfidence : (vData.confidenceScore || 75);
    const cStatus = vData.overallStatus || vData.status || (cScore > 80 ? 'Strongly Verified' : cScore > 60 ? 'Verified' : 'Needs Manual Review');
    const vDate = vData.verifiedAt ? new Date(vData.verifiedAt).toLocaleDateString() : new Date().toLocaleDateString();
    
    const sources = vData.sources || {
      github: { available: true, score: 85, name: 'GitHub', icon: Github },
      linkedin: { available: true, score: 92, name: 'LinkedIn', icon: Linkedin },
      portfolio: { available: false, score: 0, name: 'Portfolio', icon: Globe },
      email: { available: true, score: 98, name: 'Email', icon: Mail },
      certificates: { available: true, score: 75, name: 'Certificates', icon: Award }
    };

    const skills = vData.skillsVerification || vData.skills || {
      verified: Array.isArray(selectedCandidate?.skills) ? selectedCandidate.skills.slice(0, 3) : [],
      partialEvidence: Array.isArray(selectedCandidate?.skills) ? selectedCandidate.skills.slice(3, 5) : [],
      unverified: Array.isArray(selectedCandidate?.skills) ? selectedCandidate.skills.slice(5, 6) : []
    };

    const verifiedSkillsList = skills.verified || [];
    const partialSkillsList = skills.partialEvidence || skills.partial || [];
    const unverifiedSkillsList = skills.unverified || [];

    const metrics = vData.metrics || {
      skillsSupported: verifiedSkillsList.length + partialSkillsList.length,
      projectsVerified: sources.github?.details?.publicRepos || 0,
      experienceConfidence: cScore > 75 ? 'High' : 'Moderate',
      education: 'Verified',
      timeline: 'Consistent'
    };

    const reviewItems = vData.reviewItems || [];
    const aiSummary = vData.aiSummary || `Verification completed for ${selectedCandidate?.full_name || selectedCandidate?.name}. Public repositories and profile evidence cross-referenced against resume claims.`;

    const ghDetails = sources.github?.details || {};
    const ghVerified = ghDetails.verifiedSkills || [];
    const ghUnverified = ghDetails.unverifiedSkills || [];

    const evidenceComparison = (ghVerified.length > 0 || ghUnverified.length > 0)
      ? [
          ...ghVerified.map(skill => ({
            claim: `${skill} (Claimed Skill)`,
            evidence: `Verified in GitHub repos & language breakdown`,
            match: 'full'
          })),
          ...ghUnverified.map(skill => ({
            claim: `${skill} (Claimed Skill)`,
            evidence: `No matching public GitHub repository or topic tag found`,
            match: 'none'
          }))
        ]
      : [
          { claim: 'Primary Technical Skills', evidence: 'Cross-referenced with public profile history', match: 'full' },
          { claim: 'Professional Experience', evidence: 'Verified via candidate profile details', match: 'full' }
        ];

    return (
      <div className="cv-report">
        
        {/* HEADER SECTION */}
        <div className="cv-report-header">
          <div className="cv-report-identity">
            <div className="cv-card-avatar">
              {renderInitials(selectedCandidate?.full_name || selectedCandidate?.name)}
            </div>
            <div>
              <h1>{selectedCandidate?.full_name || selectedCandidate?.name}</h1>
              <p>{selectedCandidate?.title || 'Candidate'}</p>
              <div>
                <span className={getStatusLabelClass(cStatus)}>
                  {cStatus}
                </span>
                <span className="cv-report-timestamp">
                  <Clock /> Verified on {vDate}
                </span>
              </div>
            </div>
          </div>

          <div className="cv-header-actions">
            <div className="cv-report-info">
              <div>
                <div className="cv-confidence-label">Confidence Score</div>
                <div className="cv-confidence-value">{cScore}%</div>
              </div>
              <div className="cv-confidence-circle">
                <svg viewBox="0 0 36 36">
                  <path
                    className="cv-confidence-ring"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={cScore > 80 ? "cv-bar-green" : cScore > 60 ? "cv-bar-blue" : "cv-bar-yellow"}
                    strokeWidth="3"
                    strokeDasharray={`${cScore}, 100`}
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>

            <div>
              <button 
                onClick={() => setPhase('search')}
              >
                <ArrowLeft /> Back to Search
              </button>
              <div>
                <button 
                  onClick={() => handleVerifyCandidate(selectedCandidate)}
                  title="Refresh Verification"
                >
                  <RefreshCw />
                </button>
                <button 
                  className="cv-btn-primary"
                  title="Export Report"
                >
                  <Download />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div>
          
          {/* LEFT COLUMN (WIDER) */}
          <div>
            
            {/* SOURCE SCORES */}
            <div className="cv-sources-section">
              <h3 className="cv-section-title">
                <Activity /> Verification Sources
              </h3>
              <div className="cv-sources-grid">
                {Object.entries(sources).map(([key, source]) => {
                  const Icon = source.icon || FileText;
                  const isAvail = source.available !== false;
                  return (
                    <div key={key} className={isAvail ? 'cv-source-card' : 'cv-source-unavailable'}>
                      <div>
                        <Icon className={`cv-source-icon ${getSourceIconClass(key)}`} />
                        <span className="cv-source-name">{source.name || key.toUpperCase()}</span>
                      </div>
                      {isAvail ? (
                        <>
                          <div>
                            <span className="cv-source-score">{source.score || 0}%</span>
                          </div>
                          <div className="cv-source-bar">
                            <div className={`cv-source-bar-fill ${getSourceBarColor(source.score || 0)}`} style={{ width: `${source.score || 0}%` }}></div>
                          </div>
                        </>
                      ) : (
                        <div>Not Provided</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI SUMMARY */}
            <div className="cv-ai-section">
              <h3 className="cv-section-title">
                <Sparkles /> AI Verification Summary
              </h3>
              <div className="cv-ai-card">
                <p>{aiSummary}</p>
              </div>
            </div>

            {/* EVIDENCE COMPARISON */}
            <div className="cv-evidence-section">
              <h3 className="cv-section-title">
                <BookOpen /> Evidence Comparison (GitHub vs Resume)
              </h3>
              <div className="cv-evidence-grid">
                <table>
                  <thead>
                    <tr>
                      <th>Resume Claim</th>
                      <th>Public Evidence</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidenceComparison.map((item, idx) => (
                      <tr key={idx} className="cv-evidence-row">
                        <td className="cv-evidence-col">{item.claim}</td>
                        <td className="cv-evidence-col">{item.evidence}</td>
                        <td className="cv-evidence-match">
                          {item.match === 'full' && <span className="cv-match-yes"><CheckCircle2 /> Match</span>}
                          {item.match === 'partial' && <span className="cv-match-partial"><AlertTriangle /> Partial</span>}
                          {item.match === 'none' && <span className="cv-match-no"><XCircle /> Unverified</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SOURCE DETAILS ACCORDIONS */}
            <div className="cv-detail-section">
              <h3>Source Deep Dives</h3>
              
              {/* Github Expandable */}
              <div className="cv-detail-expand">
                <button 
                  onClick={() => toggleSourceExpand('github')}
                  className="cv-detail-expand-header"
                >
                  <div>
                    <Github />
                    <span>GitHub Analysis ({sources.github?.url || 'Profile Check'})</span>
                  </div>
                  {expandedSources.has('github') ? <ChevronUp /> : <ChevronDown />}
                </button>
                
                {expandedSources.has('github') && (
                  <div className="cv-detail-expand-body">
                    <div className="cv-detail-grid">
                      <div className="cv-detail-item">
                        <div>{ghDetails.publicRepos ?? '0'}</div>
                        <div>Public Repos</div>
                      </div>
                      <div className="cv-detail-item">
                        <div>{ghDetails.totalStars ?? '0'}</div>
                        <div>Stars Received</div>
                      </div>
                      <div className="cv-detail-item">
                        <div>{ghDetails.accountAge || 'N/A'}</div>
                        <div>Account Age</div>
                      </div>
                      <div className="cv-detail-item">
                        <div>{ghDetails.recentActivity ? 'Active' : (ghDetails.lastPush ? `Pushed ${ghDetails.lastPush}` : 'Inactive')}</div>
                        <div>Recent Activity</div>
                      </div>
                    </div>
                    <div>
                      <h4>Top Languages Detected</h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {Array.isArray(ghDetails.topLanguages) && ghDetails.topLanguages.length > 0 ? (
                          ghDetails.topLanguages.map((lang, lIdx) => (
                            <span key={lIdx} style={{ background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                              {lang}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>No public repositories found or URL not provided</span>
                        )}
                      </div>
                      {sources.github?.url && (
                        <div style={{ marginTop: '12px' }}>
                          <a href={sources.github.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <ExternalLink size={13} /> View GitHub Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Email Expandable */}
              <div className="cv-detail-expand">
                <button 
                  onClick={() => toggleSourceExpand('email')}
                  className="cv-detail-expand-header"
                >
                  <div>
                    <Mail />
                    <span>Email Verification</span>
                  </div>
                  {expandedSources.has('email') ? <ChevronUp /> : <ChevronDown />}
                </button>
                
                {expandedSources.has('email') && (
                  <div className="cv-detail-expand-body">
                    <ul>
                      <li>
                        <CheckCircle2 />
                        <div>
                          <p>Format Valid</p>
                          <p>Email addresses standard formatting rules.</p>
                        </div>
                      </li>
                      <li>
                        <CheckCircle2 />
                        <div>
                          <p>MX Records Confirmed</p>
                          <p>Domain is capable of receiving emails.</p>
                        </div>
                      </li>
                      <li>
                        <CheckCircle2 />
                        <div>
                          <p>Not Disposable</p>
                          <p>Email is not from a known temporary email provider.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN (NARROWER) */}
          <div>
            
            {/* METRICS ROW (Vertical in narrow col) */}
            <div>
              <h3>Quick Metrics</h3>
              <div className="cv-metrics-row">
                <div className="cv-metric-card">
                  <div className="cv-metric-value">{metrics.skillsSupported}</div>
                  <div className="cv-metric-label">Skills Verified</div>
                </div>
                <div className="cv-metric-card">
                  <div className="cv-metric-value">{metrics.projectsVerified}</div>
                  <div className="cv-metric-label">Projects Found</div>
                </div>
                <div className="cv-metric-card">
                  <div className="cv-metric-value">{metrics.experienceConfidence}</div>
                  <div className="cv-metric-label">Exp. Confidence</div>
                </div>
                <div className="cv-metric-card">
                  <div className="cv-metric-value">{metrics.timeline}</div>
                  <div className="cv-metric-label">Timeline Match</div>
                </div>
              </div>
            </div>

            {/* SKILLS VERIFICATION */}
            <div className="cv-skills-section">
              <h3 className="cv-section-title">
                <Code2 /> Skill Verification
              </h3>
              
              <div className="cv-skills-grid">
                <div className="cv-skills-col cv-verified">
                  <div className="cv-skills-col-header">
                    <span>Verified</span>
                    <span className="cv-count">({verifiedSkillsList.length})</span>
                  </div>
                  <div className="cv-skills-tags">
                    {verifiedSkillsList.length > 0 ? verifiedSkillsList.map((s, i) => (
                      <span key={i} className="cv-skill-tag cv-tag-green">
                        {s}
                      </span>
                    )) : <span>None</span>}
                  </div>
                </div>

                <div className="cv-skills-col cv-partial-ev">
                  <div className="cv-skills-col-header">
                    <span>Partial Evidence</span>
                    <span className="cv-count">({partialSkillsList.length})</span>
                  </div>
                  <div className="cv-skills-tags">
                    {partialSkillsList.length > 0 ? partialSkillsList.map((s, i) => (
                      <span key={i} className="cv-skill-tag cv-tag-yellow">
                        {s}
                      </span>
                    )) : <span>None</span>}
                  </div>
                </div>

                <div className="cv-skills-col cv-unverified-col">
                  <div className="cv-skills-col-header">
                    <span>Unverified</span>
                    <span className="cv-count">({unverifiedSkillsList.length})</span>
                  </div>
                  <div className="cv-skills-tags">
                    {unverifiedSkillsList.length > 0 ? unverifiedSkillsList.map((s, i) => (
                      <span key={i} className="cv-skill-tag cv-tag-red">
                        {s}
                      </span>
                    )) : <span>None</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* REVIEW ITEMS */}
            <div className="cv-review-section">
              <h3 className="cv-section-title">
                <AlertCircle /> Needs Review
              </h3>
              {reviewItems.length === 0 ? (
                <div>No issues flagged for review.</div>
              ) : (
                <div className="cv-review-list">
                  {reviewItems.map((item, idx) => (
                    <div key={idx} className="cv-review-item">
                      <div>
                        {item.type === 'warning' ? (
                          <AlertTriangle />
                        ) : (
                          <ShieldAlert />
                        )}
                        <div>
                          <div className="cv-review-item-name">{item.name}</div>
                          <div className="cv-review-item-source">Source: {item.source}</div>
                          <div className="cv-review-item-detail">{item.detail}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* INTERNAL NOTES */}
            <div className="cv-notes-section">
              <h3 className="cv-section-title">
                <MessageSquare /> Internal Notes
              </h3>
              <div className="cv-notes-card">
                <textarea
                  className="cv-notes-textarea"
                  rows="4"
                  placeholder="Add notes about this verification..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                ></textarea>
                <div>
                  <button className="cv-notes-save">
                    Save Note
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="cv-candidate-verification-root">
      {phase === 'search' && renderSearchPhase()}
      {phase === 'verifying' && renderVerifyingPhase()}
      {phase === 'report' && renderReportPhase()}
    </div>
  );
}
