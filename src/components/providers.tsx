'use client'

import { ReactNode } from 'react'
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

