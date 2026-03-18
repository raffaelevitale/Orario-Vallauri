import { NextResponse } from "next/server";
import { runTelegramReminders } from "@/lib/orario/telegram/reminderEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractProvidedSecret(request: Request): string | null {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret")?.trim();
  if (querySecret) return querySecret;

  const headerSecret = request.headers.get("x-cron-secret")?.trim();
  if (headerSecret) return headerSecret;

  const authHeader = request.headers.get("authorization")?.trim();
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}

function isAuthorizedCronRequest(request: Request): boolean {
  const expectedSecret = process.env.CRON_SECRET?.trim();
  if (!expectedSecret) {
    return Boolean(request.headers.get("x-vercel-cron"));
  }

  const providedSecret = extractProvidedSecret(request);
  return Boolean(providedSecret && providedSecret === expectedSecret);
}

async function handleReminderRequest(request: Request): Promise<NextResponse> {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized cron request" }, { status: 401 });
  }

  const lookAheadRaw = new URL(request.url).searchParams.get("lookAheadMinutes");
  const lookAheadMinutes = lookAheadRaw ? Number(lookAheadRaw) : undefined;

  const summary = await runTelegramReminders({
    lookAheadMinutes:
      lookAheadMinutes && Number.isFinite(lookAheadMinutes) && lookAheadMinutes > 0
        ? lookAheadMinutes
        : undefined,
  });

  return NextResponse.json({
    ok: true,
    summary,
  });
}

export async function GET(request: Request): Promise<NextResponse> {
  return handleReminderRequest(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  return handleReminderRequest(request);
}
