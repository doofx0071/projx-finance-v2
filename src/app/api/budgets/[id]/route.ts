import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { updateBudgetSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import type { Budget, BudgetWithCategory } from '@/types'
import { logger } from '@/lib/logger'

// GET /api/budgets/[id] - Get a specific budget
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
        return NextResponse.json(
          { error: 'Budget not found' },
          { status: 404 }
        )
      }
      logger.error({ error, budgetId: resolvedParams.id }, 'Error fetching budget')
      return NextResponse.json(
        { error: 'Failed to fetch budget' },
        { status: 500 }
      )
    }

    return NextResponse.json({ budget })
  } catch (error) {
    logger.error({ error }, 'Unexpected error in GET /api/budgets/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/budgets/[id] - Update a budget
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

    const body = await request.json()
    const { category_id, amount, period, start_date, end_date } = body

    // Validate period if provided
    if (period && !['weekly', 'monthly', 'yearly'].includes(period)) {
      return NextResponse.json(
        { error: 'Period must be either "weekly", "monthly", or "yearly"' },
        { status: 400 }
      )
    }

    // Validate amount if provided
    let amountNum: number | undefined
    if (amount !== undefined) {
      amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive number' },
          { status: 400 }
        )
      }
    }

    // Validate dates if provided
    let startDateStr: string | undefined
    let endDateStr: string | null | undefined

    if (start_date) {
      const startDateObj = new Date(start_date)
      if (isNaN(startDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start date format' },
          { status: 400 }
        )
      }
      startDateStr = startDateObj.toISOString().split('T')[0]
    }

    if (end_date !== undefined) {
      if (end_date) {
        const endDateObj = new Date(end_date)
        if (isNaN(endDateObj.getTime())) {
          return NextResponse.json(
            { error: 'Invalid end date format' },
            { status: 400 }
          )
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
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
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
        return NextResponse.json(
          { error: 'Budget not found' },
          { status: 404 }
        )
      }
      logger.error({ error, budgetId: resolvedParams.id }, 'Error updating budget')
      return NextResponse.json(
        { error: 'Failed to update budget' },
        { status: 500 }
      )
    }

    return NextResponse.json({ budget })
  } catch (error) {
    logger.error({ error }, 'Unexpected error in PUT /api/budgets/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/budgets/[id] - Delete a budget
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

    // 1. Get the full budget record before deletion
    const { data: budget, error: fetchError } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !budget) {
      logger.error({ error: fetchError, budgetId: resolvedParams.id }, 'Error fetching budget for deletion')
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      )
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
      return NextResponse.json(
        { error: 'Failed to log deleted budget' },
        { status: 500 }
      )
    }

    // 3. Permanently delete budget from budgets table
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (error) {
      logger.error({ error, budgetId: resolvedParams.id }, 'Error deleting budget')
      return NextResponse.json(
        { error: 'Failed to delete budget' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ error }, 'Unexpected error in DELETE /api/budgets/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}