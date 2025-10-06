/**
 * API Helper Functions
 * 
 * Reusable utilities for API routes to reduce code duplication.
 * Provides standardized patterns for:
 * - Supabase client creation
 * - User authentication
 * - Rate limiting
 * - Error responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ratelimit, readRatelimit, authRatelimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Rate limit types for different API operations
 */
export type RateLimitType = 'default' | 'read' | 'auth'

/**
 * Result of rate limit check
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  pending?: Promise<unknown>
}

/**
 * Result of API authentication
 */
export interface ApiAuthResult {
  supabase: SupabaseClient
  user: {
    id: string
    email?: string
    [key: string]: any
  }
}

/**
 * Create a Supabase client for API routes with SSR cookie handling
 * 
 * @returns Configured Supabase client
 * 
 * @example
 * const supabase = await createApiSupabaseClient()
 * const { data, error } = await supabase.from('transactions').select('*')
 */
export async function createApiSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookie setting can fail in middleware or server components
            // This is expected and can be safely ignored
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Cookie removal can fail in middleware or server components
            // This is expected and can be safely ignored
          }
        },
      },
    }
  )

  return supabase
}

/**
 * Get authenticated user from Supabase client
 * 
 * @param supabase - Supabase client instance
 * @returns User object if authenticated
 * @throws NextResponse with 401 if not authenticated
 * 
 * @example
 * const supabase = await createApiSupabaseClient()
 * const user = await getAuthenticatedApiUser(supabase)
 * // user is guaranteed to exist here
 */
export async function getAuthenticatedApiUser(supabase: SupabaseClient) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    logger.error({ error: authError }, 'Authentication error in API route')
    throw NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }

  if (!user) {
    logger.warn('Unauthenticated API request')
    throw NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return user
}

/**
 * Combined helper: Create Supabase client and get authenticated user
 * 
 * @returns Object containing supabase client and authenticated user
 * @throws NextResponse with 401 if not authenticated
 * 
 * @example
 * const { supabase, user } = await authenticateApiRequest()
 * const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id)
 */
export async function authenticateApiRequest(): Promise<ApiAuthResult> {
  const supabase = await createApiSupabaseClient()
  const user = await getAuthenticatedApiUser(supabase)
  
  return { supabase, user }
}

/**
 * Apply rate limiting to an API request
 * 
 * @param request - Next.js request object
 * @param type - Type of rate limit to apply ('default', 'read', or 'auth')
 * @returns Rate limit result
 * @throws NextResponse with 429 if rate limit exceeded
 * 
 * @example
 * // For read operations (more lenient)
 * await applyRateLimit(request, 'read')
 * 
 * // For write operations (default)
 * await applyRateLimit(request)
 * 
 * // For auth operations (most strict)
 * await applyRateLimit(request, 'auth')
 */
export async function applyRateLimit(
  request: NextRequest,
  type: RateLimitType = 'default'
): Promise<RateLimitResult> {
  const ip = getClientIp(request)
  
  // Select appropriate rate limiter
  const limiter = type === 'read' 
    ? readRatelimit 
    : type === 'auth' 
    ? authRatelimit 
    : ratelimit

  const result = await limiter.limit(ip)

  if (!result.success) {
    logger.warn({ ip, type, remaining: result.remaining }, 'Rate limit exceeded')
    throw NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: getRateLimitHeaders(result)
      }
    )
  }

  return result
}

/**
 * Create a standardized error response
 * 
 * @param message - Error message to return
 * @param status - HTTP status code (default: 500)
 * @param details - Optional additional error details
 * @returns NextResponse with error
 * 
 * @example
 * return createErrorResponse('Transaction not found', 404)
 * return createErrorResponse('Invalid input', 400, { field: 'amount' })
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: Record<string, any>
): NextResponse {
  const response: any = { error: message }
  
  if (details) {
    response.details = details
  }

  logger.error({ message, status, details }, 'API error response')

  return NextResponse.json(response, { status })
}

/**
 * Create a standardized success response
 * 
 * @param data - Data to return
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with data
 * 
 * @example
 * return createSuccessResponse({ transaction: newTransaction }, 201)
 * return createSuccessResponse({ transactions: list })
 */
export function createSuccessResponse(
  data: Record<string, any>,
  status: number = 200
): NextResponse {
  return NextResponse.json({ data }, { status })
}

/**
 * Wrap an API handler with standard error handling
 * 
 * @param handler - Async function that handles the API logic
 * @returns NextResponse
 * 
 * @example
 * export async function GET(request: NextRequest) {
 *   return withErrorHandling(async () => {
 *     const { supabase, user } = await authenticateApiRequest()
 *     await applyRateLimit(request, 'read')
 *     
 *     const { data } = await supabase.from('transactions').select('*')
 *     return createSuccessResponse({ transactions: data })
 *   })
 * }
 */
export async function withErrorHandling(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler()
  } catch (error) {
    // If error is already a NextResponse (from our helper functions), return it
    if (error instanceof NextResponse) {
      return error
    }

    // Log unexpected errors
    logger.error({ error }, 'Unexpected error in API handler')

    // Return generic error response
    return createErrorResponse(
      'Internal server error',
      500,
      process.env.NODE_ENV === 'development' 
        ? { message: error instanceof Error ? error.message : 'Unknown error' }
        : undefined
    )
  }
}

/**
 * Parse and validate query parameters
 * 
 * @param request - Next.js request object
 * @param params - Object defining expected parameters and their types
 * @returns Parsed parameters
 * 
 * @example
 * const { page, limit, search } = parseQueryParams(request, {
 *   page: { type: 'number', default: 1 },
 *   limit: { type: 'number', default: 10 },
 *   search: { type: 'string', optional: true }
 * })
 */
export function parseQueryParams(
  request: NextRequest,
  params: Record<string, { type: 'string' | 'number' | 'boolean', default?: any, optional?: boolean }>
): Record<string, any> {
  const searchParams = request.nextUrl.searchParams
  const result: Record<string, any> = {}

  for (const [key, config] of Object.entries(params)) {
    const value = searchParams.get(key)

    if (value === null) {
      if (config.optional) {
        result[key] = undefined
        continue
      }
      if (config.default !== undefined) {
        result[key] = config.default
        continue
      }
      throw createErrorResponse(`Missing required parameter: ${key}`, 400)
    }

    // Parse based on type
    switch (config.type) {
      case 'number':
        const num = Number(value)
        if (isNaN(num)) {
          throw createErrorResponse(`Invalid number for parameter: ${key}`, 400)
        }
        result[key] = num
        break
      case 'boolean':
        result[key] = value === 'true' || value === '1'
        break
      case 'string':
      default:
        result[key] = value
    }
  }

  return result
}

