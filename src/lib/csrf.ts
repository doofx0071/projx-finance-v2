import { randomBytes, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * CSRF Protection Utility
 * 
 * Provides Cross-Site Request Forgery (CSRF) protection for API routes.
 * 
 * Features:
 * - Token generation and validation
 * - Constant-time comparison to prevent timing attacks
 * - Secure cookie storage
 * - Automatic token rotation
 * 
 * Usage:
 * 1. Generate token in GET requests or page loads
 * 2. Include token in POST/PUT/DELETE requests
 * 3. Validate token in API routes
 */

const CSRF_TOKEN_COOKIE = 'csrf-token'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const TOKEN_LENGTH = 32 // 32 bytes = 256 bits

/**
 * Generate a new CSRF token
 * 
 * @returns CSRF token string
 */
export function generateCSRFToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex')
}

/**
 * Set CSRF token in cookie
 * 
 * @param token - CSRF token to store
 */
export async function setCSRFTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  
  cookieStore.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

/**
 * Get CSRF token from cookie
 * 
 * @returns CSRF token or null if not found
 */
export async function getCSRFTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_TOKEN_COOKIE)?.value || null
}

/**
 * Get CSRF token from request header
 * 
 * @param request - Next.js request object
 * @returns CSRF token or null if not found
 */
export function getCSRFTokenFromHeader(request: NextRequest): string | null {
  return request.headers.get(CSRF_TOKEN_HEADER)
}

/**
 * Validate CSRF token using constant-time comparison
 * 
 * @param token - Token from request
 * @param storedToken - Token from cookie
 * @returns True if tokens match
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false
  }

  // Ensure both tokens are the same length
  if (token.length !== storedToken.length) {
    return false
  }

  try {
    // Use constant-time comparison to prevent timing attacks
    const tokenBuffer = Buffer.from(token, 'hex')
    const storedTokenBuffer = Buffer.from(storedToken, 'hex')
    
    return timingSafeEqual(tokenBuffer, storedTokenBuffer)
  } catch (error) {
    // If buffers are invalid, return false
    return false
  }
}

/**
 * Middleware to validate CSRF token for state-changing requests
 * 
 * @param request - Next.js request object
 * @returns NextResponse or null if validation passes
 */
export async function validateCSRFMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  // Only validate POST, PUT, DELETE, PATCH requests
  const methodsToValidate = ['POST', 'PUT', 'DELETE', 'PATCH']
  
  if (!methodsToValidate.includes(request.method)) {
    return null // Skip validation for GET, HEAD, OPTIONS
  }

  // Get token from header
  const tokenFromHeader = getCSRFTokenFromHeader(request)
  
  if (!tokenFromHeader) {
    return NextResponse.json(
      { error: 'CSRF token missing' },
      { status: 403 }
    )
  }

  // Get token from cookie
  const tokenFromCookie = await getCSRFTokenFromCookie()
  
  if (!tokenFromCookie) {
    return NextResponse.json(
      { error: 'CSRF token not found in session' },
      { status: 403 }
    )
  }

  // Validate tokens match
  if (!validateCSRFToken(tokenFromHeader, tokenFromCookie)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // Validation passed
  return null
}

/**
 * Generate and set a new CSRF token
 * 
 * @returns The generated token
 */
export async function generateAndSetCSRFToken(): Promise<string> {
  const token = generateCSRFToken()
  await setCSRFTokenCookie(token)
  return token
}

/**
 * Get or create CSRF token
 * 
 * @returns Existing or newly generated token
 */
export async function getOrCreateCSRFToken(): Promise<string> {
  const existingToken = await getCSRFTokenFromCookie()
  
  if (existingToken) {
    return existingToken
  }

  return await generateAndSetCSRFToken()
}

/**
 * Validate CSRF token from API route request
 * 
 * @param request - Next.js request object
 * @returns True if valid, false otherwise
 */
export async function validateCSRFFromRequest(request: NextRequest): Promise<boolean> {
  const tokenFromHeader = getCSRFTokenFromHeader(request)
  const tokenFromCookie = await getCSRFTokenFromCookie()

  if (!tokenFromHeader || !tokenFromCookie) {
    return false
  }

  return validateCSRFToken(tokenFromHeader, tokenFromCookie)
}

/**
 * CSRF protection response helper (for middleware)
 *
 * @param request - Next.js request object
 * @returns Error response if validation fails, null otherwise
 */
export async function csrfProtection(request: NextRequest): Promise<NextResponse | null> {
  // Skip CSRF validation for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null
  }

  // Get token from header
  const tokenFromHeader = getCSRFTokenFromHeader(request)

  if (!tokenFromHeader) {
    return NextResponse.json(
      { error: 'CSRF token missing' },
      { status: 403 }
    )
  }

  // Get token from cookie (middleware-compatible)
  const tokenFromCookie = request.cookies.get(CSRF_TOKEN_COOKIE)?.value

  if (!tokenFromCookie) {
    return NextResponse.json(
      { error: 'CSRF token not found in session' },
      { status: 403 }
    )
  }

  // Validate tokens match
  if (!validateCSRFToken(tokenFromHeader, tokenFromCookie)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // Validation passed
  return null
}

