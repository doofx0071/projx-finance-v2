import { NextRequest } from 'next/server'
import { updateCategorySchema } from '@/lib/validations'
import type { Category } from '@/types'
import { sanitizeCategoryName, sanitizeStrict } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import {
  authenticateApiRequest,
  applyRateLimit,
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-helpers'

// GET /api/categories/[id] - Get a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'read')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Category not found', 404)
      }
      logger.error({ error, categoryId: resolvedParams.id }, 'Error fetching category')
      return createErrorResponse('Failed to fetch category', 500)
    }

    return createSuccessResponse({ data: { category } })
  })
}

// PUT /api/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'default')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    const body = await request.json()
    const { name, color, icon, type } = body

    // Sanitize inputs
    const sanitizedName = name ? sanitizeCategoryName(name) : undefined
    const sanitizedIcon = icon ? sanitizeStrict(icon) : undefined
    const sanitizedColor = color ? sanitizeStrict(color) : undefined

    // Validate type if provided
    if (type && !['income', 'expense'].includes(type)) {
      return createErrorResponse('Type must be either "income" or "expense"', 400)
    }

    // Check if another category with the same name exists (excluding current)
    if (sanitizedName) {
      const { data: existingCategory, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', sanitizedName)
        .neq('id', resolvedParams.id)
        .single()

      if (existingCategory) {
        return createErrorResponse('Category with this name already exists', 400)
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (sanitizedName !== undefined) updateData.name = sanitizedName
    if (sanitizedColor !== undefined) updateData.color = sanitizedColor || null
    if (sanitizedIcon !== undefined) updateData.icon = sanitizedIcon || null
    if (type) updateData.type = type

    // Update category
    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Category not found', 404)
      }
      logger.error({ error, categoryId: resolvedParams.id }, 'Error updating category')
      return createErrorResponse('Failed to update category', 500)
    }

    return createSuccessResponse({ data: { category } })
  })
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'default')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    // Check if category is being used by any active transactions
    const { data: transactions, error: checkError } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', resolvedParams.id)
      .limit(1)

    if (checkError) {
      logger.error({ error: checkError, categoryId: resolvedParams.id }, 'Error checking category usage')
      return createErrorResponse('Failed to check category usage', 500)
    }

    if (transactions && transactions.length > 0) {
      return createErrorResponse('Cannot delete category that is being used by transactions', 400)
    }

    // 1. Get the full category record before deletion
    const { data: category, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !category) {
      logger.error({ error: fetchError, categoryId: resolvedParams.id }, 'Error fetching category for deletion')
      return createErrorResponse('Category not found', 404)
    }

    // 2. Save to deleted_items table for restore functionality
    const { error: logError } = await supabase
      .from('deleted_items')
      .insert({
        table_name: 'categories',
        record_id: resolvedParams.id,
        user_id: user.id,
        record_data: category,
        deleted_at: new Date().toISOString()
      })

    if (logError) {
      logger.error({ error: logError, categoryId: resolvedParams.id }, 'Error logging deleted category')
      return createErrorResponse('Failed to log deleted category', 500)
    }

    // 3. Permanently delete category from categories table
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (error) {
      logger.error({ error, categoryId: resolvedParams.id }, 'Error deleting category')
      return createErrorResponse('Failed to delete category', 500)
    }

    return createSuccessResponse({ success: true })
  })
}