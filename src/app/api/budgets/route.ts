import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// GET /api/budgets - List all budgets for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
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
      console.error('Error fetching budgets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch budgets' },
        { status: 500 }
      )
    }

    return NextResponse.json({ budgets: budgets || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/budgets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/budgets - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
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

    // Validate required fields
    if (!category_id || !amount || !period || !start_date) {
      return NextResponse.json(
        { error: 'Category, amount, period, and start date are required' },
        { status: 400 }
      )
    }

    // Validate period
    if (!['weekly', 'monthly', 'yearly'].includes(period)) {
      return NextResponse.json(
        { error: 'Period must be either "weekly", "monthly", or "yearly"' },
        { status: 400 }
      )
    }

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Validate dates
    const startDateObj = new Date(start_date)
    if (isNaN(startDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start date format' },
        { status: 400 }
      )
    }

    let endDateStr: string | null = null
    if (end_date) {
      const endDateObj = new Date(end_date)
      if (isNaN(endDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date format' },
          { status: 400 }
        )
      }
      if (endDateObj <= startDateObj) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        )
      }
      endDateStr = endDateObj.toISOString().split('T')[0]
    }

    // Verify category belongs to user
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
      return NextResponse.json(
        { error: 'An active budget already exists for this category and period' },
        { status: 400 }
      )
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
      console.error('Error creating budget:', error)
      return NextResponse.json(
        { error: 'Failed to create budget' },
        { status: 500 }
      )
    }

    return NextResponse.json({ budget }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/budgets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}