import type { Lesson } from "@/lib/orario/models/lesson";

export function parseTime(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getCurrentTimeInMinutes(date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function getLessonDuration(lesson: Pick<Lesson, "startTime" | "endTime">): number {
  return Math.max(parseTime(lesson.endTime) - parseTime(lesson.startTime), 0);
}

export function isCurrentLesson(lesson: Pick<Lesson, "startTime" | "endTime" | "dayOfWeek">): boolean {
  const now = new Date();
  const currentDay = now.getDay();

  if (lesson.dayOfWeek !== currentDay) {
    return false;
  }

  const currentMinutes = getCurrentTimeInMinutes(now);
  const start = parseTime(lesson.startTime);
  const end = parseTime(lesson.endTime);

  return currentMinutes >= start && currentMinutes < end;
}

export function getRemainingMinutes(endTime: string): number {
  return Math.max(parseTime(endTime) - getCurrentTimeInMinutes(), 0);
}
