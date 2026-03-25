import type { Lesson } from "@/lib/orario/models/lesson";
import { getSubjectColor } from "@/lib/orario/utils/colors";

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
  tipo_orario: "classi";
  giorni_settimana: string[]; // ad es. ["lunedì", ...]
  ore_giornaliere: number;
  classi: Array<{
    nome: string; // ad es. "5A INF"
    studenti: number;
    coordinatore?: { cognome: string; nome: string };
    indirizzo: string;
    anno: number;
    sezione: string;
    orario: Record<
      string,
      Array<{
        ora: number; // 1..7
        materia: string | null;
        docente: string | null;
        aula: string | null;
      }>
    >; // chiavi: "lunedì", "martedì", ...
  }>;
}

// Type per slot di lezione classe
type ClassSlot = {
  hour: number;
  subject: string;
  teacher: string;
  room: string;
};

// Type per schedule settimanale classi
type WeeklyClassSchedule = {
  monday?: ClassSlot[];
  tuesday?: ClassSlot[];
  wednesday?: ClassSlot[];
  thursday?: ClassSlot[];
  friday?: ClassSlot[];
  saturday?: ClassSlot[];
};

// Nuovo formato singola classe (come 2cmec.json)
interface SingleClassData {
  class: string;
  coordinator?: string;
  schedule: WeeklyClassSchedule;
}

// Type per slot di lezione docente
type TeacherSlot = {
  hour: number;
  subject: string;
  class: string;
  room: string;
};

// Type per schedule settimanale docenti
type WeeklyTeacherSchedule = {
  monday?: TeacherSlot[];
  tuesday?: TeacherSlot[];
  wednesday?: TeacherSlot[];
  thursday?: TeacherSlot[];
  friday?: TeacherSlot[];
  saturday?: TeacherSlot[];
};

// Nuovo formato singolo docente (come fea.json)
interface SingleTeacherData {
  teacher: string;
  school?: string;
  schedule: WeeklyTeacherSchedule;
}

// Mapping dei giorni ita -> indice 1..6 coerente con app (Lun=1)
const dayIndexMap: Record<string, number> = {
  lunedì: 1,
  lunedi: 1,
  monday: 1,
  martedì: 2,
  martedi: 2,
  tuesday: 2,
  mercoledì: 3,
  mercoledi: 3,
  wednesday: 3,
  giovedì: 4,
  giovedi: 4,
  thursday: 4,
  venerdì: 5,
  venerdi: 5,
  friday: 5,
  sabato: 6,
  saturday: 6,
};

// Costanti orari della scuola
const SCHOOL_START_TIME = "07:50";
const SCHOOL_END_TIME_ODD_DAYS = "13:40"; // Lun, Mer, Ven
const SCHOOL_END_TIME_EVEN_DAYS = "14:00"; // Mar, Gio

// Slot orari per giorni dispari (Lun, Mer, Ven) - include 7ª ora per classi prime
const ODD_DAY_SLOTS = [
  { start: "07:50", end: "08:50" },
  { start: "08:50", end: "09:45" },
  { start: "09:45", end: "10:40" },
  { start: "11:00", end: "11:55" },
  { start: "11:55", end: "12:50" },
  { start: "12:50", end: "13:40" },
  { start: "13:40", end: "14:30" },
];

// Slot orari per giorni pari (Mar, Gio)
const EVEN_DAY_SLOTS = [
  { start: "07:50", end: "08:45" },
  { start: "08:45", end: "09:35" },
  { start: "09:35", end: "10:25" },
  { start: "10:30", end: "11:20" },
  { start: "11:20", end: "12:10" },
  { start: "12:20", end: "13:10" },
  { start: "13:10", end: "14:00" },
];

// Mappa oraria unica per slot (ODD_DAY_SLOTS include la 7ª ora, usata solo da chi ce l'ha)
const slotTimesByDay: Record<number, Array<{ start: string; end: string }>> = {
  1: ODD_DAY_SLOTS,  // Lunedì
  2: EVEN_DAY_SLOTS, // Martedì
  3: ODD_DAY_SLOTS,  // Mercoledì
  4: EVEN_DAY_SLOTS, // Giovedì
  5: ODD_DAY_SLOTS,  // Venerdì
};

function normalizeSubject(subject: string): string {
  const map: Record<string, string> = {
    "Lingua inglese": "Inglese",
    "Lingua Italiana": "Italiano",
    "Scienze motorie e sportive": "Scienze motorie",
    "Scienze Motorie e Sportive": "Scienze motorie",
    "MATEMATICA e Complementi": "Matematica",
    INTERVALLO: "Intervallo",
  };
  return map[subject] ?? subject;
}

