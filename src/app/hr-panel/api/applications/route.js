import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET: Fetch all job applications joined with candidate profile data
export async function GET() {
  try {
    if (!supabaseUrl) {
      return NextResponse.json({ success: false, applications: [] }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Fetch applications
    const { data: apps, error: appsError } = await supabase
      .from('job_applications')
      .select('*')
      .order('applied_at', { ascending: false })

    if (appsError) {
      console.error('Error fetching job_applications:', appsError.message)
      return NextResponse.json({ success: false, applications: [], error: appsError.message })
    }

    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: true, applications: [] })
    }

    // Extract unique candidate IDs
    const candidateIds = Array.from(new Set(apps.map(a => a.candidate_id).filter(Boolean)))

    let profilesMap = {}
    let matchesMap = {}

    if (candidateIds.length > 0) {
      // Fetch candidate profiles
      const { data: profiles } = await supabase
        .from('candidates_profiles')
        .select('*')
        .in('id', candidateIds)

      if (Array.isArray(profiles)) {
        profiles.forEach(p => {
          profilesMap[p.id] = p
        })
      }

      // Fetch stored LLM match scores from candidate_job_matches
      try {
        const { data: matches } = await supabase
          .from('candidate_job_matches')
          .select('*')
          .in('candidate_id', candidateIds)

        if (Array.isArray(matches)) {
          matches.forEach(m => {
            if (m.candidate_id && m.job_id) {
              matchesMap[`${m.candidate_id}_${m.job_id}`] = m
            }
            if (m.candidate_id && !matchesMap[m.candidate_id]) {
              matchesMap[m.candidate_id] = m
            }
          })
        }
      } catch (e) {
        // Fallback gracefully if table missing
      }
    }

    // Merge applications with candidate profile & candidate_job_matches
    const mergedApplications = apps.map(app => {
      const p = profilesMap[app.candidate_id] || {}
      const matchObj = matchesMap[`${app.candidate_id}_${app.job_id}`] || matchesMap[app.candidate_id] || {}
      
      const exactScore = matchObj.match_score || app.match_score || p.overall_match || p.skills_score || 85

      return {
        application_id: app.id,
        id: p.id || app.candidate_id,
        candidateId: p.id || app.candidate_id,
        candidate_id: app.candidate_id,
        jobId: app.job_id,
        job_id: app.job_id,
        name: p.full_name || p.name || 'Registered Candidate',
        full_name: p.full_name || p.name || 'Registered Candidate',
        email: p.email || 'candidate@hirenetic.com',
        jobTitle: app.job_title || p.resume_field || 'Position Applied',
        title: app.job_title || p.resume_field || 'Position Applied',
        company: app.company_name || 'Hirenetic Enterprise',
        company_name: app.company_name || 'Hirenetic Enterprise',
        external_apply_url: app.external_apply_url,
        status: app.application_status || 'Redirected',
        application_status: app.application_status || 'Redirected',
        appliedDate: app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent',
        applied_at: app.applied_at,
        created_at: app.created_at,
        matchScore: exactScore,
        skills: Array.isArray(p.skills) ? p.skills : [],
        matchedSkills: Array.isArray(matchObj.matched_skills) ? matchObj.matched_skills : (Array.isArray(p.skills) ? p.skills : []),
        missingSkills: Array.isArray(matchObj.missing_skills) ? matchObj.missing_skills : (Array.isArray(p.missing_skills) ? p.missing_skills : []),
        whyRecommended: matchObj.why_recommended || [],
        whyNotRecommended: matchObj.why_not_recommended || [],
        executiveSummary: matchObj.executive_summary || matchObj.reasoning || null,
        projectSpotlight: matchObj.project_spotlight || null,
        cv_file_path: p.cv_file_path,
        resume_text: p.resume_text,
        github_url: p.github_url,
        linkedin_url: p.linkedin_url,
        portfolio_url: p.portfolio_url
      }
    })

    return NextResponse.json({ success: true, applications: mergedApplications })
  } catch (err) {
    console.error('API get-applications exception:', err)
    return NextResponse.json({ success: false, applications: [], error: err.message }, { status: 500 })
  }
}

// PATCH / PUT: Update application status
export async function PATCH(req) {
  try {
    const body = await req.json()
    const { application_id, status } = body

    if (!application_id || !status) {
      return NextResponse.json({ success: false, error: 'Missing application_id or status' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await supabase
      .from('job_applications')
      .update({ application_status: status })
      .eq('id', application_id)
      .select('*')

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
