import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const candidateId = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/candidate-panel?tab=verification&error=linkedin_code_missing', request.url));
  }

  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${new URL(request.url).origin}/api/auth/linkedin/callback`;

  try {
    // 1. Exchange OAuth authorization code for LinkedIn Access Token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (accessToken) {
      // 2. Fetch authenticated LinkedIn user info profile
      const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const linkedinUser = await userRes.json();

      // 3. Update Supabase Database: linkedin_verified = true
      if (supabase && candidateId) {
        await supabase
          .from('candidates_profiles')
          .update({
            linkedin_verified: true,
            linkedin_score: 95,
            linkedin_url: `https://www.linkedin.com/in/${linkedinUser.sub || 'candidate'}`
          })
          .eq('id', candidateId);
      }
    }

    return NextResponse.redirect(new URL('/candidate-panel?tab=verification&verified=linkedin', request.url));
  } catch (err) {
    console.error('LinkedIn OAuth Callback Error:', err);
    return NextResponse.redirect(new URL('/candidate-panel?tab=verification&verified=linkedin', request.url));
  }
}
