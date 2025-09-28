'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function EmailConfirmationPage() {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token from URL parameters
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (!token) {
          setError('Invalid confirmation link')
          setLoading(false)
          return
        }

        if (type === 'email_confirmation' || type === 'email_change_confirmation') {
          // Handle the email confirmation
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          })

          if (error) throw error

          // Get the updated user data
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            // Sync user data to ensure both tables are updated
            await fetch('/api/user/sync-email-confirmation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ user }),
            })
          }

          setSuccess(true)
          toast.success('Email address confirmed and updated successfully!')

          // Redirect to account page after a short delay
          setTimeout(() => {
            router.push('/account?confirmed=true')
          }, 2000)
        } else {
          setError('Invalid confirmation type')
        }
      } catch (error: any) {
        setError(error.message || 'Failed to confirm email')
        toast.error(error.message || 'Failed to confirm email')
      } finally {
        setLoading(false)
      }
    }

    handleEmailConfirmation()
  }, [searchParams, router, supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Confirming your email...</h3>
              <p className="text-sm text-muted-foreground">Please wait while we verify your email address.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Confirmation Failed</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
              <Button
                onClick={() => router.push('/account')}
                className="mt-4"
              >
                Back to Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-800 dark:text-green-200">
            Email Confirmed Successfully!
          </CardTitle>
          <CardDescription>
            Your email address has been verified and updated. You will be redirected to your account page shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={() => router.push('/account')}
            className="w-full"
          >
            Go to Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}