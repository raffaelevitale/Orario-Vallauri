import type { Lesson } from '@/lib/orario/models/lesson';
import { getLessonDuration, parseTime, getCurrentTimeInMinutes } from '@/lib/orario/utils/time';
import styles from './LessonCard.module.css';
import { User, MapPin, GraduationCap, Clock, Coffee } from 'lucide-react';

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
  const compactMainDetail = hideTeacher ? lesson.class : lesson.teacher;

  // Se la card è tiny, non mostrare dettagli extra
  if (tiny) {
    return (
      <div className={`${styles.card} ${styles.cardTiny} ${isCurrent ? styles.cardCurrent : ''} ${className || ''}`}
        style={{ borderLeftColor: lesson.isBreak ? 'var(--border-color)' : lesson.color, borderLeftWidth: '4px' }}>
        <div className={styles.cardLayout}>
          <div className={styles.header}>
            <span className={styles.subject}>{lesson.subject}</span>
          </div>
        </div>
      </div>
    );
  }

  const cardClasses = [
    styles.card,
    compact && styles.cardCompact,
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
              <Coffee size={18} className={styles.icon} />
            ) : (
              // Dot color is handled by border-left now, but we keep structure if needed later
              null
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
              {compact ? (
                <>
                  {compactMainDetail && (
                    <div className={styles.detailRow}>
                      {hideTeacher ? (
                        <GraduationCap size={14} className={styles.detailIcon} />
                      ) : (
                        <User size={14} className={styles.detailIcon} />
                      )}
                      <span className={styles.detailText} title={compactMainDetail}>{compactMainDetail}</span>
                    </div>
                  )}

                  {shortClassroom && (
                    <div className={styles.detailRow}>
                      <MapPin size={14} className={styles.detailIcon} />
                      <span className={`${styles.detailText} ${styles.detailTextBold}`} title={lesson.classroom}>{shortClassroom}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Teacher - Mostrato prima della classe per importanza */}
                  {lesson.teacher && !hideTeacher && (
                    <div className={styles.detailRow}>
                      <User size={14} className={styles.detailIcon} />
                      <span className={styles.detailText} title={lesson.teacher}>{lesson.teacher}</span>
                    </div>
                  )}

                  {/* Classroom */}
                  {shortClassroom && (
                    <div className={styles.detailRow}>
                      <MapPin size={14} className={styles.detailIcon} />
                      <span className={`${styles.detailText} ${styles.detailTextBold}`} title={lesson.classroom}>{shortClassroom}</span>
                    </div>
                  )}

                  {/* Class - info meno rilevante se studente */}
                  {lesson.class && (
                    <div className={styles.detailRow}>
                      <GraduationCap size={14} className={styles.detailIcon} />
                      <span className={styles.detailText}>{lesson.class}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className={styles.timeSection}>
          <div className={styles.startEndTime}>
            <div className={styles.startTime}>{lesson.startTime}</div>
            <div className={styles.endTime}>- {lesson.endTime}</div>
          </div>
          {!compact && (
            <div className={styles.duration}>
              <Clock size={10} style={{ marginRight: 4, display: 'inline-block' }} />
              {duration} min
            </div>
          )}
          {isCurrent && (
            <div className={styles.currentBadge}>
              Ora
            </div>
          )}
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
