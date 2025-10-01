/**
 * API Validation Schemas
 * 
 * This file contains Zod schemas for validating API request bodies.
 * Each schema corresponds to a specific API endpoint and defines
 * the expected structure and validation rules for request data.
 */

import { z } from 'zod'

// ============================================
// TRANSACTION SCHEMAS
// ============================================

/**
 * Schema for creating a new transaction
 */
export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'Transaction type is required',
    invalid_type_error: 'Transaction type must be either "income" or "expense"',
  }),
  amount: z.union([z.number(), z.string()]).pipe(
    z.coerce.number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    }).positive('Amount must be positive')
  ),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  category_id: z.string({
    required_error: 'Category ID is required',
  }).uuid('Category ID must be a valid UUID').optional().nullable(),
  date: z.string({
    required_error: 'Date is required',
  }),
})

/**
 * Schema for updating an existing transaction
 */
export const updateTransactionSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  amount: z.union([z.number(), z.string()]).pipe(
    z.coerce.number().positive('Amount must be positive')
  ).optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  category_id: z.string().uuid('Category ID must be a valid UUID').optional().nullable(),
  date: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// ============================================
// CATEGORY SCHEMAS
// ============================================

/**
 * Schema for creating a new category
 */
export const createCategorySchema = z.object({
  name: z.string({
    required_error: 'Category name is required',
  }).min(1, 'Category name cannot be empty').max(100, 'Category name must be less than 100 characters'),
  type: z.enum(['income', 'expense'], {
    required_error: 'Category type is required',
    invalid_type_error: 'Category type must be either "income" or "expense"',
  }),
  color: z.string({
    required_error: 'Color is required',
  }).regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF5733)'),
  icon: z.string().optional(),
})

/**
 * Schema for updating an existing category
 */
export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name cannot be empty').max(100, 'Category name must be less than 100 characters').optional(),
  type: z.enum(['income', 'expense']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF5733)').optional(),
  icon: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// ============================================
// BUDGET SCHEMAS
// ============================================

/**
 * Schema for creating a new budget
 */
export const createBudgetSchema = z.object({
  category_id: z.string({
    required_error: 'Category ID is required',
  }).uuid('Category ID must be a valid UUID'),
  amount: z.number({
    required_error: 'Budget amount is required',
    invalid_type_error: 'Budget amount must be a number',
  }).positive('Budget amount must be positive'),
  period: z.enum(['weekly', 'monthly', 'yearly'], {
    required_error: 'Budget period is required',
    invalid_type_error: 'Budget period must be "weekly", "monthly", or "yearly"',
  }),
})

/**
 * Schema for updating an existing budget
 */
export const updateBudgetSchema = z.object({
  category_id: z.string().uuid('Category ID must be a valid UUID').optional(),
  amount: z.number().positive('Budget amount must be positive').optional(),
  period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// ============================================
// CHATBOT SCHEMAS
// ============================================

/**
 * Schema for chatbot message request
 */
export const chatbotMessageSchema = z.object({
  message: z.string({
    required_error: 'Message is required',
  }).min(1, 'Message cannot be empty').max(2000, 'Message must be less than 2000 characters'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
})

// ============================================
// TRASH SCHEMAS
// ============================================

/**
 * Schema for restoring an item from trash
 */
export const restoreItemSchema = z.object({
  item_type: z.enum(['transaction', 'category', 'budget'], {
    required_error: 'Item type is required',
    invalid_type_error: 'Item type must be "transaction", "category", or "budget"',
  }),
})

/**
 * Schema for permanently deleting an item
 */
export const permanentDeleteSchema = z.object({
  item_type: z.enum(['transaction', 'category', 'budget'], {
    required_error: 'Item type is required',
    invalid_type_error: 'Item type must be "transaction", "category", or "budget"',
  }),
})

// ============================================
// INSIGHTS SCHEMAS
// ============================================

/**
 * Schema for insights request
 */
export const insightsRequestSchema = z.object({
  period: z.enum(['weekly', 'monthly', 'yearly'], {
    required_error: 'Period is required',
    invalid_type_error: 'Period must be "weekly", "monthly", or "yearly"',
  }),
})

// ============================================
// REPORTS SCHEMAS
// ============================================

/**
 * Schema for reports request
 */
export const reportsRequestSchema = z.object({
  startDate: z.string({
    required_error: 'Start date is required',
  }).datetime('Start date must be a valid ISO 8601 datetime'),
  endDate: z.string({
    required_error: 'End date is required',
  }).datetime('End date must be a valid ISO 8601 datetime'),
  type: z.enum(['income', 'expense', 'all']).optional().default('all'),
}).refine(data => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return start < end
}, {
  message: 'Start date must be before end date',
})

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type ChatbotMessageInput = z.infer<typeof chatbotMessageSchema>
export type RestoreItemInput = z.infer<typeof restoreItemSchema>
export type PermanentDeleteInput = z.infer<typeof permanentDeleteSchema>
export type InsightsRequestInput = z.infer<typeof insightsRequestSchema>
export type ReportsRequestInput = z.infer<typeof reportsRequestSchema>

