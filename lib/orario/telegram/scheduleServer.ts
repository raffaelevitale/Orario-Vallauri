import { promises as fs } from "node:fs";
import path from "node:path";
import { Lesson } from "@/lib/orario/models/lesson";
import { EntityType } from "@/lib/orario/telegram/types";

interface SingleClassData {
  class: string;
  schedule: Record<
    string,
    Array<{
      hour: number;
      subject: string;
      teacher: string;
      room: string;
    }>
  >;
}

interface SingleTeacherData {
  teacher: string;
  schedule: Record<
    string,
    Array<{
      hour: number;
      subject: string;
      class: string;
      room: string;
    }>
  >;
}

interface FullClassData {
  classi: Array<{
    nome: string;
    orario: Record<
      string,
      Array<{
        ora: number;
        materia: string | null;
        docente: string | null;
        aula: string | null;
      }>
    >;
  }>;
}

interface LegacyClassData {
  schedule: Record<
    string,
    Array<{
      class: string;
      subject: string;
      teacher: string;
      classroom: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      color: string;
    }>
  >;
}

interface FullTeacherData {
  schedule: Record<
    string,
    {
      docente: string;
      orario: Record<
        string,
        Array<{
          ora: string;
          classe: string;
          materia: string;
          aula: string;
          color?: string;
        }>
      >;
    }
  >;
}

const ORARIO_PUBLIC_DIR = path.join(process.cwd(), "public", "orario");
const jsonCache = new Map<string, unknown>();

const ODD_DAY_SLOTS = [
  { start: "07:50", end: "08:50" },
  { start: "08:50", end: "09:45" },
  { start: "09:45", end: "10:40" },
  { start: "11:00", end: "11:55" },
  { start: "11:55", end: "12:50" },
  { start: "12:50", end: "13:40" },
  { start: "13:40", end: "14:30" },
];

const EVEN_DAY_SLOTS = [
  { start: "07:50", end: "08:45" },
  { start: "08:45", end: "09:35" },
  { start: "09:35", end: "10:25" },
  { start: "10:30", end: "11:20" },
  { start: "11:20", end: "12:10" },
  { start: "12:20", end: "13:10" },
  { start: "13:10", end: "14:00" },
];

const SLOT_TIMES_BY_DAY: Record<number, Array<{ start: string; end: string }>> = {
  1: ODD_DAY_SLOTS,
  2: EVEN_DAY_SLOTS,
  3: ODD_DAY_SLOTS,
  4: EVEN_DAY_SLOTS,
  5: ODD_DAY_SLOTS,
};

const DAY_INDEX_MAP: Record<string, number> = {
  monday: 1,
  lunedi: 1,
  "lunedì": 1,
  tuesday: 2,
  martedi: 2,
  "martedì": 2,
  wednesday: 3,
  mercoledi: 3,
  "mercoledì": 3,
  thursday: 4,
  giovedi: 4,
  "giovedì": 4,
  friday: 5,
  venerdi: 5,
  "venerdì": 5,
  saturday: 6,
  sabato: 6,
};

const SUBJECT_MAP: Record<string, string> = {
  "Lingua inglese": "Inglese",
  "Lingua Italiana": "Italiano",
  "Scienze motorie e sportive": "Scienze motorie",
  "Scienze Motorie e Sportive": "Scienze motorie",
  "MATEMATICA e Complementi": "Matematica",
};

const TEACHER_FILE_OVERRIDES: Record<string, string> = {
  "CONTE 1 Roberto": "conte",
  "CONTE 2 Roberto": "conte2",
  "DE PASQUALE Paolo": "dep",
  "DI LORENZO Alessandra": "di",
  "LA PORTA Claudia Maria": "la",
};

function normalizeDayLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeSubject(subject: string): string {
  return SUBJECT_MAP[subject] ?? subject;
}

function sortLessons(lessons: Lesson[]): Lesson[] {
  return lessons.sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
  );
}

function buildClassFileName(className: string): string {
  return `${className.toLowerCase().replace(/\s+/g, "")}.json`;
}

function sanitizeToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getTeacherFileCandidates(teacherName: string): string[] {
  const override = TEACHER_FILE_OVERRIDES[teacherName];
  const tokens = teacherName
    .split(/\s+/)
    .map((token) => sanitizeToken(token))
    .filter(Boolean);

  const candidates = [
    override,
    tokens[0],
    tokens.slice(0, 2).join(""),
    tokens[0] && tokens[1] ? `${tokens[0]}${tokens[1].slice(0, 1)}` : undefined,
    tokens.join(""),
  ].filter(Boolean) as string[];

  return Array.from(new Set(candidates));
}

async function readOrarioJson<T>(fileName: string): Promise<T> {
  if (jsonCache.has(fileName)) {
    return jsonCache.get(fileName) as T;
  }

  const fullPath = path.join(ORARIO_PUBLIC_DIR, fileName);
  const raw = await fs.readFile(fullPath, "utf-8");
  const parsed = JSON.parse(raw) as T;
  jsonCache.set(fileName, parsed);
  return parsed;
}

function toDayIndex(dayLabel: string): number {
  return DAY_INDEX_MAP[normalizeDayLabel(dayLabel)] ?? 0;
}

function fromSingleClassData(className: string, data: SingleClassData): Lesson[] {
  const lessons: Lesson[] = [];

  for (const [dayLabel, slots] of Object.entries(data.schedule ?? {})) {
    const dayOfWeek = toDayIndex(dayLabel);
    if (!dayOfWeek || !Array.isArray(slots)) continue;
    const timetable = SLOT_TIMES_BY_DAY[dayOfWeek] ?? [];

    for (const slot of slots) {
      const timetableSlot = timetable[slot.hour - 1];
      if (!timetableSlot || !slot.subject) continue;
      lessons.push({
        id: `${className}-${dayOfWeek}-${slot.hour}-${slot.subject}`,
        subject: normalizeSubject(slot.subject),
        teacher: slot.teacher ?? "",
        classroom: slot.room ?? "",
        dayOfWeek,
        startTime: timetableSlot.start,
        endTime: timetableSlot.end,
        color: "#7e57c2",
      });
    }
  }

  return sortLessons(lessons);
}

function fromSingleTeacherData(teacherName: string, data: SingleTeacherData): Lesson[] {
  const lessons: Lesson[] = [];

  for (const [dayLabel, slots] of Object.entries(data.schedule ?? {})) {
    const dayOfWeek = toDayIndex(dayLabel);
    if (!dayOfWeek || !Array.isArray(slots)) continue;
    const timetable = SLOT_TIMES_BY_DAY[dayOfWeek] ?? [];

    for (const slot of slots) {
      const timetableSlot = timetable[slot.hour - 1];
      if (!timetableSlot || !slot.subject) continue;
      lessons.push({
        id: `${teacherName}-${dayOfWeek}-${slot.hour}-${slot.subject}-${slot.class}`,
        subject: normalizeSubject(slot.subject),
        teacher: teacherName,
        classroom: slot.room ?? "",
        class: slot.class ?? "",
        dayOfWeek,
        startTime: timetableSlot.start,
        endTime: timetableSlot.end,
        color: "#7e57c2",
      });
    }
  }

  return sortLessons(lessons);
}

async function loadClassFromFullData(className: string): Promise<Lesson[]> {
  const data = await readOrarioJson<FullClassData>("orario_classi_vallauri_completo.json");
  const classEntry = data.classi?.find((entry) => entry.nome === className);
  if (!classEntry) return [];

  const lessons: Lesson[] = [];
  for (const [dayLabel, slots] of Object.entries(classEntry.orario ?? {})) {
    const dayOfWeek = toDayIndex(dayLabel);
    if (!dayOfWeek || !Array.isArray(slots)) continue;
    const timetable = SLOT_TIMES_BY_DAY[dayOfWeek] ?? [];

    for (const slot of slots) {
      if (!slot.materia) continue;
      const timetableSlot = timetable[slot.ora - 1];
      if (!timetableSlot) continue;
      lessons.push({
        id: `${className}-${dayOfWeek}-${slot.ora}-${slot.materia}`,
        subject: normalizeSubject(slot.materia),
        teacher: slot.docente ?? "",
        classroom: slot.aula ?? "",
        dayOfWeek,
        startTime: timetableSlot.start,
        endTime: timetableSlot.end,
        color: "#7e57c2",
      });
    }
  }

  return sortLessons(lessons);
}

