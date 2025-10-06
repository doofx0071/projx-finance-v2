import { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import {
  authenticateApiRequest,
  applyRateLimit,
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-helpers'

// GET /api/trash - Get all deleted items for the authenticated user
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'read')
    const { supabase, user } = await authenticateApiRequest()

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
      logger.error({ error }, 'Error fetching deleted items')
      return createErrorResponse('Failed to fetch deleted items', 500)
    }

    // Group by table_name for easier frontend consumption
    const grouped = {
      transactions: deletedItems?.filter(item => item.table_name === 'transactions') || [],
      categories: deletedItems?.filter(item => item.table_name === 'categories') || [],
      budgets: deletedItems?.filter(item => item.table_name === 'budgets') || [],
    }

    return createSuccessResponse({
      data: {
        deletedItems: deletedItems || [],
        grouped,
        total: deletedItems?.length || 0
      }
    })
  })
}

