import { Lesson } from "@/lib/orario/models/lesson";
import { getTelegramTimezone } from "@/lib/orario/telegram/config";
import { getLessonsForDay, loadLessonsForEntity } from "@/lib/orario/telegram/scheduleServer";
import { getTelegramPreference } from "@/lib/orario/telegram/storage";
import { TelegramCommandInput, TelegramCommandResponse } from "@/lib/orario/telegram/types";

const DAY_LABELS_IT: Record<number, string> = {
  1: "Lunedì",
  2: "Martedì",
  3: "Mercoledì",
  4: "Giovedì",
  5: "Venerdì",
};

const WEEKDAY_SHORT_TO_DAY: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 0,
};

const ROME_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: getTelegramTimezone(),
  weekday: "short",
});

function getRomeDayOfWeek(date: Date = new Date()): number {
  const weekday = ROME_WEEKDAY_FORMATTER.format(date);
  return WEEKDAY_SHORT_TO_DAY[weekday] ?? 0;
}

function getNextSchoolDay(dayOfWeek: number): number {
  if (dayOfWeek >= 1 && dayOfWeek <= 4) return dayOfWeek + 1;
  return 1;
}

function extractCommand(rawText: string): string | null {
  const text = rawText.trim();
  if (!text.startsWith("/")) return null;
  const firstToken = text.split(/\s+/)[0];
  return firstToken.split("@")[0].toLowerCase();
}

function getPreferenceMissingText(chatId: string): string {
  return [
    "Bot non configurato per questa chat.",
    "",
    `Chat ID rilevato: ${chatId}`,
    "Apri il sito, vai su Impostazioni -> Telegram Bot e salva:",
    "- chat_id",
    "- classe/docente selezionato",
    "- notifiche abilitate",
    "",
    "Poi usa /oggi oppure /domani.",
  ].join("\n");
}

function formatLessonLine(lesson: Lesson, isTeacherMode: boolean): string {
  const base = `${lesson.startTime}-${lesson.endTime}`;
  const subject = lesson.subject;
  const details: string[] = [];

  if (isTeacherMode && lesson.class) {
    details.push(lesson.class);
  }
  if (!isTeacherMode && lesson.teacher) {
    details.push(lesson.teacher);
  }
  if (lesson.classroom) {
    details.push(`aula ${lesson.classroom}`);
  }

  if (!details.length) {
    return `• ${base} ${subject}`;
  }

  return `• ${base} ${subject} | ${details.join(" | ")}`;
}

function formatScheduleText(params: {
  dayLabel: string;
  entityLabel: string;
  lessons: Lesson[];
  isTeacherMode: boolean;
}): string {
  const lines = params.lessons.map((lesson) => formatLessonLine(lesson, params.isTeacherMode));
  return [`📚 ${params.dayLabel} - ${params.entityLabel}`, "", ...lines].join("\n");
}

function buildHelpText(chatId: string, firstName?: string | null): string {
  const greeting = firstName?.trim() ? `Ciao ${firstName}!` : "Ciao!";
  return [
    `${greeting} Sono il bot Orario.`,
    "",
    `Chat ID: ${chatId}`,
    "",
    "Comandi disponibili:",
    "/oggi - mostra le lezioni di oggi",
    "/domani - mostra le lezioni del prossimo giorno scolastico",
    "/help - mostra questo messaggio",
    "",
    "Se non ricevi risultati, configura il bot dal sito in Impostazioni -> Telegram Bot.",
  ].join("\n");
}

async function buildScheduleResponse(chatId: string, dayOfWeek: number): Promise<string> {
  const preference = await getTelegramPreference(chatId);
  if (!preference) {
    return getPreferenceMissingText(chatId);
  }

  const lessons = await loadLessonsForEntity(preference.entityType, preference.entityName);
  const dayLessons = getLessonsForDay(lessons, dayOfWeek);
  const dayLabel = DAY_LABELS_IT[dayOfWeek] ?? "Giorno";
  const entityLabel =
    preference.entityType === "student"
      ? `Classe ${preference.entityName}`
      : `Docente ${preference.entityName}`;

  if (!dayLessons.length) {
    return `📭 ${dayLabel} - ${entityLabel}\n\nNessuna lezione trovata.`;
  }

  return formatScheduleText({
    dayLabel,
    entityLabel,
    lessons: dayLessons,
    isTeacherMode: preference.entityType === "teacher",
  });
}

export async function handleTelegramCommand(
  input: TelegramCommandInput
): Promise<TelegramCommandResponse | null> {
  const command = extractCommand(input.text);
  if (!command) return null;

  if (command === "/start" || command === "/help") {
    return {
      text: buildHelpText(input.chatId, input.fromFirstName),
      disableNotification: true,
    };
  }

  if (command === "/oggi") {
    const today = getRomeDayOfWeek();
    if (today < 1 || today > 5) {
      return {
        text: "🏖️ Oggi non è un giorno scolastico. Prova con /domani.",
        disableNotification: true,
      };
    }

    return {
      text: await buildScheduleResponse(input.chatId, today),
      disableNotification: true,
    };
  }

  if (command === "/domani") {
    const today = getRomeDayOfWeek();
    const tomorrowSchoolDay = getNextSchoolDay(today);

    return {
      text: await buildScheduleResponse(input.chatId, tomorrowSchoolDay),
      disableNotification: true,
    };
  }

  return {
    text: "Comando non riconosciuto. Usa /help per vedere i comandi disponibili.",
    disableNotification: true,
  };
}
