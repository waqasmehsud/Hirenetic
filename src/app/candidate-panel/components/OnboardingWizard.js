'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle2, User, Link as LinkIcon, FileText, ChevronRight, Briefcase, Github, Linkedin, Code2, AlertCircle, Phone, MapPin, GraduationCap, Building2, Plus, Trash2, Award, FolderGit2, Mail } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { classifyText } from '../fieldClassifier';
import { scanPDFForThreats } from '../cvSecurityScan';

// Real PDF Text Extractor using pdfjs-dist with Y-coordinate line break detection
async function extractPDFText(file) {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    const version = pdfjsLib.version || '3.11.174';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      let lastY = null;
      let pageText = '';

      for (const item of content.items) {
        if (!item.str) continue;
        const currentY = item.transform ? item.transform[5] : null;
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 6) {
          pageText += '\n';
        } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
          pageText += ' ';
        }
        pageText += item.str;
        if (currentY !== null) lastY = currentY;
      }
      fullText += pageText + '\n';
    }
    return fullText;
  } catch (err) {
    console.error('PDF text extraction error:', err);
    return '';
  }
}

// Extract Skills from Text
const ALL_TECH_SKILLS = [
  'React', 'Next.js', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++',
  'SQL', 'SQLite', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Azure',
  'Cybersecurity', 'Wazuh SIEM', 'Threat Analysis', 'Network Security', 'Penetration Testing',
  'Wireshark', 'Burp Suite', 'Nmap', 'Machine Learning', 'PyTorch', 'TensorFlow', 'Pandas',
  'Git', 'GitHub', 'REST API', 'GraphQL', 'TailwindCSS', 'Linux', 'SIEM'
];

function extractSkillsFromText(text) {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  return ALL_TECH_SKILLS.filter(skill => {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return pattern.test(lowerText);
  });
}

