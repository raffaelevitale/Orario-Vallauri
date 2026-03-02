"use client";

import { useState, useEffect, useMemo } from "react";
import { useScheduleStore } from "@/lib/orario/stores/scheduleStore";
import { GraduationCap, BookOpen, Search, X, Loader2 } from "lucide-react";
import {
    loadClassNames,
    loadTeacherNames,
    loadClassSchedule,
    loadTeacherSchedule,
} from "@/lib/orario/services/scheduleService";
import styles from "./InlineSetup.module.css";

type UserType = "student" | "teacher";

function getSector(className: string): string {
    const parts = className.split(" ");
    return parts.length > 1 ? parts.slice(1).join(" ") : "";
}

function getSection(className: string): string {
    return className.split(" ")[0].slice(1);
}

/** Raggruppa classi per settore, es. { "INF": ["1A INF", "1B INF", …], … } */
function groupBySector(classes: string[]): { sector: string; items: string[] }[] {
    const map = new Map<string, string[]>();
    for (const c of classes) {
        const s = getSector(c);
        if (!map.has(s)) map.set(s, []);
        map.get(s)!.push(c);
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([sector, items]) => ({ sector, items }));
}

/** Raggruppa docenti per iniziale */
function groupByLetter(teachers: string[]): { letter: string; items: string[] }[] {
    const map = new Map<string, string[]>();
    for (const t of teachers) {
        const letter = t.charAt(0).toUpperCase();
        if (!map.has(letter)) map.set(letter, []);
        map.get(letter)!.push(t);
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([letter, items]) => ({ letter, items }));
}

export function InlineSetup() {
    const { setUserMode, setSchedule, completeSetup } = useScheduleStore();

    const [userType, setUserType] = useState<UserType>("student");
    const [items, setItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState<string>("all");
    const [loadingSchedule, setLoadingSchedule] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const names = userType === "student"
                ? await loadClassNames()
                : await loadTeacherNames().then(n => [...n].sort());
            setItems(names);
            setLoading(false);
        };
        load();
        setSearchTerm("");
        setSelectedYear("all");
    }, [userType]);

    const years = useMemo(
        () => userType === "student" ? Array.from(new Set(items.map(c => c.charAt(0)))).sort() : [],
        [items, userType]
    );

    const filtered = useMemo(() => {
        let list = items;
        if (searchTerm) list = list.filter(n => n.toLowerCase().includes(searchTerm.toLowerCase()));
        if (userType === "student" && selectedYear !== "all") {
            list = list.filter(c => c.charAt(0) === selectedYear);
        }
        return list;
    }, [items, searchTerm, selectedYear, userType]);

    const classGroups = useMemo(() => groupBySector(filtered), [filtered]);
    const teacherGroups = useMemo(() => groupByLetter(filtered), [filtered]);

    const handleSelect = async (entity: string) => {
        setLoadingSchedule(entity);
        try {
            const lessons = userType === "student"
                ? await loadClassSchedule(entity)
                : await loadTeacherSchedule(entity);
            setUserMode(userType === "student" ? "student" : "teacher", entity);
            setSchedule({ lessons, className: entity });
            completeSetup();
        } finally {
            setLoadingSchedule(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                {/* Toggle Studente / Docente */}
                <div className={styles.typeToggle}>
                    <div className={styles.toggleTrack}>
                        <div
                            className={styles.toggleThumb}
                            style={{ transform: userType === "teacher" ? "translateX(100%)" : "translateX(0)" }}
                        />
                        <button
                            className={`${styles.toggleOption} ${userType === "student" ? styles.toggleOptionActive : ""}`}
                            onClick={() => setUserType("student")}
                        >
                            <GraduationCap size={15} />
                            Studente
                        </button>
                        <button
                            className={`${styles.toggleOption} ${userType === "teacher" ? styles.toggleOptionActive : ""}`}
                            onClick={() => setUserType("teacher")}
                        >
                            <BookOpen size={15} />
                            Docente
                        </button>
                    </div>
                </div>

                {/* Year pills (students only) */}
                {userType === "student" && years.length > 1 && (
                    <div className={styles.yearBar}>
                        <button
                            onClick={() => setSelectedYear("all")}
                            className={`${styles.yearPill} ${selectedYear === "all" ? styles.yearPillActive : ""}`}
                        >
                            Tutti
                        </button>
                        {years.map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(selectedYear === year ? "all" : year)}
                                className={`${styles.yearPill} ${selectedYear === year ? styles.yearPillActive : ""}`}
                            >
                                {year}°
                            </button>
                        ))}
                    </div>
                )}

                {/* Search */}
                <div className={styles.searchWrapper}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={userType === "student" ? "Cerca classe…" : "Cerca docente…"}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                        autoComplete="off"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className={styles.searchClear}>
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className={styles.loadingRow}><div className={styles.spinner} /></div>
                ) : filtered.length === 0 ? (
                    <div className={styles.emptyRow}>Nessun risultato</div>
                ) : userType === "student" ? (
                    /* ─── Classi raggruppate per settore ─── */
                    <div className={styles.sectorList}>
                        {classGroups.map(({ sector, items: classes }) => (
                            <div key={sector} className={styles.sectorGroup}>
                                <div className={styles.sectorHeader}>
                                    <span className={styles.sectorName}>{sector}</span>
                                    <span className={styles.sectorCount}>{classes.length}</span>
                                </div>
                                <div className={styles.classPills}>
                                    {classes.map(item => {
                                        const isLoading = loadingSchedule === item;
                                        return (
                                            <button
                                                key={item}
                                                className={`${styles.classPill} ${isLoading ? styles.classPillLoading : ""}`}
                                                onClick={() => handleSelect(item)}
                                                disabled={loadingSchedule !== null}
                                            >
                                                {isLoading ? (
                                                    <Loader2 size={14} className={styles.spinIcon} />
                                                ) : (
                                                    <>
                                                        <span className={styles.pillYear}>{item.charAt(0)}</span>
                                                        <span className={styles.pillSection}>{getSection(item)}</span>
                                                    </>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ─── Docenti raggruppati per lettera ─── */
                    <div className={styles.teacherList}>
                        {teacherGroups.map(({ letter, items: teachers }) => (
                            <div key={letter} className={styles.letterGroup}>
                                <div className={styles.letterHeader}>{letter}</div>
                                <div className={styles.letterItems}>
                                    {teachers.map(item => {
                                        const isLoading = loadingSchedule === item;
                                        return (
                                            <button
                                                key={item}
                                                className={`${styles.teacherItem} ${isLoading ? styles.teacherItemLoading : ""}`}
                                                onClick={() => handleSelect(item)}
                                                disabled={loadingSchedule !== null}
                                            >
                                                <span className={styles.teacherAvatar}>{item.charAt(0)}</span>
                                                <span className={styles.teacherName}>{item}</span>
                                                {isLoading && <Loader2 size={14} className={styles.spinIcon} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
