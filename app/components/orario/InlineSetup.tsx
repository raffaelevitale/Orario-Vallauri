"use client";

import { useState, useEffect, useMemo } from "react";
import { useScheduleStore } from "@/lib/orario/stores/scheduleStore";
import { GraduationCap, BookOpen, Search, X, Check } from "lucide-react";
import {
    loadClassNames,
    loadTeacherNames,
    loadClassSchedule,
    loadTeacherSchedule,
} from "@/lib/orario/services/scheduleService";
import styles from "./InlineSetup.module.css";

type UserType = "student" | "teacher";

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
        if (userType === "student" && selectedYear !== "all") list = list.filter(c => c.charAt(0) === selectedYear);
        return list;
    }, [items, searchTerm, selectedYear, userType]);

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
                <p className={styles.prompt}>Scegli la tua classe o docente</p>

                {/* Toggle Studente / Docente */}
                <div className={styles.typeToggle}>
                    <button
                        className={`${styles.typeBtn} ${userType === "student" ? styles.typeBtnActive : ""}`}
                        onClick={() => setUserType("student")}
                    >
                        <GraduationCap size={16} />
                        Studente
                    </button>
                    <button
                        className={`${styles.typeBtn} ${userType === "teacher" ? styles.typeBtnActive : ""}`}
                        onClick={() => setUserType("teacher")}
                    >
                        <BookOpen size={16} />
                        Docente
                    </button>
                </div>

                {/* Year filter (students) */}
                {userType === "student" && years.length > 1 && (
                    <div className={styles.yearTabs}>
                        <button
                            onClick={() => setSelectedYear("all")}
                            className={`${styles.yearTab} ${selectedYear === "all" ? styles.yearTabActive : ""}`}
                        >
                            Tutti
                        </button>
                        {years.map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(selectedYear === year ? "all" : year)}
                                className={`${styles.yearTab} ${selectedYear === year ? styles.yearTabActive : ""}`}
                            >
                                {year}°
                            </button>
                        ))}
                    </div>
                )}

                {/* Search */}
                <div className={styles.searchWrapper}>
                    <Search size={15} className={styles.searchIcon} />
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

                {/* List */}
                <div className={styles.list}>
                    {loading ? (
                        <div className={styles.loadingRow}>
                            <div className={styles.spinner} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className={styles.emptyRow}>Nessun risultato</div>
                    ) : (
                        filtered.map(item => (
                            <button
                                key={item}
                                className={styles.listItem}
                                onClick={() => handleSelect(item)}
                                disabled={loadingSchedule !== null}
                            >
                                {loadingSchedule === item ? (
                                    <div className={styles.spinner} />
                                ) : loadingSchedule ? (
                                    <Check size={16} className={styles.itemCheck} style={{ opacity: 0.3 }} />
                                ) : (
                                    <Check size={16} className={styles.itemCheck} />
                                )}
                                <span className={styles.itemMain}>
                                    {userType === "student"
                                        ? <>
                                            <span className={styles.itemYear}>{item.charAt(0)}</span>
                                            <span>{item.slice(1)}</span>
                                        </>
                                        : <>
                                            <span className={styles.itemYear}>{item.split(" ")[0]}</span>
                                            <span className={styles.itemSub}>{item.split(" ").slice(1).join(" ")}</span>
                                        </>
                                    }
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
