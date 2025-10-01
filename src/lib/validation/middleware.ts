/**
 * API Validation Middleware
 * 
 * This file provides utilities for validating API request bodies
 * using Zod schemas. It includes helper functions for parsing
 * and validating request data with proper error handling.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

/**
 * Validation Error Response
 * 
 * Standard error response format for validation failures
 */
export interface ValidationErrorResponse {
  error: string
  details: Array<{
    field: string
    message: string
  }>
}

/**
 * Format Zod Errors
 * 
 * Converts Zod validation errors into a user-friendly format
 */
function formatZodErrors(error: ZodError): ValidationErrorResponse {
  const details = error.errors.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }))

  return {
    error: 'Validation failed',
    details,
  }
}

/**
 * Validate Request Body
 * 
 * Validates the request body against a Zod schema and returns
 * either the validated data or an error response.
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validated data or error response
 * 
 * @example
 * ```typescript
 * const result = await validateRequestBody(request, createTransactionSchema)
 * if (result.error) {
 *   return NextResponse.json(result.error, { status: 400 })
 * }
 * const data = result.data
 * ```
 */
export async function validateRequestBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<
  | { success: true; data: z.infer<T>; error: null }
  | { success: false; data: null; error: ValidationErrorResponse }
> {
  try {
    // Parse request body
    const body = await request.json()

    // Validate against schema
    const result = schema.safeParse(body)

    if (!result.success) {
      return {
        success: false,
        data: null,
        error: formatZodErrors(result.error),
      }
    }

    return {
      success: true,
      data: result.data,
      error: null,
    }
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return {
        success: false,
        data: null,
        error: {
          error: 'Invalid JSON',
          details: [
            {
              field: 'body',
              message: 'Request body must be valid JSON',
            },
          ],
        },
      }
    }

    // Handle other errors
    return {
      success: false,
      data: null,
      error: {
        error: 'Validation failed',
        details: [
          {
            field: 'unknown',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
          },
        ],
      },
    }
  }
}

/**
 * Validate Query Parameters
 * 
 * Validates URL query parameters against a Zod schema
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validated data or error response
 */
export function validateQueryParams<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): 
  | { success: true; data: z.infer<T>; error: null }
  | { success: false; data: null; error: ValidationErrorResponse }
{
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams
    const params: Record<string, string> = {}
    
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    // Validate against schema
    const result = schema.safeParse(params)

    if (!result.success) {
      return {
        success: false,
        data: null,
        error: formatZodErrors(result.error),
      }
    }

    return {
      success: true,
      data: result.data,
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: {
        error: 'Validation failed',
        details: [
          {
            field: 'query',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
          },
        ],
      },
    }
  }
}

/**
 * Create Validation Error Response
 * 
 * Helper function to create a standardized validation error response
 * 
 * @param error - Validation error response
 * @returns Next.js JSON response with 400 status
 */
export function createValidationErrorResponse(
  error: ValidationErrorResponse
): NextResponse {
  return NextResponse.json(error, { status: 400 })
}

/**
 * Validate and Parse Request Body
 * 
 * Convenience function that validates the request body and returns
 * either the data or an error response ready to be returned.
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validated data or error response
 * 
 * @example
 * ```typescript
 * const result = await validateAndParseBody(request, createTransactionSchema)
 * if ('error' in result) {
 *   return result // Return error response directly
 * }
 * const data = result.data
 * ```
 */
export async function validateAndParseBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<
  | { data: z.infer<T> }
  | NextResponse
> {
  const result = await validateRequestBody(request, schema)

  if (!result.success) {
    return createValidationErrorResponse(result.error)
  }

  return { data: result.data }
}

/**
 * Validate Path Parameter
 * 
 * Validates a single path parameter (e.g., ID from URL)
 * 
 * @param value - Parameter value to validate
 * @param schema - Zod schema to validate against
 * @param paramName - Name of the parameter (for error messages)
 * @returns Validated data or error response
 */
export function validatePathParam<T extends z.ZodType>(
  value: string,
  schema: T,
  paramName: string = 'id'
): 
  | { success: true; data: z.infer<T>; error: null }
  | { success: false; data: null; error: ValidationErrorResponse }
{
  const result = schema.safeParse(value)

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: {
        error: 'Invalid parameter',
        details: [
          {
            field: paramName,
            message: result.error.errors[0]?.message || 'Invalid parameter value',
          },
        ],
      },
    }
  }

  return {
    success: true,
    data: result.data,
    error: null,
  }
}

