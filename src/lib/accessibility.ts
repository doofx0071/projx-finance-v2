/**
 * Accessibility Utilities
 * 
 * Helper functions and utilities for improving accessibility across the application.
 * Follows WCAG 2.1 Level AA guidelines.
 */

/**
 * Generates a unique ID for ARIA attributes
 * Useful for aria-labelledby, aria-describedby, etc.
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Announces a message to screen readers using an ARIA live region
 * 
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive'
 * @param timeout - How long to keep the message (default: 1000ms)
 * 
 * @example
 * ```ts
 * announceToScreenReader('Transaction added successfully')
 * announceToScreenReader('Error: Please fill in all fields', 'assertive')
 * ```
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
  timeout: number = 1000
): void {
  // Create or get existing live region
  let liveRegion = document.getElementById(`aria-live-${priority}`)
  
  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = `aria-live-${priority}`
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('role', priority === 'assertive' ? 'alert' : 'status')
    liveRegion.className = 'sr-only' // Screen reader only
    document.body.appendChild(liveRegion)
  }
  
  // Set the message
  liveRegion.textContent = message
  
  // Clear after timeout
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = ''
    }
  }, timeout)
}

/**
 * Traps focus within a container (useful for modals/dialogs)
 * Returns a cleanup function to remove the trap
 * 
 * @param container - The container element to trap focus within
 * @returns Cleanup function
 * 
 * @example
 * ```ts
 * const cleanup = trapFocus(modalElement)
 * // Later...
 * cleanup()
 * ```
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }
  
  container.addEventListener('keydown', handleTabKey)
  
  // Focus first element
  firstElement?.focus()
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Checks if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false
  if (element.hasAttribute('disabled')) return false
  if (element.getAttribute('aria-hidden') === 'true') return false
  
  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden') return false
  
  return true
}

/**
 * Gets all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  
  return Array.from(elements).filter(isFocusable)
}

/**
 * Manages focus restoration after a modal/dialog closes
 * 
 * @example
 * ```ts
 * const restoreFocus = saveFocus()
 * // Open modal...
 * // When closing modal:
 * restoreFocus()
 * ```
 */
export function saveFocus(): () => void {
  const activeElement = document.activeElement as HTMLElement
  
  return () => {
    if (activeElement && typeof activeElement.focus === 'function') {
      // Use setTimeout to ensure the element is visible before focusing
      setTimeout(() => {
        activeElement.focus()
      }, 0)
    }
  }
}

/**
 * Checks if the current color contrast meets WCAG AA standards
 * 
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns Whether the contrast ratio meets WCAG AA standards
 */
export function meetsContrastRequirements(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background)
  const requiredRatio = isLargeText ? 3 : 4.5
  
  return ratio >= requiredRatio
}

/**
 * Calculates the contrast ratio between two colors
 * Based on WCAG 2.1 formula
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Calculates the relative luminance of a color
 */
function getLuminance(color: string): number {
  // Convert hex to RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255
  
  // Apply gamma correction
  const [rs, gs, bs] = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Keyboard event helpers
 */
export const Keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const

/**
 * Checks if a key event matches a specific key
 */
export function isKey(event: KeyboardEvent, key: string): boolean {
  return event.key === key
}

/**
 * Checks if a key event is an activation key (Enter or Space)
 */
export function isActivationKey(event: KeyboardEvent): boolean {
  return event.key === Keys.ENTER || event.key === Keys.SPACE
}

/**
 * Prevents default behavior for activation keys
 * Useful for custom interactive elements
 */
export function handleActivationKey(
  event: KeyboardEvent,
  callback: () => void
): void {
  if (isActivationKey(event)) {
    event.preventDefault()
    callback()
  }
}

