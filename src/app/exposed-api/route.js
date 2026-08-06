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

    // 2. Environment Variable Validation (with fallback)
    const expectedApiKey = process.env.EXPOSED_API_KEY || process.env.NEXT_PUBLIC_EXPOSED_API_KEY || 'my_secure_api_key_2026'

    // 3. Timing-Safe API Key Authentication Check
    if (!clientApiKey || !safeCompare(clientApiKey, expectedApiKey)) {
      return Response.json(
        { success: false, error: 'Unauthorized: Invalid or missing API key' },
        { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="Access to exposed-api"' } }
      )
    }

    // 4. Real-time DB Query: Fetch all current job records dynamically
    const { data: jobs, error } = await supabaseAdmin
      .from('crwl_jobsData')
      .select('id, title, department, skills, ai_tags, status, is_active')
      .order('created_at', { ascending: false })

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
