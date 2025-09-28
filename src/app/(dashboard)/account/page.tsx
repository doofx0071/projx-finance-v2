'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Calendar, Shield, Loader2, CheckCircle } from "lucide-react"
import { toast } from 'sonner'
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog"

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailChangeLoading, setEmailChangeLoading] = useState(false)
  const [emailChangeMessage, setEmailChangeMessage] = useState('')
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }
      setUser(user)
      setNewEmail(user.email || '')
      setLoading(false)
    }

    getUser()

    // Listen for auth state changes (including email confirmation)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        setNewEmail(session.user.email || '')
        // Automatically sync user data when signed in
        try {
          await fetch('/api/user/sync', { method: 'POST' })
        } catch (error) {
          console.error('Failed to auto-sync user data:', error)
        }
      }

      // Handle email change confirmation
      if (event === 'USER_UPDATED' && session?.user) {
        // Check if email was actually changed
        if (session.user.email !== user?.email) {
          console.log('Email change confirmed:', session.user.email)
          setUser(session.user)
          setNewEmail(session.user.email || '')
          toast.success('Email address updated successfully!')

          // Sync the updated email to our users table
          try {
            await fetch('/api/user/sync', { method: 'POST' })
          } catch (error) {
            console.error('Failed to sync user data after email change:', error)
          }
        }
      }
    })

    // Check if redirected from email confirmation
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('confirmed') === 'true') {
      toast.success('Email address confirmed and updated successfully!')
      // Refresh user data to show updated email
      getUser()
      // Sync user data after email confirmation
      fetch('/api/user/sync', { method: 'POST' }).catch(error => {
        console.error('Failed to sync user data after email confirmation:', error)
      })
    }

    return () => subscription.unsubscribe()
  }, [router, supabase.auth, user?.email])

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: (document.getElementById('firstName') as HTMLInputElement)?.value || '',
          last_name: (document.getElementById('lastName') as HTMLInputElement)?.value || '',
        }
      })

      if (error) throw error

      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangeEmail = async () => {
    if (!user || !newEmail || newEmail === user.email) return

    setEmailChangeLoading(true)
    setEmailChangeMessage('')

    try {
      // Use Supabase's built-in email change flow
      // This will send a confirmation email to the CURRENT email address
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) throw error

      setEmailChangeMessage('Confirmation email sent to your current email address! Please check your inbox and click the confirmation link. You will then receive a second confirmation email at your new address.')
      toast.success('Email change initiated! Please check your current email address for the first confirmation.')
    } catch (error: any) {
      setEmailChangeMessage(error.message || 'Failed to change email')
      toast.error(error.message || 'Failed to change email')
    } finally {
      setEmailChangeLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Account</h2>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" alt="Profile" />
                <AvatarFallback className="text-lg">
                  {user.user_metadata?.first_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  {user.user_metadata?.first_name && user.user_metadata?.last_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                    : 'User'}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={user.user_metadata?.first_name || ''}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={user.user_metadata?.last_name || ''}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                />
                <Button
                  onClick={handleChangeEmail}
                  disabled={emailChangeLoading || newEmail === user.email}
                  variant="outline"
                >
                  {emailChangeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Update Email'
                  )}
                </Button>
              </div>
              {emailChangeMessage && (
                <Alert>
                  <AlertDescription>{emailChangeMessage}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Created
              </Label>
              <p className="text-sm text-muted-foreground">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">
                Last changed: Never
              </p>
              <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
                Change Password
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  )
}