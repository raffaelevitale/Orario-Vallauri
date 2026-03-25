import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lesson, WeekSchedule } from '@/lib/orario/models/lesson';

type UserMode = 'student' | 'teacher' | 'holiday' | null;

interface ScheduleState {
  schedule: WeekSchedule;
  selectedDay: number;
  userMode: UserMode;
  selectedEntity: string | null;
  hasCompletedSetup: boolean;

  setSchedule: (schedule: WeekSchedule) => void;
  setSelectedDay: (day: number) => void;
  setUserMode: (mode: UserMode, entity: string) => void;
  completeSetup: () => void;
  resetSetup: () => void;
  getLessonsForDay: (day: number) => Lesson[];
  getDaysWithLessons: () => number[];
  hardReset: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedule: {
        lessons: [],
        className: '',
      },
      selectedDay: 1,
      userMode: null,
      selectedEntity: null,
      hasCompletedSetup: false,

      setSchedule: (schedule) => set({ schedule }),

      setSelectedDay: (day) => set({ selectedDay: day }),

      setUserMode: (mode, entity) =>
        set({
          userMode: mode,
          selectedEntity: entity,
        }),

      completeSetup: () => set({ hasCompletedSetup: true }),

      // Soft reset: azzera modalità e selezione ma mantiene lo schedule in localStorage
      resetSetup: () =>
        set({
          userMode: null,
          selectedEntity: null,
          hasCompletedSetup: false,
        }),

      getLessonsForDay: (day) => {
        const { schedule } = get();
        return schedule.lessons
          .filter((lesson) => lesson.dayOfWeek === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      },

      getDaysWithLessons: () => {
        const { schedule } = get();
        const daysSet = new Set<number>();
        schedule.lessons.forEach((lesson) => {
          if (!lesson.isBreak && lesson.dayOfWeek >= 1 && lesson.dayOfWeek <= 5) {
            daysSet.add(lesson.dayOfWeek);
          }
        });
        return Array.from(daysSet).sort();
      },

      // Hard reset: cancella tutto incluso lo schedule (utile per reset totale dell'app)
      hardReset: () =>
        set({
          userMode: null,
          selectedEntity: null,
          hasCompletedSetup: false,
          schedule: {
            lessons: [],
            className: '',
          },
          selectedDay: (() => {
            const today = new Date().getDay();
            return today === 0 || today === 6 ? 1 : today;
          })(),
        }),
    }),
    {
      name: 'orario-schedule-storage',
    }
  )
);
