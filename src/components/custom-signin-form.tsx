'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
interface CustomSigninFormProps {
  onModeSwitch?: () => void
}

export function CustomSigninForm({ onModeSwitch }: CustomSigninFormProps = {}) {
  return (
    <SignIn.Root>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignIn.Step name="start">
              <div className="grid gap-4">
                {/* Social Login */}
                <Clerk.Connection name="google" asChild>
                  <Button variant="outline" className="w-full">
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
                </Clerk.Connection>

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
                  <Clerk.Field name="identifier" className="grid gap-2">
                    <Clerk.Label asChild>
                      <Label htmlFor="identifier">Email</Label>
                    </Clerk.Label>
                    <Clerk.Input asChild>
                      <Input
                        id="identifier"
                        type="email"
                        placeholder="name@example.com"
                        required
                      />
                    </Clerk.Input>
                    <Clerk.FieldError className="text-sm text-destructive" />
                  </Clerk.Field>
                </div>

                <div className="grid gap-2">
                  <Clerk.Field name="password" className="grid gap-2">
                    <Clerk.Label asChild>
                      <Label htmlFor="password">Password</Label>
                    </Clerk.Label>
                    <Clerk.Input asChild>
                      <Input
                        id="password"
                        type="password"
                        required
                      />
                    </Clerk.Input>
                    <Clerk.FieldError className="text-sm text-destructive" />
                  </Clerk.Field>
                </div>

                <SignIn.Action submit asChild>
                  <Button className="w-full">
                    <Clerk.Loading>
                      {(isGlobalLoading) =>
                        isGlobalLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign in'
                        )
                      }
                    </Clerk.Loading>
                  </Button>
                </SignIn.Action>
              </div>
            </SignIn.Step>

            <SignIn.Step name="verifications">
              <SignIn.Strategy name="email_code">
                <div className="grid gap-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Check your email</h3>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ve sent a verification code to your email
                    </p>
                  </div>

                  <Clerk.Field name="code" className="grid gap-2">
                    <Clerk.Label asChild>
                      <Label htmlFor="code">Verification Code</Label>
                    </Clerk.Label>
                    <Clerk.Input asChild>
                      <Input
                        id="code"
                        type="text"
                        placeholder="Enter code"
                        required
                      />
                    </Clerk.Input>
                    <Clerk.FieldError className="text-sm text-destructive" />
                  </Clerk.Field>

                  <SignIn.Action submit asChild>
                    <Button className="w-full">
                      <Clerk.Loading>
                        {(isGlobalLoading) =>
                          isGlobalLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            'Verify'
                          )
                        }
                      </Clerk.Loading>
                    </Button>
                  </SignIn.Action>
                </div>
              </SignIn.Strategy>
            </SignIn.Step>

            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              {onModeSwitch ? (
                <button
                  type="button"
                  onClick={() => onModeSwitch()}
                  className="underline underline-offset-4 hover:text-primary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1 font-semibold cursor-pointer"
                >
                  Sign up
                </button>
              ) : (
                <span className="underline underline-offset-4 text-primary font-semibold">
                  Sign up
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Clerk.Loading>
          {(isGlobalLoading) => (
            isGlobalLoading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Please wait while we process your request...
                </AlertDescription>
              </Alert>
            )
          )}
        </Clerk.Loading>
      </div>
    </SignIn.Root>
  )
}