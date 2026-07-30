import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseAdmin = createClient(supabaseUrl, serviceKey)

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('crwl_jobsData')
      .select('*')
      .order('id', { ascending: false })
      .limit(2000)

    if (error) {
      console.error('Supabase crwl_jobsData fetch error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data || [])
  } catch (err) {
    console.error('API jobs route error:', err)
    return Response.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
