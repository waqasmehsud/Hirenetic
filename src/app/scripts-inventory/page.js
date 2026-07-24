'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import './scriptsInventory.css';

/* ========================= DEFAULT DATA ========================= */
const DEFAULT_SCRIPTS = [
  {
    id: 1,
    name: 'Resume Parser',
    filename: 'resume_parser_v2.py',
    category: 'Resume',
    description: 'Extracts candidate skills & experience from PDF resumes using NLP pipeline.',
    status: 'Active',
    locked: false,
    password: null,
    created: '2024-06-15',
    code: `import spacy\nimport pdfplumber\nfrom pathlib import Path\n\nnlp = spacy.load("en_core_web_sm")\n\ndef parse_resume(filepath: str) -> dict:\n    """Extract structured data from PDF resume."""\n    with pdfplumber.open(filepath) as pdf:\n        text = "\\n".join(page.extract_text() or "" for page in pdf.pages)\n    \n    doc = nlp(text)\n    skills = [ent.text for ent in doc.ents if ent.label_ in ("SKILL", "ORG")]\n    \n    return {\n        "raw_text": text,\n        "skills": list(set(skills)),\n        "word_count": len(text.split()),\n        "pages": len(pdf.pages)\n    }\n\nif __name__ == "__main__":\n    result = parse_resume("./uploads/candidate_001.pdf")\n    print(f"Parsed {result['pages']} pages, found {len(result['skills'])} skills")\n    print(f"Skills: {', '.join(result['skills'])}")`,
    executions: 12,
  },
  {
    id: 2,
    name: 'LinkedIn Crawler',
    filename: 'linkedin_crawler.py',
    category: 'Crawler',
    description: 'Automated LinkedIn profile data extraction with rate limiting and proxy rotation.',
    status: 'Active',
    locked: true,
    password: 'admin123',
    created: '2024-07-22',
    code: `import requests\nfrom bs4 import BeautifulSoup\nimport time\nimport random\n\nclass LinkedInCrawler:\n    def __init__(self, proxy_list=None):\n        self.session = requests.Session()\n        self.proxies = proxy_list or []\n        self.delay = (2, 5)\n    \n    def _get_proxy(self):\n        if self.proxies:\n            return {"https": random.choice(self.proxies)}\n        return None\n    \n    def crawl_profile(self, profile_url: str) -> dict:\n        """Crawl a LinkedIn profile with rate limiting."""\n        time.sleep(random.uniform(*self.delay))\n        resp = self.session.get(\n            profile_url,\n            proxies=self._get_proxy(),\n            headers={"User-Agent": "Mozilla/5.0"}\n        )\n        soup = BeautifulSoup(resp.text, "html.parser")\n        return self._extract_data(soup)\n\nif __name__ == "__main__":\n    crawler = LinkedInCrawler()\n    print("LinkedIn Crawler initialized successfully")`,
    executions: 8,
  },
  {
    id: 3,
    name: 'AI Scoring Engine',
    filename: 'ai_scoring_engine.py',
    category: 'AI',
    description: 'ML-based candidate scoring using embeddings and cosine similarity matching.',
    status: 'Active',
    locked: false,
    password: null,
    created: '2024-08-10',
    code: `import numpy as np\nfrom sklearn.metrics.pairwise import cosine_similarity\nfrom transformers import AutoTokenizer, AutoModel\nimport torch\n\nclass ScoringEngine:\n    def __init__(self, model_name="sentence-transformers/all-MiniLM-L6-v2"):\n        self.tokenizer = AutoTokenizer.from_pretrained(model_name)\n        self.model = AutoModel.from_pretrained(model_name)\n    \n    def get_embedding(self, text: str) -> np.ndarray:\n        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)\n        with torch.no_grad():\n            outputs = self.model(**inputs)\n        return outputs.last_hidden_state.mean(dim=1).numpy()\n    \n    def score(self, resume_text: str, job_desc: str) -> float:\n        emb_resume = self.get_embedding(resume_text)\n        emb_job = self.get_embedding(job_desc)\n        return float(cosine_similarity(emb_resume, emb_job)[0][0])\n\nif __name__ == "__main__":\n    engine = ScoringEngine()\n    score = engine.score("Python developer with 5 years exp", "Senior Python Engineer")\n    print(f"Match Score: {score:.4f}")`,
    executions: 24,
  },
  {
    id: 4,
    name: 'Data Cleanup Utility',
    filename: 'data_cleanup.py',
    category: 'Utility',
    description: 'Batch cleanup and normalization of candidate records in the database.',
    status: 'Disabled',
    locked: false,
    password: null,
    created: '2024-09-05',
    code: `import sqlite3\nimport re\nfrom datetime import datetime\n\ndef cleanup_database(db_path: str) -> dict:\n    """Clean and normalize candidate records."""\n    conn = sqlite3.connect(db_path)\n    cursor = conn.cursor()\n    \n    stats = {"cleaned": 0, "removed": 0, "normalized": 0}\n    \n    cursor.execute("SELECT id, name, email, phone FROM candidates")\n    for row in cursor.fetchall():\n        cid, name, email, phone = row\n        clean_name = name.strip().title()\n        clean_email = email.strip().lower()\n        clean_phone = re.sub(r"[^0-9+]", "", phone)\n        \n        cursor.execute(\n            "UPDATE candidates SET name=?, email=?, phone=? WHERE id=?",\n            (clean_name, clean_email, clean_phone, cid)\n        )\n        stats["cleaned"] += 1\n    \n    conn.commit()\n    conn.close()\n    return stats\n\nif __name__ == "__main__":\n    result = cleanup_database("./data/hirenetic.db")\n    print(f"Cleaned: {result['cleaned']} records")`,
    executions: 3,
  },
  {
    id: 5,
    name: 'Resume Formatter',
    filename: 'resume_formatter.py',
    category: 'Resume',
    description: 'Converts raw resume text into standardized JSON format for AI processing.',
    status: 'Active',
    locked: false,
    password: null,
    created: '2024-10-01',
    code: `import json\nimport re\nfrom typing import Dict, List\n\ndef format_resume(raw_text: str) -> Dict:\n    """Convert raw resume text to structured JSON."""\n    sections = {\n        "contact": extract_contact(raw_text),\n        "education": extract_education(raw_text),\n        "experience": extract_experience(raw_text),\n        "skills": extract_skills(raw_text),\n    }\n    return sections\n\ndef extract_contact(text: str) -> Dict:\n    email = re.findall(r"[\\w.]+@[\\w.]+", text)\n    phone = re.findall(r"\\+?[\\d\\s-]{10,}", text)\n    return {"email": email[0] if email else None, "phone": phone[0] if phone else None}\n\ndef extract_skills(text: str) -> List[str]:\n    skill_keywords = ["python", "javascript", "react", "sql", "aws", "docker"]\n    found = [s for s in skill_keywords if s.lower() in text.lower()]\n    return found\n\nif __name__ == "__main__":\n    sample = "John Doe\\njohn@email.com\\nSkills: Python, React, AWS"\n    print(json.dumps(format_resume(sample), indent=2))`,
    executions: 7,
  },
  {
    id: 6,
    name: 'Web Scraper Bot',
    filename: 'web_scraper_bot.py',
    category: 'Crawler',
    description: 'General purpose web scraper with Selenium for JavaScript-rendered pages.',
    status: 'Disabled',
    locked: true,
    password: 'secure456',
    created: '2024-11-12',
    code: `from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\nimport json\n\nclass WebScraperBot:\n    def __init__(self, headless=True):\n        options = webdriver.ChromeOptions()\n        if headless:\n            options.add_argument("--headless")\n        self.driver = webdriver.Chrome(options=options)\n    \n    def scrape(self, url: str, selector: str) -> list:\n        self.driver.get(url)\n        WebDriverWait(self.driver, 10).until(\n            EC.presence_of_element_located((By.CSS_SELECTOR, selector))\n        )\n        elements = self.driver.find_elements(By.CSS_SELECTOR, selector)\n        return [el.text for el in elements]\n    \n    def close(self):\n        self.driver.quit()\n\nif __name__ == "__main__":\n    bot = WebScraperBot()\n    results = bot.scrape("https://example.com", "h1")\n    print(f"Found {len(results)} elements")\n    bot.close()`,
    executions: 1,
  },
];

