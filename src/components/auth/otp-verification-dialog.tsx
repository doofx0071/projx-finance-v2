'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Loader2, Shield, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface OTPVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  password: string
}

export function OTPVerificationDialog({ open, onOpenChange, email, password }: OTPVerificationDialogProps) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Send OTP email when dialog opens
  useEffect(() => {
    if (open) {
      const sendOTP = async () => {
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false,
            },
          })

          if (error) {
            setError('Failed to send verification email. Please try again.')
          }
        } catch (error: any) {
          setError('Failed to send verification email. Please try again.')
        }
      }

      sendOTP()
    }
  }, [open, email, supabase.auth])

  // Auto-focus OTP input when dialog opens
  useEffect(() => {
    if (open && otp === '') {
      const timer = setTimeout(() => {
        // Focus management for InputOTP component
        const firstSlot = document.querySelector('[data-slot="input-otp-slot"]')
        if (firstSlot instanceof HTMLElement) {
          firstSlot.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open, otp])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Verify OTP using Supabase
      const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (otpError) {
        throw otpError
      }

      // OTP verified successfully - now sign in with password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      // Success - show toast and redirect
      toast.success('Welcome back! Successfully signed in.')
      onOpenChange(false)
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Invalid verification code')
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

      setResendMessage('Verification code sent! Please check your email.')
    } catch (error: any) {
      setResendMessage(error.message || 'Failed to resend verification code')
    } finally {
      setResendLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      setOtp('')
      setError('')
      setResendMessage('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Email Verification Required
          </DialogTitle>
          <DialogDescription>
            We've sent a verification code to <strong>{email}</strong>. Please enter it below to complete your sign in.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerifyOTP}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Verification Code</Label>
              <InputOTP
                maxLength={8}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                  <InputOTPSlot index={6} />
                  <InputOTPSlot index={7} />
                </InputOTPGroup>
              </InputOTP>
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
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4 space-y-2 text-center text-sm">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin inline" />
                  Sending...
                </>
              ) : (
                "Didn't receive the code? Resend"
              )}
            </button>

            {resendMessage && (
              <Alert className="mt-2">
                <AlertDescription>{resendMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}