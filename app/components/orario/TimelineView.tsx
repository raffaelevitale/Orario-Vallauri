'use client';

import { Lesson } from '@/lib/orario/models/lesson';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import {
  parseTime,
  getCurrentTimeInMinutes,
  isCurrentLesson,
} from '@/lib/orario/utils/time';

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
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <div className="text-6xl mb-4">📅</div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
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
    <div className="relative pl-14 sm:pl-16 pr-3 sm:pr-4 py-4">
      {/* Vertical timeline */}
      <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-pink-500/20" />

      {/* Current time indicator */}
      {isToday &&
        currentMinutes >= timelineStart &&
        currentMinutes <= timelineEnd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-0 right-0 z-10 flex items-center"
            style={{
              top: `${((currentMinutes - timelineStart) / timelineHeight) * 100}%`,
            }}
          >
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse ml-2 sm:ml-2.5" />
            <div className="h-0.5 flex-1 bg-gradient-to-r from-red-500 to-transparent" />
            <span className="text-[10px] sm:text-xs font-semibold text-red-500 ml-2" suppressHydrationWarning>
              {currentTimeStr}
            </span>
          </motion.div>
        )}

      {/* Lessons */}
      <div className="space-y-3 relative">
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
              className="relative"
              style={{
                marginTop: gap > 5 ? `${Math.min(gap * 1.0, 28)}px` : '0',
              }}
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-11 sm:-left-12 top-2 w-1.5 h-1.5 rounded-full ${
                  isCurrent
                    ? 'bg-blue-500 ring-4 ring-blue-500/30'
                    : 'bg-gray-500'
                }`}
              />

              {/* Time */}
              <div className="absolute -left-[62px] sm:-left-[70px] top-0.5 text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 text-right w-12 sm:w-14">
                {lesson.startTime}
              </div>

              {/* Lesson card */}
              <div
                className={`
                  rounded-lg p-3 sm:p-3 transition-all text-xs
                  ${
                    isCurrent
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-2 ring-blue-400 dark:ring-blue-500 shadow-lg'
                      : lesson.isBreak
                        ? 'bg-gray-200/30 dark:bg-gray-800/30'
                        : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }
                `}
                style={{
                  minHeight: `${Math.max(height * 0.8, 56)}px`,
                  borderLeft: lesson.isBreak
                    ? 'none'
                    : `3px solid ${lesson.color}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {lesson.isBreak ? (
                        <span className="text-sm">☕</span>
                      ) : (
                        <>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-xs truncate">
                            {lesson.subject}
                          </h3>
                          {lesson.classroom &&
                            lesson.classroom.toUpperCase().includes('LAB') && (
                              <span className="px-1 py-0.5 bg-purple-500/30 text-purple-200 text-[9px] rounded font-medium">
                                LAB
                              </span>
                            )}
                        </>
                      )}
                    </div>

                    {!lesson.isBreak && (
                      <div className="space-y-0.5 text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                        {lesson.teacher && (
                          <div className="flex items-center gap-1 truncate">
                            <span className="text-xs">👨‍🏫</span>
                            <span className="truncate">{lesson.teacher}</span>
                          </div>
                        )}
                        {lesson.classroom && (
                          <div className="flex items-center gap-1 truncate">
                            <span className="text-xs">📍</span>
                            <span className="truncate">{lesson.classroom}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      {lesson.endTime}
                    </div>
                    <div className="text-[9px] text-gray-500 dark:text-gray-500 mt-0.5">
                      {height}min
                    </div>
                    {isCurrent && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[9px] rounded-full font-medium">
                          <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                          Ora
                        </span>
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
