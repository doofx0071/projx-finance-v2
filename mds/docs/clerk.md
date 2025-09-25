# Clerk Integration Guide

## Overview
Clerk is a complete user management and authentication platform that provides secure, scalable authentication solutions for modern web applications. This guide covers integration with your Finance Tracker (Phinancia) for comprehensive user authentication, authorization, and management.

## Installation
```bash
npm install @clerk/nextjs
```

## Authentication Setup

### Environment Variables
Set your Clerk environment variables in `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Getting Your Keys
1. **Create a Clerk account** at [Clerk Dashboard](https://dashboard.clerk.com/)
2. **Create a new application**
3. **Go to API Keys** and copy your keys
4. **Configure sign-in/sign-up URLs** in your Clerk dashboard

## Basic Setup

### Next.js Integration
```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### Middleware Protection
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/transactions(.*)',
  '/budgets(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

## Authentication Components

### Sign-In Page
```typescript
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  )
}
```

### Sign-Up Page
```typescript
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-green-600 hover:bg-green-700',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  )
}
```

### User Profile Management
```typescript
// app/profile/page.tsx
import { UserProfile } from '@clerk/nextjs'

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <UserProfile
        appearance={{
          elements: {
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  )
}
```

## React Hooks

### Authentication State
```typescript
// components/AuthGuard.tsx
'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [isLoaded, userId, router])

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!userId) {
    return null
  }

  return <>{children}</>
}
```

### User Data Access
```typescript
// components/UserInfo.tsx
'use client'

import { useUser } from '@clerk/nextjs'

export function UserInfo() {
  const { user } = useUser()

  if (!user) return null

  return (
    <div>
      <h2>Welcome, {user.firstName}!</h2>
      <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
      <p>User ID: {user.id}</p>
    </div>
  )
}
```

## Database Integration

