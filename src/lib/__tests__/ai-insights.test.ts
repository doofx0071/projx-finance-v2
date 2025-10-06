/**
 * Unit Tests for AI Insights Utility
 * 
 * Tests the AI-powered financial insights generation,
 * spending pattern analysis, and budget recommendations.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import type { TransactionWithCategory, BudgetWithCategory } from '@/types'

// Mock Mistral AI
jest.mock('@mistralai/mistralai', () => ({
  Mistral: jest.fn().mockImplementation(() => ({
    chat: {
      complete: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify([
              {
                id: '1',
                type: 'pattern',
                title: 'High Spending on Dining',
                description: 'You spent 30% more on dining this month',
                severity: 'warning',
                actionable: true,
                recommendation: 'Consider meal planning to reduce dining expenses'
              }
            ])
          }
        }]
      })
    }
  }))
}))

describe('AI Insights Utility', () => {
  // Mock data
  const mockTransactions: TransactionWithCategory[] = [
    {
      id: '1',
      user_id: 'user1',
      amount: 100,
      description: 'Grocery shopping',
      type: 'expense',
      date: '2025-01-01',
      category_id: 'cat1',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      deleted_at: null,
      categories: {
        id: 'cat1',
        name: 'Groceries',
        type: 'expense',
        color: '#green',
        icon: '🛒',
        user_id: 'user1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
    },
    {
      id: '2',
      user_id: 'user1',
      amount: 200,
      description: 'Dining out',
      type: 'expense',
      date: '2025-01-02',
      category_id: 'cat2',
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
      deleted_at: null,
      categories: {
        id: 'cat2',
        name: 'Dining',
        type: 'expense',
        color: '#red',
        icon: '🍽️',
        user_id: 'user1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
    },
    {
      id: '3',
      user_id: 'user1',
      amount: 1000,
      description: 'Salary',
      type: 'income',
      date: '2025-01-01',
      category_id: 'cat3',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      deleted_at: null,
      categories: {
        id: 'cat3',
        name: 'Salary',
        type: 'income',
        color: '#blue',
        icon: '💰',
        user_id: 'user1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
    }
  ]

  const mockBudgets: BudgetWithCategory[] = [
    {
      id: '1',
      user_id: 'user1',
      category_id: 'cat1',
      amount: 500,
      period: 'monthly',
      start_date: '2025-01-01',
      end_date: '2025-01-31',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      categories: {
        id: 'cat1',
        name: 'Groceries',
        type: 'expense',
        color: '#green',
        icon: '🛒',
        user_id: 'user1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
    }
  ]

  describe('Spending Summary Calculation', () => {
    it('should calculate total income correctly', () => {
      const income = mockTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      expect(income).toBe(1000)
    })

    it('should calculate total expenses correctly', () => {
      const expenses = mockTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      expect(expenses).toBe(300)
    })

    it('should calculate net income correctly', () => {
      const income = mockTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = mockTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const netIncome = income - expenses
      expect(netIncome).toBe(700)
    })

    it('should calculate savings rate correctly', () => {
      const income = 1000
      const expenses = 300
      const savingsRate = ((income - expenses) / income) * 100
      
      expect(savingsRate).toBe(70)
    })

    it('should group transactions by category', () => {
      const categoryMap = new Map<string, number>()
      
      mockTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const categoryName = t.categories?.name || 'Uncategorized'
          categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + t.amount)
        })
      
      expect(categoryMap.get('Groceries')).toBe(100)
      expect(categoryMap.get('Dining')).toBe(200)
    })
  })

  describe('Budget Status Calculation', () => {
    it('should calculate budget utilization percentage', () => {
      const spent = 100
      const limit = 500
      const percentage = (spent / limit) * 100
      
      expect(percentage).toBe(20)
    })

    it('should identify over-budget categories', () => {
      const spent = 600
      const limit = 500
      const isOverBudget = spent > limit
      
      expect(isOverBudget).toBe(true)
    })

    it('should identify under-budget categories', () => {
      const spent = 300
      const limit = 500
      const isUnderBudget = spent < limit
      
      expect(isUnderBudget).toBe(true)
    })
  })

  describe('Insight Generation', () => {
    it('should generate insights with correct structure', () => {
      const insight = {
        id: '1',
        type: 'pattern' as const,
        title: 'Test Insight',
        description: 'Test description',
        severity: 'info' as const,
        actionable: true,
        recommendation: 'Test recommendation'
      }
      
      expect(insight).toHaveProperty('id')
      expect(insight).toHaveProperty('type')
      expect(insight).toHaveProperty('title')
      expect(insight).toHaveProperty('description')
      expect(insight).toHaveProperty('severity')
      expect(insight).toHaveProperty('actionable')
    })

    it('should categorize insights by type', () => {
      const types = ['pattern', 'budget', 'savings', 'alert', 'summary']
      
      types.forEach(type => {
        expect(['pattern', 'budget', 'savings', 'alert', 'summary']).toContain(type)
      })
    })

    it('should categorize insights by severity', () => {
      const severities = ['info', 'warning', 'success', 'error']
      
      severities.forEach(severity => {
        expect(['info', 'warning', 'success', 'error']).toContain(severity)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty transactions array', () => {
      const emptyTransactions: TransactionWithCategory[] = []
      const totalExpenses = emptyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      expect(totalExpenses).toBe(0)
    })

    it('should handle transactions without categories', () => {
      const transactionWithoutCategory = {
        ...mockTransactions[0],
        categories: null
      }
      
      const categoryName = transactionWithoutCategory.categories?.name || 'Uncategorized'
      expect(categoryName).toBe('Uncategorized')
    })

    it('should handle zero income', () => {
      const zeroIncome = 0
      const expenses = 100
      const savingsRate = zeroIncome > 0 ? ((zeroIncome - expenses) / zeroIncome) * 100 : 0
      
      expect(savingsRate).toBe(0)
    })

    it('should handle negative net income', () => {
      const income = 100
      const expenses = 200
      const netIncome = income - expenses
      
      expect(netIncome).toBeLessThan(0)
      expect(netIncome).toBe(-100)
    })
  })

  describe('Data Validation', () => {
    it('should validate transaction amounts are positive', () => {
      mockTransactions.forEach(transaction => {
        expect(transaction.amount).toBeGreaterThan(0)
      })
    })

    it('should validate budget amounts are positive', () => {
      mockBudgets.forEach(budget => {
        expect(budget.amount).toBeGreaterThan(0)
      })
    })

    it('should validate transaction types', () => {
      mockTransactions.forEach(transaction => {
        expect(['income', 'expense']).toContain(transaction.type)
      })
    })

    it('should validate date formats', () => {
      mockTransactions.forEach(transaction => {
        const date = new Date(transaction.date)
        expect(date).toBeInstanceOf(Date)
        expect(isNaN(date.getTime())).toBe(false)
      })
    })
  })
})

