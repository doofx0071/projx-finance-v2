import { NextRequest } from 'next/server'
import { validateRequestBody, createValidationErrorResponse } from '@/lib/validation/middleware'
import { updateTransactionSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { sanitizeTransactionDescription } from '@/lib/sanitize'
import {
  authenticateApiRequest,
  applyRateLimit,
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-helpers'

// GET /api/transactions/[id] - Get a specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'read')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Transaction not found', 404)
      }
      logger.error({ error, transactionId: resolvedParams.id }, 'Error fetching transaction')
      return createErrorResponse('Failed to fetch transaction', 500)
    }

    return createSuccessResponse({ transaction })
  })
}

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'default')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    // Validate request body using Zod schema
    const validation = await validateRequestBody(request, updateTransactionSchema)

    if (!validation.success) {
      return createValidationErrorResponse(validation.error)
    }

    const { amount, description, type, date, category_id } = validation.data

    // Convert date to proper format if provided
    let dateStr: string | undefined
    if (date) {
      const dateObj = new Date(date)
      dateStr = dateObj.toISOString().split('T')[0]
    }

    // If category_id is provided, verify it belongs to the user
    if (category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .eq('user_id', user.id)
        .single()

      if (categoryError || !category) {
        return createErrorResponse('Invalid category', 400)
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (amount !== undefined) updateData.amount = amount
    if (description !== undefined) {
      // Sanitize description to prevent XSS
      updateData.description = description ? sanitizeTransactionDescription(description) : null
    }
    if (type) updateData.type = type
    if (dateStr) updateData.date = dateStr
    if (category_id !== undefined) updateData.category_id = category_id || null

    // Update transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Transaction not found', 404)
      }
      logger.error({ error, transactionId: resolvedParams.id }, 'Error updating transaction')
      return createErrorResponse('Failed to update transaction', 500)
    }

    return createSuccessResponse({ data: { transaction } })
  })
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'default')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    // 1. Get the full transaction record before deletion
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !transaction) {
      logger.error({ error: fetchError, transactionId: resolvedParams.id }, 'Error fetching transaction for deletion')
      return createErrorResponse('Transaction not found', 404)
    }

    // 2. Save to deleted_items table for restore functionality
    const { error: logError } = await supabase
      .from('deleted_items')
      .insert({
        table_name: 'transactions',
        record_id: resolvedParams.id,
        user_id: user.id,
        record_data: transaction,
        deleted_at: new Date().toISOString()
      })

    if (logError) {
      logger.error({ error: logError, transactionId: resolvedParams.id }, 'Error logging deleted transaction')
      return createErrorResponse('Failed to log deleted transaction', 500)
    }

    // 3. Permanently delete transaction from transactions table
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (error) {
      logger.error({ error, transactionId: resolvedParams.id }, 'Error deleting transaction')
      return createErrorResponse('Failed to delete transaction', 500)
    }

    return createSuccessResponse({ success: true })
  })
}