import { Lesson } from '@/lib/orario/models/lesson';
import { getLessonDuration } from '@/lib/orario/utils/time';
import styles from './LessonCard.module.css';

interface LessonCardProps {
  lesson: Lesson;
  isCurrent?: boolean;
  compact?: boolean;
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
}: LessonCardProps) {
  const duration = getLessonDuration(lesson);
  const isLab = isLabLesson(lesson.classroom, lesson.subject);
  const shortClassroom = shortenClassroom(lesson.classroom);

  const cardClasses = [
    styles.card,
    compact && styles.cardCompact,
    isCurrent && styles.cardCurrent,
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
                  <span className={styles.detailText}>{lesson.class}</span>
                </div>
              )}
              {lesson.teacher && (
                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>👨‍🏫</span>
                  <span className={styles.detailText}>{lesson.teacher}</span>
                </div>
              )}
              {shortClassroom && (
                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>📍</span>
                  <span className={styles.detailText}>{shortClassroom}</span>
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
        </div>
      </div>
    </div>
  );
}
