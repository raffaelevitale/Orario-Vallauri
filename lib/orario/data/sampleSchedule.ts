import { Lesson } from '@/lib/orario/models/lesson';

// Sample schedule for demonstration
export const sampleSchedule: Lesson[] = [
  // LUNEDI (Monday - 1)
  {
    id: 'mon-1',
    subject: 'Inglese',
    teacher: 'FOGLIA P.',
    classroom: 'LAB.134 TELECOMUNICAZIONI (50)',
    dayOfWeek: 1,
    startTime: '07:50',
    endTime: '08:50',
    color: '#42a5f5',
  },
  {
    id: 'mon-2',
    subject: 'Sistemi e reti',
    teacher: 'CANONICO T.',
    classroom: 'LAB.134 TELECOMUNICAZIONI (50)',
    dayOfWeek: 1,
    startTime: '08:50',
    endTime: '09:45',
    color: '#66bb6a',
  },
  {
    id: 'mon-3',
    subject: 'Informatica',
    teacher: 'BONAVIA M.',
    classroom: 'LAB.119A PASCAL (27)',
    dayOfWeek: 1,
    startTime: '09:45',
    endTime: '10:40',
    color: '#7e57c2',
  },
  {
    id: 'mon-break',
    subject: 'Intervallo',
    teacher: '',
    classroom: 'Corridoio / Bar',
    dayOfWeek: 1,
    startTime: '10:40',
    endTime: '11:00',
    color: '#bdbdbd',
    isBreak: true,
  },
  {
    id: 'mon-4',
    subject: 'Informatica',
    teacher: 'BONAVIA M.',
    classroom: 'LAB.119A PASCAL (27)',
    dayOfWeek: 1,
    startTime: '11:00',
    endTime: '11:55',
    color: '#7e57c2',
  },
  {
    id: 'mon-5',
    subject: 'T.P.S.I.T.',
    teacher: 'FEA D., RACCA M.',
    classroom: 'LAB.119B EULERO (25)',
    dayOfWeek: 1,
    startTime: '11:55',
    endTime: '12:50',
    color: '#ffa726',
  },
  {
    id: 'mon-6',
    subject: 'T.P.S.I.T.',
    teacher: 'FEA D., RACCA M.',
    classroom: 'LAB.119B EULERO (25)',
    dayOfWeek: 1,
    startTime: '12:50',
    endTime: '13:40',
    color: '#ffa726',
  },

  // MARTEDI (Tuesday - 2)
  {
    id: 'tue-1',
    subject: 'Religione',
    teacher: 'CAVALLERO L.',
    classroom: 'T31 (24)',
    dayOfWeek: 2,
    startTime: '07:50',
    endTime: '08:45',
    color: '#fbc02d',
  },
  {
    id: 'tue-2',
    subject: 'Inglese',
    teacher: 'FOGLIA P.',
    classroom: 'T31 (24)',
    dayOfWeek: 2,
    startTime: '08:45',
    endTime: '09:35',
    color: '#42a5f5',
  },
  {
    id: 'tue-3',
    subject: 'Matematica',
    teacher: 'GARRO V.',
    classroom: 'T31 (24)',
    dayOfWeek: 2,
    startTime: '09:35',
    endTime: '10:25',
    color: '#ef5350',
  },
  {
    id: 'tue-break',
    subject: 'Intervallo',
    teacher: '',
    classroom: 'Corridoio / Bar',
    dayOfWeek: 2,
    startTime: '10:25',
    endTime: '10:30',
    color: '#bdbdbd',
    isBreak: true,
  },
  {
    id: 'tue-4',
    subject: 'T.P.S.I.T.',
    teacher: 'FEA D., RACCA M.',
    classroom: 'LAB.143 TURING (22)',
    dayOfWeek: 2,
    startTime: '10:30',
    endTime: '11:20',
    color: '#ffa726',
  },
  {
    id: 'tue-5',
    subject: 'Italiano',
    teacher: 'CARANTA P.',
    classroom: '301 (28)',
    dayOfWeek: 2,
    startTime: '11:20',
    endTime: '12:10',
    color: '#8d6e63',
  },
  {
    id: 'tue-break2',
    subject: 'Intervallo',
    teacher: '',
    classroom: 'Corridoio / Bar',
    dayOfWeek: 2,
    startTime: '12:10',
    endTime: '12:20',
    color: '#bdbdbd',
    isBreak: true,
  },
  {
    id: 'tue-6',
    subject: 'Ginnastica',
    teacher: 'BALLATORE A.',
    classroom: 'PALESTRA',
    dayOfWeek: 2,
    startTime: '12:20',
    endTime: '13:10',
    color: '#ff7043',
  },
  {
    id: 'tue-7',
    subject: 'Ginnastica',
    teacher: 'BALLATORE A.',
    classroom: 'PALESTRA',
    dayOfWeek: 2,
    startTime: '13:10',
    endTime: '14:00',
    color: '#ff7043',
  },

  // MERCOLEDI (Wednesday - 3)
  {
    id: 'wed-1',
    subject: 'Informatica',
    teacher: 'BONAVIA M., MAGGIORE G.',
    classroom: 'LAB.S22 ARCHIMEDE (26)',
    dayOfWeek: 3,
    startTime: '07:50',
    endTime: '08:50',
    color: '#7e57c2',
  },
  {
    id: 'wed-2',
    subject: 'Informatica',
    teacher: 'BONAVIA M., MAGGIORE G.',
    classroom: 'LAB.S22 ARCHIMEDE (26)',
    dayOfWeek: 3,
    startTime: '08:50',
    endTime: '09:45',
    color: '#7e57c2',
  },
  {
    id: 'wed-3',
    subject: 'Storia',
    teacher: 'CARANTA P.',
    classroom: '148 (28)',
    dayOfWeek: 3,
    startTime: '09:45',
    endTime: '10:40',
    color: '#6d4c41',
  },
  {
    id: 'wed-break',
    subject: 'Intervallo',
    teacher: '',
    classroom: 'Corridoio / Bar',
    dayOfWeek: 3,
    startTime: '10:40',
    endTime: '11:00',
    color: '#bdbdbd',
    isBreak: true,
  },
  {
    id: 'wed-4',
    subject: 'Storia',
    teacher: 'CARANTA P.',
    classroom: '148 (28)',
    dayOfWeek: 3,
    startTime: '11:00',
    endTime: '11:55',
    color: '#6d4c41',
  },
  {
    id: 'wed-5',
    subject: 'Sistemi e reti',
    teacher: 'CANONICO T.',
    classroom: 'LAB.116 LAPLACE (25)',
    dayOfWeek: 3,
    startTime: '11:55',
    endTime: '12:50',
    color: '#66bb6a',
  },
  {
    id: 'wed-6',
    subject: 'T.P.S.I.T.',
    teacher: 'FEA D.',
    classroom: 'LAB.116 LAPLACE (25)',
    dayOfWeek: 3,
    startTime: '12:50',
    endTime: '13:40',
    color: '#ffa726',
  },

  // GIOVEDI (Thursday - 4)
  {
    id: 'thu-1',
    subject: 'Italiano',
    teacher: 'CARANTA P.',
    classroom: '212 TEST (24)',
    dayOfWeek: 4,
    startTime: '07:50',
    endTime: '08:45',
    color: '#8d6e63',
  },
  {
    id: 'thu-2',
    subject: 'Italiano',
    teacher: 'CARANTA P.',
    classroom: '212 TEST (24)',
    dayOfWeek: 4,
    startTime: '08:45',
    endTime: '09:35',
    color: '#8d6e63',
  },
  {
    id: 'thu-3',
    subject: 'Matematica',
    teacher: 'GARRO V.',
    classroom: '212 TEST (24)',
    dayOfWeek: 4,
    startTime: '09:35',
    endTime: '10:25',
    color: '#ef5350',
  },
  {
    id: 'thu-break',
    subject: 'Intervallo',
    teacher: '',
    classroom: 'Corridoio / Bar',
    dayOfWeek: 4,
    startTime: '10:25',
    endTime: '10:30',
    color: '#bdbdbd',
    isBreak: true,
  },
  {
    id: 'thu-4',
    subject: 'T.P.S.I.T.',
    teacher: 'FEA D.',
    classroom: 'LAB.116 LAPLACE (25)',
    dayOfWeek: 4,
    startTime: '10:30',
    endTime: '11:20',
    color: '#ffa726',
  },
  {
    id: 'thu-5',
    subject: 'Sistemi e reti',
    teacher: 'CANONICO T., MAGGIORE G., CISCO',
    classroom: 'LAB.S18 MARCONI (24)',
    dayOfWeek: 4,
    startTime: '11:20',
    endTime: '12:10',
    color: '#66bb6a',
  },
  {
    id: 'thu-break2',
    subject: 'Intervallo',
    teacher: '',
    classroom: 'Corridoio / Bar',
    dayOfWeek: 4,
    startTime: '12:10',
    endTime: '12:20',
    color: '#bdbdbd',
    isBreak: true,
  },
  {
    id: 'thu-6',
    subject: 'Sistemi e reti',
    teacher: 'CANONICO T., MAGGIORE G., CISCO',
    classroom: 'LAB.S18 MARCONI (24)',
    dayOfWeek: 4,
    startTime: '12:20',
    endTime: '13:10',
    color: '#66bb6a',
  },
  {
    id: 'thu-7',
    subject: 'Inglese',
    teacher: 'FOGLIA P.',
    classroom: 'T65 TEST (27)',
    dayOfWeek: 4,
    startTime: '13:10',
    endTime: '14:00',
    color: '#42a5f5',
  },

  // VENERDI (Friday - 5)
  {
    id: 'fri-1',
    subject: 'Informatica',
    teacher: 'BONAVIA M.',
    classroom: 'LAB.S22 ARCHIMEDE (26)',
    dayOfWeek: 5,
    startTime: '07:50',
    endTime: '08:50',
    color: '#7e57c2',
  },
  {
    id: 'fri-2',
    subject: 'Italiano',
    teacher: 'CARANTA P.',
    classroom: 'T11 (30)',
    dayOfWeek: 5,
    startTime: '08:50',
    endTime: '09:45',
    color: '#8d6e63',
  },
  {
    id: 'fri-3',
    subject: 'Matematica',
    teacher: 'GARRO V.',
    classroom: 'T11 (30)',
    dayOfWeek: 5,
    startTime: '09:45',
    endTime: '10:40',
    color: '#ef5350',
  },
  {
    id: 'fri-break',
    subject: 'Intervallo',
    teacher: '',
    classroom: 'Corridoio / Bar',
    dayOfWeek: 5,
    startTime: '10:40',
    endTime: '11:00',
    color: '#bdbdbd',
    isBreak: true,
  },
  {
    id: 'fri-4',
    subject: 'Gestione progetto',
    teacher: 'FEA D., MAGGIORE G.',
    classroom: 'LAB.T59 PLC (24)',
    dayOfWeek: 5,
    startTime: '11:00',
    endTime: '11:55',
    color: '#26a69a',
  },
  {
    id: 'fri-5',
    subject: 'Gestione progetto',
    teacher: 'FEA D., MAGGIORE G.',
    classroom: 'LAB.T59 PLC (24)',
    dayOfWeek: 5,
    startTime: '11:55',
    endTime: '12:50',
    color: '#26a69a',
  },
  {
    id: 'fri-6',
    subject: 'Gestione progetto',
    teacher: 'FEA D., MAGGIORE G.',
    classroom: 'LAB.T59 PLC (24)',
    dayOfWeek: 5,
    startTime: '12:50',
    endTime: '13:40',
    color: '#26a69a',
  },
];

