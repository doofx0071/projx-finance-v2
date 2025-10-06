import { NextRequest, NextResponse } from 'next/server'
import { budgetSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import type { Budget, BudgetWithCategory } from '@/types'
import { logger } from '@/lib/logger'
import {
  authenticateApiRequest,
  applyRateLimit,
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-helpers'

// GET /api/budgets - List all budgets for the authenticated user
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // Apply rate limiting (read operations)
    await applyRateLimit(request, 'read')

    // Authenticate and get user
    const { supabase, user } = await authenticateApiRequest()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    const period = searchParams.get('period')

    let query = supabase
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (period && ['weekly', 'monthly', 'yearly'].includes(period)) {
      query = query.eq('period', period)
    }

    const { data: budgets, error } = await query

    if (error) {
      logger.error({ error, userId: user.id }, 'Error fetching budgets')
      return createErrorResponse('Failed to fetch budgets', 500)
    }

    return createSuccessResponse({ budgets: budgets || [] })
  })
}

// POST /api/budgets - Create a new budget
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Apply rate limiting (write operations)
    await applyRateLimit(request, 'default')

    // Authenticate and get user
    const { supabase, user } = await authenticateApiRequest()

    const body = await request.json()

    // Validate request body with Zod
    const validatedData = budgetSchema.parse(body)
    const { category_id, amount, period, start_date, end_date } = validatedData

    // Process and validate data
    const amountNum = typeof amount === 'number' ? amount : parseFloat(amount as string)
    const startDateObj = new Date(start_date)
    const endDateStr = end_date || null

    // Verify category belongs to user
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .eq('user_id', user.id)
      .single()

    if (categoryError || !category) {
      return createErrorResponse('Invalid category', 400)
    }

    // Check if budget already exists for this category and period
    const { data: existingBudget, error: checkError } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('category_id', category_id)
      .eq('period', period)
      .is('end_date', null) // Only check active budgets
      .single()

    if (existingBudget) {
      return createErrorResponse('An active budget already exists for this category and period', 400)
    }

    // Create budget
    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id,
        amount: amountNum,
        period,
        start_date: startDateObj.toISOString().split('T')[0],
        end_date: endDateStr,
      })
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
      logger.error({ error }, 'Error creating budget')
      return createErrorResponse('Failed to create budget', 500)
    }

    return createSuccessResponse({ budget }, 201)
  })
}