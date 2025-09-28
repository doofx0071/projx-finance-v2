import { NextRequest, NextResponse } from 'next/server'
import { ensureUserExistsInSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json()

    if (!user || !user.id || !user.email) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
    }

    const result = await ensureUserExistsInSupabase({
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata
    })

    if (!result) {
      return NextResponse.json({ error: 'Failed to sync user data' }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: result })
  } catch (error) {
    console.error('Error syncing user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}