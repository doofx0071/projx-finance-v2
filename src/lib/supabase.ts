import { createClient } from '@supabase/supabase-js'
import type {
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

// For Supabase Auth, we'll use the auth.users table for authentication
// and our custom users table for additional user data

// Public client for client-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
