'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './OnboardingTour.module.css';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  tip?: string;
}

const steps: OnboardingStep[] = [
  {
    title: 'Benvenuto in Orario Vallauri! 👋',
    description: 'La tua app per consultare gli orari scolastici dell\'IIS G. Vallauri in modo semplice e veloce.',
    icon: '🎓',
    tip: 'Installala sul tuo telefono per un accesso ancora più rapido!'
  },
  {
    title: 'Scegli la tua modalità 🔍',
    description: 'Puoi visualizzare l\'orario come studente (per classi) o come docente (per professori).',
    icon: '👥',
    tip: 'Puoi cambiare modalità in qualsiasi momento dal menu impostazioni (icona ⚙️)'
  },
  {
    title: 'Naviga tra i giorni 📅',
    description: 'Scorri tra i giorni della settimana usando i tab in alto. Il giorno corrente è evidenziato.',
    icon: '📆',
    tip: 'Usa il pulsante "Oggi" per tornare rapidamente al giorno corrente'
  },
  {
    title: 'Due modalità di visualizzazione ⏱️',
    description: 'Passa dalla vista Lista alla Timeline per vedere l\'orario in formato grafico con la linea del tempo.',
    icon: '📊',
    tip: 'Cambia vista dal menu impostazioni → "👁️ Modalità"'
  },
  {
    title: 'Lezione corrente in evidenza ✨',
    description: 'La lezione in corso è evidenziata in verde con un badge "IN CORSO" e il tempo rimanente.',
    icon: '⏳',
    tip: 'Apri l\'app durante le lezioni per vedere quanto manca alla fine!'
  },
  {
    title: 'Notifiche promemoria 🔔',
    description: 'Attiva le notifiche per ricevere promemoria 5 minuti prima di ogni lezione e alla fine.',
    icon: '🔔',
    tip: 'Ti verrà chiesto di attivare le notifiche. Puoi sempre cambiarle dalle impostazioni del browser!'
  },
  {
    title: 'Cambio modalità semplificato 🔁',
    description: 'Vuoi passare da studente a docente (o viceversa)? Usa l\'opzione "🔁 Cambia modalità" nel menu impostazioni.',
    icon: '🔄',
    tip: 'Una finestra di conferma ti guiderà nel processo per evitare cambi accidentali'
  },
  {
    title: 'Installazione PWA 📱',
    description: 'Questa è una Progressive Web App! Installala sul tuo dispositivo per usarla come un\'app nativa, anche offline.',
    icon: '💾',
    tip: 'Su iOS: Safari → Condividi → "Aggiungi a Home". Su Android: Menu → "Installa app"'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const step = steps[currentStep];

  return (
    <div className={styles.overlay}>
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.progressBar}>
            {steps.map((_, index) => (
              <div
                key={index}
                className={`${styles.progressDot} ${
                  index <= currentStep ? styles.active : ''
                }`}
              />
            ))}
          </div>
          <button onClick={handleSkip} className={styles.skipBtn}>
            Salta
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 300 * direction, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300 * direction, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={styles.content}
          >
            <div className={styles.icon}>{step.icon}</div>
            <h2 className={styles.title}>{step.title}</h2>
            <p className={styles.description}>{step.description}</p>
            {step.tip && (
              <div className={styles.tip}>
                <span className={styles.tipIcon}>💡</span>
                <span className={styles.tipText}>{step.tip}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={styles.prevBtn}
          >
            ← Indietro
          </button>
          <div className={styles.stepCounter}>
            {currentStep + 1} / {steps.length}
          </div>
          <button onClick={handleNext} className={styles.nextBtn}>
            {currentStep === steps.length - 1 ? 'Inizia! 🚀' : 'Avanti →'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
