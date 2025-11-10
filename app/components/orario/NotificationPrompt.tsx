"use client";

import { useState, useEffect } from "react";
import styles from "./NotificationPrompt.module.css";
import { requestNotificationPermission } from "@/lib/orario/utils/notifications";

export function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    // Mostra il prompt solo se il permesso è "default" (non ancora richiesto)
    // e se l'utente non ha già chiuso il prompt in questa sessione
    const hasClosedPrompt = sessionStorage.getItem("notificationPromptClosed");
    if (currentPermission === "default" && !hasClosedPrompt) {
      // Aspetta 3 secondi prima di mostrare il prompt
      const timer = setTimeout(() => {
        setShow(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    setShow(false);
    
    if (perm === 'granted') {
      // Mostra una notifica di test
      new Notification('🔔 Notifiche attivate!', {
        body: 'Riceverai promemoria per le tue lezioni',
        icon: '/icons/icon-192x192.png',
      });
    }
  };

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem("notificationPromptClosed", "true");
  };

  if (!show || permission !== "default") {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.prompt}>
        <button
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Chiudi">
          ✕
        </button>
        
        <div className={styles.icon}>🔔</div>
        
        <h3 className={styles.title}>Attiva le notifiche</h3>
        
        <p className={styles.message}>
          Ricevi promemoria prima dell'inizio delle lezioni e quando terminano.
        </p>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⏰</span>
            <span>Avviso 5 min prima</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✅</span>
            <span>Conferma fine lezione</span>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button className={styles.laterBtn} onClick={handleClose}>
            Non ora
          </button>
          <button className={styles.enableBtn} onClick={handleEnable}>
            Attiva
          </button>
        </div>
      </div>
    </div>
  );
}
