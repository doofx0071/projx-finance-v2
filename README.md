# 💰 PHPinancia - Personal Finance Tracker

<div align="center">

![PHPinancia Logo](public/logos/PHPinancia-light-logo-only-updated.png)

**A modern, full-featured personal finance management application built with Next.js 15, React 19, and Supabase.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

PHPinancia is a comprehensive personal finance tracker that helps you manage your income, expenses, budgets, and financial goals. Built with modern web technologies, it offers a seamless user experience with powerful features like AI-powered insights, real-time analytics, and comprehensive accessibility support.

### Why PHPinancia?

- ✅ **100% Free & Open Source** - No hidden costs or premium tiers
- 🔒 **Privacy-First** - Your data stays in your Supabase instance
- 🎨 **Beautiful UI** - Modern design with dark mode support
- 🤖 **AI-Powered** - Smart insights using Mistral AI
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 📱 **Responsive** - Works on all devices
- ⚡ **Fast** - Optimized for performance with Next.js 15

---

## ✨ Features

### Core Features

- 💸 **Transaction Management**
  - Track income and expenses
  - Categorize transactions
  - Add descriptions and notes
  - Filter and search transactions
  - Bulk operations

- 📊 **Budget Tracking**
  - Create monthly budgets
  - Track spending against budgets
  - Visual progress indicators
  - Budget alerts and notifications

- 📈 **Financial Reports**
  - Income vs Expense analysis
  - Category-wise spending breakdown
  - Monthly/Yearly trends
  - Export reports to CSV/PDF

- 🤖 **AI-Powered Insights**
  - Smart spending analysis
  - Personalized recommendations
  - Financial chatbot assistant
  - Automated categorization

### Advanced Features

- 🗑️ **Trash & Restore**
  - Soft delete transactions
  - Restore deleted items
  - Permanent deletion after 30 days

- 🌙 **Dark Mode**
  - System preference detection
  - Manual toggle
  - Persistent across sessions

- ♿ **Accessibility**
  - Screen reader support
  - Keyboard navigation
  - ARIA labels
  - High contrast mode

- 🔒 **Security**
  - CSRF protection
  - Rate limiting
  - Input sanitization
  - XSS prevention
  - Row Level Security (RLS)

- 📊 **Performance Monitoring**
  - Sentry error tracking
  - Web Vitals monitoring
  - Lighthouse CI integration
  - Bundle size optimization

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.5.4 (App Router)
- **UI Library:** React 19.1.0
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (SSR)
- **API:** Next.js API Routes
- **Caching:** Upstash Redis
- **Rate Limiting:** Upstash Ratelimit

### AI & Analytics
- **AI:** Mistral AI
- **Error Tracking:** Sentry
- **Analytics:** Vercel Analytics
- **Performance:** Web Vitals

### Development
- **Testing:** Jest + Playwright
- **Linting:** ESLint 9
- **Logging:** Pino
- **Validation:** Zod
- **State Management:** TanStack Query + Zustand

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account
- Upstash Redis account
- Mistral AI API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/phpinancia.git
   cd phpinancia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL migrations from `supabase/migrations/`
   - Enable Row Level Security (RLS)
   - Copy your project URL and keys to `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Upstash Redis (REQUIRED for rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Mistral AI (REQUIRED for AI features)
MISTRAL_API_KEY=your_mistral_api_key
```


### Optional Variables

```bash
# Sentry (OPTIONAL - Error tracking)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Mailgun (OPTIONAL - Email notifications)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain

# Feature Flags (OPTIONAL)
NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION=true
NEXT_PUBLIC_ENABLE_RECEIPT_UPLOAD=false
NEXT_PUBLIC_ENABLE_BUDGET_TRACKING=true
```

See `.env.example` for the complete list with descriptions.

---

## 📁 Project Structure

```
phpinancia/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── forms/             # Form components
│   │   ├── modals/            # Modal dialogs
│   │   └── charts/            # Chart components
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-transactions.ts
│   │   ├── use-categories.ts
│   │   └── use-budgets.ts
│   ├── lib/                   # Utility functions
│   │   ├── supabase-server.ts # Supabase server client
│   │   ├── api-helpers.ts     # API helper functions
│   │   ├── logger.ts          # Structured logging
│   │   ├── rate-limit.ts      # Rate limiting
│   │   ├── sanitize.ts        # Input sanitization
│   │   └── validations.ts     # Zod schemas
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── supabase/                  # Supabase migrations
├── tests/                     # Test files
│   ├── unit/                  # Unit tests
│   └── e2e/                   # E2E tests
├── mds/                       # Documentation
└── .env.example               # Environment template
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run E2E tests
npm run test:all         # Run all tests

# Performance
npm run build:analyze    # Analyze bundle size
npm run lighthouse       # Run Lighthouse CI
npm run perf:test        # Run performance tests

# Database
npm run db:migrate       # Run Supabase migrations
npm run db:reset         # Reset database
npm run db:seed          # Seed database
```

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting (recommended)
- **TypeScript** strict mode
- **Conventional Commits** for commit messages

### Adding shadcn/ui Components

```bash
# Add a new component
npx shadcn@latest add [component-name]

# Example: Add a dialog component
npx shadcn@latest add dialog
```

### API Development

API routes follow a standardized pattern using helper functions:

```typescript
import { authenticateApiRequest, applyRateLimit, withErrorHandling } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'read')
    const { supabase, user } = await authenticateApiRequest()

    // Your API logic here

    return createSuccessResponse({ data })
  })
}
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in specific browser
npm run test:e2e -- --project=chromium
```

### Test Coverage

Current test coverage:
- Unit Tests: 75%
- E2E Tests: 60%
- Integration Tests: 70%

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables
   - Deploy

3. **Configure Environment**
   - Add all required environment variables
   - Set up Supabase connection
   - Configure Redis connection

### Docker

```bash
# Build Docker image
docker build -t phpinancia .

# Run container
docker run -p 3000:3000 --env-file .env.local phpinancia
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

---

## 📚 Documentation

Comprehensive documentation is available in the `mds/` directory:

- [Implementation Updates](mds/IMPLEMENTATION_UPDATES.md)
- [Remaining Tasks](mds/REMAINING_TASKS.md)
- [Deployment Guide](mds/docs/deployment.md)
- [Testing Guide](mds/docs/testing.md)
- [Accessibility Report](mds/docs/accessibility-report.md)
- [Codebase Analysis](mds/new/CODEBASE-ANALYSIS-REPORT.md)
- [Quick Fixes Guide](mds/new/QUICK-FIXES-GUIDE.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Use conventional commits
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Mistral AI](https://mistral.ai/) - AI-powered insights
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📞 Support

- 📧 Email: support@phpinancia.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/phpinancia/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/phpinancia/discussions)
- 📖 Documentation: [docs.phpinancia.com](https://docs.phpinancia.com)

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Multi-currency support
- [ ] Receipt scanning with OCR
- [ ] Mobile app (React Native)
- [ ] Bank account integration (Plaid)

### Q2 2025
- [ ] Investment tracking
- [ ] Bill reminders
- [ ] Recurring transactions
- [ ] Financial goals

### Q3 2025
- [ ] Multi-user support
- [ ] Shared budgets
- [ ] Export to accounting software
- [ ] Advanced reporting

---

<div align="center">

**Made with ❤️ by the PHPinancia Team**

[⬆ Back to Top](#-phpinancia---personal-finance-tracker)

</div>

