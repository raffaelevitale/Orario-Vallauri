import { Lesson } from '@/lib/orario/models/lesson';
import { sampleTeacherNames, sampleTeacherSchedules } from '@/lib/orario/data/sampleSchedule';

interface ClassScheduleData {
  metadata: {
    extracted_at: string;
    source: string;
    type: string;
    totalClasses: number;
  };
  schedule: {
    [className: string]: Array<{
      class: string;
      subject: string;
      teacher: string;
      classroom: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      color: string;
    }>;
  };
}

interface TeacherScheduleData {
  metadata: {
    extracted_at: string;
    source: string;
    type: string;
    totalTeachers: number;
  };
  schedule: {
    [teacherName: string]: {
      docente: string;
      materie: string[];
      orario: {
        [day: string]: Array<{
          ora: string; // es. "07:50-08:50"
          slot: number;
          classe: string;
          materia: string;
          aula: string;
          color: string;
        }>;
      };
      totaleLezioni: number;
    };
  };
}

// Nuovo formato completo classi
interface FullClassiData {
  scuola: string;
  anno_scolastico: string;
  tipo_orario: 'classi';
  giorni_settimana: string[]; // ad es. ["lunedì", ...]
  ore_giornaliere: number;
  classi: Array<{
    nome: string; // ad es. "5A INF"
    studenti: number;
    coordinatore?: { cognome: string; nome: string };
    indirizzo: string;
    anno: number;
    sezione: string;
    orario: Record<string, Array<{
      ora: number; // 1..7
      materia: string | null;
      docente: string | null;
      aula: string | null;
    }>>; // chiavi: "lunedì", "martedì", ...
  }>;
}

// Nuovo formato singola classe (come 2cmec.json)
interface SingleClassData {
  class: string;
  coordinator?: string;
  schedule: {
    monday?: Array<{ hour: number; subject: string; teacher: string; room: string }>;
    tuesday?: Array<{ hour: number; subject: string; teacher: string; room: string }>;
    wednesday?: Array<{ hour: number; subject: string; teacher: string; room: string }>;
    thursday?: Array<{ hour: number; subject: string; teacher: string; room: string }>;
    friday?: Array<{ hour: number; subject: string; teacher: string; room: string }>;
    saturday?: Array<{ hour: number; subject: string; teacher: string; room: string }>;
  };
}

// Mapping dei giorni ita -> indice 1..6 coerente con app (Lun=1)
const dayIndexMap: Record<string, number> = {
  'lunedì': 1,
  'lunedi': 1,
  'monday': 1,
  'martedì': 2,
  'martedi': 2,
  'tuesday': 2,
  'mercoledì': 3,
  'mercoledi': 3,
  'wednesday': 3,
  'giovedì': 4,
  'giovedi': 4,
  'thursday': 4,
  'venerdì': 5,
  'venerdi': 5,
  'friday': 5,
  'sabato': 6,
  'saturday': 6,
};

// Mappa oraria per slot (derivata dai dati campione dell'istituto)
const slotTimesByDay: Record<number, Array<{ start: string; end: string }>> = {
  // Lunedì (1), Mercoledì (3), Venerdì (5) – schema con intervallo lungo 10:40-11:00
  1: [
    { start: '07:50', end: '08:50' },
    { start: '08:50', end: '09:45' },
    { start: '09:45', end: '10:40' },
    { start: '11:00', end: '11:55' },
    { start: '11:55', end: '12:50' },
    { start: '12:50', end: '13:40' },
    { start: '13:40', end: '14:30' },
  ],
  3: [
    { start: '07:50', end: '08:50' },
    { start: '08:50', end: '09:45' },
    { start: '09:45', end: '10:40' },
    { start: '11:00', end: '11:55' },
    { start: '11:55', end: '12:50' },
    { start: '12:50', end: '13:40' },
    { start: '13:40', end: '14:30' },
  ],
  5: [
    { start: '07:50', end: '08:50' },
    { start: '08:50', end: '09:45' },
    { start: '09:45', end: '10:40' },
    { start: '11:00', end: '11:55' },
    { start: '11:55', end: '12:50' },
    { start: '12:50', end: '13:40' },
    { start: '13:40', end: '14:30' },
  ],
  // Martedì (2), Giovedì (4) – schema con doppi intervalli brevi
  2: [
    { start: '07:50', end: '08:45' },
    { start: '08:45', end: '09:35' },
    { start: '09:35', end: '10:25' },
    { start: '10:30', end: '11:20' },
    { start: '11:20', end: '12:10' },
    { start: '12:20', end: '13:10' },
    { start: '13:10', end: '14:00' },
  ],
  4: [
    { start: '07:50', end: '08:45' },
    { start: '08:45', end: '09:35' },
    { start: '09:35', end: '10:25' },
    { start: '10:30', end: '11:20' },
    { start: '11:20', end: '12:10' },
    { start: '12:20', end: '13:10' },
    { start: '13:10', end: '14:00' },
  ],
};

