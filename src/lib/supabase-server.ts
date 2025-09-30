import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type {
  CookieOptions,
  User,
  Category,
  Transaction,
  Budget
} from '@/types'

// Re-export types from centralized types file
export type {
  User,
  Category,
  Transaction,
  TransactionWithCategory,
  Budget,
  BudgetWithCategory,
  TransactionType,
  BudgetPeriod,
} from '@/types'

// Database schema type
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>
      }
      budgets: {
        Row: Budget
        Insert: Omit<Budget, 'id' | 'created_at'>
        Update: Partial<Omit<Budget, 'id' | 'created_at'>>
      }
    }
  }
}

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Server-side client that respects RLS and uses Supabase authentication
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Helper function to get current user from Supabase
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const { data, error: dbError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (dbError) {
    console.error('Error fetching user:', dbError)
    return null
  }

  return data
}

// Helper function to ensure user exists in Supabase (for Supabase Auth)
// This function creates a record in our custom users table when a user signs up
// and also updates the email if it has changed
export async function ensureUserExistsInSupabase(user: {
  id: string
  email?: string
  user_metadata?: {
    first_name?: string
    last_name?: string
    avatar_url?: string
  }
}): Promise<User | null> {
  // Check if user has required data
  if (!user.email) {
    console.error('User email is required')
    return null
  }

  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (fetchError) {
    console.error('Error fetching existing user:', fetchError)
    return null
  }

  if (existingUser) {
    const userData = existingUser as User
    // Check if email has changed and update if necessary
    if (userData.email !== user.email) {
      console.log('Updating user email from', userData.email, 'to', user.email)
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: user.email,
          first_name: user.user_metadata?.first_name || userData.first_name,
          last_name: user.user_metadata?.last_name || userData.last_name,
          avatar_url: user.user_metadata?.avatar_url || userData.avatar_url,
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user:', updateError)
        return userData // Return existing user even if update failed
      }

      return updatedUser as User
    }

    return userData
  }

  // Create new user
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      first_name: user.user_metadata?.first_name || null,
      last_name: user.user_metadata?.last_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    } as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return null
  }

  return data
}