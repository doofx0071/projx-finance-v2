import * as Sentry from '@sentry/nextjs';
import { validateEnv } from './lib/env';

export async function register() {
  // Validate environment variables on startup
  console.log('🔍 Validating environment variables...');
  const envResult = validateEnv();

  if (!envResult.success) {
    const errorMessages = envResult.error.errors.map((error, idx) => {
      return `  ${idx + 1}. ${error.path.join('.')}: ${error.message}`;
    });

    console.error('\n❌ Environment variable validation failed:');
    console.error(errorMessages.join('\n'));
    console.error('\n📝 Please check your .env.local file.\n');

    // Exit in production, throw in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      throw new Error('Environment variable validation failed');
    }
  }

  console.log('✅ Environment variables validated successfully');

  // Initialize Sentry after env validation
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
