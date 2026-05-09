import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Basic in-memory store for rate limiting. 
 * Note: In a Vercel Edge environment, this resets per edge node, but it still 
 * provides excellent basic protection against brute force and spam bots.
 * For enterprise-level global rate limiting, replace this with @upstash/ratelimit.
 */
const ipRequestCache = new Map<string, { count: number; timestamp: number }>();

// --- Rate Limit Configuration ---
const RATE_LIMIT_WINDOW_MS = 1 * 60 * 60 * 1000; // 1 hour window
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 requests per hour per IP for sensitive routes

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // We only want to aggressively rate-limit sensitive endpoints.
  // We don't want to rate-limit a user just browsing the homepage.
  const isSensitiveRoute =
    path.includes('login') ||
    path.includes('register') ||
    path.includes('subscribe') ||
    path.includes('contact');

  if (isSensitiveRoute) {
    // Attempt to get the user's IP address. 
    // This works automatically on Vercel or when behind a proxy.
    const ip = request.ip ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      'unknown-ip';
               
    if (ip !== 'unknown-ip') {
      const now = Date.now();
      const ipData = ipRequestCache.get(ip);
      
      if (!ipData) {
        // First request from this IP
        ipRequestCache.set(ip, { count: 1, timestamp: now });
      } else {
        // If the 1-minute window has expired, reset the counter
        if (now - ipData.timestamp > RATE_LIMIT_WINDOW_MS) {
          ipRequestCache.set(ip, { count: 1, timestamp: now });
        } else {
          // Window is still active, increment request count
          ipData.count += 1;
          
          if (ipData.count > MAX_REQUESTS_PER_WINDOW) {
            console.warn(`[RATE LIMIT] Blocked IP: ${ip} on path: ${path}`);
            
            // Rate limit exceeded! Block the request.
            return new NextResponse(
              JSON.stringify({ 
                error: 'Too many requests', 
                message: 'You are sending too many requests. Please wait a minute and try again.' 
              }),
              { 
                status: 429, 
                headers: { 
                  'Content-Type': 'application/json',
                  'Retry-After': '60'
                } 
              }
            );
          }
        }
      }
    }
  }

  // If the request is safe, allow it to continue
  return NextResponse.next();
}

// Optimize middleware performance by only running it on necessary routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any public asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
