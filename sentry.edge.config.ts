// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

// Enable Sentry only in production and when a DSN is provided.
// This prevents sending errors from localhost / development environments.
if (process.env.NODE_ENV === "production" && dsn) {
  Sentry.init({
    dsn,
    // In production keep a sensible sampling rate
    tracesSampleRate: 1,
    enableLogs: true,
    sendDefaultPii: true,
  });
} else {
  // Initialize Sentry in disabled mode to keep SDK APIs available without sending events.
  Sentry.init({
    dsn: dsn ?? "",
    enabled: false,
    tracesSampleRate: 0,
    enableLogs: false,
    sendDefaultPii: false,
  });
}
