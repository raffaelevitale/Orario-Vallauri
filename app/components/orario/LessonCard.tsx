import styles from './LessonCard.module.css';
import { Lesson } from '@/lib/orario/models/lesson';
import { getLessonDuration, parseTime, getCurrentTimeInMinutes } from '@/lib/orario/utils/time';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface LessonCardProps {
  lesson: Lesson;
  isCurrent?: boolean;
  compact?: boolean;
  hideTeacher?: boolean;
  className?: string;
  tiny?: boolean;
}

function shortenClassroom(classroom: string): string {
  if (!classroom) return '';

  let short = classroom.replace(/^LAB\./i, '');

  const match = short.match(/^([^(]+)/);
  if (match) {
    short = match[1].trim();
  }

  if (short.length > 20) {
    return short.substring(0, 17) + '...';
  }

  return short;
}

function isLabLesson(classroom: string, subject: string): boolean {
  const labKeywords = ['LAB', 'LABORATORIO', 'PALESTRA', 'GYM'];
  const classroomUpper = classroom.toUpperCase();
  const subjectUpper = subject.toUpperCase();

  return labKeywords.some(
    (keyword) =>
      classroomUpper.includes(keyword) || subjectUpper.includes(keyword)
  );
}

export function LessonCard({
  lesson,
  isCurrent = false,
  compact = false,
  hideTeacher = false,
  className,
  tiny = false,
}: LessonCardProps) {
  const duration = getLessonDuration(lesson);
  const isLab = isLabLesson(lesson.classroom, lesson.subject);
  const shortClassroom = shortenClassroom(lesson.classroom);

  const cardClasses = [
    styles.card,
    compact && styles.cardCompact,
    tiny && styles.cardTiny,
    isCurrent && styles.cardCurrent,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} style={{
      borderLeftColor: lesson.isBreak ? 'var(--border-color)' : lesson.color,
      borderLeftWidth: '4px',
    }}>
      <div className={styles.cardLayout}>
        <div className={styles.cardContent}>
          <div className={styles.header}>
            {lesson.isBreak ? (
              <span className={styles.icon}>☕</span>
            ) : (
              <div
                className={styles.colorDot}
                style={{ backgroundColor: lesson.color }}
              />
            )}
            <h3 className={`${styles.subject} ${compact ? styles.subjectCompact : ''}`}>
              {lesson.subject}
            </h3>
            {!lesson.isBreak && isLab && (
              <span className={styles.labBadge}>LAB</span>
            )}
          </div>

          {!lesson.isBreak && (
            <div className={`${styles.details} ${compact ? styles.detailsCompact : ''}`}>
              {lesson.class && (
                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>🎓</span>
                  <span className={`${styles.detailText} ${styles.detailTextBold}`}>{lesson.class}</span>
                </div>
              )}
              {/* Nascondi docente nella vista docente (inutile) */}
              {lesson.teacher && !hideTeacher && (
                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>👨‍🏫</span>
                  <span className={styles.detailText}>{lesson.teacher}</span>
                </div>
              )}
              {shortClassroom && (
                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>📍</span>
                  <span className={`${styles.detailText} ${styles.detailTextBold}`}>{shortClassroom}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.timeSection}>
          <div className={styles.startTime}>{lesson.startTime}</div>
          <div className={styles.endTime}>{lesson.endTime}</div>
          <div className={styles.duration}>{duration}min</div>
          {isCurrent && (
            <div className={styles.currentBadge}>
              <span className={styles.pulse}></span>
              Ora
            </div>
          )}
          {!lesson.isBreak && !isCurrent && (() => {
            const date = new Date()
            const now = getCurrentTimeInMinutes();
            const start = parseTime(lesson.startTime);
            const diff = start - now;
            if (diff > 0 && diff <= 30 && lesson.dayOfWeek === date.getDay()) {
              return <span className={styles.soonBadge}>Inizia tra {diff}m</span>;
            }
            return null;
          })()}
          {isCurrent && !lesson.isBreak && (() => {
            const now = getCurrentTimeInMinutes();
            const start = parseTime(lesson.startTime);
            const end = parseTime(lesson.endTime);
            const total = end - start;
            const elapsed = Math.min(Math.max(now - start, 0), total);
            const pct = (elapsed / total) * 100;
            return (
              <div className={styles.progressWrap}>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: pct + '%' }} />
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
