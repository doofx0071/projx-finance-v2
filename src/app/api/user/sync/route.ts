import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { ensureUserExistsInSupabase, getCurrentUserFromDB } from '@/lib/user'

/**
 * GET /api/user/sync
 * Manually sync current user from Clerk to Supabase
 * This is useful for testing and ensuring user exists in database
 */
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - no user ID' },
        { status: 401 }
      )
    }

    // Get current user from Clerk
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found in Clerk' },
        { status: 404 }
      )
    }

    // Ensure user exists in Supabase
    const supabaseUser = await ensureUserExistsInSupabase()
    if (!supabaseUser) {
      return NextResponse.json(
        { error: 'Failed to sync user to Supabase' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User synced successfully',
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        firstName: supabaseUser.first_name,
        lastName: supabaseUser.last_name,
        avatarUrl: supabaseUser.avatar_url,
        createdAt: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at,
      },
      clerkUser: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      },
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/sync
 * Force refresh user data from Clerk to Supabase
 */
export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - no user ID' },
        { status: 401 }
      )
    }

    // Get current user from Clerk
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found in Clerk' },
        { status: 404 }
      )
    }

    // Force update user in Supabase
    const { updateUserInSupabase } = await import('@/lib/user')
    const updatedUser = await updateUserInSupabase(userId, {
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      first_name: clerkUser.firstName,
      last_name: clerkUser.lastName,
      avatar_url: clerkUser.imageUrl,
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user in Supabase' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User data refreshed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        avatarUrl: updatedUser.avatar_url,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
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
