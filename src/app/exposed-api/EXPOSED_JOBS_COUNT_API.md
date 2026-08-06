# Exposed Dynamic Jobs By Field API Documentation

## Overview
This API endpoint provides a real-time, dynamic estimation of job counts categorized by technical fields (Software Engineering, Cybersecurity, AI/ML, DevOps, Frontend, Backend, etc.), top required skills, and departments directly from the live database (`crwl_jobsData` table).

Every time the API is called, it analyzes the latest updated jobs in the database and returns real-time live counts.

- **Endpoint Route:** `/exposed-api`
- **HTTP Method:** `GET`
- **Authentication:** Required (API Key)
- **Folder Location:** `src/app/exposed-api`
- **Implementation File:** `src/app/exposed-api/route.js`

---

## 1. Environment Configuration

Set the valid API key in your `.env.local` file:

```env
EXPOSED_API_KEY=my_secure_api_key_2026
```

---

## 2. Authentication Methods

Pass the API key using any of the following:

1. **Custom Header (Recommended):**
   ```http
   x-api-key: my_secure_api_key_2026
   ```

2. **Bearer Token:**
   ```http
   Authorization: Bearer my_secure_api_key_2026
   ```

3. **URL Query Parameter:**
   ```http
   GET /exposed-api?api_key=my_secure_api_key_2026
   ```

---

## 3. How to Call / Test the API

### cURL Example

```bash
curl "http://localhost:3000/exposed-api?api_key=my_secure_api_key_2026"
```

### JavaScript / Fetch Example

```javascript
const response = await fetch('http://localhost:3000/exposed-api?api_key=my_secure_api_key_2026');
const data = await response.json();
console.log('Live Jobs by Field:', data.data.jobsByField);
console.log('Top Required Skills:', data.data.topRequiredSkills);
```

---

## 4. Live Response Schema (`200 OK`)

```json
{
  "success": true,
  "data": {
    "totalJobs": 25,
    "jobsByField": {
      "Software Engineering": 15,
      "AI, ML & Data Science": 11,
      "Backend Development": 12,
      "DevOps, Cloud & Infrastructure": 6,
      "Frontend Development": 5,
      "General Software Development": 2,
      "Full Stack Development": 1,
      "Cybersecurity & InfoSec": 0
    },
    "topRequiredSkills": {
      "AI": 11,
      "TypeScript": 10,
      "Python": 8,
      "React": 7,
      "Go": 5,
      "PostgreSQL": 5
    },
    "jobsByDepartment": {
      "Engineering and Information Technology": 21,
      "Information Technology and Engineering": 1,
      "Information Technology": 2,
      "Production": 1
    }
  },
  "meta": {
    "timestamp": "2026-07-31T03:01:00.000Z",
    "isRealtimeLive": true
  }
}
```

---

## 5. Dynamic Processing & Live Estimation

1. **Real-time Evaluation (`export const dynamic = 'force-dynamic'`):** The API executes fresh on every single incoming HTTP request. As soon as new crawled jobs enter the database, calling this API immediately reflects the updated counts.
2. **Multi-dimensional Categorization:** Automatically scans `title`, `department`, `skills`, and `ai_tags` columns to categorize fields dynamically without rigid hardcoding.
3. **Top Skills Aggregation:** Ranks the top required technical skills across all current jobs in real time.
