#!/usr/bin/env node
/**
 * Script per parsare il CSV esportato (EXP_COURS) e generare tutti i file JSON
 * dell'orario nella struttura usata dall'app.
 *
 * Output:
 *   public/orario/classes.json             – lista classi
 *   public/orario/orario_studenti.json     – orario studenti (formato app)
 *   public/orario/orario_docenti.json      – orario docenti (formato app)
 *   public/orario/<classe>.json            – file individuali per classe
 *   public/orario/<docente>.json           – file individuali per docente
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CSV_PATH = path.join(ROOT, "EXP_COURS(1).csv");
const OUT_DIR = path.join(ROOT, "public", "orario");

// ─── Costanti orarie ────────────────────────────────────────────────────────

// Slot orari per giorni dispari (Lunedì=1, Mercoledì=3, Venerdì=5)
const ODD_DAY_SLOTS = [
  { start: "07:50", end: "08:50" },
  { start: "08:50", end: "09:45" },
  { start: "09:45", end: "10:40" },
  { start: "11:00", end: "11:55" },
  { start: "11:55", end: "12:50" },
  { start: "12:50", end: "13:40" },
  { start: "13:40", end: "14:30" },
];

// Slot orari per giorni pari (Martedì=2, Giovedì=4)
const EVEN_DAY_SLOTS = [
  { start: "07:50", end: "08:45" },
  { start: "08:45", end: "09:35" },
  { start: "09:35", end: "10:25" },
  { start: "10:30", end: "11:20" },
  { start: "11:20", end: "12:10" },
  { start: "12:20", end: "13:10" },
  { start: "13:10", end: "14:00" },
];

const slotTimesByDay = {
  1: ODD_DAY_SLOTS,
  2: EVEN_DAY_SLOTS,
  3: ODD_DAY_SLOTS,
  4: EVEN_DAY_SLOTS,
  5: ODD_DAY_SLOTS,
};

// Mapping giorno italiano → dayOfWeek (1=Lunedì)
const dayMap = {
  lunedì: 1,
  lunedi: 1,
  martedì: 2,
  martedi: 2,
  mercoledì: 3,
  mercoledi: 3,
  giovedì: 4,
  giovedi: 4,
  venerdì: 5,
  venerdi: 5,
  sabato: 6,
};

const dayIndexToEnglish = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

const dayIndexToItalian = {
  1: "Lunedì",
  2: "Martedì",
  3: "Mercoledì",
  4: "Giovedì",
  5: "Venerdì",
  6: "Sabato",
};

// ─── Colori per materia ──────────────────────────────────────────────────────

const COLORI_MATERIE = {
  "italiano": "#8d6e63",
  "lingua e letteratura italiana": "#8d6e63",
  "storia": "#fbc02d",
  "storia e geografia": "#f9a825",
  "geografia": "#f9a825",
  "geografia turistica": "#fdd835",
  "filosofia": "#7e57c2",
  "arte e territorio": "#e91e63",
  "disegno e storia dell'arte": "#ec407a",
  "inglese": "#1e88e5",
  "lingua inglese": "#1e88e5",
  "lingua e cultura inglese": "#1e88e5",
  "lingua francese": "#5e35b1",
  "lingua spagnola": "#e53935",
  "matematica": "#ef5350",
  "matematica e complementi": "#ef5350",
  "fisica": "#42a5f5",
  "fisica e laboratorio": "#42a5f5",
  "chimica": "#66bb6a",
  "scienze naturali": "#4caf50",
  "scienze integrate chimica": "#66bb6a",
  "scienze integrate fisica": "#42a5f5",
  "scienze integrate scienze": "#4caf50",
  "lab. scienze integrate chimica": "#66bb6a",
  "lab.scienze integrate fisica": "#42a5f5",
  "lab. scienze integrate fisica": "#42a5f5",
  "informatica": "#7e57c2",
  "sistemi e reti": "#9c27b0",
  "tpsit": "#ab47bc",
  "t.p.s.i.t": "#ab47bc",
  "t.p.s.i.t.": "#ab47bc",
  "telecomunicazioni": "#673ab7",
  "tecnologie informatiche": "#512da8",
  "gestione progetto": "#ba68c8",
  "gestione progetto, organizzazione d'impresa": "#ba68c8",
  "scienze e tecnologie applicate informatiche": "#7e57c2",
  "elettrotecnica ed elettronica": "#ff6f00",
  "t.p.s.e.e.": "#ff8f00",
  "impianti energetici, disegno e progettazione": "#ffa726",
  "scienze e tecnologie applicate elettriche": "#ff9800",
  "sistemi automatici": "#fb8c00",
  "meccanica, macchine ed energia": "#546e7a",
  "tecnologie meccaniche di processo e prodotto": "#607d8b",
  "sistemi e automazione": "#78909c",
  "d.p.o.i.": "#90a4ae",
  "disegno, progettazione e organizzazione industriale": "#90a4ae",
  "scienze e tecnologie applicate meccaniche": "#546e7a",
  "economia aziendale": "#ff9800",
  "economia politica": "#ffa726",
  "diritto": "#ff7043",
  "diritto ed economia": "#ff7043",
  "diritto e legislazione turistica": "#ff8a65",
  "discipline turistiche e aziendali": "#ffab91",
  "scienze motorie": "#26a69a",
  "scienze motorie e sportive": "#26a69a",
  "ginnastica": "#26a69a",
  "religione": "#fbc02d",
  "religione cattolica e attività alternative": "#fbc02d",
  "religione cattolica o attività alternative": "#fbc02d",
  "tecnologie e rap. grafica": "#3f51b5",
  "tecnologie  e rap. grafica": "#3f51b5",
  "tecnologie e rappresentazioni grafiche": "#3f51b5",
};

function getSubjectColor(subject) {
  const s = subject
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\./g, "");
  if (COLORI_MATERIE[s]) return COLORI_MATERIE[s];
  // Prova una corrispondenza parziale
  for (const [key, value] of Object.entries(COLORI_MATERIE)) {
    if (s.includes(key) || key.includes(s)) return value;
  }
  // Hash-based fallback
  let hash = 0;
  for (let i = 0; i < subject.length; i++)
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  const colors = [
    "#ef5350",
    "#ec407a",
    "#ab47bc",
    "#7e57c2",
    "#5c6bc0",
    "#42a5f5",
    "#29b6f6",
    "#26c6da",
    "#26a69a",
    "#66bb6a",
    "#9ccc65",
    "#d4e157",
    "#fdd835",
    "#ffca28",
    "#ffa726",
    "#ff7043",
    "#8d6e63",
    "#78909c",
  ];
  return colors[Math.abs(hash) % colors.length];
}

function getClassColor(className) {
  if (!className) return "#7e57c2";
  const m = className.match(/^(\d)/);
  if (!m) return "#7e57c2";
  const yearColors = {
    1: "#ef5350",
    2: "#ec407a",
    3: "#ab47bc",
    4: "#42a5f5",
    5: "#26a69a",
  };
  return yearColors[parseInt(m[1])] || "#7e57c2";
}

// ─── Normalizzazione materia ────────────────────────────────────────────────

function normalizeSubject(subject) {
  const map = {
    "Lingua e letteratura italiana": "Italiano",
    "Lingua inglese": "Inglese",
    "Lingua e cultura Inglese": "Inglese",
    "Scienze motorie e sportive": "Scienze motorie",
    "MATEMATICA e Complementi": "Matematica e Complementi",
    "Religione cattolica o attività alternative": "Religione",
    "Scienze integrate Chimica": "Chimica",
    "Scienze integrate Fisica": "Fisica",
    "Scienze integrate Scienze": "Scienze",
    "Lab.Scienze integrate Fisica": "Lab. Fisica",
    "Lab. Scienze integrate Chimica": "Lab. Chimica",
    "Tecnologie  e rap. grafica": "Tecn. e rap. grafica",
    "Tecnologie informatiche": "Tecn. informatiche",
  };
  return map[subject] ?? subject;
}

// ─── Parsing CSV ────────────────────────────────────────────────────────────

function parseCSV(csvPath) {
  const raw = fs.readFileSync(csvPath, "utf-8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(";");
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(";");
    const row = {};
    header.forEach((h, idx) => (row[h.trim()] = (vals[idx] || "").trim()));
    rows.push(row);
  }
  return rows;
}

// ─── Estrai nome classe pulito ──────────────────────────────────────────────

function cleanClassName(raw) {
  // "1B ELT (20)" → "1B ELT"
  // Normalizza spazi multipli
  return raw
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Gestisce classi multiple separate da virgola nel CSV, es:
 * "3C MEC (17), 3A MEN (12)" → ["3C MEC", "3A MEN"]
 */
