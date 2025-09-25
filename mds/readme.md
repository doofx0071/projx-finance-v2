# Finance Tracker v2

This project is a finance tracker application built with Next.js, TypeScript, Tailwind CSS, and Shadcn UI. It utilizes the App Router and includes dark mode support with `next-themes`.

## Features

*   **Next.js:** A React framework for building performant web applications.
*   **TypeScript:** Adds static typing to JavaScript for improved code maintainability.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
*   **Shadcn UI:** A collection of accessible and reusable components.
*   **App Router:** Next.js's recommended way to build modern web applications.
*   **Dark Mode:** Implemented with `next-themes` for a user-friendly experience.

## Setup

1.  Install dependencies:

    ```powershell
    npm install
    ```

2.  Initialize Tailwind CSS. If you haven't already, run the following command in your terminal:

    ```powershell
    npx tailwindcss init -p
    ```

    This will create `tailwind.config.js` and `postcss.config.js` files.

3.  Set up environment variables:

    Copy `.env.local` and update with your actual values:

    ```powershell
    cp .env.local .env.local.example
    # Edit .env.local with your actual API keys and configuration
    ```

4.  Run the development server:

    ```powershell
    npm run dev
    ```

## Environment Variables

The application uses the following environment variables, organized by category:

### Database
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DATABASE_URL` - PostgreSQL connection string (alternative)

### Authentication
- `NEXTAUTH_URL` - NextAuth.js callback URL
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `JWT_SECRET` - JWT signing secret

### External APIs
- `MISTRAL_API_KEY` - Mistral AI API for AI features
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `MAILGUN_API_KEY` - Mailgun API key for emails
- `MAILGUN_DOMAIN` - Mailgun domain for sending emails

### App Configuration
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_DEFAULT_CURRENCY` - Default currency (USD, EUR, etc.)
- `NEXT_PUBLIC_DEBUG` - Enable debug mode

### Security
- `ENCRYPTION_KEY` - 32-character encryption key
- `CSRF_SECRET` - CSRF protection secret

See `.env.local` for the complete list with placeholder values.

## Shadcn UI

This project uses Shadcn UI (`/shadcn-ui/ui`). To add components, use the following command:

```powershell
npx shadcn@latest add [component]
```

Before adding the dark mode toggle, you'll need to add the `button` component:

```powershell
npx shadcn@latest add button
```

### Project Structure with Shadcn UI

The typical project structure with Shadcn UI is as follows:

```
apps
└── web         # Your app goes here.
    ├── app
    │   └── page.tsx
    ├── components
    │   └── login-form.tsx
    ├── components.json
    └── package.json
packages
└── ui          # Your components and dependencies are installed here.
    ├── src
    │   ├── components
    │   │   └── button.tsx
    │   ├── hooks
    │   ├── lib
    │   │   └── utils.ts
    │   └── styles
    │       └── globals.css
    ├── components.json
    └── package.json
package.json
turbo.json
```

### Viewing Components

You can preview components from the registry before installing using the `view` command:

```powershell
npx shadcn@latest view [item]
```

For more information, see the [Shadcn UI documentation](https://ui.shadcn.com/docs/cli).

## Dark Mode

Dark mode is implemented using `next-themes`. Follow the [official documentation](https://ui.shadcn.com/docs/dark-mode/next) for configuration and usage. The `ThemeProvider` component is already integrated into `src\app\layout.tsx`.

## Project Structure

This project follows Next.js App Router best practices with a feature-based folder organization for scalability and maintainability.

```
finance-tracker-v2/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route groups for organization
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/              # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── categories/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── api/                      # API routes
│   │   │   ├── transactions/
│   │   │   ├── categories/
│   │   │   └── reports/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── favicon.ico
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── forms/                    # Form components
│   │   │   ├── transaction-form.tsx
│   │   │   ├── category-form.tsx
│   │   │   └── ...
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   ├── charts/                   # Chart components
│   │   │   ├── expense-chart.tsx
│   │   │   ├── income-chart.tsx
│   │   │   └── ...
│   │   ├── theme-provider.tsx
│   │   └── mode-toggle.tsx
│   ├── lib/                          # Utilities & configurations
│   │   ├── utils.ts                  # General utilities (cn, etc.)
│   │   ├── validations.ts            # Form validations
│   │   ├── constants.ts              # App constants
│   │   ├── api.ts                    # API client setup
│   │   └── supabase.ts               # Database client
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-transactions.ts
│   │   ├── use-categories.ts
│   │   ├── use-auth.ts
│   │   └── ...
│   ├── types/                        # TypeScript types
│   │   ├── transaction.ts
│   │   ├── category.ts
│   │   ├── user.ts
│   │   └── index.ts
│   ├── stores/                       # State management (Zustand)
│   │   ├── transaction-store.ts
│   │   ├── ui-store.ts
│   │   └── ...
│   └── middleware.ts                 # Next.js middleware
├── public/                           # Static assets
│   ├── icons/
│   └── images/
├── .env.local                        # Environment variables
├── components.json                   # shadcn/ui config
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

### Organization Principles

#### 1. **Feature-Based Structure**
- Group related components, hooks, and types together
- Each feature (transactions, categories, reports) has its own folder

#### 2. **Separation of Concerns**
- **Components**: UI elements only
- **Hooks**: Data fetching and state logic
- **Lib**: Pure utilities and configurations
- **Types**: TypeScript definitions

#### 3. **App Router Benefits**
- **Route Groups**: `(auth)`, `(dashboard)` for logical grouping
- **Nested Layouts**: Different layouts for auth vs dashboard
- **API Routes**: Server-side API endpoints

#### 4. **Scalability**
- Easy to add new features
- Clear boundaries between concerns
- Reusable components across features

## API Documentation

Detailed integration guides for all external services are available in the `mds/docs/` folder:

- **[Mistral AI](mds/docs/mistralai.md)** - AI-powered expense categorization and financial insights
- **[Mailgun](mds/docs/mailgun.md)** - Email notifications and transaction receipts
- **[Supabase](mds/docs/supabase.md)** - Database, authentication, and real-time features
- **[Stripe](mds/docs/stripe.md)** - Payment processing and subscription management

## Available Shadcn UI Components

*   Accordion
*   Alert
*   Alert Dialog
*   Aspect Ratio
*   Avatar
*   Badge
*   Breadcrumb
*   Button
*   Calendar
*   Card
*   Carousel
*   Chart
*   Checkbox
*   Collapsible
*   Combobox
*   Command
*   Context Menu
*   Data Table
*   Date Picker
*   Dialog
*   Drawer
*   Dropdown Menu
*   React Hook Form
*   Hover Card
*   Input
*   Input OTP
*   Label
*   Menubar
*   Navigation Menu
*   Pagination
*   Popover
*   Progress
*   Radio Group
*   Resizable
*   Scroll-area
*   Select
*   Separator
*   Sheet
*   Sidebar
*   Skeleton
*   Slider
*   Sonner
*   Switch
*   Table
*   Tabs
*   Textarea
*   Toast
*   Toggle
*   Toggle Group
*   Tooltip
*   Typography
