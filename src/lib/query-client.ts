import { QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

/**
 * Query Client Configuration
 * 
 * Creates a cached QueryClient instance for React Query.
 * The cache() function is scoped per request in Next.js App Router,
 * preventing data leaks between requests during SSR.
 */

/**
 * Default query options for all queries
 */
const defaultQueryOptions = {
  queries: {
    // Data is considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    // Cache data for 10 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    
    // Don't refetch on window focus (can be overridden per query)
    refetchOnWindowFocus: false,
    
    // Retry failed requests once
    retry: 1,
    
    // Retry delay increases exponentially
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    // Retry failed mutations once
    retry: 1,
  },
}

/**
 * Creates a new QueryClient instance with default options
 * Cached per request to prevent data leaks in SSR
 */
export const getQueryClient = cache(() => {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  })
})

/**
 * Creates a QueryClient for client-side use
 * Use this in client components
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  })
}

