import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dns from 'dns';
import { requireEmployer } from '@/lib/authGuard';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Helper: fetch with timeout
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Map score to neutral status
function getStatusLabel(score) {
  if (score >= 85) return 'Strong Evidence';
  if (score >= 70) return 'Good Evidence';
  if (score >= 55) return 'Partial Evidence';
  if (score >= 40) return 'Limited Public Evidence';
  if (score > 0) return 'Needs Manual Review';
  return 'Unable to Verify';
}

// 1. GitHub Verification
async function verifyGitHub(githubUrl, claimedSkills = []) {
  const defaultResult = {
    available: false,
    score: 0,
    status: 'Not Provided',
    url: githubUrl || null,
    details: {}
  };

  if (!githubUrl || typeof githubUrl !== 'string') return defaultResult;

  const match = githubUrl.match(/github\.com\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    return { ...defaultResult, status: 'Invalid URL Format' };
  }

  const username = match[1];
  try {
    const headers = { 'User-Agent': 'Hirenetic-App' };
    const userRes = await fetchWithTimeout(`https://api.github.com/users/${username}`, { headers });
    
    if (!userRes.ok) {
      return { ...defaultResult, available: true, status: 'Unable to Verify', details: { error: 'GitHub API fetch failed or user not found' } };
    }
    const userData = await userRes.json();

    const reposRes = await fetchWithTimeout(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
    let reposData = [];
    if (reposRes.ok) {
      reposData = await reposRes.json();
    }

    let publicRepos = userData.public_repos || 0;
    let totalStars = reposData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
    
    const languagesMap = {};
    let lastPushDate = null;
    const repoTopics = new Set();

    reposData.forEach(repo => {
      if (repo.language) {
        languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
      }
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.forEach(t => repoTopics.add(t.toLowerCase()));
      }
      if (repo.pushed_at) {
        const pushDate = new Date(repo.pushed_at);
        if (!lastPushDate || pushDate > lastPushDate) lastPushDate = pushDate;
      }
    });

    const topLanguages = Object.entries(languagesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    // Cross-reference skills
    const normalizedClaimed = claimedSkills.map(s => s.toLowerCase().trim());
    const githubKeywords = new Set([
      ...topLanguages.map(l => l.toLowerCase()),
      ...Array.from(repoTopics)
    ]);

    const verifiedSkills = [];
    const unverifiedSkills = [];

    normalizedClaimed.forEach((skill, index) => {
      const originalSkill = claimedSkills[index];
      let found = false;
      for (const kw of githubKeywords) {
        if (kw.includes(skill) || skill.includes(kw)) {
          found = true;
          break;
        }
      }
      if (found) verifiedSkills.push(originalSkill);
      else unverifiedSkills.push(originalSkill);
    });

    // Score calculation
    let score = 60; // base for profile existing
    
    // Skill overlap (up to 20)
    if (claimedSkills.length > 0) {
      const overlapPercent = verifiedSkills.length / claimedSkills.length;
      score += Math.floor(overlapPercent * 20);
    } else {
      score += 10;
    }

    // Recent activity (up to 10)
    let recentActivity = false;
    if (lastPushDate) {
      const monthsAgo = (new Date() - lastPushDate) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAgo <= 6) {
        score += 10;
        recentActivity = true;
      } else if (monthsAgo <= 12) {
        score += 5;
      }
    }

    // Repo count (up to 10)
    if (publicRepos > 5) score += 10;
    else if (publicRepos > 0) score += 5;

    score = Math.min(100, score);

    return {
      available: true,
      score,
      status: getStatusLabel(score),
      url: `https://github.com/${username}`,
      details: {
        publicRepos,
        totalStars,
        topLanguages,
        recentActivity,
        lastPush: lastPushDate ? lastPushDate.toISOString().split('T')[0] : null,
        verifiedSkills,
        unverifiedSkills,
        profileBio: userData.bio || null,
        accountAge: userData.created_at ? Math.floor((new Date() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24 * 365)) + ' years' : null
      }
    };
  } catch (error) {
    return { ...defaultResult, available: true, status: 'Unable to Verify', details: { error: error.message } };
  }
}

