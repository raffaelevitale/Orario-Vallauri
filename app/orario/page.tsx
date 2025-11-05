'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useScheduleStore } from '@/lib/orario/stores/scheduleStore';
import { LessonCard } from '@/app/components/orario/LessonCard';
import { TimelineView } from '@/app/components/orario/TimelineView';
import { ThemeToggle } from '@/app/components/orario/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { isCurrentLesson, getRemainingMinutes } from '@/lib/orario/utils/time';
import { Lesson } from '@/lib/orario/models/lesson';

const weekDays = [
  { number: 1, name: 'Lunedì', short: 'Lun' },
  { number: 2, name: 'Martedì', short: 'Mar' },
  { number: 3, name: 'Mercoledì', short: 'Mer' },
  { number: 4, name: 'Giovedì', short: 'Gio' },
  { number: 5, name: 'Venerdì', short: 'Ven' },
];

function RemainingMinutesBadge({
  endTime,
  color,
}: {
  endTime: string;
  color?: string;
}) {
  const [remaining, setRemaining] = useState(() => getRemainingMinutes(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemainingMinutes(endTime));
    }, 15000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div
      className="ml-3 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap"
      style={{
        backgroundColor: (color ?? '#3b82f6') + '22',
        color: color ?? '#93c5fd',
      }}
    >
      {remaining} min
    </div>
  );
}

export default function OrarioPage() {
  const router = useRouter();
  const {
    schedule,
    selectedDay,
    viewType,
    hasCompletedSetup,
    userMode,
    selectedEntity,
    resetSetup,
    setSelectedDay,
    setViewType,
    getLessonsForDay,
  } = useScheduleStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  // Redirect to setup if not completed
  useEffect(() => {
    if (!hasCompletedSetup) {
      router.push('/orario/setup');
    }
  }, [hasCompletedSetup, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const todayLessons = useMemo(() => {
    return getLessonsForDay(selectedDay);
  }, [selectedDay, getLessonsForDay]);

  useEffect(() => {
    if (!todayLessons.length) {
      setCurrentLesson(null);
      return;
    }
    const current = todayLessons.find((l) => isCurrentLesson(l));
    setCurrentLesson(current || null);
  }, [currentTime, todayLessons]);

  const goToToday = () => {
    const today = new Date().getDay();
    if (today >= 1 && today <= 5) {
      setSelectedDay(today);
    }
  };

  const isToday = useMemo(() => {
    const today = new Date().getDay();
    return selectedDay === today;
  }, [selectedDay]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Fixed header */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Orario
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {userMode === 'student'
                  ? `Classe ${selectedEntity}`
                  : userMode === 'teacher'
                    ? selectedEntity
                    : schedule.className || 'Orario Settimanale'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Reset button */}
              <button
                onClick={() => {
                  if (confirm('Vuoi cambiare classe/docente?')) {
                    resetSetup();
                    router.push('/orario/setup');
                  }
                }}
                className="px-2 py-1.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all text-xs font-medium text-gray-900 dark:text-white"
                title="Cambia"
              >
                ⚙️
              </button>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* View toggle */}
              <div className="flex gap-1 bg-gray-200 dark:bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewType('list')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    viewType === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                  title="Vista lista"
                >
                  📋
                </button>
                <button
                  onClick={() => setViewType('timeline')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    viewType === 'timeline'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                  title="Vista timeline"
                >
                  ⏱️
                </button>
              </div>
            </div>
          </div>

          {/* Current lesson banner */}
          {isToday && currentLesson && (
            <div className="mt-2 bg-blue-600/15 border border-blue-500/30 rounded-lg px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">⏳</span>
                <div className="min-w-0">
                  <div className="text-gray-900 dark:text-white text-sm font-semibold truncate">
                    {currentLesson.subject}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
                    {currentLesson.startTime} - {currentLesson.endTime} ·{' '}
                    {currentLesson.teacher}
                  </div>
                </div>
              </div>
              <RemainingMinutesBadge
                endTime={currentLesson.endTime}
                color={currentLesson.color}
              />
            </div>
          )}
        </div>

        {/* Day tabs */}
        <div className="px-2 pb-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 px-2">
            {weekDays.map((day) => (
              <button
                key={day.number}
                onClick={() => setSelectedDay(day.number)}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${
                    selectedDay === day.number
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300'
                  }
                `}
              >
                <div className="hidden sm:block">{day.name}</div>
                <div className="sm:hidden">{day.short}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedDay}-${viewType}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full overflow-y-auto"
          >
            {viewType === 'timeline' ? (
              <TimelineView lessons={todayLessons} isToday={isToday} />
            ) : (
              <div className="p-2 sm:p-3 space-y-2">
                {todayLessons.length > 0 ? (
                  todayLessons.map((lesson, index) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <LessonCard
                        lesson={lesson}
                        isCurrent={isToday && isCurrentLesson(lesson)}
                        compact={true}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="text-5xl mb-3">📅</div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Nessuna lezione
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quick "Oggi" button */}
      {!isToday && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-3 z-10"
        >
          <button
            onClick={goToToday}
            className="
              bg-blue-600 hover:bg-blue-700
              text-white font-semibold text-sm
              px-4 py-2.5 rounded-full
              shadow-lg hover:shadow-xl
              transition-all
              flex items-center gap-1.5
            "
          >
            <span className="text-base">📆</span>
            <span className="hidden sm:inline text-sm">Oggi</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
