import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, serviceKey)

export async function POST(request) {
  try {
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, error: 'Supabase URL or Key not configured' }, { status: 500 });
    }
    const body = await request.json()
    const { email, password, fullName, companyName, designation, industry, companySize } = body

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, full name, and company name are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = fullName.trim()
    const cleanCompany = companyName.trim()
    const cleanDesignation = (designation || 'Lead HR Recruiter').trim()

    // 1. Create or SignUp Auth User in Supabase
    let userId = null
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password.trim(),
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        company_name: cleanCompany,
        role: 'hr'
      }
    })

    if (authError) {
      // If user already exists in Auth, fetch user ID or continue to profile creation
      if (authError.message?.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists. Please log in instead.', alreadyRegistered: true },
          { status: 400 }
        )
      } else {
        console.error('Supabase Admin createUser error:', authError)
        return NextResponse.json(
          { success: false, error: authError.message || 'Failed to create employer authentication user.' },
          { status: 400 }
        )
      }
    } else if (authData?.user) {
      userId = authData.user.id
    }

    if (!userId) {
      userId = `hr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    }

    // 2. Insert into employers_profiles database table
    const employerProfile = {
      id: userId,
      full_name: cleanName,
      email: cleanEmail,
      company_name: cleanCompany,
      designation: cleanDesignation,
      industry: industry || 'Cybersecurity',
      company_size: companySize || '11-50',
      status: 'Verified',
      created_at: new Date().toISOString()
    }

    const { data: insertedProfile, error: dbError } = await supabaseAdmin
      .from('employers_profiles')
      .upsert([employerProfile])
      .select()

    if (dbError) {
      console.error('Supabase DB error inserting into employers_profiles:', dbError)
      return NextResponse.json(
        { success: false, error: 'Database record insertion failed in employers_profiles.' },
        { status: 500 }
      )
    }

    const createdUser = (insertedProfile && insertedProfile[0]) ? insertedProfile[0] : employerProfile

    return NextResponse.json({
      success: true,
      user: createdUser
    })
  } catch (err) {
    console.error('Exception in HR Signup API route:', err)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error during employer signup.' },
      { status: 500 }
    )
  }
}
