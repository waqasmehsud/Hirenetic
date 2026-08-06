import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseAdmin = createClient(supabaseUrl, serviceKey)

function safeErrorText(err, fallback = 'Failed to process candidate registration.') {
  if (!err) return fallback
  if (typeof err === 'string') {
    const t = err.trim()
    if (t && t !== '{}' && t !== '[]' && t !== '[object Object]') return t
    return fallback
  }
  if (typeof err === 'object') {
    if (err.message && typeof err.message === 'string' && err.message !== '{}') return err.message.trim()
    if (err.error && typeof err.error === 'string' && err.error !== '{}') return err.error.trim()
    if (err.error_description && typeof err.error_description === 'string') return err.error_description.trim()
    if (err.msg && typeof err.msg === 'string' && err.msg !== '{}') return err.msg.trim()
  }
  return fallback
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password, fullName } = body

    if (!email || !password || !fullName) {
      return Response.json({ error: 'Missing required fields: email, password, or full name' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = fullName.trim()
    const cleanPassword = password.trim()

    // 1. Check if user already exists in auth.users list
    let existingUser = null
    try {
      const { data: usersResult } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
      const usersList = usersResult?.users || []
      existingUser = usersList.find(u => u.email?.toLowerCase() === cleanEmail)
    } catch (lErr) {
      console.warn('Error listing users from Supabase admin:', lErr)
    }

    if (existingUser) {
      // Update password & metadata for existing user so they can log in seamlessly
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: cleanPassword,
        user_metadata: {
          full_name: cleanName,
          role: 'candidate'
        }
      }).catch(() => {})

      // Upsert profile in public.candidates_profiles
      const profilePayload = {
        id: existingUser.id,
        email: cleanEmail,
        full_name: cleanName,
        updated_at: new Date().toISOString()
      }

      const { data: profileData } = await supabaseAdmin
        .from('candidates_profiles')
        .upsert(profilePayload, { onConflict: 'id' })
        .select('*')
        .single()

      return Response.json({
        success: true,
        user: profileData || profilePayload,
        updatedExisting: true
      })
    }

    // 2. Attempt to Create New Candidate User in auth.users
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPassword,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        role: 'candidate'
      }
    })

    if (createError) {
      console.error('Supabase createUser error:', createError)
      const rawMsg = safeErrorText(createError, '')
      if (rawMsg.toLowerCase().includes('already registered') || rawMsg.toLowerCase().includes('already exists')) {
        return Response.json({
          error: 'This email is already registered. Please click Sign In below to log in.',
          alreadyRegistered: true
        }, { status: 400 })
      }
      if (rawMsg.toLowerCase().includes('database error') || rawMsg === '{}' || !rawMsg) {
        return Response.json({
          error: 'Supabase Database Notice: A trigger on auth.users is blocking user creation. Please run SQL_SCHEMA/fix_supabase_triggers.sql in your Supabase SQL Editor. If you already have an account, click Sign In below.',
          alreadyRegistered: true
        }, { status: 400 })
      }
      return Response.json({ error: rawMsg }, { status: 400 })
    }

    const userId = createData?.user?.id
    if (!userId) {
      return Response.json({ error: 'Failed to retrieve created user ID from Supabase.' }, { status: 500 })
    }

    // 3. Upsert Profile Row into public.candidates_profiles Table
    const profilePayload = {
      id: userId,
      email: cleanEmail,
      full_name: cleanName,
      updated_at: new Date().toISOString()
    }

    const { data: profileData, error: dbError } = await supabaseAdmin
      .from('candidates_profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select('*')
      .single()

    if (dbError) {
      console.error('candidates_profiles DB insert error:', dbError)
    }

    return Response.json({
      success: true,
      user: profileData || profilePayload
    })
  } catch (err) {
    console.error('API candidate signup route error:', err)
    return Response.json({ error: safeErrorText(err, 'Server error creating candidate account.') }, { status: 500 })
  }
}
