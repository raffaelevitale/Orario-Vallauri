import { Lesson } from '@/lib/orario/models/lesson';

export function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function getLessonDuration(lesson: Lesson): number {
  const start = parseTime(lesson.startTime);
  const end = parseTime(lesson.endTime);
  return end - start;
}

export function isCurrentLesson(lesson: Lesson): boolean {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = getCurrentTimeInMinutes();

  if (currentDay !== lesson.dayOfWeek) return false;

  const start = parseTime(lesson.startTime);
  const end = parseTime(lesson.endTime);

  return currentTime >= start && currentTime < end;
}

export function getRemainingMinutes(endTime: string): number {
  const now = getCurrentTimeInMinutes();
  const end = parseTime(endTime);
  return Math.max(0, end - now);
}

