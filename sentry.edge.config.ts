/**
 * UI-FREEZE: Sentry Edge Configuration
 * 
 * Edge runtime error monitoring
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Performance monitoring
  beforeSend(event) {
    // Filter out UI-Freeze violations from Sentry
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.value?.includes('UI-FREEZE VIOLATION')) {
        return null; // Don't send UI-Freeze violations to Sentry
      }
    }
    
    return event;
  },
  
  // Custom tags for better organization
  initialScope: {
    tags: {
      component: 'testnet-hub',
      environment: process.env.NODE_ENV,
    },
  },
});