// 2. Email Verification
async function verifyEmail(email) {
  const defaultResult = { available: false, score: 0, status: 'Not Provided', details: {} };
  if (!email || typeof email !== 'string') return defaultResult;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormatValid = emailRegex.test(email);
  
  if (!isFormatValid) {
    return { available: true, score: 0, status: 'Needs Manual Review', details: { formatValid: false } };
  }

  const domain = email.split('@')[1].toLowerCase();
  
  const disposableDomains = new Set([
    'tempmail.com', 'guerrillamail.com', 'mailinator.com', 'throwaway.com', 'yopmail.com',
    'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'pokemail.net', 'dispostable.com',
    'trashmail.com', 'maildrop.cc', 'fakeinbox.com', '10minutemail.com', 'mohmal.com',
    'harakirimail.com', 'mailnesia.com', 'tempail.com', 'burnermail.io', 'temp-mail.org',
    'emailondeck.com', 'getnada.com', 'inboxbear.com', 'mailsac.com', 'guerrillamail.info',
    'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net', 'mintemail.com', 'discard.email'
  ]);
  
  const freeProviders = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'live.com']);

  const isDisposable = disposableDomains.has(domain);
  const isCorporate = !isDisposable && !freeProviders.has(domain);
  
  let mxRecords = false;
  let score = 100;
  
  try {
    const records = await dns.promises.resolveMx(domain);
    mxRecords = records && records.length > 0;
  } catch (error) {
    mxRecords = false;
    score -= 40; // Penalty for no MX record
  }

  if (isDisposable) score -= 90;
  else if (!isCorporate) score -= 5;
  
  if (!mxRecords && !isDisposable) score = Math.max(0, score);
  
  score = Math.max(0, Math.min(100, score));

  return {
    available: true,
    score,
    status: getStatusLabel(score),
    details: {
      formatValid: true,
      mxRecords,
      isDisposable,
      isCorporate,
      domain
    }
  };
}

// 3. LinkedIn Verification
async function verifyLinkedIn(linkedinUrl) {
  const defaultResult = { available: false, score: 0, status: 'Not Provided', url: null, details: {} };
  if (!linkedinUrl || typeof linkedinUrl !== 'string') return defaultResult;

  const match = linkedinUrl.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  if (!match) {
    return { ...defaultResult, available: true, status: 'Needs Manual Review', url: linkedinUrl, details: { urlValid: false } };
  }

  let score = 70; // URL format valid
  let urlAccessible = false;

  try {
    const res = await fetchWithTimeout(linkedinUrl, { method: 'HEAD' });
    // Even if it blocks with 999 or 403, the URL resolves. A DNS failure throws.
    if (res.status) {
      urlAccessible = true;
      score = 90;
    }
  } catch (error) {
    urlAccessible = false;
  }

  return {
    available: true,
    score,
    status: getStatusLabel(score),
    url: linkedinUrl,
    details: {
      urlValid: true,
      urlAccessible,
      profileFormat: 'Standard'
    }
  };
}

// 4. Portfolio Verification
async function verifyPortfolio(portfolioUrl) {
  const defaultResult = { available: false, score: 0, status: 'Not Provided', url: null, details: {} };
  if (!portfolioUrl || typeof portfolioUrl !== 'string') return defaultResult;

  let score = 50;
  let siteAccessible = false;
  let statusCode = null;

  try {
    const res = await fetchWithTimeout(portfolioUrl, { method: 'HEAD' });
    statusCode = res.status;
    if (statusCode >= 200 && statusCode < 400) {
      siteAccessible = true;
      score = 85;
    } else {
      score = 60;
    }
  } catch (error) {
    siteAccessible = false;
  }

  return {
    available: true,
    score,
    status: getStatusLabel(score),
    url: portfolioUrl,
    details: {
      siteAccessible,
      statusCode
    }
  };
}

// 5. Certificate Verification
async function verifyCertificates(resumeText = '', jsonText = '') {
  const defaultResult = { available: false, score: 0, status: 'Not Provided', details: { totalFound: 0, verified: 0, unverified: 0, links: [] } };
  
  const textToScan = `${resumeText} ${jsonText}`;
  const urlRegex = /https?:\/\/[^\s"',]+/g;
  const urls = textToScan.match(urlRegex) || [];
  
  const certKeywords = ['credential', 'certificate', 'verify', 'credly', 'coursera.org/verify', 'udemy.com/certificate'];
  const certUrls = urls.filter(url => certKeywords.some(kw => url.toLowerCase().includes(kw)));
  
  const uniqueCertUrls = [...new Set(certUrls)];
  
  if (uniqueCertUrls.length === 0) return defaultResult;

  let verified = 0;
  const validatedLinks = [];

  for (const url of uniqueCertUrls) {
    try {
      const res = await fetchWithTimeout(url, { method: 'HEAD' });
      const isValid = res.status >= 200 && res.status < 400;
      if (isValid) verified++;
      validatedLinks.push({ url, isValid });
    } catch (error) {
      validatedLinks.push({ url, isValid: false });
    }
  }

  const unverified = uniqueCertUrls.length - verified;
  const percentage = uniqueCertUrls.length > 0 ? (verified / uniqueCertUrls.length) : 0;
  const score = Math.floor(percentage * 100);

  return {
    available: true,
    score,
    status: getStatusLabel(score),
    details: {
      totalFound: uniqueCertUrls.length,
      verified,
      unverified,
      links: validatedLinks
    }
  };
}

// 6. AI Summary Generation
async function generateAISummary(results, candidateData) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return "Verification completed via automated checks. AI summary unavailable due to missing API key.";

  const prompt = `
    Analyze the following candidate verification results and provide a summary.
    Candidate: ${candidateData.full_name || 'Candidate'}
    Verification Results: ${JSON.stringify(results)}
    
    Format requirements:
    1. A 3-4 sentence neutral summary of the verification results.
    2. A brief list of review items (claims with limited public evidence).
    3. An overall assessment.
    
    CRITICAL: Never use words like 'fake', 'fraud', 'liar', or 'false resume'. Use neutral terms such as 'Strong Evidence', 'Good Evidence', 'Partial Evidence', 'Limited Public Evidence', 'Unable to Verify', or 'Needs Manual Review'.
  `;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.choices[0]?.message?.content || "AI summary generation failed to return content.";
    }
  } catch (error) {
    console.error("Groq AI Error:", error);
  }
  
  // Fallback summary
  return `Verification completed for ${candidateData.full_name || 'candidate'}. GitHub demonstrated ${results.github.status}, while Email verification showed ${results.email.status}. Please review sources with 'Needs Manual Review' or 'Limited Public Evidence' for further clarity.`;
}