### User Metadata in Supabase
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export async function createSupabaseClient() {
  const { getToken } = auth()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${await getToken({ template: 'supabase' })}`,
        },
      },
    }
  )
}
```

### Row Level Security Policies
```sql
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid()::text = user_id);
```

## Advanced Features

### Organization Management
```typescript
// app/create-organization/[[...create-organization]]/page.tsx
import { CreateOrganization } from '@clerk/nextjs'

export default function CreateOrganizationPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <CreateOrganization
        appearance={{
          elements: {
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  )
}
```

### Custom Sign-In/Sign-Up Forms
```typescript
// components/CustomSignIn.tsx
'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'

export function CustomSignIn() {
  return (
    <SignIn.Root>
      <SignIn.Step name="start">
        <h1 className="text-2xl font-bold mb-4">Sign in to Phinancia</h1>

        <Clerk.Connection name="google" className="btn btn-outline">
          Continue with Google
        </Clerk.Connection>

        <div className="divider">or</div>

        <Clerk.Field name="identifier">
          <Clerk.Label className="label">Email</Clerk.Label>
          <Clerk.Input className="input input-bordered" />
          <Clerk.FieldError className="text-error text-sm" />
        </Clerk.Field>

        <SignIn.Action submit className="btn btn-primary w-full">
          Continue
        </SignIn.Action>
      </SignIn.Step>

      <SignIn.Step name="verifications">
        <SignIn.Strategy name="email_code">
          <Clerk.Field name="code">
            <Clerk.Label className="label">Verification Code</Clerk.Label>
            <Clerk.Input className="input input-bordered" />
            <Clerk.FieldError className="text-error text-sm" />
          </Clerk.Field>

          <SignIn.Action submit className="btn btn-primary w-full">
            Verify
          </SignIn.Action>
        </SignIn.Strategy>
      </SignIn.Step>
    </SignIn.Root>
  )
}
```

## Security Features

### Multi-Factor Authentication (MFA)
Clerk provides built-in MFA support:
- SMS codes
- Authenticator apps (TOTP)
- Backup codes
- Hardware security keys

### Session Management
```typescript
// Server-side session validation
import { auth } from '@clerk/nextjs/server'

export default async function Dashboard() {
  const { userId } = auth()

  if (!userId) {
    return <div>Please sign in</div>
  }

  return <div>Welcome to your dashboard!</div>
}
```

### JWT Token Handling
```typescript
// Get JWT token for API calls
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { getToken } = auth()
  const token = await getToken()

  // Use token for authenticated API calls
  const response = await fetch('/api/protected', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response
}
```

## Finance Tracker Integration

### Protected Routes
```typescript
// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div>
      <h1>Finance Dashboard</h1>
      {/* Your finance components */}
    </div>
  )
}
```

### User-Specific Data
```typescript
// lib/finance-api.ts
import { auth } from '@clerk/nextjs/server'
import { createSupabaseClient } from './supabase'

export async function getUserTransactions() {
  const { userId } = auth()
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}
```

## Error Handling
```typescript
// components/ErrorBoundary.tsx
'use client'

import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkLoading>
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        {children}
      </ClerkLoaded>
    </>
  )
}
```

## Testing

### Test Mode Setup
```bash
# Use test keys for development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Mock Authentication for Testing
```typescript
// __tests__/auth.test.tsx
import { render, screen } from '@testing-library/react'
import { ClerkProvider } from '@clerk/nextjs'
import Dashboard from '../app/dashboard/page'

const mockAuth = {
  userId: 'test-user-id',
}

jest.mock('@clerk/nextjs', () => ({
  auth: () => mockAuth,
}))

test('renders dashboard for authenticated user', () => {
  render(
    <ClerkProvider>
      <Dashboard />
    </ClerkProvider>
  )

  expect(screen.getByText('Finance Dashboard')).toBeInTheDocument()
})
```

## Pricing & Limits

### Free Tier (Perfect for Development)
- ✅ **5,000 Monthly Active Users (MAU)**
- ✅ **All Authentication Methods**
- ✅ **Multi-Factor Authentication**
- ✅ **User Management Dashboard**
- ✅ **Basic Analytics**
- ✅ **Community Support**
- ✅ **Production Ready**

### Paid Tiers
- **Pro**: $25/month (10,000 MAU)
- **Enterprise**: Custom pricing

### Key Benefits for Phinancia
- **Zero setup cost** for development
- **Enterprise-grade security** from day one
- **Scalable** - upgrade as you grow
- **No feature limitations** in free tier
- **Perfect for finance apps** requiring strong security

## Best Practices

### For Finance Applications
1. **Enable MFA** for all users
2. **Use Row Level Security** in your database
3. **Implement proper session timeouts**
4. **Regular security audits** of your Clerk configuration
5. **Monitor authentication events**
6. **Use organization features** for team accounts

### Performance Optimization
1. **Lazy load Clerk components** when possible
2. **Use server-side authentication** for API routes
3. **Cache user data** appropriately
4. **Implement proper error boundaries**

### User Experience
1. **Custom branding** in authentication flows
2. **Clear error messages** for failed authentication
3. **Progressive enhancement** for authentication states
4. **Accessible authentication forms**

## Troubleshooting

### Common Issues
1. **Middleware not working**: Check your `middleware.ts` configuration
2. **Environment variables**: Ensure all required env vars are set
3. **CORS issues**: Configure allowed origins in Clerk dashboard
4. **Session persistence**: Check cookie settings

### Debug Mode
```typescript
// Enable debug logging
import { ClerkProvider } from '@clerk/nextjs'

<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  debug={process.env.NODE_ENV === 'development'}
>
  {children}
</ClerkProvider>
```

## Resources
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [API Reference](https://clerk.com/docs/references/javascript/overview)
- [Dashboard](https://dashboard.clerk.com/)
- [Community](https://clerk.com/community)

## Migration from Other Auth Providers

### From NextAuth.js
```typescript
// Before (NextAuth)
import { getServerSession } from 'next-auth'

// After (Clerk)
import { auth } from '@clerk/nextjs/server'
const { userId } = auth()
```

### From Supabase Auth
```typescript
// Before (Supabase)
const { data: { user } } = await supabase.auth.getUser()

// After (Clerk)
import { currentUser } from '@clerk/nextjs/server'
const user = await currentUser()
```

Clerk provides a superior authentication experience with better security, easier integration, and more features out of the box. The free tier is perfect for getting started with Phinancia, and you can scale up as your user base grows.