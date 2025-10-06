import { NextRequest, NextResponse } from 'next/server'
import { validateRequestBody, createValidationErrorResponse } from '@/lib/validation/middleware'
import { createTransactionSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { sanitizeTransactionDescription } from '@/lib/sanitize'
import {
  authenticateApiRequest,
  applyRateLimit,
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-helpers'

// GET /api/transactions - List all transactions for the authenticated user
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // Apply rate limiting (more lenient for read operations)
    await applyRateLimit(request, 'read')

    // Authenticate and get user
    const { supabase, user } = await authenticateApiRequest()

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'income' | 'expense'
    const categoryId = searchParams.get('category_id')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    let query = supabase
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
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    // Apply filters
    if (type && ['income', 'expense'].includes(type)) {
      query = query.eq('type', type)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (limit) {
      const limitNum = parseInt(limit)
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum)
      }
    }

    if (offset) {
      const offsetNum = parseInt(offset)
      if (!isNaN(offsetNum) && offsetNum >= 0) {
        query = query.range(offsetNum, offsetNum + (limit ? parseInt(limit) - 1 : 49))
      }
    }

    const { data: transactions, error } = await query

    if (error) {
      logger.error({ error }, 'Error fetching transactions')
      return createErrorResponse('Failed to fetch transactions', 500)
    }

    return createSuccessResponse({ transactions: transactions || [] })
  })
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Apply rate limiting (stricter for write operations)
    await applyRateLimit(request, 'default')

    // Authenticate and get user
    const { supabase, user } = await authenticateApiRequest()

    // Validate request body using Zod schema
    const validation = await validateRequestBody(request, createTransactionSchema)

    if (!validation.success) {
      return createValidationErrorResponse(validation.error)
    }

    const { amount, description, type, date, category_id } = validation.data

    // Convert date to Date object
    const dateObj = new Date(date)

    // If category_id is provided, verify it belongs to the user
    if (category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .eq('user_id', user.id)
        .single()

      if (categoryError || !category) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }
    }

    // Sanitize description to prevent XSS
    const sanitizedDescription = description ? sanitizeTransactionDescription(description) : null

    // Create transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount,
        description: sanitizedDescription,
        type,
        date: dateObj.toISOString().split('T')[0], // Store as YYYY-MM-DD
        category_id: category_id || null,
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
      logger.error({ error }, 'Error creating transaction')
      return createErrorResponse('Failed to create transaction', 500)
    }

    return createSuccessResponse({ transaction }, 201)
  })
}