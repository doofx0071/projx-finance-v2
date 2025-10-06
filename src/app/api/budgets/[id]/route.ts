import { NextRequest } from 'next/server'
import { updateBudgetSchema } from '@/lib/validations'
import type { Budget, BudgetWithCategory } from '@/types'
import { logger } from '@/lib/logger'
import {
  authenticateApiRequest,
  applyRateLimit,
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-helpers'

// GET /api/budgets/[id] - Get a specific budget
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'read')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    const { data: budget, error } = await supabase
      .from('budgets')
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
        return createErrorResponse('Budget not found', 404)
      }
      logger.error({ error, budgetId: resolvedParams.id }, 'Error fetching budget')
      return createErrorResponse('Failed to fetch budget', 500)
    }

    return createSuccessResponse({ budget })
  })
}

// PUT /api/budgets/[id] - Update a budget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'default')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    const body = await request.json()
    const { category_id, amount, period, start_date, end_date } = body

    // Validate period if provided
    if (period && !['weekly', 'monthly', 'yearly'].includes(period)) {
      return createErrorResponse('Period must be either "weekly", "monthly", or "yearly"', 400)
    }

    // Validate amount if provided
    let amountNum: number | undefined
    if (amount !== undefined) {
      amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        return createErrorResponse('Amount must be a positive number', 400)
      }
    }

    // Validate dates if provided
    let startDateStr: string | undefined
    let endDateStr: string | null | undefined

    if (start_date) {
      const startDateObj = new Date(start_date)
      if (isNaN(startDateObj.getTime())) {
        return createErrorResponse('Invalid start date format', 400)
      }
      startDateStr = startDateObj.toISOString().split('T')[0]
    }

    if (end_date !== undefined) {
      if (end_date) {
        const endDateObj = new Date(end_date)
        if (isNaN(endDateObj.getTime())) {
          return createErrorResponse('Invalid end date format', 400)
        }
        endDateStr = endDateObj.toISOString().split('T')[0]
      } else {
        endDateStr = null
      }
    }

    // Verify category belongs to user if provided
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
    const updateData: any = {}

    if (category_id !== undefined) updateData.category_id = category_id
    if (amountNum !== undefined) updateData.amount = amountNum
    if (period) updateData.period = period
    if (startDateStr) updateData.start_date = startDateStr
    if (endDateStr !== undefined) updateData.end_date = endDateStr

    // Update budget
    const { data: budget, error } = await supabase
      .from('budgets')
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
        return createErrorResponse('Budget not found', 404)
      }
      logger.error({ error, budgetId: resolvedParams.id }, 'Error updating budget')
      return createErrorResponse('Failed to update budget', 500)
    }

    return createSuccessResponse({ budget })
  })
}

// DELETE /api/budgets/[id] - Delete a budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'default')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    // 1. Get the full budget record before deletion
    const { data: budget, error: fetchError } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !budget) {
      logger.error({ error: fetchError, budgetId: resolvedParams.id }, 'Error fetching budget for deletion')
      return createErrorResponse('Budget not found', 404)
    }

    // 2. Save to deleted_items table for restore functionality
    const { error: logError } = await supabase
      .from('deleted_items')
      .insert({
        table_name: 'budgets',
        record_id: resolvedParams.id,
        user_id: user.id,
        record_data: budget,
        deleted_at: new Date().toISOString()
      })

    if (logError) {
      logger.error({ error: logError, budgetId: resolvedParams.id }, 'Error logging deleted budget')
      return createErrorResponse('Failed to log deleted budget', 500)
    }

    // 3. Permanently delete budget from budgets table
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (error) {
      logger.error({ error, budgetId: resolvedParams.id }, 'Error deleting budget')
      return createErrorResponse('Failed to delete budget', 500)
    }

    return createSuccessResponse({ success: true })
  })
}