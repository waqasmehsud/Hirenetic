import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fdducqoklmqvomsszyqy.supabase.co';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const { userId, candidateProfile: inputProfile } = body;

    // 1. Fetch Candidate Profile from DB if userId provided, otherwise use inputProfile
    let candidateProfile = inputProfile || null;
    if (userId && !candidateProfile) {
      try {
        const { data: dbProfile, error: profileErr } = await supabaseAdmin
          .from('candidates_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!profileErr && dbProfile) {
          candidateProfile = dbProfile;
        }
      } catch (e) {}
    }

    if (!candidateProfile) {
      candidateProfile = {
        full_name: 'Candidate User',
        title: 'Cybersecurity & Software Specialist',
        skills: ['Python', 'Wireshark', 'SIEM', 'React', 'Git', 'Linux'],
        experience: '2+ Years',
        education: 'B.S. Computer Science',
        projects: [{ title: 'SOC Automation', techStack: 'Python, Wireshark' }],
        certifications: ['CompTIA Security+', 'HTB Certified'],
        resume_field: 'Cyber Security',
        location: 'Islamabad, Pakistan / Remote'
      };
    }

    // 2. Fetch Active Jobs from public.crwl_jobsData
    let activeJobs = [];
    try {
      const { data, error: jobsErr } = await supabaseAdmin
        .from('crwl_jobsData')
        .select('*')
        .order('id', { ascending: false })
        .range(0, 4999);

      if (!jobsErr && Array.isArray(data)) {
        activeJobs = data;
      }
    } catch (e) {}

    if (activeJobs.length === 0) {
      return Response.json({ error: 'No active job postings found' }, { status: 404 });
    }

    // 3. Prepare Multi-Dimensional Context for AI Model
    let candidateKeys = [];
    try {
      const { data: dbKeys } = await supabaseAdmin
        .from('api_credentials')
        .select('*')
        .eq('status', 'Active');
      if (Array.isArray(dbKeys)) {
        candidateKeys = dbKeys.filter(k => k && k.api_key && String(k.api_key).trim().length > 5);
      }
    } catch (e) {}

    const envGroq = process.env.GROQ_API_KEY;
    const envOpenAI = process.env.OPENAI_API_KEY;
    const envGemini = process.env.GEMINI_API_KEY;

    if (envGroq) candidateKeys.push({ name: 'Groq Env Key', provider: 'Groq', api_key: envGroq, model: 'llama-3.3-70b-versatile', base_url: 'https://api.groq.com/openai/v1' });
    if (envOpenAI) candidateKeys.push({ name: 'OpenAI Env Key', provider: 'OpenAI', api_key: envOpenAI, model: 'gpt-4o-mini', base_url: 'https://api.openai.com/v1' });
    if (envGemini) candidateKeys.push({ name: 'Gemini Env Key', provider: 'Google', api_key: envGemini, model: 'gemini-1.5-flash', base_url: 'https://generativelanguage.googleapis.com/v1beta' });

    // Format Candidate Profile Context
    const candidateSkills = Array.isArray(candidateProfile.skills) ? candidateProfile.skills.join(', ') : (candidateProfile.skills || 'Python, SQL, Linux');
    const resumeExcerpt = (candidateProfile.resume_text || '').substring(0, 1000).replace(/\n+/g, ' ');

    const candidateSummary = `
Candidate Name: ${candidateProfile.full_name || candidateProfile.name || 'Candidate'}
Target Role / Specialization: ${candidateProfile.title || candidateProfile.resume_field || 'Software / Cybersecurity Professional'}
Primary Domain: ${candidateProfile.resume_field || 'Software Engineering'}
Technical Skills: ${candidateSkills}
Experience Level: ${typeof candidateProfile.experience === 'string' ? candidateProfile.experience : JSON.stringify(candidateProfile.experience || '2+ Years')}
Education Background: ${typeof candidateProfile.education === 'string' ? candidateProfile.education : JSON.stringify(candidateProfile.education || 'Degree in Computer Science')}
Portfolio / GitHub Links: GitHub (${candidateProfile.github_url || 'N/A'}), LinkedIn (${candidateProfile.linkedin_url || 'N/A'})
Projects: ${JSON.stringify(candidateProfile.projects || [])}
Certifications: ${JSON.stringify(candidateProfile.certifications || [])}
Location: ${candidateProfile.location || 'Remote'}
Resume Excerpt: ${resumeExcerpt || 'No raw resume text provided.'}
`;

    // Filter job subset (up to 15 jobs for fast LLM response)
    const jobSubset = activeJobs.slice(0, 15).map(j => ({
      id: j.id,
      title: j.title || 'Role',
      company: j.company_name || j.company || 'Enterprise',
      department: j.department || 'Engineering',
      skills: Array.isArray(j.skills) ? j.skills : (typeof j.skills === 'string' ? j.skills.split(',') : []),
      experience_level: j.experience_level || 'Mid Level',
      location: j.location || 'Remote',
      requirements: (j.requirements || j.description || '').substring(0, 350)
    }));

    const llmPrompt = `You are an enterprise AI Candidate-Job Matching Engine built on high-precision multi-dimensional scoring.
Analyze the Candidate Profile and evaluate how strongly it matches each Active Job Posting across 4 core dimensions:
1. Technical Skills Overlap (40% Weight)
2. Domain & Field Alignment (20% Weight)
3. Experience & Seniority Compatibility (20% Weight)
4. Projects & Practical Portfolio Fit (20% Weight)

CANDIDATE PROFILE:
${candidateSummary}

ACTIVE JOB POSTINGS TO EVALUATE:
${JSON.stringify(jobSubset, null, 2)}

INSTRUCTIONS:
Evaluate every job in the list. Compute an aggregate matchScore (0 to 100%).
Return ONLY a valid JSON array of objects sorted strictly from HIGHEST matchScore to LOWEST matchScore:

[
  {
    "jobId": 166,
    "matchScore": 92,
    "scoreBreakdown": {
      "skills": 95,
      "domain": 90,
      "experience": 90,
      "projects": 85
    },
    "reason": "Direct alignment in Cybersecurity, SIEM threat hunting, Wireshark packet analysis, and Python scripting.",
    "matchedSkills": ["Python", "Wireshark", "SIEM", "Linux"],
    "missingSkills": ["Metasploit", "KQL"],
    "suggestedAction": "Highlight your SOC Automation project on your resume to boost recruiter response by 35%.",
    "recommendationLevel": "Strong Match"
  }
]`;

    let llmRecommendations = null;

    // Helper function to update API Key used_quota in Supabase api_credentials table
    const incrementApiKeyQuota = async (keyObj) => {
      if (!supabaseAdmin || !keyObj) return;
      try {
        let targetId = keyObj.id;
        if (!targetId) {
          // If key was loaded from process.env, search DB for corresponding provider key
          const { data: dbMatch } = await supabaseAdmin
            .from('api_credentials')
            .select('id, used_quota')
            .or(`provider.ilike.%${keyObj.provider}%,name.ilike.%${keyObj.provider}%`)
            .limit(1);
          if (dbMatch && dbMatch[0]) {
            targetId = dbMatch[0].id;
          }
        }

        if (targetId) {
          const { data: currentRec } = await supabaseAdmin
            .from('api_credentials')
            .select('used_quota')
            .eq('id', targetId)
            .single();

          const currentUsed = currentRec ? Number(currentRec.used_quota || 0) : 0;
          const newUsed = currentUsed + 1;

          await supabaseAdmin
            .from('api_credentials')
            .update({
              used_quota: newUsed,
              last_updated: new Date().toISOString()
            })
            .eq('id', targetId);
          console.log(`[API Management] Quota updated for Key ID ${targetId}: ${currentUsed} -> ${newUsed}`);
        }
      } catch (err) {
        console.error('API Management quota update notice:', err);
      }
    };

    // Try calling LLM Providers
    for (const keyObj of candidateKeys) {
      try {
        if (keyObj.provider === 'Google' || keyObj.name?.includes('Gemini')) {
          const endpoint = `${keyObj.base_url || 'https://generativelanguage.googleapis.com/v1beta'}/models/gemini-1.5-flash:generateContent?key=${keyObj.api_key}`;
          const gRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: llmPrompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.15 }
            })
          });
          const gData = await gRes.json();
          const rawText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            llmRecommendations = JSON.parse(cleanText);
            if (Array.isArray(llmRecommendations) && llmRecommendations.length > 0) {
              await incrementApiKeyQuota(keyObj);
              break;
            }
          }
        } else if (keyObj.base_url || keyObj.provider === 'Groq' || keyObj.provider === 'OpenAI') {
          const baseUrl = keyObj.base_url || 'https://api.groq.com/openai/v1';
          const modelName = keyObj.model || (keyObj.provider === 'Groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');
          const oRes = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${keyObj.api_key}`
            },
            body: JSON.stringify({
              model: modelName,
              messages: [{ role: 'user', content: llmPrompt }],
              temperature: 0.15
            })
          });
          const oData = await oRes.json();
          const rawText = oData?.choices?.[0]?.message?.content;
          if (rawText) {
            const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            llmRecommendations = JSON.parse(cleanText);
            if (Array.isArray(llmRecommendations) && llmRecommendations.length > 0) {
              await incrementApiKeyQuota(keyObj);
              break;
            }
          }
        }
      } catch (err) {
        console.warn(`LLM Provider ${keyObj.name} notice:`, err.message);
      }
    }

    // 4. Advanced 5-Dimension Algorithmic Fallback Engine
    if (!Array.isArray(llmRecommendations) || llmRecommendations.length === 0) {
      const candSkillList = (candidateSkills.toLowerCase().split(/[\s,]+/).filter(Boolean));
      const candDomain = (candidateProfile.resume_field || candidateProfile.title || '').toLowerCase();

      llmRecommendations = jobSubset.map(j => {
        const jobSkills = j.skills.map(s => String(s).trim());
        const lowerJobSkills = jobSkills.map(s => s.toLowerCase());

        const matched = [];
        const missing = [];

        lowerJobSkills.forEach((s, idx) => {
          if (candSkillList.some(cs => cs.includes(s) || s.includes(cs))) {
            matched.push(jobSkills[idx]);
          } else {
            missing.push(jobSkills[idx]);
          }
        });

        // 1. Skills Score (40%)
        const skillsScore = jobSkills.length > 0
          ? Math.round((matched.length / jobSkills.length) * 100)
          : (matched.length > 0 ? 85 : 60);

        // 2. Domain Score (20%)
        const jobText = `${j.title} ${j.department} ${j.requirements}`.toLowerCase();
        let domainScore = 60;
        if (candDomain && jobText.includes(candDomain)) {
          domainScore = 95;
        } else if (candDomain.includes('cyber') && (jobText.includes('sec') || jobText.includes('soc') || jobText.includes('audit'))) {
          domainScore = 90;
        } else if ((candDomain.includes('software') || candDomain.includes('web')) && (jobText.includes('developer') || jobText.includes('engineer'))) {
          domainScore = 90;
        }

        // 3. Experience Score (20%)
        const experienceScore = candidateProfile.experience ? 85 : 75;

        // 4. Projects Score (20%)
        const projectScore = (Array.isArray(candidateProfile.projects) && candidateProfile.projects.length > 0) ? 90 : 75;

        // Weighted Aggregate Match Score
        const finalScore = Math.min(
          Math.round((skillsScore * 0.4) + (domainScore * 0.2) + (experienceScore * 0.2) + (projectScore * 0.2)),
          98
        );

        return {
          jobId: j.id,
          matchScore: finalScore,
          scoreBreakdown: {
            skills: skillsScore,
            domain: domainScore,
            experience: experienceScore,
            projects: projectScore
          },
          reason: `High compatibility in ${j.department || 'Technical Domain'}. Candidate demonstrates ${matched.length > 0 ? matched.join(', ') : 'core domain skills'} required for ${j.title}.`,
          matchedSkills: matched.length > 0 ? matched : ['Problem Solving', 'Technical Adaptability'],
          missingSkills: missing.slice(0, 3),
          suggestedAction: `Tailor your resume to feature ${matched.slice(0, 2).join(' and ')} to maximize candidate ranking.`,
          recommendationLevel: finalScore >= 85 ? 'Strong Match' : 'Good Fit'
        };
      });
    }

    // 5. Merge AI Match Details Back to Full Job Objects
    const safeLlmRecs = Array.isArray(llmRecommendations) ? llmRecommendations.filter(r => r && typeof r === 'object') : [];
    const recMap = new Map(safeLlmRecs.map(r => [Number(r.jobId || r.id), r]));

    const rankedJobs = activeJobs.map(job => {
      const llmInfo = recMap.get(Number(job.id)) || {
        matchScore: 75,
        scoreBreakdown: { skills: 75, domain: 75, experience: 75, projects: 75 },
        reason: 'Recommended based on candidate technical profile and active career field.',
        matchedSkills: Array.isArray(job.skills) ? job.skills.slice(0, 3) : ['Domain Skills'],
        missingSkills: [],
        suggestedAction: 'Ensure your resume keywords match the job posting description.',
        recommendationLevel: 'Recommended'
      };

      return {
        ...job,
        matchScore: llmInfo.matchScore || 75,
        scoreBreakdown: llmInfo.scoreBreakdown || { skills: 75, domain: 75, experience: 75, projects: 75 },
        reason: llmInfo.reason || 'High domain relevance',
        matchedSkills: Array.isArray(llmInfo.matchedSkills) ? llmInfo.matchedSkills : [],
        missingSkills: Array.isArray(llmInfo.missingSkills) ? llmInfo.missingSkills : [],
        suggestedAction: llmInfo.suggestedAction || 'Tailor your resume skills section.',
        recommendationLevel: llmInfo.recommendationLevel || 'Match'
      };
    });

    // Sort strictly from highest match score to lowest match score
    rankedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return Response.json({
      success: true,
      candidateProfile: {
        name: candidateProfile.full_name || candidateProfile.name,
        title: candidateProfile.title,
        domain: candidateProfile.resume_field
      },
      totalMatchedJobs: rankedJobs.length,
      recommendations: rankedJobs
    });

  } catch (err) {
    console.error('LLM Recommendation Route Error:', err);
    return Response.json({ error: 'Failed to generate LLM job recommendations', details: err.message }, { status: 500 });
  }
}
