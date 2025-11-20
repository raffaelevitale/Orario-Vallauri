"use client";

import { useScheduleStore } from "@/lib/orario/stores/scheduleStore";
import { Lesson } from "@/lib/orario/models/lesson";
import styles from "./BlockView.module.css";
import { LessonCard } from "./LessonCard";
import { isCurrentLesson, parseTime, getLessonDuration } from "@/lib/orario/utils/time";

export function BlockView() {
    const { schedule, userMode } = useScheduleStore();
    const days = [
        { name: "Lun", index: 1 },
        { name: "Mar", index: 2 },
        { name: "Mer", index: 3 },
        { name: "Gio", index: 4 },
        { name: "Ven", index: 5 },
    ];

    if (!schedule.lessons.length) {
        return <div className={styles.emptyState}>Nessuna lezione</div>;
    }

    // 1. Calcola l'intervallo di tempo
    const startTimesMinutes = schedule.lessons.map((l) => parseTime(l.startTime));
    const endTimesMinutes = schedule.lessons.map((l) => parseTime(l.endTime));

    const minTime = Math.min(...startTimesMinutes);
    const maxTime = Math.max(...endTimesMinutes);

    // 5 minuti per passo di riga
    const step = 5;
    const totalRows = Math.ceil((maxTime - minTime) / step);

    // Helper per formattare i minuti in HH:mm
    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    // Helper per ottenere l'inizio della riga della griglia
    const getRowStart = (timeStr: string) => {
        const t = parseTime(timeStr);
        // +2 perché la riga 1 è l'intestazione
        return Math.floor((t - minTime) / step) + 2;
    };

    // Helper per ottenere lo span della riga
    const getRowSpan = (lesson: Lesson) => {
        const duration = getLessonDuration(lesson);
        return Math.ceil(duration / step);
    };

    return (
        <div
            className={styles.container}
            style={{
                // Riga 1 è l'intestazione (auto), il resto è 1fr proporzionale al tempo
                gridTemplateRows: `auto repeat(${totalRows}, 1fr)`
            }}
        >
            {/* Riga Intestazione */}
            {days.map((day) => (
                <div
                    key={day.name}
                    className={styles.headerCell}
                    style={{ gridColumn: day.index, gridRow: 1 }}
                >
                    {day.name}
                </div>
            ))}

            {/* Lezioni */}
            {schedule.lessons.map((lesson) => {
                const isCurrent = isCurrentLesson(lesson);
                const duration = getLessonDuration(lesson);
                // Se la durata è <= 20 min, tratta come tiny (es. Intervallo lungo)
                const isTiny = duration <= 20;

                return (
                    <div
                        key={lesson.id}
                        className={styles.lessonWrapper}
                        style={{
                            gridColumn: lesson.dayOfWeek,
                            gridRow: `${getRowStart(lesson.startTime)} / span ${getRowSpan(lesson)}`,
                            zIndex: isTiny ? 10 : 1, // Assicura che le card piccole stiano sopra se si espandono
                        }}
                    >
                        <LessonCard
                            lesson={lesson}
                            compact={true}
                            tiny={isTiny}
                            hideTeacher={userMode === "teacher"}
                            isCurrent={isCurrent}
                            className={styles.fullHeightCard}
                        />
                    </div>
                );
            })}
        </div>
    );
}
