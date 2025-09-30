/**
 * PHPinancia Finance Tracker - TypeScript Type Definitions
 * 
 * This file contains all type definitions for the application,
 * ensuring type safety across the entire codebase.
 */

// ============================================================================
// Database Entity Types
// ============================================================================

/**
 * Transaction type enum
 */
export type TransactionType = 'income' | 'expense'

/**
 * Budget period enum
 */
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly'

/**
 * User entity from the database
 */
export interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/**
 * Category entity from the database
 */
export interface Category {
  id: string
  user_id: string
  name: string
  color: string | null
  icon: string | null
  type: TransactionType
  created_at: string
}

/**
 * Transaction entity from the database
 */
export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  description: string | null
  type: TransactionType
  date: string // YYYY-MM-DD format
  created_at: string
  updated_at: string
}

/**
 * Transaction with populated category relationship
 */
export interface TransactionWithCategory extends Transaction {
  categories: Category | null
}

/**
 * Budget entity from the database
 */
export interface Budget {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  period: BudgetPeriod
  start_date: string // YYYY-MM-DD format
  end_date: string | null // YYYY-MM-DD format
  created_at: string
}

/**
 * Budget with populated category relationship
 */
export interface BudgetWithCategory extends Budget {
  categories: Category | null
}

/**
 * Budget with spending information
 */
export interface BudgetWithSpending extends BudgetWithCategory {
  spent: number
  remaining: number
  percentage: number
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T = unknown> {
  data?: T
  message?: string
  [key: string]: unknown
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string
  details?: Array<{
    field: string
    message: string
  }>
  code?: string
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

/**
 * Dashboard metrics summary
 */
export interface DashboardMetrics {
  totalIncome: number
  totalExpenses: number
  balance: number
  transactionCount: number
}

/**
 * Monthly overview data point
 */
export interface MonthlyOverviewData {
  month: string // e.g., "Jan", "Feb"
  income: number
  expenses: number
}

/**
 * Category spending data
 */
export interface CategorySpending {
  id: string
  name: string
  total: number
  count: number
  type: TransactionType
  color?: string | null
  icon?: string | null
  category?: string
  amount?: number
  percentage?: number
}

/**
 * Spending trend data point
 */
export interface SpendingTrend {
  date: string // YYYY-MM-DD
  amount: number
  type: TransactionType
}

/**
 * Monthly trend data for charts
 */
export interface MonthlyTrend {
  month: string
  income: number
  expense: number
  net: number
}

/**
 * Financial report data
 */
export interface FinancialReport {
  period: {
    start: string
    end: string
  }
  summary: {
    totalIncome: number
    totalExpenses: number
    netSavings: number
    savingsRate: number
  }
  categoryBreakdown: CategorySpending[]
  trends: SpendingTrend[]
  topExpenses: TransactionWithCategory[]
}

// ============================================================================
// Form & Input Types
// ============================================================================

/**
 * Transaction form data
 */
export interface TransactionFormData {
  amount: number | string
  description?: string
  type: TransactionType
  date: string
  category_id?: string | null
}

/**
 * Category form data
 */
export interface CategoryFormData {
  name: string
  color?: string | null
  icon?: string | null
  type: TransactionType
}

/**
 * Budget form data
 */
export interface BudgetFormData {
  category_id: string | null
  amount: number | string
  period: BudgetPeriod
  start_date: string
  end_date?: string | null
}

/**
 * User profile form data
 */
export interface UserProfileFormData {
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
}

// ============================================================================
// Filter & Query Types
// ============================================================================

/**
 * Transaction filter options
 */
export interface TransactionFilters {
  type?: TransactionType | 'all'
  category_id?: string
  search?: string
  startDate?: string
  endDate?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

/**
 * Date range filter
 */
export interface DateRange {
  startDate: string
  endDate: string
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  limit: number
  offset?: number
}

// ============================================================================
// UI Component Types
// ============================================================================

/**
 * Chart data point
 */
export interface ChartDataPoint {
  name: string
  value: number
  color?: string
  [key: string]: string | number | undefined
}

/**
 * Table column definition
 */
export interface TableColumn<T = unknown> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean
  mode: 'create' | 'edit' | 'delete' | 'view'
  data?: unknown
}

/**
 * Toast notification
 */
export interface ToastNotification {
  id: string
  title: string
  description?: string
  variant: 'default' | 'destructive' | 'success'
  duration?: number
}

// ============================================================================
// Store Types (Zustand)
// ============================================================================

/**
 * User store state
 */
export interface UserStore {
  user: User | null
  loading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearUser: () => void
}

/**
 * Transaction store state
 */
export interface TransactionStore {
  transactions: TransactionWithCategory[]
  loading: boolean
  error: string | null
  filters: TransactionFilters
  setTransactions: (transactions: TransactionWithCategory[]) => void
  addTransaction: (transaction: TransactionWithCategory) => void
  updateTransaction: (id: string, transaction: Partial<TransactionWithCategory>) => void
  deleteTransaction: (id: string) => void
  setFilters: (filters: Partial<TransactionFilters>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Omit multiple properties
 */
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>

/**
 * Extract non-nullable properties
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

// ============================================================================
// Supabase & Cookie Types
// ============================================================================

/**
 * Cookie options for Supabase SSR
 */
export interface CookieOptions {
  name?: string
  value?: string
  domain?: string
  path?: string
  expires?: Date
  maxAge?: number
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'strict' | 'lax' | 'none' | boolean
}

