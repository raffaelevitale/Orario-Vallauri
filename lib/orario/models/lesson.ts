export interface Lesson {
  id: string;
  subject: string;
  teacher: string;
  classroom: string;
  class?: string; // Nome della classe (es. "5A INF", "4A"), usato per orari docenti
  dayOfWeek: number; // 1 = Monday, 5 = Friday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  color: string; // Hex color
  isBreak?: boolean;
}

export interface WeekSchedule {
  lessons: Lesson[];
  className?: string;
  teacherName?: string;
}
