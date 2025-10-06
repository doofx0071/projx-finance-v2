import { NextRequest } from 'next/server'
import type { TransactionWithCategory, CategorySpending } from '@/types'
import { logger } from '@/lib/logger'
import {
  authenticateApiRequest,
  applyRateLimit,
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-helpers'

// GET /api/reports - Get financial reports and analytics
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'read')
    const { supabase, user } = await authenticateApiRequest()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // 'week', 'month', 'year', 'all'
    const type = searchParams.get('type') // 'income', 'expense', or null for both

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        // Show last 12 months of data instead of just current month
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'all':
      default:
        startDate = new Date(2000, 0, 1) // Far in the past
        break
    }

    const startDateStr = startDate.toISOString().split('T')[0]

    // Build query for transactions
    let transactionsQuery = supabase
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
      .eq('user_id', user.id)
      .gte('date', startDateStr)

    if (type && ['income', 'expense'].includes(type)) {
      transactionsQuery = transactionsQuery.eq('type', type)
    }

    const { data: transactions, error: transactionsError } = await transactionsQuery

    if (transactionsError) {
      logger.error({ error: transactionsError }, 'Error fetching transactions for reports')
      return createErrorResponse('Failed to fetch transaction data', 500)
    }

    const transactionList = transactions || []

    // Calculate summary statistics
    const totalIncome = transactionList
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpenses = transactionList
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const netIncome = totalIncome - totalExpenses
    const transactionCount = transactionList.length

    // Calculate category breakdown
    const categoryBreakdown = transactionList.reduce((acc, transaction) => {
      const categoryId = transaction.category_id || 'uncategorized'
      const categoryName = transaction.categories?.name || 'Uncategorized'

      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          name: categoryName,
          total: 0,
          count: 0,
          type: transaction.type,
          color: transaction.categories?.color,
          icon: transaction.categories?.icon,
        }
      }

      acc[categoryId].total += Number(transaction.amount)
      acc[categoryId].count += 1

      return acc
    }, {} as Record<string, any>)

    const categorySummary = Object.values(categoryBreakdown)
      .sort((a: any, b: any) => b.total - a.total)

    // Calculate monthly trends (last 12 months)
    const monthlyTrends = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = date.toISOString().split('T')[0]
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]

      const monthTransactions = transactionList.filter(t =>
        t.date >= monthStart && t.date <= monthEnd
      )

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses,
      })
    }

    // Calculate top spending categories
    const topSpendingCategories = categorySummary
      .filter((cat: any) => cat.type === 'expense')
      .slice(0, 5)

    // Calculate average transaction amounts
    const avgIncome = transactionCount > 0 ?
      transactionList.filter(t => t.type === 'income').reduce((sum, t, _, arr) => sum + Number(t.amount) / arr.length, 0) : 0

    const avgExpense = transactionCount > 0 ?
      transactionList.filter(t => t.type === 'expense').reduce((sum, t, _, arr) => sum + Number(t.amount) / arr.length, 0) : 0

    const report = {
      summary: {
        period,
        totalIncome,
        totalExpenses,
        netIncome,
        transactionCount,
        avgIncome,
        avgExpense,
      },
      categoryBreakdown: categorySummary,
      monthlyTrends,
      topSpendingCategories,
      dateRange: {
        start: startDateStr,
        end: now.toISOString().split('T')[0],
      },
    }

    return createSuccessResponse({ data: { report } })
  })
}