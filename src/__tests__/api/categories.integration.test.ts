/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/categories/route'
import { NextRequest } from 'next/server'

// Create mock query result that can be awaited
let mockQueryResult: any = { data: null, error: null }

// Create mock Supabase client with chainable methods
const mockSupabaseClient: any = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  delete: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  order: jest.fn(() => mockSupabaseClient),
  single: jest.fn(() => Promise.resolve(mockQueryResult)),
  is: jest.fn(() => mockSupabaseClient),
  limit: jest.fn(() => mockSupabaseClient),
  range: jest.fn(() => mockSupabaseClient),
  // Make the query chain awaitable - return a Promise that resolves to mockQueryResult
  then: jest.fn((resolve) => Promise.resolve(mockQueryResult).then(resolve)),
}

// Mock Supabase SSR
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => mockSupabaseClient),
}))

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({
    get: jest.fn((name: string) => ({ value: 'mock-cookie' })),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}))

// Mock rate limiting
jest.mock('@/lib/rate-limit', () => ({
  ratelimit: {
    limit: jest.fn(() => Promise.resolve({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    })),
  },
  readRatelimit: {
    limit: jest.fn(() => Promise.resolve({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    })),
  },
  getClientIp: jest.fn(() => '127.0.0.1'),
  getRateLimitHeaders: jest.fn(() => ({})),
}))

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}))

// Helper to create mock NextRequest
function createMockRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost:3000/api/categories'
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body) {
    init.body = JSON.stringify(body)
  }

  return new NextRequest(url, init)
}

describe('/api/categories - Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  describe('GET /api/categories', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock auth to return no user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const request = createMockRequest('GET')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })

    it('should return 200 with categories when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockCategories = [
        {
          id: 'cat-1',
          user_id: 'user-123',
          name: 'Food',
          color: '#FF0000',
          icon: '🍔',
          type: 'expense',
        },
        {
          id: 'cat-2',
          user_id: 'user-123',
          name: 'Salary',
          color: '#00FF00',
          icon: '💰',
          type: 'income',
        },
      ]

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock database query to return categories
      mockQueryResult = {
        data: mockCategories,
        error: null,
      }

      const request = createMockRequest('GET')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.data.categories).toEqual(mockCategories)
    })

    it('should return 500 when database query fails', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock database query to fail
      mockQueryResult = {
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      }

      const request = createMockRequest('GET')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Failed to fetch categories')
    })
  })

  describe('POST /api/categories', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock auth to return no user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const request = createMockRequest('POST', {
        name: 'Food',
        type: 'expense',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })

    it('should return 400 when validation fails', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = createMockRequest('POST', {
        // Missing required fields
        color: '#FF0000',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBeDefined()
    })

    it('should return 201 when category is created successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockCategory = {
        id: 'cat-1',
        user_id: 'user-123',
        name: 'Food',
        color: '#FF0000',
        icon: '🍔',
        type: 'expense',
      }

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock single() to return null for duplicate check, then return category for insert
      let callCount = 0
      mockSupabaseClient.single.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: duplicate check - return null (no existing category)
          return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } })
        } else {
          // Second call: insert - return the new category
          return Promise.resolve({ data: mockCategory, error: null })
        }
      })

      const request = createMockRequest('POST', {
        name: 'Food',
        color: '#FF0000',
        icon: '🍔',
        type: 'expense',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(201)
      expect(json.data.category).toEqual(mockCategory)
    })

    it('should sanitize category name before saving', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockCategory = {
        id: 'cat-1',
        user_id: 'user-123',
        name: 'Food', // Sanitized (no XSS)
        color: '#FF0000',
        icon: '🍔',
        type: 'expense',
      }

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock single() to return null for duplicate check, then return category for insert
      let callCount = 0
      mockSupabaseClient.single.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: duplicate check - return null (no existing category)
          return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } })
        } else {
          // Second call: insert - return the sanitized category
          return Promise.resolve({ data: mockCategory, error: null })
        }
      })

      const request = createMockRequest('POST', {
        name: '<script>alert("XSS")</script>Food',
        color: '#FF0000',
        icon: '🍔',
        type: 'expense',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(201)
      // Name should be sanitized
      expect(json.data.category.name).not.toContain('<script>')
    })

    it('should return 500 when database insert fails', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock single() to return null for duplicate check, then fail on insert
      let callCount = 0
      mockSupabaseClient.single.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: duplicate check - return null (no existing category)
          return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } })
        } else {
          // Second call: insert - return error
          return Promise.resolve({ data: null, error: { code: '23505', message: 'Duplicate key' } })
        }
      })

      const request = createMockRequest('POST', {
        name: 'Food',
        type: 'expense',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Failed to create category')
    })
  })
})

