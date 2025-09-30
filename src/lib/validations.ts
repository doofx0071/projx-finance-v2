import { z } from 'zod'

/**
 * Transaction Validation Schemas
 */

export const transactionSchema = z.object({
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .max(999999999.99, 'Amount is too large'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be 200 characters or less')
    .optional()
    .or(z.literal('')),
  type: z.enum(['income', 'expense'], {
    required_error: 'Type is required',
    invalid_type_error: 'Type must be either "income" or "expense"',
  }),
  date: z
    .string({
      required_error: 'Date is required',
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date)
      return !isNaN(parsed.getTime())
    }, 'Invalid date'),
  category_id: z
    .string()
    .uuid('Invalid category ID')
    .optional()
    .nullable(),
})

export const updateTransactionSchema = transactionSchema.partial().extend({
  id: z.string().uuid('Invalid transaction ID'),
})

export const deleteTransactionSchema = z.object({
  id: z.string().uuid('Invalid transaction ID'),
})

/**
 * Category Validation Schemas
 */

export const categorySchema = z.object({
  name: z
    .string({
      required_error: 'Category name is required',
    })
    .min(1, 'Category name is required')
    .max(50, 'Category name must be 50 characters or less')
    .trim(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color (e.g., #FF5733)')
    .optional()
    .nullable(),
  icon: z
    .string()
    .max(50, 'Icon name must be 50 characters or less')
    .optional()
    .nullable(),
  type: z.enum(['income', 'expense'], {
    required_error: 'Type is required',
    invalid_type_error: 'Type must be either "income" or "expense"',
  }),
})

export const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().uuid('Invalid category ID'),
})

export const deleteCategorySchema = z.object({
  id: z.string().uuid('Invalid category ID'),
})

/**
 * Budget Validation Schemas
 */

const baseBudgetSchema = z.object({
  category_id: z
    .string({
      required_error: 'Category is required',
    })
    .uuid('Invalid category ID')
    .nullable(),
  amount: z
    .number({
      required_error: 'Budget amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .max(999999999.99, 'Amount is too large'),
  period: z.enum(['weekly', 'monthly', 'yearly'], {
    required_error: 'Period is required',
    invalid_type_error: 'Period must be "weekly", "monthly", or "yearly"',
  }),
  start_date: z
    .string({
      required_error: 'Start date is required',
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date)
      return !isNaN(parsed.getTime())
    }, 'Invalid start date'),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date)
      return !isNaN(parsed.getTime())
    }, 'Invalid end date')
    .optional()
    .nullable(),
})

export const budgetSchema = baseBudgetSchema.refine(
  (data) => {
    if (data.end_date) {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      return end >= start
    }
    return true
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['end_date'],
  }
)

export const updateBudgetSchema = baseBudgetSchema.partial().extend({
  id: z.string().uuid('Invalid budget ID'),
})

export const deleteBudgetSchema = z.object({
  id: z.string().uuid('Invalid budget ID'),
})

/**
 * User Profile Validation Schemas
 */

export const userProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .trim()
    .optional()
    .nullable(),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .trim()
    .optional()
    .nullable(),
  avatar_url: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .nullable(),
})

/**
 * Authentication Validation Schemas
 */

export const signInSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters'),
})

export const signUpSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string({
    required_error: 'Please confirm your password',
  }),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .trim()
    .optional(),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const otpSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address'),
  token: z
    .string({
      required_error: 'OTP code is required',
    })
    .length(6, 'OTP code must be 6 digits')
    .regex(/^\d{6}$/, 'OTP code must contain only numbers'),
})

/**
 * Query Parameter Validation Schemas
 */

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
})

const baseDateRangeSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
})

export const dateRangeSchema = baseDateRangeSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return end >= start
    }
    return true
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
)

export const transactionFilterSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category_id: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  ...baseDateRangeSchema.shape,
  ...paginationSchema.shape,
})

/**
 * Type Exports
 */

export type TransactionInput = z.infer<typeof transactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type DeleteTransactionInput = z.infer<typeof deleteTransactionSchema>

export type CategoryInput = z.infer<typeof categorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>

export type BudgetInput = z.infer<typeof budgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type DeleteBudgetInput = z.infer<typeof deleteBudgetSchema>

export type UserProfileInput = z.infer<typeof userProfileSchema>

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type OtpInput = z.infer<typeof otpSchema>

export type PaginationInput = z.infer<typeof paginationSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>

