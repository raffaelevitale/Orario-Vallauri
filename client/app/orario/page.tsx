"use client";

import { useState, useEffect, useMemo } from "react";
import { useScheduleStore } from "@/lib/orario/stores/scheduleStore";
import { LessonCard } from "@/app/components/orario/LessonCard";
import { SettingsMenu } from "@/app/components/orario/SettingsMenu";
import { BottomTabBar, TabId } from "@/app/components/orario/BottomTabBar";
import { AllSchedulesView } from "@/app/components/orario/AllSchedulesView";
import { InlineSetup } from "@/app/components/orario/InlineSetup";
import { motion, AnimatePresence } from "framer-motion";
import { isCurrentLesson, getRemainingMinutes } from "@/lib/orario/utils/time";
import type { Lesson } from "@/lib/orario/models/lesson";
import {
  requestNotificationPermission,
  scheduleLessonNotifications,
  clearAllNotifications,
} from "@/lib/orario/utils/notifications";
import styles from "./orario.module.css";

const weekDays = [
  { number: 1, name: "Lunedì", short: "LUN" },
  { number: 2, name: "Martedì", short: "MAR" },
  { number: 3, name: "Mercoledì", short: "MER" },
  { number: 4, name: "Giovedì", short: "GIO" },
  { number: 5, name: "Venerdì", short: "VEN" },
];

function RemainingMinutesBadge({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = useState(() => getRemainingMinutes(endTime));

  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemainingMinutes(endTime)), 15000);
    return () => clearInterval(timer);
  }, [endTime]);

  return <div className={styles.remainingBadge}>{remaining} min</div>;
}

export default function OrarioPage() {
  const {
    schedule,
    selectedDay,
    hasCompletedSetup,
    userMode,
    selectedEntity,
    resetSetup,
    setSelectedDay,
    getLessonsForDay,
    getDaysWithLessons,
  } = useScheduleStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("orario");

  useEffect(() => {
    setIsMounted(true);
    const today = new Date().getDay();
    setSelectedDay(today === 0 || today === 6 ? 1 : today);
  }, [setSelectedDay]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayLessons = useMemo(() => getLessonsForDay(selectedDay), [selectedDay, getLessonsForDay, schedule]);

  useEffect(() => {
    if (!isMounted) return;
    clearAllNotifications();
    requestNotificationPermission().then(perm => {
      if (perm === "granted") scheduleLessonNotifications(todayLessons);
    });
    return () => clearAllNotifications();
  }, [isMounted, selectedDay, todayLessons]);

  useEffect(() => {
    if (!todayLessons.length) { setCurrentLesson(null); return; }
    setCurrentLesson(todayLessons.find(l => isCurrentLesson(l)) || null);
  }, [currentTime, todayLessons]);

  const isToday = useMemo(() => selectedDay === new Date().getDay(), [selectedDay]);

  const daysWithLessons = useMemo(() => {
    const days = getDaysWithLessons();
    return weekDays.filter(d => days.includes(d.number));
  }, [getDaysWithLessons, schedule]);

  const goToToday = () => {
    const today = new Date().getDay();
    if (today >= 1 && today <= 5) setSelectedDay(today);
  };

  if (!isMounted) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerTop}>
              <div>
                <h1 className={styles.title}>Orario</h1>
                <p className={styles.subtitle}>Caricamento…</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabTitles: Record<TabId, { title: string; subtitle: string }> = {
    orario: {
      title: "Orario",
      subtitle: hasCompletedSetup
        ? (userMode === "student" ? `Classe ${selectedEntity}` : selectedEntity || "")
        : "Seleziona classe o docente",
    },
    classi: { title: "Classi", subtitle: "Tutti gli orari" },
    docenti: { title: "Docenti", subtitle: "Tutti gli orari" },
  };

  return (
    <div className={styles.container}>
      {/* Fixed header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>{tabTitles[activeTab].title}</h1>
              {activeTab === "orario" && hasCompletedSetup ? (
                <button
                  type="button"
                  className={styles.entitySwitchCta}
                  onClick={resetSetup}
                  title="Cambia classe o docente"
                  aria-label="Cambia classe o docente"
                >
                  <span className={styles.entitySwitchValue}>{tabTitles[activeTab].subtitle}</span>
                  <span className={styles.entitySwitchHint}>Tocca per cambiare</span>
                </button>
              ) : (
                <p className={styles.subtitle}>{tabTitles[activeTab].subtitle}</p>
              )}
            </div>

            <div className={styles.logoWithSanta}>
              <img src="/logo.png" alt="Logo" className={styles.headerLogo} />
            </div>

            <div className={styles.headerActions}>
              <SettingsMenu />
            </div>
          </div>
        </div>

        {/* Current lesson banner */}
        {activeTab === "orario" && hasCompletedSetup && isToday && currentLesson && (
          <div className={styles.currentLessonBanner}>
            <div className={styles.currentLessonInfo}>
              <span className={styles.currentLessonIcon}>⏳</span>
              <div className={styles.currentLessonText}>
                <div className={styles.currentLessonSubject}>{currentLesson.subject}</div>
                <div className={styles.currentLessonDetails}>
                  {currentLesson.startTime} - {currentLesson.endTime} · {currentLesson.teacher}
                </div>
              </div>
            </div>
            <RemainingMinutesBadge endTime={currentLesson.endTime} />
          </div>
        )}

        {/* Day tabs */}
        {activeTab === "orario" && hasCompletedSetup && (
          <div className={styles.dayTabs}>
            <div className={styles.dayTabsContainer}>
              {daysWithLessons.map(day => (
                <button
                  key={day.number}
                  onClick={() => setSelectedDay(day.number)}
                  className={`${styles.dayTab} ${selectedDay === day.number ? styles.active : ""}`}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={styles.content}>
        {activeTab === "orario" ? (
          !hasCompletedSetup ? (
            <InlineSetup />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={styles.scrollArea}
              >
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
                          hideTeacher={userMode === "teacher"}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>📅</div>
                      <p className={styles.emptyText}>Nessuna lezione</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )
        ) : activeTab === "classi" ? (
          <AllSchedulesView mode="student" />
        ) : (
          <AllSchedulesView mode="teacher" />
        )}
      </div>

      {/* "Oggi" button */}
      {activeTab === "orario" && hasCompletedSetup && !isToday && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <button onClick={goToToday} className={styles.todayButton}>
            <span>📆</span>
            <span>Oggi</span>
          </button>
        </motion.div>
      )}

      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
