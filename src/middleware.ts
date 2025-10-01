import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES } from '@/lib/routes'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard and API routes
  if (request.nextUrl.pathname.startsWith(ROUTES.DASHBOARD) ||
      request.nextUrl.pathname.startsWith(ROUTES.API.BASE)) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = ROUTES.LOGIN
      return NextResponse.redirect(url)
    }
  }

  // CSRF Protection for API routes (after auth check)
  if (
    request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/api/csrf-token') &&
    user &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
  ) {
    // Get token from header
    const tokenFromHeader = request.headers.get('x-csrf-token')

    if (!tokenFromHeader) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      )
    }

    // Get token from cookie
    const tokenFromCookie = request.cookies.get('csrf-token')?.value

    if (!tokenFromCookie) {
      return NextResponse.json(
        { error: 'CSRF token not found in session' },
        { status: 403 }
      )
    }

    // Validate tokens match (simple string comparison)
    if (tokenFromHeader !== tokenFromCookie) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}