import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/authGuard'

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user, error } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status: 403 })
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing Supabase URL' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // 1. Fetch Auth Users & Candidate Profiles
    let authUsersMap = {}
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
      if (authData && authData.users) {
        authData.users.forEach(u => {
          authUsersMap[u.id] = u.email
        })
      }
    } catch (e) {}

    const { data: candidatesData } = await supabaseAdmin
      .from('candidates_profiles')
      .select('*')
      .order('updated_at', { ascending: false })

    const formattedCandidates = (candidatesData || []).map(p => ({
      id: p.id,
      name: p.full_name || p.name || 'Candidate User',
      email: authUsersMap[p.id] || p.email || 'candidate@hirenetic.com',
      role: 'candidate',
      location: p.location || 'Pakistan',
      status: p.status || 'Verified',
      securityScan: p.cv_file_path || p.resume_text ? 'Passed' : 'Pending',
      skills: Array.isArray(p.skills) ? p.skills : (p.resume_field ? [p.resume_field] : ['Computer Science']),
      resume_field: p.resume_field,
      cv_file_path: p.cv_file_path
    }))

    // 2. Fetch Recruiters from employers_profiles
    const { data: hrData } = await supabaseAdmin
      .from('employers_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // 3. Fetch Job Applications
    const { data: appsData } = await supabaseAdmin
      .from('job_applications')
      .select('*')
      .order('applied_at', { ascending: false })

    const applications = appsData || []

    // 4. Fetch Real Jobs from crwl_jobsData and job_applications DB tables
    const { data: jobsData } = await supabaseAdmin
      .from('crwl_jobsData')
      .select('*')
      .order('posted_at', { ascending: false })
      .range(0, 4999)

    // Extract distinct applied jobs from job_applications table
    const appliedJobsMap = new Map();
    (appsData || []).forEach(app => {
      const title = app.job_title || app.title;
      const company = app.company_name || app.company || '10Pearls';
      if (title) {
        const key = `${title.toLowerCase()}-${company.toLowerCase()}`;
        if (!appliedJobsMap.has(key)) {
          appliedJobsMap.set(key, {
            id: app.job_id || app.id || `app-job-${appliedJobsMap.size + 1}`,
            title: title,
            company: company,
            location: 'Pakistan / Remote',
            type: 'Full-Time',
            salary: '$60,000 - $95,000 USD',
            status: 'Active',
            applicantsCount: 1
          });
        } else {
          const existing = appliedJobsMap.get(key);
          existing.applicantsCount += 1;
        }
      }
    });

    const formattedJobsFromCrwl = (jobsData || []).map(j => {
      const applicantCount = applications.filter(a => {
        const isIdMatch = String(a.job_id) === String(j.id)
        const isTitleMatch = (a.job_title || '').toLowerCase() === (j.title || '').toLowerCase()
        return isIdMatch || isTitleMatch
      }).length

      return {
        id: j.id,
        title: j.title || 'Job Opening',
        company: j.company_name || j.source_company || 'Hirenetic Enterprise',
        location: j.location || 'Remote',
        type: j.employment_type || 'Full-Time',
        salary: (j.salary_min > 0 || j.salary_max > 0)
          ? `$${j.salary_min} - $${j.salary_max} ${j.salary_currency || 'USD'}`
          : 'Competitive Salary',
        status: (j.status === 'Active' || j.is_active || j.status === 'Open') ? 'Active' : 'Closed',
        applicantsCount: applicantCount
      }
    })

    const appliedJobsArray = Array.from(appliedJobsMap.values());
    const formattedJobs = [...appliedJobsArray, ...formattedJobsFromCrwl];

    const formattedHR = (hrData || []).map(h => {
      const recruiterJobsCount = formattedJobs.filter(j => 
        (j.company || '').toLowerCase() === (h.company_name || '').toLowerCase()
      ).length

      return {
        id: h.id,
        name: h.full_name || 'Recruiter Account',
        email: h.email || authUsersMap[h.id] || 'hr@company.com',
        company: h.company_name || 'Hirenetic Enterprise',
        role: h.designation || 'Senior Talent Acquisition',
        status: h.status || 'Verified',
        activeJobs: recruiterJobsCount
      }
    })

    // 5. Fetch Scripts from scriptsEditor
    const { data: scriptsData } = await supabaseAdmin
      .from('scriptsEditor')
      .select('*')
      .order('id', { ascending: false })

    const formattedScripts = (scriptsData || []).map(s => ({
      id: s.id,
      name: s.title || s.name || s.script_name || s.filename || `script_${s.id}.py`,
      language: s.language || s.type || 'Python',
      category: s.category || s.tag || s.type || 'Automation',
      code: s.code || s.content || ''
    }))

    return NextResponse.json({
      success: true,
      candidates: formattedCandidates,
      recruiters: formattedHR,
      jobs: formattedJobs,
      applications: applications,
      scripts: formattedScripts
    })
  } catch (err) {
    console.error('API get-admin-stats exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