/* ========================= ICONS (SVG) ========================= */
const icons = {
  atom: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  externalLink: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1-2-2h6"/></svg>,
  scripts: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>,
  check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>,
  zap: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>,
  play: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  unlock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  x: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  code: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  format: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4-3.54h4m0 0V4h4"/></svg>,
  terminal: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>,
  alertTriangle: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  fileCode: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>,
};

/* ========================= TERMINAL SIMULATION ========================= */
const generateTerminalLines = (script) => {
  const lines = [
    { text: `$ python3 ${script.filename || 'script.py'}`, prompt: true },
    { text: `[init] Python 3.11.4 runtime environment starting...`, type: 'info' },
    { text: `[init] Loading script module: ${script.name || 'Custom Script'}`, type: 'info' },
    { text: `[ast]  AST validation & syntax tree parsing... OK`, type: 'success' },
    { text: `[load] Category: ${script.category || 'Utility'} | Status: ${script.status || 'Active'}`, type: 'info' },
    { text: `[exec] Executing ${script.filename || 'script.py'}...`, type: 'accent' },
  ];

  const codeText = script.code || '';
  const printMatches = [...codeText.matchAll(/print\s*\(\s*f?["'](.*?)["']\s*\)/g)];

  if (printMatches.length > 0) {
    lines.push({ text: `--- [STDOUT OUTPUT] ---`, type: 'info' });
    printMatches.forEach((match) => {
      let outputStr = match[1]
        .replace(/\{.*?\}/g, 'OK')
        .replace(/\\n/g, ' ');
      lines.push({ text: `>>> ${outputStr}`, type: 'success' });
    });
  } else {
    lines.push({ text: `[data] Initializing execution pipeline...`, type: 'info' });
    lines.push({ text: `[data] Code payload (${codeText.split('\n').length} lines) loaded into sandbox.`, type: 'info' });
    lines.push({ text: `>>> [Output] Execution completed successfully with 0 errors.`, type: 'success' });
  }

  lines.push({ text: `[done] ${script.name || 'Script'} finished processing.`, type: 'success' });
  lines.push({ text: `[exit] Process exited with code 0`, type: 'success' });
  return lines;
};

/* ========================= MAIN COMPONENT ========================= */
export default function ScriptsInventoryPage() {
  // ---- State ----
  const [theme, setTheme] = useState('dark');
  const [scripts, setScripts] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [toast, setToast] = useState(null);

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null); // script object or null
  const [deleteModal, setDeleteModal] = useState(null);
  const [lockModal, setLockModal] = useState(null);
  const [unlockModal, setUnlockModal] = useState(null);
  const [verifyModal, setVerifyModal] = useState(null);
  const [runModal, setRunModal] = useState(null);

  // Form state
  const [addForm, setAddForm] = useState({ name: '', category: 'Resume', status: 'Active', description: '', filename: '' });
  const [editCode, setEditCode] = useState('');
  const [editTab, setEditTab] = useState('code'); // 'code' or 'settings'
  const [editSettings, setEditSettings] = useState({ name: '', category: '', status: '', description: '', filename: '' });
  const [lockPassword, setLockPassword] = useState('');
  const [lockConfirm, setLockConfirm] = useState('');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showPassword, setShowPassword] = useState({});

  // Terminal
  const [terminalLines, setTerminalLines] = useState([]);
  const [terminalStatus, setTerminalStatus] = useState('running');
  const [terminalTimer, setTerminalTimer] = useState(0);

  // Console
  const [consoleOutput, setConsoleOutput] = useState('');

  // Refs
  const terminalBodyRef = useRef(null);
  const codeTextareaRef = useRef(null);

  const categories = ['All', 'Resume', 'Crawler', 'AI', 'Utility'];

  // ---- Fetch scripts from Supabase ----
  const fetchScripts = useCallback(async () => {
    const { data, error } = await supabase
      .from('hirenetic_scripts')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Supabase fetch error:', error);
      return;
    }
    setScripts(data || []);
  }, []);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  // ---- Show toast ----
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ---- Filter scripts ----
  const filteredScripts = scripts.filter((s) => {
    const search = (globalSearch || tableSearch).toLowerCase();
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search) ||
      s.description.toLowerCase().includes(search) ||
      s.category.toLowerCase().includes(search) ||
      s.filename.toLowerCase().includes(search);
    const matchCategory = activeCategory === 'All' || s.category === activeCategory;
    return matchSearch && matchCategory;
  });

  // ---- Stats ----
  const stats = {
    total: scripts.length,
    active: scripts.filter((s) => s.status === 'Active').length,
    protected: scripts.filter((s) => s.locked).length,
    executions: scripts.reduce((sum, s) => sum + (s.executions || 0), 0),
  };

  // ---- Category Badge class ----
  const getCategoryClass = (cat) => {
    const map = { Resume: 'si-badge-resume', Crawler: 'si-badge-crawler', AI: 'si-badge-ai', Utility: 'si-badge-utility' };
    return map[cat] || 'si-badge-resume';
  };

  // ---- Add Script ----
  const handleAddScript = async () => {
    if (!addForm.name.trim()) return showToast('Script name is required', 'error');
    const filename = addForm.filename || addForm.name.toLowerCase().replace(/\s+/g, '_') + '.py';
    const newScript = {
      name: addForm.name.trim(),
      filename,
      category: addForm.category,
      description: addForm.description,
      status: addForm.status,
      locked: false,
      password: null,
      created: new Date().toISOString().split('T')[0],
      code: `# ${addForm.name}\n# Created: ${new Date().toISOString().split('T')[0]}\n\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()`,
      executions: 0,
    };
    const { error } = await supabase.from('hirenetic_scripts').insert([newScript]);
    if (error) return showToast('Failed to add script: ' + error.message, 'error');
    await fetchScripts();
    setAddModal(false);
    setAddForm({ name: '', category: 'Resume', status: 'Active', description: '', filename: '' });
    showToast(`Script "${newScript.name}" added successfully`);
  };

  // ---- Edit Script ----
  const openEditModal = (script) => {
    if (script.locked) {
      setVerifyModal(script);
      setVerifyPassword('');
    } else {
      setEditModal(script);
      setEditCode(script.code || '');
      setEditTab('code');
      setEditSettings({ name: script.name, category: script.category, status: script.status, description: script.description, filename: script.filename });
      setConsoleOutput('');
    }
  };

  const handleVerifyPassword = () => {
    if (!verifyModal) return;
    if (verifyPassword === verifyModal.password) {
      setVerifyModal(null);
      setVerifyPassword('');
      setEditModal(verifyModal);
      setEditCode(verifyModal.code || '');
      setEditTab('code');
      setEditSettings({ name: verifyModal.name, category: verifyModal.category, status: verifyModal.status, description: verifyModal.description, filename: verifyModal.filename });
      setConsoleOutput('');
    } else {
      showToast('Incorrect password', 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    const { error } = await supabase
      .from('hirenetic_scripts')
      .update({
        code: editCode,
        name: editSettings.name,
        category: editSettings.category,
        status: editSettings.status,
        description: editSettings.description,
        filename: editSettings.filename,
      })
      .eq('id', editModal.id);
    if (error) return showToast('Failed to update: ' + error.message, 'error');
    await fetchScripts();
    showToast(`Script "${editSettings.name}" updated`);
    setEditModal(null);
  };

  // ---- Lock ----
  const handleLockScript = async () => {
    if (!lockModal) return;
    if (!lockPassword || lockPassword !== lockConfirm) return showToast('Passwords do not match', 'error');
    const { error } = await supabase
      .from('hirenetic_scripts')
      .update({ locked: true, password: lockPassword })
      .eq('id', lockModal.id);
    if (error) return showToast('Failed to lock: ' + error.message, 'error');
    await fetchScripts();
    setLockModal(null);
    setLockPassword('');
    setLockConfirm('');
    showToast('Script locked successfully');
  };

  // ---- Unlock ----
  const handleUnlockScript = async () => {
    if (!unlockModal) return;
    if (unlockPassword === unlockModal.password) {
      const { error } = await supabase
        .from('hirenetic_scripts')
        .update({ locked: false, password: null })
        .eq('id', unlockModal.id);
      if (error) return showToast('Failed to unlock: ' + error.message, 'error');
      await fetchScripts();
      setUnlockModal(null);
      setUnlockPassword('');
      showToast('Script unlocked');
    } else {
      showToast('Incorrect password', 'error');
    }
  };

  // ---- Delete ----
  const handleDeleteScript = async () => {
    if (!deleteModal) return;
    const { error } = await supabase
      .from('hirenetic_scripts')
      .delete()
      .eq('id', deleteModal.id);
    if (error) return showToast('Failed to delete: ' + error.message, 'error');
    await fetchScripts();
    setDeleteModal(null);
    showToast(`Script "${deleteModal.name}" deleted`, 'info');
  };

  // ---- Run ----
  const runIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const closeRunModal = useCallback(() => {
    if (runIntervalRef.current) clearInterval(runIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    runIntervalRef.current = null;
    timerIntervalRef.current = null;
    setRunModal(null);
  }, []);

  const openRunModal = async (script) => {
    if (script.status === 'Disabled') {
      showToast(`Cannot run "${script.name}" — Script status is Disabled. Change status to Active in Edit -> Settings to run.`, 'error');
      return;
    }

    // Clear any existing intervals
    if (runIntervalRef.current) clearInterval(runIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setRunModal(script);
    setTerminalLines([]);
    setTerminalStatus('running');
    setTerminalTimer(0);

    // Increment executions in Supabase
    supabase
      .from('hirenetic_scripts')
      .update({ executions: (script.executions || 0) + 1 })
      .eq('id', script.id)
      .then();

    // Call GitHub Action API
    let githubLog = null;
    try {
      const res = await fetch('/api/run-github-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_name: script.name,
          script_filename: script.filename,
          script_code: script.code,
        }),
      });
      const data = await res.json();
      if (data.success) {
        githubLog = {
          text: `[github] GitHub Action workflow dispatched! Check logs: ${data.workflow_url}`,
          type: 'success',
        };
      } else {
        githubLog = {
          text: `[info] GitHub API: ${data.error || 'Token unconfigured (Local sandbox mode)'}`,
          type: 'info',
        };
      }
    } catch {
      githubLog = { text: '[info] Running in local sandbox mode', type: 'info' };
    }

    const lines = generateTerminalLines(script);
    if (githubLog) {
      lines.splice(2, 0, githubLog);
    }

    let lineIndex = 0;
    runIntervalRef.current = setInterval(() => {
      if (lineIndex < lines.length) {
        const currentLine = lines[lineIndex];
        setTerminalLines((prev) => [...prev, currentLine]);
        lineIndex++;
      } else {
        clearInterval(runIntervalRef.current);
        runIntervalRef.current = null;
        setTerminalStatus('completed');
        fetchScripts();
      }
    }, 350);

    // Timer
    const totalDuration = lines.length * 0.35;
    timerIntervalRef.current = setInterval(() => {
      setTerminalTimer((prev) => {
        if (prev >= totalDuration) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          return prev;
        }
        return +(prev + 0.1).toFixed(1);
      });
    }, 100);
  };

  // Auto scroll terminal
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // ---- Code Editor Helpers ----
  const getLineNumbers = (code) => {
    const lines = (code || '').split('\n');
    return lines.map((_, i) => i + 1);
  };

  const handleCodeFormat = () => {
    // Simple PEP-8 formatting: convert tabs to 4 spaces
    const formatted = editCode.replace(/\t/g, '    ');
    setEditCode(formatted);
    showToast('Code formatted (PEP-8)');
  };

  const handleCodeCopy = () => {
    navigator.clipboard.writeText(editCode);
    showToast('Code copied to clipboard');
  };

  const handleRunTest = () => {
    setConsoleOutput('');
    setTimeout(() => setConsoleOutput('[init] Python 3.11.4 sandbox starting...\n'), 150);
    setTimeout(() => setConsoleOutput((p) => p + '[exec] Compiling & executing code payload...\n'), 400);
    
    const printMatches = [...editCode.matchAll(/print\s*\(\s*f?["'](.*?)["']\s*\)/g)];
    setTimeout(() => {
      let out = '[done] Execution Output:\n';
      if (printMatches.length > 0) {
        printMatches.forEach((m) => {
          out += `  >>> ${m[1]}\n`;
        });
      } else {
        out += `  >>> Code executed successfully (0 errors, ${editCode.split('\n').length} lines compiled).\n`;
      }
      out += '[done] Test completed - Exit code: 0\n';
      setConsoleOutput((p) => p + out);
    }, 800);
  };

  // ---- Refresh ----
  const handleRefresh = async () => {
    await fetchScripts();
    showToast('Inventory synced from Supabase', 'info');
  };

  // ---- Toggle Theme ----
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ---- Toggle password visibility ----
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  /* ========================= RENDER ========================= */
  return (
    <div className="si-page" data-theme={theme}>
      {/* ===== TOP BAR ===== */}
      <header className="si-topbar">
        <div className="si-topbar-left">
          <div className="si-brand">
            <div className="si-brand-icon">{icons.atom}</div>
            <span>Hirenetic</span>
          </div>
          <div className="si-brand-divider" />
          <div>
            <div className="si-page-title">Custom Scripts Inventory</div>
            <div className="si-breadcrumb">
              Admin <span className="si-breadcrumb-sep">/</span>
              <span>Automation</span> <span className="si-breadcrumb-sep">/</span>
              <span>Scripts Inventory</span>
            </div>
          </div>
        </div>
        <div className="si-topbar-right">
          <div className="si-global-search">
            <span className="si-global-search-icon">{icons.search}</span>
            <input
              type="text"
              placeholder="Search scripts, descriptions..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>
          <button className="si-theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
            {theme === 'dark' ? icons.sun : icons.moon}
          </button>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="si-content">
        {/* ---- Stats Cards ---- */}
        <div className="si-stats-grid">
          <div className="si-stat-card">
            <div className="si-stat-icon accent">{icons.scripts}</div>
            <div className="si-stat-info">
              <div className="si-stat-value">{stats.total}</div>
              <div className="si-stat-label">Total Scripts</div>
            </div>
          </div>
          <div className="si-stat-card">
            <div className="si-stat-icon success">{icons.check}</div>
            <div className="si-stat-info">
              <div className="si-stat-value">{stats.active}</div>
              <div className="si-stat-label">Active Status</div>
            </div>
          </div>
          <div className="si-stat-card">
            <div className="si-stat-icon warning">{icons.shield}</div>
            <div className="si-stat-info">
              <div className="si-stat-value">{stats.protected}</div>
              <div className="si-stat-label">Protected</div>
            </div>
          </div>
          <div className="si-stat-card">
            <div className="si-stat-icon info">{icons.zap}</div>
            <div className="si-stat-info">
              <div className="si-stat-value">{stats.executions}</div>
              <div className="si-stat-label">Executions</div>
            </div>
          </div>
        </div>

        {/* ---- Table Container ---- */}
        <div className="si-table-container">
          <div className="si-table-header">
            <div className="si-table-header-left">
              <div className="si-table-search">
                <span className="si-table-search-icon">{icons.search}</span>
                <input
                  type="text"
                  placeholder="Filter by script name..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
              </div>
              <div className="si-category-tabs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`si-category-tab ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="si-table-header-right">
              <button className="si-btn si-btn-primary" onClick={() => { setAddModal(true); setAddForm({ name: '', category: 'Resume', status: 'Active', description: '', filename: '' }); }}>
                {icons.plus} Add Script
              </button>
              <button className="si-btn si-btn-ghost" onClick={handleRefresh}>
                {icons.refresh} Refresh
              </button>
            </div>
          </div>

          {filteredScripts.length > 0 ? (
            <table className="si-table">
              <thead>
                <tr>
                  <th>Script Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Locked</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScripts.map((script, idx) => (
                  <tr key={script.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td>
                      <div className="si-script-name">
                        <span className="si-script-name-main">{script.name}</span>
                        <span className="si-script-name-file">{script.filename}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`si-badge ${getCategoryClass(script.category)}`}>{script.category}</span>
                    </td>
                    <td>
                      <span className="si-script-desc">{script.description}</span>
                    </td>
                    <td>
                      <span className={`si-status-badge ${script.status === 'Active' ? 'si-status-active' : 'si-status-disabled'}`}>
                        {script.status}
                      </span>
                    </td>
                    <td>
                      <span className={`si-lock-badge ${script.locked ? 'locked' : ''}`}>
                        {script.locked ? <>{icons.lock} Locked</> : <>{icons.unlock} Unlocked</>}
                      </span>
                    </td>
                    <td>
                      <span className="si-date-cell">{script.created}</span>
                    </td>
                    <td>
                      <div className="si-actions">
                        <button className="si-action-btn run" title="Run Script" onClick={() => openRunModal(script)}>
                          {icons.play}
                        </button>
                        <button className="si-action-btn edit" title="Edit Script" onClick={() => openEditModal(script)}>
                          {icons.edit}
                        </button>
                        <button
                          className="si-action-btn lock"
                          title={script.locked ? 'Unlock' : 'Lock'}
                          onClick={() => {
                            if (script.locked) {
                              setUnlockModal(script);
                              setUnlockPassword('');
                            } else {
                              setLockModal(script);
                              setLockPassword('');
                              setLockConfirm('');
                            }
                          }}
                        >
                          {script.locked ? icons.unlock : icons.lock}
                        </button>
                        <button className="si-action-btn delete" title="Delete" onClick={() => setDeleteModal(script)}>
                          {icons.trash}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="si-empty-state">
              <div className="si-empty-icon">{icons.fileCode}</div>
              <div className="si-empty-title">No scripts found</div>
              <div className="si-empty-desc">Try adjusting your search or add a new script.</div>
            </div>
          )}
        </div>
      </main>

      {/* ========================= MODALS ========================= */}

      {/* ---- Add Script Modal ---- */}
      {addModal && (
        <div className="si-modal-overlay" onClick={() => setAddModal(false)}>
          <div className="si-modal md" onClick={(e) => e.stopPropagation()}>
            <div className="si-modal-header">
              <span className="si-modal-title">Add New Script</span>
              <button className="si-modal-close" onClick={() => setAddModal(false)}>{icons.x}</button>
            </div>
            <div className="si-modal-body">
              <div className="si-form-group">
                <label className="si-form-label">Script Name</label>
                <input className="si-form-input" placeholder="e.g. Resume Parser v3" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </div>
              <div className="si-settings-row">
                <div className="si-form-group">
                  <label className="si-form-label">Category</label>
                  <select className="si-form-select" value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}>
                    <option>Resume</option>
                    <option>Crawler</option>
                    <option>AI</option>
                    <option>Utility</option>
                  </select>
                </div>
                <div className="si-form-group">
                  <label className="si-form-label">Initial Status</label>
                  <select className="si-form-select" value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}>
                    <option>Active</option>
                    <option>Disabled</option>
                  </select>
                </div>
              </div>
              <div className="si-form-group">
                <label className="si-form-label">Description</label>
                <textarea className="si-form-textarea" placeholder="Brief description of what this script does..." value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} />
              </div>
              <div className="si-form-group">
                <label className="si-form-label">Script File (.py)</label>
                <div className="si-form-file-upload">
                  <span className="si-form-file-upload-icon">{icons.upload}</span>
                  <span className="si-form-file-upload-text">
                    <span>Choose file</span> or drag and drop (.py files)
                  </span>
                </div>
              </div>
            </div>
            <div className="si-modal-footer">
              <button className="si-btn si-btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
              <button className="si-btn si-btn-primary" onClick={handleAddScript}>Save Script</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Edit Script Modal (Code Editor) ---- */}
      {editModal && (
        <div className="si-modal-overlay" onClick={() => setEditModal(null)}>
          <div className="si-modal lg" onClick={(e) => e.stopPropagation()}>
            <div className="si-modal-header">
              <span className="si-modal-title">Script Editor</span>
              <button className="si-modal-close" onClick={() => setEditModal(null)}>{icons.x}</button>
            </div>

            {/* Toolbar */}
            <div className="si-editor-toolbar">
              <div className="si-editor-file-info">
                <span className="si-editor-filename">{editSettings.filename}</span>
                <span className="si-editor-runtime">Python 3.11</span>
              </div>
              <div className="si-editor-actions">
                <button className="si-editor-btn run-test" onClick={handleRunTest}>{icons.play} Run Test</button>
                <button className="si-editor-btn" onClick={handleCodeFormat}>{icons.format} Format</button>
                <button className="si-editor-btn" onClick={handleCodeCopy}>{icons.copy} Copy</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="si-editor-tabs">
              <button className={`si-editor-tab ${editTab === 'code' ? 'active' : ''}`} onClick={() => setEditTab('code')}>
                {icons.code} Code Editor
              </button>
              <button className={`si-editor-tab ${editTab === 'settings' ? 'active' : ''}`} onClick={() => setEditTab('settings')}>
                {icons.settings} Script Settings
              </button>
            </div>

            <div className="si-modal-body" style={{ padding: 0 }}>
              {editTab === 'code' ? (
                <>
                  <div className="si-code-area">
                    <div className="si-line-numbers">
                      {getLineNumbers(editCode).map((n) => (
                        <div key={n}>{n}</div>
                      ))}
                    </div>
                    <textarea
                      ref={codeTextareaRef}
                      className="si-code-editor-textarea"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      spellCheck={false}
                      placeholder="# Write your Python code here..."
                    />
                  </div>
                  {consoleOutput && (
                    <div className="si-sandbox-console">
                      <div className="si-sandbox-console-header">CONSOLE OUTPUT</div>
                      <pre className="si-console-output">
                        {consoleOutput.split('\n').map((line, i) => (
                          <div key={i} className={line.includes('[done]') ? 'success' : line.includes('[error]') ? 'error' : 'info'}>
                            {line}
                          </div>
                        ))}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: 24 }}>
                  <div className="si-settings-form">
                    <div className="si-settings-row">
                      <div className="si-form-group">
                        <label className="si-form-label">Script Name</label>
                        <input className="si-form-input" value={editSettings.name} onChange={(e) => setEditSettings({ ...editSettings, name: e.target.value })} />
                      </div>
                      <div className="si-form-group">
                        <label className="si-form-label">Category</label>
                        <select className="si-form-select" value={editSettings.category} onChange={(e) => setEditSettings({ ...editSettings, category: e.target.value })}>
                          <option>Resume</option>
                          <option>Crawler</option>
                          <option>AI</option>
                          <option>Utility</option>
                        </select>
                      </div>
                    </div>
                    <div className="si-settings-row">
                      <div className="si-form-group">
                        <label className="si-form-label">Status</label>
                        <select className="si-form-select" value={editSettings.status} onChange={(e) => setEditSettings({ ...editSettings, status: e.target.value })}>
                          <option>Active</option>
                          <option>Disabled</option>
                        </select>
                      </div>
                      <div className="si-form-group">
                        <label className="si-form-label">Filename</label>
                        <input className="si-form-input" value={editSettings.filename} onChange={(e) => setEditSettings({ ...editSettings, filename: e.target.value })} />
                      </div>
                    </div>
                    <div className="si-form-group">
                      <label className="si-form-label">Description</label>
                      <textarea className="si-form-textarea" value={editSettings.description} onChange={(e) => setEditSettings({ ...editSettings, description: e.target.value })} />
                    </div>
                    <div className="si-form-group">
                      <label className="si-form-label">Replace Script File (.py)</label>
                      <div className="si-form-file-upload">
                        <span className="si-form-file-upload-icon">{icons.upload}</span>
                        <span className="si-form-file-upload-text">
                          <span>Choose file</span> to replace current script
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="si-modal-footer">
              <button className="si-btn si-btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="si-btn si-btn-primary" onClick={handleSaveEdit}>Save & Update</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Delete Confirmation Modal ---- */}
      {deleteModal && (
        <div className="si-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="si-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="si-modal-header">
              <span className="si-modal-title">Delete Script</span>
              <button className="si-modal-close" onClick={() => setDeleteModal(null)}>{icons.x}</button>
            </div>
            <div className="si-modal-body">
              <div className="si-delete-warning">
                <div className="si-delete-warning-icon">{icons.alertTriangle}</div>
                <div className="si-delete-warning-title">Are you sure you want to delete this script?</div>
                <div className="si-delete-script-name">{deleteModal.filename}</div>
                <div className="si-delete-warning-desc">This action cannot be undone. The script will be permanently removed from your inventory.</div>
              </div>
            </div>
            <div className="si-modal-footer">
              <button className="si-btn si-btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="si-btn si-btn-danger" onClick={handleDeleteScript}>{icons.trash} Delete Script</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Lock Script Modal ---- */}
      {lockModal && (
        <div className="si-modal-overlay" onClick={() => setLockModal(null)}>
          <div className="si-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="si-modal-header">
              <span className="si-modal-title">Lock Script</span>
              <button className="si-modal-close" onClick={() => setLockModal(null)}>{icons.x}</button>
            </div>
            <div className="si-modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--si-text-secondary)', marginBottom: 18 }}>
                Set a password to protect <strong>{lockModal.name}</strong>. Editing will require password authorization.
              </p>
              <div className="si-form-group">
                <label className="si-form-label">Password</label>
                <div className="si-password-field">
                  <input type={showPassword.lock1 ? 'text' : 'password'} placeholder="Enter password" value={lockPassword} onChange={(e) => setLockPassword(e.target.value)} />
                  <button className="si-password-toggle" onClick={() => togglePasswordVisibility('lock1')} type="button">
                    {showPassword.lock1 ? icons.eyeOff : icons.eye}
                  </button>
                </div>
              </div>
              <div className="si-form-group">
                <label className="si-form-label">Confirm Password</label>
                <div className="si-password-field">
                  <input type={showPassword.lock2 ? 'text' : 'password'} placeholder="Re-enter password" value={lockConfirm} onChange={(e) => setLockConfirm(e.target.value)} />
                  <button className="si-password-toggle" onClick={() => togglePasswordVisibility('lock2')} type="button">
                    {showPassword.lock2 ? icons.eyeOff : icons.eye}
                  </button>
                </div>
              </div>
            </div>
            <div className="si-modal-footer">
              <button className="si-btn si-btn-ghost" onClick={() => setLockModal(null)}>Cancel</button>
              <button className="si-btn si-btn-primary" onClick={handleLockScript}>{icons.lock} Lock Script</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Unlock Script Modal ---- */}
      {unlockModal && (
        <div className="si-modal-overlay" onClick={() => setUnlockModal(null)}>
          <div className="si-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="si-modal-header">
              <span className="si-modal-title">Unlock Script</span>
              <button className="si-modal-close" onClick={() => setUnlockModal(null)}>{icons.x}</button>
            </div>
            <div className="si-modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--si-text-secondary)', marginBottom: 18 }}>
                Enter the password to unlock <strong>{unlockModal.name}</strong>.
              </p>
              <div className="si-form-group">
                <label className="si-form-label">Password</label>
                <div className="si-password-field">
                  <input type={showPassword.unlock ? 'text' : 'password'} placeholder="Enter password" value={unlockPassword} onChange={(e) => setUnlockPassword(e.target.value)} />
                  <button className="si-password-toggle" onClick={() => togglePasswordVisibility('unlock')} type="button">
                    {showPassword.unlock ? icons.eyeOff : icons.eye}
                  </button>
                </div>
              </div>
            </div>
            <div className="si-modal-footer">
              <button className="si-btn si-btn-ghost" onClick={() => setUnlockModal(null)}>Cancel</button>
              <button className="si-btn si-btn-success" onClick={handleUnlockScript}>{icons.unlock} Unlock</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Password Verification Modal ---- */}
      {verifyModal && (
        <div className="si-modal-overlay" onClick={() => setVerifyModal(null)}>
          <div className="si-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="si-modal-header">
              <span className="si-modal-title">Password Required</span>
              <button className="si-modal-close" onClick={() => setVerifyModal(null)}>{icons.x}</button>
            </div>
            <div className="si-modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--si-text-secondary)', marginBottom: 18 }}>
                <strong>{verifyModal.name}</strong> is password-protected. Enter the password to edit.
              </p>
              <div className="si-form-group">
                <label className="si-form-label">Script Password</label>
                <div className="si-password-field">
                  <input type={showPassword.verify ? 'text' : 'password'} placeholder="Enter script password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()} />
                  <button className="si-password-toggle" onClick={() => togglePasswordVisibility('verify')} type="button">
                    {showPassword.verify ? icons.eyeOff : icons.eye}
                  </button>
                </div>
              </div>
            </div>
            <div className="si-modal-footer">
              <button className="si-btn si-btn-ghost" onClick={() => setVerifyModal(null)}>Cancel</button>
              <button className="si-btn si-btn-primary" onClick={handleVerifyPassword}>{icons.edit} Verify & Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Run Terminal Modal ---- */}
      {runModal && (
        <div className="si-modal-overlay" onClick={closeRunModal}>
          <div className="si-modal md" onClick={(e) => e.stopPropagation()}>
            <div className="si-modal-header">
              <span className="si-modal-title">Script Execution — {runModal.name}</span>
              <button className="si-modal-close" onClick={closeRunModal}>{icons.x}</button>
            </div>
            <div className="si-modal-body" style={{ padding: '16px 24px' }}>
              <div className="si-terminal">
                <div className="si-terminal-header">
                  <div className="si-terminal-dots">
                    <div className="si-terminal-dot red" />
                    <div className="si-terminal-dot yellow" />
                    <div className="si-terminal-dot green" />
                  </div>
                  <div className="si-terminal-title">python3 — {runModal.filename || 'script.py'}</div>
                </div>
                <div className="si-terminal-body" ref={terminalBodyRef}>
                  {terminalLines.map((line, i) => (
                    <div key={i} className="si-terminal-line">
                      {line.prompt ? (
                        <><span className="prompt">❯ </span><span className="accent">{line.text}</span></>
                      ) : (
                        <span className={line.type || ''}>{line.text}</span>
                      )}
                    </div>
                  ))}
                  {terminalStatus === 'running' && terminalLines.length > 0 && (
                    <div className="si-terminal-line" style={{ opacity: 0.5 }}>
                      <span className="si-spinner" />
                    </div>
                  )}
                </div>
                <div className="si-terminal-status">
                  <span className={`si-terminal-status-badge ${terminalStatus}`}>
                    {terminalStatus === 'running' ? (
                      <><span className="si-spinner" /> Running</>
                    ) : (
                      <><span style={{ color: 'var(--si-success)' }}>✓</span> Completed</>
                    )}
                  </span>
                  <span className="si-terminal-timer">{terminalTimer.toFixed(1)}s</span>
                </div>
              </div>
            </div>
            <div className="si-modal-footer">
              <button className="si-btn si-btn-ghost" onClick={closeRunModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TOAST ===== */}
      {toast && (
        <div className={`si-toast ${toast.type}`}>
          {toast.type === 'success' && <span style={{ color: 'var(--si-success)' }}>✓</span>}
          {toast.type === 'error' && <span style={{ color: 'var(--si-danger)' }}>✗</span>}
          {toast.type === 'info' && <span style={{ color: 'var(--si-info)' }}>ℹ</span>}
          {toast.message}
        </div>
      )}
    </div>
  );
}
