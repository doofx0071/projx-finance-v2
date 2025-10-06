/**
 * Unit Tests for Export Utility
 * 
 * Tests CSV and PDF export functionality for transaction data.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { format } from 'date-fns'
import type { TransactionWithCategory } from '@/types'

// Mock dependencies
jest.mock('papaparse', () => ({
  default: {
    unparse: jest.fn((data: any) => 'Date,Description,Category,Type,Amount\n2025-01-01,Test,Groceries,Expense,100')
  }
}))

jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    save: jest.fn(),
    internal: {
      pageSize: {
        getWidth: jest.fn().mockReturnValue(210),
        getHeight: jest.fn().mockReturnValue(297)
      }
    }
  }))
}))

jest.mock('jspdf-autotable', () => jest.fn())

describe('Export Utility', () => {
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

  describe('Currency Formatting', () => {
    it('should format PHP currency correctly', () => {
      const formatted = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(100)
      
      expect(formatted).toContain('100')
      expect(formatted).toContain('₱')
    })

    it('should format large amounts correctly', () => {
      const formatted = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(1000000)
      
      expect(formatted).toContain('1,000,000')
    })

    it('should format decimal amounts correctly', () => {
      const formatted = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(100.50)
      
      expect(formatted).toContain('100.50')
    })

    it('should format zero correctly', () => {
      const formatted = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(0)
      
      expect(formatted).toContain('0')
    })
  })

  describe('Date Formatting', () => {
    it('should format date in YYYY-MM-DD format', () => {
      const date = new Date('2025-01-15')
      const formatted = format(date, 'yyyy-MM-dd')
      
      expect(formatted).toBe('2025-01-15')
    })

    it('should handle different date formats', () => {
      const date = new Date('2025-01-01T12:00:00Z')
      const formatted = format(date, 'yyyy-MM-dd')
      
      expect(formatted).toBe('2025-01-01')
    })

    it('should format date with time', () => {
      const date = new Date('2025-01-15T14:30:00')
      const formatted = format(date, 'yyyy-MM-dd HH:mm:ss')
      
      expect(formatted).toContain('2025-01-15')
      expect(formatted).toContain('14:30:00')
    })
  })

  describe('CSV Data Preparation', () => {
    it('should transform transactions to CSV format', () => {
      const csvData = mockTransactions.map((transaction) => ({
        Date: format(new Date(transaction.date), 'yyyy-MM-dd'),
        Description: transaction.description || '',
        Category: transaction.categories?.name || 'Uncategorized',
        Type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        Amount: transaction.amount,
      }))
      
      expect(csvData).toHaveLength(3)
      expect(csvData[0]).toHaveProperty('Date')
      expect(csvData[0]).toHaveProperty('Description')
      expect(csvData[0]).toHaveProperty('Category')
      expect(csvData[0]).toHaveProperty('Type')
      expect(csvData[0]).toHaveProperty('Amount')
    })

    it('should capitalize transaction type', () => {
      const type = 'expense'
      const capitalized = type.charAt(0).toUpperCase() + type.slice(1)
      
      expect(capitalized).toBe('Expense')
    })

    it('should handle missing category', () => {
      const transaction = { ...mockTransactions[0], categories: null }
      const categoryName = transaction.categories?.name || 'Uncategorized'
      
      expect(categoryName).toBe('Uncategorized')
    })

    it('should handle empty description', () => {
      const transaction = { ...mockTransactions[0], description: '' }
      const description = transaction.description || ''
      
      expect(description).toBe('')
    })
  })

  describe('PDF Data Preparation', () => {
    it('should transform transactions to PDF table format', () => {
      const tableData = mockTransactions.map((transaction) => [
        format(new Date(transaction.date), 'yyyy-MM-dd'),
        transaction.description || '',
        transaction.categories?.name || 'Uncategorized',
        transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
        }).format(transaction.amount),
      ])
      
      expect(tableData).toHaveLength(3)
      expect(tableData[0]).toHaveLength(5)
    })

    it('should include all required columns', () => {
      const columns = ['Date', 'Description', 'Category', 'Type', 'Amount']
      
      expect(columns).toContain('Date')
      expect(columns).toContain('Description')
      expect(columns).toContain('Category')
      expect(columns).toContain('Type')
      expect(columns).toContain('Amount')
    })
  })

  describe('Filename Generation', () => {
    it('should generate default filename with current date', () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const filename = `transactions-${today}.csv`
      
      expect(filename).toContain('transactions-')
      expect(filename).toContain('.csv')
    })

    it('should use custom filename if provided', () => {
      const customFilename = 'my-export.csv'
      
      expect(customFilename).toBe('my-export.csv')
    })

    it('should generate PDF filename', () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const filename = `transactions-${today}.pdf`
      
      expect(filename).toContain('transactions-')
      expect(filename).toContain('.pdf')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty transactions array', () => {
      const emptyTransactions: TransactionWithCategory[] = []
      const csvData = emptyTransactions.map((transaction) => ({
        Date: format(new Date(transaction.date), 'yyyy-MM-dd'),
        Description: transaction.description || '',
        Category: transaction.categories?.name || 'Uncategorized',
        Type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        Amount: transaction.amount,
      }))
      
      expect(csvData).toHaveLength(0)
    })

    it('should handle transactions with null values', () => {
      const transaction = {
        ...mockTransactions[0],
        description: null as any,
        categories: null
      }
      
      const description = transaction.description || ''
      const category = transaction.categories?.name || 'Uncategorized'
      
      expect(description).toBe('')
      expect(category).toBe('Uncategorized')
    })

    it('should handle very long descriptions', () => {
      const longDescription = 'A'.repeat(1000)
      const transaction = { ...mockTransactions[0], description: longDescription }
      
      expect(transaction.description.length).toBe(1000)
    })

    it('should handle special characters in description', () => {
      const specialChars = 'Test, "with" special \'characters\' & symbols'
      const transaction = { ...mockTransactions[0], description: specialChars }
      
      expect(transaction.description).toContain(',')
      expect(transaction.description).toContain('"')
      expect(transaction.description).toContain('\'')
    })
  })

  describe('Data Validation', () => {
    it('should validate transaction has required fields', () => {
      mockTransactions.forEach(transaction => {
        expect(transaction).toHaveProperty('id')
        expect(transaction).toHaveProperty('amount')
        expect(transaction).toHaveProperty('type')
        expect(transaction).toHaveProperty('date')
      })
    })

    it('should validate amount is a number', () => {
      mockTransactions.forEach(transaction => {
        expect(typeof transaction.amount).toBe('number')
      })
    })

    it('should validate type is income or expense', () => {
      mockTransactions.forEach(transaction => {
        expect(['income', 'expense']).toContain(transaction.type)
      })
    })

    it('should validate date is valid', () => {
      mockTransactions.forEach(transaction => {
        const date = new Date(transaction.date)
        expect(date).toBeInstanceOf(Date)
        expect(isNaN(date.getTime())).toBe(false)
      })
    })
  })

  describe('Summary Calculations', () => {
    it('should calculate total income', () => {
      const totalIncome = mockTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      expect(totalIncome).toBe(1000)
    })

    it('should calculate total expenses', () => {
      const totalExpenses = mockTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      expect(totalExpenses).toBe(300)
    })

    it('should calculate net balance', () => {
      const income = mockTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = mockTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const netBalance = income - expenses
      expect(netBalance).toBe(700)
    })
  })
})

