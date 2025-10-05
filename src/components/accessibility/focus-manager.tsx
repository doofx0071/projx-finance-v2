"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

/**
 * FocusManager Component
 * 
 * Manages focus when navigating between pages in Next.js App Router.
 * Automatically moves focus to the main content area when the route changes.
 * 
 * This improves accessibility by:
 * - Announcing page changes to screen readers
 * - Moving focus to main content (skipping navigation)
 * - Preventing focus from staying on previous page elements
 * 
 * @example
 * ```tsx
 * // Add to root layout
 * <body>
 *   <FocusManager />
 *   {children}
 * </body>
 * ```
 */
export function FocusManager() {
  const pathname = usePathname()
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    // Only run on route change, not initial mount
    if (previousPathname.current !== null && previousPathname.current !== pathname) {
      // Find the main content element
      const mainContent = document.getElementById("main-content")
      
      if (mainContent) {
        // Move focus to main content
        mainContent.focus()
        
        // Scroll to top of page
        window.scrollTo(0, 0)
      }
    }
    
    // Update previous pathname
    previousPathname.current = pathname
  }, [pathname])

  return null
}

/**
 * FocusTrap Component
 * 
 * Traps focus within a container, useful for modals and dialogs.
 * Uses the useFocusTrap hook internally.
 * 
 * Note: Most Radix UI components (Dialog, AlertDialog) already have
 * focus trap built-in, so this is mainly for custom components.
 * 
 * @example
 * ```tsx
 * <FocusTrap isActive={isOpen}>
 *   <div>
 *     <button>First focusable</button>
 *     <button>Last focusable</button>
 *   </div>
 * </FocusTrap>
 * ```
 */

interface FocusTrapProps {
  children: React.ReactNode
  isActive: boolean
  className?: string
}

export function FocusTrap({ children, isActive, className }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element when trap activates
    firstElement.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown)

    return () => {
      container.removeEventListener("keydown", handleKeyDown)
    }
  }, [isActive])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

/**
 * FocusGuard Component
 * 
 * Prevents focus from leaving a specific area.
 * Useful for preventing focus from escaping modals or dialogs.
 * 
 * @example
 * ```tsx
 * <FocusGuard>
 *   <Modal>
 *     <button>Close</button>
 *   </Modal>
 * </FocusGuard>
 * ```
 */

interface FocusGuardProps {
  children: React.ReactNode
  onEscape?: () => void
}

export function FocusGuard({ children, onEscape }: FocusGuardProps) {
  const guardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        e.preventDefault()
        onEscape()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onEscape])

  return (
    <div ref={guardRef} role="presentation">
      {children}
    </div>
  )
}

/**
 * AutoFocus Component
 * 
 * Automatically focuses an element when it mounts.
 * Useful for focusing the first input in a form or modal.
 * 
 * @example
 * ```tsx
 * <AutoFocus>
 *   <input type="text" />
 * </AutoFocus>
 * ```
 */

interface AutoFocusProps {
  children: React.ReactElement
  delay?: number
}

export function AutoFocus({ children, delay = 0 }: AutoFocusProps) {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.focus()
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  // Clone the child element and add the ref
  return (
    <>
      {children && typeof children === "object" && "type" in children
        ? {
            ...children,
            ref: elementRef,
          }
        : children}
    </>
  )
}

/**
 * FocusScope Component
 * 
 * Creates a focus scope that can be used to manage focus within a specific area.
 * Useful for complex components with multiple focusable elements.
 * 
 * @example
 * ```tsx
 * <FocusScope>
 *   <button>Button 1</button>
 *   <button>Button 2</button>
 *   <button>Button 3</button>
 * </FocusScope>
 * ```
 */

interface FocusScopeProps {
  children: React.ReactNode
  autoFocus?: boolean
  restoreFocus?: boolean
  className?: string
}

export function FocusScope({
  children,
  autoFocus = false,
  restoreFocus = false,
  className,
}: FocusScopeProps) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement
    }

    if (autoFocus && scopeRef.current) {
      const firstFocusable = scopeRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }

    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [autoFocus, restoreFocus])

  return (
    <div ref={scopeRef} className={className}>
      {children}
    </div>
  )
}

