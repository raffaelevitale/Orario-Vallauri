import { Lesson } from '@/lib/orario/models/lesson';
import { getLessonDuration } from '@/lib/orario/utils/time';
import { GlassCard } from './GlassCard';

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

  return (
    <GlassCard
      className={`${compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'} transition-all ${
        isCurrent
          ? 'ring-2 ring-blue-400 dark:ring-blue-500 shadow-2xl scale-[1.02]'
          : 'hover:scale-[1.01]'
      }`}
      tintColor={
        lesson.isBreak
          ? 'rgba(156, 163, 175, 0.1)'
          : `${lesson.color}${compact ? '15' : '20'}`
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {lesson.isBreak ? (
              <span className="text-base sm:text-lg">☕</span>
            ) : (
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: lesson.color }}
              />
            )}
            <h3
              className={`font-semibold text-gray-900 dark:text-white truncate ${
                compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
              }`}
            >
              {lesson.subject}
            </h3>
            {!lesson.isBreak && isLab && (
              <span className="px-1.5 py-0.5 bg-purple-500/30 text-purple-200 text-[10px] rounded-md font-medium flex-shrink-0">
                LAB
              </span>
            )}
          </div>

          {!lesson.isBreak && (
            <div
              className={`space-y-0.5 ${
                compact ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
              }`}
            >
              {lesson.teacher && (
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                  <span className="text-xs sm:text-sm">👨‍🏫</span>
                  <span className="truncate font-medium">{lesson.teacher}</span>
                </div>
              )}
              {shortClassroom && (
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                  <span className="text-xs sm:text-sm">📍</span>
                  <span className="truncate">{shortClassroom}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <div
            className={`font-semibold text-gray-900 dark:text-white whitespace-nowrap ${
              compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
            }`}
          >
            {lesson.startTime}
          </div>
          <div
            className={`text-gray-600 dark:text-gray-400 whitespace-nowrap ${
              compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'
            }`}
          >
            {lesson.endTime}
          </div>
          <div
            className={`text-gray-500 dark:text-gray-500 mt-0.5 ${
              compact ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'
            }`}
          >
            {duration}min
          </div>
          {isCurrent && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] sm:text-xs rounded-full font-medium shadow-lg">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Ora
              </span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
