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
  const { hasCompletedSetup, setSchedule, setUserMode, completeSetup } = useScheduleStore();

  const [mode, setMode] = useState<Mode | null>(null);
  const [classes, setClasses] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  useEffect(() => {
    if (hasCompletedSetup)
      router.push('/orario')
  }, [hasCompletedSetup])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (mode === 'student') {
        const classList = await loadClassNames();
        setClasses(classList);
      } else if (mode === 'teacher') {
        const teacherList = await loadTeacherNames();
        teacherList.sort()
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

  // Estrai anni e settori unici dalle classi
  const years = Array.from(new Set(classes.map((c) => c.charAt(0)))).sort();
  const sectors = Array.from(new Set(classes.map((c) => c.split(' ').slice(1).join(' ')))).sort();

  const filteredList =
    mode === 'student'
      ? classes
          .filter((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
          .filter((c) => selectedYear === 'all' || c.charAt(0) === selectedYear)
          .filter((c) => !selectedSector || c.split(' ').slice(1).join(' ') === selectedSector)
      : teachers.filter((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

  // Raggruppa le classi filtrate per anno
  const groupedByYear: Record<string, string[]> = {};
  if (mode === 'student') {
    for (const cls of filteredList) {
      const year = cls.charAt(0);
      if (!groupedByYear[year]) groupedByYear[year] = [];
      groupedByYear[year].push(cls);
    }
  }

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.card}
      >
        <div className={styles.header}>
          <img
            src="/logo.png"
            alt="Logo Vallauri"
            className={styles.logo}
          />
          <h1 className={styles.title}>
            Orario Vallauri
          </h1>
          <p className={styles.subtitle}>
            Configura il tuo orario personalizzato
          </p>
        </div>

        {!mode && (
          <div className={styles.modeSelection}>
            <p className={styles.modePrompt}>Scegli la modalità</p>

            <button
              onClick={() => setMode('student')}
              className={styles.modeButton}
              disabled={loading}
            >
              <span className={styles.modeIcon}>🎓</span>
              <span>Studente</span>
            </button>

            <button
              onClick={() => setMode('teacher')}
              className={`${styles.modeButton} ${styles.teacher}`}
              disabled={loading}
            >
              <span className={styles.modeIcon}>👨‍🏫</span>
              <span>Docente</span>
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
                setSelectedYear('all');
                setSelectedSector(null);
              }}
              className={styles.backButton}
            >
              ← Indietro
            </button>

            <div>
                <label className={styles.label}>
                  {mode === 'student' ? 'Seleziona la tua classe' : 'Seleziona il tuo nome'}
                </label>

                {mode === 'student' && (
                  <div className={styles.filtersContainer}>
                    <div className={styles.yearTabs}>
                      <button
                        onClick={() => setSelectedYear('all')}
                        className={`${styles.yearTab} ${selectedYear === 'all' ? styles.yearTabActive : ''}`}
                      >
                        Tutti
                      </button>
                      {years.map((year) => (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(selectedYear === year ? 'all' : year)}
                          className={`${styles.yearTab} ${selectedYear === year ? styles.yearTabActive : ''}`}
                        >
                          {year}°
                        </button>
                      ))}
                    </div>
                    <div className={styles.sectorRow}>
                      {sectors.map((sector) => (
                        <button
                          key={sector}
                          onClick={() => setSelectedSector(selectedSector === sector ? null : sector)}
                          className={`${styles.sectorChip} ${selectedSector === sector ? styles.sectorChipActive : ''}`}
                        >
                          {sector}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <input
                    type="text"
                    placeholder={mode === 'student' ? 'Cerca classe...' : 'Cerca docente...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className={styles.searchClear}
                      aria-label="Cancella ricerca"
                    >
                      ✕
                    </button>
                  )}
                </div>

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
                  ) : mode === 'student' ? (
                    Object.keys(groupedByYear).sort().map((year) => (
                      <div key={year}>
                        {selectedYear === 'all' && (
                          <div className={styles.yearDivider}>
                            <span className={styles.yearDividerText}>{year}° anno</span>
                            <span className={styles.yearDividerCount}>{groupedByYear[year].length}</span>
                          </div>
                        )}
                        {groupedByYear[year].map((item) => {
                          const section = item.split(' ')[0].substring(1);
                          const sector = item.split(' ').slice(1).join(' ');
                          return (
                            <button
                              key={item}
                              onClick={() => setSelectedEntity(item)}
                              className={`${styles.listItem} ${selectedEntity === item ? styles.selected : ''}`}
                            >
                              <span className={styles.listItemText}>
                                <span className={styles.listItemClass}>{item.charAt(0)}{section}</span>
                                <span className={styles.listItemSector}>{sector}</span>
                              </span>
                              {selectedEntity === item && (
                                <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    filteredList.map((item) => (
                      <button
                        key={item}
                        onClick={() => setSelectedEntity(item)}
                        className={`${styles.listItem} ${selectedEntity === item ? styles.selected : ''}`}
                      >
                        <span className={styles.listItemText}>{item}</span>
                        {selectedEntity === item && (
                          <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))
                  )}
                </div>

                {!loading && filteredList.length > 0 && (
                  <div className={styles.resultCount}>
                    {filteredList.length} {mode === 'student' ? (filteredList.length === 1 ? 'classe' : 'classi') : (filteredList.length === 1 ? 'docente' : 'docenti')}
                  </div>
                )}
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
                <>
                  Continua
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
