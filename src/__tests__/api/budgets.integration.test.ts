/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/budgets/route'
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
  gte: jest.fn(() => mockSupabaseClient),
  lte: jest.fn(() => mockSupabaseClient),
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
  const url = 'http://localhost:3000/api/budgets'
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

describe('/api/budgets - Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  describe('GET /api/budgets', () => {
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

    it('should return 200 with budgets when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockBudgets = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          user_id: 'user-123',
          category_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: 500,
          period: 'monthly',
          start_date: '2025-01-01',
          end_date: null,
          categories: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Food',
            color: '#FF0000',
            icon: '',
          },
        },
      ]

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock database query to return budgets
      mockQueryResult = {
        data: mockBudgets,
        error: null,
      }

      const request = createMockRequest('GET')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.budgets).toEqual(mockBudgets)
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
      expect(json.error).toBe('Failed to fetch budgets')
    })
  })

  describe('POST /api/budgets', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock auth to return no user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const request = createMockRequest('POST', {
        category_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 500,
        period: 'monthly',
        start_date: '2025-01-01',
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
        amount: 500,
      })
      
      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBeDefined()
    })

    it('should return 201 when budget is created successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockBudget = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: 'user-123',
        category_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 500,
        period: 'monthly',
        start_date: '2025-01-01',
        end_date: null,
        categories: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Food',
          color: '#FF0000',
          icon: '',
        },
      }

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock single() to handle category check, duplicate check, and insert
      let callCount = 0
      mockSupabaseClient.single.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: category check - return category
          return Promise.resolve({ data: { id: '550e8400-e29b-41d4-a716-446655440000' }, error: null })
        } else if (callCount === 2) {
          // Second call: duplicate check - return null (no existing budget)
          return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } })
        } else {
          // Third call: insert - return the new budget
          return Promise.resolve({ data: mockBudget, error: null })
        }
      })

      const request = createMockRequest('POST', {
        category_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 500,
        period: 'monthly',
        start_date: '2025-01-01',
      })
      
      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(201)
      expect(json.budget).toEqual(mockBudget)
    })

    it('should return 400 when category does not exist', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock single() to return null for category check
      mockSupabaseClient.single.mockImplementation(() => {
        // First call: category check - return null (category not found)
        return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } })
      })

      const request = createMockRequest('POST', {
        category_id: '550e8400-e29b-41d4-a716-446655440099',
        amount: 500,
        period: 'monthly',
        start_date: '2025-01-01',
      })
      
      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Invalid category')
    })

    it('should return 409 when budget already exists for category and period', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      // Mock auth to return user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock single() to handle category check and duplicate check
      let callCount = 0
      mockSupabaseClient.single.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: category check - return category
          return Promise.resolve({ data: { id: '550e8400-e29b-41d4-a716-446655440000' }, error: null })
        } else {
          // Second call: duplicate check - return existing budget
          return Promise.resolve({ data: { id: '550e8400-e29b-41d4-a716-446655440002' }, error: null })
        }
      })

      const request = createMockRequest('POST', {
        category_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 500,
        period: 'monthly',
        start_date: '2025-01-01',
      })
      
      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('An active budget already exists for this category and period')
    })
  })
})
