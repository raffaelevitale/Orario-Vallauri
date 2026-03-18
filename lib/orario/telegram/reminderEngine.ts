import { Lesson } from "@/lib/orario/models/lesson";
import { sendTelegramMessage } from "@/lib/orario/telegram/client";
import { getTelegramTimezone } from "@/lib/orario/telegram/config";
import { getLessonsForDay, loadLessonsForEntity } from "@/lib/orario/telegram/scheduleServer";
import {
  getRecentReminderKeys,
  listTelegramPreferences,
  markReminderAsSent,
} from "@/lib/orario/telegram/storage";
import { TelegramPreference } from "@/lib/orario/telegram/types";

export interface ReminderRunSummary {
  now: string;
  timezone: string;
  scannedPreferences: number;
  sentMessages: number;
  skippedMessages: number;
  errors: Array<{ chatId: string; error: string }>;
}

const WEEKDAY_SHORT_TO_DAY: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 0,
};

const DEFAULT_LOOKAHEAD_MINUTES = 5;

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getRomeContext(date: Date): { dayOfWeek: number; minutesOfDay: number; dateKey: string } {
  const timezone = getTelegramTimezone();
  const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const weekday = weekdayFormatter.format(date);
  const dayOfWeek = WEEKDAY_SHORT_TO_DAY[weekday] ?? 0;
  const [hourRaw, minuteRaw] = timeFormatter.format(date).split(":");
  const hours = Number(hourRaw);
  const minutes = Number(minuteRaw);
  const dateKey = dateFormatter.format(date);

  return {
    dayOfWeek,
    minutesOfDay: hours * 60 + minutes,
    dateKey,
  };
}

function buildReminderText(params: {
  preference: TelegramPreference;
  lesson: Lesson;
  minutesRemaining: number;
}): string {
  const { preference, lesson, minutesRemaining } = params;
  const entityLabel =
    preference.entityType === "student"
      ? `Classe ${preference.entityName}`
      : `Docente ${preference.entityName}`;
  const classChunk =
    preference.entityType === "teacher" && lesson.class ? ` (${lesson.class})` : "";
  const roomChunk = lesson.classroom ? `\nAula: ${lesson.classroom}` : "";
  const teacherChunk =
    preference.entityType === "student" && lesson.teacher ? `\nDocente: ${lesson.teacher}` : "";

  return [
    `⏰ Tra ${minutesRemaining} min inizia la lezione`,
    `${lesson.startTime}-${lesson.endTime} ${lesson.subject}${classChunk}`,
    entityLabel + roomChunk + teacherChunk,
  ].join("\n");
}

export async function runTelegramReminders(options?: {
  lookAheadMinutes?: number;
  now?: Date;
}): Promise<ReminderRunSummary> {
  const timezone = getTelegramTimezone();
  const now = options?.now ?? new Date();
  const lookAheadMinutes = options?.lookAheadMinutes ?? DEFAULT_LOOKAHEAD_MINUTES;
  const summary: ReminderRunSummary = {
    now: now.toISOString(),
    timezone,
    scannedPreferences: 0,
    sentMessages: 0,
    skippedMessages: 0,
    errors: [],
  };

  const { dayOfWeek, minutesOfDay, dateKey } = getRomeContext(now);
  if (dayOfWeek < 1 || dayOfWeek > 5) {
    return summary;
  }

  const preferences = await listTelegramPreferences();
  const sentKeys = await getRecentReminderKeys();

  for (const preference of preferences) {
    summary.scannedPreferences += 1;

    if (!preference.notificationsEnabled) {
      summary.skippedMessages += 1;
      continue;
    }

    try {
      const lessons = await loadLessonsForEntity(preference.entityType, preference.entityName);
      const dayLessons = getLessonsForDay(lessons, dayOfWeek);

      for (const lesson of dayLessons) {
        const lessonStartMinutes = parseTimeToMinutes(lesson.startTime);
        const minutesRemaining = lessonStartMinutes - minutesOfDay;

        if (minutesRemaining <= 0 || minutesRemaining > lookAheadMinutes) continue;

        const reminderKey = `${dateKey}:${preference.chatId}:${lesson.id}:start`;
        if (sentKeys.has(reminderKey)) {
          summary.skippedMessages += 1;
          continue;
        }

        const text = buildReminderText({
          preference,
          lesson,
          minutesRemaining,
        });

        await sendTelegramMessage({
          chatId: preference.chatId,
          text,
          disableNotification: false,
        });

        await markReminderAsSent(reminderKey);
        sentKeys.add(reminderKey);
        summary.sentMessages += 1;
      }
    } catch (error) {
      summary.errors.push({
        chatId: preference.chatId,
        error: error instanceof Error ? error.message : "Unknown reminder error",
      });
    }
  }

  return summary;
}
