import * as Sentry from '@sentry/nextjs';

/**
 * Utility functions for custom Sentry error tracking
 */

/**
 * Track errors when loading schedule data
 */
export function captureScheduleLoadError(
  error: Error,
  source: 'api' | 'file' | 'cache',
  entityName?: string
) {
  Sentry.captureException(error, {
    tags: {
      error_type: 'schedule_load',
      source: source,
    },
    contexts: {
      schedule: {
        entity: entityName,
        source: source,
      },
    },
  });
}

/**
 * Track errors in schedule rendering
 */
export function captureScheduleRenderError(
  error: Error,
  component: string,
  viewType: 'list' | 'timeline'
) {
  Sentry.captureException(error, {
    tags: {
      error_type: 'render_error',
      component: component,
      view_type: viewType,
    },
  });
}

/**
 * Track PWA installation events
 */
export function trackPWAInstall(platform: string) {
  Sentry.addBreadcrumb({
    category: 'pwa',
    message: 'PWA installed',
    level: 'info',
    data: {
      platform,
    },
  });
}

/**
 * Track user actions for debugging context
 */
export function trackUserAction(action: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'user_action',
    message: action,
    level: 'info',
    data,
  });
}

/**
 * Track performance issues
 */
export function capturePerformanceIssue(
  operationName: string,
  duration: number,
  threshold: number
) {
  if (duration > threshold) {
    Sentry.captureMessage(
      `Performance: ${operationName} took ${duration}ms (threshold: ${threshold}ms)`,
      {
        level: 'warning',
        tags: {
          operation: operationName,
        },
        contexts: {
          performance: {
            duration,
            threshold,
          },
        },
      }
    );
  }
}
