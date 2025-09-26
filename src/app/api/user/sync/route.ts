import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ensureUserExistsInSupabase } from '@/lib/user'

/**
 * GET /api/user/sync
 * Get current user sync status and data
 * This is useful for testing and ensuring user exists in database
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - no authenticated user' },
        { status: 401 }
      )
    }

    // Ensure user exists in Supabase database
    const supabaseUser = await ensureUserExistsInSupabase(user)
    if (!supabaseUser) {
      return NextResponse.json(
        { error: 'Failed to sync user to Supabase database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User sync status retrieved successfully',
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        firstName: supabaseUser.first_name,
        lastName: supabaseUser.last_name,
        avatarUrl: supabaseUser.avatar_url,
        createdAt: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at,
      },
      authUser: {
        id: user.id,
        email: user.email,
        emailConfirmedAt: user.email_confirmed_at,
        lastSignInAt: user.last_sign_in_at,
      },
    })
  } catch (error) {
    console.error('Error getting user sync status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/sync
 * Force refresh user data from Supabase Auth to database
 */
export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - no authenticated user' },
        { status: 401 }
      )
    }

    // Force refresh user in database
    const refreshedUser = await ensureUserExistsInSupabase(user)
    if (!refreshedUser) {
      return NextResponse.json(
        { error: 'Failed to refresh user in database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User data refreshed successfully',
      user: {
        id: refreshedUser.id,
        email: refreshedUser.email,
        firstName: refreshedUser.first_name,
        lastName: refreshedUser.last_name,
        avatarUrl: refreshedUser.avatar_url,
        createdAt: refreshedUser.created_at,
        updatedAt: refreshedUser.updated_at,
      },
    })
  } catch (error) {
    console.error('Error refreshing user data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
