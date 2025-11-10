"use client";

import { useSentryUser } from '@/lib/orario/hooks/useSentryUser';

/**
 * Client component to initialize Sentry user tracking
 * Place this in your root layout or app wrapper
 */
export function SentryUserProvider({ children }: { children: React.ReactNode }) {
  useSentryUser();
  return <>{children}</>;
}
