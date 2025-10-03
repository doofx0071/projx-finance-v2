/**
 * Unit Tests for Sanitization Functions
 * 
 * Tests all sanitization utilities to ensure XSS protection
 */

import {
  sanitizeStrict,
  sanitizeBasic,
  sanitizeRich,
  sanitizeTransactionDescription,
  sanitizeCategoryName,
  sanitizeBudgetNotes,
  sanitizeChatbotResponse,
  sanitizeObject,
  sanitizeArray,
  removeSpecialCharacters,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeFilename,
  escapeHtml,
  sanitizeJson,
} from '@/lib/sanitize'

describe('Sanitization Functions', () => {
  describe('sanitizeStrict', () => {
    it('should remove all HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World'
      const result = sanitizeStrict(input)
      expect(result).toBe('Hello World')
      expect(result).not.toContain('<script>')
    })

    it('should remove event handlers', () => {
      const input = '<div onclick="alert()">Click Me</div>'
      const result = sanitizeStrict(input)
      expect(result).toBe('Click Me')
      expect(result).not.toContain('onclick')
    })

    it('should handle empty strings', () => {
      expect(sanitizeStrict('')).toBe('')
    })

    it('should handle null/undefined', () => {
      expect(sanitizeStrict(null as any)).toBe('')
      expect(sanitizeStrict(undefined as any)).toBe('')
    })

    it('should remove dangerous attributes', () => {
      const input = '<img src="x" onerror="alert(1)">'
      const result = sanitizeStrict(input)
      expect(result).not.toContain('onerror')
    })
  })

  describe('sanitizeBasic', () => {
    it('should allow basic formatting tags', () => {
      const input = '<b>Bold</b> <i>Italic</i> <p>Paragraph</p>'
      const result = sanitizeBasic(input)
      expect(result).toContain('<b>')
      expect(result).toContain('<i>')
      expect(result).toContain('<p>')
    })

    it('should remove script tags', () => {
      const input = '<b>Bold</b><script>alert("xss")</script>'
      const result = sanitizeBasic(input)
      expect(result).toContain('<b>')
      expect(result).not.toContain('<script>')
    })

    it('should remove event handlers', () => {
      const input = '<b onclick="alert()">Click</b>'
      const result = sanitizeBasic(input)
      expect(result).not.toContain('onclick')
    })
  })

  describe('sanitizeRich', () => {
    it('should allow rich formatting tags', () => {
      const input = '<h1>Title</h1><a href="https://example.com">Link</a><ul><li>Item</li></ul>'
      const result = sanitizeRich(input)
      expect(result).toContain('<h1>')
      expect(result).toContain('<a')
      expect(result).toContain('<ul>')
      expect(result).toContain('<li>')
    })

    it('should allow safe link attributes', () => {
      const input = '<a href="https://example.com" title="Example">Link</a>'
      const result = sanitizeRich(input)
      expect(result).toContain('href')
      expect(result).toContain('title')
    })

    it('should remove dangerous tags', () => {
      const input = '<h1>Title</h1><script>alert("xss")</script>'
      const result = sanitizeRich(input)
      expect(result).toContain('<h1>')
      expect(result).not.toContain('<script>')
    })
  })

  describe('sanitizeTransactionDescription', () => {
    it('should sanitize transaction descriptions', () => {
      const input = 'Grocery shopping <script>alert()</script>'
      const result = sanitizeTransactionDescription(input)
      expect(result).toBe('Grocery shopping ')
      expect(result).not.toContain('<script>')
    })

    it('should preserve plain text', () => {
      const input = 'Grocery shopping at Walmart'
      const result = sanitizeTransactionDescription(input)
      expect(result).toBe(input)
    })
  })

  describe('sanitizeCategoryName', () => {
    it('should sanitize category names', () => {
      const input = 'Food & <script>alert()</script>Drinks'
      const result = sanitizeCategoryName(input)
      expect(result).not.toContain('<script>')
    })

    it('should preserve special characters', () => {
      const input = 'Food & Drinks'
      const result = sanitizeCategoryName(input)
      expect(result).toContain('&')
    })
  })

  describe('sanitizeBudgetNotes', () => {
    it('should allow basic formatting in budget notes', () => {
      const input = '<b>Important:</b> Monthly budget for groceries'
      const result = sanitizeBudgetNotes(input)
      expect(result).toContain('<b>')
    })

    it('should remove scripts from budget notes', () => {
      const input = 'Budget notes <script>alert()</script>'
      const result = sanitizeBudgetNotes(input)
      expect(result).not.toContain('<script>')
    })
  })

  describe('sanitizeChatbotResponse', () => {
    it('should allow rich formatting in chatbot responses', () => {
      const input = '<h2>Analysis</h2><p>Your spending is <b>high</b></p><ul><li>Item 1</li></ul>'
      const result = sanitizeChatbotResponse(input)
      expect(result).toContain('<h2>')
      expect(result).toContain('<p>')
      expect(result).toContain('<b>')
      expect(result).toContain('<ul>')
    })

    it('should remove dangerous content', () => {
      const input = '<h2>Analysis</h2><script>alert()</script>'
      const result = sanitizeChatbotResponse(input)
      expect(result).toContain('<h2>')
      expect(result).not.toContain('<script>')
    })
  })

  describe('sanitizeObject', () => {
    it('should sanitize specified fields in object', () => {
      const obj = {
        name: 'Test <script>alert()</script>',
        description: 'Description <b>bold</b>',
        amount: 100,
      }
      const result = sanitizeObject(obj, ['name', 'description'])
      expect(result.name).not.toContain('<script>')
      expect(result.description).not.toContain('<b>')
      expect(result.amount).toBe(100)
    })

    it('should not modify non-string fields', () => {
      const obj = {
        name: 'Test',
        amount: 100,
        active: true,
      }
      const result = sanitizeObject(obj, ['name', 'amount', 'active'])
      expect(result.amount).toBe(100)
      expect(result.active).toBe(true)
    })
  })

  describe('sanitizeArray', () => {
    it('should sanitize all objects in array', () => {
      const arr = [
        { name: 'Test1 <script>alert()</script>', value: 1 },
        { name: 'Test2 <b>bold</b>', value: 2 },
      ]
      const result = sanitizeArray(arr, ['name'])
      expect(result[0].name).not.toContain('<script>')
      expect(result[1].name).not.toContain('<b>')
      expect(result[0].value).toBe(1)
      expect(result[1].value).toBe(2)
    })
  })

  describe('removeSpecialCharacters', () => {
    it('should remove null bytes', () => {
      const input = 'Test\0String'
      const result = removeSpecialCharacters(input)
      expect(result).not.toContain('\0')
    })

    it('should remove control characters', () => {
      const input = 'Test\x00\x01\x02String'
      const result = removeSpecialCharacters(input)
      expect(result).toBe('TestString')
    })

    it('should trim whitespace', () => {
      const input = '  Test String  '
      const result = removeSpecialCharacters(input)
      expect(result).toBe('Test String')
    })
  })

  describe('sanitizeEmail', () => {
    it('should validate and sanitize valid emails', () => {
      const input = 'TEST@EXAMPLE.COM'
      const result = sanitizeEmail(input)
      expect(result).toBe('test@example.com')
    })

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('invalid-email')).toBe('')
      expect(sanitizeEmail('test@')).toBe('')
      expect(sanitizeEmail('@example.com')).toBe('')
    })

    it('should trim whitespace', () => {
      const input = '  test@example.com  '
      const result = sanitizeEmail(input)
      expect(result).toBe('test@example.com')
    })
  })

  describe('sanitizeUrl', () => {
    it('should allow valid HTTP URLs', () => {
      const input = 'http://example.com'
      const result = sanitizeUrl(input)
      expect(result).toBe('http://example.com/')
    })

    it('should allow valid HTTPS URLs', () => {
      const input = 'https://example.com/path?query=value'
      const result = sanitizeUrl(input)
      expect(result).toContain('https://example.com')
    })

    it('should reject javascript: protocol', () => {
      const input = 'javascript:alert(1)'
      const result = sanitizeUrl(input)
      expect(result).toBe('')
    })

    it('should reject data: protocol', () => {
      const input = 'data:text/html,<script>alert(1)</script>'
      const result = sanitizeUrl(input)
      expect(result).toBe('')
    })

    it('should reject invalid URLs', () => {
      expect(sanitizeUrl('not-a-url')).toBe('')
      expect(sanitizeUrl('')).toBe('')
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove path traversal attempts', () => {
      const input = '../../../etc/passwd'
      const result = sanitizeFilename(input)
      expect(result).not.toContain('..')
      expect(result).not.toContain('/')
    })

    it('should remove dangerous characters', () => {
      const input = 'file<>:"|?*.txt'
      const result = sanitizeFilename(input)
      expect(result).toBe('file.txt')
    })

    it('should preserve valid filenames', () => {
      const input = 'document-2024.pdf'
      const result = sanitizeFilename(input)
      expect(result).toBe('document-2024.pdf')
    })
  })

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("XSS")</script>'
      const result = escapeHtml(input)
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
      expect(result).toContain('&quot;')
    })

    it('should escape ampersands', () => {
      const input = 'Tom & Jerry'
      const result = escapeHtml(input)
      expect(result).toBe('Tom &amp; Jerry')
    })

    it('should escape quotes', () => {
      const input = `He said "Hello"`
      const result = escapeHtml(input)
      expect(result).toContain('&quot;')
    })
  })

  describe('sanitizeJson', () => {
    it('should parse and re-stringify valid JSON', () => {
      const input = '{"name":"Test","value":123}'
      const result = sanitizeJson(input)
      expect(result).toBe('{"name":"Test","value":123}')
    })

    it('should return empty object for invalid JSON', () => {
      const input = '{invalid json}'
      const result = sanitizeJson(input)
      expect(result).toBe('{}')
    })

    it('should handle empty strings', () => {
      expect(sanitizeJson('')).toBe('{}')
    })
  })
})

