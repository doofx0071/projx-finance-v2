/**
 * Performance Monitoring Utility
 * 
 * Provides custom performance marks and measurements for:
 * - AI operations (Mistral API calls)
 * - Cache operations (hit/miss rates)
 * - Database queries
 * - API response times
 * 
 * Integrates with Sentry for performance tracking.
 */

import { logger } from './logger'
import * as Sentry from '@sentry/nextjs'

/**
 * Performance metric types
 */
export type PerformanceMetricType =
  | 'ai_operation'
  | 'cache_operation'
  | 'database_query'
  | 'api_request'
  | 'export_operation'

/**
 * Performance metric data
 */
export interface PerformanceMetric {
  type: PerformanceMetricType
  name: string
  duration: number
  metadata?: Record<string, any>
  timestamp: number
}

/**
 * Cache statistics
 */
interface CacheStats {
  hits: number
  misses: number
  totalRequests: number
  hitRate: number
}

// In-memory cache statistics
const cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  totalRequests: 0,
  hitRate: 0,
}

/**
 * Start a performance measurement
 * 
 * @param name - Unique name for the measurement
 * @returns Start time in milliseconds
 * 
 * @example
 * const startTime = startPerformanceMeasure('ai-insights-generation')
 * // ... perform operation
 * endPerformanceMeasure('ai-insights-generation', startTime, 'ai_operation', { model: 'mistral' })
 */
export function startPerformanceMeasure(name: string): number {
  const startTime = performance.now()
  
  // Create performance mark if available
  if (typeof performance !== 'undefined' && performance.mark) {
    try {
      performance.mark(`${name}-start`)
    } catch (error) {
      // Silently fail if performance API not available
    }
  }
  
  return startTime
}

/**
 * End a performance measurement and log the result
 * 
 * @param name - Name of the measurement (must match startPerformanceMeasure)
 * @param startTime - Start time from startPerformanceMeasure
 * @param type - Type of performance metric
 * @param metadata - Additional metadata to log
 * 
 * @example
 * const startTime = startPerformanceMeasure('database-query')
 * const result = await supabase.from('transactions').select('*')
 * endPerformanceMeasure('database-query', startTime, 'database_query', { 
 *   table: 'transactions',
 *   rowCount: result.data?.length 
 * })
 */
