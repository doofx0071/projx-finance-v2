# Mailgun Integration Guide

## Overview
Mailgun is a powerful email service for sending, receiving, and tracking emails programmatically. This guide covers integration with your Finance Tracker for notifications, receipts, and user communications.

## Installation
```bash
npm install mailgun.js
```

## Authentication
Mailgun uses API key authentication with a specific username format. Set your environment variables:

```bash
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your_verified_domain.com
```

### Getting Your Credentials
1. **Sign up** at [Mailgun](https://www.mailgun.com/)
2. **Verify your domain** in the Mailgun dashboard
3. **Get your API key** from Settings → API Keys
4. **Note your domain** (e.g., `mg.yourdomain.com` or your custom domain)

## Basic Setup

### Client Initialization
```typescript
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY ?? '',
});
```

### ESM Import (Alternative)
```typescript
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY ?? '',
});
```

## Core Features

### Sending Basic Emails
```typescript
async function sendEmail(to: string, subject: string, text: string) {
  const data = {
    from: `Finance Tracker <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to: [to],
    subject: subject,
    text: text,
  };

  const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
  return result;
}
```

### Sending HTML Emails
```typescript
async function sendHtmlEmail(to: string, subject: string, html: string) {
  const data = {
    from: `Finance Tracker <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to: [to],
    subject: subject,
    html: html,
  };

  return await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
}
```

### Finance Tracker Use Cases

#### Transaction Receipt
```typescript
async function sendTransactionReceipt(userEmail: string, transaction: any) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Transaction Receipt</h2>
      <p>Dear ${transaction.userName},</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Transaction Details</h3>
        <p><strong>Amount:</strong> $${transaction.amount}</p>
        <p><strong>Category:</strong> ${transaction.category}</p>
        <p><strong>Date:</strong> ${transaction.date}</p>
        <p><strong>Description:</strong> ${transaction.description}</p>
      </div>

      <p>Thank you for using Finance Tracker!</p>
    </div>
  `;

  return await sendHtmlEmail(userEmail, 'Transaction Receipt', html);
}
```

#### Budget Alert
```typescript
async function sendBudgetAlert(userEmail: string, budgetData: any) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Budget Alert ⚠️</h2>

      <p>You've exceeded your budget for <strong>${budgetData.category}</strong>.</p>

      <div style="background: #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Budget Limit:</strong> $${budgetData.limit}</p>
        <p><strong>Current Spending:</strong> $${budgetData.spent}</p>
        <p><strong>Exceeded by:</strong> $${budgetData.exceeded}</p>
      </div>

      <p>Consider reviewing your expenses to stay within budget.</p>
    </div>
  `;

  return await sendHtmlEmail(userEmail, 'Budget Alert', html);
}
```

#### Monthly Report
```typescript
async function sendMonthlyReport(userEmail: string, reportData: any) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Monthly Financial Report</h2>
      <p>Here's your financial summary for ${reportData.month}:</p>

      <div style="display: flex; gap: 20px; margin: 20px 0;">
        <div style="flex: 1; background: #d4edda; padding: 15px; border-radius: 8px;">
          <h3 style="color: #155724;">Income</h3>
          <p style="font-size: 24px; font-weight: bold; color: #155724;">
            $${reportData.totalIncome}
          </p>
        </div>

        <div style="flex: 1; background: #f8d7da; padding: 15px; border-radius: 8px;">
          <h3 style="color: #721c24;">Expenses</h3>
          <p style="font-size: 24px; font-weight: bold; color: #721c24;">
            $${reportData.totalExpenses}
          </p>
        </div>
      </div>

      <h3>Top Spending Categories</h3>
      <ul>
        ${reportData.categories.map(cat =>
          `<li>${cat.name}: $${cat.amount}</li>`
        ).join('')}
      </ul>
    </div>
  `;

  return await sendHtmlEmail(userEmail, `Financial Report - ${reportData.month}`, html);
}
```

## Advanced Features

### Email Templates
```typescript
async function sendTemplatedEmail(templateName: string, templateVars: any) {
  const data = {
    from: `Finance Tracker <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to: templateVars.email,
    subject: templateVars.subject,
    template: templateName,
    'v:username': templateVars.username,
    'v:amount': templateVars.amount,
    // Add more template variables as needed
  };

  return await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
}
```

### Bulk Email Sending
```typescript
async function sendBulkEmails(recipients: string[], subject: string, content: string) {
  const batchSize = 1000; // Mailgun limit
  const batches = [];

  for (let i = 0; i < recipients.length; i += batchSize) {
    batches.push(recipients.slice(i, i + batchSize));
  }

  const results = [];
  for (const batch of batches) {
    const data = {
      from: `Finance Tracker <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: batch,
      subject: subject,
      text: content,
    };

    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    results.push(result);
  }

  return results;
}
```

### Email Validation
```typescript
async function validateEmail(email: string) {
  try {
    const result = await mg.validate.get(email);
    return {
      isValid: result.result === 'deliverable',
      risk: result.risk,
      reason: result.reason,
    };
  } catch (error) {
    console.error('Email validation failed:', error);
    return { isValid: false, risk: 'unknown' };
  }
}
```

### Webhooks for Email Events
```typescript
// Set up webhook endpoint in your Next.js API
// POST /api/webhooks/mailgun

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature (important for security)
  const signature = req.headers['x-mailgun-signature'] as string;

  // Process webhook data
  const { event, recipient, subject } = req.body;

  switch (event) {
    case 'delivered':
      console.log(`Email delivered to ${recipient}`);
      break;
    case 'bounced':
      console.log(`Email bounced for ${recipient}`);
      // Handle bounce - maybe update user preferences
      break;
    case 'complained':
      console.log(`Spam complaint from ${recipient}`);
      // Handle complaint - remove from mailing list
      break;
  }

  res.status(200).json({ received: true });
}
```

## Domain Management

### List Domains
```typescript
async function listDomains() {
  const domains = await mg.domains.list();
  return domains.items;
}
```

### Verify Domain
```typescript
async function verifyDomain(domain: string) {
  const result = await mg.domains.verify(domain);
  return result;
}
```

## Error Handling
```typescript
async function sendEmailSafely(emailData: any) {
  try {
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
    console.log('Email sent successfully:', result.id);
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error('Email sending failed:', error.message);

    if (error.status === 401) {
      throw new Error('Invalid Mailgun API key');
    } else if (error.status === 400) {
      throw new Error('Invalid email data or domain not verified');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded');
    } else {
      throw new Error(`Mailgun error: ${error.message}`);
    }
  }
}
```

## Rate Limits & Pricing

### Free Tier
- 5,000 emails/month
- 100 emails/day
- 1 domain
- Basic support

### Paid Plans
- Higher sending limits
- Multiple domains
- Advanced analytics
- Priority support
- Dedicated IPs

## Best Practices

### For Finance Applications
1. **Use verified domains** to improve deliverability
2. **Implement proper error handling** for failed sends
3. **Set up webhooks** to track email events
4. **Use templates** for consistent branding
5. **Validate emails** before sending
6. **Monitor bounce rates** and sender reputation

### Email Deliverability
1. **Authenticate your domain** (SPF, DKIM, DMARC)
2. **Use consistent sending patterns**
3. **Monitor engagement metrics**
4. **Handle bounces and complaints** promptly
5. **Warm up new domains** gradually

### Security
1. **Store API keys securely** (environment variables)
2. **Verify webhook signatures** to prevent spoofing
3. **Use HTTPS** for webhook endpoints
4. **Validate email addresses** before sending
5. **Implement rate limiting** on your application

## Integration Examples

### Next.js API Route for Sending Emails
```typescript
// pages/api/send-receipt.ts
import { NextApiRequest, NextApiResponse } from 'next';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY ?? '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, transactionId } = req.body;

  try {
    const data = {
      from: `Finance Tracker <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: [email],
      subject: 'Transaction Receipt',
      text: `Your transaction ${transactionId} has been processed successfully.`,
    };

    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, data);

    res.status(200).json({
      success: true,
      messageId: result.id,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
    });
  }
}
```

### React Hook for Email Sending
```typescript
// hooks/useEmail.ts
import { useState } from 'react';

export function useEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (emailData: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendEmail, loading, error };
}
```

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check API key and domain verification
2. **400 Bad Request**: Validate email format and required fields
3. **429 Rate Limited**: Implement exponential backoff
4. **550 Mailbox unavailable**: Email address doesn't exist

### Domain Verification Issues
- **SPF Records**: Ensure your domain has correct SPF records
- **DKIM Keys**: Verify DKIM keys are properly configured
- **DMARC Policy**: Set up DMARC for better deliverability

### Testing
```typescript
// Use Mailgun's sandbox domain for testing
const testDomain = 'sandboxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org';

// Send test email
const testData = {
  from: `Test <test@${testDomain}>`,
  to: ['your-email@example.com'],
  subject: 'Test Email',
  text: 'This is a test email from Mailgun',
};

await mg.messages.create(testDomain, testData);
```

## Resources
- [Mailgun Documentation](https://documentation.mailgun.com/)
- [API Reference](https://documentation.mailgun.com/docs/mailgun/api-reference/)
- [Dashboard](https://app.mailgun.com/)
- [Pricing](https://www.mailgun.com/pricing/)