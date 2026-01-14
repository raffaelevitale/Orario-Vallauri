"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useScheduleStore } from "@/lib/orario/stores/scheduleStore";
import { useSnowfallStore } from "@/lib/orario/stores/snowfallStore";
import { LessonCard } from "@/app/components/orario/LessonCard";
import { SettingsMenu } from "@/app/components/orario/SettingsMenu";
import InstallPrompt from "@/app/components/pwa/InstallPrompt";
import { NotificationPrompt } from "@/app/components/orario/NotificationPrompt";
import { OnboardingTour } from "@/app/components/onboarding/OnboardingTour";
import { motion, AnimatePresence } from "framer-motion";
import { isCurrentLesson, getRemainingMinutes } from "@/lib/orario/utils/time";
import { Lesson } from "@/lib/orario/models/lesson";
import {
  requestNotificationPermission,
  scheduleLessonNotifications,
  clearAllNotifications,
} from "@/lib/orario/utils/notifications";
import styles from "./orario.module.css";
import { BlockView } from "@/app/components/orario/BlockView";
import { SchoolCalendar } from "@/app/components/orario/SchoolCalendar";

const weekDays = [
  { number: 1, name: "Lunedì", short: "Lun" },
  { number: 2, name: "Martedì", short: "Mar" },
  { number: 3, name: "Mercoledì", short: "Mer" },
  { number: 4, name: "Giovedì", short: "Gio" },
  { number: 5, name: "Venerdì", short: "Ven" },
];

function RemainingMinutesBadge({
  endTime,
  color,
}: {
  endTime: string;
  color?: string;
}) {
  const [remaining, setRemaining] = useState(() =>
    getRemainingMinutes(endTime)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemainingMinutes(endTime));
    }, 15000);
    return () => clearInterval(timer);
  }, [endTime]);

  return <div className={styles.remainingBadge}>{remaining} min</div>;
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
    getDaysWithLessons,
  } = useScheduleStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const { enableSnowfall } = useSnowfallStore();

  // Evita hydration mismatch aspettando il mount del client
  useEffect(() => {
    setIsMounted(true);

    // Imposta sempre il giorno corrente all'apertura dell'app
    const today = new Date().getDay();
    const currentDay = today === 0 || today === 6 ? 1 : today;
    setSelectedDay(currentDay);
  }, [setSelectedDay]);

  // (spostato sotto la definizione di todayLessons)

  // LOGICA MISTA (restore automatico): Redirect al setup solo se non completato
  // Se l'utente ha già completato il setup, l'app ripristina la selezione da localStorage
  // e salta il setup, mostrando direttamente l'orario.
  // Per tornare alla logica precedente (sempre setup all'avvio), cambia la condizione
  // da "!hasCompletedSetup" a "true" o rimuovi il check su hasCompletedSetup.
  useEffect(() => {
    if (!hasCompletedSetup && isMounted) {
      router.push("/orario/setup");
    }
  }, [hasCompletedSetup, router, isMounted]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const todayLessons = useMemo(() => {
    return getLessonsForDay(selectedDay);
  }, [selectedDay, getLessonsForDay]);

  // LOGICA MISTA (restore automatico + notifiche): Pianifica le notifiche solo se:
  // 1. Il componente è montato (isMounted)
  // 2. C'è almeno una lezione per il giorno selezionato (todayLessons.length > 0)
  // Questo garantisce che le notifiche vengano pianificate anche dopo un riavvio,
  // se la selezione è stata ripristinata da localStorage.
  // Per tornare alla logica precedente (notifiche solo manualmente), rimuovi questo useEffect.
  useEffect(() => {
    if (!isMounted) return;

    // Pulisci le notifiche precedenti quando cambia giorno
    clearAllNotifications();

    requestNotificationPermission().then((perm) => {
      if (perm === "granted") {
        scheduleLessonNotifications(todayLessons);
      }
    });

    // Cleanup quando il componente viene smontato
    return () => {
      clearAllNotifications();
    };
  }, [isMounted, selectedDay, todayLessons]);

  useEffect(() => {
    if (!todayLessons.length) {
      setCurrentLesson(null);
      return;
    }
    const current = todayLessons.find((l) => isCurrentLesson(l));
    setCurrentLesson(current || null);
  }, [currentTime, todayLessons]);

  // Easter egg: 4 click sul logo per attivare la neve
  useEffect(() => {
    if (logoClickCount >= 4) {
      enableSnowfall();
      setLogoClickCount(0);
    }

    // Reset del contatore dopo 2 secondi senza click
    if (logoClickCount > 0) {
      const timer = setTimeout(() => {
        setLogoClickCount(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount, enableSnowfall]);

  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);
  };

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

  // Filtra i giorni per mostrare solo quelli con lezioni
  const daysWithLessons = useMemo(() => {
    const daysWithLessonsSet = getDaysWithLessons();
    return weekDays.filter(day => daysWithLessonsSet.includes(day.number));
  }, [getDaysWithLessons, schedule]);

  // Mostra un placeholder durante il caricamento per evitare hydration mismatch
  if (!isMounted) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerTop}>
              <div>
                <h1 className={styles.title}>Orario</h1>
                <p className={styles.subtitle}>Caricamento...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Fixed header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Orario</h1>
              <p className={styles.subtitle}>
                {userMode === "student"
                  ? `Classe ${selectedEntity}`
                  : userMode === "teacher"
                    ? selectedEntity
                    : schedule.className || "Orario Settimanale"}
              </p>
            </div>

            <div
              className={styles.logoWithSanta}
              onClick={handleLogoClick}
              role="button"
              aria-label="Attiva neve"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className={styles.headerLogo}
              />
            </div>

            <div className={styles.headerActions}>
              <SettingsMenu onHelp={() => setShowOnboarding(true)} />
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
                  {currentLesson.startTime} - {currentLesson.endTime} ·{" "}
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






        {/* Day tabs - Only show in list view and not in holiday mode */}
        {viewType === "list" && userMode !== 'holiday' && (
          <div className={styles.dayTabs}>
            <div className={styles.dayTabsContainer}>
              {daysWithLessons.map((day) => (
                <button
                  key={day.number}
                  onClick={() => setSelectedDay(day.number)}
                  className={`${styles.dayTab} ${selectedDay === day.number ? styles.active : ""
                    }`}>
                  {day.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={styles.content}>
        {userMode === 'holiday' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.scrollArea}
          >
            <SchoolCalendar />
          </motion.div>
        ) : viewType === "block" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.scrollArea}
          >
            <BlockView />
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedDay}-${viewType}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={styles.scrollArea}>
              <div className={styles.lessonsList}>
                {todayLessons.length > 0 ? (
                  todayLessons.map((lesson, index) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}>
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
        )}
      </div>

      {/* Quick "Oggi" button - Hide in holiday mode */}
      {
        !isToday && userMode !== 'holiday' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}>
            <button onClick={goToToday} className={styles.todayButton}>
              <span>📆</span>
              <span>Oggi</span>
            </button>
          </motion.div>
        )
      }

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Notification Prompt */}
      <NotificationPrompt />

      {/* Onboarding Tour */}
      {
        showOnboarding && (
          <OnboardingTour
            onComplete={() => setShowOnboarding(false)}
            onSkip={() => setShowOnboarding(false)}
          />
        )
      }
    </div >
  );
}
