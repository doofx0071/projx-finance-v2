import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin, type User } from './supabase'

/**
 * Get the current user from Supabase database
 * This function ensures the user exists in Supabase and returns their data
 */
export async function getCurrentUserFromDB(): Promise<User | null> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return null
    }

    // First, try to get user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user from Supabase:', error)
      return null
    }

    // If user doesn't exist in Supabase, create them
    if (!user) {
      const clerkUser = await currentUser()
      if (!clerkUser) {
        return null
      }

      return await createUserInSupabase(clerkUser)
    }

    return user
  } catch (error) {
    console.error('Error in getCurrentUserFromDB:', error)
    return null
  }
}

/**
 * Create a user in Supabase from Clerk user data
 */
export async function createUserInSupabase(clerkUser: {
  id: string
  emailAddresses: Array<{ emailAddress: string }>
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
}): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        avatar_url: clerkUser.imageUrl,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user in Supabase:', error)
      return null
    }

    console.log('User created in Supabase:', user)
    return user
  } catch (error) {
    console.error('Error in createUserInSupabase:', error)
    return null
  }
}

/**
 * Update user data in Supabase
 */
export async function updateUserInSupabase(
  userId: string,
  updates: {
    email?: string
    first_name?: string | null
    last_name?: string | null
    avatar_url?: string | null
  }
): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user in Supabase:', error)
      return null
    }

    console.log('User updated in Supabase:', user)
    return user
  } catch (error) {
    console.error('Error in updateUserInSupabase:', error)
    return null
  }
}

/**
 * Delete user from Supabase
 */
export async function deleteUserFromSupabase(userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting user from Supabase:', error)
      return false
    }

    console.log('User deleted from Supabase:', userId)
    return true
  } catch (error) {
    console.error('Error in deleteUserFromSupabase:', error)
    return false
  }
}

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

/**
 * Check if user exists in Supabase
 */
export async function userExistsInSupabase(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if user exists:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in userExistsInSupabase:', error)
    return false
  }
}

/**
 * Ensure user exists in Supabase (create if doesn't exist)
 */
export async function ensureUserExistsInSupabase(): Promise<User | null> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return null
    }

    const existingUser = await getCurrentUserFromDB()
    if (existingUser) {
      return existingUser
    }

    return await createUserInSupabase(clerkUser)
  } catch (error) {
    console.error('Error in ensureUserExistsInSupabase:', error)
    return null
  }
}
