// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

// Enable Sentry only in production and when a DSN is provided.
// This prevents sending errors from localhost / development environments.
if (process.env.NODE_ENV === "production" && dsn) {
    Sentry.init({
        dsn,
        integrations: [
            // send console.log, console.warn, and console.error calls as logs to Sentry
            Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
        ],
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
