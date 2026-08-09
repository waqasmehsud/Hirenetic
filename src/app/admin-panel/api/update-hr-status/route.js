import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { hrId, status } = await req.json();

    if (!hrId || !status) {
      return NextResponse.json({ error: 'Missing hrId or status' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Missing Supabase URL' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { error } = await supabaseAdmin
      .from('employers_profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', hrId);

    if (error) {
      console.error('Error updating employer profile status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Recruiter status updated to ${status}`
    });
  } catch (err) {
    console.error('Exception in update-hr-status API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
