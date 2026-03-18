import { NextResponse } from "next/server";
import {
  deleteTelegramPreference,
  getTelegramPreference,
  isValidChatId,
  upsertTelegramPreference,
} from "@/lib/orario/telegram/storage";
import { EntityType } from "@/lib/orario/telegram/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PreferencesPayload {
  chatId?: string;
  entityType?: EntityType;
  entityName?: string;
  notificationsEnabled?: boolean;
}

function parseEntityType(value: unknown): EntityType | null {
  if (value === "student" || value === "teacher") {
    return value;
  }
  return null;
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId")?.trim() ?? "";

  if (!chatId) {
    return NextResponse.json({ ok: false, error: "chatId query parameter is required" }, { status: 400 });
  }

  if (!isValidChatId(chatId)) {
    return NextResponse.json({ ok: false, error: "Invalid chatId format" }, { status: 400 });
  }

  const preference = await getTelegramPreference(chatId);
  return NextResponse.json({
    ok: true,
    preference,
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: PreferencesPayload;
  try {
    payload = (await request.json()) as PreferencesPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  const chatId = payload.chatId?.trim() ?? "";
  const entityType = parseEntityType(payload.entityType);
  const entityName = payload.entityName?.trim() ?? "";
  const notificationsEnabled = payload.notificationsEnabled ?? true;

  if (!chatId || !isValidChatId(chatId)) {
    return NextResponse.json({ ok: false, error: "Invalid chatId format" }, { status: 400 });
  }

  if (!entityType) {
    return NextResponse.json(
      { ok: false, error: "entityType must be either 'student' or 'teacher'" },
      { status: 400 }
    );
  }

  if (!entityName) {
    return NextResponse.json({ ok: false, error: "entityName is required" }, { status: 400 });
  }

  if (entityName.length > 120) {
    return NextResponse.json({ ok: false, error: "entityName is too long" }, { status: 400 });
  }

  try {
    const preference = await upsertTelegramPreference({
      chatId,
      entityType,
      entityName,
      notificationsEnabled: Boolean(notificationsEnabled),
    });

    return NextResponse.json({
      ok: true,
      preference,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to save preference",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId")?.trim() ?? "";

  if (!chatId || !isValidChatId(chatId)) {
    return NextResponse.json({ ok: false, error: "Invalid chatId format" }, { status: 400 });
  }

  const deleted = await deleteTelegramPreference(chatId);
  return NextResponse.json({
    ok: true,
    deleted,
  });
}
