export interface Lesson {
  id: string;
  subject: string;
  teacher: string;
  classroom: string;
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