async function loadClassFromLegacyData(className: string): Promise<Lesson[]> {
  const data = await readOrarioJson<LegacyClassData>("orario_studenti.json");
  const lessons = data.schedule?.[className];
  if (!lessons?.length) return [];

  const normalized = lessons
    .filter((lesson) => lesson.subject?.toUpperCase() !== "INTERVALLO")
    .map((lesson, index) => ({
      id: `${className}-${lesson.dayOfWeek}-${index}-${lesson.subject}`,
      subject: normalizeSubject(lesson.subject),
      teacher: lesson.teacher ?? "",
      classroom: lesson.classroom ?? "",
      dayOfWeek: lesson.dayOfWeek,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      color: lesson.color || "#7e57c2",
    }));

  return sortLessons(normalized);
}

async function loadTeacherFromFullData(teacherName: string): Promise<Lesson[]> {
  const data = await readOrarioJson<FullTeacherData>("orario_docenti.json");
  const teacher = data.schedule?.[teacherName];
  if (!teacher) return [];

  const lessons: Lesson[] = [];

  for (const [dayLabel, items] of Object.entries(teacher.orario ?? {})) {
    const dayOfWeek = toDayIndex(dayLabel);
    if (!dayOfWeek || !Array.isArray(items)) continue;

    for (const item of items) {
      const [startTime, endTime] = item.ora.split("-");
      if (!startTime || !endTime) continue;

      lessons.push({
        id: `${teacherName}-${dayOfWeek}-${item.ora}-${item.classe}-${item.materia}`,
        subject: normalizeSubject(item.materia),
        teacher: teacherName,
        classroom: item.aula ?? "",
        class: item.classe ?? "",
        dayOfWeek,
        startTime,
        endTime,
        color: item.color || "#7e57c2",
      });
    }
  }

  return sortLessons(lessons);
}

export function getLessonsForDay(lessons: Lesson[], dayOfWeek: number): Lesson[] {
  return lessons
    .filter((lesson) => lesson.dayOfWeek === dayOfWeek && !lesson.isBreak)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function loadClassLessons(className: string): Promise<Lesson[]> {
  const normalized = className.trim();
  if (!normalized) return [];

  try {
    const fileName = buildClassFileName(normalized);
    const data = await readOrarioJson<SingleClassData>(fileName);
    const lessons = fromSingleClassData(normalized, data);
    if (lessons.length) return lessons;
  } catch {
    // Fallback on full datasets below.
  }

  try {
    const lessons = await loadClassFromFullData(normalized);
    if (lessons.length) return lessons;
  } catch {
    // Keep fallback chain alive.
  }

  return loadClassFromLegacyData(normalized);
}

export async function loadTeacherLessons(teacherName: string): Promise<Lesson[]> {
  const normalized = teacherName.trim();
  if (!normalized) return [];

  for (const candidate of getTeacherFileCandidates(normalized)) {
    try {
      const data = await readOrarioJson<SingleTeacherData>(`${candidate}.json`);
      const lessons = fromSingleTeacherData(normalized, data);
      if (lessons.length) return lessons;
    } catch {
      // Try next candidate file.
    }
  }

  return loadTeacherFromFullData(normalized);
}

export async function loadLessonsForEntity(
  entityType: EntityType,
  entityName: string
): Promise<Lesson[]> {
  if (entityType === "student") {
    return loadClassLessons(entityName);
  }
  return loadTeacherLessons(entityName);
}
