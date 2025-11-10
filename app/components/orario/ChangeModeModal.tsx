"use client";

import { useEffect } from "react";
import styles from "./ChangeModeModal.module.css";

interface ChangeModeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  currentMode?: string;
}

export function ChangeModeModal({
  isOpen,
  onConfirm,
  onCancel,
  currentMode,
}: ChangeModeModalProps) {
  // Chiudi con ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  // Previeni scroll del body quando la modale è aperta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description">
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            🔁 Cambia modalità
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label="Chiudi modale">
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <p id="modal-description" className={styles.message}>
            Sei sicuro di voler cambiare modalità?
          </p>
          {currentMode && (
            <p className={styles.currentMode}>
              <strong>Modalità attuale:</strong>{" "}
              <span className={styles.modeBadge}>{currentMode}</span>
            </p>
          )}
          <p className={styles.warning}>
            Verrai reindirizzato alla pagina di configurazione e dovrai
            selezionare nuovamente la tua modalità (studente o docente).
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Annulla
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
}