function normalizeSubject(subject: string): string {
  const map: Record<string, string> = {
    'Lingua inglese': 'Inglese',
    'Lingua Italiana': 'Italiano',
    'Scienze motorie e sportive': 'Scienze motorie',
    'Scienze Motorie e Sportive': 'Scienze motorie',
    'MATEMATICA e Complementi': 'Matematica',
    'INTERVALLO': 'Intervallo',
  };
  return map[subject] ?? subject;
}

function addBreaksToLessons(lessons: Lesson[], dayOfWeek: number): void {
  // Intervalli basati sul giorno della settimana
  const breaks: Array<{ start: string; end: string }> = [];
  
  if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
    // Lunedì, Mercoledì, Venerdì: intervallo lungo 10:40-11:00
    breaks.push({ start: '10:40', end: '11:00' });
  } else if (dayOfWeek === 2 || dayOfWeek === 4) {
    // Martedì, Giovedì: due intervalli brevi
    breaks.push({ start: '10:25', end: '10:30' }); // Primo intervallo
    breaks.push({ start: '12:10', end: '12:20' }); // Secondo intervallo
  }
  
  // Aggiungi gli intervalli alle lezioni
  for (const breakTime of breaks) {
    lessons.push({
      id: `break-${dayOfWeek}-${breakTime.start}`,
      subject: 'Intervallo',
      teacher: '',
      classroom: 'Corridoio / Bar',
      dayOfWeek,
      startTime: breakTime.start,
      endTime: breakTime.end,
      color: '#bdbdbd',
      isBreak: true,
    });
  }
}

async function fetchJsonSafe<T = any>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    // Prova a rimuovere BOM o whitespace anomali
    const cleaned = text.replace(/^\uFEFF/, '').trim();
    return JSON.parse(cleaned) as T;
  }
}

export async function loadClassNames(): Promise<string[]> {
  const classList = new Set<string>();
  
  // Aggiungi classi con file specifici
  const specificClasses = ['2C MEC']; // Classi con file JSON dedicati
  specificClasses.forEach(c => classList.add(c));
  
  // Prova prima la nuova sorgente "completa"; fallback al vecchio file studenti
  try {
    const data = await fetchJsonSafe<FullClassiData>('/orario/orario_classi_vallauri_completo.json');
    const names = data.classi?.map((c) => c.nome).filter(Boolean) || [];
    names.forEach(n => classList.add(n));
    if (classList.size > 0) return Array.from(classList).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Error loading class names (completo):', error);
  }
  try {
    const data = await fetchJsonSafe<ClassScheduleData>('/orario/orario_studenti.json');
    Object.keys(data.schedule).forEach(k => classList.add(k));
  } catch (error) {
    console.error('Error loading class names (studenti):', error);
  }
  
  return Array.from(classList).sort((a, b) => a.localeCompare(b));
}

export async function loadClassSchedule(className: string): Promise<Lesson[]> {
  // Prova prima il file specifico della classe (es. 2cmec.json)
  const classFileName = className.toLowerCase().replace(/\s+/g, '');
  try {
    const data = await fetchJsonSafe<SingleClassData>(`/orario/${classFileName}.json`);
    const lessons: Lesson[] = [];
    
    for (const [dayKey, slots] of Object.entries(data.schedule)) {
      const dayOfWeek = dayIndexMap[dayKey.toLowerCase()];
      if (!dayOfWeek || !slots) continue;
      
      const timetable = slotTimesByDay[dayOfWeek] || [];
      
      for (const slot of slots) {
        const idx = slot.hour - 1;
        const time = timetable[idx];
        if (!time) continue;
        
        lessons.push({
          id: `${className}-${dayOfWeek}-${slot.hour}-${slot.subject}`,
          subject: normalizeSubject(slot.subject),
          teacher: slot.teacher,
          classroom: slot.room,
          dayOfWeek,
          startTime: time.start,
          endTime: time.end,
          color: getSubjectColor(slot.subject),
        });
      }
      
      // Aggiungi intervalli automaticamente
      addBreaksToLessons(lessons, dayOfWeek);
    }
    
    if (lessons.length) {
      return lessons.sort((a, b) => (a.dayOfWeek - b.dayOfWeek) || a.startTime.localeCompare(b.startTime));
    }
  } catch (error) {
    console.log(`No specific file for ${className}, trying general sources...`);
  }

  // Sorgente principale: file completo classi
  try {
    const data = await fetchJsonSafe<FullClassiData>('/orario/orario_classi_vallauri_completo.json');
    const cls = data.classi.find((c) => c.nome === className);
    if (cls) {
      const lessons: Lesson[] = [];
      for (const [dayLabelRaw, slots] of Object.entries(cls.orario || {})) {
        const dayLabel = dayLabelRaw.toLowerCase();
        const dayOfWeek = dayIndexMap[dayLabel];
        if (!dayOfWeek) continue;
        const timetable = slotTimesByDay[dayOfWeek] || [];
        for (const slot of slots) {
          const idx = slot.ora - 1;
          const time = timetable[idx];
          // Se materia mancante, salta la lezione (dato incompleto)
          if (!slot.materia || !time) continue;
          lessons.push({
            id: `${className}-${dayOfWeek}-${slot.ora}-${slot.materia}-${slot.docente ?? ''}`,
            subject: normalizeSubject(slot.materia),
            teacher: slot.docente ?? '',
            classroom: slot.aula ?? '',
            dayOfWeek,
            startTime: time.start,
            endTime: time.end,
            color: '#7e57c2',
          });
        }
      }
      if (lessons.length) {
        return lessons.sort((a, b) => (a.dayOfWeek - b.dayOfWeek) || a.startTime.localeCompare(b.startTime));
      }
    }
  } catch (error) {
    console.error('Error loading class schedule (completo):', error);
  }
  // Fallback al vecchio file studenti (include già orari)
  try {
    const data = await fetchJsonSafe<ClassScheduleData>('/orario/orario_studenti.json');
    const lessons = data.schedule[className];
    if (!lessons) return [];
    return lessons.map((lesson, index) => ({
      id: `${lesson.class}-${lesson.dayOfWeek}-${index}`,
      subject: lesson.subject === 'INTERVALLO' ? 'Intervallo' : normalizeSubject(lesson.subject),
      teacher: lesson.subject === 'INTERVALLO' ? '' : lesson.teacher,
      classroom: lesson.subject === 'INTERVALLO' ? 'Corridoio / Bar' : lesson.classroom,
      dayOfWeek: lesson.dayOfWeek,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      color: lesson.subject === 'INTERVALLO' ? '#bdbdbd' : lesson.color,
      isBreak: lesson.subject === 'INTERVALLO',
    }));
  } catch (error) {
    console.error('Error loading class schedule (studenti):', error);
    return [];
  }
}

