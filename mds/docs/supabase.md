# Supabase Integration Guide

## Overview
Supabase is an open-source Firebase alternative that provides a PostgreSQL database, authentication, real-time subscriptions, and storage. This guide covers integration with your Finance Tracker for data persistence and user management.

## Installation
```bash
npm install @supabase/supabase-js
```

## Authentication
Supabase uses project-based authentication with public and service role keys. Set your environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Getting Your Credentials
1. **Create a project** at [Supabase](https://supabase.com/)
2. **Go to Settings → API**
3. **Copy the Project URL and anon/public key**
4. **Copy the service_role key** (keep this secret!)

## Basic Setup

### Client Initialization
```typescript
import { createClient } from '@supabase/supabase-js';

// Public client (for client-side operations)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client (for server-side operations)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Database Schema Setup
Create the following tables for your Finance Tracker:

```sql
-- Users (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(10,2) NOT NULL,
  period TEXT CHECK (period IN ('weekly', 'monthly', 'yearly')) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
```

## Authentication

### Sign Up
```typescript
async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;

  // Create profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
      });

    if (profileError) throw profileError;
  }

  return data;
}
```

### Sign In
```typescript
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}
```

### Sign Out
```typescript
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

### Auth State Listener
```typescript
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

## Database Operations

### Categories Management
```typescript
// Create category
async function createCategory(name: string, color: string, icon: string) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      color,
      icon,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user's categories
async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Update category
async function updateCategory(id: string, updates: any) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete category
async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

### Transactions Management
```typescript
// Add transaction
async function addTransaction(transaction: {
  category_id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
}) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get transactions with pagination
async function getTransactions(page = 1, limit = 20) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        name,
        color,
        icon
      )
    `, { count: 'exact' })
    .order('date', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data, count };
}

// Get transactions by date range
async function getTransactionsByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        name,
        color,
        icon
      )
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
}

// Update transaction
async function updateTransaction(id: string, updates: any) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete transaction
async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

### Financial Reports
```typescript
// Get monthly summary
async function getMonthlySummary(year: number, month: number) {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, categories(name)')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  const summary = data.reduce((acc, transaction) => {
    if (transaction.type === 'income') {
      acc.totalIncome += Number(transaction.amount);
    } else {
      acc.totalExpenses += Number(transaction.amount);
    }
    return acc;
  }, { totalIncome: 0, totalExpenses: 0 });

  return {
    ...summary,
    netIncome: summary.totalIncome - summary.totalExpenses,
  };
}

// Get spending by category
async function getSpendingByCategory(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      categories (
        name,
        color
      )
    `)
    .eq('type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  const categoryTotals = data.reduce((acc, transaction) => {
    const categoryName = transaction.categories?.name || 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
    return acc;
  }, {});

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
  }));
}
```

## Real-time Subscriptions

### Live Transaction Updates
```typescript
import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeTransactions(onUpdate: (payload: any) => void) {
  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
```

### Real-time Budget Monitoring
```typescript
export function useRealtimeBudgets(onUpdate: (payload: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('budgets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
```

## Row Level Security (RLS) Policies

### Enable RLS and Create Policies
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);
```

## File Storage

### Upload Receipt Images
```typescript
async function uploadReceipt(file: File, transactionId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${transactionId}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(fileName, file);

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('receipts')
    .getPublicUrl(fileName);

  return publicUrl;
}
```

### Download Receipt
```typescript
async function downloadReceipt(fileName: string) {
  const { data, error } = await supabase.storage
    .from('receipts')
    .download(fileName);

  if (error) throw error;
  return data;
}
```

## Error Handling
```typescript
async function handleSupabaseError(operation: () => Promise<any>) {
  try {
    return await operation();
  } catch (error: any) {
    console.error('Supabase error:', error);

    if (error.code === 'PGRST116') {
      throw new Error('Record not found');
    } else if (error.code === '23505') {
      throw new Error('Record already exists');
    } else if (error.message.includes('JWT')) {
      throw new Error('Authentication required');
    } else {
      throw new Error('Database operation failed');
    }
  }
}
```

## Performance Optimization

### Database Indexes
```sql
-- Add indexes for better query performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_budgets_user_category ON budgets(user_id, category_id);
```

### Connection Pooling
```typescript
// For server-side operations, use connection pooling
import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-my-custom-header': 'finance-tracker',
      },
    },
  }
);
```

## Integration Examples

### Next.js API Route
```typescript
// pages/api/transactions.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  } else if (req.method === 'POST') {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

### React Hook for Transactions
```typescript
// hooks/useTransactions.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            color,
            icon
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: any) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
    refetch: fetchTransactions,
  };
}
```

## Security Best Practices

### Environment Variables
- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate keys regularly

### API Security
- Enable Row Level Security (RLS) on all tables
- Use service role key only for server-side operations
- Validate user permissions before operations

### Data Validation
- Validate data on both client and server
- Use database constraints
- Sanitize user inputs

## Monitoring & Analytics

### Query Performance
```typescript
// Enable query logging in development
if (process.env.NODE_ENV === 'development') {
  supabase.supabaseUrl.includes('localhost') && console.log('Using local Supabase');
}
```

### Error Tracking
```typescript
// Log errors to monitoring service
import * as Sentry from '@sentry/nextjs';

export function logError(error: any, context: any) {
  console.error('Supabase error:', error);

  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: {
        service: 'supabase',
        operation: context.operation,
      },
      extra: context,
    });
  }
}
```

## Resources
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Guide](https://supabase.com/docs/guides/database)
- [Authentication](https://supabase.com/docs/guides/auth)
- [Real-time](https://supabase.com/docs/guides/realtime)
- [Storage](https://supabase.com/docs/guides/storage)