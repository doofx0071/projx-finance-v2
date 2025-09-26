'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

import { AuthFormContainer } from "@/components/auth-form-container"
import { AuthBackground } from "@/components/auth-background"
import { LOGO_URLS } from '@/lib/constants'

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Set initial mode based on current path
    if (pathname.includes('/signup')) {
      setIsSignIn(false)
    } else {
      setIsSignIn(true)
    }
  }, [pathname])

  const handleModeChange = (mode: 'signin' | 'signup') => {
    const signIn = mode === 'signin'
    setIsSignIn(signIn)
    // Update URL without full page reload
    const newPath = signIn ? '/signin' : '/signup'
    router.replace(newPath, { scroll: false })
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 relative">
        {/* Radial Gradient Background for Left Side Only */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 10%, var(--home-radial-start) 40%, var(--home-radial-end) 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col gap-4 h-full">
          {/* Header with Back to Home Button and Logo */}
          <div className="flex items-center justify-between">
            <div className="flex justify-center gap-2 md:justify-start flex-1">
              <Link href="/" className="flex items-center">
                <Image
                  src={LOGO_URLS.light}
                  alt="PHPinancia"
                  width={200}
                  height={50}
                  className="h-10 w-auto dark:hidden"
                  priority
                  quality={100}
                />
                <Image
                  src={LOGO_URLS.dark}
                  alt="PHPinancia"
                  width={200}
                  height={50}
                  className="h-10 w-auto hidden dark:block"
                  priority
                  quality={100}
                />
              </Link>
            </div>

            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">
              <AuthFormContainer
                initialMode={isSignIn ? 'signin' : 'signup'}
                onModeChange={handleModeChange}
              />
            </div>
          </div>
        </div>
      </div>
      <AuthBackground />
    </div>
  )
}