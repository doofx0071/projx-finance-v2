import pino from 'pino'

/**
 * Logger Utility
 * 
 * Provides structured logging with Pino for better debugging and monitoring.
 * 
 * Features:
 * - Multiple log levels (error, warn, info, debug)
 * - Structured JSON logging
 * - Pretty printing in development
 * - No sensitive data logging
 * - Context-aware logging
 * 
 * Usage:
 * import { logger } from '@/lib/logger'
 * 
 * logger.info('User logged in', { userId: '123' })
 * logger.error('Database error', { error: err.message })
 */

// Determine log level from environment
const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

// Create logger instance
export const logger = pino({
  level: LOG_LEVEL,
  // Pretty print in development
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
  // Base configuration
  base: {
    env: process.env.NODE_ENV,
  },
  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      '*.apiKey',
      '*.secret',
    ],
    remove: true,
  },
})

/**
 * Create a child logger with additional context
 * 
 * @param context - Additional context to include in all logs
 * @returns Child logger instance
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context)
}

/**
 * Log API request
 * 
 * @param method - HTTP method
 * @param path - Request path
 * @param userId - User ID (optional)
 */
export function logApiRequest(method: string, path: string, userId?: string) {
  logger.info({
    type: 'api_request',
    method,
    path,
    userId,
  }, `${method} ${path}`)
}

/**
 * Log API response
 * 
 * @param method - HTTP method
 * @param path - Request path
 * @param status - Response status code
 * @param duration - Request duration in ms
 */
export function logApiResponse(
  method: string,
  path: string,
  status: number,
  duration: number
) {
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
  
  logger[level]({
    type: 'api_response',
    method,
    path,
    status,
    duration,
  }, `${method} ${path} ${status} ${duration}ms`)
}

/**
 * Log database query
 * 
 * @param table - Table name
 * @param operation - Operation type (select, insert, update, delete)
 * @param duration - Query duration in ms
 */
export function logDatabaseQuery(
  table: string,
  operation: string,
  duration?: number
) {
  logger.debug({
    type: 'database_query',
    table,
    operation,
    duration,
  }, `DB ${operation} on ${table}`)
}

/**
 * Log authentication event
 * 
 * @param event - Event type (login, logout, register, etc.)
 * @param userId - User ID
 * @param success - Whether the event was successful
 */
export function logAuthEvent(
  event: string,
  userId: string,
  success: boolean
) {
  logger.info({
    type: 'auth_event',
    event,
    userId,
    success,
  }, `Auth: ${event} ${success ? 'success' : 'failed'}`)
}

/**
 * Log cache operation
 * 
 * @param operation - Operation type (hit, miss, set, delete)
 * @param key - Cache key
 */
export function logCacheOperation(operation: string, key: string) {
  logger.debug({
    type: 'cache_operation',
    operation,
    key,
  }, `Cache ${operation}: ${key}`)
}

/**
 * Log error with context
 * 
 * @param error - Error object or message
 * @param context - Additional context
 */
export function logError(error: Error | string, context?: Record<string, any>) {
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'string' ? undefined : error.stack

  logger.error({
    type: 'error',
    error: errorMessage,
    stack: errorStack,
    ...context,
  }, errorMessage)
}

/**
 * Log warning with context
 * 
 * @param message - Warning message
 * @param context - Additional context
 */
export function logWarning(message: string, context?: Record<string, any>) {
  logger.warn({
    type: 'warning',
    ...context,
  }, message)
}

/**
 * Log info with context
 * 
 * @param message - Info message
 * @param context - Additional context
 */
export function logInfo(message: string, context?: Record<string, any>) {
  logger.info({
    type: 'info',
    ...context,
  }, message)
}

/**
 * Log debug with context
 * 
 * @param message - Debug message
 * @param context - Additional context
 */
export function logDebug(message: string, context?: Record<string, any>) {
  logger.debug({
    type: 'debug',
    ...context,
  }, message)
}

// Export default logger
export default logger

