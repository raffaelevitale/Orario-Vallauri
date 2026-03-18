"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./SettingsMenu.module.css";
import { useThemeStore } from "@/lib/orario/stores/themeStore";
import { useScheduleStore } from "@/lib/orario/stores/scheduleStore";
import { requestNotificationPermission } from "@/lib/orario/utils/notifications";
import { useRouter } from "next/navigation";
import {
  Settings,
  Moon,
  Sun,
  Bell,
  RefreshCw,
  FileText,
  MessageCircle,
  Save,
  Trash2,
} from "lucide-react";

interface SettingsMenuProps { }
interface TelegramStatus {
  type: "success" | "error" | "info";
  message: string;
}

export function SettingsMenu({ }: SettingsMenuProps = {}) {
  const { theme, setTheme } = useThemeStore();
  const { userMode, selectedEntity } = useScheduleStore();
  const { hardReset } = useScheduleStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [telegramSaving, setTelegramSaving] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);

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

  useEffect(() => {
    const savedChatId = localStorage.getItem("orario-telegram-chat-id")?.trim();
    if (!savedChatId) return;

    setTelegramChatId(savedChatId);

    (async () => {
      try {
        const response = await fetch(
          `/api/telegram/preferences?chatId=${encodeURIComponent(savedChatId)}`,
          { cache: "no-store" }
        );
        if (!response.ok) return;
        const data = await response.json();
        if (data?.preference) {
          setTelegramEnabled(Boolean(data.preference.notificationsEnabled));
        }
      } catch {
        // Ignora errori di rete: il form resta comunque utilizzabile.
      }
    })();
  }, []);

  const cycleTheme = () => {
    const themes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const saveTelegramSettings = async () => {
    setTelegramStatus(null);

    const chatId = telegramChatId.trim();
    if (!chatId) {
      setTelegramStatus({
        type: "error",
        message: "Inserisci un chat_id valido.",
      });
      return;
    }

    if (!/^-?\d{4,20}$/.test(chatId)) {
      setTelegramStatus({
        type: "error",
        message: "Formato chat_id non valido.",
      });
      return;
    }

    if (userMode !== "student" && userMode !== "teacher") {
      setTelegramStatus({
        type: "error",
        message: "Seleziona prima modalità Studente o Docente.",
      });
      return;
    }

    if (!selectedEntity) {
      setTelegramStatus({
        type: "error",
        message: "Seleziona prima una classe o un docente.",
      });
      return;
    }

    setTelegramSaving(true);
    try {
      const response = await fetch("/api/telegram/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          entityType: userMode,
          entityName: selectedEntity,
          notificationsEnabled: telegramEnabled,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? "Errore nel salvataggio configurazione Telegram");
      }

      localStorage.setItem("orario-telegram-chat-id", chatId);
      setTelegramStatus({
        type: "success",
        message: "Configurazione Telegram salvata correttamente.",
      });
    } catch (error) {
      setTelegramStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Errore imprevisto durante il salvataggio",
      });
    } finally {
      setTelegramSaving(false);
    }
  };

  const disconnectTelegram = async () => {
    setTelegramStatus(null);

    const chatId = telegramChatId.trim();
    if (!chatId) {
      setTelegramStatus({
        type: "info",
        message: "Nessuna configurazione da rimuovere.",
      });
      return;
    }

    setTelegramSaving(true);
    try {
      await fetch(`/api/telegram/preferences?chatId=${encodeURIComponent(chatId)}`, {
        method: "DELETE",
      });
      localStorage.removeItem("orario-telegram-chat-id");
      setTelegramEnabled(true);
      setTelegramStatus({
        type: "success",
        message: "Configurazione Telegram rimossa.",
      });
    } catch (error) {
      setTelegramStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Errore durante la rimozione",
      });
    } finally {
      setTelegramSaving(false);
    }
  };

  const themeLabel =
    theme === "system" ? "Sistema" : theme === "light" ? "Chiaro" : "Scuro";

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
          <div className={styles.groupLabel}>Telegram Bot</div>
          <div className={styles.telegramCard}>
            <p className={styles.telegramHint}>
              Apri il bot su Telegram e invia <code>/start</code> per leggere il tuo chat_id.
            </p>
            <label htmlFor="telegram-chat-id" className={styles.telegramLabel}>
              Chat ID
            </label>
            <input
              id="telegram-chat-id"
              type="text"
              inputMode="numeric"
              className={styles.telegramInput}
              value={telegramChatId}
              onChange={(event) => setTelegramChatId(event.target.value)}
              placeholder="Es. 123456789"
              autoComplete="off"
            />
            <div className={styles.telegramTarget}>
              <MessageCircle size={14} />
              {userMode === "student" || userMode === "teacher" ? (
                <span>
                  Collegato a{" "}
                  <strong>
                    {userMode === "student" ? "classe" : "docente"} {selectedEntity ?? "(non selezionato)"}
                  </strong>
                </span>
              ) : (
                <span>Seleziona prima modalità ed entità nella schermata orario.</span>
              )}
            </div>

            <label className={styles.telegramToggle}>
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(event) => setTelegramEnabled(event.target.checked)}
              />
              <span>Abilita promemoria automatici</span>
            </label>

            <div className={styles.telegramActions}>
              <button
                type="button"
                className={styles.telegramSaveButton}
                onClick={saveTelegramSettings}
                disabled={telegramSaving}
              >
                <Save size={14} />
                {telegramSaving ? "Salvataggio..." : "Salva configurazione"}
              </button>
              <button
                type="button"
                className={styles.telegramSecondaryButton}
                onClick={disconnectTelegram}
                disabled={telegramSaving}
              >
                <Trash2 size={14} />
                Rimuovi
              </button>
            </div>

            {telegramStatus && (
              <p
                className={`${styles.telegramStatus} ${
                  telegramStatus.type === "success"
                    ? styles.telegramStatusSuccess
                    : telegramStatus.type === "error"
                      ? styles.telegramStatusError
                      : styles.telegramStatusInfo
                }`}
              >
                {telegramStatus.message}
              </p>
            )}
          </div>
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
              // Riporta alla home
              router.push('/orario');
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
        </div>
      )}
    </div>
  );
}
