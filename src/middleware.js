import { NextResponse } from 'next/server';

// Simple in-memory rate store (resets on Edge function cold start, but sufficient for basic protection)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute

function isRateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, startTime: now };

  if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    record.count = 1;
    record.startTime = now;
  } else {
    record.count++;
  }
  
  rateLimitMap.set(ip, record);
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

/**
 * Next.js Middleware — Centralized route protection.
 * Checks for authentication headers on protected API routes.
 * Runs at the edge before route handlers execute.
 */
export function middleware(request) {
  // Apply rate limiting to all API routes
  if (request.nextUrl.pathname.startsWith('/api/') || 
      request.nextUrl.pathname.startsWith('/admin-panel/api/') || 
      request.nextUrl.pathname.startsWith('/hr-panel/api/') || 
      request.nextUrl.pathname.startsWith('/candidate-panel/api/') ||
      request.nextUrl.pathname === '/exposed-api') {
      
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }
  }

  const { pathname, searchParams } = request.nextUrl;

  // --- Admin Panel API Routes: require auth ---
  if (pathname.startsWith('/admin-panel/api/')) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required for admin API access' },
        { status: 401 }
      );
    }
  }

  // --- HR Panel API Routes: require auth (except signup and OTP) ---
  if (pathname.startsWith('/hr-panel/api/')) {
    const isPublicHrRoute =
      pathname === '/hr-panel/api/signup' ||
      pathname === '/hr-panel/api/send-email-otp';

    if (!isPublicHrRoute) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authentication required for HR API access' },
          { status: 401 }
        );
      }
    }
  }

  // --- Exposed API: Remove public_widget auth bypass ---
  if (pathname === '/exposed-api') {
    const isPublicWidget = searchParams.get('public_widget') === 'true';
    const hasApiKey = request.headers.get('x-api-key') || request.headers.get('authorization') || searchParams.get('api_key');
    if (isPublicWidget && !hasApiKey) {
      return NextResponse.json(
        { error: 'Authentication required: public_widget access requires API key' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin-panel/api/:path*',
    '/hr-panel/api/:path*',
    '/exposed-api',
  ],
};
