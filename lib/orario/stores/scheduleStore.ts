import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lesson, WeekSchedule } from '@/lib/orario/models/lesson';
import { sampleSchedule } from '@/lib/orario/data/sampleSchedule';

type UserMode = 'student' | 'teacher' | null;

interface ScheduleState {
  schedule: WeekSchedule;
  selectedDay: number;
  viewType: 'list' | 'timeline';
  userMode: UserMode;
  selectedEntity: string | null; // class name or teacher name
  hasCompletedSetup: boolean;

  setSchedule: (schedule: WeekSchedule) => void;
  setSelectedDay: (day: number) => void;
  setViewType: (viewType: 'list' | 'timeline') => void;
  setUserMode: (mode: UserMode, entity: string) => void;
  completeSetup: () => void;
  resetSetup: () => void;
  getLessonsForDay: (day: number) => Lesson[];
  resetToSample: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedule: {
        lessons: sampleSchedule,
        className: 'Demo Class',
      },
      selectedDay: (() => {
        const today = new Date().getDay();
        return today === 0 || today === 6 ? 1 : today;
      })(),
      viewType: 'list',
      userMode: null,
      selectedEntity: null,
      hasCompletedSetup: false,

      setSchedule: (schedule) => set({ schedule }),

      setSelectedDay: (day) => set({ selectedDay: day }),

      setViewType: (viewType) => set({ viewType }),

      setUserMode: (mode, entity) =>
        set({
          userMode: mode,
          selectedEntity: entity,
        }),

      completeSetup: () => set({ hasCompletedSetup: true }),

      resetSetup: () =>
        set({
          userMode: null,
          selectedEntity: null,
          hasCompletedSetup: false,
          schedule: {
            lessons: sampleSchedule,
            className: 'Demo Class',
          },
        }),

      getLessonsForDay: (day) => {
        const { schedule } = get();
        return schedule.lessons
          .filter((lesson) => lesson.dayOfWeek === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      },

      resetToSample: () =>
        set({
          schedule: {
            lessons: sampleSchedule,
            className: 'Demo Class',
          },
        }),
    }),
    {
      name: 'orario-schedule-storage',
    }
  )
);
