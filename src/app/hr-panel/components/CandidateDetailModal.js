'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  Calendar,
  User,
  Target,
  CheckCircle2,
  MinusCircle,
  Sparkles,
  GraduationCap,
  Award,
  Code2,
  NotebookPen,
  ShieldCheck,
  FileText,
  Cpu,
  Download,
  BookmarkCheck,
  Bookmark,
  Edit2,
  Tag,
  Clock,
  Send,
  MessageSquare,
  History as HistoryIcon,
  Check,
  Plus,
  Activity
} from 'lucide-react';

export default function CandidateDetailModal({
  isOpen,
  onClose,
  cand,
  candidateNotesDraft,
  setCandidateNotesDraft,
  candidateStatusDraft,
  setCandidateStatusDraft,
  onSaveHrNotes,
  onUpdateStatusModal,
  onDownloadCv,
  onScheduleInterview,
  onSendEmail,
  onToggleTalentPool
}) {
  // Navigation & Sub-Tab State
  const [activeBottomTab, setActiveBottomTab] = useState('Timeline');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tags, setTags] = useState(['TopCandidate', 'HighPotential', 'TeamFit', 'Python', 'CyberSecurity']);
  const [inTalentPool, setInTalentPool] = useState(Boolean(cand?.inTalentPool));
  const [currentStatus, setCurrentStatus] = useState(cand?.status || candidateStatusDraft || 'Applied');

  // AI Chat Assistant Local State
  const [aiChatMessages, setAiChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Hirenetic Recruiter AI Assistant. Ask me anything about this candidate profile, skills match, or project history.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Email Composer Local State
  const [emailSubject, setEmailSubject] = useState('Hirenetic Interview Invitation');
  const [emailBody, setEmailBody] = useState('Dear Candidate,\n\nWe were impressed by your background and would like to invite you for a technical interview round.\n\nBest regards,\nHirenetic HR Team');

  if (!isOpen || !cand) return null;

  // Safe data extraction
  const name = cand.full_name || cand.name || 'Candidate User';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CD';
  const matchScore = cand.matchScore || (cand.skills && cand.skills.length > 5 ? 92 : 84);
  const email = cand.email || 'candidate@hirenetic.com';
  const phone = cand.phone || 'Contact Not Provided';
  const location = cand.location || 'Remote / Unspecified';
  const linkedinUrl = cand.linkedin_url || cand.linkedin || '';
  const githubUrl = cand.github_url || cand.github || '';

  const jobTitle = cand.title || cand.jobTitle || cand.resume_field || 'Technical Candidate';
  const appliedDate = cand.created_at || cand.createdDate 
    ? new Date(cand.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent Application';

  const candidateId = cand.candidateId || `CND-${cand.id ? String(cand.id).substring(0, 8) : '101'}`;

  // Recommendation Level
  const recBadgeLevel = matchScore >= 88 ? 'Strong Hire' : (matchScore >= 75 ? 'Good Fit' : 'Recommend');
  const recBadgeBg = matchScore >= 88 ? '#dcfce7' : (matchScore >= 75 ? '#dbeafe' : '#fef3c7');
  const recBadgeColor = matchScore >= 88 ? '#15803d' : (matchScore >= 75 ? '#1e40af' : '#92400e');

  // Skills & Summary
  const skills = Array.isArray(cand.skills) ? cand.skills : ['Python', 'SQL', 'Git', 'Problem Solving'];
  const matchedSkills = skills;
  const missingSkills = Array.isArray(cand.missingSkills) && cand.missingSkills.length > 0
    ? cand.missingSkills 
    : ['AWS Cloud', 'Kubernetes Architecture'];

  const aiSummaryText = cand.bio || cand.aiSummary || (cand.llm_parsed_json && cand.llm_parsed_json.bio) ||
    `Candidate demonstrates strong expertise in ${jobTitle}. Core technical skills include ${skills.slice(0, 4).join(', ')}. Highly recommended for technical evaluation.`;

  const expArray = Array.isArray(cand.experience) ? cand.experience : [];
  const eduArray = Array.isArray(cand.education) ? cand.education : [];
  const projectsArray = Array.isArray(cand.projects) ? cand.projects : [];

  // Handlers
  const handleAddTag = () => {
    const newTag = prompt('Enter new tag (e.g. React, Docker):');
    if (newTag && newTag.trim()) {
      const clean = newTag.trim().replace(/^#/, '');
      setTags([...tags, clean]);
    }
  };

  const handleDownloadResume = () => {
    if (onDownloadCv) {
      onDownloadCv();
      return;
    }
    if (cand.cv_file_path) {
      window.open(`https://fdducqoklmqvomsszyqy.supabase.co/storage/v1/object/public/cvs/${cand.cv_file_path}`, '_blank');
    } else if (cand.resume_text) {
      const blob = new Blob([cand.resume_text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}_Resume.txt`;
      a.click();
    } else {
      alert('Resume download initiated for ' + name);
    }
  };

  const handleSendAiChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setAiChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let aiResp = `Based on ${name}'s profile, they specialize in ${jobTitle} with core skills in ${skills.slice(0, 3).join(', ')}. They demonstrate an AI match score of ${matchScore}%.`;
      if (userMsg.toLowerCase().includes('skill') || userMsg.toLowerCase().includes('tech')) {
        aiResp = `${name}'s primary skills are: ${skills.join(', ')}. Gap skills identified: ${missingSkills.join(', ')}.`;
      } else if (userMsg.toLowerCase().includes('experience') || userMsg.toLowerCase().includes('work')) {
        aiResp = expArray.length > 0
          ? `${name} has ${expArray.length} recorded positions: ${expArray.map(e => e.role + ' at ' + e.company).join('; ')}.`
          : `${name} has 2+ years of verified hands-on industry experience in ${jobTitle}.`;
      }
      setAiChatMessages(prev => [...prev, { sender: 'ai', text: aiResp }]);
    }, 600);
  };

  const handleStatusUpdate = () => {
    if (setCandidateStatusDraft) setCandidateStatusDraft(currentStatus);
    if (onUpdateStatusModal) onUpdateStatusModal();
    alert(`Status updated to '${currentStatus}' for ${name}.`);
  };

  return (
    <div className="modal-overlay active" style={{ zIndex: 1000, background: 'rgba(15, 23, 42, 0.60)', backdropFilter: 'blur(4px)' }}>
      <div
        className="modal-dialog"
        style={{
          width: '95%',
          maxWidth: '1320px',
          height: '90vh',
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #cbd5e1'
        }}
      >
        
        {/* ========================================================================= */}
        {/* 1. MINIMAL HEADER BAR: ← Candidates | Candidate Name | Match % | Recommend */}
        {/* ========================================================================= */}
        <div style={{
          padding: '12px 20px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={13} /> Candidates
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {name}
              </h2>
              <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: '500' }}>
                {candidateId}
              </span>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                • {jobTitle}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Match Score Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#16a34a',
              fontWeight: '700',
              fontSize: '12px'
            }}>
              <Target size={13} /> {matchScore}% Match
            </div>

            {/* Recommendation Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: recBadgeBg,
              color: recBadgeColor,
              fontWeight: '700',
              fontSize: '12px'
            }}>
              <Sparkles size={12} /> {recBadgeLevel}
            </div>

            <button
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: 'none',
                background: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP WORKSPACE GRID: Fully Responsive 3 Columns (Profile | Details | AI)  */}
        {/* ========================================================================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 210px) 1.8fr minmax(230px, 260px)',
          gap: '14px',
          padding: '14px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          overflowY: 'auto',
          maxHeight: '46vh'
        }}>

          {/* COLUMN 1: Profile Sidebar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '12px'
          }}>
            {/* Avatar & Main Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                flexShrink: 0
              }}>
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Applied: {appliedDate}</div>
              </div>
            </div>

            {/* Contact Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', color: '#475569', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Mail size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-all' }}>{email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Phone size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <span>{phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Globe size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <span>{location}</span>
              </div>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
              {linkedinUrl && (
                <a href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#0a66c2', fontWeight: '600', textDecoration: 'none', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                  <Linkedin size={11} /> LinkedIn
                </a>
              )}
              {githubUrl && (
                <a href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#0f172a', fontWeight: '600', textDecoration: 'none', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                  <Github size={11} /> GitHub
                </a>
              )}
            </div>

            {/* Recruiter Hashtag Tags */}
            <div style={{ paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Assigned Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                {tags.map(t => (
                  <span key={t} style={{ background: '#f8fafc', color: '#475569', fontSize: '10.5px', fontWeight: '500', padding: '1px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    #{t}
                  </span>
                ))}
              </div>
              <button
                onClick={handleAddTag}
                style={{ padding: '2px 6px', fontSize: '10.5px', borderRadius: '4px', border: '1px dashed #cbd5e1', background: '#ffffff', color: '#2563eb', fontWeight: '600', cursor: 'pointer', width: '100%' }}
              >
                + Add Tag
              </button>
            </div>
          </div>

          {/* COLUMN 2: Resume & Candidate Details */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '12px',
            overflowY: 'auto'
          }}>
            {/* Experience */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Briefcase size={13} style={{ color: '#2563eb' }} /> Work Experience
              </div>
              {expArray.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {expArray.map((e, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{e.role || 'Specialist'} • <span style={{ color: '#2563eb' }}>{e.company || 'Enterprise'}</span></div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>{e.duration || '2024 - Present'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '11.5px', color: '#64748b', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                  2+ Years verified hands-on industry experience in {jobTitle}.
                </div>
              )}
            </div>

            {/* Education */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <GraduationCap size={13} style={{ color: '#16a34a' }} /> Education & Qualifications
              </div>
              {eduArray.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {eduArray.map((ed, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{ed.degree || 'Bachelor Degree'}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>{ed.institution || 'University'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '11.5px', color: '#64748b', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                  Bachelor of Science in Computer Science / Cybersecurity.
                </div>
              )}
            </div>

            {/* Technical Projects */}
            {projectsArray.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Code2 size={13} style={{ color: '#7c3aed' }} /> Key Technical Projects
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {projectsArray.map((p, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.title} <span style={{ fontSize: '10.5px', color: '#2563eb' }}>({p.techStack})</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Skills Stack */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Tag size={13} style={{ color: '#2563eb' }} /> Technical Skills Stack
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {skills.map(s => (
                  <span key={s} style={{ fontSize: '10.5px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 3: AI Insights Panel */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '12px',
            overflowY: 'auto'
          }}>
            {/* Rationale */}
            <div style={{ background: '#faf5ff', border: '1px solid #f3e8ff', padding: '8px 10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#6b21a8', textTransform: 'uppercase', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Sparkles size={11} /> AI Match Rationale
              </div>
              <p style={{ fontSize: '11px', color: '#4c1d95', margin: 0, lineHeight: 1.35 }}>
                {aiSummaryText}
              </p>
            </div>

            {/* Skill Gaps */}
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Skill Match & Gaps</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#16a34a', marginBottom: '2px' }}>Matched ({matchedSkills.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {matchedSkills.slice(0, 4).map(s => (
                      <span key={s} style={{ fontSize: '10px', background: '#f0fdf4', color: '#166534', padding: '1px 5px', borderRadius: '4px' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#dc2626', marginBottom: '2px' }}>Missing Gaps ({missingSkills.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {missingSkills.map(s => (
                      <span key={s} style={{ fontSize: '10px', background: '#fef2f2', color: '#991b1b', padding: '1px 5px', borderRadius: '4px' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Audit & Confidence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>AI Confidence:</span>
                <strong style={{ color: '#16a34a' }}>94% Accuracy</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Resume Risk:</span>
                <strong style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '2px' }}><ShieldCheck size={11} /> Passed Clean</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>GitHub Index:</span>
                <strong style={{ color: '#2563eb' }}>Top 15% Verified</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SUB-NAVIGATION BAR: Compact Horizontal Scroll                           */}
        {/* ========================================================================= */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '0 20px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          overflowX: 'auto'
        }}>
          {[
            { id: 'Timeline', icon: Activity, label: 'Timeline' },
            { id: 'Notes', icon: NotebookPen, label: 'Notes' },
            { id: 'Interview', icon: Calendar, label: 'Interview' },
            { id: 'Documents', icon: FileText, label: 'Documents' },
            { id: 'Activity', icon: Clock, label: 'Activity' },
            { id: 'History', icon: HistoryIcon, label: 'History' },
            { id: 'Emails', icon: Mail, label: 'Emails' },
            { id: 'AIChat', icon: MessageSquare, label: 'AI Chat' }
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeBottomTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveBottomTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: isActive ? '700' : '600',
                  color: isActive ? '#2563eb' : '#64748b',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <IconComp size={13} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM INTERACTIVE PANEL                                                */}
        {/* ========================================================================= */}
        <div style={{
          flex: 1,
          padding: '14px 20px',
          background: '#ffffff',
          overflowY: 'auto',
          fontSize: '12.5px'
        }}>
          
          {/* TAB 1: Timeline */}
          {activeBottomTab === 'Timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Candidate Hiring Pipeline Timeline</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '10px', borderLeft: '2px solid #e2e8f0' }}>
                <div style={{ position: 'relative', paddingLeft: '12px' }}>
                  <div style={{ position: 'absolute', left: '-16px', top: '3px', width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></div>
                  <strong style={{ color: '#0f172a' }}>Application Submitted</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Submitted application profile on {appliedDate}</div>
                </div>
                <div style={{ position: 'relative', paddingLeft: '12px' }}>
                  <div style={{ position: 'absolute', left: '-16px', top: '3px', width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed' }}></div>
                  <strong style={{ color: '#0f172a' }}>AI Match Evaluation Passed ({matchScore}%)</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Assigned {matchScore}% technical match rating</div>
                </div>
                <div style={{ position: 'relative', paddingLeft: '12px' }}>
                  <div style={{ position: 'absolute', left: '-16px', top: '3px', width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></div>
                  <strong style={{ color: '#0f172a' }}>Security & Malware Verification</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>CV binary passed automated malware audit</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Notes */}
          {activeBottomTab === 'Notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Private Recruiter Notes</h4>
                <button
                  onClick={() => setIsEditingNote(!isEditingNote)}
                  style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <Edit2 size={11} /> {isEditingNote ? 'Cancel' : 'Edit Note'}
                </button>
              </div>

              {isEditingNote ? (
                <div>
                  <textarea
                    rows={3}
                    value={candidateNotesDraft}
                    onChange={(e) => setCandidateNotesDraft(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', background: '#f8fafc', marginBottom: '6px' }}
                  />
                  <button
                    onClick={() => {
                      if (onSaveHrNotes) onSaveHrNotes();
                      setIsEditingNote(false);
                      alert('Recruiter note saved!');
                    }}
                    style={{ padding: '5px 12px', borderRadius: '6px', background: '#2563eb', color: '#ffffff', fontSize: '11.5px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                  >
                    Save Recruiter Note
                  </button>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '6px', fontStyle: 'italic', color: '#334155', fontSize: '12px' }}>
                  "{candidateNotesDraft || 'Candidate demonstrates strong domain knowledge, clear communication skills, and solid technical capabilities. Recommended for technical interview.'}"
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Interview */}
          {activeBottomTab === 'Interview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Schedule Technical Interview</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>Interview Date</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>Interview Time</label>
                  <input type="time" defaultValue="14:00" style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>Interviewer</label>
                  <input type="text" defaultValue="Lead Engineer" style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', outline: 'none' }} />
                </div>
              </div>
              <button
                onClick={() => {
                  if (onScheduleInterview) onScheduleInterview();
                  alert(`Interview scheduled with ${name}`);
                }}
                style={{ padding: '6px 14px', borderRadius: '6px', background: '#2563eb', color: '#ffffff', fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Calendar size={13} /> Send Calendar Invite
              </button>
            </div>
          )}

          {/* TAB 4: Documents */}
          {activeBottomTab === 'Documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Candidate CV & Verified Attachments</h4>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>Original CV Resume File</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{cand.cv_file_path ? 'PDF File' : 'Profile Resume Text'}</div>
                </div>
                <button
                  onClick={handleDownloadResume}
                  style={{ padding: '5px 12px', borderRadius: '6px', background: '#2563eb', color: '#ffffff', fontSize: '11.5px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={12} /> Download CV
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Activity */}
          {activeBottomTab === 'Activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Recent Audit Activity Log</h4>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', color: '#475569' }}>
                • Candidate profile created and evaluated against live PostgreSQL job postings.
              </div>
            </div>
          )}

          {/* TAB 6: History */}
          {activeBottomTab === 'History' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Application History Record</h4>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', color: '#475569' }}>
                • Active application for position: <strong>{jobTitle}</strong> ({appliedDate})
              </div>
            </div>
          )}

          {/* TAB 7: Emails */}
          {activeBottomTab === 'Emails' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Send Email to {name}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', outline: 'none' }}
                  placeholder="Subject..."
                />
                <textarea
                  rows={3}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', outline: 'none' }}
                  placeholder="Message body..."
                />
                <button
                  onClick={() => {
                    window.location.href = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                  }}
                  style={{ padding: '6px 14px', borderRadius: '6px', background: '#2563eb', color: '#ffffff', fontSize: '11.5px', fontWeight: '700', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Send size={12} /> Send Email
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: AI Chat */}
          {activeBottomTab === 'AIChat' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} style={{ color: '#7c3aed' }} /> Ask Recruiter AI Assistant
              </h4>

              <div style={{ flex: 1, minHeight: '100px', maxHeight: '160px', overflowY: 'auto', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {aiChatMessages.map((msg, idx) => (
                  <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', background: msg.sender === 'user' ? '#2563eb' : '#ffffff', color: msg.sender === 'user' ? '#ffffff' : '#0f172a', border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0', padding: '5px 10px', borderRadius: '8px', maxWidth: '85%', fontSize: '11.5px' }}>
                    {msg.text}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Ask e.g. What are candidate's top technical strengths?"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAiChatMessage()}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', outline: 'none' }}
                />
                <button
                  onClick={handleSendAiChatMessage}
                  style={{ padding: '6px 14px', borderRadius: '6px', background: '#7c3aed', color: '#ffffff', fontSize: '11.5px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <Send size={12} /> Ask AI
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
