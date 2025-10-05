# Accessibility (A11y) Guide

PHPinancia is committed to providing an accessible experience for all users, following WCAG 2.1 Level AA guidelines.

## Table of Contents

1. [Overview](#overview)
2. [Implemented Features](#implemented-features)
3. [Testing](#testing)
4. [Best Practices](#best-practices)
5. [Resources](#resources)

---

## Overview

This application implements comprehensive accessibility features to ensure usability for:
- **Keyboard users** - Full keyboard navigation support
- **Screen reader users** - Proper ARIA labels and semantic HTML
- **Users with visual impairments** - High contrast, proper color usage
- **Users with motor impairments** - Large click targets, focus indicators
- **Users with cognitive disabilities** - Clear language, consistent navigation

---

## Implemented Features

### 1. Skip Navigation
- **Feature**: "Skip to main content" link appears when tabbing
- **Location**: Top of every page
- **Usage**: Press `Tab` on page load to reveal the skip link
- **Benefit**: Allows keyboard users to bypass repetitive navigation

### 2. Keyboard Navigation
- **All interactive elements** are keyboard accessible
- **Tab order** follows logical reading order
- **Focus indicators** are visible on all interactive elements
- **Keyboard shortcuts**:
  - `Tab` - Move forward through interactive elements
  - `Shift + Tab` - Move backward through interactive elements
  - `Enter` or `Space` - Activate buttons and links
  - `Escape` - Close modals and dialogs
  - `Arrow keys` - Navigate within menus and lists

### 3. ARIA Labels and Attributes
- **Navigation**: Proper `role="navigation"` and `aria-label` attributes
- **Landmarks**: Semantic HTML5 elements (`<main>`, `<nav>`, `<header>`)
- **Forms**: All inputs have associated labels
- **Buttons**: Descriptive `aria-label` for icon-only buttons
- **Live regions**: Dynamic content updates announced to screen readers

### 4. Focus Management
- **Modal dialogs**: Focus trapped within modal when open
- **Focus restoration**: Focus returns to trigger element when modal closes
- **Visible focus indicators**: Clear outline on focused elements
- **Skip links**: Allow bypassing repetitive content

### 5. Color and Contrast
- **WCAG AA compliance**: Minimum 4.5:1 contrast ratio for normal text
- **Large text**: Minimum 3:1 contrast ratio for 18pt+ text
- **Color independence**: Information not conveyed by color alone
- **Dark mode support**: Maintains contrast ratios in both themes

### 6. Screen Reader Support
- **Semantic HTML**: Proper use of headings, lists, and landmarks
- **Alt text**: All images have descriptive alt attributes
- **ARIA live regions**: Dynamic content updates announced
- **Form validation**: Error messages announced to screen readers
- **Loading states**: Proper `aria-busy` and `aria-live` attributes

### 7. Responsive and Mobile Accessible
- **Touch targets**: Minimum 44x44px for all interactive elements
- **Zoom support**: Content remains usable at 200% zoom
- **Orientation**: Works in both portrait and landscape
- **Mobile screen readers**: Compatible with VoiceOver and TalkBack

---

## Testing

### Automated Testing

We use **@axe-core/react** for automated accessibility testing in development:

```bash
# Run in development mode to see accessibility violations in console
npm run dev
```

Axe-core will automatically check for:
- Missing alt text
- Insufficient color contrast
- Missing form labels
- Invalid ARIA attributes
- Keyboard accessibility issues

### Manual Testing

#### Keyboard Navigation Test
1. **Tab through the page** - Ensure all interactive elements are reachable
2. **Check focus indicators** - Visible outline on focused elements
3. **Test skip link** - Press Tab on page load, should see "Skip to main content"
4. **Test modals** - Focus should trap within modal, Escape should close
5. **Test forms** - All inputs should be reachable and submittable via keyboard

#### Screen Reader Test
**NVDA (Windows - Free)**:
1. Download from [nvaccess.org](https://www.nvaccess.org/)
2. Press `Insert + Down Arrow` to start reading
3. Press `Tab` to navigate interactive elements
4. Press `H` to navigate by headings

**JAWS (Windows - Commercial)**:
1. Similar to NVDA
2. Press `Insert + F7` for elements list

**VoiceOver (Mac - Built-in)**:
1. Press `Cmd + F5` to enable
2. Press `Control + Option + Right Arrow` to navigate
3. Press `Control + Option + Space` to activate

**TalkBack (Android - Built-in)**:
1. Settings > Accessibility > TalkBack
2. Swipe right to navigate
3. Double-tap to activate

#### Color Contrast Test
Use browser extensions:
- **WAVE** - [wave.webaim.org](https://wave.webaim.org/)
- **axe DevTools** - Browser extension
- **Lighthouse** - Built into Chrome DevTools

---

## Best Practices

### For Developers

#### 1. Always Use Semantic HTML
```tsx
// ✅ Good
<button onClick={handleClick}>Submit</button>

// ❌ Bad
<div onClick={handleClick}>Submit</div>
```

#### 2. Provide Descriptive Labels
```tsx
// ✅ Good
<button aria-label="Delete transaction">
  <TrashIcon />
</button>

// ❌ Bad
<button>
  <TrashIcon />
</button>
```

#### 3. Use ARIA Attributes Correctly
```tsx
// ✅ Good
<div role="alert" aria-live="assertive">
  Error: Please fill in all fields
</div>

// ❌ Bad
<div>Error: Please fill in all fields</div>
```

#### 4. Manage Focus Properly
```tsx
// ✅ Good - Use our hooks
import { useFocusTrap, useFocusRestore } from '@/hooks/use-accessibility'

function Modal({ isOpen }) {
  const trapRef = useFocusTrap(isOpen)
  useFocusRestore(isOpen)
  
  return <div ref={trapRef}>...</div>
}
```

#### 5. Announce Dynamic Content
```tsx
// ✅ Good
import { useScreenReaderAnnounce } from '@/hooks/use-accessibility'

function Component() {
  const announce = useScreenReaderAnnounce()
  
  const handleSubmit = () => {
    // ... submit logic
    announce('Form submitted successfully')
  }
}
```

### For Designers

1. **Ensure sufficient color contrast** (4.5:1 for normal text, 3:1 for large text)
2. **Don't rely on color alone** to convey information
3. **Make interactive elements large enough** (minimum 44x44px)
4. **Provide clear focus indicators** (visible outline or border)
5. **Use clear, simple language** in UI text

---

## Accessibility Utilities

### Hooks

```tsx
import {
  useAriaId,           // Generate unique IDs for ARIA attributes
  useFocusTrap,        // Trap focus within a container
  useFocusRestore,     // Restore focus after modal closes
  useScreenReaderAnnounce, // Announce messages to screen readers
  usePrefersReducedMotion, // Detect if user prefers reduced motion
  useKeyboardNavigation,   // Detect if user is using keyboard
  useRovingTabIndex,   // Implement roving tabindex pattern
  useAriaLive,         // Manage ARIA live regions
} from '@/hooks/use-accessibility'
```

### Functions

```tsx
import {
  announceToScreenReader,  // Announce message to screen readers
  trapFocus,               // Trap focus within element
  saveFocus,               // Save current focus for restoration
  getFocusableElements,    // Get all focusable elements
  meetsContrastRequirements, // Check color contrast
  isActivationKey,         // Check if key is Enter or Space
} from '@/lib/accessibility'
```

---

## Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Learning Resources
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)
- [Inclusive Components](https://inclusive-components.design/)

---

## Reporting Accessibility Issues

If you encounter any accessibility issues, please:
1. Open an issue on GitHub with the "accessibility" label
2. Include:
   - Description of the issue
   - Steps to reproduce
   - Browser and assistive technology used
   - Screenshots or screen recordings if applicable

We are committed to fixing accessibility issues promptly.

---

## Compliance Statement

PHPinancia strives to conform to WCAG 2.1 Level AA standards. We continuously test and improve our accessibility features. If you have suggestions or encounter barriers, please let us know.

**Last Updated**: January 2025

