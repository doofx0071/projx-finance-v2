# Clerk-Supabase Integration Guide

## Overview

This document describes the complete integration between Clerk (authentication) and Supabase (database) in the PHPinancia Finance Tracker application. The integration ensures that user data is automatically synchronized between both services when users register, sign in, or update their profiles.

## Architecture

### Integration Strategy
- **Clerk**: Handles authentication, user management, and session management
- **Supabase**: Stores user data and all application data with Row Level Security (RLS)
- **Webhooks**: Synchronize user data between Clerk and Supabase automatically
- **API Routes**: Provide manual sync capabilities and user management

### Data Flow
1. User registers/signs in through Clerk
2. Clerk webhook triggers user synchronization to Supabase
3. User data is stored in Supabase with proper RLS policies
4. Application queries use Clerk user ID for data access

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- Clerk user ID
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Finance Tables
- **categories**: User expense/income categories
- **transactions**: Financial transactions
- **budgets**: Budget planning and tracking

All tables include:
- `user_id TEXT` referencing `users(id)`
- Row Level Security (RLS) policies
- Proper indexes for performance

## Implementation Files

### Core Integration Files

#### `src/lib/supabase.ts`
- Supabase client configuration
- TypeScript types for database schema
- Helper functions for user management
- Both client-side and server-side clients

#### `src/lib/user.ts`
- User management utilities
- Functions for creating, updating, and retrieving users
- User synchronization helpers

#### `src/app/api/webhooks/clerk/route.ts`
- Webhook endpoint for Clerk events
- Handles user.created, user.updated, user.deleted events
- Automatic user synchronization

#### `src/app/api/user/sync/route.ts`
- Manual user synchronization endpoint
- Testing and debugging utilities
- Force refresh user data

### UI Components

#### `src/components/user-sync-test.tsx`
- Testing component for user synchronization
- Manual sync triggers
- Integration status display

## Environment Variables

### Required Variables
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Webhook Configuration
1. Go to Clerk Dashboard → Webhooks
2. Create new webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy webhook secret to `CLERK_WEBHOOK_SECRET`

## Row Level Security (RLS)

### User Data Access
All tables use RLS policies that check the current user ID:

```sql
-- Example policy for transactions table
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (user_id = current_setting('request.jwt.claim.sub', true));
```

### Policy Types
- **SELECT**: Users can view their own data
- **INSERT**: Users can create data for themselves
- **UPDATE**: Users can modify their own data
- **DELETE**: Users can delete their own data

## API Endpoints

### `/api/webhooks/clerk` (POST)
- Handles Clerk webhook events
- Automatically syncs user data
- Secured with webhook signature verification

### `/api/user/sync` (GET)
- Returns current user sync status
- Shows both Clerk and Supabase user data
- Requires authentication

### `/api/user/sync` (POST)
- Forces user data refresh from Clerk to Supabase
- Updates existing user record
- Requires authentication

## Testing the Integration

### 1. User Registration Flow
1. Register a new user through Clerk
2. Check webhook logs for successful sync
3. Verify user appears in Supabase users table
4. Test dashboard access

### 2. Manual Sync Testing
1. Sign in to the application
2. Go to `/dashboard`
3. Use the "Test User Sync" button
4. Verify sync status and user data

### 3. Database Verification
```sql
-- Check users table
SELECT * FROM users;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## Troubleshooting

### Common Issues

#### User Not Synced
- Check webhook endpoint is accessible
- Verify webhook secret is correct
- Check Supabase logs for errors
- Use manual sync API endpoint

#### RLS Policy Errors
- Ensure user ID is properly set in request context
- Check policy syntax and conditions
- Verify user exists in users table

#### Authentication Issues
- Check Clerk configuration
- Verify environment variables
- Test middleware protection

### Debug Commands
```bash
# Check webhook delivery in Clerk Dashboard
# Test manual sync
curl -X GET http://localhost:3001/api/user/sync

# Check Supabase logs
# Use Supabase dashboard or CLI
```

## Security Considerations

### Webhook Security
- Webhook signature verification using Clerk secret
- HTTPS required for production webhooks
- Rate limiting recommended

### Database Security
- RLS policies prevent unauthorized data access
- Service role key kept secure (server-side only)
- User data encrypted in transit and at rest

### API Security
- All API routes protected by Clerk middleware
- User context validated on every request
- No sensitive data in client-side code

## Performance Optimization

### Database Indexes
```sql
-- User-based queries
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);

-- Date-based queries
CREATE INDEX idx_transactions_date ON transactions(date DESC);
```

### Caching Strategy
- User data cached in Clerk session
- Database queries optimized with proper indexes
- Connection pooling for server-side operations

## Monitoring and Maintenance

### Health Checks
- Monitor webhook delivery success rates
- Check database connection health
- Verify user sync completion

### Regular Maintenance
- Review and update RLS policies
- Monitor database performance
- Update dependencies regularly

## Future Enhancements

### Planned Features
- Real-time data synchronization
- Advanced user profile management
- Multi-tenant organization support
- Enhanced security policies

### Scalability Considerations
- Database connection pooling
- Webhook queue processing
- Caching layer implementation
- Read replicas for heavy queries
