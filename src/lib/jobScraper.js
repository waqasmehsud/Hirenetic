/**
 * Job Webpage Scraper & Extractor Utility
 * Fetches and parses job details from external URLs with caching and rate limit handling.
 */

// In-memory cache to prevent scraping the same URL multiple times across requests
const scrapedUrlCache = new Map();

/**
 * Clean and normalize text extracted from HTML
 */
function cleanText(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract lists or bullet points following specific heading keywords
 */
function extractSections(text) {
  const sections = {
    responsibilities: [],
    requirements: [],
    skills: [],
  };

  const techKeywords = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express',
    'Django', 'FastAPI', 'Flask', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'CI/CD',
    'Git', 'GitHub', 'REST API', 'GraphQL', 'Microservices', 'Linux', 'Security',
    'Wireshark', 'SIEM', 'SOC', 'Pentesting', 'SQL', 'C++', 'Java', 'Go', 'Rust'
  ];

  // Extract tech keywords present in text
  const textLower = text.toLowerCase();
  techKeywords.forEach((kw) => {
    if (textLower.includes(kw.toLowerCase())) {
      sections.skills.push(kw);
    }
  });

  // Extract lines matching bullet points or requirements
  const lines = text.split(/(?:\r\n|\n|\. )+/);
  let currentCategory = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 5) continue;

    const lower = trimmed.toLowerCase();
    if (lower.includes('responsibil') || lower.includes('what you will do') || lower.includes('role overview')) {
      currentCategory = 'responsibilities';
      continue;
    } else if (lower.includes('require') || lower.includes('qualific') || lower.includes('what we look for') || lower.includes('must have')) {
      currentCategory = 'requirements';
      continue;
    }

    if (currentCategory && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*') || /^\d+\./.test(trimmed) || trimmed.length > 25)) {
      const cleanLine = trimmed.replace(/^[-•*\d.]+\s*/, '').trim();
      if (cleanLine.length > 10 && cleanLine.length < 300) {
        if (currentCategory === 'responsibilities' && sections.responsibilities.length < 10) {
          sections.responsibilities.push(cleanLine);
        } else if (currentCategory === 'requirements' && sections.requirements.length < 10) {
          sections.requirements.push(cleanLine);
        }
      }
    }
  }

  return sections;
}

/**
 * Main scraper function for a job URL with caching and timeout handling
 */
export async function scrapeJobWebpage(url, supabaseAdmin = null) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return null;
  }

  const normalizedUrl = url.trim();

  // 1. Check in-memory cache
  if (scrapedUrlCache.has(normalizedUrl)) {
    console.log(`[JobScraper Cache Hit]: ${normalizedUrl}`);
    return scrapedUrlCache.get(normalizedUrl);
  }

  // 2. Check Supabase DB cache if available
  if (supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin
        .from('crwl_jobsData')
        .select('scraped_content')
        .eq('job_url', normalizedUrl)
        .single();

      if (data && data.scraped_content && typeof data.scraped_content === 'object') {
        scrapedUrlCache.set(normalizedUrl, data.scraped_content);
        return data.scraped_content;
      }
    } catch (e) {}
  }

  // 3. Perform web fetch
  try {
    console.log(`[JobScraper Fetching]: ${normalizedUrl}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const res = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      console.warn(`[JobScraper HTTP ${res.status}]: ${normalizedUrl}`);
      return null;
    }

    const html = await res.text();
    const fullText = cleanText(html);

    if (!fullText || fullText.length < 50) {
      return null;
    }

    const extracted = extractSections(fullText);

    const scrapedResult = {
      job_url: normalizedUrl,
      website_description: fullText.substring(0, 1500),
      website_requirements: extracted.requirements,
      website_responsibilities: extracted.responsibilities,
      website_skills: Array.from(new Set(extracted.skills)),
      scraped_at: new Date().toISOString(),
    };

    // Store in memory cache
    scrapedUrlCache.set(normalizedUrl, scrapedResult);

    // Save to DB cache if available
    if (supabaseAdmin) {
      supabaseAdmin
        .from('crwl_jobsData')
        .update({ scraped_content: scrapedResult })
        .eq('job_url', normalizedUrl)
        .then()
        .catch(() => {});
    }

    return scrapedResult;
  } catch (err) {
    console.warn(`[JobScraper Error]: Failed to scrape ${normalizedUrl} - ${err.message}`);
    return null;
  }
}
