import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Rate Limiter Configuration
 * 
 * Uses Upstash Redis for distributed rate limiting across serverless functions.
 * 
 * Configuration:
 * - Sliding window: 10 requests per 10 seconds per IP
 * - Analytics enabled for monitoring
 * - Ephemeral cache for performance
 */

// Initialize Redis client from environment variables
// Required env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
const redis = Redis.fromEnv()

/**
 * Create rate limiter instance
 * 
 * Sliding Window Algorithm:
 * - More accurate than fixed window
 * - Prevents burst attacks at window boundaries
 * - Smooths out request distribution
 */
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true, // Enable analytics for monitoring
  prefix: '@finance-tracker/ratelimit', // Namespace for Redis keys
})

/**
 * Rate limit configuration for different endpoints
 * 
 * You can create different rate limiters for different endpoints:
 * - Stricter limits for auth endpoints
 * - More lenient limits for read-only endpoints
 */

// Stricter rate limit for authentication endpoints (5 requests per minute)
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: '@finance-tracker/ratelimit/auth',
})

// More lenient rate limit for read-only endpoints (30 requests per 10 seconds)
export const readRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '10 s'),
  analytics: true,
  prefix: '@finance-tracker/ratelimit/read',
})

/**
 * Helper function to get client IP address
 * 
 * Checks multiple headers in order of preference:
 * 1. x-forwarded-for (most common, set by proxies)
 * 2. x-real-ip (set by some proxies)
 * 3. request.ip (direct connection)
 * 4. Fallback to localhost
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to localhost (for development)
  return '127.0.0.1'
}

/**
 * Rate limit response headers
 * 
 * Standard rate limit headers for client information:
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Requests remaining in current window
 * - X-RateLimit-Reset: Unix timestamp when the limit resets
 */
export function getRateLimitHeaders(result: {
  success: boolean
  limit: number
  remaining: number
  reset: number
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}

/**
 * Example usage in API route:
 * 
 * ```typescript
 * import { ratelimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit'
 * import { NextRequest, NextResponse } from 'next/server'
 * 
 * export async function POST(request: NextRequest) {
 *   // Get client IP
 *   const ip = getClientIp(request)
 *   
 *   // Check rate limit
 *   const { success, limit, remaining, reset, pending } = await ratelimit.limit(ip)
 *   
 *   // Return 429 if rate limit exceeded
 *   if (!success) {
 *     return NextResponse.json(
 *       { error: 'Too many requests. Please try again later.' },
 *       { 
 *         status: 429,
 *         headers: getRateLimitHeaders({ success, limit, remaining, reset })
 *       }
 *     )
 *   }
 *   
 *   // Continue with normal request handling
 *   // ...
 * }
 * ```
 */

