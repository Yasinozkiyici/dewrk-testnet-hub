/**
 * Analytics Instrumentation
 * 
 * Tags key admin events with analytics.
 * Integrates with your analytics provider (e.g., Plausible, Google Analytics).
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

/**
 * Track admin event
 * 
 * Usage:
 * ```tsx
 * trackAdminEvent({
 *   name: 'testnet_created',
 *   properties: { testnet_id: '123', network: 'Ethereum' }
 * });
 * ```
 */
export function trackAdminEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;

  // TODO: Integrate with analytics provider
  // Example for Plausible:
  // window.plausible?.(event.name, { props: event.properties });

  // Example for Google Analytics:
  // if (window.gtag) {
  //   window.gtag('event', event.name, event.properties);
  // }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event);
  }
}

/**
 * Pre-defined admin event trackers
 */
export const AdminAnalytics = {
  testnetCreated: (testnetId: string, network: string) => {
    trackAdminEvent({
      name: 'admin_testnet_created',
      properties: { testnet_id: testnetId, network }
    });
  },

  testnetUpdated: (testnetId: string, changes: string[]) => {
    trackAdminEvent({
      name: 'admin_testnet_updated',
      properties: { testnet_id: testnetId, changed_fields: changes }
    });
  },

  testnetDeleted: (testnetId: string) => {
    trackAdminEvent({
      name: 'admin_testnet_deleted',
      properties: { testnet_id: testnetId }
    });
  },

  userCreated: (userId: string, role: string) => {
    trackAdminEvent({
      name: 'admin_user_created',
      properties: { user_id: userId, role }
    });
  },

  permissionChanged: (userId: string, role: string) => {
    trackAdminEvent({
      name: 'admin_permission_changed',
      properties: { user_id: userId, new_role: role }
    });
  },

  formSaved: (resourceType: string, resourceId: string) => {
    trackAdminEvent({
      name: 'admin_form_saved',
      properties: { resource_type: resourceType, resource_id: resourceId }
    });
  },

  formValidationError: (resourceType: string, field: string, error: string) => {
    trackAdminEvent({
      name: 'admin_form_validation_error',
      properties: { resource_type: resourceType, field, error }
    });
  }
};

