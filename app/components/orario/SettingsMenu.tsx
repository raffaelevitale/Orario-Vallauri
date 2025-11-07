"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./SettingsMenu.module.css";
import { useThemeStore } from "@/lib/orario/stores/themeStore";
import { useScheduleStore } from "@/lib/orario/stores/scheduleStore";
import { useRouter } from "next/navigation";

interface SettingsMenuProps {
  onHelp: () => void;
}

export function SettingsMenu({ onHelp }: SettingsMenuProps) {
  const { theme, setTheme } = useThemeStore();
  const { viewType, setViewType, userMode, selectedEntity } =
    useScheduleStore();
  const { resetSetup } = useScheduleStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Chiudi al click fuori
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Forza tema light per docente MAGGIORE
  useEffect(() => {
    if (
      userMode === "teacher" &&
      selectedEntity?.toUpperCase().includes("MAGGIORE")
    ) {
      if (theme !== "light") {
        setTheme("light");
      }
    }
  }, [userMode, selectedEntity, theme, setTheme]);

  const cycleTheme = () => {
    const themes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const themeLabel =
    theme === "system" ? "Sistema" : theme === "light" ? "Chiaro" : "Scuro";

  return (
    <div className={styles.menuWrapper} ref={ref}>
      <button
        className={styles.iconBtn}
        title="Impostazioni"
        onClick={() => setOpen((o) => !o)}>
        ⚙️
      </button>
      {open && (
        <div className={styles.menu}>
          <div className={styles.groupLabel}>Aspetto</div>
          <button
            className={styles.item}
            onClick={cycleTheme}
            disabled={
              userMode === "teacher" &&
              selectedEntity?.toUpperCase().includes("MAGGIORE")
            }>
            <span className={styles.row}>🌓 Tema</span>
            <span className={styles.badge}>
              {userMode === "teacher" &&
              selectedEntity?.toUpperCase().includes("MAGGIORE")
                ? "Chiaro fisso"
                : themeLabel}
            </span>
          </button>
          <div className={styles.groupLabel}>Vista</div>
          <button
            className={styles.item}
            onClick={() =>
              setViewType(viewType === "list" ? "timeline" : "list")
            }>
            <span className={styles.row}>👁️ Modalità</span>
            <span className={styles.badge}>
              {viewType === "list" ? "Lista" : "Timeline"}
            </span>
          </button>
          <div className={styles.groupLabel}>Aiuto</div>
          <button
            className={styles.item}
            style={{ marginBottom: "10px" }}
            onClick={() => {
              onHelp();
              setOpen(false);
            }}>
            <span className={styles.row}>❓ Tutorial</span>
            <span className={styles.badge}>Apri</span>
          </button>
          <button
            className={styles.item}
            onClick={() => {
              router.push("/feedback");
              setOpen(false);
            }}>
            <span className={styles.row}>📝 Segnala idea/bug</span>
            <span className={styles.badge}>Feedback</span>
          </button>
          <div className={styles.groupLabel}>Modalità</div>
          <button
            className={styles.item}
            onClick={() => {
              resetSetup();
              router.push("/orario/setup");
            }}>
            <span className={styles.row}>🔁 Cambia modalità</span>
            <span className={styles.badge}>{userMode ?? "—"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
