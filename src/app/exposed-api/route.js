import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Force dynamic execution on every API request so real-time updated DB data is always returned
export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseAdmin = createClient(supabaseUrl, serviceKey)

/**
 * Timing-safe comparison function to prevent side-channel timing attacks
 */
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Dynamically extract technical fields for any job dynamically from DB fields
 */
function extractDynamicFields(job) {
  const title = (job.title || '').trim()
  const dept = (job.department || '').trim()
  const skills = Array.isArray(job.skills) ? job.skills : []
  const tags = Array.isArray(job.ai_tags) ? job.ai_tags : []

  const fields = new Set()

  const fullText = `${title} ${dept} ${skills.join(' ')} ${tags.join(' ')}`.toLowerCase()

  // Dynamic field detection rules
  if (/cybersecurity|security|infosec|pentest|vulnerability|soc\b|hacker/.test(fullText)) {
    fields.add('Cybersecurity & InfoSec')
  }
  if (/\bai\b|machine learning|deep learning|nlp|data science|llm|artificial intelligence|data analyst|data engineer/.test(fullText)) {
    fields.add('AI, ML & Data Science')
  }
  if (/devops|cloud|kubernetes|docker|terraform|aws|azure|gcp|ci\/cd|sre|infrastructure|sysadmin/.test(fullText)) {
    fields.add('DevOps, Cloud & Infrastructure')
  }
  if (/frontend|front-end|react|vue|angular|css|html|ui\/ux|next\.js/.test(fullText)) {
    fields.add('Frontend Development')
  }
  if (/backend|back-end|node|django|fastapi|express|python|java|golang|\bgo\b|rust|laravel|php|microservices/.test(fullText)) {
    fields.add('Backend Development')
  }
  if (/fullstack|full-stack|full stack/.test(fullText)) {
    fields.add('Full Stack Development')
  }
  if (/mobile|ios|android|flutter|react native/.test(fullText)) {
    fields.add('Mobile App Development')
  }
  if (title.toLowerCase().includes('software engineer') || title.toLowerCase().includes('software developer')) {
    fields.add('Software Engineering')
  } else if (title.toLowerCase().includes('developer')) {
    fields.add('General Software Development')
  }

  // Fallback if no specific category rule matched
  if (fields.size === 0) {
    if (dept && dept.toLowerCase() !== 'unspecified') {
      fields.add(dept)
    } else {
      fields.add('Other Specialized Technical Roles')
    }
  }

  return Array.from(fields)
}

