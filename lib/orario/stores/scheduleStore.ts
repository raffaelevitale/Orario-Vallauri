import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lesson, WeekSchedule } from '@/lib/orario/models/lesson';

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
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedule: {
        lessons: [],
        className: '',
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
            lessons: [],
            className: '',
          },
        }),

      getLessonsForDay: (day) => {
        const { schedule } = get();
        return schedule.lessons
          .filter((lesson) => lesson.dayOfWeek === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      },
    }),
    {
      name: 'orario-schedule-storage',
    }
  )
);
