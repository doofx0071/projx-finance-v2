'use client'

import { useState, useEffect, useRef } from 'react'
import { CustomSigninForm } from './custom-signin-form'
import { CustomSignupForm } from './custom-signup-form'

interface AuthFormContainerProps {
  initialMode: 'signin' | 'signup'
  onModeChange?: (mode: 'signin' | 'signup') => void
}

export function AuthFormContainer({ initialMode, onModeChange }: AuthFormContainerProps) {
  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>(initialMode)
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setCurrentMode(initialMode)
  }, [initialMode])

  const handleModeSwitch = (newMode: 'signin' | 'signup') => {
    if (newMode === currentMode) return

    // Update the form immediately without waiting for URL change
    setCurrentMode(newMode)

    // Debounce URL updates to prevent rapid network requests
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current)
    }

    urlUpdateTimeoutRef.current = setTimeout(() => {
      onModeChange?.(newMode)
    }, 300) // Wait 300ms before updating URL
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-[600px] will-change-contents"> {/* Fixed height and optimized rendering */}
      <div key={currentMode} className="w-full">
        {currentMode === 'signin' ? (
          <CustomSigninForm onModeSwitch={() => handleModeSwitch('signup')} />
        ) : (
          <CustomSignupForm onModeSwitch={() => handleModeSwitch('signin')} />
        )}
      </div>
    </div>
  )
}