// ===== Sample Docenti =====
// Docenti supportati come sample
export const sampleTeacherNames: string[] = [
  'FEA D.',
  'MAGGIORE G.',
  'CANONICO T.',
];

// Mappa oraria per slot (derivata dai dati dell'istituto)
const slotTimesByDay: Record<number, Array<{ start: string; end: string }>> = {
  // Lunedì (1), Mercoledì (3), Venerdì (5) - 7 slot
  1: [
    { start: '07:50', end: '08:50' },  // slot 1
    { start: '08:50', end: '09:45' },  // slot 2
    { start: '09:45', end: '10:40' },  // slot 3
    { start: '11:00', end: '11:55' },  // slot 4 (dopo pausa)
    { start: '11:55', end: '12:50' },  // slot 5
    { start: '12:50', end: '13:40' },  // slot 6
    { start: '13:40', end: '14:30' },  // slot 7
  ],
  3: [
    { start: '07:50', end: '08:50' },  // slot 1
    { start: '08:50', end: '09:45' },  // slot 2
    { start: '09:45', end: '10:40' },  // slot 3
    { start: '11:00', end: '11:55' },  // slot 4 (dopo pausa)
    { start: '11:55', end: '12:50' },  // slot 5
    { start: '12:50', end: '13:40' },  // slot 6
    { start: '13:40', end: '14:30' },  // slot 7
  ],
  5: [
    { start: '07:50', end: '08:50' },  // slot 1
    { start: '08:50', end: '09:45' },  // slot 2
    { start: '09:45', end: '10:40' },  // slot 3
    { start: '11:00', end: '11:55' },  // slot 4 (dopo pausa)
    { start: '11:55', end: '12:50' },  // slot 5
    { start: '12:50', end: '13:40' },  // slot 6
    { start: '13:40', end: '14:30' },  // slot 7
  ],
  // Martedì (2), Giovedì (4) - 7 slot
  2: [
    { start: '07:50', end: '08:45' },  // slot 1
    { start: '08:45', end: '09:35' },  // slot 2
    { start: '09:35', end: '10:25' },  // slot 3
    { start: '10:30', end: '11:20' },  // slot 4 (dopo pausa)
    { start: '11:20', end: '12:10' },  // slot 5
    { start: '12:20', end: '13:10' },  // slot 6 (dopo pausa)
    { start: '13:10', end: '14:00' },  // slot 7
  ],
  4: [
    { start: '07:50', end: '08:45' },  // slot 1
    { start: '08:45', end: '09:35' },  // slot 2
    { start: '09:35', end: '10:25' },  // slot 3
    { start: '10:30', end: '11:20' },  // slot 4 (dopo pausa)
    { start: '11:20', end: '12:10' },  // slot 5
    { start: '12:20', end: '13:10' },  // slot 6 (dopo pausa)
    { start: '13:10', end: '14:00' },  // slot 7
  ],
};

