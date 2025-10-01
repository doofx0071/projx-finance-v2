import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { readRatelimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit'

// GET /api/trash - Get all deleted items for the authenticated user
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
    const tableFilter = searchParams.get('table') // 'transactions', 'categories', 'budgets', or null for all

    let query = supabase
      .from('deleted_items')
      .select('*')
      .eq('user_id', user.id)
      .order('deleted_at', { ascending: false })

    // Apply table filter if provided
    if (tableFilter && ['transactions', 'categories', 'budgets'].includes(tableFilter)) {
      query = query.eq('table_name', tableFilter)
    }

    const { data: deletedItems, error } = await query

    if (error) {
      console.error('Error fetching deleted items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch deleted items' },
        { status: 500 }
      )
    }

    // Group by table_name for easier frontend consumption
    const grouped = {
      transactions: deletedItems?.filter(item => item.table_name === 'transactions') || [],
      categories: deletedItems?.filter(item => item.table_name === 'categories') || [],
      budgets: deletedItems?.filter(item => item.table_name === 'budgets') || [],
    }

    return NextResponse.json({ 
      data: { 
        deletedItems: deletedItems || [],
        grouped,
        total: deletedItems?.length || 0
      } 
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/trash:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

