'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { createQueryClient } from '@/lib/query-client'

interface ReactQueryProviderProps {
  children: React.ReactNode
}

/**
 * React Query Provider Component
 * 
 * Wraps the application with QueryClientProvider to enable React Query.
 * Creates a stable QueryClient instance using useState to prevent
 * recreation on re-renders.
 * 
 * Includes React Query Devtools in development mode for debugging.
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Create QueryClient once and keep it stable across re-renders
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools temporarily disabled to fix rendering error */}
      {/* {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )} */}
    </QueryClientProvider>
  )
}

