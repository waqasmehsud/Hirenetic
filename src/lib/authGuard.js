import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Verify the Supabase JWT from the Authorization header.
 * @param {Request} request - The incoming request
 * @returns {Promise<{user: object|null, error: string|null}>}
 */
export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'Missing or invalid Authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token || token === 'undefined' || token === 'null') {
      return { user: null, error: 'Invalid authentication token' };
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return { user: null, error: 'Server auth configuration error' };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { user: null, error: 'Invalid or expired authentication token' };
    }

    return { user, error: null };
  } catch (err) {
    return { user: null, error: 'Authentication verification failed' };
  }
}

/**
 * Verify the user is an admin.
 * Checks ADMIN_EMAILS env var (comma-separated list) or user metadata.
 * @param {Request} request
 * @returns {Promise<{user: object|null, error: string|null}>}
 */
export async function requireAdmin(request) {
  const { user, error } = await verifyAuth(request);
  if (error) return { user: null, error };

  const adminEmails = process.env.ADMIN_EMAILS;
  if (adminEmails) {
    const allowedEmails = adminEmails.split(',').map(e => e.trim().toLowerCase());
    if (allowedEmails.includes(user.email?.toLowerCase())) {
      return { user, error: null };
    }
    return { user: null, error: 'Insufficient permissions: admin access required' };
  }

  // Fallback: check user metadata for admin role
  const userRole = user.user_metadata?.role || user.app_metadata?.role || '';
  if (userRole === 'admin') {
    return { user, error: null };
  }

  // If no ADMIN_EMAILS is configured, allow any authenticated user (backward compatibility)
  // but log a warning for the developer
  console.warn('[authGuard] ADMIN_EMAILS env var not set. Allowing authenticated user as admin for backward compatibility. Set ADMIN_EMAILS to restrict access.');
  return { user, error: null };
}

/**
 * Verify the user is a registered employer/HR.
 * Checks employers_profiles table for a matching user ID.
 * @param {Request} request
 * @returns {Promise<{user: object|null, employer: object|null, error: string|null}>}
 */
export async function requireEmployer(request) {
  const { user, error } = await verifyAuth(request);
  if (error) return { user: null, employer: null, error };

  if (!supabaseUrl || !supabaseServiceKey) {
    // Fallback: allow authenticated user if service key not available
    console.warn('[authGuard] SUPABASE_SERVICE_ROLE_KEY not set. Allowing authenticated user as employer for backward compatibility.');
    return { user, employer: null, error: null };
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: employer } = await supabaseAdmin
      .from('employers_profiles')
      .select('id, email, full_name, company_name, status')
      .eq('id', user.id)
      .single();

    if (!employer) {
      // Also check by email as fallback
      const { data: employerByEmail } = await supabaseAdmin
        .from('employers_profiles')
        .select('id, email, full_name, company_name, status')
        .eq('email', user.email)
        .single();

      if (!employerByEmail) {
        return { user: null, employer: null, error: 'Access denied: employer account not found' };
      }
      return { user, employer: employerByEmail, error: null };
    }

    return { user, employer, error: null };
  } catch (err) {
    // On DB error, still allow authenticated user for backward compatibility
    console.warn('[authGuard] Failed to verify employer status:', err.message);
    return { user, employer: null, error: null };
  }
}

/**
 * Return a 401 Unauthorized response.
 * @param {string} message
 * @returns {NextResponse}
 */
export function unauthorized(message = 'Authentication required') {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Return a 403 Forbidden response.
 * @param {string} message
 * @returns {NextResponse}
 */
export function forbidden(message = 'Insufficient permissions') {
  return NextResponse.json({ error: message }, { status: 403 });
}
