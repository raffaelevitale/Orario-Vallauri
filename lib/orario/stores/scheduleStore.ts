import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lesson, WeekSchedule } from '@/lib/orario/models/lesson';

type UserMode = 'student' | 'teacher' | 'holiday' | null;

interface ScheduleState {
  schedule: WeekSchedule;
  selectedDay: number;
  viewType: 'list' | 'block';
  userMode: UserMode;
  selectedEntity: string | null; // class name or teacher name
  hasCompletedSetup: boolean;

  setSchedule: (schedule: WeekSchedule) => void;
  setSelectedDay: (day: number) => void;
  setViewType: (viewType: 'list' | 'block') => void;
  setUserMode: (mode: UserMode, entity: string) => void;
  completeSetup: () => void;
  resetSetup: () => void;
  getLessonsForDay: (day: number) => Lesson[];
  getDaysWithLessons: () => number[];
  // LOGICA MISTA: Aggiunta funzione per reset completo (hard reset)
  // Cancella tutto incluso lo schedule. Utile per debug o reset totale dell'app.
  hardReset: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedule: {
        lessons: [],
        className: '',
      },
      // Sempre il giorno corrente all'apertura dell'app
      selectedDay: 1, // Verrà aggiornato nel component con il giorno corrente
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

      // LOGICA MISTA (soft reset): Quando cambi modalità, azzera solo userMode, selectedEntity e hasCompletedSetup
      // ma lascia intatto lo schedule in localStorage. Così, al riavvio, la selezione può essere ripristinata.
      // Per tornare alla logica precedente (hard reset), decommenta le righe dello schedule qui sotto.
      resetSetup: () =>
        set({
          userMode: null,
          selectedEntity: null,
          hasCompletedSetup: false,
          // Hard reset: decommenta le righe sotto per cancellare anche lo schedule
          // schedule: {
          //   lessons: [],
          //   className: '',
          // },
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

      // LOGICA MISTA: Hard reset cancella TUTTO incluso lo schedule.
      // Usare solo per reset completo dell'app (es. pulsante "Reset totale" nelle impostazioni).
      // Riporta l'app allo stato iniziale come se fosse appena installata.
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
          viewType: 'list',
        }),
    }),
    {
      name: 'orario-schedule-storage',
    }
  )
);
