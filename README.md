# ⚛️ Hirenetic — Custom Scripts Inventory

Custom Scripts Inventory module built with Next.js 14, Supabase Local, and GitHub Actions.

---

## ⚡ Quick Start (Local)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment (`.env.local`)**:
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

3. **Run App**:
   ```bash
   npm run dev
   ```
   Open: **[http://localhost:3001/scripts-inventory](http://localhost:3001/scripts-inventory)**

---

## 🐳 Quick Start (Docker)

```bash
docker-compose up --build -d
```
Open: **[http://localhost:3000/scripts-inventory](http://localhost:3000/scripts-inventory)**
