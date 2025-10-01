import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient, getAuthenticatedUser } from '@/lib/supabase-api'
import { categorySchema } from '@/lib/validations'
import { ZodError } from 'zod'
import type { Category } from '@/types'
import { ratelimit, readRatelimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit'

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

    const supabase = await createSupabaseApiClient()
    const user = await getAuthenticatedUser(supabase)

    if (!user) {
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
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: { categories: categories || [] }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/categories:', error)
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

    const supabase = await createSupabaseApiClient()
    const user = await getAuthenticatedUser(supabase)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body with Zod
    const validatedData = categorySchema.parse(body)
    const { name, color, icon, type } = validatedData

    // Check if category name already exists for this user
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name)
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
        name,
        color: color || null,
        icon: icon || null,
        type,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
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

    console.error('Unexpected error in POST /api/categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}