export function addBreaksToLessons(lessons: Lesson[], dayOfWeek: number): void {
  // Ordina le lezioni per orario SOLO del giorno corrente
  let sortedLessons = lessons
    .filter((l) => !l.isBreak && l.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Se non ci sono lezioni in questo giorno, non aggiungere nulla
  if (sortedLessons.length === 0) return;

  // Verifica se è un orario docente (presenza della property "class")
  const isTeacherDay = sortedLessons.some((l) => !!l.class);

  if (isTeacherDay) {
    // Determina di quale settore sono le classi del professore
    const settore = lessons.every((l) => l.class?.includes("LIC"))
      ? "liceo"
      : lessons.some((l) => l.class?.includes("LIC"))
        ? "misto"
        : "tecnico";

    // Definisci gli intervalli standard per questo giorno
    const breaks: Array<{ start: string; end: string }> = [];

    if (
      (dayOfWeek === 1 ||
        dayOfWeek === 3 ||
        dayOfWeek === 5 ||
        settore === "liceo") &&
      sortedLessons.some((l) => l.endTime === "10:40") &&
      sortedLessons.some((l) => l.startTime === "11:00")
    ) {
      // Lunedì, Mercoledì, Venerdì: intervallo lungo 10:40-11:00
      breaks.push({ start: "10:40", end: "11:00" });
    } else if ((dayOfWeek === 2 || dayOfWeek === 4) && settore === "tecnico") {
      // Martedì, Giovedì: due intervalli brevi
      if (
        sortedLessons.some((l) => l.endTime === "10:25") &&
        sortedLessons.some((l) => l.startTime === "10:30")
      )
        breaks.push({ start: "10:25", end: "10:30" });
      if (
        sortedLessons.some((l) => l.endTime === "12:10") &&
        sortedLessons.some((l) => l.startTime === "12:20")
      )
        breaks.push({ start: "12:10", end: "12:20" });
    }

    // Aggiungi gli intervalli standard
    for (const breakTime of breaks) {
      const breakLesson = {
        id: `break-${dayOfWeek}-${breakTime.start}`,
        subject: "Intervallo",
        teacher: "",
        classroom: "Corridoio / Bar",
        dayOfWeek,
        startTime: breakTime.start,
        endTime: breakTime.end,
        color: getSubjectColor("Intervallo"),
        isBreak: true,
      };
      lessons.push(breakLesson);
      sortedLessons.push(breakLesson);
    }

    // Riordina le lezioni con gli intervalli aggiunti 
    sortedLessons = sortedLessons.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    // Aggiunge il tempo libero dei professori
    if (sortedLessons[0].startTime !== SCHOOL_START_TIME)
      lessons.push({
        id: `free-${dayOfWeek}-${SCHOOL_START_TIME}`,
        subject: "🕐 Libero",
        teacher: "",
        classroom: "",
        dayOfWeek,
        startTime: SCHOOL_START_TIME,
        endTime: sortedLessons[0].startTime,
        color: getSubjectColor("🕐 Libero"),
        isBreak: false,
      });

    for (let i = 0; i < sortedLessons.length - 1; i++) {
      if (sortedLessons[i].endTime !== sortedLessons[i + 1].startTime)
        lessons.push({
          id: `free-${dayOfWeek}-${sortedLessons[i].endTime}`,
          subject: "🕐 Libero",
          teacher: "",
          classroom: "",
          dayOfWeek,
          startTime: sortedLessons[i].endTime,
          endTime: sortedLessons[i + 1].startTime,
          color: getSubjectColor("🕐 Libero"),
          isBreak: false,
        });
    }

    const lastLessonSorted = sortedLessons[sortedLessons.length - 1];
    const endTime = [2, 4].includes(dayOfWeek)
      ? SCHOOL_END_TIME_EVEN_DAYS
      : SCHOOL_END_TIME_ODD_DAYS;

    if (lastLessonSorted.endTime !== endTime)
      lessons.push({
        id: `free-${dayOfWeek}-${lastLessonSorted.endTime}`,
        subject: "🕐 Libero",
        teacher: "",
        classroom: "",
        dayOfWeek,
        startTime: lastLessonSorted.endTime,
        endTime,
        color: getSubjectColor("🕐 Libero"),
        isBreak: false,
      });
  } else {
    // Per le classi: aggiungi solo gli intervalli standard
    const breaks: Array<{ start: string; end: string }> = [];
    const isLiceo = lessons.some((l) => l.id?.includes("LIC"));
    const isPrima = lessons.some((l) => l.id?.startsWith("1"));

    if ((dayOfWeek === 1 && !isPrima) || dayOfWeek === 3 || dayOfWeek === 5 || isLiceo) {
      // Lunedì, Mercoledì, Venerdì: intervallo lungo 10:40-11:00
      breaks.push({ start: "10:40", end: "11:00" });
    } else if ((dayOfWeek === 1 && isPrima) || dayOfWeek === 2 || dayOfWeek === 4) {
      // Martedì, Giovedì: due intervalli brevi
      breaks.push({ start: "10:25", end: "10:30" });
      breaks.push({ start: "12:10", end: "12:20" });
    }

    // Aggiungi solo gli intervalli che cadono durante le lezioni della classe
    for (const breakTime of breaks) {
      const hasLessonBefore = sortedLessons.some(
        (l) => l.endTime <= breakTime.start && l.endTime > "07:00"
      );
      const hasLessonAfter = sortedLessons.some(
        (l) => l.startTime >= breakTime.end && l.startTime < "14:00"
      );

      if (hasLessonBefore && hasLessonAfter) {
        const exists = lessons.some(
          (l) =>
            l.isBreak &&
            l.dayOfWeek === dayOfWeek &&
            l.startTime === breakTime.start &&
            l.endTime === breakTime.end
        );

        if (!exists) {
          lessons.push({
            id: `break-${dayOfWeek}-${breakTime.start}`,
            subject: "Intervallo",
            teacher: "",
            classroom: "Corridoio / Bar",
            dayOfWeek,
            startTime: breakTime.start,
            endTime: breakTime.end,
            color: getSubjectColor("Intervallo"),
            isBreak: true,
          });
        }
      }
    }
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
    const cleaned = text.replace(/^\uFEFF/, "").trim();
    return JSON.parse(cleaned) as T;
  }
}

export async function loadClassNames(): Promise<string[]> {
  try {
    const classList = await fetchJsonSafe<string[]>("/orario/classes.json");
    return classList.sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Error loading class names from manifest:", error);
    return [];
  }
}

export async function loadClassSchedule(className: string): Promise<Lesson[]> {
  // Prova prima il file specifico della classe (es. 2cmec.json)
  const classFileName = className.toLowerCase().replace(/\s+/g, "");
  try {
    const data = await fetchJsonSafe<SingleClassData>(
      `/orario/${classFileName}.json`
    );
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
      return lessons.sort(
        (a, b) =>
          a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
      );
    }
  } catch (error) {
    console.log(`No specific file for ${className}, trying general sources...`);
  }

  // Sorgente principale: file completo classi
  try {
    const data = await fetchJsonSafe<FullClassiData>(
      "/orario/orario_classi_vallauri_completo.json"
    );
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
            id: `${className}-${dayOfWeek}-${slot.ora}-${slot.materia}-${slot.docente ?? ""
              }`,
            subject: normalizeSubject(slot.materia),
            teacher: slot.docente ?? "",
            classroom: slot.aula ?? "",
            dayOfWeek,
            startTime: time.start,
            endTime: time.end,
            color: getSubjectColor(slot.materia),
          });
        }
      }
      if (lessons.length) {
        return lessons.sort(
          (a, b) =>
            a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
        );
      }
    }
  } catch (error) {
    console.error("Error loading class schedule (completo):", error);
  }
  // Fallback al vecchio file studenti (include già orari)
  try {
    const data = await fetchJsonSafe<ClassScheduleData>(
      "/orario/orario_studenti.json"
    );
    const lessons = data.schedule[className];
    if (!lessons) return [];
    return lessons.map((lesson, index) => ({
      id: `${lesson.class}-${lesson.dayOfWeek}-${index}`,
      subject:
        lesson.subject === "INTERVALLO"
          ? "Intervallo"
          : normalizeSubject(lesson.subject),
      teacher: lesson.subject === "INTERVALLO" ? "" : lesson.teacher,
      classroom:
        lesson.subject === "INTERVALLO" ? "Corridoio / Bar" : lesson.classroom,
      dayOfWeek: lesson.dayOfWeek,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      color: getSubjectColor(lesson.subject),
      isBreak: lesson.subject === "INTERVALLO",
    }));
  } catch (error) {
    console.error("Error loading class schedule (studenti):", error);
    return [];
  }
}

