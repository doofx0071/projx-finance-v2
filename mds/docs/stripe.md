# Stripe Integration Guide

## Overview
Stripe is a powerful payment processing platform that handles credit cards, bank transfers, and digital wallets. This guide covers integration with your Finance Tracker for subscription management, premium features, and payment processing.

## Installation
```bash
npm install stripe
```

## Authentication
Stripe uses API keys for authentication. Set your environment variables:

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Getting Your Keys
1. **Create a Stripe account** at [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Go to Developers → API keys**
3. **Copy the publishable key** (starts with `pk_test_` or `pk_live_`)
4. **Copy the secret key** (starts with `sk_test_` or `sk_live_`)
5. **Create a webhook endpoint** and copy the webhook secret

## Basic Setup

### Server-Side Client
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});
```

### Client-Side Integration
```typescript
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

## Core Features

### Subscription Management

#### Create Subscription
```typescript
async function createSubscription(customerId: string, priceId: string) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: priceId,
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}
```

#### Cancel Subscription
```typescript
async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}
```

#### Update Subscription
```typescript
async function updateSubscription(subscriptionId: string, newPriceId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionItemId = subscription.items.data[0].id;

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscriptionItemId,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });

    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}
```

### Customer Management

#### Create Customer
```typescript
async function createCustomer(email: string, name: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'finance_tracker',
      },
    });

    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}
```

#### Update Customer
```typescript
async function updateCustomer(customerId: string, updates: any) {
  try {
    const customer = await stripe.customers.update(customerId, updates);
    return customer;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}
```

### Payment Methods

#### Attach Payment Method
```typescript
async function attachPaymentMethod(customerId: string, paymentMethodId: string) {
  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error attaching payment method:', error);
    throw error;
  }
}
```

#### List Payment Methods
```typescript
async function getPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
}
```

### Invoices and Billing

#### Create Invoice
```typescript
async function createInvoice(customerId: string, items: any[]) {
  try {
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'charge_automatically',
      auto_advance: true,
    });

    // Add invoice items
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        amount: item.amount,
        currency: item.currency || 'usd',
        description: item.description,
      });
    }

    // Finalize and send invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    return finalizedInvoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}
```

#### Get Invoice History
```typescript
async function getInvoiceHistory(customerId: string, limit = 10) {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}
```

## Webhooks

### Webhook Handler
```typescript
// pages/api/webhooks/stripe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
    return;
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Update user subscription status in database
  console.log('Subscription created:', subscription.id);
  // TODO: Update user record with subscription details
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Handle subscription changes (plan upgrades/downgrades)
  console.log('Subscription updated:', subscription.id);
  // TODO: Update user subscription details
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Handle subscription cancellations
  console.log('Subscription deleted:', subscription.id);
  // TODO: Update user to free tier
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle successful payments
  console.log('Payment succeeded for invoice:', invoice.id);
  // TODO: Update payment status, send receipt
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payments
  console.log('Payment failed for invoice:', invoice.id);
  // TODO: Notify user, update payment status
}
```

### Webhook Verification
```typescript
import { stripe } from '@/lib/stripe';

export function verifyWebhook(rawBody: Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    throw new Error('Webhook verification failed');
  }
}
```

## Frontend Integration

### React Hook for Stripe
```typescript
// hooks/useStripe.ts
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function useStripe() {
  const [loading, setLoading] = useState(false);

  const createSubscription = async (priceId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { clientSecret } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) throw new Error('Stripe failed to load');

      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      });

      return result;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createSubscription, loading };
}
```

### Subscription Component
```typescript
// components/SubscriptionPlans.tsx
import { useStripe } from '@/hooks/useStripe';

const plans = [
  {
    id: 'price_basic',
    name: 'Basic',
    price: '$9.99/month',
    features: ['Up to 100 transactions', 'Basic reports', 'Email support'],
  },
  {
    id: 'price_premium',
    name: 'Premium',
    price: '$19.99/month',
    features: ['Unlimited transactions', 'Advanced analytics', 'Priority support'],
  },
];

export function SubscriptionPlans() {
  const { createSubscription, loading } = useStripe();

  const handleSubscribe = async (priceId: string) => {
    try {
      await createSubscription(priceId);
    } catch (error) {
      alert('Subscription failed. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <div key={plan.id} className="border rounded-lg p-6">
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <p className="text-2xl font-bold text-blue-600">{plan.price}</p>
          <ul className="mt-4 space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSubscribe(plan.id)}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Subscribe to ${plan.name}`}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Finance Tracker Integration

### Premium Feature Access
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function middleware(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value;

  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check subscription status
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: userId,
      status: 'active',
      limit: 1,
    });

    const hasActiveSubscription = subscriptions.data.length > 0;

    // Add subscription status to headers
    const response = NextResponse.next();
    response.headers.set('x-subscription-status', hasActiveSubscription ? 'active' : 'inactive');

    return response;
  } catch (error) {
    console.error('Subscription check failed:', error);
    return NextResponse.next();
  }
}
```

### Usage Tracking
```typescript
async function trackUsage(userId: string, feature: string, amount: number) {
  // Store usage in database for billing
  await supabase.from('usage_tracking').insert({
    user_id: userId,
    feature,
    amount,
    timestamp: new Date().toISOString(),
  });

  // Check if user has exceeded limits
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('amount')
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

  const totalUsage = usage?.reduce((sum, record) => sum + record.amount, 0) || 0;

  if (totalUsage > getFeatureLimit(feature)) {
    // Notify user about limit exceeded
    await sendLimitExceededEmail(userId, feature);
  }
}
```

## Error Handling
```typescript
function handleStripeError(error: any) {
  switch (error.type) {
    case 'card_error':
      return `Card error: ${error.message}`;
    case 'invalid_request_error':
      return 'Invalid request. Please check your information.';
    case 'api_connection_error':
      return 'Network error. Please try again.';
    case 'authentication_error':
      return 'Authentication failed. Please contact support.';
    case 'rate_limit_error':
      return 'Too many requests. Please wait and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
```

## Testing

### Test Mode
```typescript
// Use test keys in development
const stripe = new Stripe(
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY!
    : process.env.STRIPE_SECRET_KEY_TEST!,
  {
    apiVersion: '2024-06-20',
  }
);
```

### Test Card Numbers
```
4242 4242 4242 4242 - Success
4000 0000 0000 0002 - Declined
4000 0025 0000 3155 - Insufficient funds
4000 0000 0000 9995 - Expired card
```

## Security Best Practices

### PCI Compliance
- Never store card details on your servers
- Use Stripe Elements for card input
- Implement proper error handling
- Regular security audits

### Webhook Security
- Verify webhook signatures
- Use HTTPS for webhook endpoints
- Implement idempotency keys
- Log all webhook events

### Data Protection
- Encrypt sensitive data
- Implement proper access controls
- Regular data backups
- GDPR/CCPA compliance

## Pricing & Limits

### Free Tier
- $0 setup fee
- 2.9% + $0.30 per transaction (domestic cards)
- No monthly fees
- Full API access

### Business Tier
- Volume discounts available
- Custom pricing for high volume
- Dedicated support
- Advanced features

## Resources
- [Stripe Documentation](https://stripe.com/docs)
- [API Reference](https://stripe.com/docs/api)
- [Dashboard](https://dashboard.stripe.com/)
- [Testing Guide](https://stripe.com/docs/testing)
- [Webhooks Guide](https://stripe.com/docs/webhooks)