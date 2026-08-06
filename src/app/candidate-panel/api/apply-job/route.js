import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      candidate_id,
      job_id,
      company_name,
      job_title,
      external_apply_url,
      application_source,
      application_status
    } = body

    if (!candidate_id) {
      return NextResponse.json({ success: false, error: 'Candidate ID is required' }, { status: 400 })
    }

    if (!supabaseUrl) {
      return NextResponse.json({ success: false, error: 'Supabase URL not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const payload = {
      candidate_id: String(candidate_id),
      job_id: job_id ? String(job_id) : null,
      company_name: company_name || 'Hirenetic Enterprise',
      job_title: job_title || 'Untitled Role',
      external_apply_url: external_apply_url || null,
      application_source: application_source || 'Candidate Portal External Redirect',
      application_status: application_status || 'Redirected',
      applied_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('job_applications')
      .insert([payload])
      .select('*')
      .single()

    if (error) {
      console.error('API job_applications insert notice:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, application: data })
  } catch (err) {
    console.error('API apply-job exception:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
