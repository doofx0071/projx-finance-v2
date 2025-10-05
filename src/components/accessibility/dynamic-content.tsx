"use client"

import * as React from "react"
import { useAriaLive, useScreenReaderAnnounce } from "@/hooks/use-accessibility"
import { cn } from "@/lib/utils"

/**
 * LiveRegion Component
 * 
 * Creates an ARIA live region for announcing dynamic content updates.
 * 
 * @example
 * ```tsx
 * <LiveRegion priority="polite">
 *   {statusMessage}
 * </LiveRegion>
 * ```
 */

interface LiveRegionProps {
  children: React.ReactNode
  priority?: "polite" | "assertive" | "off"
  atomic?: boolean
  relevant?: "additions" | "removals" | "text" | "all"
  className?: string
}

export function LiveRegion({
  children,
  priority = "polite",
  atomic = true,
  relevant = "all",
  className,
}: LiveRegionProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={className}
    >
      {children}
    </div>
  )
}

/**
 * LoadingState Component
 * 
 * Displays a loading state with proper ARIA attributes.
 * Announces loading status to screen readers.
 * 
 * @example
 * ```tsx
 * <LoadingState
 *   isLoading={isLoading}
 *   loadingText="Loading data..."
 * >
 *   <DataDisplay />
 * </LoadingState>
 * ```
 */

interface LoadingStateProps {
  children: React.ReactNode
  isLoading: boolean
  loadingText?: string
  loadingComponent?: React.ReactNode
  className?: string
}

export function LoadingState({
  children,
  isLoading,
  loadingText = "Loading...",
  loadingComponent,
  className,
}: LoadingStateProps) {
  const announce = useScreenReaderAnnounce()
  const previousLoading = React.useRef(isLoading)

  React.useEffect(() => {
    if (isLoading && !previousLoading.current) {
      announce(loadingText, "polite")
    } else if (!isLoading && previousLoading.current) {
      announce("Content loaded", "polite")
    }
    previousLoading.current = isLoading
  }, [isLoading, loadingText, announce])

  if (isLoading) {
    return (
      <div
        className={cn("flex items-center justify-center p-8", className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {loadingComponent || (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">{loadingText}</span>
          </div>
        )}
      </div>
    )
  }

  return <div className={className}>{children}</div>
}

/**
 * StatusAnnouncement Component
 * 
 * Announces status messages to screen readers without visual display.
 * Useful for announcing background operations.
 * 
 * @example
 * ```tsx
 * <StatusAnnouncement
 *   message="Item added to cart"
 *   priority="polite"
 * />
 * ```
 */

interface StatusAnnouncementProps {
  message: string
  priority?: "polite" | "assertive"
}

export function StatusAnnouncement({
  message,
  priority = "polite",
}: StatusAnnouncementProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

/**
 * DynamicContent Component
 * 
 * Wrapper for content that updates dynamically.
 * Announces updates to screen readers.
 * 
 * @example
 * ```tsx
 * <DynamicContent
 *   isUpdating={isUpdating}
 *   updateMessage="Updating data..."
 * >
 *   <DataDisplay data={data} />
 * </DynamicContent>
 * ```
 */

interface DynamicContentProps {
  children: React.ReactNode
  isUpdating?: boolean
  updateMessage?: string
  className?: string
}

export function DynamicContent({
  children,
  isUpdating = false,
  updateMessage = "Updating...",
  className,
}: DynamicContentProps) {
  return (
    <div
      className={cn("relative", className)}
      aria-busy={isUpdating}
      aria-live="polite"
    >
      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-md bg-background px-4 py-2 shadow-lg">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium">{updateMessage}</span>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

/**
 * ProgressAnnouncer Component
 * 
 * Announces progress updates to screen readers.
 * Useful for long-running operations.
 * 
 * @example
 * ```tsx
 * <ProgressAnnouncer
 *   progress={progress}
 *   total={total}
 *   label="Uploading files"
 * />
 * ```
 */

interface ProgressAnnouncerProps {
  progress: number
  total: number
  label?: string
  showPercentage?: boolean
}

export function ProgressAnnouncer({
  progress,
  total,
  label = "Progress",
  showPercentage = true,
}: ProgressAnnouncerProps) {
  const percentage = Math.round((progress / total) * 100)
  const announce = useScreenReaderAnnounce()
  const previousPercentage = React.useRef(0)

  React.useEffect(() => {
    // Announce every 10% progress
    if (percentage % 10 === 0 && percentage !== previousPercentage.current) {
      announce(`${label}: ${percentage}% complete`, "polite")
      previousPercentage.current = percentage
    }
  }, [percentage, label, announce])

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={label}
      className="sr-only"
    >
      {showPercentage && `${percentage}%`}
    </div>
  )
}

/**
 * ErrorBoundaryAnnouncer Component
 * 
 * Announces errors to screen readers.
 * Should be used with React Error Boundaries.
 * 
 * @example
 * ```tsx
 * <ErrorBoundaryAnnouncer
 *   error={error}
 *   errorMessage="An error occurred while loading data"
 * />
 * ```
 */

interface ErrorBoundaryAnnouncerProps {
  error: Error | null
  errorMessage?: string
}

export function ErrorBoundaryAnnouncer({
  error,
  errorMessage = "An error occurred",
}: ErrorBoundaryAnnouncerProps) {
  const announce = useScreenReaderAnnounce()

  React.useEffect(() => {
    if (error) {
      announce(errorMessage, "assertive")
    }
  }, [error, errorMessage, announce])

  if (!error) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-md border border-destructive bg-destructive/10 p-4"
    >
      <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      {process.env.NODE_ENV === "development" && (
        <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>
      )}
    </div>
  )
}

/**
 * DataUpdateAnnouncer Component
 * 
 * Announces when data has been updated.
 * Useful for tables, lists, and other data displays.
 * 
 * @example
 * ```tsx
 * <DataUpdateAnnouncer
 *   itemCount={items.length}
 *   itemType="transactions"
 * />
 * ```
 */

interface DataUpdateAnnouncerProps {
  itemCount: number
  itemType: string
  isLoading?: boolean
}

export function DataUpdateAnnouncer({
  itemCount,
  itemType,
  isLoading = false,
}: DataUpdateAnnouncerProps) {
  const announce = useScreenReaderAnnounce()
  const previousCount = React.useRef(itemCount)

  React.useEffect(() => {
    if (!isLoading && itemCount !== previousCount.current) {
      const message =
        itemCount === 0
          ? `No ${itemType} found`
          : `${itemCount} ${itemType} ${itemCount === 1 ? "item" : "items"} loaded`
      announce(message, "polite")
      previousCount.current = itemCount
    }
  }, [itemCount, itemType, isLoading, announce])

  return (
    <div role="status" aria-live="polite" className="sr-only">
      {isLoading
        ? `Loading ${itemType}...`
        : `${itemCount} ${itemType} ${itemCount === 1 ? "item" : "items"}`}
    </div>
  )
}

