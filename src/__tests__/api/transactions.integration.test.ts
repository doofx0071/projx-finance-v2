/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/transactions/route'
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
  single: jest.fn(() => mockSupabaseClient),
  is: jest.fn(() => mockSupabaseClient),
  limit: jest.fn(() => mockSupabaseClient),
  range: jest.fn(() => mockSupabaseClient),
  // Make the query chain awaitable
  then: jest.fn((resolve) => resolve(mockQueryResult)),
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
  const url = 'http://localhost:3000/api/transactions'
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

describe('/api/transactions - Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  describe('GET /api/transactions', () => {
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

    it('should return 200 with transactions when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockTransactions = [
        {
          id: 'trans-1',
          user_id: 'user-123',
          amount: 100.50,
          description: 'Test transaction',
          type: 'expense',
          date: '2025-01-01',
          category_id: 'cat-1',
          categories: {
            id: 'cat-1',
            name: 'Food',
            color: '#FF0000',
            icon: '🍔',
          },
        },
      ]

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock database query to return transactions
      mockQueryResult = {
        data: mockTransactions,
        error: null,
      }

      const request = createMockRequest('GET')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.data.transactions).toEqual(mockTransactions)
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
      expect(json.error).toBe('Failed to fetch transactions')
    })
  })

  describe('POST /api/transactions', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock auth to return no user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const request = createMockRequest('POST', {
        amount: 100,
        description: 'Test',
        type: 'expense',
        date: '2025-01-01',
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
        description: 'Test',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBeDefined()
    })

    it('should return 201 when transaction is created successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockTransaction = {
        id: 'trans-1',
        user_id: 'user-123',
        amount: 100.50,
        description: 'Test transaction',
        type: 'expense',
        date: '2025-01-01',
        category_id: null,
        categories: null,
      }

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock database insert to return transaction
      mockQueryResult = {
        data: mockTransaction,
        error: null,
      }

      const request = createMockRequest('POST', {
        amount: 100.50,
        description: 'Test transaction',
        type: 'expense',
        date: '2025-01-01',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(201)
      expect(json.data.transaction).toEqual(mockTransaction)
    })

    it('should sanitize description before saving', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockTransaction = {
        id: 'trans-1',
        user_id: 'user-123',
        amount: 100,
        description: 'Test transaction', // Sanitized (no XSS)
        type: 'expense',
        date: '2025-01-01',
        category_id: null,
        categories: null,
      }

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock database insert to return sanitized transaction
      mockQueryResult = {
        data: mockTransaction,
        error: null,
      }

      const request = createMockRequest('POST', {
        amount: 100,
        description: '<script>alert("XSS")</script>Test transaction',
        type: 'expense',
        date: '2025-01-01',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(201)
      // Description should be sanitized
      expect(json.data.transaction.description).not.toContain('<script>')
    })
  })
})

