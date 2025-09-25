import { clerkMiddleware } from '@clerk/nextjs/server'
import { ROUTES } from '@/lib/routes'

export default clerkMiddleware((auth, req) => {
  // Protect dashboard and API routes
  if (req.nextUrl.pathname.startsWith(ROUTES.DASHBOARD) ||
      req.nextUrl.pathname.startsWith(ROUTES.API.BASE)) {
    auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}