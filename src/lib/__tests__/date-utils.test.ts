/**
 * Unit Tests for Date Utilities
 * 
 * Tests date formatting and parsing functions with edge cases
 * to ensure correct handling of timezones, leap years, and boundary conditions.
 */

import { describe, it, expect } from '@jest/globals'
import { formatDateForDB, parseDateFromDB } from '../date-utils'

describe('Date Utilities', () => {
  describe('formatDateForDB', () => {
    it('should format date to YYYY-MM-DD format', () => {
      const date = new Date(2025, 0, 15) // January 15, 2025
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2025-01-15')
    })

    it('should pad single digit months with zero', () => {
      const date = new Date(2025, 0, 15) // January (month 1)
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2025-01-15')
      expect(formatted.split('-')[1]).toBe('01')
    })

    it('should pad single digit days with zero', () => {
      const date = new Date(2025, 0, 5) // Day 5
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2025-01-05')
      expect(formatted.split('-')[2]).toBe('05')
    })

    it('should handle end of month dates', () => {
      const date = new Date(2025, 0, 31) // January 31
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2025-01-31')
    })

    it('should handle beginning of year', () => {
      const date = new Date(2025, 0, 1) // January 1
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2025-01-01')
    })

    it('should handle end of year', () => {
      const date = new Date(2025, 11, 31) // December 31
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2025-12-31')
    })

    it('should handle leap year February 29', () => {
      const date = new Date(2024, 1, 29) // February 29, 2024 (leap year)
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2024-02-29')
    })

    it('should handle non-leap year February 28', () => {
      const date = new Date(2025, 1, 28) // February 28, 2025 (non-leap year)
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2025-02-28')
    })

    it('should not be affected by timezone', () => {
      const date = new Date(2025, 0, 15, 23, 59, 59) // Late at night
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2025-01-15')
    })

    it('should handle dates with different times', () => {
      const morning = new Date(2025, 0, 15, 0, 0, 0)
      const evening = new Date(2025, 0, 15, 23, 59, 59)
      
      expect(formatDateForDB(morning)).toBe('2025-01-15')
      expect(formatDateForDB(evening)).toBe('2025-01-15')
    })
  })

  describe('parseDateFromDB', () => {
    it('should parse YYYY-MM-DD string to Date object', () => {
      const dateString = '2025-01-15'
      const parsed = parseDateFromDB(dateString)
      
      expect(parsed).toBeInstanceOf(Date)
      expect(parsed.getFullYear()).toBe(2025)
      expect(parsed.getMonth()).toBe(0) // January is 0
      expect(parsed.getDate()).toBe(15)
    })

    it('should set time to local midnight', () => {
      const dateString = '2025-01-15'
      const parsed = parseDateFromDB(dateString)
      
      expect(parsed.getHours()).toBe(0)
      expect(parsed.getMinutes()).toBe(0)
      expect(parsed.getSeconds()).toBe(0)
      expect(parsed.getMilliseconds()).toBe(0)
    })

    it('should handle beginning of year', () => {
      const dateString = '2025-01-01'
      const parsed = parseDateFromDB(dateString)
      
      expect(parsed.getFullYear()).toBe(2025)
      expect(parsed.getMonth()).toBe(0)
      expect(parsed.getDate()).toBe(1)
    })

    it('should handle end of year', () => {
      const dateString = '2025-12-31'
      const parsed = parseDateFromDB(dateString)
      
      expect(parsed.getFullYear()).toBe(2025)
      expect(parsed.getMonth()).toBe(11) // December is 11
      expect(parsed.getDate()).toBe(31)
    })

    it('should handle leap year February 29', () => {
      const dateString = '2024-02-29'
      const parsed = parseDateFromDB(dateString)
      
      expect(parsed.getFullYear()).toBe(2024)
      expect(parsed.getMonth()).toBe(1) // February is 1
      expect(parsed.getDate()).toBe(29)
    })

    it('should handle different months correctly', () => {
      const months = [
        { string: '2025-01-15', month: 0 },
        { string: '2025-06-15', month: 5 },
        { string: '2025-12-15', month: 11 },
      ]
      
      months.forEach(({ string, month }) => {
        const parsed = parseDateFromDB(string)
        expect(parsed.getMonth()).toBe(month)
      })
    })
  })

  describe('Round-trip conversion', () => {
    it('should maintain date integrity through format and parse', () => {
      const original = new Date(2025, 0, 15)
      const formatted = formatDateForDB(original)
      const parsed = parseDateFromDB(formatted)
      
      expect(parsed.getFullYear()).toBe(original.getFullYear())
      expect(parsed.getMonth()).toBe(original.getMonth())
      expect(parsed.getDate()).toBe(original.getDate())
    })

    it('should handle multiple round trips', () => {
      let date = new Date(2025, 0, 15)
      
      for (let i = 0; i < 5; i++) {
        const formatted = formatDateForDB(date)
        date = parseDateFromDB(formatted)
      }
      
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(0)
      expect(date.getDate()).toBe(15)
    })
  })

  describe('Edge Cases', () => {
    it('should handle year 2000 (leap year)', () => {
      const date = new Date(2000, 1, 29)
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2000-02-29')
    })

    it('should handle year 1900 (not a leap year)', () => {
      const date = new Date(1900, 1, 28)
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('1900-02-28')
    })

    it('should handle far future dates', () => {
      const date = new Date(2099, 11, 31)
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2099-12-31')
    })

    it('should handle past dates', () => {
      const date = new Date(1990, 0, 1)
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('1990-01-01')
    })

    it('should handle dates with milliseconds', () => {
      const date = new Date(2025, 0, 15, 12, 30, 45, 999)
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2025-01-15')
    })
  })

  describe('Month Boundaries', () => {
    it('should handle all months correctly', () => {
      const months = [
        { month: 0, days: 31, name: 'January' },
        { month: 1, days: 28, name: 'February' }, // Non-leap year
        { month: 2, days: 31, name: 'March' },
        { month: 3, days: 30, name: 'April' },
        { month: 4, days: 31, name: 'May' },
        { month: 5, days: 30, name: 'June' },
        { month: 6, days: 31, name: 'July' },
        { month: 7, days: 31, name: 'August' },
        { month: 8, days: 30, name: 'September' },
        { month: 9, days: 31, name: 'October' },
        { month: 10, days: 30, name: 'November' },
        { month: 11, days: 31, name: 'December' },
      ]
      
      months.forEach(({ month, days }) => {
        const date = new Date(2025, month, days)
        const formatted = formatDateForDB(date)
        const parsed = parseDateFromDB(formatted)
        
        expect(parsed.getMonth()).toBe(month)
        expect(parsed.getDate()).toBe(days)
      })
    })
  })

  describe('Timezone Independence', () => {
    it('should produce same result regardless of time', () => {
      const dates = [
        new Date(2025, 0, 15, 0, 0, 0),
        new Date(2025, 0, 15, 6, 0, 0),
        new Date(2025, 0, 15, 12, 0, 0),
        new Date(2025, 0, 15, 18, 0, 0),
        new Date(2025, 0, 15, 23, 59, 59),
      ]
      
      const formatted = dates.map(d => formatDateForDB(d))
      
      formatted.forEach(f => {
        expect(f).toBe('2025-01-15')
      })
    })

    it('should not shift dates across timezone boundaries', () => {
      const date = new Date(2025, 0, 15, 23, 59, 59)
      const formatted = formatDateForDB(date)
      const parsed = parseDateFromDB(formatted)
      
      expect(parsed.getDate()).toBe(15)
      expect(parsed.getMonth()).toBe(0)
      expect(parsed.getFullYear()).toBe(2025)
    })
  })

  describe('String Format Validation', () => {
    it('should always produce 10-character string', () => {
      const dates = [
        new Date(2025, 0, 1),
        new Date(2025, 0, 15),
        new Date(2025, 11, 31),
      ]
      
      dates.forEach(date => {
        const formatted = formatDateForDB(date)
        expect(formatted.length).toBe(10)
      })
    })

    it('should always have dashes in correct positions', () => {
      const date = new Date(2025, 0, 15)
      const formatted = formatDateForDB(date)
      
      expect(formatted[4]).toBe('-')
      expect(formatted[7]).toBe('-')
    })

    it('should match YYYY-MM-DD regex pattern', () => {
      const date = new Date(2025, 0, 15)
      const formatted = formatDateForDB(date)
      
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('Leap Year Handling', () => {
    it('should correctly identify leap years', () => {
      const leapYears = [2000, 2004, 2008, 2012, 2016, 2020, 2024]
      
      leapYears.forEach(year => {
        const date = new Date(year, 1, 29) // February 29
        const formatted = formatDateForDB(date)
        
        expect(formatted).toBe(`${year}-02-29`)
      })
    })

    it('should handle century years correctly', () => {
      // 2000 is a leap year (divisible by 400)
      const date2000 = new Date(2000, 1, 29)
      expect(formatDateForDB(date2000)).toBe('2000-02-29')
      
      // 1900 is not a leap year (divisible by 100 but not 400)
      const date1900 = new Date(1900, 1, 28)
      expect(formatDateForDB(date1900)).toBe('1900-02-28')
    })
  })

  describe('Performance', () => {
    it('should format dates quickly', () => {
      const start = Date.now()
      
      for (let i = 0; i < 1000; i++) {
        const date = new Date(2025, 0, 15)
        formatDateForDB(date)
      }
      
      const duration = Date.now() - start
      expect(duration).toBeLessThan(100) // Should complete in less than 100ms
    })

    it('should parse dates quickly', () => {
      const start = Date.now()
      
      for (let i = 0; i < 1000; i++) {
        parseDateFromDB('2025-01-15')
      }
      
      const duration = Date.now() - start
      expect(duration).toBeLessThan(100) // Should complete in less than 100ms
    })
  })
})

