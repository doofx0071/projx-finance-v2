import { Redis } from '@upstash/redis'

/**
 * Cache Utility
 * 
 * Provides caching functionality using Upstash Redis for:
 * - AI-generated insights
 * - Expensive computations
 * - API responses
 * 
 * Features:
 * - TTL (Time To Live) support
 * - Cache invalidation
 * - Type-safe cache keys
 */

// Initialize Redis client from environment variables
const redis = Redis.fromEnv()

/**
 * Cache key prefixes for different data types
 */
export const CACHE_PREFIXES = {
  INSIGHTS: 'insights',
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
} as const

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  INSIGHTS: 60 * 60 * 24, // 24 hours
  REPORTS: 60 * 60, // 1 hour
  ANALYTICS: 60 * 30, // 30 minutes
  SHORT: 60 * 5, // 5 minutes
} as const

/**
 * Build a cache key with prefix and parameters
 */
export function buildCacheKey(prefix: string, ...params: (string | number)[]): string {
  return `${prefix}:${params.join(':')}`
}

/**
 * Get cached data
 * 
 * @param key - Cache key
 * @returns Cached data or null if not found
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key)
    
    if (!cached) {
      return null
    }

    // Redis returns the data as-is if it's already an object
    return cached as T
  } catch (error) {
    console.error('Error getting cached data:', error)
    return null
  }
}

/**
 * Set cached data with TTL
 * 
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttl - Time to live in seconds (default: 1 hour)
 */
export async function setCached<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL.SHORT
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), { ex: ttl })
  } catch (error) {
    console.error('Error setting cached data:', error)
  }
}

/**
 * Delete cached data
 * 
 * @param key - Cache key
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Error deleting cached data:', error)
  }
}

/**
 * Delete multiple cached keys matching a pattern
 * 
 * @param pattern - Pattern to match (e.g., 'insights:user123:*')
 */
export async function deleteCachedPattern(pattern: string): Promise<void> {
  try {
    // Get all keys matching the pattern
    const keys = await redis.keys(pattern)
    
    if (keys.length > 0) {
      // Delete all matching keys
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Error deleting cached pattern:', error)
  }
}

/**
 * Get or set cached data (cache-aside pattern)
 * 
 * @param key - Cache key
 * @param fetcher - Function to fetch data if not cached
 * @param ttl - Time to live in seconds
 * @returns Cached or freshly fetched data
 */
export async function getOrSetCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.SHORT
): Promise<T> {
  // Try to get from cache
  const cached = await getCached<T>(key)
  
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const data = await fetcher()

  // Cache the data
  await setCached(key, data, ttl)

  return data
}

/**
 * Invalidate all insights cache for a user
 * 
 * @param userId - User ID
 */
export async function invalidateInsightsCache(userId: string): Promise<void> {
  const pattern = buildCacheKey(CACHE_PREFIXES.INSIGHTS, userId, '*')
  await deleteCachedPattern(pattern)
}

/**
 * Invalidate all reports cache for a user
 * 
 * @param userId - User ID
 */
export async function invalidateReportsCache(userId: string): Promise<void> {
  const pattern = buildCacheKey(CACHE_PREFIXES.REPORTS, userId, '*')
  await deleteCachedPattern(pattern)
}

/**
 * Invalidate all analytics cache for a user
 * 
 * @param userId - User ID
 */
export async function invalidateAnalyticsCache(userId: string): Promise<void> {
  const pattern = buildCacheKey(CACHE_PREFIXES.ANALYTICS, userId, '*')
  await deleteCachedPattern(pattern)
}

/**
 * Invalidate all cache for a user
 * 
 * @param userId - User ID
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await Promise.all([
    invalidateInsightsCache(userId),
    invalidateReportsCache(userId),
    invalidateAnalyticsCache(userId),
  ])
}

/**
 * Check if cache is available
 */
export async function isCacheAvailable(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error('Cache not available:', error)
    return false
  }
}

