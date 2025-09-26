import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const redirectTo = searchParams.get('redirect_to') || '/dashboard'

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        },
      },
    }
  )

  try {
    if (code) {
      // Handle OAuth callback
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    } else if (token && type === 'signup') {
      // Handle email verification
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
      })
      if (error) throw error

      // Redirect to success page instead of dashboard
      return NextResponse.redirect(`${origin}/auth/verify-success`)
    }

    // Redirect to the intended page
    return NextResponse.redirect(`${origin}${redirectTo}`)
  } catch (error) {
    console.error('Auth callback error:', error)
    // Redirect to sign-in with error
    return NextResponse.redirect(`${origin}/signin?error=verification_failed`)
  }
}