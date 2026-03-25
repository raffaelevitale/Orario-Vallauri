"use client";

import { useScheduleStore } from "@/lib/orario/stores/scheduleStore";
import type { Lesson } from "@/lib/orario/models/lesson";
import styles from "./BlockView.module.css";
import { LessonCard } from "./LessonCard";
import { isCurrentLesson, parseTime } from "@/lib/orario/utils/time";
interface BlockViewProps {
    lessons?: Lesson[];
    hideTeacher?: boolean;
}

export function BlockView({ lessons: externalLessons, hideTeacher }: BlockViewProps = {}) {
    const { schedule, userMode } = useScheduleStore();
    const resolvedLessons = externalLessons ?? schedule.lessons;
    const resolvedHideTeacher = hideTeacher ?? (userMode === "teacher");
    const days = [
        { name: "LUN", index: 1 },
        { name: "MAR", index: 2 },
        { name: "MER", index: 3 },
        { name: "GIO", index: 4 },
        { name: "VEN", index: 5 },
    ];

    if (!resolvedLessons.length) {
        return <div className={styles.emptyState}>Nessuna lezione</div>;
    }

    const lessonsByDay = days.map((day) => ({
        ...day,
        lessons: resolvedLessons
            .filter((lesson) => lesson.dayOfWeek === day.index)
            .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime)),
    }));

    return (
        <div className={styles.scrollHintWrap}>
            <div className={`${styles.scrollHint} ${styles.scrollHintLeft}`} aria-hidden="true">
                <span className={styles.scrollHintIcon}>‹</span>
            </div>
            <div className={`${styles.scrollHint} ${styles.scrollHintRight}`} aria-hidden="true">
                <span className={styles.scrollHintIcon}>›</span>
            </div>
            <div className={styles.container}>
                {lessonsByDay.map((day) => (
                    <div key={day.name} className={styles.dayColumn}>
                        <div className={styles.headerCell}>{day.name}</div>
                        <div className={styles.dayLessons}>
                            {day.lessons.length === 0 ? (
                                <div className={styles.dayEmpty}>—</div>
                            ) : (
                                day.lessons.map((lesson) => (
                                    <div key={lesson.id} className={styles.lessonWrapper}>
                                        <LessonCard
                                            lesson={lesson}
                                            compact={true}
                                            tiny={lesson.isBreak}
                                            hideTeacher={resolvedHideTeacher}
                                            isCurrent={isCurrentLesson(lesson)}
                                            className={styles.listCard}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
