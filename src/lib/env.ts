/**
 * Environment Variable Validation
 * 
 * This file validates all environment variables at startup using Zod.
 * It ensures that all required variables are present and have valid values.
 * 
 * Usage:
 * - Import `env` from this file to access validated environment variables
 * - TypeScript will provide autocomplete and type checking
 * - Invalid or missing variables will cause the app to fail at startup
 */

import { z } from 'zod'

/**
 * Environment Variable Schema
 * 
 * Defines the structure and validation rules for all environment variables.
 * Separates server-side and client-side variables for better security.
 */
const envSchema = z.object({
  // ============================================
  // NODE ENVIRONMENT
  // ============================================
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ============================================
  // SUPABASE (REQUIRED)
  // ============================================
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // ============================================
  // UPSTASH REDIS (REQUIRED)
  // ============================================
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),

  // ============================================
  // MISTRAL AI (REQUIRED)
  // ============================================
  MISTRAL_API_KEY: z.string().min(1, 'MISTRAL_API_KEY is required'),

  // ============================================
  // SENTRY ERROR TRACKING (OPTIONAL)
  // ============================================
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('NEXT_PUBLIC_SENTRY_DSN must be a valid URL').optional(),
  SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // ============================================
  // MAILGUN (OPTIONAL - for email notifications)
  // ============================================
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),

  // ============================================
  // APPLICATION SETTINGS
  // ============================================
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL').optional(),
})

/**
 * Validate Environment Variables
 * 
 * This function validates all environment variables against the schema.
 * It returns a result object with either the validated data or errors.
 */
export function validateEnv() {
  const result = envSchema.safeParse(process.env)
  
  if (!result.success) {
    return {
      success: false as const,
      error: result.error,
    }
  }
  
  return {
    success: true as const,
    data: result.data,
  }
}

/**
 * Validated Environment Variables
 * 
 * This object contains all validated environment variables.
 * Use this instead of process.env for type-safe access.
 * 
 * @throws {Error} If validation fails
 */
export const env = (() => {
  const result = validateEnv()
  
  if (!result.success) {
    // Format error messages for better readability
    const errorMessages = result.error.errors.map((error, idx) => {
      const path = error.path.join('.')
      const message = error.message
      return `  ${idx + 1}. ${path}: ${message}`
    })
    
    const errorOutput = [
      '',
      '❌ ============================================',
      '❌ ENVIRONMENT VARIABLE VALIDATION FAILED',
      '❌ ============================================',
      '',
      'The following environment variables are invalid or missing:',
      '',
      ...errorMessages,
      '',
      '📝 Please check your .env.local file and ensure all required',
      '   variables are set with valid values.',
      '',
      '📖 See .env.example for reference.',
      '',
      '❌ ============================================',
      '',
    ].join('\n')
    
    console.error(errorOutput)
    
    // In development, throw an error to stop the app
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Environment variable validation failed. Check the console for details.')
    }
    
    // In production, exit the process
    process.exit(1)
  }
  
  return result.data
})()

/**
 * Type-safe environment variables
 * 
 * This type can be used to extend the NodeJS.ProcessEnv interface
 * for better TypeScript support throughout the application.
 */
export type Env = z.infer<typeof envSchema>

/**
 * Helper function to check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Helper function to check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Helper function to check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test'

/**
 * Helper function to check if Sentry is enabled
 */
export const isSentryEnabled = !!(env.NEXT_PUBLIC_SENTRY_DSN && env.SENTRY_DSN)

/**
 * Helper function to check if Mailgun is configured
 */
export const isMailgunConfigured = !!(env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN)

