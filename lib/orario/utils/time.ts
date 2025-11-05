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

export function isNextLesson(lesson: Lesson, allLessons: Lesson[]): boolean {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = getCurrentTimeInMinutes();

  if (lesson.dayOfWeek !== currentDay) return false;

  const start = parseTime(lesson.startTime);
  if (currentTime >= start) return false;

  const todayLessons = allLessons.filter(
    (l) => l.dayOfWeek === currentDay && !l.isBreak
  );
  const futureLessons = todayLessons.filter(
    (l) => parseTime(l.startTime) > currentTime
  );

  if (futureLessons.length === 0) return false;

  futureLessons.sort(
    (a, b) => parseTime(a.startTime) - parseTime(b.startTime)
  );

  return futureLessons[0].id === lesson.id;
}

export function getDayName(dayOfWeek: number): string {
  const days = [
    'Domenica',
    'Lunedì',
    'Martedì',
    'Mercoledì',
    'Giovedì',
    'Venerdì',
    'Sabato',
  ];
  return days[dayOfWeek] || '';
}

export function getDayShortName(dayOfWeek: number): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  return days[dayOfWeek] || '';
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function getRemainingMinutes(endTime: string): number {
  const now = getCurrentTimeInMinutes();
  const end = parseTime(endTime);
  return Math.max(0, end - now);
}
