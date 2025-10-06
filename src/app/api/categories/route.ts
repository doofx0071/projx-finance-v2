import { NextRequest } from 'next/server'
import { categorySchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { sanitizeCategoryName, sanitizeStrict } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import {
  authenticateApiRequest,
  applyRateLimit,
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-helpers'

// GET /api/categories - List all categories for the authenticated user
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'read')
    const { supabase, user } = await authenticateApiRequest()

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'income' | 'expense'

    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('name')

    // Apply filters
    if (type && ['income', 'expense'].includes(type)) {
      query = query.eq('type', type)
    }

    const { data: categories, error } = await query

    if (error) {
      logger.error({ error, userId: user.id }, 'Error fetching categories')
      return createErrorResponse('Failed to fetch categories', 500)
    }

    return createSuccessResponse({ categories: categories || [] })
  })
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'default')
    const { supabase, user } = await authenticateApiRequest()

    const body = await request.json()

    // Validate request body with Zod
    try {
      const validatedData = categorySchema.parse(body)

      // Sanitize inputs
      const sanitizedName = sanitizeCategoryName(validatedData.name)
      const sanitizedIcon = validatedData.icon ? sanitizeStrict(validatedData.icon) : null
      const sanitizedColor = validatedData.color ? sanitizeStrict(validatedData.color) : null

      // Check if category name already exists for this user
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', sanitizedName)
        .single()

      if (existingCategory) {
        return createErrorResponse('Category with this name already exists', 400)
      }

      // Create category
      const { data: category, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: sanitizedName,
          color: sanitizedColor,
          icon: sanitizedIcon,
          type: validatedData.type,
        })
        .select()
        .single()

      if (error) {
        logger.error({ error, userId: user.id }, 'Error creating category')
        return createErrorResponse('Failed to create category', 500)
      }

      return createSuccessResponse({ category }, 201)
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        return createErrorResponse('Validation failed', 400, { errors: formattedErrors })
      }
      throw error
    }
  })
}