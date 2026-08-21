import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ipRequestCache = new Map<
  string,
  { count: number; timestamp: number }
>();

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const sensitiveRoutes = [
    '/login',
    '/register',
    '/api/login',
    '/api/register',
  ];

  const isSensitiveRoute = sensitiveRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (!isSensitiveRoute) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown-ip';

  if (ip === 'unknown-ip') {
    return NextResponse.next();
  }

  const now = Date.now();
  const data = ipRequestCache.get(ip);

  if (!data || now - data.timestamp >= RATE_LIMIT_WINDOW_MS) {
    ipRequestCache.set(ip, {
      count: 1,
      timestamp: now,
    });

    return NextResponse.next();
  }

  data.count++;

  if (data.count > MAX_REQUESTS_PER_WINDOW) {
    console.warn(`[RATE LIMIT] ${ip} blocked on ${path}`);

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Too many attempts. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': '3600',
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/api/login',
    '/api/register',
  ],
};
