import { Mistral } from '@mistralai/mistralai'
import type { Transaction, Budget, TransactionWithCategory, BudgetWithCategory } from '@/types'

/**
 * AI Insights Utility
 * 
 * Integrates with Mistral AI to generate financial insights,
 * spending pattern analysis, budget recommendations, and savings suggestions.
 */

// Initialize Mistral AI client
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? '',
})

/**
 * Financial Insight Type
 */
export interface FinancialInsight {
  id: string
  type: 'pattern' | 'budget' | 'savings' | 'alert' | 'summary'
  title: string
  description: string
  severity: 'info' | 'warning' | 'success' | 'error'
  actionable: boolean
  recommendation?: string
}

/**
 * Spending Summary
 */
interface SpendingSummary {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  savingsRate: number
  transactionCount: number
  topCategories: Array<{ name: string; amount: number; percentage: number }>
  budgetStatus: Array<{ category: string; spent: number; limit: number; percentage: number }>
}

/**
 * Calculate spending summary from transactions and budgets
 */
function calculateSpendingSummary(
  transactions: TransactionWithCategory[],
  budgets: BudgetWithCategory[]
): SpendingSummary {
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netIncome = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0

  // Calculate top spending categories
  const categoryTotals = new Map<string, number>()
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const categoryName = t.categories?.name || 'Uncategorized'
      categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + t.amount)
    })

  const topCategories = Array.from(categoryTotals.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // Calculate budget status
  const budgetStatus = budgets.map(budget => {
    const categoryId = budget.category_id
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category_id === categoryId)
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      category: budget.categories?.name || 'Uncategorized',
      spent,
      limit: budget.amount,
      percentage: (spent / budget.amount) * 100,
    }
  })

  return {
    totalIncome,
    totalExpenses,
    netIncome,
    savingsRate,
    transactionCount: transactions.length,
    topCategories,
    budgetStatus,
  }
}

/**
 * Generate AI prompt for financial insights
 */
function generateInsightsPrompt(summary: SpendingSummary): string {
  return `You are a professional financial advisor analyzing a user's spending data. Provide 4-5 actionable insights based on the following financial data:

**Financial Summary:**
- Total Income: ₱${summary.totalIncome.toFixed(2)}
- Total Expenses: ₱${summary.totalExpenses.toFixed(2)}
- Net Income: ₱${summary.netIncome.toFixed(2)}
- Savings Rate: ${summary.savingsRate.toFixed(1)}%
- Total Transactions: ${summary.transactionCount}

**Top Spending Categories:**
${summary.topCategories.map((cat, i) => `${i + 1}. ${cat.name}: ₱${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%)`).join('\n')}

**Budget Status:**
${summary.budgetStatus.map(b => `- ${b.category}: ₱${b.spent.toFixed(2)} / ₱${b.limit.toFixed(2)} (${b.percentage.toFixed(1)}%)`).join('\n')}

Provide insights in the following format (return ONLY valid JSON, no markdown):

{
  "insights": [
    {
      "type": "pattern|budget|savings|alert|summary",
      "title": "Brief title (max 60 chars)",
      "description": "Detailed description (2-3 sentences)",
      "severity": "info|warning|success|error",
      "actionable": true|false,
      "recommendation": "Specific action to take (optional)"
    }
  ]
}

Focus on:
1. Spending patterns and trends
2. Budget adherence and optimization
3. Savings opportunities
4. Unusual spending or alerts
5. Overall financial health summary

Be specific, actionable, and encouraging. Use Philippine Peso (₱) for currency.`
}

/**
 * Parse AI response and extract insights
 */
function parseAIResponse(response: string): FinancialInsight[] {
  try {
    // Remove markdown code blocks if present
    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleanedResponse)
    
    if (!parsed.insights || !Array.isArray(parsed.insights)) {
      throw new Error('Invalid response format')
    }

    return parsed.insights.map((insight: any, index: number) => ({
      id: `insight-${Date.now()}-${index}`,
      type: insight.type || 'info',
      title: insight.title || 'Financial Insight',
      description: insight.description || '',
      severity: insight.severity || 'info',
      actionable: insight.actionable ?? false,
      recommendation: insight.recommendation,
    }))
  } catch (error) {
    console.error('Error parsing AI response:', error)
    // Return fallback insights
    return [
      {
        id: `insight-${Date.now()}-fallback`,
        type: 'summary',
        title: 'Financial Analysis Available',
        description: 'Your financial data has been analyzed. Continue tracking your expenses to get more detailed insights.',
        severity: 'info',
        actionable: false,
      },
    ]
  }
}

/**
 * Generate financial insights using Mistral AI
 * 
 * @param transactions - User's transactions (last 30-90 days)
 * @param budgets - User's budgets
 * @returns Array of financial insights
 */
export async function generateFinancialInsights(
  transactions: TransactionWithCategory[],
  budgets: BudgetWithCategory[]
): Promise<FinancialInsight[]> {
  try {
    // Validate input
    if (!transactions || transactions.length === 0) {
      return [
        {
          id: `insight-${Date.now()}-no-data`,
          type: 'summary',
          title: 'No Transaction Data',
          description: 'Start adding transactions to get personalized financial insights and recommendations.',
          severity: 'info',
          actionable: true,
          recommendation: 'Add your first transaction to begin tracking your finances.',
        },
      ]
    }

    // Calculate spending summary
    const summary = calculateSpendingSummary(transactions, budgets)

    // Generate prompt
    const prompt = generateInsightsPrompt(summary)

    // Call Mistral AI - Use model from environment variable
    const MISTRAL_MODEL = process.env.MISTRAL_MODEL || 'mistral-small-2503'

    const response = await mistral.chat.complete({
      model: MISTRAL_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional financial advisor providing actionable insights. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Extract response - handle both string and ContentChunk[] types
    const messageContent = response.choices?.[0]?.message?.content
    let aiResponse = ''

    if (typeof messageContent === 'string') {
      aiResponse = messageContent
    } else if (Array.isArray(messageContent)) {
      aiResponse = messageContent
        .map((chunk: any) => chunk.text || '')
        .join('')
    }

    if (!aiResponse) {
      throw new Error('Empty response from AI')
    }

    // Parse and return insights
    const insights = parseAIResponse(aiResponse)

    return insights
  } catch (error) {
    console.error('Error generating financial insights:', error)
    
    // Return error insight
    return [
      {
        id: `insight-${Date.now()}-error`,
        type: 'alert',
        title: 'Unable to Generate Insights',
        description: 'We encountered an issue generating your financial insights. Please try again later.',
        severity: 'error',
        actionable: false,
      },
    ]
  }
}

/**
 * Get insight icon based on type
 */
export function getInsightIcon(type: FinancialInsight['type']): string {
  switch (type) {
    case 'pattern':
      return '📊'
    case 'budget':
      return '💰'
    case 'savings':
      return '💡'
    case 'alert':
      return '⚠️'
    case 'summary':
      return '📈'
    default:
      return '💡'
  }
}

/**
 * Get insight color based on severity
 */
export function getInsightColor(severity: FinancialInsight['severity']): string {
  switch (severity) {
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'info':
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200'
  }
}

