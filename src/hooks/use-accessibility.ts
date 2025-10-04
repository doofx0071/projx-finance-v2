"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { generateAriaId, trapFocus, saveFocus, announceToScreenReader } from '@/lib/accessibility'

/**
 * Hook to generate a stable unique ID for ARIA attributes
 * 
 * @param prefix - Prefix for the ID
 * @returns Stable unique ID
 * 
 * @example
 * ```tsx
 * const labelId = useAriaId('form-label')
 * return <label id={labelId}>Name</label>
 * ```
 */
export function useAriaId(prefix: string): string {
  const [id] = useState(() => generateAriaId(prefix))
  return id
}

/**
 * Hook to manage focus trap in a container (for modals/dialogs)
 * 
 * @param isActive - Whether the focus trap should be active
 * @returns Ref to attach to the container element
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * const trapRef = useFocusTrap(isOpen)
 * 
 * return (
 *   <div ref={trapRef}>
 *     <button onClick={() => setIsOpen(false)}>Close</button>
 *   </div>
 * )
 * ```
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const ref = useRef<T>(null)
  
  useEffect(() => {
    if (!isActive || !ref.current) return
    
    const cleanup = trapFocus(ref.current)
    return cleanup
  }, [isActive])
  
  return ref
}

/**
 * Hook to manage focus restoration after a component unmounts
 * Useful for modals/dialogs that should restore focus to the trigger element
 * 
 * @param isOpen - Whether the component is open
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * useFocusRestore(isOpen)
 * ```
 */
export function useFocusRestore(isOpen: boolean): void {
  const restoreFocusRef = useRef<(() => void) | null>(null)
  
  useEffect(() => {
    if (isOpen) {
      // Save focus when opening
      restoreFocusRef.current = saveFocus()
    } else if (restoreFocusRef.current) {
      // Restore focus when closing
      restoreFocusRef.current()
      restoreFocusRef.current = null
    }
  }, [isOpen])
}

/**
 * Hook to announce messages to screen readers
 * 
 * @returns Function to announce messages
 * 
 * @example
 * ```tsx
 * const announce = useScreenReaderAnnounce()
 * 
 * const handleSubmit = () => {
 *   // ... submit logic
 *   announce('Form submitted successfully')
 * }
 * ```
 */
export function useScreenReaderAnnounce() {
  return useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    announceToScreenReader(message, priority)
  }, [])
}

/**
 * Hook to detect if user prefers reduced motion
 * Useful for disabling animations for users with motion sensitivity
 * 
 * @returns Whether user prefers reduced motion
 * 
 * @example
 * ```tsx
 * const prefersReducedMotion = usePrefersReducedMotion()
 * 
 * return (
 *   <div className={prefersReducedMotion ? '' : 'animate-fade-in'}>
 *     Content
 *   </div>
 * )
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return prefersReducedMotion
}

/**
 * Hook to detect if user is using keyboard navigation
 * Useful for showing focus indicators only for keyboard users
 * 
 * @returns Whether user is using keyboard navigation
 * 
 * @example
 * ```tsx
 * const isKeyboardUser = useKeyboardNavigation()
 * 
 * return (
 *   <button className={isKeyboardUser ? 'focus-visible:ring-2' : ''}>
 *     Click me
 *   </button>
 * )
 * ```
 */
export function useKeyboardNavigation(): boolean {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true)
      }
    }
    
    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
  
  return isKeyboardUser
}

/**
 * Hook to manage roving tabindex for keyboard navigation in lists/grids
 * Implements the roving tabindex pattern for arrow key navigation
 * 
 * @param itemCount - Number of items in the list
 * @param orientation - 'horizontal' or 'vertical'
 * @returns Current active index and keyboard event handler
 * 
 * @example
 * ```tsx
 * const items = ['Item 1', 'Item 2', 'Item 3']
 * const { activeIndex, handleKeyDown } = useRovingTabIndex(items.length)
 * 
 * return (
 *   <div role="menu" onKeyDown={handleKeyDown}>
 *     {items.map((item, index) => (
 *       <button
 *         key={index}
 *         role="menuitem"
 *         tabIndex={activeIndex === index ? 0 : -1}
 *       >
 *         {item}
 *       </button>
 *     ))}
 *   </div>
 * )
 * ```
 */
export function useRovingTabIndex(
  itemCount: number,
  orientation: 'horizontal' | 'vertical' = 'vertical'
) {
  const [activeIndex, setActiveIndex] = useState(0)
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event
    
    const isNext = orientation === 'vertical' 
      ? key === 'ArrowDown' 
      : key === 'ArrowRight'
    const isPrev = orientation === 'vertical' 
      ? key === 'ArrowUp' 
      : key === 'ArrowLeft'
    
    if (isNext) {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % itemCount)
    } else if (isPrev) {
      event.preventDefault()
      setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount)
    } else if (key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (key === 'End') {
      event.preventDefault()
      setActiveIndex(itemCount - 1)
    }
  }, [itemCount, orientation])
  
  return { activeIndex, handleKeyDown, setActiveIndex }
}

/**
 * Hook to manage ARIA live region announcements
 * Creates and manages a live region for dynamic content updates
 * 
 * @param priority - 'polite' or 'assertive'
 * @returns Function to announce messages
 * 
 * @example
 * ```tsx
 * const announce = useAriaLive('polite')
 * 
 * useEffect(() => {
 *   if (data) {
 *     announce(`Loaded ${data.length} items`)
 *   }
 * }, [data, announce])
 * ```
 */
export function useAriaLive(priority: 'polite' | 'assertive' = 'polite') {
  const liveRegionRef = useRef<HTMLDivElement | null>(null)
  
  useEffect(() => {
    // Create live region
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('role', priority === 'assertive' ? 'alert' : 'status')
    liveRegion.className = 'sr-only'
    document.body.appendChild(liveRegion)
    liveRegionRef.current = liveRegion
    
    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current)
      }
    }
  }, [priority])
  
  const announce = useCallback((message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message
      
      // Clear after 1 second
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = ''
        }
      }, 1000)
    }
  }, [])
  
  return announce
}

