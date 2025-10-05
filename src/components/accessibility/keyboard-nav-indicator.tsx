"use client"

import { useEffect, useState } from "react"
import { useKeyboardNavigation } from "@/hooks/use-accessibility"

/**
 * KeyboardNavigationIndicator Component
 * 
 * Visual indicator that shows when keyboard navigation is active.
 * Useful for development and testing to verify keyboard navigation is working.
 * 
 * Only shows in development mode.
 * 
 * @example
 * ```tsx
 * // Add to root layout or providers
 * <KeyboardNavigationIndicator />
 * ```
 */
export function KeyboardNavigationIndicator() {
  const isKeyboardNavigating = useKeyboardNavigation()
  const [isDevelopment, setIsDevelopment] = useState(false)

  useEffect(() => {
    setIsDevelopment(process.env.NODE_ENV === "development")
  }, [])

  if (!isDevelopment) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] pointer-events-none"
      aria-hidden="true"
    >
      {isKeyboardNavigating && (
        <div className="bg-primary text-primary-foreground px-3 py-2 rounded-md shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          ⌨️ Keyboard Navigation Active
        </div>
      )}
    </div>
  )
}

/**
 * FocusDebugger Component
 * 
 * Shows which element currently has focus.
 * Useful for debugging focus management issues.
 * 
 * Only shows in development mode.
 * 
 * @example
 * ```tsx
 * // Add to root layout or providers
 * <FocusDebugger />
 * ```
 */
export function FocusDebugger() {
  const [focusedElement, setFocusedElement] = useState<string>("")
  const [isDevelopment, setIsDevelopment] = useState(false)

  useEffect(() => {
    setIsDevelopment(process.env.NODE_ENV === "development")
  }, [])

  useEffect(() => {
    if (!isDevelopment) return

    const handleFocusChange = () => {
      const element = document.activeElement
      if (element) {
        const tag = element.tagName.toLowerCase()
        const id = element.id ? `#${element.id}` : ""
        const classes = element.className
          ? `.${element.className.split(" ").slice(0, 2).join(".")}`
          : ""
        const text = element.textContent?.slice(0, 20) || ""
        
        setFocusedElement(`${tag}${id}${classes} ${text ? `"${text}..."` : ""}`)
      }
    }

    // Listen for focus changes
    document.addEventListener("focusin", handleFocusChange)
    
    // Initial check
    handleFocusChange()

    return () => {
      document.removeEventListener("focusin", handleFocusChange)
    }
  }, [isDevelopment])

  if (!isDevelopment || !focusedElement) return null

  return (
    <div
      className="fixed bottom-16 right-4 z-[9999] pointer-events-none max-w-xs"
      aria-hidden="true"
    >
      <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-md shadow-lg text-xs font-mono break-all">
        <div className="font-semibold mb-1">Focused Element:</div>
        <div className="opacity-90">{focusedElement}</div>
      </div>
    </div>
  )
}

/**
 * TabOrderVisualizer Component
 * 
 * Shows the tab order of focusable elements on the page.
 * Press Ctrl+Shift+T to toggle.
 * 
 * Only available in development mode.
 * 
 * @example
 * ```tsx
 * // Add to root layout or providers
 * <TabOrderVisualizer />
 * ```
 */
export function TabOrderVisualizer() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDevelopment, setIsDevelopment] = useState(false)
  const [focusableElements, setFocusableElements] = useState<
    Array<{ element: HTMLElement; index: number; rect: DOMRect }>
  >([])

  useEffect(() => {
    setIsDevelopment(process.env.NODE_ENV === "development")
  }, [])

  useEffect(() => {
    if (!isDevelopment) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+T to toggle
      if (e.ctrlKey && e.shiftKey && e.key === "T") {
        e.preventDefault()
        setIsVisible((prev) => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isDevelopment])

  useEffect(() => {
    if (!isVisible || !isDevelopment) return

    // Find all focusable elements
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    )

    const elementsWithRects = elements
      .map((element, index) => ({
        element,
        index: index + 1,
        rect: element.getBoundingClientRect(),
      }))
      .filter((item) => {
        // Filter out elements that are not visible
        return (
          item.rect.width > 0 &&
          item.rect.height > 0 &&
          item.element.offsetParent !== null
        )
      })

    setFocusableElements(elementsWithRects)
  }, [isVisible, isDevelopment])

  if (!isDevelopment || !isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 pointer-events-none"
        aria-hidden="true"
      />

      {/* Tab order indicators */}
      {focusableElements.map(({ index, rect }) => (
        <div
          key={index}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${rect.left + window.scrollX}px`,
            top: `${rect.top + window.scrollY}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          }}
          aria-hidden="true"
        >
          {/* Border */}
          <div className="absolute inset-0 border-2 border-primary rounded-sm" />
          
          {/* Index badge */}
          <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
            {index}
          </div>
        </div>
      ))}

      {/* Instructions */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
        aria-hidden="true"
      >
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg text-sm font-medium">
          Tab Order Visualizer Active • Press Ctrl+Shift+T to close
        </div>
      </div>
    </>
  )
}

/**
 * AccessibilityDevTools Component
 * 
 * Combines all accessibility development tools.
 * Only shows in development mode.
 * 
 * @example
 * ```tsx
 * // Add to root layout or providers
 * <AccessibilityDevTools />
 * ```
 */
export function AccessibilityDevTools() {
  return (
    <>
      <KeyboardNavigationIndicator />
      <FocusDebugger />
      <TabOrderVisualizer />
    </>
  )
}

