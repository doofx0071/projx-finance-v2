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

interface OTPLoginFormProps {
  onSwitchToPassword: () => void
}

export function OTPLoginForm({ onSwitchToPassword }: OTPLoginFormProps) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) throw error

      setStep('otp')
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (error) throw error

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    setResendMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) throw error

      setResendMessage('OTP sent! Please check your inbox.')
    } catch (error: any) {
      setResendMessage(error.message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  if (step === 'email') {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign in with OTP</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendOTP}>
              <div className="grid gap-4">
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP Code'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center text-sm">
              Prefer password?{' '}
              <button
                type="button"
                onClick={onSwitchToPassword}
                className="underline underline-offset-4 hover:text-primary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1"
              >
                Sign in with password
              </button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Enter OTP Code</CardTitle>
          <CardDescription>
            We sent a 6-digit code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOTP}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  disabled={loading}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 space-y-2 text-center text-sm">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="underline underline-offset-4 hover:text-primary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1"
            >
              {resendLoading ? 'Sending...' : "Didn't receive the code? Resend"}
            </button>

            <div>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="underline underline-offset-4 hover:text-primary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1"
              >
                Use different email
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={onSwitchToPassword}
                className="underline underline-offset-4 hover:text-primary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1"
              >
                Sign in with password instead
              </button>
            </div>
          </div>

          {resendMessage && (
            <Alert className="mt-4">
              <AlertDescription>{resendMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}