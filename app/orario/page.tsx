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
import styles from './orario.module.css';

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
    <div className={styles.remainingBadge}>
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
    <div className={styles.container}>
      {/* Fixed header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>
                Orario
              </h1>
              <p className={styles.subtitle}>
                {userMode === 'student'
                  ? `Classe ${selectedEntity}`
                  : userMode === 'teacher'
                    ? selectedEntity
                    : schedule.className || 'Orario Settimanale'}
              </p>
            </div>

            <div className={styles.headerActions}>
              {/* Reset button */}
              <button
                onClick={() => {
                  if (confirm('Vuoi cambiare classe/docente?')) {
                    resetSetup();
                    router.push('/orario/setup');
                  }
                }}
                className={styles.settingsBtn}
                title="Cambia"
              >
                ⚙️ Cambia
              </button>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* View toggle */}
              <div className={styles.viewToggle}>
                <button
                  onClick={() => setViewType('list')}
                  className={`${styles.viewBtn} ${viewType === 'list' ? styles.active : ''}`}
                  title="Vista lista"
                >
                  📋 Lista
                </button>
                <button
                  onClick={() => setViewType('timeline')}
                  className={`${styles.viewBtn} ${viewType === 'timeline' ? styles.active : ''}`}
                  title="Vista timeline"
                >
                  ⏱️ Timeline
                </button>
              </div>
            </div>
          </div>

          {/* Current lesson banner */}
          {isToday && currentLesson && (
            <div className={styles.currentLessonBanner}>
              <div className={styles.currentLessonInfo}>
                <span className={styles.currentLessonIcon}>⏳</span>
                <div className={styles.currentLessonText}>
                  <div className={styles.currentLessonSubject}>
                    {currentLesson.subject}
                  </div>
                  <div className={styles.currentLessonDetails}>
                    {currentLesson.startTime} - {currentLesson.endTime} · {currentLesson.teacher}
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
        <div className={styles.dayTabs}>
          <div className={styles.dayTabsContainer}>
            {weekDays.map((day) => (
              <button
                key={day.number}
                onClick={() => setSelectedDay(day.number)}
                className={`${styles.dayTab} ${selectedDay === day.number ? styles.active : ''}`}
              >
                {day.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedDay}-${viewType}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={styles.scrollArea}
          >
            {viewType === 'timeline' ? (
              <TimelineView lessons={todayLessons} isToday={isToday} />
            ) : (
              <div className={styles.lessonsList}>
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
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📅</div>
                    <p className={styles.emptyText}>
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
        >
          <button
            onClick={goToToday}
            className={styles.todayButton}
          >
            <span>📆</span>
            <span>Oggi</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