function parseClasses(classeRaw) {
  // Split su virgola ma solo se seguita da spazio e numero (nuova classe)
  const parts = classeRaw.split(/,\s*(?=\d)/);
  return parts.map((p) => ({
    name: cleanClassName(p),
    students: extractStudentCount(p),
  }));
}

function extractStudentCount(raw) {
  const m = raw.match(/\((\d+)\)/);
  return m ? parseInt(m[1]) : 0;
}

// ─── Formatta nome docente come "COGNOME I." ────────────────────────────────

function formatTeacherShort(cognome, nome) {
  if (!cognome) return "";
  // Handle parenthetical names like "SALMERI (Arnaudo)" / "Vincenza(Andrea)"
  const cleanCogn = cognome.replace(/\s*\(.*\)/, "").trim();
  const cleanNome = nome.replace(/\s*\(.*\)/, "").trim();
  const initial = cleanNome ? cleanNome.charAt(0) + "." : "";
  return `${cleanCogn} ${initial}`.trim();
}

function formatTeacherFull(cognome, nome) {
  if (!cognome) return "";
  const cleanCogn = cognome.replace(/\s*\(.*\)/, "").trim();
  const cleanNome = nome.replace(/\s*\(.*\)/, "").trim();
  return `${cleanCogn} ${cleanNome}`.trim();
}

