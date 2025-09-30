import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { updateCategorySchema } from '@/lib/validations'
import { ZodError } from 'zod'
import type { Category } from '@/types'

// GET /api/categories/[id] - Get a specific category
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

    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching category:', error)
      return NextResponse.json(
        { error: 'Failed to fetch category' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { category } })
  } catch (error) {
    console.error('Unexpected error in GET /api/categories/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update a category
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
          set(_name: string, _value: string, _options: any) {
            // No-op for server-side
          },
          remove(_name: string, _options: any) {
            // No-op for server-side
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
    const { name, color, icon, type } = body

    // Validate type if provided
    if (type && !['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "income" or "expense"' },
        { status: 400 }
      )
    }

    // Check if another category with the same name exists (excluding current)
    if (name) {
      const { data: existingCategory, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', name)
        .neq('id', resolvedParams.id)
        .single()

      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (color !== undefined) updateData.color = color || null
    if (icon !== undefined) updateData.icon = icon || null
    if (type) updateData.type = type

    // Update category
    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      console.error('Error updating category:', error)
      return NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { category } })
  } catch (error) {
    console.error('Unexpected error in PUT /api/categories/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete a category
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
          set(_name: string, _value: string, _options: any) {
            // No-op for server-side
          },
          remove(_name: string, _options: any) {
            // No-op for server-side
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

    // Check if category is being used by any active transactions
    const { data: transactions, error: checkError } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', resolvedParams.id)
      .limit(1)

    if (checkError) {
      console.error('Error checking category usage:', checkError)
      return NextResponse.json(
        { error: 'Failed to check category usage' },
        { status: 500 }
      )
    }

    if (transactions && transactions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used by transactions' },
        { status: 400 }
      )
    }

    // 1. Get the full category record before deletion
    const { data: category, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !category) {
      console.error('Error fetching category for deletion:', fetchError)
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // 2. Save to deleted_items table for restore functionality
    const { error: logError } = await supabase
      .from('deleted_items')
      .insert({
        table_name: 'categories',
        record_id: resolvedParams.id,
        user_id: user.id,
        record_data: category,
        deleted_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging deleted category:', logError)
      return NextResponse.json(
        { error: 'Failed to log deleted category' },
        { status: 500 }
      )
    }

    // 3. Permanently delete category from categories table
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting category:', error)
      return NextResponse.json(
        { error: 'Failed to delete category' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/categories/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}