'use client';

import { Lesson } from '@/lib/orario/models/lesson';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import {
  parseTime,
  getCurrentTimeInMinutes,
  isCurrentLesson,
} from '@/lib/orario/utils/time';
import styles from './TimelineView.module.css';

interface TimelineViewProps {
  lessons: Lesson[];
  isToday: boolean;
}

function getHeight(lesson: Lesson): number {
  const start = parseTime(lesson.startTime);
  const end = parseTime(lesson.endTime);
  return end - start;
}

export function TimelineView({ lessons, isToday }: TimelineViewProps) {
  const [currentMinutes, setCurrentMinutes] = useState<number>(0);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    if (!isToday) return;
    const update = () => {
      setCurrentMinutes(getCurrentTimeInMinutes());
      setCurrentTimeStr(
        new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [isToday]);

  if (lessons.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📅</div>
        <p className={styles.emptyText}>
          Nessuna lezione programmata
        </p>
      </div>
    );
  }

  const firstLesson = lessons[0];
  const lastLesson = lessons[lessons.length - 1];
  const timelineStart = parseTime(firstLesson.startTime);
  const timelineEnd = parseTime(lastLesson.endTime);
  const timelineHeight = timelineEnd - timelineStart;

  return (
    <div className={styles.container}>
      {/* Vertical timeline */}
      <div className={styles.timelineLine} />

      {/* Current time indicator */}
      {isToday &&
        currentMinutes >= timelineStart &&
        currentMinutes <= timelineEnd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.currentTimeIndicator}
            style={{
              top: `${((currentMinutes - timelineStart) / timelineHeight) * 100}%`,
            }}
          >
            <div className={styles.currentTimeDot} />
            <div className={styles.currentTimeLine} />
            <span className={styles.currentTimeText} suppressHydrationWarning>
              {currentTimeStr}
            </span>
          </motion.div>
        )}

      {/* Lessons */}
      <div className={styles.lessonsContainer}>
        {lessons.map((lesson, index) => {
          const height = getHeight(lesson);
          const isCurrent = isToday && isCurrentLesson(lesson);

          const prevLesson = index > 0 ? lessons[index - 1] : null;
          const gap = prevLesson
            ? parseTime(lesson.startTime) - parseTime(prevLesson.endTime)
            : 0;

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={styles.lessonWrapper}
              style={{
                marginTop: gap > 5 ? `${Math.min(gap * 1.0, 28)}px` : '0',
              }}
            >
              {/* Timeline dot */}
              <div className={`${styles.timelineDot} ${isCurrent ? styles.current : ''}`} />

              {/* Time */}
              <div className={styles.timeLabel}>
                {lesson.startTime}
              </div>

              {/* Lesson card */}
              <div
                className={`${styles.lessonCard} ${lesson.isBreak ? styles.break : ''} ${isCurrent ? styles.current : ''}`}
                style={{
                  minHeight: `${Math.max(height * 0.8, 56)}px`,
                  borderLeftColor: lesson.isBreak ? 'transparent' : lesson.color,
                }}
              >
                <div className={styles.lessonHeader}>
                  <div className={styles.lessonContent}>
                    <div className={styles.lessonTitle}>
                      {lesson.isBreak ? (
                        <span className={styles.breakIcon}>☕</span>
                      ) : (
                        <>
                          <h3 className={styles.subjectName}>
                            {lesson.subject}
                          </h3>
                          {lesson.classroom &&
                            lesson.classroom.toUpperCase().includes('LAB') && (
                              <span className={styles.labBadge}>LAB</span>
                            )}
                        </>
                      )}
                    </div>

                    {!lesson.isBreak && (
                      <div className={styles.lessonDetails}>
                        {lesson.teacher && (
                          <div className={styles.detailRow}>
                            <span className={styles.detailIcon}>👨‍🏫</span>
                            <span className={styles.detailText}>{lesson.teacher}</span>
                          </div>
                        )}
                        {lesson.classroom && (
                          <div className={styles.detailRow}>
                            <span className={styles.detailIcon}>📍</span>
                            <span className={styles.detailText}>{lesson.classroom}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={styles.lessonTime}>
                    <div className={styles.endTime}>
                      {lesson.endTime}
                    </div>
                    <div className={styles.duration}>
                      {height}min
                    </div>
                    {isCurrent && (
                      <div className={styles.nowBadge}>
                        <span className={styles.nowDot}></span>
                        Ora
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
