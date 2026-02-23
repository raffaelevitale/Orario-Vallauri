"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./SettingsMenu.module.css";
import { useThemeStore } from "@/lib/orario/stores/themeStore";
import { useScheduleStore } from "@/lib/orario/stores/scheduleStore";
import { requestNotificationPermission } from "@/lib/orario/utils/notifications";
import { useRouter } from "next/navigation";
import { ChangeModeModal } from "./ChangeModeModal";
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Eye,
  RefreshCw,
  HelpCircle,
  FileText,
  Repeat
} from "lucide-react";

interface SettingsMenuProps {
  onHelp: () => void;
}

export function SettingsMenu({ onHelp }: SettingsMenuProps) {
  const { theme, setTheme } = useThemeStore();
  const { viewType, setViewType, userMode, selectedEntity } =
    useScheduleStore();
  const { resetSetup, hardReset } = useScheduleStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showChangeModeModal, setShowChangeModeModal] = useState(false);
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

  const handleChangeModeClick = () => {
    setOpen(false);
    setShowChangeModeModal(true);
  };

  const handleConfirmChangeMode = () => {
    setShowChangeModeModal(false);
    resetSetup();
    router.push("/orario/setup");
  };

  const handleCancelChangeMode = () => {
    setShowChangeModeModal(false);
  };

  return (
    <div className={styles.menuWrapper} ref={ref}>
      <button
        className={styles.iconBtn}
        title="Impostazioni"
        aria-haspopup={true}
        aria-expanded={open}
        aria-label="Apri impostazioni"
        onClick={() => setOpen((o) => !o)}>
        <Settings size={22} />
      </button>
      {open && (
        <div className={styles.menu} role="menu" aria-label="Impostazioni">
          <div className={styles.groupLabel}>Aspetto</div>
          <button
            className={styles.item}
            onClick={cycleTheme}
            role="menuitem"
            aria-label={`Tema: ${themeLabel}`}
            disabled={
              userMode === "teacher" &&
              selectedEntity?.toUpperCase().includes("MAGGIORE")
            }>
            <span className={styles.row}>
              {theme === 'light' ? <Sun size={18} style={{ marginRight: 8 }} /> : <Moon size={18} style={{ marginRight: 8 }} />}
              Tema
            </span>
            <span className={styles.badge}>
              {userMode === "teacher" &&
                selectedEntity?.toUpperCase().includes("MAGGIORE")
                ? "Chiaro fisso"
                : themeLabel}
            </span>
          </button>
          <button
            className={styles.item}
            onClick={async () => {
              // Debug: mostra lo stato SW e permessi
              if (!('Notification' in window)) {
                alert("Il browser non supporta le notifiche.");
                setOpen(false);
                return;
              }
              if (window.location.protocol !== "https:") {
                alert("Le notifiche funzionano solo su HTTPS.");
                setOpen(false);
                return;
              }
              // Prova a registrare il service worker se non già registrato
              if ('serviceWorker' in navigator) {
                try {
                  const reg = await navigator.serviceWorker.register('/sw.js');
                  console.log("Service Worker registrato:", reg);
                } catch (err) {
                  console.warn("Service Worker non registrato:", err);
                }
              }
              const perm = await requestNotificationPermission();
              if (perm === "granted") {
                try {
                  new Notification("🔔 Test Notifica", {
                    body: "Le notifiche funzionano correttamente!",
                    icon: "/icons/icon-192x192.png",
                    badge: "/icons/icon-192x192.png",
                  });
                } catch (err) {
                  alert("Errore nella creazione della notifica: " + err);
                }
              } else if (perm === "denied") {
                alert("Permesso per le notifiche negato. Controlla le impostazioni del browser.");
              } else {
                alert("Permesso per le notifiche non concesso.");
              }
              setOpen(false);
            }}
            role="menuitem"
            aria-label="Test Notifica">
            <span className={styles.row}>
              <Bell size={18} style={{ marginRight: 8 }} />
              Test Notifica
            </span>
            <span className={styles.badge}>Prova</span>
          </button>
          <div className={styles.groupLabel}>Vista</div>
          <button
            className={styles.item}
            onClick={() =>
              setViewType(viewType === "list" ? "block" : "list")
            }
            role="menuitem"
            aria-label={`Cambia vista: ${viewType === "list" ? "Lista" : "Blocchi"}`}>
            <span className={styles.row}>
              <Eye size={18} style={{ marginRight: 8 }} />
              Modalità
            </span>
            <span className={styles.badge}>
              {viewType === "list" ? "Lista" : "Blocchi"}
            </span>
          </button>
          <div className={styles.groupLabel}>Aiuto</div>
          <button
            className={styles.item}
            style={{ marginBottom: "10px" }}
            onClick={async () => {
              setOpen(false);
              // Clear service workers
              if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(r => r.unregister()));
              }
              // Clear all caches
              if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
              }
              // Clear storage
              localStorage.clear();
              sessionStorage.clear();
              // Hard reset dello store (cancella anche lo schedule)
              hardReset();
              // Redirect the user to the setup page to choose a teacher or class.
              router.push('/orario/setup');
            }}
            role="menuitem"
            aria-label="Aggiorna pagina">
            <span className={styles.row}>
              <RefreshCw size={18} style={{ marginRight: 8 }} />
              Aggiorna pagina
            </span>
            <span className={styles.badge}>Aggiorna</span>
          </button>
          <button
            className={styles.item}
            style={{ marginBottom: "10px" }}
            onClick={() => {
              onHelp();
              setOpen(false);
            }}
            role="menuitem"
            aria-label="Apri tutorial">
            <span className={styles.row}>
              <HelpCircle size={18} style={{ marginRight: 8 }} />
              Tutorial
            </span>
            <span className={styles.badge}>Apri</span>
          </button>
          <button
            className={styles.item}
            onClick={() => {
              router.push("/feedback");
              setOpen(false);
            }}
            role="menuitem"
            aria-label="Segnala idea o bug">
            <span className={styles.row}>
              <FileText size={18} style={{ marginRight: 8 }} />
              Segnala idea/bug
            </span>
            <span className={styles.badge}>Feedback</span>
          </button>
          <div className={styles.groupLabel}>Modalità</div>
          <button
            className={styles.item}
            onClick={handleChangeModeClick}
            role="menuitem"
            aria-label="Cambia modalità">
            <span className={styles.row}>
              <Repeat size={18} style={{ marginRight: 8 }} />
              Cambia modalità
            </span>
            <span className={styles.badge}>{userMode === "student" ? "Studente" : "Docente"}</span>
          </button>
        </div>
      )}
      <ChangeModeModal
        isOpen={showChangeModeModal}
        onConfirm={handleConfirmChangeMode}
        onCancel={handleCancelChangeMode}
        currentMode={userMode === "student" ? "studente" : userMode === "teacher" ? "docente" : undefined}
      />
    </div>
  );
}
