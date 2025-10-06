import { NextRequest } from 'next/server'
import { generateFinancialInsights } from '@/lib/ai-insights'
import { buildCacheKey, CACHE_PREFIXES, CACHE_TTL, getCached, setCached } from '@/lib/cache'
import type { TransactionWithCategory, BudgetWithCategory } from '@/types'
import { logger } from '@/lib/logger'
import {
  authenticateApiRequest,
  applyRateLimit,
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-helpers'

/**
 * GET /api/insights - Generate AI-powered financial insights
 * 
 * Query Parameters:
 * - period: 'week' | 'month' | 'quarter' (default: 'month')
 * 
 * Returns:
 * - insights: Array of financial insights
 * - metadata: Information about the analysis
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'read')
    const { supabase, user } = await authenticateApiRequest()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'month':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    const startDateStr = startDate.toISOString().split('T')[0]

    // Fetch transactions for the period
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('date', startDateStr)
      .order('date', { ascending: false })

    if (transactionsError) {
      logger.error({ error: transactionsError }, 'Error fetching transactions')
      return createErrorResponse('Failed to fetch transactions', 500)
    }

    // Fetch budgets
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (budgetsError) {
      logger.error({ error: budgetsError }, 'Error fetching budgets')
      return createErrorResponse('Failed to fetch budgets', 500)
    }

    // Generate insights using AI
    const insights = await generateFinancialInsights(
      (transactions || []) as TransactionWithCategory[],
      (budgets || []) as BudgetWithCategory[]
    )

    // Calculate metadata
    const totalIncome = (transactions || [])
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = (transactions || [])
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const metadata = {
      period,
      dateRange: {
        start: startDateStr,
        end: now.toISOString().split('T')[0],
      },
      transactionCount: transactions?.length || 0,
      budgetCount: budgets?.length || 0,
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      generatedAt: new Date().toISOString(),
    }

    return createSuccessResponse({
      data: {
        insights,
        metadata,
      },
    })
  })
}