export async function GET(request) {
  try {
    // 1. Extract API Key from Request Headers or Query Parameters
    const { searchParams } = new URL(request.url)
    const apiKeyFromQuery = searchParams.get('api_key')
    const apiKeyFromHeader = 
      request.headers.get('x-api-key') || 
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    const clientApiKey = apiKeyFromHeader || apiKeyFromQuery

    // 2. Environment Variable Validation (fail-fast, no hardcoded fallback)
    const expectedApiKey = process.env.EXPOSED_API_KEY || process.env.NEXT_PUBLIC_EXPOSED_API_KEY

    if (!expectedApiKey) {
      return Response.json(
        { success: false, error: 'Server misconfiguration: API key not set in environment variables' },
        { status: 500 }
      )
    }

    // 3. Timing-Safe API Key Authentication Check (Allow public_widget bypass if requested)
    const isPublicWidget = searchParams.get('public_widget') === 'true';
    if (!isPublicWidget && (!clientApiKey || !safeCompare(clientApiKey, expectedApiKey))) {
      return Response.json(
        { success: false, error: 'Unauthorized: Invalid or missing API key' },
        { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="Access to exposed-api"' } }
      )
    }

    // 4. CANDIDATE WIDGET EXPOSED DATA ENGINE
    const candidateIdParam = searchParams.get('candidate_id') || searchParams.get('candidateId') || searchParams.get('id');
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type');
    const isWidgetRequest = isPublicWidget || searchParams.get('widget') === 'true' || typeParam === 'candidate' || candidateIdParam || emailParam;

    if (isWidgetRequest) {
      let query = supabaseAdmin.from('candidates_profiles').select('*');
      if (candidateIdParam) {
        query = query.eq('id', candidateIdParam);
      } else if (emailParam) {
        query = query.eq('email', emailParam);
      }
      
      const { data: candData, error: candError } = await (candidateIdParam || emailParam ? query.single() : query.limit(10));

      let targetCandidate = null;
      if (candData) {
        targetCandidate = Array.isArray(candData) ? candData[0] : candData;
      }

      if (!targetCandidate) {
        const { data: fallbackList } = await supabaseAdmin.from('candidates_profiles').select('*').limit(1);
        if (fallbackList && fallbackList.length > 0) {
          targetCandidate = fallbackList[0];
        }
      }

      if (!targetCandidate) {
        return Response.json({ success: false, error: 'Candidate profile not found' }, { status: 404 });
      }

      // Fetch Applications for this candidate
      const { data: candApps } = await supabaseAdmin
        .from('job_applications')
        .select('*')
        .or(`candidate_id.eq.${targetCandidate.id},email.eq.${targetCandidate.email}`);

      // Calculate dynamic ATS metrics
      const skillsList = Array.isArray(targetCandidate.skills) ? targetCandidate.skills : [];
      const expList = Array.isArray(targetCandidate.experience) ? targetCandidate.experience : [];
      const projList = Array.isArray(targetCandidate.projects) ? targetCandidate.projects : [];
      const certList = Array.isArray(targetCandidate.certifications) ? targetCandidate.certifications : [];
      const eduList = Array.isArray(targetCandidate.education) ? targetCandidate.education : [];

      const verifiedCount = [targetCandidate.email_verified, targetCandidate.github_verified, targetCandidate.linkedin_verified, targetCandidate.portfolio_verified].filter(Boolean).length;
      const trustScore = targetCandidate.trust_score || Math.round((verifiedCount / 4) * 100);

      const expYears = expList.reduce((acc, job) => {
        const s = parseInt(job.start_year || job.start_date || 2022);
        const e = parseInt(job.end_year || job.end_date || 2026);
        return acc + Math.max(e - s, 1);
      }, 0);

      const candidateWidget = {
        id: targetCandidate.id,
        candidateIdStr: `CAN-2025-${String(targetCandidate.id).substring(0, 6)}`,
        name: targetCandidate.full_name || targetCandidate.name || 'Candidate Profile',
        email: targetCandidate.email,
        phone: targetCandidate.phone || '+92 300 1234567',
        location: targetCandidate.location || 'Pakistan',
        title: targetCandidate.title || targetCandidate.resume_field || 'Software Engineer',
        bio: targetCandidate.bio || targetCandidate.resume_text || 'Experienced tech professional.',
        metrics: {
          matchScore: targetCandidate.match_score || 88,
          resumeScore: targetCandidate.resume_score || 92,
          trustScore: trustScore,
          overallRating: targetCandidate.rating || 4.7,
          experienceYears: expYears > 0 ? expYears.toFixed(1) : '0.0'
        },
        verifications: {
          email: targetCandidate.email_verified || false,
          github: targetCandidate.github_verified || false,
          linkedin: targetCandidate.linkedin_verified || false,
          portfolio: targetCandidate.portfolio_verified || false
        },
        socials: {
          githubUrl: targetCandidate.github_url || '',
          linkedinUrl: targetCandidate.linkedin_url || '',
          portfolioUrl: targetCandidate.portfolio_url || ''
        },
        skills: skillsList,
        workExperience: expList,
        projects: projList,
        education: eduList,
        certifications: certList,
        documents: [
          { name: targetCandidate.cv_file_path ? targetCandidate.cv_file_path.split('/').pop() : 'RESUME.pdf', size: '1.2 MB', url: targetCandidate.cv_file_path || '#' }
        ],
        applicationHistory: (candApps || []).map(a => ({
          jobTitle: a.job_title,
          company: a.company_name,
          appliedOn: a.applied_at ? new Date(a.applied_at).toLocaleDateString('en-GB') : 'Recently',
          stage: a.stage || 'Screening',
          status: a.status || 'In Progress'
        }))
      };

      return Response.json({
        success: true,
        candidateWidget,
        meta: { timestamp: new Date().toISOString(), isRealtimeLive: true }
      });
    }

    // 5. Real-time DB Query: Fetch all current job records dynamically
    const { data: jobs, error } = await supabaseAdmin
      .from('crwl_jobsData')
      .select('id, title, department, skills, ai_tags, status, is_active')
      .order('id', { ascending: false })
      .range(0, 4999)

    if (error) {
      console.error('[DATABASE ERROR] Supabase jobs fetch failed:', error)
      return Response.json(
        { success: false, error: 'Database query execution failed' },
        { status: 500 }
      )
    }

    // 5. Dynamic Aggregations (Computed live on every request)
    const jobsByField = {}
    const topSkills = {}
    const jobsByDepartment = {}

    const jobList = jobs || []
    jobList.forEach(job => {
      // Aggregate by Dynamic Fields
      const matchedFields = extractDynamicFields(job)
      matchedFields.forEach(field => {
        jobsByField[field] = (jobsByField[field] || 0) + 1
      })

      // Aggregate Top Required Skills dynamically
      if (Array.isArray(job.skills)) {
        job.skills.forEach(skill => {
          if (skill && typeof skill === 'string') {
            const cleanSkill = skill.trim()
            topSkills[cleanSkill] = (topSkills[cleanSkill] || 0) + 1
          }
        })
      }

      // Aggregate by Department dynamically
      const deptName = job.department || 'Unspecified'
      jobsByDepartment[deptName] = (jobsByDepartment[deptName] || 0) + 1
    })

    // Sort Top Skills by count descending (top 15)
    const sortedTopSkills = Object.entries(topSkills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .reduce((acc, [skill, count]) => {
        acc[skill] = count
        return acc
      }, {})

    // 6. Return Live Updated JSON Payload
    return Response.json(
      {
        success: true,
        data: {
          totalJobs: jobs ? jobs.length : 0,
          jobsByField,
          topRequiredSkills: sortedTopSkills,
          jobsByDepartment
        },
        meta: {
          timestamp: new Date().toISOString(),
          isRealtimeLive: true
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (err) {
    console.error('[SERVER ERROR] Unexpected error in exposed-api route:', err)
    return Response.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
