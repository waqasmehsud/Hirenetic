export const FIELDS = {
  CYBERSECURITY: 'Cyber Security',
  SOFTWARE_ENG: 'Software Engineering',
  DATA_SCIENCE: 'Data Science & AI',
  HEALTHCARE: 'Healthcare & Medicine',
  LAW: 'Law & Legal Services',
  BANKING: 'Banking & Finance',
  ENGINEERING: 'Engineering & Mechanical',
}

const KEYWORDS = {
  [FIELDS.CYBERSECURITY]: ['cybersecurity', 'penetration testing', 'wireshark', 'burp suite', 'nmap', 'sql injection', 'security analyst', 'vulnerability', 'incident response', 'fail2ban'],
  [FIELDS.SOFTWARE_ENG]: ['react', 'next.js', 'javascript', 'typescript', 'python', 'java', 'node.js', 'sql', 'git', 'frontend', 'backend'],
  [FIELDS.DATA_SCIENCE]: ['machine learning', 'data science', 'pytorch', 'tensorflow', 'pandas', 'numpy', 'nlp', 'artificial intelligence'],
  [FIELDS.HEALTHCARE]: ['dental', 'dentist', 'clinical', 'patient', 'nurse', 'nursing', 'hospital', 'clinic', 'medical', 'physician', 'surgery', 'oral hygiene', 'healthcare', 'mbbs', 'pharmacy'],
  [FIELDS.LAW]: ['legal', 'attorney', 'advocate', 'litigation', 'llb', 'law firm', 'paralegal', 'court', 'contract law', 'compliance officer'],
  [FIELDS.BANKING]: ['banking', 'finance', 'accounting', 'audit', 'financial analyst', 'investment', 'accounts', 'b.com', 'ledger', 'taxation'],
  [FIELDS.ENGINEERING]: ['mechanical engineer', 'civil engineer', 'structural', 'autocad', 'construction', 'manufacturing', 'electrical engineer', 'site engineer'],
}

// Word-boundary matching — plain .includes() lets short keywords like "ai"
// falsely match inside unrelated words (e.g. "training" contains "ai").
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function countMatches(lowerText, keywords) {
  let count = 0
  for (const kw of keywords) {
    const pattern = new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i')
    if (pattern.test(lowerText)) count++
  }
  return count
}

export function classifyText(text) {
  if (!text) return null
  const lowerText = text.toLowerCase()

  let bestMatch = null
  let maxCount = 0

  for (const [field, keywords] of Object.entries(KEYWORDS)) {
    const count = countMatches(lowerText, keywords)
    if (count > maxCount) {
      maxCount = count
      bestMatch = field
    }
  }

  return bestMatch
}

export function jobMatchesField(job, field) {
  if (!field) return true
  // Jooble-crawled jobs are tagged with an exact category — trust that first.
  if (job.category && job.category === field) return true
  if (!KEYWORDS[field]) return true
  const content = `${job.title || ''} ${job.description || ''}`.toLowerCase()
  return countMatches(content, KEYWORDS[field]) > 0
}