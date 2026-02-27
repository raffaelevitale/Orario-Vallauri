"use client";

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useScheduleStore } from '@/lib/orario/stores/scheduleStore';
import { useThemeStore } from '@/lib/orario/stores/themeStore';

/**
 * Hook to sync user context with Sentry for better error tracking
 * Automatically updates Sentry user info when schedule/theme changes
 */
export function useSentryUser() {
  const { userMode, selectedEntity } = useScheduleStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    // Set user context for Sentry error tracking
    if (userMode && selectedEntity) {
      Sentry.setUser({
        id: selectedEntity.toLowerCase().replace(/\s+/g, '-'),
        username: selectedEntity,
      });

      // Add custom context for debugging
      Sentry.setContext('user_preferences', {
        mode: userMode,
        entity: selectedEntity,
        theme: theme,
      });

      // Add tags for filtering errors in Sentry dashboard
      Sentry.setTag('user_mode', userMode);
      Sentry.setTag('theme', theme);
    }
  }, [userMode, selectedEntity, theme]);
}