// Extract Social Links from Text
function extractUrlsFromText(text) {
  let github = '';
  let linkedin = '';
  let portfolio = '';

  if (!text) return { github, linkedin, portfolio };

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) github = githubMatch[0].replace(/^https?:\/\//i, '');

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) linkedin = linkedinMatch[0].replace(/^https?:\/\//i, '');

  const portfolioMatch = text.match(/(?:https?:\/\/)?([a-zA-Z0-9_-]+\.(?:dev|io|me|com|net))(?:\/[^\s]*)?/i);
  if (portfolioMatch && !portfolioMatch[0].includes('github.com') && !portfolioMatch[0].includes('linkedin.com')) {
    portfolio = portfolioMatch[0].replace(/^https?:\/\//i, '');
  }

  return { github, linkedin, portfolio };
}

export default function OnboardingWizard({ user, onComplete }) {
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [parseStatus, setParseStatus] = useState('');
  const [parseError, setParseError] = useState('');
  const [saving, setSaving] = useState(false);

  const [activeLlmProvider, setActiveLlmProvider] = useState('');
  const [rawLlmJson, setRawLlmJson] = useState({});

  // Profile Form States
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);

  // Projects State
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: '', techStack: '', link: '', description: '' });
  const [showAddProject, setShowAddProject] = useState(false);

  // Certifications State
  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState({ name: '', issuer: '', year: '' });
  const [showAddCert, setShowAddCert] = useState(false);

  // Work Experience State
  const [experience, setExperience] = useState([]);
  const [newExp, setNewExp] = useState({ company: '', role: '', duration: '', description: '' });
  const [showAddExp, setShowAddExp] = useState(false);

  // Education State
  const [education, setEducation] = useState([]);
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', year: '' });
  const [showAddEdu, setShowAddEdu] = useState(false);

  // Social Links State
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Job Interests State
  const [interests, setInterests] = useState([
    { name: 'Frontend Dev', selected: true },
    { name: 'Backend Dev', selected: false },
    { name: 'Cybersecurity', selected: false },
    { name: 'Cloud/DevOps', selected: false },
    { name: 'Data Science', selected: false },
    { name: 'AI / Machine Learning', selected: false }
  ]);

  // Load existing profile data if available
  useEffect(() => {
    async function loadCandidateProfile() {
      if (!supabase || !user?.id) return;
      try {
        const { data: profile } = await supabase
          .from('candidates_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          if (profile.full_name) setFullName(profile.full_name);
          if (profile.title) setTitle(profile.title);
          if (profile.phone) setPhone(profile.phone);
          if (profile.location) setLocation(profile.location);
          if (profile.bio) setBio(profile.bio);
          if (Array.isArray(profile.skills) && profile.skills.length > 0) setSkills(profile.skills);
          if (Array.isArray(profile.projects)) setProjects(profile.projects);
          if (Array.isArray(profile.certifications)) setCertifications(profile.certifications);
          if (Array.isArray(profile.experience)) setExperience(profile.experience);
          if (Array.isArray(profile.education)) setEducation(profile.education);
          if (profile.github_url) setGithub(profile.github_url);
          if (profile.linkedin_url) setLinkedin(profile.linkedin_url);
          if (profile.portfolio_url) setPortfolio(profile.portfolio_url);
        }
      } catch (err) {
        console.log('Wizard profile load notice:', err);
      }
    }
    loadCandidateProfile();
  }, [user]);

  // REAL File Upload & AI Text Extraction Handler
  const handleRealFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setParseError('');
    setParseStatus('Scanning file security...');

    try {
      // 1. Security Threat Scan
      const scanResult = await scanPDFForThreats(file);
      if (!scanResult.safe) {
        setParseError(`Security Notice: ${scanResult.warnings.join(', ')}.`);
        setIsUploading(false);
        return;
      }

      // 2. Real PDF Text Extraction
      setParseStatus('Extracting text from resume with AI...');
      let text = '';
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        text = await extractPDFText(file);
      } else {
        text = await file.text();
      }

      // 3. AI Intelligence Extraction via /api/analyze-resume route (LLM / AI Engine)
      setParseStatus('AI LLM analyzing profile, projects & certifications...');
      
      const aiRes = await fetch('/candidate-panel/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text })
      });

      let classifiedField = title;

      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        if (aiJson.success && aiJson.data) {
          if (aiJson.provider) setActiveLlmProvider(aiJson.provider);
          setRawLlmJson(aiJson.data || {});
          const ai = aiJson.data;
          if (ai.fullName) setFullName(ai.fullName);
          if (ai.title) {
            setTitle(ai.title);
            classifiedField = ai.title;
          }
          if (ai.phone) setPhone(ai.phone);
          if (ai.location) setLocation(ai.location);
          if (ai.bio) setBio(ai.bio);
          if (Array.isArray(ai.skills) && ai.skills.length > 0) setSkills(ai.skills);
          if (Array.isArray(ai.projects) && ai.projects.length > 0) setProjects(ai.projects);
          if (Array.isArray(ai.certifications) && ai.certifications.length > 0) setCertifications(ai.certifications);
          if (Array.isArray(ai.experience) && ai.experience.length > 0) setExperience(ai.experience);
          if (Array.isArray(ai.education) && ai.education.length > 0) setEducation(ai.education);
          if (ai.github_url) setGithub(ai.github_url);
          if (ai.linkedin_url) setLinkedin(ai.linkedin_url);
          if (ai.portfolio_url) setPortfolio(ai.portfolio_url);

          if (ai.recommendedDomain) {
            setInterests(prev => prev.map(item => ({
              ...item,
              selected: item.name.toLowerCase() === ai.recommendedDomain.toLowerCase() || item.name.toLowerCase().includes(ai.recommendedDomain.toLowerCase())
            })));
          }
        }
      } else {
        const localField = classifyText(text);
        if (localField) setTitle(localField);
        const extractedSkills = extractSkillsFromText(text);
        if (extractedSkills.length > 0) setSkills(extractedSkills);
        const extractedUrls = extractUrlsFromText(text);
        if (extractedUrls.github) setGithub(extractedUrls.github);
        if (extractedUrls.linkedin) setLinkedin(extractedUrls.linkedin);
        if (extractedUrls.portfolio) setPortfolio(extractedUrls.portfolio);
      }

      // 4. Save Resume to Storage if user is logged in
      let filePath = '';
      if (supabase && user?.id) {
        setParseStatus('Saving resume to secure vault...');
        try {
          filePath = `${user.id}/${Date.now()}_${file.name}`;
          await supabase.storage.from('cvs').upload(filePath, file);
        } catch (stErr) {
          console.log('Storage upload notice (bucket may need creation):', stErr);
        }

        await supabase
          .from('candidates_profiles')
          .update({
            resume_text: text.slice(0, 8000),
            resume_field: classifiedField || title,
            cv_file_path: filePath
          })
          .eq('id', user.id);
      }

      setIsUploading(false);
      setStep(2);

    } catch (err) {
      console.error('File parsing exception:', err);
      setParseError('Failed to parse file text. Advancing to manual entry.');
      setIsUploading(false);
      setTimeout(() => setStep(2), 1000);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      setShowSkillInput(false);
    }
  };

  const handleAddProjectItem = () => {
    if (newProject.title.trim()) {
      setProjects([...projects, { ...newProject }]);
      setNewProject({ title: '', techStack: '', link: '', description: '' });
      setShowAddProject(false);
    }
  };

  const handleAddCertItem = () => {
    if (newCert.name.trim()) {
      setCertifications([...certifications, { ...newCert }]);
      setNewCert({ name: '', issuer: '', year: '' });
      setShowAddCert(false);
    }
  };

  const handleAddExperienceItem = () => {
    if (newExp.company.trim() || newExp.role.trim()) {
      setExperience([...experience, { ...newExp }]);
      setNewExp({ company: '', role: '', duration: '', description: '' });
      setShowAddExp(false);
    }
  };

  const handleAddEducationItem = () => {
    if (newEdu.institution.trim() || newEdu.degree.trim()) {
      setEducation([...education, { ...newEdu }]);
      setNewEdu({ institution: '', degree: '', year: '' });
      setShowAddEdu(false);
    }
  };

  const toggleInterest = (index) => {
    const updated = [...interests];
    updated[index].selected = !updated[index].selected;
    setInterests(updated);
  };

  const handleFinishWizard = async () => {
    setSaving(true);
    try {
      if (supabase && user?.id) {
        const selectedInterests = interests.filter(i => i.selected).map(i => i.name);
        
        await supabase
          .from('candidates_profiles')
          .upsert({
            id: user.id,
            email: email.trim() || user?.email || '',
            full_name: fullName.trim() || user?.user_metadata?.full_name || 'Candidate User',
            title: title.trim(),
            phone: phone.trim(),
            location: location.trim(),
            bio: bio.trim(),
            skills: skills,
            projects: projects,
            certifications: certifications,
            experience: experience,
            education: education,
            github_url: github.trim(),
            linkedin_url: linkedin.trim(),
            portfolio_url: portfolio.trim(),
            resume_field: selectedInterests[0] || title.trim() || 'Software Engineering',
            interests: selectedInterests.length > 0 ? selectedInterests : [title.trim() || 'Software Engineering'],
            preferred_job_type: 'Both',
            llm_parsed_json: rawLlmJson,
            active_llm_provider: activeLlmProvider,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          });
      }
    } catch (err) {
      console.error('Wizard save notice:', err);
    } finally {
      setSaving(false);
      if (onComplete) {
        onComplete();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.docx"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleRealFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Top Navigation & Progress */}
      <div className="max-w-4xl w-full mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="text-xl font-semibold text-slate-900">Candidate Portal</span>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Step {step} of 3
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        
        {/* STEP 1: CV Upload */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Let's build your profile</h2>
              <p className="text-slate-500 text-sm">Upload your resume and our AI will automatically extract your details to save you time.</p>
            </div>

            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-medium text-slate-700">{parseStatus || 'Analyzing document with AI...'}</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-base font-semibold text-slate-900 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500">PDF, TXT, DOCX up to 5MB</p>
                </>
              )}
            </div>

            {parseError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => setStep(2)}
                className="text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                Skip for now, I'll enter manually
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Comprehensive Review AI Parsed Data */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h2 className="text-2xl font-bold text-slate-900">Review your profile details</h2>
              </div>
              <p className="text-slate-500 text-sm">We've extracted these details from your resume. Feel free to edit or add missing information.</p>
              
              {activeLlmProvider && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>✨ Analyzed via {activeLlmProvider}</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Row 1: Full Name & Professional Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Waqas Khan"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Professional Title</label>
                  <div className="relative">
                    <Briefcase className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Cybersecurity Intern / SOC Member"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email, Phone Number & Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. waqasmehsud77@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +92 326 5982180"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location / City</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Abdul Hakīm, Punjab, Pakistan"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Executive Summary</label>
                <textarea 
                  rows="3" 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Concise 2-sentence executive summary..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                ></textarea>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Top Skills (AI Extracted)</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-blue-100 transition-colors">
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => setSkills(skills.filter(s => s !== skill))}
                        className="text-blue-400 hover:text-blue-700 font-bold text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {showSkillInput ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                        placeholder="Type skill name..."
                        className="px-3 py-1.5 bg-white border border-blue-400 rounded-lg text-sm outline-none w-36"
                        autoFocus
                      />
                      <button 
                        type="button" 
                        onClick={handleAddSkill}
                        className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setShowSkillInput(true)}
                      className="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                    >
                      + Add Skill
                    </button>
                  )}
                </div>
              </div>

              {/* Technical Projects Section */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-slate-600" />
                    <h3 className="text-base font-semibold text-slate-900">Technical Projects & Labs</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddProject(!showAddProject)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                {/* Inline Add Project Form */}
                {showAddProject && (
                  <div className="p-4 bg-slate-50 border border-blue-200 rounded-xl mb-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Project Title" 
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Tech Stack / Tools (e.g. Wazuh, Wireshark, Python)" 
                        value={newProject.techStack}
                        onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Project Link / GitHub URL" 
                      value={newProject.link}
                      onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                    />
                    <textarea 
                      placeholder="Short description of technical implementation and results..."
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none resize-none h-16"
                    ></textarea>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddProject(false)} 
                        className="px-3 py-1.5 text-xs text-slate-500 font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={handleAddProjectItem} 
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium"
                      >
                        Save Project
                      </button>
                    </div>
                  </div>
                )}

                {/* Projects Entries List */}
                <div className="space-y-3">
                  {projects.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No projects added yet. Click "+ Add Project" to feature key technical work.</p>
                  ) : (
                    projects.map((proj, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative group flex justify-between items-start">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{proj.title}</div>
                          {proj.techStack && <div className="text-xs text-blue-600 font-medium mt-0.5">{proj.techStack}</div>}
                          {proj.description && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{proj.description}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Certifications & Achievements Section */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-slate-600" />
                    <h3 className="text-base font-semibold text-slate-900">Certifications & Achievements</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCert(!showAddCert)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Certification
                  </button>
                </div>

                {/* Inline Add Certification Form */}
                {showAddCert && (
                  <div className="p-4 bg-slate-50 border border-blue-200 rounded-xl mb-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Certification Title / Honor" 
                        value={newCert.name}
                        onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Issuing Organization (e.g. HTB, TryHackMe, CompTIA)" 
                        value={newCert.issuer}
                        onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Year / Credential URL (e.g. 2025)" 
                      value={newCert.year}
                      onChange={(e) => setNewCert({ ...newCert, year: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddCert(false)} 
                        className="px-3 py-1.5 text-xs text-slate-500 font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={handleAddCertItem} 
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium"
                      >
                        Save Certification
                      </button>
                    </div>
                  </div>
                )}

                {/* Certifications Entries List */}
                <div className="space-y-3">
                  {certifications.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No certifications added yet. Click "+ Add Certification" to list your credentials.</p>
                  ) : (
                    certifications.map((cert, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative group flex justify-between items-start">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{cert.name}</div>
                          <div className="text-xs text-blue-600 font-medium">{cert.issuer} • <span className="text-slate-500">{cert.year}</span></div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Work Experience Section */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-600" />
                    <h3 className="text-base font-semibold text-slate-900">Work Experience</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddExp(!showAddExp)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                {/* Inline Add Experience Form */}
                {showAddExp && (
                  <div className="p-4 bg-slate-50 border border-blue-200 rounded-xl mb-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Company Name" 
                        value={newExp.company}
                        onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Role / Title" 
                        value={newExp.role}
                        onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Duration (e.g. 2022 - Present)" 
                      value={newExp.duration}
                      onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                    />
                    <textarea 
                      placeholder="Short description of responsibilities & key achievements..."
                      value={newExp.description}
                      onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none resize-none h-16"
                    ></textarea>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddExp(false)} 
                        className="px-3 py-1.5 text-xs text-slate-500 font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={handleAddExperienceItem} 
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium"
                      >
                        Save Experience
                      </button>
                    </div>
                  </div>
                )}

                {/* Experience Entries List */}
                <div className="space-y-3">
                  {experience.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No experience added yet. Click "+ Add Experience" to insert your work history.</p>
                  ) : (
                    experience.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative group flex justify-between items-start">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{exp.role || 'Position'}</div>
                          <div className="text-xs text-blue-600 font-medium">{exp.company || 'Company'} • <span className="text-slate-500">{exp.duration || 'Dates'}</span></div>
                          {exp.description && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{exp.description}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Education & Qualifications Section */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-slate-600" />
                    <h3 className="text-base font-semibold text-slate-900">Education & Qualifications</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddEdu(!showAddEdu)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Education
                  </button>
                </div>

                {/* Inline Add Education Form */}
                {showAddEdu && (
                  <div className="p-4 bg-slate-50 border border-blue-200 rounded-xl mb-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Institution / University" 
                        value={newEdu.institution}
                        onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Degree / Major (e.g. BS Computer Science)" 
                        value={newEdu.degree}
                        onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Year / Duration (e.g. 2020 - 2024)" 
                      value={newEdu.year}
                      onChange={(e) => setNewEdu({ ...newEdu, year: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddEdu(false)} 
                        className="px-3 py-1.5 text-xs text-slate-500 font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={handleAddEducationItem} 
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium"
                      >
                        Save Education
                      </button>
                    </div>
                  </div>
                )}

                {/* Education Entries List */}
                <div className="space-y-3">
                  {education.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No education added yet. Click "+ Add Education" to insert your academic background.</p>
                  ) : (
                    education.map((edu, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative group flex justify-between items-start">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{edu.degree || 'Degree'}</div>
                          <div className="text-xs text-blue-600 font-medium">{edu.institution || 'University'} • <span className="text-slate-500">{edu.year || 'Graduation Year'}</span></div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="mt-10 flex justify-end">
              <button 
                onClick={() => setStep(3)}
                className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-100"
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Social & Interests */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Almost there!</h2>
              <p className="text-slate-500 text-sm">Add your professional links and tell us what kind of roles you are looking for.</p>
            </div>

            <div className="space-y-8">
              {/* Links Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Web Presence</h3>
                
                <div className="relative">
                  <Github className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                  <input 
                    type="url" 
                    placeholder="github.com/username" 
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  />
                </div>
                
                <div className="relative">
                  <Linkedin className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                  <input 
                    type="url" 
                    placeholder="linkedin.com/in/username" 
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  />
                </div>
                
                <div className="relative">
                  <LinkIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                  <input 
                    type="url" 
                    placeholder="Personal Portfolio URL" 
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Interests Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Job Interests</h3>
                <p className="text-xs text-slate-500 mb-4">Select domains you are most interested in. This helps our matching engine.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {interests.map((interest, idx) => (
                    <div 
                      key={interest.name} 
                      onClick={() => toggleInterest(idx)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium text-center cursor-pointer transition-all ${interest.selected ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      {interest.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between">
              <button 
                onClick={() => setStep(2)}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleFinishWizard}
                disabled={saving}
                className="flex items-center px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-medium rounded-xl transition-colors focus:ring-4 focus:ring-slate-200"
              >
                {saving ? 'Saving Profile...' : 'Complete Profile'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
