'use client';

import { useEffect, useState } from 'react';
import styles from './InstallPrompt.module.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostra il prompt dopo 3 secondi
      setTimeout(() => {
        const isInstalled = localStorage.getItem('pwa-installed');
        const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
        
        if (!isInstalled && !isDismissed) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Controlla se l'app è già installata
    if (window.matchMedia('(display-mode: standalone)').matches) {
      localStorage.setItem('pwa-installed', 'true');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.prompt}>
        <button className={styles.closeBtn} onClick={handleDismiss} aria-label="Chiudi">
          ✕
        </button>
        
        <div className={styles.icon}>📱</div>
        
        <h3 className={styles.title}>Installa Orario Vallauri</h3>
        <p className={styles.description}>
          Aggiungi l'app alla schermata home per un accesso rapido e un'esperienza migliore
        </p>
        
        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <span className={styles.benefitIcon}>⚡</span>
            <span>Accesso rapido</span>
          </div>
          <div className={styles.benefit}>
            <span className={styles.benefitIcon}>📶</span>
            <span>Funziona offline</span>
          </div>
          <div className={styles.benefit}>
            <span className={styles.benefitIcon}>🔔</span>
            <span>Notifiche</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.installBtn} onClick={handleInstall}>
            Installa App
          </button>
          <button className={styles.laterBtn} onClick={handleDismiss}>
            Forse dopo
          </button>
        </div>
      </div>
    </div>
  );
}
