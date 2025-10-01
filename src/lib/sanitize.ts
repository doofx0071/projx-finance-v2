import DOMPurify from 'isomorphic-dompurify'

/**
 * Input Sanitization Utility
 * 
 * Provides XSS protection by sanitizing user-generated content.
 * Uses DOMPurify to remove potentially dangerous HTML/JavaScript.
 * 
 * Features:
 * - HTML sanitization
 * - Script removal
 * - Event handler removal
 * - Safe rendering of user content
 * 
 * Usage:
 * - Sanitize all user inputs before storing or rendering
 * - Use appropriate sanitization level based on context
 */

/**
 * Sanitization configuration presets
 */
const SANITIZE_CONFIG = {
  // Strict: Remove all HTML tags, only allow plain text
  STRICT: {
    ALLOWED_TAGS: [] as string[],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
  },

  // Basic: Allow basic formatting tags
  BASIC: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'] as string[],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
  },

  // Rich: Allow more formatting and links
  RICH: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as string[],
    ALLOWED_ATTR: ['href', 'title', 'target'] as string[],
    KEEP_CONTENT: true,
  },
}

/**
 * Sanitize HTML content with strict settings (plain text only)
 * 
 * @param input - User input to sanitize
 * @returns Sanitized plain text
 */
export function sanitizeStrict(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(input, SANITIZE_CONFIG.STRICT)
}

/**
 * Sanitize HTML content with basic formatting allowed
 * 
 * @param input - User input to sanitize
 * @returns Sanitized HTML with basic formatting
 */
export function sanitizeBasic(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(input, SANITIZE_CONFIG.BASIC)
}

/**
 * Sanitize HTML content with rich formatting allowed
 * 
 * @param input - User input to sanitize
 * @returns Sanitized HTML with rich formatting
 */
export function sanitizeRich(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(input, SANITIZE_CONFIG.RICH)
}

/**
 * Sanitize transaction description
 * Uses strict sanitization to prevent XSS
 * 
 * @param description - Transaction description
 * @returns Sanitized description
 */
export function sanitizeTransactionDescription(description: string): string {
  return sanitizeStrict(description)
}

/**
 * Sanitize category name
 * Uses strict sanitization to prevent XSS
 * 
 * @param name - Category name
 * @returns Sanitized name
 */
export function sanitizeCategoryName(name: string): string {
  return sanitizeStrict(name)
}

/**
 * Sanitize budget notes
 * Uses basic sanitization to allow simple formatting
 * 
 * @param notes - Budget notes
 * @returns Sanitized notes
 */
export function sanitizeBudgetNotes(notes: string): string {
  return sanitizeBasic(notes)
}

/**
 * Sanitize AI chatbot response
 * Uses rich sanitization to preserve formatting
 * 
 * @param response - AI response
 * @returns Sanitized response
 */
export function sanitizeChatbotResponse(response: string): string {
  return sanitizeRich(response)
}

/**
 * Sanitize object properties recursively
 *
 * @param obj - Object to sanitize
 * @param fieldsToSanitize - Array of field names to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldsToSanitize: string[]
): T {
  const sanitized: any = { ...obj }

  for (const field of fieldsToSanitize) {
    if (field in sanitized && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeStrict(sanitized[field])
    }
  }

  return sanitized as T
}

/**
 * Sanitize array of objects
 * 
 * @param arr - Array of objects to sanitize
 * @param fieldsToSanitize - Array of field names to sanitize
 * @returns Sanitized array
 */
export function sanitizeArray<T extends Record<string, any>>(
  arr: T[],
  fieldsToSanitize: string[]
): T[] {
  return arr.map(item => sanitizeObject(item, fieldsToSanitize))
}

/**
 * Remove potentially dangerous characters from input
 * 
 * @param input - User input
 * @returns Cleaned input
 */
export function removeSpecialCharacters(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove null bytes, control characters, and other dangerous characters
  return input
    .replace(/\0/g, '') // Null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
    .trim()
}

/**
 * Validate and sanitize email address
 * 
 * @param email - Email address
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  // Basic email validation and sanitization
  const sanitized = email.toLowerCase().trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailRegex.test(sanitized) ? sanitized : ''
}

/**
 * Sanitize URL
 * 
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }

    return parsed.toString()
  } catch {
    return ''
  }
}

/**
 * Sanitize filename
 * 
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return ''
  }

  // Remove path traversal attempts and dangerous characters
  return filename
    .replace(/[\/\\]/g, '') // Remove slashes
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*\x00-\x1F]/g, '') // Remove invalid filename characters
    .trim()
}

/**
 * Escape HTML entities
 * 
 * @param input - Input to escape
 * @returns Escaped HTML
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  return input.replace(/[&<>"'\/]/g, char => htmlEntities[char] || char)
}

/**
 * Sanitize JSON string
 * 
 * @param input - JSON string to sanitize
 * @returns Sanitized JSON string or empty object string
 */
export function sanitizeJson(input: string): string {
  if (!input || typeof input !== 'string') {
    return '{}'
  }

  try {
    // Parse and re-stringify to ensure valid JSON
    const parsed = JSON.parse(input)
    return JSON.stringify(parsed)
  } catch {
    return '{}'
  }
}

