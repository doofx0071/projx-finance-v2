import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { categorySchema } from '@/lib/validations'
import { ZodError } from 'zod'
import type { Category } from '@/types'
import { ratelimit, readRatelimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit'
import { sanitizeCategoryName, sanitizeStrict } from '@/lib/sanitize'
import { logger } from '@/lib/logger'

// GET /api/categories - List all categories for the authenticated user
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
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: { categories: categories || [] }
    })
  } catch (error) {
    logger.error({ error }, 'Unexpected error in GET /api/categories')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category
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
    const validatedData = categorySchema.parse(body)

    // Sanitize inputs
    const sanitizedName = sanitizeCategoryName(validatedData.name)
    const sanitizedIcon = validatedData.icon ? sanitizeStrict(validatedData.icon) : null
    const sanitizedColor = validatedData.color ? sanitizeStrict(validatedData.color) : null

    // Check if category name already exists for this user
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', sanitizedName)
      .single()

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: { category }
    }, { status: 201 })
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formattedErrors
        },
        { status: 400 }
      )
    }

    logger.error({ error }, 'Unexpected error in POST /api/categories')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}