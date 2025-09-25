import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// Types for our database schema
export interface User {
  id: string // Clerk user ID
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string | null
  icon: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  description: string | null
  type: 'income' | 'expense'
  date: string
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string | null
  created_at: string
}

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

// Public client for client-side operations
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Server-side client that respects RLS and uses Clerk authentication
export async function createSupabaseServerClient() {
  const { userId } = await auth()
  
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          // Pass Clerk user ID for RLS policies
          'x-user-id': userId || '',
        },
      },
    }
  )
}

// Helper function to get current user from Supabase
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

// Helper function to ensure user exists in Supabase
export async function ensureUserExists(clerkUser: {
  id: string
  emailAddresses: Array<{ emailAddress: string }>
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
}): Promise<User | null> {
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', clerkUser.id)
    .single()

  if (existingUser) {
    return existingUser
  }

  // Create new user
  const { data, error } = await supabaseAdmin
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
    console.error('Error creating user:', error)
    return null
  }

  return data
}
