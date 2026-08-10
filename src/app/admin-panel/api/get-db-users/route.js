import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user, error } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status: 403 })
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing environment keys' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Fetch live users from Supabase Auth (auth.users)
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 500 });
    }

    // Fetch live profiles from public.candidates_profiles
    const { data: profilesData, error: profErr } = await supabaseAdmin
      .from('candidates_profiles')
      .select('*');

    const usersMap = {};
    if (authData && authData.users) {
      authData.users.forEach(u => {
        usersMap[u.id] = u.email;
      });
    }

    const resultUsers = (profilesData || []).map(p => ({
      id: p.id,
      name: p.full_name || 'Database User',
      email: usersMap[p.id] || (p.email ? p.email : 'n/a'),
      role: p.role || 'researcher',
      cv_file_path: p.cv_file_path || null,
      resume_field: p.resume_field || null
    }));

    return NextResponse.json({ success: true, users: resultUsers });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
