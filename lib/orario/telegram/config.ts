const DEFAULT_TIMEZONE = "Europe/Rome";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getTelegramBotToken(): string {
  return requireEnv("TELEGRAM_BOT_TOKEN");
}

export function getTelegramWebhookSecret(): string {
  return requireEnv("TELEGRAM_WEBHOOK_SECRET");
}

export function getCronSecret(): string {
  return requireEnv("CRON_SECRET");
}

export function getTelegramTimezone(): string {
  return process.env.TELEGRAM_TIMEZONE?.trim() || DEFAULT_TIMEZONE;
}
