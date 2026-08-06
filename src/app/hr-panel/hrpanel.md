# Candidate Profile Widget & HR Panel Specification (`hrpanel.md`)

## Overview

The **Hirenetic HR Panel** (`/hr-panel`) provides an enterprise-grade job posting and applicant matching workspace. HR recruiters can create, configure, publish, and manage job openings across technical domains.

---

## Post New Job Modal Specification (`PostJobModal.js`)

When an HR recruiter clicks **Post a New Job Opening**, an interactive modal opens with the following fields:

### Configured Form Fields:
1. **Job Title (\*)**: Role title (e.g. `Senior Python Developer`, `Cybersecurity SOC Analyst`, `Data Scientist`).
2. **Department / Category (\*)**: Target technical division (`Software Engineering`, `Cybersecurity & SecOps`, `Data Science & AI`, `Cloud & DevOps`, `Product & UI/UX Design`).
3. **Workplace Type (\*)**: Work environment mode (`Remote`, `On-site`, `Hybrid`).
4. **Employment Type (\*)**: Contract arrangement (`Full-Time`, `Part-Time`, `Contract`, `Internship`).
5. **Location / City (\*)**: Geographic location (e.g. `Islamabad, Pakistan / Remote`).
6. **Experience Level (\*)**: Required candidate experience (`Entry-Level 0-1 yrs`, `Mid-Level 2-4 yrs`, `Senior 5+ yrs`, `Lead / Managerial`).
7. **Salary Range / Compensation**: Salary expectations (e.g. `$80,000 - $110,000` / `PKR 250k - 400k per month`).
8. **Required Technical Skills Stack (\*)**: Comma-separated technical stack (e.g. `Python, Docker, AWS, React, SQL, Wireshark`).
9. **Job Description & Overview (\*)**: Overview of the role mission and team objectives.
10. **Key Responsibilities**: Primary day-to-day duties and core tasks.
11. **Requirements & Qualifications**: Academic degree, certifications, and technical proficiencies required.

---

## Candidate Profile Widget Specification

When an HR user clicks **View Profile** from any Candidate List or Real Database Candidate Directory, the single, box-free **Candidate Profile Widget** opens displaying:

1. **Frameless Header**: Avatar initials, verified candidate pill, candidate ID tag, contact chips (Email, Phone, LinkedIn, GitHub), and AI match score percentage (`92% AI Match`).
2. **Quick Info Pill Strip**: Horizontal pill strip for Role, Experience, Education, Notice Period, and Expected Salary.
3. **AI Skill Fit Matrix**: Progress bar, green check pills (`#f0fdf4`) for Matched Skills, and red pills (`#fef2f2`) for Gap Skills.
4. **AI Profile Assessment**: Quote block assessment with subtle indigo left border (`border-left: 3px solid #6366f1`).
5. **Technical Projects**: Bulleted list of parsed technical projects with tech stack badges.
6. **Security & Threat Scan Audit**: Horizontal checklist verifying Malware Scan, Duplicate Hash Check, and AI Content Score.
7. **Private HR Notes**: Text editor visible only to HR recruiters with live save & edit controls.
8. **Hiring Stage Selector**: Stage dropdown (`Applied`, `Shortlisted`, `Interview`, `Hired`, `Rejected`) with **Update Stage Status** button.
9. **Recruiter Actions**: Buttons for CV Download, Schedule Interview, Send Direct Email (`mailto:`), and Talent Pool toggle.
10. **Recruiter Tags**: Hashtag-style tags (`#TopCandidate`, `#HighPotential`, `#TeamFit`, `#Python`, `#CyberSecurity`) with `+ Add Tag` button.

---

## Feature Status Table

| Feature | Status | Description |
| :--- | :---: | :--- |
| **Post Job Fields** | ✅ | Title, Department, Workplace Type, Employment Type, Location, Experience, Salary, Skills, Description, Responsibilities, Requirements. |
| **Real DB Candidates Directory** | ✅ | Live candidate directory fetching real profiles directly from Supabase `public.candidates_profiles`. |
| **Candidate Information** | ✅ | Avatar, full name, contact, location, LinkedIn, position, date, ID. |
| **AI Match Score** | ✅ | Match score bar, matched skills, missing skills, AI summary text. |
| **Resume Information** | ✅ | Verified status, malware threat scan, duplicate check, CV download. |
| **Candidate Status** | ✅ | Interactive status dropdown (`Applied`, `Shortlisted`, `Interview`, `Hired`, `Rejected`). |
| **Recruiter Actions** | ✅ | Download CV, Schedule Interview, Send Email, Add/Remove Talent Pool. |
| **Background Information** | ✅ | Work experience, education, current role, expected salary, notice period, portfolio links. |
| **HR Notes** | ✅ | Private text editor for recruiter notes with save & edit controls. |
| **Recruiter Tags** | ✅ | Hashtag tag assignment (`#TopCandidate`, `#HighPotential`, `#TeamFit`, etc.). |

---

## Folder Architecture

```text
src/app/hr-panel/
├── page.js               # Main HR Dashboard controller, state manager & view switcher
├── styles.css            # Responsive layout & glassmorphism design system
├── supabase.js           # Supabase DB client connection
├── hrpanel.md            # Comprehensive Candidate Profile Widget & HR Panel documentation
└── components/
    ├── Sidebar.js              # Navigation sidebar with Real DB Candidate counter
    ├── Topbar.js               # Header controls, search & Post Job shortcut
    ├── DashboardView.js        # Analytics overview, metrics cards & hiring funnel
    ├── AllCandidatesView.js    # Live real DB candidate directory from public.candidates_profiles
    ├── JobsView.js             # Job postings management & status rotation
    ├── ApplicantsView.js       # Applicant triage, multi-parametric search & score filter
    ├── HRProfileView.js        # HR recruiter profile manager & DB profile updater
    ├── SettingsView.js         # Account security, password change & preferences
    ├── TalentPoolView.js       # Bookmarked talent pool repository
    ├── ComparisonView.js       # Side-by-side candidate comparison matrix
    ├── AuditLogsView.js        # Compliance audit trail for HR recruiter actions
    ├── PostJobModal.js         # Configured Job Posting modal component
    ├── CandidateDetailModal.js # Box-free Candidate Profile Widget component
    └── ToastContainer.js       # Real-time alert toast notifications
```