import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { budgetSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import type { Budget, BudgetWithCategory, CookieOptions } from '@/types'
import { ratelimit, readRatelimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// GET /api/budgets - List all budgets for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting (read operations)
    const ip = getClientIp(request)
    const { success, limit: rateLimit, remaining, reset } = await readRatelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders({ success, limit: rateLimit, remaining, reset })
        }
      )
    }

    const cookieStore = await cookies()
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
      return NextResponse.json(
        { error: 'Failed to fetch budgets' },
        { status: 500 }
      )
    }

    return NextResponse.json({ budgets: budgets || [] })
  } catch (error) {
    logger.error({ error }, 'Unexpected error in GET /api/budgets')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/budgets - Create a new budget
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (write operations)
    const ip = getClientIp(request)
    const { success, limit: rateLimit, remaining, reset } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders({ success, limit: rateLimit, remaining, reset })
        }
      )
    }

    const cookieStore = await cookies()
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
      logger.error({ error }, 'Error creating budget')
      return NextResponse.json(
        { error: 'Failed to create budget' },
        { status: 500 }
      )
    }

    return NextResponse.json({ budget }, { status: 201 })
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessage = error.errors.map(e => e.message).join(', ')
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    logger.error({ error }, 'Unexpected error in POST /api/budgets')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}