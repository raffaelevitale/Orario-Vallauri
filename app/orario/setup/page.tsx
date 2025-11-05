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

  const filteredList =
    mode === 'student'
      ? classes.filter((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
      : teachers.filter((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Orario Vallauri
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Configura il tuo orario personalizzato
            </p>
          </div>

          {!mode && (
            <div className="space-y-4">
              <p className="text-center text-gray-700 dark:text-gray-300 font-medium mb-6">
                Sei uno studente o un docente?
              </p>

              <button
                onClick={() => setMode('student')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🎓</span>
                <span>Studente</span>
              </button>

              <button
                onClick={() => setMode('teacher')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                <span className="text-2xl">👨‍🏫</span>
                <span>Docente</span>
              </button>

              {/* Pulsante rapido per usare i dati di esempio (studenti) */}
              <button
                onClick={handleUseSample}
                className="w-full mt-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium py-3 px-4 rounded-lg transition-colors text-sm"
                aria-label="Usa dati di esempio per studenti"
              >
                Usa dati di esempio (studenti)
              </button>
            </div>
          )}

          {mode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <button
                onClick={() => {
                  setMode(null);
                  setSelectedEntity('');
                  setSearchTerm('');
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
              >
                ← Indietro
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {mode === 'student' ? 'Seleziona la tua classe' : 'Seleziona il tuo nome'}
                </label>

                <input
                  type="text"
                  placeholder="Cerca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Caricamento...
                    </div>
                  ) : filteredList.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Nessun risultato trovato
                    </div>
                  ) : (
                    filteredList.map((item) => (
                      <button
                        key={item}
                        onClick={() => setSelectedEntity(item)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                          selectedEntity === item
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
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
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all mt-6"
              >
                {loading ? 'Caricamento...' : 'Continua'}
              </button>

              {/* Piccolo pulsante aggiuntivo per usare i dati di esempio quando è selezionata la modalità studente */}
              {mode === 'student' && (
                <button
                  onClick={handleUseSample}
                  disabled={loading}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                >
                  Usa dati di esempio
                </button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
