import { getCurrentUser, ensureUserExistsInSupabase, type User } from './supabase'

// Re-export functions from supabase.ts for backward compatibility
export { getCurrentUser as getCurrentUserFromDB }
export { ensureUserExistsInSupabase }
export type { User }

/**
 * Get user's full name
 */
export function getUserFullName(user: User): string {
  const firstName = user.first_name || ''
  const lastName = user.last_name || ''
  return `${firstName} ${lastName}`.trim() || 'User'
}

/**
 * Get user's initials for avatar
 */
export function getUserInitials(user: User): string {
  const firstName = user.first_name || ''
  const lastName = user.last_name || ''
  const firstInitial = firstName.charAt(0).toUpperCase()
  const lastInitial = lastName.charAt(0).toUpperCase()
  return `${firstInitial}${lastInitial}` || 'U'
}