// Colori per materie
const subjectColors: Record<string, string> = {
  'T.P.S.I.T.': '#ffa726',
  'Informatica': '#7e57c2',
  'Sistemi e reti': '#66bb6a',
  'Gestione progetto': '#26a69a',
};

interface RawTeacherLesson {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  class: string;
  day: number;
  startTime: number;
  endTime: number;
}

export const sampleSchedulesTeacherOnly: Record<string, RawTeacherLesson[]> = {
  // FEA D. - Docente di Informatica e T.P.S.I.T.
  'FEA_D': [
    // LUNEDÌ
    {
      id: 'FEA_D_3AINF_lunedi_1',
      subject: 'T.P.S.I.T.',
      teacher: 'FEA D.',
      room: 'LAB.119A PASCAL (27)',
      class: '3A INF',
      day: 1,
      startTime: 1,
      endTime: 1
    },
    {
      id: 'FEA_D_4AINF_lunedi_4',
      subject: 'T.P.S.I.T.',
      teacher: 'FEA D., PASCHETTA M.',
      room: 'LAB.S22 ARCHIMEDE (26)',
      class: '4A INF',
      day: 1,
      startTime: 4,
      endTime: 4
    },
    {
      id: 'FEA_D_5AINF_lunedi_5',
      subject: 'T.P.S.I.T.',
      teacher: 'FEA D., RACCA M.',
      room: 'LAB.119B EULERO (25)',
      class: '5A INF',
      day: 1,
      startTime: 5,
      endTime: 5
    },
    {
      id: 'FEA_D_4BLIC_lunedi_6',
      subject: 'T.P.S.I.T.',
      teacher: 'FEA D., MENTO C.',
      room: 'LAB.143 GALILEI (24)',
      class: '4B LIC',
      day: 1,
      startTime: 6,
      endTime: 6
    },
    // MARTEDÌ
    {
      id: 'FEA_D_4AINF_martedi_2',
      subject: 'T.P.S.I.T.',
      teacher: 'FEA D.',
      room: 'LAB.119B EULERO (25)',
      class: '4A INF',
      day: 2,
      startTime: 2,
      endTime: 2
    },
    {
      id: 'FEA_D_4AINF_martedi_3',
      subject: 'T.P.S.I.T.',
      teacher: 'FEA D.',
      room: 'LAB.119B EULERO (25)',
      class: '4A INF',
      day: 2,
      startTime: 3,
      endTime: 3
    },
    // MERCOLEDÌ
    {
      id: 'FEA_D_5AINF_mercoledi_6',
      subject: 'T.P.S.I.T.',
      teacher: 'FEA D., SANTANGELO E.',
      room: 'LAB.116 LAPLACE (25)',
      class: '5A INF',
      day: 3,
      startTime: 6,
      endTime: 6
    },
    // GIOVEDÌ
    {
      id: 'FEA_D_5AINF_giovedi_4',
      subject: 'T.P.S.I.T.',
      teacher: 'FEA D., RACCA M., SANTANGELO E.',
      room: 'LAB.143 TURING (22)',
      class: '5A INF',
      day: 4,
      startTime: 4,
      endTime: 4
    },
    {
      id: 'FEA_D_4BLIC_giovedi_5',
      subject: 'Informatica',
      teacher: 'FEA D.',
      room: 'LAB.143 GALILEI (24)',
      class: '4B LIC',
      day: 4,
      startTime: 5,
      endTime: 5
    },
    {
      id: 'FEA_D_4BLIC_giovedi_6',
      subject: 'Informatica',
      teacher: 'FEA D., MENTO C.',
      room: 'LAB.143 GALILEI (24)',
      class: '4B LIC',
      day: 4,
      startTime: 6,
      endTime: 6
    },
    // VENERDÌ
    {
      id: 'FEA_D_5AINF_venerdi_4',
      subject: 'Gestione progetto',
      teacher: 'FEA D., MAGGIORE G., TORTONE R.',
      room: 'LAB.T59 PLC (24)',
      class: '5A INF',
      day: 5,
      startTime: 4,
      endTime: 4
    },
    {
      id: 'FEA_D_5AINF_venerdi_5',
      subject: 'Gestione progetto',
      teacher: 'FEA D., MAGGIORE G., TORTONE R.',
      room: 'LAB.T59 PLC (24)',
      class: '5A INF',
      day: 5,
      startTime: 5,
      endTime: 5
    },
    {
      id: 'FEA_D_5AINF_venerdi_6',
      subject: 'Gestione progetto',
      teacher: 'FEA D., MAGGIORE G., TORTONE R.',
      room: 'LAB.T59 PLC (24)',
      class: '5A INF',
      day: 5,
      startTime: 6,
      endTime: 6
    },
    {
      id: 'FEA_D_3AINF_venerdi_7',
      subject: 'T.P.S.I.T.',
      teacher: 'FEA D., LATELA D., MARSERO D.',
      room: 'LAB.117 TOLOMEO (26)',
      class: '3A INF',
      day: 5,
      startTime: 7,
      endTime: 7
    },
  ],

  // MAGGIORE G. - Docente di laboratorio Informatica
  'MAGGIORE_G': [
    // 4A INF
    {
      id: 'MAGGIORE_G_4AINF_martedi_5',
      subject: 'Informatica',
      teacher: 'MAGGIORE G.',
      room: 'LAB.143 TURING (22)',
      class: '4A INF',
      day: 2,
      startTime: 5,
      endTime: 5
    },
    {
      id: 'MAGGIORE_G_4AINF_giovedi_6',
      subject: 'Informatica',
      teacher: 'MAGGIORE G.',
      room: 'LAB.119B EULERO (25)',
      class: '4A INF',
      day: 4,
      startTime: 6,
      endTime: 6
    },
    // 3A INF
    {
      id: 'MAGGIORE_G_3AINF_lunedi_5',
      subject: 'Informatica',
      teacher: 'MAGGIORE G.',
      room: 'LAB.116 LAPLACE (25)',
      class: '3A INF',
      day: 1,
      startTime: 5,
      endTime: 5
    },
    // 5A INF
    {
      id: 'MAGGIORE_G_5AINF_mercoledi_1',
      subject: 'Informatica',
      teacher: 'MAGGIORE G.',
      room: 'LAB.S22 ARCHIMEDE (26)',
      class: '5A INF',
      day: 3,
      startTime: 1,
      endTime: 1
    },
    {
      id: 'MAGGIORE_G_5AINF_mercoledi_2',
      subject: 'Informatica',
      teacher: 'MAGGIORE G.',
      room: 'LAB.S22 ARCHIMEDE (26)',
      class: '5A INF',
      day: 3,
      startTime: 2,
      endTime: 2
    },
    {
      id: 'MAGGIORE_G_5AINF_giovedi_5',
      subject: 'Sistemi e reti',
      teacher: 'MAGGIORE G.',
      room: 'LAB.S18 MARCONI (24)',
      class: '5A INF',
      day: 4,
      startTime: 5,
      endTime: 5
    },
    {
      id: 'MAGGIORE_G_5AINF_giovedi_6',
      subject: 'Sistemi e reti',
      teacher: 'MAGGIORE G.',
      room: 'LAB.S18 MARCONI (24)',
      class: '5A INF',
      day: 4,
      startTime: 6,
      endTime: 6
    },
    {
      id: 'MAGGIORE_G_5AINF_venerdi_4',
      subject: 'Gestione progetto',
      teacher: 'MAGGIORE G.',
      room: 'LAB.T59 PLC (24)',
      class: '5A INF',
      day: 5,
      startTime: 4,
      endTime: 4
    },
    {
      id: 'MAGGIORE_G_5AINF_venerdi_5',
      subject: 'Gestione progetto',
      teacher: 'MAGGIORE G.',
      room: 'LAB.T59 PLC (24)',
      class: '5A INF',
      day: 5,
      startTime: 5,
      endTime: 5
    },
    {
      id: 'MAGGIORE_G_5AINF_venerdi_6',
      subject: 'Gestione progetto',
      teacher: 'MAGGIORE G.',
      room: 'LAB.T59 PLC (24)',
      class: '5A INF',
      day: 5,
      startTime: 6,
      endTime: 6
    },
  ],

  // CANONICO T. - Docente di Sistemi e reti
  'CANONICO_T': [
    // 4A INF
    {
      id: 'CANONICO_T_4AINF_martedi_4',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.S18 MARCONI (24)',
      class: '4A INF',
      day: 2,
      startTime: 4,
      endTime: 4
    },
    {
      id: 'CANONICO_T_4AINF_giovedi_5',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.143 TURING (22)',
      class: '4A INF',
      day: 4,
      startTime: 5,
      endTime: 5
    },
    // 5A INF
    {
      id: 'CANONICO_T_5AINF_lunedi_2',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.134 TELECOMUNICAZIONI (50)',
      class: '5A INF',
      day: 1,
      startTime: 2,
      endTime: 2
    },
    {
      id: 'CANONICO_T_5AINF_mercoledi_5',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.116 LAPLACE (25)',
      class: '5A INF',
      day: 3,
      startTime: 5,
      endTime: 5
    },
    {
      id: 'CANONICO_T_5AINF_giovedi_5',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.S18 MARCONI (24)',
      class: '5A INF',
      day: 4,
      startTime: 5,
      endTime: 5
    },
    {
      id: 'CANONICO_T_5AINF_giovedi_6',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.S18 MARCONI (24)',
      class: '5A INF',
      day: 4,
      startTime: 6,
      endTime: 6
    },
    // 5A LIC
    {
      id: 'CANONICO_T_5ALIC_lunedi_1',
      subject: 'Informatica',
      teacher: 'CANONICO T.',
      room: 'LAB.142 NEWTON (25)',
      class: '5A LIC',
      day: 1,
      startTime: 1,
      endTime: 1
    },
    {
      id: 'CANONICO_T_5ALIC_mercoledi_2',
      subject: 'Informatica',
      teacher: 'CANONICO T.',
      room: 'LAB.117 TOLOMEO (26)',
      class: '5A LIC',
      day: 3,
      startTime: 2,
      endTime: 2
    },
    // 4E INF
    {
      id: 'CANONICO_T_4EINF_lunedi_3',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.S18 MARCONI (24)',
      class: '4E INF',
      day: 1,
      startTime: 3,
      endTime: 3
    },
    {
      id: 'CANONICO_T_4EINF_giovedi_5',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.143 TURING (22)',
      class: '4E INF',
      day: 4,
      startTime: 5,
      endTime: 5
    },
    {
      id: 'CANONICO_T_4EINF_giovedi_6',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.143 TURING (22)',
      class: '4E INF',
      day: 4,
      startTime: 6,
      endTime: 6
    },
    // 5D INF
    {
      id: 'CANONICO_T_5DINF_lunedi_4',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.T10 AULA ARVR (25)',
      class: '5D INF',
      day: 1,
      startTime: 4,
      endTime: 4
    },
    {
      id: 'CANONICO_T_5DINF_lunedi_5',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.S18 MARCONI (24)',
      class: '5D INF',
      day: 1,
      startTime: 5,
      endTime: 5
    },
    // 5E INF
    {
      id: 'CANONICO_T_5EINF_lunedi_2',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.S22 ARCHIMEDE (26)',
      class: '5E INF',
      day: 1,
      startTime: 2,
      endTime: 2
    },
    {
      id: 'CANONICO_T_5EINF_giovedi_6',
      subject: 'Sistemi e reti',
      teacher: 'CANONICO T.',
      room: 'LAB.S18 MARCONI (24)',
      class: '5E INF',
      day: 4,
      startTime: 6,
      endTime: 6
    },
  ],
};

