"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    loadClassNames,
    loadTeacherNames,
    loadClassSchedule,
    loadTeacherSchedule,
} from "@/lib/orario/services/scheduleService";
import type { Lesson } from "@/lib/orario/models/lesson";
import { BlockView } from "./BlockView";
import { LessonCard } from "./LessonCard";
import { isCurrentLesson } from "@/lib/orario/utils/time";
import { ArrowLeft, List, LayoutGrid, Search, X, CalendarOff } from "lucide-react";
import styles from "./BrowseList.module.css";

type BrowseMode = "student" | "teacher";
type DetailView = "block" | "list";

interface BrowseListProps {
    mode: BrowseMode;
}

const weekDays = [
    { number: 1, name: "Lunedì", short: "LUN" },
    { number: 2, name: "Martedì", short: "MAR" },
    { number: 3, name: "Mercoledì", short: "MER" },
    { number: 4, name: "Giovedì", short: "GIO" },
    { number: 5, name: "Venerdì", short: "VEN" },
];

export function BrowseList({ mode }: BrowseListProps) {
    const [items, setItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState<string>("all");
    const [selectedSector, setSelectedSector] = useState<string | null>(null);

    // Detail state
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [entityLessons, setEntityLessons] = useState<Lesson[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [detailView, setDetailView] = useState<DetailView>("block");
    const [selectedDay, setSelectedDay] = useState<number>(() => {
        const today = new Date().getDay();
        return today >= 1 && today <= 5 ? today : 1;
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (mode === "student") {
                    const classList = await loadClassNames();
                    setItems(classList);
                } else {
                    const teacherList = await loadTeacherNames();
                    teacherList.sort();
                    setItems(teacherList);
                }
            } catch {
                setItems([]);
            }
            setLoading(false);
        };
        load();
    }, [mode]);

    // Reset selections when mode changes
    useEffect(() => {
        setSelectedEntity(null);
        setEntityLessons([]);
        setSearchTerm("");
        setSelectedYear("all");
        setSelectedSector(null);
    }, [mode]);

    const years = useMemo(
        () => Array.from(new Set(items.map((c) => c.charAt(0)))).sort(),
        [items]
    );

    const sectors = useMemo(
        () =>
            Array.from(new Set(items.map((c) => c.split(" ").slice(1).join(" ")))).sort(),
        [items]
    );

    const filteredList = useMemo(() => {
        let list = items;
        if (searchTerm) {
            list = list.filter((item) =>
                item.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (mode === "student") {
            if (selectedYear !== "all")
                list = list.filter((c) => c.charAt(0) === selectedYear);
            if (selectedSector)
                list = list.filter(
                    (c) => c.split(" ").slice(1).join(" ") === selectedSector
                );
        }
        return list;
    }, [items, searchTerm, selectedYear, selectedSector, mode]);

    // Group by year for students
    const groupedByYear: Record<string, string[]> = useMemo(() => {
        if (mode !== "student") return {};
        const groups: Record<string, string[]> = {};
        for (const cls of filteredList) {
            const year = cls.charAt(0);
            if (!groups[year]) groups[year] = [];
            groups[year].push(cls);
        }
        return groups;
    }, [filteredList, mode]);

    // Group by first letter for teachers
    const groupedByLetter: Record<string, string[]> = useMemo(() => {
        if (mode !== "teacher") return {};
        const groups: Record<string, string[]> = {};
        for (const t of filteredList) {
            const letter = t.charAt(0).toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(t);
        }
        return groups;
    }, [filteredList, mode]);

    const handleEntitySelect = async (entity: string) => {
        setSelectedEntity(entity);
        setLoadingDetail(true);
        setDetailView("block");
        try {
            const lessons =
                mode === "student"
                    ? await loadClassSchedule(entity)
                    : await loadTeacherSchedule(entity);
            setEntityLessons(lessons);
        } catch {
            setEntityLessons([]);
        }
        setLoadingDetail(false);
    };

    const handleBack = () => {
        setSelectedEntity(null);
        setEntityLessons([]);
    };

    // Days with lessons for list view
    const daysWithLessons = useMemo(() => {
        const days = new Set<number>();
        entityLessons.forEach((l) => {
            if (!l.isBreak && l.dayOfWeek >= 1 && l.dayOfWeek <= 5)
                days.add(l.dayOfWeek);
        });
        return weekDays.filter((d) => days.has(d.number));
    }, [entityLessons]);

    const lessonsForDay = useMemo(() => {
        return entityLessons
            .filter((l) => l.dayOfWeek === selectedDay)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [entityLessons, selectedDay]);

    // ─── Detail View ──────────────────────────────────────────────────────────
    if (selectedEntity) {
        return (
            <div className={styles.detailContainer}>
                <div className={styles.detailHeader}>
                    <button className={styles.backBtn} onClick={handleBack}>
                        <ArrowLeft size={18} />
                        <span>Indietro</span>
                    </button>
                    <div className={styles.detailInfo}>
                        <h2 className={styles.detailTitle}>{selectedEntity}</h2>
                        <p className={styles.detailSubtitle}>
                            {mode === "student" ? "Classe" : "Docente"}
                        </p>
                    </div>
                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.viewBtn} ${detailView === "block" ? styles.viewBtnActive : ""}`}
                            onClick={() => setDetailView("block")}
                            aria-label="Vista blocchi"
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            className={`${styles.viewBtn} ${detailView === "list" ? styles.viewBtnActive : ""}`}
                            onClick={() => setDetailView("list")}
                            aria-label="Vista lista"
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>

                {/* Day tabs for list view */}
                {detailView === "list" && (
                    <div className={styles.dayTabs}>
                        <div className={styles.dayTabsInner}>
                            {daysWithLessons.map((day) => (
                                <button
                                    key={day.number}
                                    className={`${styles.dayTab} ${selectedDay === day.number ? styles.dayTabActive : ""}`}
                                    onClick={() => setSelectedDay(day.number)}
                                >
                                    {day.short}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.detailContent}>
                    {loadingDetail ? (
                        <div className={styles.emptyState}>
                            <div className={styles.spinner} />
                            <span>Caricamento…</span>
                        </div>
                    ) : detailView === "block" ? (
                        <BlockView lessons={entityLessons} hideTeacher={mode === "teacher"} />
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedDay}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className={styles.lessonsList}
                            >
                                {lessonsForDay.length > 0 ? (
                                    lessonsForDay.map((lesson, i) => (
                                        <motion.div
                                            key={lesson.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                        >
                                            <LessonCard
                                                lesson={lesson}
                                                compact
                                                isCurrent={isCurrentLesson(lesson)}
                                                hideTeacher={mode === "teacher"}
                                            />
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>
                                        <CalendarOff size={40} className={styles.emptyIcon} />
                                        <span>Nessuna lezione</span>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        );
    }

    // ─── List View (browse) ───────────────────────────────────────────────────
    return (
        <div className={styles.container}>
            {/* Filters for students */}
            {mode === "student" && items.length > 0 && (
                <div className={styles.filters}>
                    <div className={styles.yearTabs}>
                        <button
                            onClick={() => setSelectedYear("all")}
                            className={`${styles.yearTab} ${selectedYear === "all" ? styles.yearTabActive : ""}`}
                        >
                            Tutti
                        </button>
                        {years.map((year) => (
                            <button
                                key={year}
                                onClick={() =>
                                    setSelectedYear(selectedYear === year ? "all" : year)
                                }
                                className={`${styles.yearTab} ${selectedYear === year ? styles.yearTabActive : ""}`}
                            >
                                {year}°
                            </button>
                        ))}
                    </div>
                    <div className={styles.sectorRow}>
                        {sectors.map((sector) => (
                            <button
                                key={sector}
                                onClick={() =>
                                    setSelectedSector(selectedSector === sector ? null : sector)
                                }
                                className={`${styles.sectorChip} ${selectedSector === sector ? styles.sectorChipActive : ""}`}
                            >
                                {sector}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className={styles.searchWrapper}>
                <Search size={16} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder={
                        mode === "student" ? "Cerca classe…" : "Cerca docente…"
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className={styles.searchClear}
                        aria-label="Cancella"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* List */}
            <div className={styles.listContainer}>
                {loading ? (
                    <div className={styles.emptyState}>
                        <div className={styles.spinner} />
                        <span>Caricamento…</span>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className={styles.emptyState}>Nessun risultato</div>
                ) : mode === "student" ? (
                    Object.keys(groupedByYear)
                        .sort()
                        .map((year) => (
                            <div key={year}>
                                {selectedYear === "all" && (
                                    <div className={styles.divider}>
                                        <span className={styles.dividerText}>{year}° anno</span>
                                        <span className={styles.dividerCount}>
                                            {groupedByYear[year].length}
                                        </span>
                                    </div>
                                )}
                                {groupedByYear[year].map((item) => {
                                    const section = item.split(" ")[0].substring(1);
                                    const sector = item.split(" ").slice(1).join(" ");
                                    return (
                                        <button
                                            key={item}
                                            className={styles.listItem}
                                            onClick={() => handleEntitySelect(item)}
                                        >
                                            <span className={styles.listItemContent}>
                                                <span className={styles.listItemMain}>
                                                    {item.charAt(0)}
                                                    {section}
                                                </span>
                                                <span className={styles.listItemSub}>{sector}</span>
                                            </span>
                                            <ArrowLeft
                                                size={14}
                                                className={styles.listItemArrow}
                                                style={{ transform: "rotate(180deg)" }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                ) : (
                    Object.keys(groupedByLetter)
                        .sort()
                        .map((letter) => (
                            <div key={letter}>
                                <div className={styles.divider}>
                                    <span className={styles.dividerText}>{letter}</span>
                                    <span className={styles.dividerCount}>
                                        {groupedByLetter[letter].length}
                                    </span>
                                </div>
                                {groupedByLetter[letter].map((item) => (
                                    <button
                                        key={item}
                                        className={styles.listItem}
                                        onClick={() => handleEntitySelect(item)}
                                    >
                                        <span className={styles.listItemContent}>
                                            <span className={styles.listItemMain}>
                                                {item.split(" ")[0]}
                                            </span>
                                            <span className={styles.listItemSub}>
                                                {item.split(" ").slice(1).join(" ")}
                                            </span>
                                        </span>
                                        <ArrowLeft
                                            size={14}
                                            className={styles.listItemArrow}
                                            style={{ transform: "rotate(180deg)" }}
                                        />
                                    </button>
                                ))}
                            </div>
                        ))
                )}
            </div>

            {!loading && filteredList.length > 0 && (
                <div className={styles.resultCount}>
                    {filteredList.length}{" "}
                    {mode === "student"
                        ? filteredList.length === 1
                            ? "classe"
                            : "classi"
                        : filteredList.length === 1
                            ? "docente"
                            : "docenti"}
                </div>
            )}
        </div>
    );
}
