/**
 * Supabase API Utilities
 * 
 * Helper functions for creating Supabase clients in API routes
 * with proper TypeScript types and consistent configuration.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@/types'

/**
 * Creates a Supabase server client for API routes
 * 
 * This function provides a consistent way to create Supabase clients
 * in API routes with proper cookie handling and TypeScript types.
 * 
 * @returns Supabase server client instance
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const supabase = await createSupabaseApiClient()
 *   const { data, error } = await supabase.from('transactions').select('*')
 *   // ...
 * }
 * ```
 */
export async function createSupabaseApiClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(_name: string, _value: string, _options: CookieOptions) {
          // No-op for API routes - cookies are read-only in route handlers
        },
        remove(_name: string, _options: CookieOptions) {
          // No-op for API routes - cookies are read-only in route handlers
        },
      },
    }
  )
}

/**
 * Gets the authenticated user from the Supabase client
 * 
 * @param supabase - Supabase client instance
 * @returns User object or null if not authenticated
 * 
 * @example
 * ```typescript
 * const supabase = await createSupabaseApiClient()
 * const user = await getAuthenticatedUser(supabase)
 * 
 * if (!user) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 * }
 * ```
 */
export async function getAuthenticatedUser(supabase: Awaited<ReturnType<typeof createSupabaseApiClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

