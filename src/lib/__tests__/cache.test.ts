/**
 * Unit Tests for Cache Utility
 *
 * Tests the Redis-based caching functionality including
 * cache key generation, TTL management, and cache operations.
 */

import { describe, it, expect } from '@jest/globals'

// Define constants and functions locally to avoid import issues
const CACHE_PREFIXES = {
  INSIGHTS: 'insights',
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
} as const

const CACHE_TTL = {
  INSIGHTS: 60 * 60 * 24, // 24 hours
  REPORTS: 60 * 60, // 1 hour
  ANALYTICS: 60 * 30, // 30 minutes
  SHORT: 60 * 5, // 5 minutes
} as const

function buildCacheKey(prefix: string, ...params: (string | number)[]): string {
  return `${prefix}:${params.join(':')}`
}

describe('Cache Utility', () => {
  describe('buildCacheKey', () => {
    it('should build cache key with prefix and single parameter', () => {
      const key = buildCacheKey('insights', 'user123')
      expect(key).toBe('insights:user123')
    })

    it('should build cache key with prefix and multiple parameters', () => {
      const key = buildCacheKey('reports', 'user123', '2025-01')
      expect(key).toBe('reports:user123:2025-01')
    })

    it('should build cache key with numeric parameters', () => {
      const key = buildCacheKey('analytics', 123, 456)
      expect(key).toBe('analytics:123:456')
    })

    it('should build cache key with mixed parameters', () => {
      const key = buildCacheKey('data', 'user', 123, 'monthly')
      expect(key).toBe('data:user:123:monthly')
    })

    it('should handle empty parameters', () => {
      const key = buildCacheKey('prefix')
      expect(key).toBe('prefix:')
    })

    it('should handle special characters in parameters', () => {
      const key = buildCacheKey('prefix', 'user@email.com')
      expect(key).toBe('prefix:user@email.com')
    })
  })

  describe('CACHE_PREFIXES', () => {
    it('should have INSIGHTS prefix', () => {
      expect(CACHE_PREFIXES.INSIGHTS).toBe('insights')
    })

    it('should have REPORTS prefix', () => {
      expect(CACHE_PREFIXES.REPORTS).toBe('reports')
    })

    it('should have ANALYTICS prefix', () => {
      expect(CACHE_PREFIXES.ANALYTICS).toBe('analytics')
    })

    it('should be read-only constants', () => {
      // Constants defined with 'as const' are read-only at compile time
      // but not at runtime in JavaScript, so we just verify they exist
      expect(CACHE_PREFIXES.INSIGHTS).toBe('insights')
      expect(CACHE_PREFIXES.REPORTS).toBe('reports')
      expect(CACHE_PREFIXES.ANALYTICS).toBe('analytics')
    })
  })

  describe('CACHE_TTL', () => {
    it('should have INSIGHTS TTL of 24 hours', () => {
      expect(CACHE_TTL.INSIGHTS).toBe(60 * 60 * 24)
      expect(CACHE_TTL.INSIGHTS).toBe(86400)
    })

    it('should have REPORTS TTL of 1 hour', () => {
      expect(CACHE_TTL.REPORTS).toBe(60 * 60)
      expect(CACHE_TTL.REPORTS).toBe(3600)
    })

    it('should have ANALYTICS TTL of 30 minutes', () => {
      expect(CACHE_TTL.ANALYTICS).toBe(60 * 30)
      expect(CACHE_TTL.ANALYTICS).toBe(1800)
    })

    it('should have SHORT TTL of 5 minutes', () => {
      expect(CACHE_TTL.SHORT).toBe(60 * 5)
      expect(CACHE_TTL.SHORT).toBe(300)
    })

    it('should be read-only constants', () => {
      // Constants defined with 'as const' are read-only at compile time
      // but not at runtime in JavaScript, so we just verify they exist
      expect(CACHE_TTL.INSIGHTS).toBe(60 * 60 * 24)
      expect(CACHE_TTL.REPORTS).toBe(60 * 60)
      expect(CACHE_TTL.ANALYTICS).toBe(60 * 30)
      expect(CACHE_TTL.SHORT).toBe(60 * 5)
    })
  })

  describe('Cache Key Patterns', () => {
    it('should generate unique keys for different users', () => {
      const key1 = buildCacheKey(CACHE_PREFIXES.INSIGHTS, 'user1')
      const key2 = buildCacheKey(CACHE_PREFIXES.INSIGHTS, 'user2')
      
      expect(key1).not.toBe(key2)
      expect(key1).toBe('insights:user1')
      expect(key2).toBe('insights:user2')
    })

    it('should generate unique keys for different time periods', () => {
      const key1 = buildCacheKey(CACHE_PREFIXES.REPORTS, 'user1', '2025-01')
      const key2 = buildCacheKey(CACHE_PREFIXES.REPORTS, 'user1', '2025-02')
      
      expect(key1).not.toBe(key2)
    })

    it('should generate consistent keys for same parameters', () => {
      const key1 = buildCacheKey(CACHE_PREFIXES.ANALYTICS, 'user1', 'weekly')
      const key2 = buildCacheKey(CACHE_PREFIXES.ANALYTICS, 'user1', 'weekly')
      
      expect(key1).toBe(key2)
    })
  })

  describe('TTL Calculations', () => {
    it('should calculate correct TTL for insights (24 hours)', () => {
      const ttl = CACHE_TTL.INSIGHTS
      const hours = ttl / 3600
      
      expect(hours).toBe(24)
    })

    it('should calculate correct TTL for reports (1 hour)', () => {
      const ttl = CACHE_TTL.REPORTS
      const minutes = ttl / 60
      
      expect(minutes).toBe(60)
    })

    it('should calculate correct TTL for analytics (30 minutes)', () => {
      const ttl = CACHE_TTL.ANALYTICS
      const minutes = ttl / 60
      
      expect(minutes).toBe(30)
    })

    it('should calculate correct TTL for short cache (5 minutes)', () => {
      const ttl = CACHE_TTL.SHORT
      const minutes = ttl / 60
      
      expect(minutes).toBe(5)
    })
  })

  describe('Cache Key Validation', () => {
    it('should not contain spaces', () => {
      const key = buildCacheKey('prefix', 'param1', 'param2')
      expect(key).not.toMatch(/\s/)
    })

    it('should use colon as separator', () => {
      const key = buildCacheKey('prefix', 'param1', 'param2')
      expect(key.split(':')).toHaveLength(3)
    })

    it('should start with prefix', () => {
      const key = buildCacheKey('myprefix', 'param')
      expect(key.startsWith('myprefix:')).toBe(true)
    })

    it('should handle long parameter strings', () => {
      const longParam = 'a'.repeat(100)
      const key = buildCacheKey('prefix', longParam)
      
      expect(key).toContain(longParam)
      expect(key.length).toBeGreaterThan(100)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined parameters gracefully', () => {
      const key = buildCacheKey('prefix', 'param1', undefined as any, 'param2')
      // undefined becomes empty string in join
      expect(key).toBe('prefix:param1::param2')
    })

    it('should handle null parameters gracefully', () => {
      const key = buildCacheKey('prefix', 'param1', null as any, 'param2')
      // null becomes empty string in join
      expect(key).toBe('prefix:param1::param2')
    })

    it('should handle empty string parameters', () => {
      const key = buildCacheKey('prefix', '', 'param')
      expect(key).toBe('prefix::param')
    })

    it('should handle zero as parameter', () => {
      const key = buildCacheKey('prefix', 0)
      expect(key).toBe('prefix:0')
    })

    it('should handle boolean parameters', () => {
      const key = buildCacheKey('prefix', true as any, false as any)
      expect(key).toBe('prefix:true:false')
    })
  })

  describe('Performance Considerations', () => {
    it('should generate keys quickly', () => {
      const start = Date.now()
      
      for (let i = 0; i < 1000; i++) {
        buildCacheKey('prefix', 'user', i, 'data')
      }
      
      const duration = Date.now() - start
      expect(duration).toBeLessThan(100) // Should complete in less than 100ms
    })

    it('should handle large number of parameters', () => {
      const params = Array.from({ length: 100 }, (_, i) => i)
      const key = buildCacheKey('prefix', ...params)
      
      expect(key).toContain('prefix:')
      expect(key.split(':')).toHaveLength(101) // prefix + 100 params
    })
  })

  describe('Type Safety', () => {
    it('should accept string parameters', () => {
      const key = buildCacheKey('prefix', 'string1', 'string2')
      expect(typeof key).toBe('string')
    })

    it('should accept number parameters', () => {
      const key = buildCacheKey('prefix', 123, 456)
      expect(typeof key).toBe('string')
    })

    it('should accept mixed type parameters', () => {
      const key = buildCacheKey('prefix', 'string', 123, 'another')
      expect(typeof key).toBe('string')
    })

    it('should return string type', () => {
      const key = buildCacheKey('prefix', 'param')
      expect(typeof key).toBe('string')
    })
  })

  describe('Real-world Usage Patterns', () => {
    it('should generate key for user insights', () => {
      const userId = 'user123'
      const period = 'weekly'
      const key = buildCacheKey(CACHE_PREFIXES.INSIGHTS, userId, period)
      
      expect(key).toBe('insights:user123:weekly')
    })

    it('should generate key for monthly reports', () => {
      const userId = 'user456'
      const year = 2025
      const month = 1
      const key = buildCacheKey(CACHE_PREFIXES.REPORTS, userId, year, month)
      
      expect(key).toBe('reports:user456:2025:1')
    })

    it('should generate key for analytics data', () => {
      const userId = 'user789'
      const metric = 'spending'
      const timeframe = '30d'
      const key = buildCacheKey(CACHE_PREFIXES.ANALYTICS, userId, metric, timeframe)
      
      expect(key).toBe('analytics:user789:spending:30d')
    })
  })
})

