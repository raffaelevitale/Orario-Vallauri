"use client";

import { useScheduleStore } from "@/lib/orario/stores/scheduleStore";
import { Lesson } from "@/lib/orario/models/lesson";
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
        { name: "Lun", index: 1 },
        { name: "Mar", index: 2 },
        { name: "Mer", index: 3 },
        { name: "Gio", index: 4 },
        { name: "Ven", index: 5 },
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
    );
}
