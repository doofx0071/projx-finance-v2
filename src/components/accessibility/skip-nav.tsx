"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * SkipNav Component
 * 
 * Provides a "Skip to main content" link that appears when focused via keyboard.
 * This is a critical accessibility feature that allows keyboard users to bypass
 * repetitive navigation and jump directly to the main content.
 * 
 * WCAG 2.1 Level A - Bypass Blocks (2.4.1)
 * 
 * @example
 * ```tsx
 * // In your root layout
 * <SkipNav />
 * <Navigation />
 * <main id="main-content">
 *   {children}
 * </main>
 * ```
 */
export function SkipNav() {
  return (
    <a
      href="#main-content"
      className={cn(
        // Position off-screen by default
        "fixed top-0 left-0 z-[9999]",
        "-translate-y-full",
        // Style when focused
        "focus:translate-y-0",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // Visual styling
        "bg-primary text-primary-foreground",
        "px-4 py-2 rounded-br-md",
        "font-medium text-sm",
        "transition-transform duration-200",
        // Ensure it's above everything when focused
        "focus:z-[10000]"
      )}
      // Announce to screen readers
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  )
}

/**
 * SkipNavContent Component
 * 
 * Marks the main content area that the skip navigation link targets.
 * This should wrap your main content area.
 * 
 * @example
 * ```tsx
 * <SkipNavContent>
 *   <YourMainContent />
 * </SkipNavContent>
 * ```
 */
export function SkipNavContent({ 
  children,
  className,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn("focus:outline-none", className)}
      {...props}
    >
      {children}
    </main>
  )
}