export function endPerformanceMeasure(
  name: string,
  startTime: number,
  type: PerformanceMetricType,
  metadata?: Record<string, any>
): number {
  const endTime = performance.now()
  const duration = endTime - startTime
  
  // Create performance mark and measure if available
  if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
    try {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    } catch (error) {
      // Silently fail if performance API not available
    }
  }
  
  // Log the metric
  const metric: PerformanceMetric = {
    type,
    name,
    duration,
    metadata,
    timestamp: Date.now(),
  }
  
  logPerformanceMetric(metric)
  
  // Send to Sentry if duration is significant
  if (duration > 100) { // Only log operations > 100ms
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${type}: ${name}`,
      level: duration > 1000 ? 'warning' : 'info',
      data: {
        duration,
        ...metadata,
      },
    })
  }
  
  return duration
}

/**
 * Log a performance metric
 * 
 * @param metric - Performance metric to log
 */
function logPerformanceMetric(metric: PerformanceMetric): void {
  const { type, name, duration, metadata } = metric
  
  // Determine log level based on duration
  const logLevel = duration > 1000 ? 'warn' : duration > 500 ? 'info' : 'debug'
  
  logger[logLevel]({
    type,
    name,
    duration: `${duration.toFixed(2)}ms`,
    ...metadata,
  }, `Performance: ${name}`)
}

/**
 * Measure an async operation
 * 
 * @param name - Name of the operation
 * @param type - Type of performance metric
 * @param operation - Async function to measure
 * @param metadata - Additional metadata
 * @returns Result of the operation
 * 
 * @example
 * const insights = await measureAsync(
 *   'generate-financial-insights',
 *   'ai_operation',
 *   () => generateFinancialInsights(transactions, budgets),
 *   { transactionCount: transactions.length }
 * )
 */
export async function measureAsync<T>(
  name: string,
  type: PerformanceMetricType,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = startPerformanceMeasure(name)
  
  try {
    const result = await operation()
    endPerformanceMeasure(name, startTime, type, { ...metadata, success: true })
    return result
  } catch (error) {
    endPerformanceMeasure(name, startTime, type, { ...metadata, success: false, error: String(error) })
    throw error
  }
}

/**
 * Record a cache hit
 * 
 * @param key - Cache key
 */
export function recordCacheHit(key: string): void {
  cacheStats.hits++
  cacheStats.totalRequests++
  cacheStats.hitRate = (cacheStats.hits / cacheStats.totalRequests) * 100
  
  logger.debug({
    key,
    hitRate: `${cacheStats.hitRate.toFixed(2)}%`,
    totalRequests: cacheStats.totalRequests,
  }, 'Cache hit')
}

/**
 * Record a cache miss
 * 
 * @param key - Cache key
 */
export function recordCacheMiss(key: string): void {
  cacheStats.misses++
  cacheStats.totalRequests++
  cacheStats.hitRate = (cacheStats.hits / cacheStats.totalRequests) * 100
  
  logger.debug({
    key,
    hitRate: `${cacheStats.hitRate.toFixed(2)}%`,
    totalRequests: cacheStats.totalRequests,
  }, 'Cache miss')
}

/**
 * Get current cache statistics
 * 
 * @returns Cache statistics
 */
export function getCacheStats(): CacheStats {
  return { ...cacheStats }
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  cacheStats.hits = 0
  cacheStats.misses = 0
  cacheStats.totalRequests = 0
  cacheStats.hitRate = 0
}

/**
 * Measure database query performance
 * 
 * @param queryName - Name of the query
 * @param query - Query function to execute
 * @param metadata - Additional metadata
 * @returns Query result
 * 
 * @example
 * const transactions = await measureDatabaseQuery(
 *   'fetch-user-transactions',
 *   () => supabase.from('transactions').select('*').eq('user_id', userId),
 *   { userId, table: 'transactions' }
 * )
 */
export async function measureDatabaseQuery<T>(
  queryName: string,
  query: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return measureAsync(queryName, 'database_query', query, metadata)
}

/**
 * Measure AI operation performance
 * 
 * @param operationName - Name of the AI operation
 * @param operation - AI operation function
 * @param metadata - Additional metadata (model, tokens, etc.)
 * @returns Operation result
 * 
 * @example
 * const insights = await measureAIOperation(
 *   'generate-insights',
 *   () => mistral.chat.complete({ messages }),
 *   { model: 'mistral-large', inputTokens: 1000 }
 * )
 */
export async function measureAIOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return measureAsync(operationName, 'ai_operation', operation, metadata)
}

/**
 * Measure cache operation performance
 * 
 * @param operationName - Name of the cache operation
 * @param operation - Cache operation function
 * @param isHit - Whether this was a cache hit
 * @returns Operation result
 * 
 * @example
 * const cached = await measureCacheOperation(
 *   'get-insights-cache',
 *   () => getCached(cacheKey),
 *   true
 * )
 */
export async function measureCacheOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  isHit: boolean
): Promise<T> {
  const result = await measureAsync(operationName, 'cache_operation', operation, { hit: isHit })
  
  if (isHit) {
    recordCacheHit(operationName)
  } else {
    recordCacheMiss(operationName)
  }
  
  return result
}

/**
 * Get performance summary for logging
 * 
 * @returns Performance summary
 */
export function getPerformanceSummary(): {
  cacheStats: CacheStats
  timestamp: number
} {
  return {
    cacheStats: getCacheStats(),
    timestamp: Date.now(),
  }
}

