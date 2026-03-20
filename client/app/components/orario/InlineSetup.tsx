"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useScheduleStore } from "@/lib/orario/stores/scheduleStore";
import { Loader2 } from "lucide-react";
import {
    loadClassNames,
    loadTeacherNames,
    loadClassSchedule,
    loadTeacherSchedule,
} from "@/lib/orario/services/scheduleService";
import styles from "./InlineSetup.module.css";

type MatchResult = { value: string; mode: "student" | "teacher" } | null;

function normalizeKey(value: string) {
    return value.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
}

export function InlineSetup() {
    const { setUserMode, setSchedule, completeSetup } = useScheduleStore();
    const [classes, setClasses] = useState<string[]>([]);
    const [teachers, setTeachers] = useState<string[]>([]);
    const [query, setQuery] = useState("");
    const [loadingNames, setLoadingNames] = useState(true);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;
        const load = async () => {
            setLoadingNames(true);
            try {
                const [classList, teacherList] = await Promise.all([
                    loadClassNames(),
                    loadTeacherNames().then((n) => [...n].sort()),
                ]);
                if (!isActive) return;
                setClasses(classList);
                setTeachers(teacherList);
            } catch {
                if (!isActive) return;
                setClasses([]);
                setTeachers([]);
            } finally {
                if (isActive) setLoadingNames(false);
            }
        };
        load();
        return () => {
            isActive = false;
        };
    }, []);

    const suggestions = useMemo(() => {
        const trimmed = query.trim();
        if (trimmed.length < 2) return [];
        const normalized = trimmed.toLowerCase();
        const all = [...classes, ...teachers];
        return all
            .filter((item) => item.toLowerCase().includes(normalized))
            .slice(0, 12);
    }, [query, classes, teachers]);

    const findMatch = (value: string): MatchResult => {
        const normalized = normalizeKey(value);
        if (!normalized) return null;

        const matchFromList = (list: string[]) => {
            const exact = list.find((item) => normalizeKey(item) === normalized);
            if (exact) return exact;
            const partial = list.filter((item) =>
                normalizeKey(item).includes(normalized)
            );
            return partial.length === 1 ? partial[0] : null;
        };

        const preferClass = /^\d/.test(value.trim());
        const classMatch = matchFromList(classes);
        const teacherMatch = matchFromList(teachers);

        if (preferClass) {
            if (classMatch) return { value: classMatch, mode: "student" };
            if (teacherMatch) return { value: teacherMatch, mode: "teacher" };
        } else {
            if (teacherMatch) return { value: teacherMatch, mode: "teacher" };
            if (classMatch) return { value: classMatch, mode: "student" };
        }
        return null;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        const trimmed = query.trim();
        if (!trimmed) {
            setError("Inserisci una classe o un docente.");
            return;
        }
        const match = findMatch(trimmed);
        if (!match) {
            setError("Nessuna corrispondenza. Usa il nome completo o scegli dai suggerimenti.");
            return;
        }
        setLoadingSchedule(true);
        try {
            const lessons =
                match.mode === "student"
                    ? await loadClassSchedule(match.value)
                    : await loadTeacherSchedule(match.value);
            setUserMode(match.mode, match.value);
            setSchedule({ lessons, className: match.value });
            completeSetup();
        } finally {
            setLoadingSchedule(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Trova il tuo orario</h2>
                    <p className={styles.subtitle}>
                        Scrivi la tua classe se sei studente o il tuo nome se sei docente.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.label} htmlFor="setup-input">
                        Classe o docente
                    </label>
                    <input
                        id="setup-input"
                        type="text"
                        className={styles.input}
                        placeholder="Es. 3A INF oppure Rossi Mario"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            if (error) setError(null);
                        }}
                        list="setup-suggestions"
                        autoComplete="off"
                        disabled={loadingNames || loadingSchedule}
                    />
                    <datalist id="setup-suggestions">
                        {suggestions.map((item) => (
                            <option key={item} value={item} />
                        ))}
                    </datalist>

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loadingNames || loadingSchedule}
                    >
                        {loadingSchedule ? (
                            <>
                                <Loader2 size={16} className={styles.spinIcon} />
                                Caricamento…
                            </>
                        ) : (
                            "Mostra orario"
                        )}
                    </button>
                </form>

                <div className={styles.helperRow}>
                    <span className={styles.helperText}>Esempi:</span>
                    <span className={styles.helperValue}>3A INF · Rossi Mario</span>
                </div>

                {loadingNames && (
                    <div className={styles.loadingHint}>
                        Sto preparando l’elenco di classi e docenti…
                    </div>
                )}
            </div>
        </div>
    );
}
