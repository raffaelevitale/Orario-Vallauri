import { NextResponse } from "next/server";
import { handleTelegramCommand } from "@/lib/orario/telegram/commands";
import { sendTelegramMessage } from "@/lib/orario/telegram/client";
import { getTelegramWebhookSecret } from "@/lib/orario/telegram/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

interface TelegramMessage {
  text?: string;
  chat?: {
    id: number;
  };
  from?: {
    first_name?: string;
  };
}

function validateWebhookSecret(request: Request): { ok: true } | { ok: false; reason: string } {
  let expectedSecret: string;
  try {
    expectedSecret = getTelegramWebhookSecret();
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Webhook secret not configured",
    };
  }

  const incomingSecret = request.headers.get("x-telegram-bot-api-secret-token")?.trim();
  if (!incomingSecret || incomingSecret !== expectedSecret) {
    return {
      ok: false,
      reason: "Invalid webhook secret",
    };
  }

  return { ok: true };
}

function extractMessage(update: TelegramUpdate): TelegramMessage | null {
  return update.message ?? update.edited_message ?? null;
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    message: "Telegram webhook endpoint",
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const secretValidation = validateWebhookSecret(request);
  if (!secretValidation.ok) {
    const statusCode = secretValidation.reason.includes("Missing required") ? 500 : 401;
    return NextResponse.json(
      {
        ok: false,
        error: secretValidation.reason,
      },
      { status: statusCode }
    );
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  const message = extractMessage(update);
  if (!message?.text || !message.chat?.id) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const chatId = String(message.chat.id);
    const commandResponse = await handleTelegramCommand({
      chatId,
      text: message.text,
      fromFirstName: message.from?.first_name,
    });

    if (commandResponse) {
      await sendTelegramMessage({
        chatId,
        text: commandResponse.text,
        disableNotification: commandResponse.disableNotification,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook processing error:", error);
    return NextResponse.json({ ok: false, error: "Processing failed" });
  }
}
