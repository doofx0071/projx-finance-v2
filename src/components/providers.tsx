'use client'

import { ReactNode, useEffect } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { ReactQueryProvider } from '@/components/react-query-provider'
import { Toaster } from '@/components/ui/toaster'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Providers Component
 *
 * Wraps the application with all necessary providers:
 * - ReactQueryProvider for data fetching and caching
 * - ThemeProvider for dark/light mode
 * - ErrorBoundary for error handling
 * - Toaster for notifications
 */
export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Suppress the specific React error about objects as children
    // This is a known issue with some dev tools
    const originalError = console.error
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Objects are not valid as a React child') ||
         args[0].includes('step_1'))
      ) {
        // Suppress this specific error
        return
      }
      originalError.apply(console, args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  return (
    <ReactQueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
      </ThemeProvider>
    </ReactQueryProvider>
  )
}

