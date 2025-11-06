'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScheduleStore } from '@/lib/orario/stores/scheduleStore';
import {
  loadClassNames,
  loadTeacherNames,
  loadClassSchedule,
  loadTeacherSchedule,
} from '@/lib/orario/services/scheduleService';
import { motion } from 'framer-motion';
import styles from './setup.module.css';

type Mode = 'student' | 'teacher';

export default function SetupPage() {
  const router = useRouter();
  const { setSchedule, setUserMode, completeSetup, resetToSample } = useScheduleStore();

  const [mode, setMode] = useState<Mode | null>(null);
  const [classes, setClasses] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (mode === 'student') {
        const classList = await loadClassNames();
        setClasses(classList);
      } else if (mode === 'teacher') {
        const teacherList = await loadTeacherNames();
        setTeachers(teacherList);
      }
      setLoading(false);
    };

    if (mode) {
      loadData();
    }
  }, [mode]);

  const handleContinue = async () => {
    if (!selectedEntity || !mode) return;

    setLoading(true);

    try {
      let lessons;
      if (mode === 'student') {
        lessons = await loadClassSchedule(selectedEntity);
      } else {
        lessons = await loadTeacherSchedule(selectedEntity);
      }

      setSchedule({
        lessons,
        className: mode === 'student' ? selectedEntity : undefined,
        teacherName: mode === 'teacher' ? selectedEntity : undefined,
      });

      setUserMode(mode, selectedEntity);
      completeSetup();
      router.push('/orario');
    } catch (error) {
      console.error('Error loading schedule:', error);
      alert('Errore nel caricamento dell\'orario. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSample = () => {
    if (loading) return;
    setLoading(true);
    try {
      resetToSample();
      // Allinea lo stato utente come studente demo
      setUserMode('student', 'Demo Class');
      completeSetup();
      router.push('/orario');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (className: string) => {
    if (loading) return;
    setLoading(true);
    
    try {
      const lessons = await loadClassSchedule(className);
      setSchedule({
        lessons,
        className,
        teacherName: undefined,
      });
      setUserMode('student', className);
      completeSetup();
      router.push('/orario');
    } catch (error) {
      console.error('Error loading schedule:', error);
      alert('Errore nel caricamento dell\'orario. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const filteredList =
    mode === 'student'
      ? classes.filter((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
      : teachers.filter((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.card}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>
            Orario Vallauri
          </h1>
          <p className={styles.subtitle}>
            Configura il tuo orario personalizzato
          </p>
        </div>

        {!mode && (
          <div className={styles.modeSelection}>
            <p className={styles.modePrompt}>
              Classi disponibili
            </p>

            <button
              onClick={() => handleQuickSelect('5A INF')}
              className={styles.modeButton}
              disabled={loading}
            >
              <span className={styles.modeIcon}>🎓</span>
              <span>5A INF</span>
            </button>

            <button
              onClick={() => handleQuickSelect('2C MEC')}
              className={`${styles.modeButton} ${styles.teacher}`}
              disabled={loading}
            >
              <span className={styles.modeIcon}>�</span>
              <span>2C MEC</span>
            </button>

            <button
              onClick={() => setMode('student')}
              className={styles.sampleButton}
              aria-label="Cerca altre classi"
            >
              Cerca altre classi
            </button>

            <button
              onClick={() => setMode('teacher')}
              className={styles.sampleButton}
              aria-label="Visualizza orario docente"
            >
              Sono un docente
            </button>
          </div>
        )}

        {mode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.entitySelection}
          >
            <button
              onClick={() => {
                setMode(null);
                setSelectedEntity('');
                setSearchTerm('');
              }}
              className={styles.backButton}
            >
              ← Indietro
            </button>

            <div>
              <label className={styles.label}>
                {mode === 'student' ? 'Seleziona la tua classe' : 'Seleziona il tuo nome'}
              </label>

              <input
                type="text"
                placeholder="Cerca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />

              <div className={styles.listContainer}>
                {loading ? (
                  <div className={styles.emptyState}>
                    <div className={styles.loadingSpinner}></div>
                    Caricamento...
                  </div>
                ) : filteredList.length === 0 ? (
                  <div className={styles.emptyState}>
                    Nessun risultato trovato
                  </div>
                ) : (
                  filteredList.map((item) => (
                    <button
                      key={item}
                      onClick={() => setSelectedEntity(item)}
                      className={`${styles.listItem} ${selectedEntity === item ? styles.selected : ''}`}
                    >
                      {item}
                    </button>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedEntity || loading}
              className={styles.continueButton}
            >
              {loading ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  Caricamento...
                </>
              ) : (
                'Continua'
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