// Helper: converti RawTeacherLesson in Lesson
function convertRawToLesson(raw: RawTeacherLesson): Lesson {
  const timetable = slotTimesByDay[raw.day] || [];
  const slotIndex = raw.startTime - 1;
  const time = timetable[slotIndex];
  
  if (!time) {
    console.warn(`No time mapping for day ${raw.day}, slot ${raw.startTime}`);
  }

  return {
    id: raw.id,
    subject: raw.subject,
    teacher: raw.teacher,
    classroom: raw.room,
    dayOfWeek: raw.day,
    startTime: time?.start || '00:00',
    endTime: time?.end || '00:00',
    color: subjectColors[raw.subject] || '#7e57c2',
  };
}

// Crea mappa docente -> lezioni convertite
export const sampleTeacherSchedules: Record<string, Lesson[]> = {
  'FEA D.': (sampleSchedulesTeacherOnly['FEA_D'] || [])
    .map(convertRawToLesson)
    .sort((a, b) => (a.dayOfWeek - b.dayOfWeek) || a.startTime.localeCompare(b.startTime)),
  
  'MAGGIORE G.': (sampleSchedulesTeacherOnly['MAGGIORE_G'] || [])
    .map(convertRawToLesson)
    .sort((a, b) => (a.dayOfWeek - b.dayOfWeek) || a.startTime.localeCompare(b.startTime)),

  'CANONICO T.': (sampleSchedulesTeacherOnly['CANONICO_T'] || [])
    .map(convertRawToLesson)
    .sort((a, b) => (a.dayOfWeek - b.dayOfWeek) || a.startTime.localeCompare(b.startTime)),
};