// ─── Gestione docenti multipli ──────────────────────────────────────────────

function parseTeachers(docCogn, docNome) {
  // I docenti possono essere separati da virgola
  const cognomi = docCogn
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const nomi = docNome.split(",").map((s) => s.trim());
  const teachers = [];
  for (let i = 0; i < cognomi.length; i++) {
    teachers.push({
      cognome: cognomi[i],
      nome: nomi[i] || "",
    });
  }
  return teachers;
}

// ─── Estrazione ora di inizio come numero ───────────────────────────────────

function parseHourSlot(oInizio) {
  // "01h00" → 1, "02h00" → 2, etc.
  const m = oInizio.match(/(\d+)h/);
  return m ? parseInt(m[1]) : 0;
}

function parseDuration(durata) {
  const m = durata.match(/(\d+)h/);
  return m ? parseInt(m[1]) : 1;
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log("📖 Parsing CSV...");
  const rows = parseCSV(CSV_PATH);
  console.log(`   ${rows.length} righe trovate`);

  // ─── Strutture accumulo ────────────────────────────────────────────────────

  // Per orario_studenti.json: { className: [lessons] }
  const classSchedules = {};

  // Per orario_docenti.json: { "COGNOME Nome": { docente, materie, orario: { giorno: [slots] } } }
  const teacherSchedules = {};

  // Per classes.json: Set di nomi classi
  const classNames = new Set();

  // Info classi (studenti)
  const classInfo = {};

  // ─── Processa righe ───────────────────────────────────────────────────────

  for (const row of rows) {
    const dayStr = (row.GIORNO || "").toLowerCase();
    const dayOfWeek = dayMap[dayStr];
    if (!dayOfWeek) continue;

    const hourStart = parseHourSlot(row["O.INIZIO"]);
    if (!hourStart) continue;

    const duration = parseDuration(row.DURATA || "1h00");
    const subjectFull = row.MAT_NOME || row.MAT_COD || "";
    const classroom = (row.AULA || "").replace(/<|>/g, "");
    const classeRaw = row.CLASSE || "";
    const classes = parseClasses(classeRaw);
    const teachers = parseTeachers(row.DOC_COGN || "", row.DOC_NOME || "");

    if (!classes.length || !classes[0].name || !subjectFull) continue;

    // Costruisci stringa teacher per la classe
    const teacherStr = teachers
      .map((t) => formatTeacherShort(t.cognome, t.nome))
      .join(", ");

    // Per ogni classe (gestisce classi multiple)
    for (const { name: className, students } of classes) {
      if (!className) continue;

      classNames.add(className);
      if (!classInfo[className]) {
        classInfo[className] = { students };
      }

      // Per ogni ora della durata
      for (let h = 0; h < duration; h++) {
        const hour = hourStart + h;
        const slots = slotTimesByDay[dayOfWeek];
        if (!slots || hour < 1 || hour > slots.length) continue;

        const timeSlot = slots[hour - 1];

        // ─── Orario studenti ────────────────────────────────────────────
        if (!classSchedules[className]) classSchedules[className] = [];
        classSchedules[className].push({
          class: className,
          subject: subjectFull,
          teacher: teacherStr,
          classroom,
          dayOfWeek,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          color: getSubjectColor(subjectFull),
        });

        // ─── Orario docenti ─────────────────────────────────────────────
        for (const t of teachers) {
          const fullName = formatTeacherFull(t.cognome, t.nome);
          if (!fullName) continue;

          if (!teacherSchedules[fullName]) {
            teacherSchedules[fullName] = {
              docente: fullName,
              materie: new Set(),
              orario: {
                Lunedì: [],
                Martedì: [],
                Mercoledì: [],
                Giovedì: [],
                Venerdì: [],
                Sabato: [],
              },
              totaleLezioni: 0,
            };
          }

          const ts = teacherSchedules[fullName];
          ts.materie.add(subjectFull);
          ts.totaleLezioni++;

          const dayLabel = dayIndexToItalian[dayOfWeek];
          ts.orario[dayLabel].push({
            ora: `${timeSlot.start}-${timeSlot.end}`,
            slot: hour,
            classe: className,
            materia: subjectFull,
            aula: classroom,
            color: getClassColor(className),
          });
        }
      }
    } // fine loop classi
  }

  // ─── Ordina le lezioni ────────────────────────────────────────────────────

  for (const cls of Object.keys(classSchedules)) {
    classSchedules[cls].sort(
      (a, b) =>
        a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime),
    );
  }

  for (const t of Object.values(teacherSchedules)) {
    for (const dayLabel of Object.keys(t.orario)) {
      t.orario[dayLabel].sort((a, b) => a.slot - b.slot);
    }
  }

  // ─── Genera classes.json ──────────────────────────────────────────────────

  const sortedClasses = Array.from(classNames).sort((a, b) =>
    a.localeCompare(b),
  );
  const classesPath = path.join(OUT_DIR, "classes.json");
  fs.writeFileSync(classesPath, JSON.stringify(sortedClasses, null, 2));
  console.log(`✅ classes.json – ${sortedClasses.length} classi`);

  // ─── Genera orario_studenti.json ──────────────────────────────────────────

  const studentiData = {
    metadata: {
      extracted_at: new Date().toISOString(),
      source: "EXP_COURS(1).csv",
      type: "studenti",
      totalClasses: sortedClasses.length,
    },
    schedule: classSchedules,
  };
  const studentiPath = path.join(OUT_DIR, "orario_studenti.json");
  fs.writeFileSync(studentiPath, JSON.stringify(studentiData, null, 2));
  console.log(
    `✅ orario_studenti.json – ${Object.keys(classSchedules).length} classi`,
  );

  // ─── Genera orario_docenti.json ───────────────────────────────────────────

  // Converti Set materie in Array
  const teacherSchedulesFinal = {};
  for (const [name, data] of Object.entries(teacherSchedules)) {
    teacherSchedulesFinal[name] = {
      ...data,
      materie: Array.from(data.materie),
    };
  }

  const docentiData = {
    metadata: {
      extracted_at: new Date().toISOString(),
      source: "EXP_COURS(1).csv",
      type: "docenti",
      totalTeachers: Object.keys(teacherSchedulesFinal).length,
    },
    schedule: teacherSchedulesFinal,
  };
  const docentiPath = path.join(OUT_DIR, "orario_docenti.json");
  fs.writeFileSync(docentiPath, JSON.stringify(docentiData, null, 2));
  console.log(
    `✅ orario_docenti.json – ${Object.keys(teacherSchedulesFinal).length} docenti`,
  );

  // ─── Genera file individuali per classe ──────────────────────────────────

  let classFilesCount = 0;
  for (const className of sortedClasses) {
    const lessons = classSchedules[className];
    if (!lessons || !lessons.length) continue;

    // Raggruppa per giorno → array di slot
    const weekSchedule = {};
    for (const l of lessons) {
      const dayKey = dayIndexToEnglish[l.dayOfWeek];
      if (!dayKey) continue;
      if (!weekSchedule[dayKey]) weekSchedule[dayKey] = [];

      // Calcola l'ora dal time slot
      const slots = slotTimesByDay[l.dayOfWeek];
      const hour = slots.findIndex((s) => s.start === l.startTime) + 1;

      weekSchedule[dayKey].push({
        hour,
        subject: normalizeSubject(l.subject),
        teacher: l.teacher,
        room: l.classroom,
      });
    }

    // Ordina slot per ora
    for (const d of Object.keys(weekSchedule)) {
      weekSchedule[d].sort((a, b) => a.hour - b.hour);
    }

    const classData = {
      class: className,
      schedule: weekSchedule,
    };

    const fileName = className.toLowerCase().replace(/\s+/g, "") + ".json";
    fs.writeFileSync(
      path.join(OUT_DIR, fileName),
      JSON.stringify(classData, null, 2),
    );
    classFilesCount++;
  }
  console.log(`✅ ${classFilesCount} file individuali classe generati`);

  // ─── Genera file individuali per docente ─────────────────────────────────

  let teacherFilesCount = 0;
  for (const [fullName, data] of Object.entries(teacherSchedules)) {
    const weekSchedule = {};

    for (const [dayLabel, slots] of Object.entries(data.orario)) {
      if (!slots.length) continue;
      const dayIdx = dayMap[dayLabel.toLowerCase()];
      const dayKey = dayIndexToEnglish[dayIdx];
      if (!dayKey) continue;

      weekSchedule[dayKey] = slots.map((s) => ({
        hour: s.slot,
        subject: normalizeSubject(s.materia),
        class: s.classe,
        room: s.aula,
      }));
    }

    if (!Object.keys(weekSchedule).length) continue;

    const teacherData = {
      teacher: fullName,
      school: "I.I.S. G. Vallauri",
      schedule: weekSchedule,
    };

    // File name: cognome in lowercase
    const cognome = fullName
      .split(" ")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const fileName = cognome + ".json";

    // Evita sovrascritture tra omonimi - aggiungi iniziale nome
    const filePath = path.join(OUT_DIR, fileName);
    if (fs.existsSync(filePath)) {
      // Controlla se è lo stesso docente
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (existing.teacher !== fullName) {
          const nome = fullName
            .split(" ")
            .slice(1)
            .join("")
            .toLowerCase()
            .charAt(0);
          const altFile = cognome + nome + ".json";
          fs.writeFileSync(
            path.join(OUT_DIR, altFile),
            JSON.stringify(teacherData, null, 2),
          );
          teacherFilesCount++;
          continue;
        }
      } catch {
        /* ignore */
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(teacherData, null, 2));
    teacherFilesCount++;
  }
  console.log(`✅ ${teacherFilesCount} file individuali docente generati`);

  // ─── Aggiorna loadTeacherNames nel servizio ──────────────────────────────

  // Genera un elenco dei docenti per facilitare la ricerca
  const teacherNamesFile = path.join(OUT_DIR, "teachers.json");
  const teacherNames = Object.keys(teacherSchedulesFinal).sort((a, b) =>
    a.localeCompare(b),
  );
  fs.writeFileSync(teacherNamesFile, JSON.stringify(teacherNames, null, 2));
  console.log(`✅ teachers.json – ${teacherNames.length} docenti`);

  console.log("\n🎉 Generazione completata!");
  console.log(`   Classi: ${sortedClasses.length}`);
  console.log(`   Docenti: ${teacherNames.length}`);
  console.log(`   Output: ${OUT_DIR}`);
}

main();
