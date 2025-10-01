import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken } from '@/lib/csrf'
import { cookies } from 'next/headers'

/**
 * GET /api/csrf-token - Get or generate CSRF token
 *
 * This endpoint provides a CSRF token for client-side requests.
 * The token is stored in an HTTP-only cookie and returned in the response.
 *
 * Usage:
 * 1. Call this endpoint before making state-changing requests
 * 2. Include the returned token in the X-CSRF-Token header
 * 3. The server will validate the token against the cookie
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Check if token already exists
    let token = cookieStore.get('csrf-token')?.value

    // Generate new token if none exists
    if (!token) {
      token = generateCSRFToken()
    }

    // Create response with token
    const response = NextResponse.json({
      token,
      message: 'CSRF token generated successfully',
    })

    // Set cookie in response
    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error generating CSRF token:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}

