/**
 * Centralized routing configuration for Phinancia
 * All application routes should be defined here for consistency
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/signin',
  SIGNUP: '/signup',

  // Protected routes
  DASHBOARD: '/dashboard',

  // API routes
  API: {
    BASE: '/api',
    // Add specific API routes as needed
  },

  // External links (for reference)
  EXTERNAL: {
    CLERK_DOCS: 'https://clerk.com/docs',
    SUPABASE_DOCS: 'https://supabase.com/docs',
    STRIPE_DOCS: 'https://stripe.com/docs',
  },
} as const

/**
 * Route helpers for common navigation patterns
 */
export const ROUTE_HELPERS = {
  // Auth flow
  getSignUpUrl: () => ROUTES.SIGNUP,
  getLoginUrl: () => ROUTES.LOGIN,
  getDashboardUrl: () => ROUTES.DASHBOARD,

  // Redirect URLs for Clerk
  getClerkRedirectUrl: () => ROUTES.DASHBOARD,
  getClerkSignUpUrl: () => ROUTES.SIGNUP,
  getClerkSignInUrl: () => ROUTES.LOGIN,
} as const

/**
 * Route validation helpers
 */
export const ROUTE_VALIDATORS = {
  isAuthRoute: (pathname: string) =>
    pathname.startsWith(ROUTES.LOGIN) || pathname.startsWith(ROUTES.SIGNUP),

  isProtectedRoute: (pathname: string) =>
    pathname.startsWith(ROUTES.DASHBOARD) || pathname.startsWith(ROUTES.API.BASE),

  isPublicRoute: (pathname: string) =>
    pathname === ROUTES.HOME || ROUTE_VALIDATORS.isAuthRoute(pathname),
} as const

export type RouteKeys = keyof typeof ROUTES
export type ApiRouteKeys = keyof typeof ROUTES.API