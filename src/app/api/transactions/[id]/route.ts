import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validateRequestBody, createValidationErrorResponse } from '@/lib/validation/middleware'
import { updateTransactionSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { sanitizeTransactionDescription } from '@/lib/sanitize'

// GET /api/transactions/[id] - Get a specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const resolvedParams = await params
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        )
      }
      logger.error({ error, transactionId: resolvedParams.id }, 'Error fetching transaction')
      return NextResponse.json(
        { error: 'Failed to fetch transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    logger.error({ error }, 'Unexpected error in GET /api/transactions/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const resolvedParams = await params
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
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
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        )
      }
      logger.error({ error, transactionId: resolvedParams.id }, 'Error updating transaction')
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { transaction } })
  } catch (error) {
    logger.error({ error }, 'Unexpected error in PUT /api/transactions/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const resolvedParams = await params
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 1. Get the full transaction record before deletion
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !transaction) {
      logger.error({ error: fetchError, transactionId: resolvedParams.id }, 'Error fetching transaction for deletion')
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
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
      return NextResponse.json(
        { error: 'Failed to log deleted transaction' },
        { status: 500 }
      )
    }

    // 3. Permanently delete transaction from transactions table
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (error) {
      logger.error({ error, transactionId: resolvedParams.id }, 'Error deleting transaction')
      return NextResponse.json(
        { error: 'Failed to delete transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ error }, 'Unexpected error in DELETE /api/transactions/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}