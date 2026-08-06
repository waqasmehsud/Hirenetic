import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseAdmin = createClient(supabaseUrl, serviceKey)

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('crwl_jobsData')
      .select('*')
      .order('id', { ascending: false })
      .range(0, 4999)

    if (error) {
      console.error('Supabase crwl_jobsData fetch error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Normalize job fields so apply link, dates, company & location are guaranteed
    const normalizedJobs = (data || []).map((job) => {
      // 1. Extract Apply Link URL from all possible column variants
      let applyUrl = job.url || job.job_url || job.apply_url || job.link || job.apply_link || job.source_url || job.external_url || job.origin_url || ''
      
      if (!applyUrl && job.title) {
        // Safe Google / LinkedIn fallback search link for candidate application
        const encodedTitle = encodeURIComponent(`${job.title} ${job.company || ''} jobs`)
        applyUrl = `https://www.google.com/search?q=${encodedTitle}`
      }

      // 2. Extract & Format Date
      let formattedDate = 'Recent'
      const rawDate = job.posted_at || job.created_at || job.date || job.posted_date || job.updated_at
      if (rawDate) {
        try {
          const d = new Date(rawDate)
          if (!isNaN(d.getTime())) {
            formattedDate = d.toISOString().split('T')[0]
          } else {
            formattedDate = String(rawDate)
          }
        } catch (e) {
          formattedDate = 'Recent'
        }
      }

      // 3. Extract Company Name
      const companyName = job.company || job.company_name || job.department || job.employer || 'Direct Employer'

      // 4. Extract Location
      const jobLocation = job.location || job.city || job.country || 'Remote'

      // 5. Extract Employment Type
      const empType = job.type || job.employment_type || job.job_type || 'Full-time'

      return {
        ...job,
        id: job.id,
        title: job.title || job.job_title || job.position || 'Software Opportunity',
        company: companyName,
        location: jobLocation,
        type: empType,
        date: formattedDate,
        url: applyUrl
      }
    })

    return Response.json(normalizedJobs)
  } catch (err) {
    console.error('API jobs route error:', err)
    return Response.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