function getClassColor(className?: string): string {
  // Estrai il numero/anno della classe (1A, 2B, 3C, 4A, 5A, etc.)
  if (!className) return "#7e57c2";
  const yearMatch = className.match(/^(\d)/);
  if (!yearMatch) return "#7e57c2";

  const year = parseInt(yearMatch[1]);

  const yearColors: Record<number, string> = {
    1: "#ef5350", // Rosso
    2: "#ec407a", // Rosa
    3: "#ab47bc", // Viola
    4: "#42a5f5", // Blu
    5: "#26a69a", // Verde acqua
  };

  return yearColors[year] || "#7e57c2";
}

export async function loadTeacherNames(): Promise<string[]> {
  try {
    // Carica lista docenti dal file generato
    const teacherList = await fetchJsonSafe<string[]>("/orario/teachers.json");
    return teacherList.sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Error loading teacher names:", error);
    // Fallback: prova a estrarre dal file docenti
    try {
      const data = await fetchJsonSafe<TeacherScheduleData>("/orario/orario_docenti.json");
      return Object.keys(data.schedule).sort((a, b) => a.localeCompare(b));
    } catch {
      return [];
    }
  }
}

export async function loadTeacherSchedule(
  teacherName: string
): Promise<Lesson[]> {
  // Prima prova con file specifico del docente
  // Il nome può essere "COGNOME Nome" (dal teachers.json) oppure "COGNOME I." (vecchio formato)
  const teacherFileMap: Record<string, string> = {
    "FEA D.": "fea",
    "MAGGIORE G.": "maggiore",
    "CANONICO T.": "canonico",
    "BONAVIA M.": "bonavia",
    "RACCA M.": "racca",
    "ABBATE A.": "abbate",
    "ABBATE Andrea": "abbate",
    "SANINO A.": "sanino",
    "SANINO Alessandro": "sanino",
    "CARANTA P.": "caranta",
    "CAVALLERO L.": "cavallero",
  };

  // Genera automaticamente il nome file dal cognome
  function getTeacherFileName(name: string): string {
    if (teacherFileMap[name]) return teacherFileMap[name];
    // "COGNOME Nome" → "cognome"
    const parts = name.split(/\s+/);
    return parts[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  try {
    const teacherFileName = getTeacherFileName(teacherName);

    const data = await fetchJsonSafe<SingleTeacherData>(
      `/orario/${teacherFileName}.json`
    );

    const lessons: Lesson[] = [];

    for (const [dayKey, daySlots] of Object.entries(data.schedule)) {
      const dayOfWeek = dayIndexMap[dayKey.toLowerCase()];
      if (!dayOfWeek || !daySlots) continue;

      for (const slot of daySlots) {
        const idx = slot.hour - 1;
        const time = slotTimesByDay[dayOfWeek]?.[idx];
        if (!slot.subject || !time) continue;

        lessons.push({
          id: `${teacherName.replace(/\s|\./g, "")}-${dayOfWeek}-${slot.hour}-${slot.subject
            }-${slot.class}`,
          subject: normalizeSubject(slot.subject),
          teacher: teacherName,
          classroom: slot.room || "",
          class: slot.class,
          dayOfWeek,
          startTime: time.start,
          endTime: time.end,
          color: getClassColor(slot.class),
        });
      }

      // Aggiungi intervalli automaticamente
      addBreaksToLessons(lessons, dayOfWeek);
    }

    if (lessons.length) {
      return lessons.sort(
        (a, b) =>
          a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
      );
    }
  } catch (error) {
    console.log(
      `No specific file for ${teacherName}, trying general sources...`
    );
  }

  // Sorgente principale: file pubblico docenti
  try {
    const data = await fetchJsonSafe<TeacherScheduleData>(
      "/orario/orario_docenti.json"
    );
    const teacher = data.schedule[teacherName];

    if (!teacher) {
      console.warn(`Teacher ${teacherName} not found in orario_docenti.json`);
      return [];
    }

    const lessons: Lesson[] = [];
    Object.entries(teacher.orario).forEach(([dayLabel, items]) => {
      const key = dayLabel.toLowerCase();
      const dayOfWeek = dayIndexMap[key] ?? 0;
      for (const item of items) {
        const [startTime, endTime] = item.ora.split("-");
        lessons.push({
          id: `${teacherName.replace(
            /\s|\./g,
            ""
          )}-${dayOfWeek}-${startTime}-${endTime}-${item.classe}`,
          subject: normalizeSubject(item.materia),
          teacher: teacherName,
          classroom: item.aula,
          dayOfWeek,
          startTime,
          endTime,
          color: item.color || "#7e57c2",
        });
      }
    });

    // Ordina per giorno e ora
    return lessons.sort((a, b) =>
      a.dayOfWeek !== b.dayOfWeek
        ? a.dayOfWeek - b.dayOfWeek
        : a.startTime.localeCompare(b.startTime)
    );
  } catch (error) {
    console.error("Error loading teacher schedule (file):", error);
    return [];
  }
}
