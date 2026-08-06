# 🚀 Hirenetic — Enterprise AI-Powered Recruitment & HR Automation Platform

**Hirenetic** is a next-generation, full-stack enterprise recruitment and talent matching platform built with **Next.js 14 (App Router)**, **PostgreSQL (Supabase)**, and **Multi-LLM Artificial Intelligence Engines (Groq Llama 3.3 70B, Google Gemini 1.5 Flash, OpenAI GPT-4o-mini)**.

It seamlessly connects Candidates, HR Recruiters, and Platform Administrators in a unified, real-time ecosystem with multi-dimensional candidate matching, dual-mode job application routing, real-time quota tracking, and automated workflow execution.

---

## 📸 Key Features & System Modules

### 1. 🎓 Candidate Portal (`/candidate-panel`)
- **AI Resume Parser**: Instant AI extraction of candidate profiles, skills, work experience, education, projects, and certifications from PDF/Doc CVs.
- **4-Dimensional AI Job Matching Engine**:
  - **Skills Overlap (40% Weight)**
  - **Domain Alignment (20% Weight)**
  - **Experience Fit (20% Weight)**
  - **Projects & Portfolio Fit (20% Weight)**
- **Dual-Mode Application System**:
  - **External Jobs**: Seamless redirect to external job portals (LinkedIn, Greenhouse, Lever, etc.) with background database tracking (`status: Redirected`).
  - **Internal HR Posted Jobs**: Instant 1-click In-Platform Application Modal submitting candidate CVs directly to recruiters (`status: Applied`).
- **Interactive Match Analytics**: Score breakdown pills (`Skills %`, `Domain %`, `Experience %`, `Projects %`) alongside AI-generated Pro Candidate Tips.

### 2. 💼 HR Recruiter Panel (`/hr-panel`)
- **Job Posting & Open/Closed Position Settings**:
  - Create new job openings with explicit **Initial Position Settings** (`🟢 Open Position` vs `🔴 Closed Position`).
  - Live real-time status toggle (`Close` / `Reopen`) with automatic Supabase database synchronization (`crwl_jobsData`).
- **Candidate Detail Widget (`CandidateDetailModal.js`)**:
  - **3-Column Workspace Grid**: Left Profile Sidebar, Expanded Center Resume & Details View, and Right AI Insights Panel (Confidence rating, Skill Gaps, Malware Threat Audit, GitHub Quality Index).
  - **8 Interactive Sub-Tabs**: `Timeline` | `Notes` | `Interview` | `Documents` | `Activity` | `History` | `Emails` | `AI Chat`.
  - **Recruiter AI Chat Assistant**: Interactive AI assistant to ask instant questions about candidate backgrounds.
- **Applicants & Talent Pool View**: Real-time applicant counts per job card, job-specific filtering, direct HR application badges, and talent pool bookmarking.

### 3. 🛡️ Admin Management Panel (`/admin-panel`)
- **Ultra-Compact Minimal Design**: Sleek 220px sidebar, 54px header, non-bulky layout system with crisp borders.
- **Live Supabase Entity Analytics**: Real-time query counters for candidates (`candidates_profiles`), recruiters (`employers_profiles`), active job postings (`crwl_jobsData`), tracked applications (`job_applications`), and automation scripts (`scriptsEditor`).
- **Direct System Portal Links**: Quick navigation shortcuts to **API Management** and **Script Editor**.

### 4. 🔑 API Management Panel (`/apimanagement-panel`)
- **Real-Time LLM Quota Tracking**: Automatically tracks token calls and inference requests (`used_quota` / `daily_quota`) whenever Groq, OpenAI, or Gemini APIs run candidate recommendations or CV parsing.
- **API Key Lifecycle Control**: Add, test, edit, and monitor API credentials with real-time database updates.

### 5. 📜 Script Inventory & Automation Workflow (`/scripts-inventory`)
- **Python Automation Engine**: Code editor with local Python execution sandbox and dynamic pip dependency resolver.
- **GitHub Actions Runner**: Remote workflow execution via GitHub API webhooks.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router), React 18, JavaScript (ES6+) |
| **Styling & UI** | Vanilla CSS Design System, Lucide React Icons, Responsive Flex/Grid |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS) |
| **AI / LLM Engines** | Groq Llama 3.3 70B, Google Gemini 1.5 Flash, OpenAI GPT-4o-mini |
| **Automation** | Python 3, Node.js `child_process`, GitHub Actions REST API |
| **Deployment** | Vercel Serverless Functions, Docker & Docker Compose |

---

## ⚡ Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/moeenuddin/SummerInternship_AirUni.git
cd Hirenetic
npm install
```

### 2. Configure Environment Variables (`.env.local`)
Create a `.env.local` file in the root directory:
```env
# Supabase PostgreSQL Configuration
NEXT_PUBLIC_SUPABASE_URL=https://fdducqoklmqvomsszyqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Multi-LLM API Credentials (Optional Backup Keys)
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# GitHub Actions Workflow Runner (Optional)
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=moeenuddin
GITHUB_REPO=SummerInternship_AirUni
GITHUB_BRANCH=main
GITHUB_WORKFLOW=run_script.yml
```

### 3. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- **Candidate Portal**: `http://localhost:3000/candidate-panel`
- **HR Recruiter Panel**: `http://localhost:3000/hr-panel`
- **Admin Panel**: `http://localhost:3000/admin-panel`
- **API Management**: `http://localhost:3000/apimanagement-panel`
- **Script Inventory**: `http://localhost:3000/scripts-inventory`

---

## 🚀 Deployment

### Deploying to Vercel (1-Click)
1. Push code to your GitHub repository.
2. Import project on [Vercel.com](https://vercel.com).
3. Set the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Click **Deploy**!

### Deploying with Docker
```bash
docker-compose up --build -d
```
Access the containerized application at `http://localhost:3000`.

---

## 📁 Directory Structure

```text
Hirenetic/
├── MDFILES/                   # System documentation & architectural guides
├── SQL_SCHEMA/                # Database SQL schemas & migrations
├── public/                    # Static assets & public images
├── src/
│   ├── app/
│   │   ├── admin-panel/       # Admin console, stats API & minimal CSS
│   │   ├── apimanagement-panel/# Real-time API key quota tracker & manager
│   │   ├── candidate-panel/   # Candidate Portal, CV parser & AI recommendation API
│   │   ├── cross-matching/    # Multi-dimensional matching verification
│   │   ├── exposed-api/       # Public developer API endpoints
│   │   ├── hr-panel/          # HR Panel, Candidate Detail Widget & Applicants view
│   │   ├── scripts-inventory/ # Script editor & Python runner
│   │   ├── globals.css        # Core global styles
│   │   ├── layout.js          # Root layout
│   │   └── page.js            # Home page redirect
├── Dockerfile                 # Next.js production build container
├── docker-compose.yml         # Container orchestration configuration
├── package.json               # Dependencies & scripts
└── README.md                  # Project documentation
```

---

## 📝 License & Version
- **Version**: `2.6.0`
- **License**: MIT
- **Built for**: Advanced Agentic Recruitment & Enterprise AI Talent Analytics.
