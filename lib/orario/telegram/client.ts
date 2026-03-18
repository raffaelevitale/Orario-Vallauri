import { getTelegramBotToken } from "@/lib/orario/telegram/config";

interface TelegramApiResult<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

interface SendMessageParams {
  chatId: string;
  text: string;
  disableNotification?: boolean;
}

function getTelegramApiBaseUrl(): string {
  const botToken = getTelegramBotToken();
  return `https://api.telegram.org/bot${botToken}`;
}

async function callTelegramApi<T>(method: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${getTelegramApiBaseUrl()}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Telegram API HTTP ${response.status} (${method})`);
  }

  const data = (await response.json()) as TelegramApiResult<T>;
  if (!data.ok || data.result === undefined) {
    throw new Error(
      `Telegram API error (${method}): ${data.description ?? "unknown error"} (${data.error_code ?? "n/a"})`
    );
  }

  return data.result;
}

export async function sendTelegramMessage({
  chatId,
  text,
  disableNotification = false,
}: SendMessageParams): Promise<void> {
  await callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    disable_notification: disableNotification,
    disable_web_page_preview: true,
  });
}

export async function setTelegramWebhook(url: string, secretToken: string): Promise<void> {
  await callTelegramApi("setWebhook", {
    url,
    secret_token: secretToken,
    allowed_updates: ["message"],
  });
}
