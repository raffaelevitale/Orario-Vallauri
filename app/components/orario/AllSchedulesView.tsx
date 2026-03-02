"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
    loadClassNames,
    loadTeacherNames,
    loadClassSchedule,
    loadTeacherSchedule,
} from "@/lib/orario/services/scheduleService";
import { Lesson } from "@/lib/orario/models/lesson";
import { BlockView } from "./BlockView";
import { Search, X } from "lucide-react";
import styles from "./AllSchedulesView.module.css";

type ViewMode = "student" | "teacher";

interface AllSchedulesViewProps {
    mode: ViewMode;
}

interface ScheduleEntry {
    name: string;
    lessons: Lesson[] | null; // null = not yet loaded
    loading: boolean;
    error: boolean;
}

export function AllSchedulesView({ mode }: AllSchedulesViewProps) {
    const [allNames, setAllNames] = useState<string[]>([]);
    const [schedules, setSchedules] = useState<Map<string, ScheduleEntry>>(new Map());
    const [loadingNames, setLoadingNames] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState<string>("all");
    const [selectedSector, setSelectedSector] = useState<string | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Load names on mount
    useEffect(() => {
        const load = async () => {
            setLoadingNames(true);
            const names = mode === "student"
                ? await loadClassNames()
                : await loadTeacherNames().then(n => [...n].sort());
            setAllNames(names);
            const initial = new Map<string, ScheduleEntry>();
            for (const name of names) {
                initial.set(name, { name, lessons: null, loading: false, error: false });
            }
            setSchedules(initial);
            setLoadingNames(false);
        };
        load();
    }, [mode]);

    // Reset filters when mode changes
    useEffect(() => {
        setSearchTerm("");
        setSelectedYear("all");
        setSelectedSector(null);
    }, [mode]);

    const loadScheduleFor = useCallback(async (name: string) => {
        setSchedules(prev => {
            const entry = prev.get(name);
            if (!entry || entry.lessons !== null || entry.loading) return prev;
            const updated = new Map(prev);
            updated.set(name, { ...entry, loading: true });
            return updated;
        });

        try {
            const lessons = mode === "student"
                ? await loadClassSchedule(name)
                : await loadTeacherSchedule(name);
            setSchedules(prev => {
                const updated = new Map(prev);
                updated.set(name, { name, lessons, loading: false, error: false });
                return updated;
            });
        } catch {
            setSchedules(prev => {
                const updated = new Map(prev);
                updated.set(name, { name, lessons: [], loading: false, error: true });
                return updated;
            });
        }
    }, [mode]);

    // Filters
    const years = useMemo(
        () => mode === "student" ? Array.from(new Set(allNames.map(c => c.charAt(0)))).sort() : [],
        [allNames, mode]
    );

    const sectors = useMemo(() => {
        if (mode !== "student") return [];
        const filtered = selectedYear === "all" ? allNames : allNames.filter(n => n.charAt(0) === selectedYear);
        return Array.from(new Set(filtered.map(c => c.split(" ").slice(1).join(" ")))).sort();
    }, [allNames, mode, selectedYear]);

    const filteredNames = useMemo(() => {
        let list = allNames;
        if (searchTerm) {
            list = list.filter(n => n.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (mode === "student") {
            if (selectedYear !== "all") list = list.filter(c => c.charAt(0) === selectedYear);
            if (selectedSector) list = list.filter(c => c.split(" ").slice(1).join(" ") === selectedSector);
        }
        return list;
    }, [allNames, searchTerm, selectedYear, selectedSector, mode]);

    // Setup Intersection Observer for lazy loading
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const name = (entry.target as HTMLElement).dataset.entityName;
                        if (name) loadScheduleFor(name);
                    }
                }
            },
            { rootMargin: "200px" }
        );
        return () => observerRef.current?.disconnect();
    }, [loadScheduleFor]);

    const observeRef = useCallback((name: string) => (el: HTMLDivElement | null) => {
        if (el && observerRef.current) {
            el.dataset.entityName = name;
            observerRef.current.observe(el);
        }
    }, []);

    if (loadingNames) {
        return (
            <div className={styles.loadingWrap}>
                <div className={styles.spinner} />
                <span>Caricamento…</span>
            </div>
        );
    }

    return (
        <div className={styles.outer}>
            {/* Sticky header con filtri */}
            <div className={styles.stickyHeader}>
                {/* Year filter (students only) */}
                {mode === "student" && (
                    <div className={styles.yearTabs}>
                        <button
                            onClick={() => { setSelectedYear("all"); setSelectedSector(null); }}
                            className={`${styles.yearTab} ${selectedYear === "all" ? styles.yearTabActive : ""}`}
                        >
                            Tutti
                        </button>
                        {years.map(year => (
                            <button
                                key={year}
                                onClick={() => {
                                    setSelectedYear(selectedYear === year ? "all" : year);
                                    setSelectedSector(null);
                                }}
                                className={`${styles.yearTab} ${selectedYear === year ? styles.yearTabActive : ""}`}
                            >
                                {year}°
                            </button>
                        ))}
                    </div>
                )}

                {/* Sector chips (students only, when year selected) */}
                {mode === "student" && selectedYear !== "all" && sectors.length > 1 && (
                    <div className={styles.sectorRow}>
                        {sectors.map(sector => (
                            <button
                                key={sector}
                                onClick={() => setSelectedSector(selectedSector === sector ? null : sector)}
                                className={`${styles.sectorChip} ${selectedSector === sector ? styles.sectorChipActive : ""}`}
                            >
                                {sector}
                            </button>
                        ))}
                    </div>
                )}

                {/* Search */}
                <div className={styles.searchWrapper}>
                    <Search size={15} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={mode === "student" ? "Cerca classe…" : "Cerca docente…"}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className={styles.searchClear}>
                            <X size={13} />
                        </button>
                    )}
                </div>

                <div className={styles.calendarBox}>
                    <div className={styles.calendarTitle}>Calendario Vallauri</div>
                    <iframe
                        className={styles.calendarIframe}
                        src="https://calendar.google.com/calendar/embed?wkst=2&bgcolor=%23ffffff&ctz=Europe/Rome&showTitle=0&showNav=1&showPrint=0&showTabs=0&mode=AGENDA&src=Y185YWticTRqbHZlNmIwMDR1OGR1NDk4N3A0MEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23A79B8E"
                        title="Calendario pubblico Vallauri"
                        frameBorder="0"
                        scrolling="no"
                    />
                </div>
            </div>

            {/* Scrollable list of all schedules */}
            <div className={styles.scrollContent}>
                {filteredNames.length === 0 ? (
                    <div className={styles.emptyState}>Nessun risultato</div>
                ) : (
                    filteredNames.map(name => {
                        const entry = schedules.get(name);
                        return (
                            <div key={name} className={styles.scheduleBlock}>
                                {/* Header */}
                                <div className={styles.entityHeader}>
                                    <span className={styles.entityName}>{name}</span>
                                    {mode === "student" && (
                                        <span className={styles.entityBadge}>{name.split(" ").slice(1).join(" ")}</span>
                                    )}
                                </div>

                                {/* BlockView */}
                                <div className={styles.blockViewWrap} ref={observeRef(name)}>
                                    {!entry || entry.loading ? (
                                        <div className={styles.skeletonBlock}>
                                            <div className={styles.spinner} />
                                        </div>
                                    ) : entry.error || (entry.lessons && entry.lessons.length === 0) ? (
                                        <div className={styles.errorBlock}>Orario non disponibile</div>
                                    ) : entry.lessons ? (
                                        <BlockView lessons={entry.lessons} hideTeacher={mode === "teacher"} />
                                    ) : (
                                        <div className={styles.skeletonBlock}>
                                            <div className={styles.spinner} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
