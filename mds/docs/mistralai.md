# Mistral AI Integration Guide

## Overview
Mistral AI provides powerful language models for text generation, analysis, and AI-powered features. This guide covers integration with the TypeScript client for your Finance Tracker application.

## Installation
```bash
npm install @mistralai/mistralai
```

## Authentication
Mistral AI uses API key authentication. Set your environment variable:

```bash
MISTRAL_API_KEY=your_mistral_api_key_here
```

Get your API key from [Mistral AI Console](https://console.mistral.ai/).

## Basic Setup

### Client Initialization
```typescript
import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});
```

### Available Models
- `mistral-tiny` - Fast and lightweight
- `mistral-small` - Balanced performance
- `mistral-medium` - High performance
- `mistral-large` - Most capable
- `codestral-2405` - Code generation specialist

## Core Features

### Text Generation (Chat Completion)
```typescript
async function generateResponse(prompt: string) {
  const result = await mistral.chat.complete({
    model: "mistral-small",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return result.choices[0].message.content;
}
```

### Streaming Responses
```typescript
async function streamResponse(prompt: string) {
  const result = await mistral.chat.stream({
    model: "mistral-small",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  for await (const chunk of result) {
    console.log(chunk.choices[0].delta.content);
  }
}
```

### Expense Categorization (Finance Tracker Use Case)
```typescript
async function categorizeExpense(description: string) {
  const categories = [
    "Food & Dining",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Bills & Utilities",
    "Healthcare",
    "Other"
  ];

  const prompt = `Categorize this expense: "${description}"

Available categories: ${categories.join(", ")}

Return only the category name.`;

  const result = await mistral.chat.complete({
    model: "mistral-small",
    messages: [{ role: "user", content: prompt }],
  });

  return result.choices[0].message.content?.trim();
}
```

### Budget Analysis
```typescript
async function analyzeSpending(spendingData: any) {
  const prompt = `Analyze this spending data and provide insights:
${JSON.stringify(spendingData, null, 2)}

Provide:
1. Spending trends
2. Areas for cost reduction
3. Budget recommendations`;

  const result = await mistral.chat.complete({
    model: "mistral-medium",
    messages: [{ role: "user", content: prompt }],
  });

  return result.choices[0].message.content;
}
```

## Advanced Features

### Function Calling (Tools)
```typescript
const tools = [
  {
    type: "function",
    function: {
      name: "get_current_balance",
      description: "Get the current account balance",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

const result = await mistral.chat.complete({
  model: "mistral-large",
  messages: [{ role: "user", content: "What's my current balance?" }],
  tools: tools,
});
```

### Embeddings (for Semantic Search)
```typescript
async function createEmbedding(text: string) {
  const result = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: [text],
  });

  return result.data[0].embedding;
}
```

### Fine-tuning (Advanced)
```typescript
// Upload training data
const file = await mistral.files.upload({
  file: fs.createReadStream("training_data.jsonl"),
  purpose: "fine-tune",
});

// Create fine-tuning job
const job = await mistral.fineTuning.jobs.create({
  model: "mistral-small",
  training_file: file.id,
  hyperparameters: {
    learning_rate: 0.0001,
    epochs: 3,
  },
});
```

## Error Handling
```typescript
try {
  const result = await mistral.chat.complete({
    model: "mistral-small",
    messages: [{ role: "user", content: "Hello" }],
  });
} catch (error) {
  if (error.status === 429) {
    console.log("Rate limit exceeded");
  } else if (error.status === 401) {
    console.log("Invalid API key");
  } else {
    console.error("API Error:", error);
  }
}
```

## Rate Limits & Pricing (2025)

### ✅ **FREE TIER - $0/mo!**
Mistral AI offers **completely free** access to their highest-performing models:
- **$0/month** - No credit card required
- Access to **highest-performing models** for personal and work use
- **Unlimited messages** (with some feature limits)
- Voice mode, agents, web searches, and more
- Perfect for development, testing, and personal use

### Paid Tiers (2025)
```
Free:        $0/mo      - Personal use, basic features
Pro:         $14.99/mo  - Enhanced productivity, extended AI capabilities
Team:        $24.99/mo  - Secure collaborative workspace (per user)
Enterprise:  Custom     - Private deployments, custom models
```

### Self-Hosted (Also Completely Free)
All open models can be **downloaded and run locally for free**:
- Download model weights from Hugging Face
- Run on your own infrastructure (GPU required for larger models)
- **No API costs, no rate limits**
- Requires technical setup and hardware

### API Pricing (For High-Volume Usage)
When you exceed free tier limits, paid API usage:
```
Mistral Nemo:     $0.15/M tokens (50% reduction from 2024)
Mistral Small:    $0.20 input / $0.60 output (80% reduction)
Codestral:        $0.20 input / $0.60 output (80% reduction)
Mistral Large:    $2.00 input / $6.00 output (33% reduction)
```

### Recommended for Finance Tracker
**Use the FREE $0/mo tier** - it's perfect for your finance app! You get:
- ✅ Expense categorization with AI
- ✅ Financial insights generation
- ✅ Budget analysis features
- ✅ **All at $0 cost** - no limits for development!

Only consider paid tiers when you have significant production traffic or need advanced features like team collaboration.

## Best Practices

### For Finance Applications
1. **Use structured prompts** for consistent categorization
2. **Implement caching** for repeated queries
3. **Handle rate limits** gracefully
4. **Validate AI responses** before using in calculations
5. **Use streaming** for better user experience

### Cost Optimization
1. **Choose appropriate model size** for the task
2. **Batch similar requests** when possible
3. **Cache frequent responses**
4. **Use fine-tuning** for domain-specific tasks

## Integration Examples

### Expense Analysis Component
```typescript
// components/ExpenseAnalyzer.tsx
import { useState } from 'react';
import { Mistral } from '@mistralai/mistralai';

const mistral = new Mistral({
  apiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY ?? "",
});

export function ExpenseAnalyzer() {
  const [analysis, setAnalysis] = useState('');

  const analyzeExpenses = async (expenses: any[]) => {
    const prompt = `Analyze these expenses and provide insights:
${JSON.stringify(expenses)}

Focus on:
- Spending patterns
- Unusual transactions
- Budget recommendations`;

    const result = await mistral.chat.complete({
      model: "mistral-medium",
      messages: [{ role: "user", content: prompt }],
    });

    setAnalysis(result.choices[0].message.content || '');
  };

  return (
    <div>
      <button onClick={() => analyzeExpenses(expenses)}>
        Analyze Expenses
      </button>
      <div>{analysis}</div>
    </div>
  );
}
```

## Security Considerations
- **Never expose API keys** in client-side code
- **Use environment variables** for all secrets
- **Implement rate limiting** on your application
- **Validate AI responses** before processing
- **Log API usage** for monitoring

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check API key
2. **429 Rate Limited**: Implement exponential backoff
3. **400 Bad Request**: Validate request format
4. **500 Server Error**: Retry with backoff

### Debug Mode
```typescript
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
  // Enable debug logging
  debug: process.env.NODE_ENV === 'development',
});
```

## Resources
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [API Reference](https://docs.mistral.ai/api/)
- [Console](https://console.mistral.ai/)
- [Pricing](https://mistral.ai/pricing/)