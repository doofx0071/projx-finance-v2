'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ForgotPasswordDialog } from './forgot-password-dialog'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [otpResendLoading, setOtpResendLoading] = useState(false)
  const [otpResendMessage, setOtpResendMessage] = useState('')
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [otpVerificationOpen, setOtpVerificationOpen] = useState(false)
  const [step, setStep] = useState<'signin' | 'otp'>('signin')
  const [pendingCredentials, setPendingCredentials] = useState<{email: string, password: string} | null>(null)
  const [otp, setOtp] = useState('')
  const router = useRouter()

  // Check if user was redirected from email verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('verified') === 'true') {
      toast.success('Email verified successfully! You can now sign in to your account.')
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First validate the credentials (but don't sign in yet)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.log('Sign-in error:', signInError) // Debug log

        // If credentials are invalid, show error
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
          setLoading(false)
        } else {
          setError(signInError.message || 'An error occurred during sign in')
          setLoading(false)
        }
        return
      }

      // Credentials are valid - send OTP email and show OTP verification
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            password, // Store password in user metadata for later use
          },
        },
      })

      if (otpError) {
        console.error('OTP send error:', otpError)
        setError('Failed to send verification code. Please try again.')
        setLoading(false)
        return
      }

      // OTP email sent - store credentials and show OTP form
      setPendingCredentials({ email, password })
      setStep('otp')
      setLoading(false)
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      // Get the app URL from environment or use current origin
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${appUrl}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'An error occurred during Google sign in')
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setResendLoading(true)
    setResendMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      setResendMessage('Verification email sent! Please check your inbox.')
    } catch (error: any) {
      setResendMessage(error.message || 'Failed to resend verification email')
    } finally {
      setResendLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!pendingCredentials) {
      setOtpResendMessage('No email address found')
      return
    }

    setOtpResendLoading(true)
    setOtpResendMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: pendingCredentials.email,
        options: {
          data: {
            password: pendingCredentials.password,
          },
        },
      })

      if (error) throw error

      setOtpResendMessage('New verification code sent! Please check your email.')
      setOtp('') // Clear the current OTP input
    } catch (error: any) {
      setOtpResendMessage(error.message || 'Failed to resend verification code')
    } finally {
      setOtpResendLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!pendingCredentials) {
      setError('No pending credentials found')
      setLoading(false)
      return
    }

    try {
      // Verify OTP using Supabase - this will complete the sign-in
      const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
        email: pendingCredentials.email,
        token: otp,
        type: 'email',
      })

      if (otpError) {
        throw otpError
      }

      // OTP verified successfully - user is now signed in
      // Sync user data to ensure it exists in the custom table
      try {
        await fetch('/api/user/sync', { method: 'POST' })
      } catch (syncError) {
        console.error('Failed to sync user data after signin:', syncError)
        // Don't block signin if sync fails
      }

      // Check if this is the user's first login by checking created_at vs last_sign_in_at
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const isFirstLogin = currentUser?.created_at === currentUser?.last_sign_in_at ||
                           Math.abs(new Date(currentUser?.created_at || 0).getTime() -
                                   new Date(currentUser?.last_sign_in_at || 0).getTime()) < 5000 // Within 5 seconds

      toast.success(isFirstLogin ? 'Welcome to PHPinancia! Your account is ready.' : 'Welcome back! Successfully signed in.')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('OTP verification error:', error)
      if (error.message.includes('Token has expired or is invalid')) {
        setError('Incorrect verification code. Please check your email for the correct code or request a new one.')
      } else if (error.message.includes('Invalid token')) {
        setError('Incorrect verification code. Please check your email for the correct code or request a new one.')
      } else {
        setError(error.message || 'Failed to verify code. Please check your email or request a new code.')
      }
    } finally {
      setLoading(false)
    }
  }


  // If step is OTP, show OTP form
  if (step === 'otp' && pendingCredentials) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Enter Verification Code</CardTitle>
            <CardDescription>
              We sent an 8-digit code to <strong>{pendingCredentials.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOTP}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="tel"
                    placeholder="Enter 8-digit code"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      if (value.length <= 8) {
                        setOtp(value);
                      }
                    }}
                    disabled={loading}
                    maxLength={8}
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || otp.length !== 8}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={otpResendLoading}
                    className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1 cursor-pointer disabled:opacity-50"
                  >
                    {otpResendLoading ? 'Sending...' : 'Resend Code'}
                  </button>
                  {otpResendMessage && (
                    <p className="text-xs text-muted-foreground">{otpResendMessage}</p>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('signin')
                        setPendingCredentials(null)
                        setOtp('')
                        setError('')
                        setOtpResendMessage('')
                      }}
                      className="text-sm text-muted-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1 cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default sign-in form
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn}>
            <div className="grid gap-4">
              {/* Social Login */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    disabled={loading}
                    className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </div>
          </form>

          {error && error.includes('verify your email') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 mb-2">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              {resendMessage && (
                <p className="text-sm mt-2 text-center text-blue-600">{resendMessage}</p>
              )}
            </div>
          )}
    
          {error && !error.includes('verify your email') && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="underline underline-offset-4 hover:text-primary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1 cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </div>
  )
}