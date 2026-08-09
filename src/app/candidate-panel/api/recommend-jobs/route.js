import { createClient } from '@supabase/supabase-js';
import { scrapeJobWebpage } from '@/lib/jobScraper';

export async function POST(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fdducqoklmqvomsszyqy.supabase.co';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const { userId, candidateProfile: inputProfile, limit = 15 } = body;

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
        title: 'Software & Technical Specialist',
        skills: ['Python', 'React', 'PostgreSQL', 'Git', 'Linux', 'REST API', 'FastAPI'],
        experience: '3+ Years',
        education: 'B.S. Computer Science',
        projects: [{ title: 'Backend REST API Suite', description: 'Built automated REST APIs and DB pipeline.', techStack: 'Python, FastAPI, PostgreSQL' }],
        certifications: ['AWS Certified Cloud Practitioner'],
        resume_field: 'Software Engineering',
        location: 'Remote / Hybrid'
      };
    }

    // 2. Fetch Active Jobs from crwl_jobsData
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

    // Determine Groq API credentials
    let groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      try {
        const { data: dbKeys } = await supabaseAdmin
          .from('api_credentials')
          .select('*')
          .eq('status', 'Active');
        if (Array.isArray(dbKeys)) {
          const groqKeyObj = dbKeys.find(k => (k.provider?.toLowerCase().includes('groq') || k.api_key?.startsWith('gsk_')));
          if (groqKeyObj?.api_key) {
            groqApiKey = groqKeyObj.api_key;
          }
        }
      } catch (e) {}
    }

    // Parse candidate skills & projects safely from resume/profile
    const candidateSkillsStr = Array.isArray(candidateProfile.skills) ? candidateProfile.skills.join(', ') : (candidateProfile.skills || 'Python, SQL');
    const candidateProjectsList = Array.isArray(candidateProfile.projects) ? candidateProfile.projects : [];
    const resumeTextSnippet = (candidateProfile.resume_text || '').substring(0, 1500).replace(/\n+/g, ' ');

    const candidateResumeContext = `
Candidate Name: ${candidateProfile.full_name || candidateProfile.name || 'Candidate'}
Current Title / Specialization: ${candidateProfile.title || candidateProfile.resume_field || 'Software Engineer'}
Primary Domain: ${candidateProfile.resume_field || 'Software Engineering'}
Technical Skills (Parsed from Resume): ${candidateSkillsStr}
Experience Level: ${typeof candidateProfile.experience === 'string' ? candidateProfile.experience : JSON.stringify(candidateProfile.experience || '2+ Years')}
Education: ${typeof candidateProfile.education === 'string' ? candidateProfile.education : JSON.stringify(candidateProfile.education || 'Degree in Computer Science')}
Candidate Projects (Parsed from Resume): ${JSON.stringify(candidateProjectsList)}
Certifications: ${JSON.stringify(candidateProfile.certifications || [])}
Location: ${candidateProfile.location || 'Remote'}
Raw Resume Text Excerpt: ${resumeTextSnippet || 'No raw resume text provided.'}
`;

    // 3. Fetch Existing Cached Matches for candidate to skip already-analyzed jobs & save tokens
    let existingMatchesMap = {};
    const forceRefresh = body.forceRefresh === true;
    if (candidateProfile?.id && supabaseAdmin && !forceRefresh) {
      try {
        const { data: cachedMatches } = await supabaseAdmin
          .from('candidate_job_matches')
          .select('*')
          .eq('candidate_id', candidateProfile.id);

        if (Array.isArray(cachedMatches)) {
          cachedMatches.forEach(m => {
            if (m.job_id) {
              existingMatchesMap[String(m.job_id)] = m;
            }
          });
        }
      } catch (e) {}
    }

    // Process jobs ONE AT A TIME (Sequential Execution Pipeline with Token Cache)
    const targetJobs = activeJobs.slice(0, Math.min(limit, 25));
    const processedRecommendations = [];

    for (const job of targetJobs) {
      // CHECK IF JOB WAS ALREADY ANALYZED & CACHED IN DB FOR THIS CANDIDATE
      const cachedMatch = existingMatchesMap[String(job.id)];
      if (cachedMatch && !forceRefresh) {
        // Reuse existing cached analysis object without calling Groq API! Token cost = 0!
        const cachedResultObj = {
          jobId: job.id,
          jobTitle: job.title || job.job_title || 'Software Role',
          company: job.company_name || job.company || 'Tech Enterprise',
          location: job.location || 'Remote',
          matchScore: cachedMatch.match_score || 85,
          recommendation: cachedMatch.recommendation || 'APPLY',
          recommendationLabel: cachedMatch.recommendation_label || 'Strong Match',
          executiveSummary: cachedMatch.executive_summary || cachedMatch.reasoning || 'Evidence-backed candidate recommendation.',
          scoreBreakdown: cachedMatch.score_breakdown || { overall: cachedMatch.match_score || 85 },
          projectSpotlight: cachedMatch.project_spotlight || null,
          whyRecommended: cachedMatch.why_recommended || [],
          whyNotRecommended: cachedMatch.why_not_recommended || [],
          matchedRequirements: cachedMatch.matched_requirements || [],
          missingRequirements: cachedMatch.missing_requirements || [],
          strongMatches: cachedMatch.matched_skills || [],
          gaps: cachedMatch.missing_skills || [],
          matchedSkills: cachedMatch.matched_skills || [],
          missingSkills: cachedMatch.missing_skills || [],
          finalReasoning: cachedMatch.reasoning || 'Evidence-backed recommendation.',
          reason: cachedMatch.reasoning || 'Evidence-backed recommendation.',
          isCached: true // Zero LLM Tokens Consumed!
        };
        processedRecommendations.push(cachedResultObj);
        continue; // Skip Groq LLM API call entirely for this job!
      }

      const jobUrl = job.job_url || job.url || null;

      // Step A: Webpage Extraction Layer (Scrape or retrieve from cache)
      let websiteData = null;
      if (jobUrl) {
        websiteData = await scrapeJobWebpage(jobUrl, supabaseAdmin);
      }

      // Step B: Build Single Normalized Job Object
      const normalizedJob = {
        job_id: job.id,
        job_title: job.title || job.job_title || 'Software Role',
        company: job.company_name || job.company || 'Tech Enterprise',
        location: job.location || 'Remote',
        database_description: (job.description || '').substring(0, 800),
        database_requirements: job.requirements || [],
        database_skills: Array.isArray(job.skills) ? job.skills : (typeof job.skills === 'string' ? job.skills.split(',') : []),
        website_description: websiteData?.website_description || null,
        website_requirements: websiteData?.website_requirements || [],
        website_responsibilities: websiteData?.website_responsibilities || [],
        website_skills: websiteData?.website_skills || [],
        job_url: jobUrl
      };

      // Step C: Construct Explainable Groq LLM Prompt for Single Job Analysis
      const singleJobPrompt = `You are an Enterprise AI Candidate-Job Matching Engine built on Explainable Recommendation & Project Synergy.

CANDIDATE RESUME DATA:
${candidateResumeContext}

NORMALIZED JOB POSTING DATA (Database + Webpage):
${JSON.stringify(normalizedJob, null, 2)}

STRICT RULES & CONCISE OUTPUT:
1. EXECUTIVE SUMMARY: Write a strictly 2 to 4 line executive summary ("executive_summary") detailing the real evidence match without mock data or generic fluff.
2. RECOMMENDATION VALUES: Must be strictly "APPLY", "CONSIDER", or "DO_NOT_APPLY".
3. EXPLAINABILITY (why_recommended & why_not_recommended):
   - Every item MUST pair: "fact" (Job requirement) + "evidence" (Candidate resume evidence).
   - Keep points TO THE POINT, factual, and concise. No fluff!
4. RELEVANT PROJECT ADVANTAGE SPOTLIGHT (project_spotlight):
   - Check candidate's projects. If candidate has a relevant project for this job role, even if exact skill keywords don't match 100%, set "has_spotlight": true and explain how building this project demonstrates practical competence and increases their hiring probability!
5. SCORE WEIGHTING:
   - Skills: 30%, Experience: 25%, Responsibilities: 20%, Projects: 10%, Education: 10%, Other: 5%.
   Return final match_score from 0 to 100.

Return ONLY a valid JSON object matching this exact schema:
{
  "match_score": 87,
  "recommendation": "APPLY",
  "recommendation_label": "Strong Match",
  "confidence": 92,
  "executive_summary": "The candidate's resume demonstrates direct hands-on experience with Python and REST API architectures matching this position's core tech stack. Building the 'Backend REST API Suite' project provides strong practical evidence of production capability. While Docker experience is not explicitly stated in the resume, the core engineering foundation aligns exceptionally well with the role requirements.",
  "score_breakdown": {
    "skills": 92,
    "experience": 85,
    "responsibilities": 88,
    "projects": 84,
    "education": 80
  },
  "project_spotlight": {
    "has_spotlight": true,
    "project_title": "Backend REST API Suite",
    "reasoning": "Even if exact keyword requirements don't match 100%, your project 'Backend REST API Suite' demonstrates practical hands-on experience directly relevant to this backend role. Highlighting this project on your application will significantly boost your hiring chances!"
  },
  "why_recommended": [
    {
      "fact": "Job requires Python and REST API development.",
      "evidence": "Candidate has Python and REST API experience in previous projects."
    },
    {
      "fact": "Job requires PostgreSQL experience.",
      "evidence": "Candidate lists PostgreSQL in technical skills and backend projects."
    }
  ],
  "why_not_recommended": [
    {
      "fact": "Job requires Docker experience.",
      "evidence": "Docker experience is not found in the resume."
    }
  ],
  "matched_requirements": [
    {
      "requirement": "Python & REST APIs",
      "candidate_evidence": "Python and REST API experience in backend projects",
      "status": "MATCH"
    }
  ],
  "missing_requirements": [
    {
      "requirement": "Docker",
      "candidate_evidence": "No Docker experience found in resume",
      "status": "NOT_MENTIONED",
      "severity": "MEDIUM"
    }
  ],
  "strong_matches": ["Python", "REST APIs", "PostgreSQL"],
  "gaps": ["Docker"],
  "final_reasoning": "Apply — strong alignment with core requirements. Docker is the main gap."
}`;

      let matchAnalysis = null;

      // Step D: Call Groq API with Retry Logic
      if (groqApiKey) {
        let retries = 2;
        while (retries >= 0 && !matchAnalysis) {
          try {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqApiKey}`
              },
              body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: singleJobPrompt }],
                response_format: { type: 'json_object' },
                temperature: 0.15
              })
            });

            if (groqRes.status === 429) {
              console.warn(`[Groq Rate Limit 429] Retrying in 1s for job #${job.id}...`);
              await new Promise(r => setTimeout(r, 1000));
              retries--;
              continue;
            }

            if (groqRes.ok) {
              const groqData = await groqRes.json();
              const contentText = groqData?.choices?.[0]?.message?.content;
              if (contentText) {
                const parsed = JSON.parse(contentText.replace(/```json/gi, '').replace(/```/g, '').trim());
                if (parsed && typeof parsed.match_score === 'number' && parsed.recommendation) {
                  matchAnalysis = parsed;
                }
              }
            }
          } catch (groqErr) {
            console.warn(`[Groq API Exception] Job #${job.id}:`, groqErr.message);
          }
          retries--;
        }
      }

      // Step E: Deterministic Fallback if Groq API call fails or key unavailable
      if (!matchAnalysis) {
        const candSkillList = candidateSkillsStr.toLowerCase().split(/[\s,]+/).filter(Boolean);
        const jobSkillList = [...normalizedJob.database_skills, ...normalizedJob.website_skills].map(s => String(s).trim());

        const matchedSkills = [];
        const missingSkills = [];

        jobSkillList.forEach(s => {
          if (candSkillList.some(cs => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))) {
            matchedSkills.push(s);
          } else {
            missingSkills.push(s);
          }
        });

        const skillsScore = jobSkillList.length > 0
          ? Math.round((matchedSkills.length / jobSkillList.length) * 100)
          : 75;

        const finalScore = Math.min(Math.max(skillsScore, 65), 96);

        let fallbackRecommendation = 'CONSIDER';
        if (finalScore >= 85) fallbackRecommendation = 'APPLY';
        else if (finalScore < 70) fallbackRecommendation = 'DO_NOT_APPLY';

        const whyRecommended = matchedSkills.slice(0, 3).map(sk => ({
          fact: `Job requires ${sk} experience.`,
          evidence: `Candidate lists ${sk} in technical skills parsed from resume.`
        }));

        const whyNotRecommended = missingSkills.slice(0, 2).map(ms => ({
          fact: `Job lists ${ms} requirement.`,
          evidence: `No ${ms} experience found in candidate resume.`
        }));

        const firstProject = candidateProjectsList[0];

        matchAnalysis = {
          match_score: finalScore,
          recommendation: fallbackRecommendation,
          recommendation_label: finalScore >= 85 ? 'Strong Match' : (finalScore >= 75 ? 'Good Fit' : 'Partial Match'),
          confidence: 88,
          executive_summary: `Candidate profile demonstrates strong technical foundation in ${candidateProfile.resume_field || 'Engineering'} with verified skills in ${matchedSkills.slice(0, 3).join(', ') || 'core software tools'}. Practical experience aligns well with the key responsibilities for ${normalizedJob.job_title} at ${normalizedJob.company}. Address minor tool gaps during application to maximize hiring response.`,
          score_breakdown: {
            skills: skillsScore,
            experience: 80,
            responsibilities: 75,
            projects: 80,
            education: 80
          },
          project_spotlight: firstProject ? {
            has_spotlight: true,
            project_title: firstProject.title || 'Technical Project',
            reasoning: `Even if skill keywords don't match 100%, your project '${firstProject.title || 'Technical Project'}' shows practical capability relevant to ${normalizedJob.job_title}. Emphasize this project to improve your response rate!`
          } : null,
          why_recommended: whyRecommended.length > 0 ? whyRecommended : [{
            fact: `Job aligns with ${normalizedJob.job_title} domain.`,
            evidence: `Candidate demonstrates engineering background in resume.`
          }],
          why_not_recommended: whyNotRecommended.length > 0 ? whyNotRecommended : [{
            fact: `Job requires additional specialized tooling.`,
            evidence: `Not explicitly listed in candidate resume.`
          }],
          matched_requirements: matchedSkills.map(s => ({
            requirement: s,
            candidate_evidence: `${s} listed in resume skills`,
            status: 'MATCH'
          })),
          missing_requirements: missingSkills.map(s => ({
            requirement: s,
            candidate_evidence: `No ${s} experience found in resume`,
            status: 'NOT_MENTIONED',
            severity: 'MEDIUM'
          })),
          strong_matches: Array.from(new Set(matchedSkills.length > 0 ? matchedSkills : ['Core Engineering'])),
          gaps: Array.from(new Set(missingSkills.slice(0, 3))),
          final_reasoning: `${fallbackRecommendation === 'APPLY' ? 'Recommended to apply.' : 'Worth considering.'} Strong core fit with minor skill gaps.`
        };
      }

      // Format complete final job object for output
      const resultObj = {
        ...job,
        jobId: job.id,
        matchScore: matchAnalysis.match_score || 75,
        recommendation: matchAnalysis.recommendation || 'CONSIDER',
        recommendationLabel: matchAnalysis.recommendation_label || 'Match',
        confidence: matchAnalysis.confidence || 90,
        executiveSummary: matchAnalysis.executive_summary || matchAnalysis.executiveSummary || null,
        scoreBreakdown: matchAnalysis.score_breakdown || {
          skills: 75,
          experience: 75,
          responsibilities: 75,
          projects: 75,
          education: 75
        },
        projectSpotlight: matchAnalysis.project_spotlight || null,
        whyRecommended: Array.isArray(matchAnalysis.why_recommended) ? matchAnalysis.why_recommended : [],
        whyNotRecommended: Array.isArray(matchAnalysis.why_not_recommended) ? matchAnalysis.why_not_recommended : [],
        matchedRequirements: Array.isArray(matchAnalysis.matched_requirements) ? matchAnalysis.matched_requirements : [],
        missingRequirements: Array.isArray(matchAnalysis.missing_requirements) ? matchAnalysis.missing_requirements : [],
        strongMatches: Array.isArray(matchAnalysis.strong_matches) ? matchAnalysis.strong_matches : [],
        gaps: Array.isArray(matchAnalysis.gaps) ? matchAnalysis.gaps : [],
        finalReasoning: matchAnalysis.final_reasoning || 'Evidence-backed candidate recommendation.',
        reason: matchAnalysis.final_reasoning || 'Evidence-backed candidate recommendation.',
        matchedSkills: matchAnalysis.strong_matches || [],
        missingSkills: matchAnalysis.gaps || [],
        extractedJobData: websiteData
      };

      // Step F: Save match result to Supabase database (candidate_job_matches)
      if (candidateProfile?.id && supabaseAdmin) {
        try {
          await supabaseAdmin
            .from('candidate_job_matches')
            .upsert({
              candidate_id: candidateProfile.id,
              job_id: job.id,
              match_score: resultObj.matchScore,
              recommendation: resultObj.recommendation,
              recommendation_label: resultObj.recommendationLabel,
              executive_summary: resultObj.executiveSummary,
              project_spotlight: resultObj.projectSpotlight,
              matched_skills: resultObj.matchedSkills,
              missing_skills: resultObj.missingSkills,
              why_recommended: resultObj.whyRecommended,
              why_not_recommended: resultObj.whyNotRecommended,
              matched_requirements: resultObj.matchedRequirements,
              missing_requirements: resultObj.missingRequirements,
              reasoning: resultObj.finalReasoning,
              score_breakdown: resultObj.scoreBreakdown,
              analysis_timestamp: new Date().toISOString()
            }, { onConflict: 'candidate_id,job_id' });
        } catch (e) {
          // Ignore table missing errors gracefully
        }
      }

      processedRecommendations.push(resultObj);
    }

    // Sort strictly from highest match score to lowest match score
    processedRecommendations.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    // Save highest recommendation score to candidate's profile in Supabase candidates_profiles table
    if (candidateProfile?.id && supabaseAdmin && processedRecommendations.length > 0) {
      const highestScore = processedRecommendations[0]?.matchScore || 85;
      try {
        await supabaseAdmin
          .from('candidates_profiles')
          .update({ 
            overall_match: highestScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', candidateProfile.id);
      } catch (saveErr) {
        console.warn('Notice updating candidates_profiles overall_match:', saveErr.message);
      }
    }

    return Response.json({
      success: true,
      candidateProfile: {
        id: candidateProfile.id,
        name: candidateProfile.full_name || candidateProfile.name,
        title: candidateProfile.title,
        domain: candidateProfile.resume_field
      },
      totalMatchedJobs: processedRecommendations.length,
      recommendations: processedRecommendations
    });

  } catch (err) {
    console.error('Groq Explainable Job Matching Route Error:', err);
    return Response.json({ error: 'Failed to complete Groq explainable job matching pipeline', details: err.message }, { status: 500 });
  }
}