export async function POST(req) {
  try {
    const { user, employer, error: authError } = await requireEmployer(req)
    if (authError) return NextResponse.json({ success: false, error: authError }, { status: 403 })
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: 'Supabase URL or Key not configured' }, { status: 500 });
    }
    const body = await req.json();
    const { candidateId, candidateData = {} } = body;

    const {
      github_url,
      linkedin_url,
      email,
      portfolio_url,
      skills = [],
      resume_text = '',
      llm_parsed_json = {}
    } = candidateData;

    // Run verifications concurrently
    const [
      githubResult,
      emailResult,
      linkedinResult,
      portfolioResult,
      certResult
    ] = await Promise.all([
      verifyGitHub(github_url, skills),
      verifyEmail(email),
      verifyLinkedIn(linkedin_url),
      verifyPortfolio(portfolio_url),
      verifyCertificates(resume_text, typeof llm_parsed_json === 'string' ? llm_parsed_json : JSON.stringify(llm_parsed_json))
    ]);

    const sources = {
      github: githubResult,
      linkedin: linkedinResult,
      portfolio: portfolioResult,
      email: emailResult,
      certificates: certResult
    };

    // Calculate Overall Score and Status
    const baseWeights = { github: 30, linkedin: 20, portfolio: 15, email: 20, certificates: 15 };
    let totalScore = 0;
    
    const availableSources = Object.keys(sources).filter(key => sources[key].available);
    const unavailableSources = Object.keys(sources).filter(key => !sources[key].available);
    
    let distributedWeightAdd = 0;
    if (unavailableSources.length > 0 && availableSources.length > 0) {
      const missingWeight = unavailableSources.reduce((sum, key) => sum + baseWeights[key], 0);
      distributedWeightAdd = missingWeight / availableSources.length;
    }

    if (availableSources.length === 0) {
      totalScore = 0;
    } else {
      availableSources.forEach(key => {
        const adjustedWeight = baseWeights[key] + distributedWeightAdd;
        totalScore += (sources[key].score * adjustedWeight) / 100;
      });
    }

    const overallConfidence = Math.round(totalScore);
    
    let overallStatus = 'Needs Manual Review';
    if (overallConfidence >= 85) overallStatus = 'Strongly Verified';
    else if (overallConfidence >= 70) overallStatus = 'Verified';
    else if (overallConfidence >= 55) overallStatus = 'Partially Verified';
    else if (overallConfidence >= 40) overallStatus = 'Limited Verification';

    // Aggregate skills and reviews
    const skillsVerification = {
      verified: sources.github.details.verifiedSkills || [],
      partialEvidence: [],
      unverified: sources.github.details.unverifiedSkills || []
    };

    const reviewItems = [];
    if (sources.github.details.unverifiedSkills?.length > 0) {
      reviewItems.push({
        item: "Claimed Skills",
        status: "Limited Public Evidence",
        source: "GitHub",
        detail: `No repositories found matching skills: ${sources.github.details.unverifiedSkills.slice(0, 3).join(', ')}...`
      });
    }
    if (sources.email.available && sources.email.score < 80) {
      reviewItems.push({
        item: "Email Address",
        status: sources.email.status,
        source: "Email",
        detail: "Email domain check raised flags (disposable, missing MX, or invalid format)."
      });
    }

    // AI Summary Generation
    const aiSummary = await generateAISummary(sources, candidateData);

    const resultPayload = {
      success: true,
      overallConfidence,
      overallStatus,
      sources,
      skillsVerification,
      reviewItems,
      aiSummary,
      verifiedAt: new Date().toISOString()
    };

    // Optional: Save to Supabase if client is initialized and candidateId exists
    if (supabase && candidateId) {
      try {
        await supabase
          .from('candidates')
          .update({ verification_result: resultPayload })
          .eq('id', candidateId);
      } catch (dbErr) {
        console.error('Failed to save to Supabase:', dbErr);
      }
    }

    return NextResponse.json(resultPayload);
    
  } catch (error) {
    console.error('Verification Route Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
