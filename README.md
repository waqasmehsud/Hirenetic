# 🚀 Hirenetic — Enterprise AI-Powered Recruitment & HR Automation Platform

First commit

Each candidate has to create a separate branch for the task she/he has done with the intials of name such as 'wq_devsecops' You are the owner of your branch, ideally if I fetch it, I can run and deploy it to check what you have done on my pc.

Please do functional commits as descriptive as possible and mention the changes required in this work.


# ⚛️ Custom Scripts Inventory

**Hirenetic** is a next-generation, full-stack enterprise recruitment, talent matching, and candidate verification platform built with **Next.js 14 (App Router)**, **PostgreSQL (Supabase)**, and **Multi-LLM Artificial Intelligence Engines (Groq Llama 3.3 70B, Google Gemini 1.5 Flash, OpenAI GPT-4o-mini)**.

It seamlessly connects Candidates, HR Recruiters, and Platform Administrators in a unified, real-time ecosystem featuring multi-dimensional candidate matching, dynamic ATS scoring, real-time recruiter verification control, embeddable candidate widgets, and public developer APIs.

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

---

### 2. 💼 HR Recruiter Panel (`/hr-panel`)
- **Job Posting & Position Management**:
  - Create new job openings with explicit initial status (`🟢 Open` vs `🔴 Closed`).
  - Live real-time status toggle (`Close` / `Reopen`) with automatic Supabase database synchronization (`crwl_jobsData`).
- **Master Candidate 360° Hub Widget (`CandidateDetailModal.js`)**:
  - **4-Tab Compact Hub**: `360° Profile` | `AI Verification & GitHub` | `Recruiter AI Assistant` | `HR Notes & Tags`.
  - **Dynamic ATS Resume Score Engine**: Calculates live scores ($\text{Skills}(30) + \text{Exp}(30) + \text{Projects}(20) + \text{Cert}(10) + \text{Completeness}(10)$).
  - **Strict CV Work History Tenure**: Computes experience strictly from CV work history ($\sum (\text{End Year} - \text{Start Year})$), returning `0.0 Years` if no work history exists.
  - **Composite Overall Rating**: Live composite rating on a 5.0 scale based on Match, Resume, Trust, and Experience scores.
  - **Hiring Action Status Sync (Shortlist, Schedule Interview, Reject, Hire)**: Updates both `candidates_profiles` and `job_applications` tables in Supabase in real time with color-coded status badges.
  - **Document Overflow Fix**: Ellipsis truncation for long document filenames with hover tooltips.
  - **Embed Code Generator**: 1-click modal snippet generator to copy embed script for any external website.

---

### 3. 🌐 Embeddable Candidate Widget & Exposed API (`/exposed-api` & `/candidate-widget`)
- **Exposed Candidate API (`/exposed-api?public_widget=true`)**: Exposes complete candidate profile, metrics, verifications, work experience, projects, education, and application history JSON payload.
- **Universal Embed Script (`public/widget.js`)**: Embed candidate profiles on **ANY external website** with 2 lines of HTML:
  ```html
  <script src="https://your-domain.com/widget.js"></script>
  <button data-hirenetic-candidate="waqasmehsud77@gmail.com">
    Display Candidate Profile
  </button>
  ```
- **Embeddable Iframe View (`/candidate-widget/embed`)**: Glassmorphism overlay modal rendering the exact candidate detail widget inside any third-party host site.

---

### 4. 🛡️ Admin Management Panel (`/admin-panel`)
- **Recruiter Block / Unblock Control**: Instant status updates (`Blocked` vs `Verified`) persisted in Supabase `employers_profiles` table via `/admin-panel/api/update-hr-status`.
- **Live Jobs Aggregation**: Merges candidate-applied jobs and crawled jobs directly from Supabase DB.
- **System Report Export**: Export platform system data as a JSON report.
- **Admin Security Lock Screen**: Protected with a security passcode lock screen (`Default Passcode: admin123`).

---

### 5. 🔑 API Management Panel (`/apimanagement-panel`)
- **Real-Time LLM Quota Tracking**: Automatically tracks token calls and inference requests (`used_quota` / `daily_quota`) whenever Groq, OpenAI, or Gemini APIs run candidate recommendations or CV parsing.
- **Exposed API Documentation Banner**: Instant links to test exposed JSON endpoints and open standalone candidate widget views.

---

### 6. 📜 Script Inventory & Automation Workflow (`/scripts-inventory`)
- **Python Automation Engine**: Code editor with local Python execution sandbox and dynamic pip dependency resolver.
- **GitHub Actions Runner**: Remote workflow execution via GitHub API webhooks.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router), React 18, JavaScript (ES6+) |
| **Styling & UI** | Vanilla CSS Design System, Lucide React Icons, Responsive Flex/Grid |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS) |
| **APIs & Widgets** | Exposed REST API, Universal JavaScript Widget Embed Engine |
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

# Exposed API Key
EXPOSED_API_KEY=your_exposed_api_key
NEXT_PUBLIC_EXPOSED_API_KEY=your_exposed_api_key

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
- **Exposed Candidate API**: `http://localhost:3000/exposed-api?public_widget=true`
- **Standalone Candidate Widget**: `http://localhost:3000/candidate-widget`

---

## 🚀 Deployment

### Deploying to Vercel (1-Click)
1. Push code to your GitHub repository.
2. Import project on [Vercel.com](https://vercel.com).
3. Set Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `EXPOSED_API_KEY`).
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
├── .github/workflows/         # CI/CD and script runner GitHub Actions
├── schema/                    # Database SQL schemas & migrations
├── public/                    # Static assets & public widget.js script
├── src/
│   ├── app/
│   │   ├── admin-panel/       # Admin console, stats API, lock screen & recruiter status API
│   │   ├── apimanagement-panel/# Real-time API key quota tracker & manager
│   │   ├── candidate-panel/   # Candidate Portal, CV parser & AI recommendation API
│   │   ├── candidate-widget/  # Standalone & iframe embeddable candidate widget
│   │   ├── cross-matching/    # Multi-dimensional matching verification
│   │   ├── exposed-api/       # Public developer API & candidate widget JSON endpoint
│   │   ├── hr-panel/          # HR Panel, Master Candidate 360 Hub & Applicants view
│   │   ├── scripts-inventory/ # Script editor & Python runner
│   │   ├── globals.css        # Core global styles
│   │   ├── layout.js          # Root layout
│   │   └── page.js            # Home landing page
├── Dockerfile                 # Next.js production build container
├── docker-compose.yml         # Container orchestration configuration
├── package.json               # Dependencies & scripts
└── README.md                  # Comprehensive project documentation
```

---

## 📝 License & Version
- **Version**: `2.7.0`
- **License**: MIT
- **Built for**: Advanced Agentic Recruitment, Enterprise AI Talent Analytics, & Embeddable Candidate Verification.
