# ⚛️ Custom Scripts Inventory

Custom Scripts Inventory module built with Next.js 14, Supabase, and GitHub Actions.

---

## ⚡ Quick Start (Local)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment (`.env.local`)**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   GITHUB_TOKEN=your_github_token
   GITHUB_OWNER=moeenuddin
   GITHUB_REPO=SummerInternship_AirUni
   GITHUB_BRANCH=wm
   GITHUB_WORKFLOW=run_script.yml
   ```

3. **Run application**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000/scripts-inventory](http://localhost:3000/scripts-inventory)** in your browser.

---

## 🐳 Quick Start (Docker)

```bash
docker-compose up --build -d
```
Open **[http://localhost:3000/scripts-inventory](http://localhost:3000/scripts-inventory)**

---

## 📂 Project Structure

```text
hirenetic/
├── .github/workflows/         # CI/CD and script runner GitHub Actions
├── MDFILES/                   # Specifications & module documentation
├── SQL_SCHEMA/                # Database table schemas (.sql)
├── public/                    # Static public assets
├── src/
│   ├── app/
│   │   ├── api/               # API routes (GitHub action trigger, status, local python execution)
│   │   ├── scripts-inventory/ # Scripts Inventory dashboard page & styles
│   │   ├── globals.css        # Global CSS styles
│   │   ├── layout.js          # Root layout
│   │   └── page.js            # Home page redirect
│   └── lib/
│       └── supabaseClient.js  # Supabase client setup
├── Dockerfile                 # Next.js container configuration
├── docker-compose.yml         # Multi-container orchestration
├── package.json               # Node dependencies & scripts
└── README.md                  # Project documentation
```

---

## ✨ Features

- 📜 Manage & execute Python automation scripts
- 💻 Built-in code editor & local test sandbox
- 🔒 Password lock protection for critical scripts
- 🚀 Remote workflow trigger via GitHub Actions
- 🗄️ Real-time Supabase database sync