function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    'Matematica': '#ef5350',
    'Fisica': '#42a5f5',
    'Chimica': '#66bb6a',
    'Informatica': '#7e57c2',
    'Inglese': '#42a5f5',
    'Italiano': '#8d6e63',
    'Storia': '#fbc02d',
    'Scienze motorie': '#26a69a',
    'Religione': '#fbc02d',
    'Diritto': '#ff9800',
    'Economia': '#ff9800',
    'Tecnologie': '#9c27b0',
  };
  
  for (const [key, color] of Object.entries(colors)) {
    if (subject.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  
  return '#7e57c2';
}

export async function loadTeacherNames(): Promise<string[]> {
  // Sorgente ufficiale: file pubblico dei docenti; fallback: sample locali
  try {
    const data = await fetchJsonSafe<TeacherScheduleData>('/orario/orario_docenti.json');
    const names = Object.keys(data.schedule);
    if (names.length > 0) return names.sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Error loading teacher names (file):', error);
  }
  // Fallback ai sample
  try {
    return [...sampleTeacherNames];
  } catch (error) {
    console.error('Error loading teacher names (sample):', error);
    return [];
  }
}

export async function loadTeacherSchedule(teacherName: string): Promise<Lesson[]> {
  // Sorgente principale: file pubblico docenti; fallback: sample interni
  try {
    const data = await fetchJsonSafe<TeacherScheduleData>('/orario/orario_docenti.json');
    const teacher = data.schedule[teacherName];

    if (!teacher) {
      // Fallback sample per docenti noti
      const fallback = sampleTeacherSchedules[teacherName] || [];
      return [...fallback].sort((a, b) =>
        a.dayOfWeek !== b.dayOfWeek ? a.dayOfWeek - b.dayOfWeek : a.startTime.localeCompare(b.startTime)
      );
    }

    const lessons: Lesson[] = [];
    Object.entries(teacher.orario).forEach(([dayLabel, items]) => {
      const key = dayLabel.toLowerCase();
      const dayOfWeek = dayIndexMap[key] ?? 0;
      for (const item of items) {
        const [startTime, endTime] = item.ora.split('-');
        lessons.push({
          id: `${teacherName.replace(/\s|\./g, '')}-${dayOfWeek}-${startTime}-${endTime}-${item.classe}`,
          subject: normalizeSubject(item.materia),
          teacher: teacherName,
          classroom: item.aula,
          dayOfWeek,
          startTime,
          endTime,
          color: item.color || '#7e57c2',
        });
      }
    });

    // Ordina per giorno e ora
    return lessons.sort((a, b) =>
      a.dayOfWeek !== b.dayOfWeek ? a.dayOfWeek - b.dayOfWeek : a.startTime.localeCompare(b.startTime)
    );
  } catch (error) {
    console.error('Error loading teacher schedule (file):', error);
    const fallback = sampleTeacherSchedules[teacherName] || [];
    return [...fallback].sort((a, b) =>
      a.dayOfWeek !== b.dayOfWeek ? a.dayOfWeek - b.dayOfWeek : a.startTime.localeCompare(b.startTime)
    );
  }
}
