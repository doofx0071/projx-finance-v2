/**
 * Unit Tests for Utility Functions
 * 
 * Tests all utility functions for correct behavior
 */

import { cn, formatCurrency, formatDate } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden')
      expect(result).toContain('base')
      expect(result).toContain('conditional')
      expect(result).not.toContain('hidden')
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4')
      // Should keep only px-4 (last one wins)
      expect(result).toContain('px-4')
      expect(result).toContain('py-1')
    })

    it('should handle empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })
  })

  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      const result = formatCurrency(1000)
      expect(result).toContain('1,000')
      expect(result).toContain('₱') // PHP currency symbol
    })

    it('should format negative amounts correctly', () => {
      const result = formatCurrency(-500)
      expect(result).toContain('500')
      expect(result).toContain('-') // Negative sign
    })

    it('should format zero correctly', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0')
    })

    it('should format decimal amounts correctly', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('1,234.56')
    })

    it('should handle large numbers', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('1,000,000')
    })

    it('should handle small decimal numbers', () => {
      const result = formatCurrency(0.99)
      expect(result).toContain('0.99')
    })
  })

  describe('formatDate', () => {
    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)
      expect(result).toContain('Jan')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('should format ISO string correctly', () => {
      const dateString = '2024-01-15T00:00:00.000Z'
      const result = formatDate(dateString)
      expect(result).toContain('Jan')
      expect(result).toContain('2024')
    })

    it('should format different months correctly', () => {
      const dates = [
        { input: '2024-01-01', month: 'Jan' },
        { input: '2024-02-01', month: 'Feb' },
        { input: '2024-03-01', month: 'Mar' },
        { input: '2024-12-01', month: 'Dec' },
      ]

      dates.forEach(({ input, month }) => {
        const result = formatDate(input)
        expect(result).toContain(month)
      })
    })

    it('should handle different years', () => {
      const result2023 = formatDate('2023-06-15')
      const result2024 = formatDate('2024-06-15')
      
      expect(result2023).toContain('2023')
      expect(result2024).toContain('2024')
    })

    it('should format end of month dates', () => {
      const result = formatDate('2024-01-31')
      expect(result).toContain('31')
      expect(result).toContain('Jan')
    })

    it('should format beginning of month dates', () => {
      const result = formatDate('2024-01-01')
      expect(result).toContain('1')
      expect(result).toContain('Jan')
    })
  })
})

