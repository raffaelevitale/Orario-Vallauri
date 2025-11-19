const COLORI_MATERIE: Record<string, string> = {
    'italiano': '#8d6e63',
    'lingua e letteratura italiana': '#8d6e63',
    'storia': '#fbc02d',
    'storia e geografia': '#f9a825',
    'geografia': '#f9a825',
    'geografia turistica': '#fdd835',
    'filosofia': '#7e57c2',
    'arte e territorio': '#e91e63',
    'disegno e storia dell\'arte': '#ec407a',

    'inglese': '#1e88e5',
    'lingua inglese': '#1e88e5',
    'lingua e cultura inglese': '#1e88e5',
    'lingua francese': '#5e35b1',
    'lingua spagnola': '#e53935',

    'matematica': '#ef5350',
    'matematica e complementi': '#ef5350',
    'fisica': '#42a5f5',
    'fisica e laboratorio': '#42a5f5',
    'chimica': '#66bb6a',
    'scienze naturali': '#4caf50',
    'scienze integrate chimica': '#66bb6a',
    'scienze integrate fisica': '#42a5f5',
    'scienze integrate scienze': '#4caf50',
    'lab. scienze integrate chimica': '#66bb6a',
    'lab. scienze integrate fisica': '#42a5f5',
    'lab. di chimica e di fisica': '#26a69a',

    'informatica': '#7e57c2',
    'sistemi e reti': '#9c27b0',
    'tpsit': '#ab47bc',
    't.p.s.i.t': '#ab47bc',
    't.p.s.i.t.': '#ab47bc',
    'telecomunicazioni': '#673ab7',
    'tecnologie informatiche': '#512da8',
    'gestione progetto': '#ba68c8',
    'gestione progetto, organizzazione d\'impresa': '#ba68c8',
    'scienze e tecnologie applicate informatiche': '#7e57c2',

    'elettrotecnica ed elettronica': '#ff6f00',
    't.p.s.e.e.': '#ff8f00',
    'impianti energetici, disegno e progettazione': '#ffa726',
    'scienze e tecnologie applicate elettriche': '#ff9800',
    'sistemi automatici': '#fb8c00',

    'meccanica, macchine ed energia': '#546e7a',
    'tecnologie meccaniche di processo e prodotto': '#607d8b',
    'sistemi e automazione': '#78909c',
    'd.p.o.i.': '#90a4ae',
    'disegno, progettazione e organizzazione industriale': '#90a4ae',
    'ufficio tecnico': '#b0bec5',
    'scienze e tecnologie applicate meccaniche': '#546e7a',

    'economia aziendale': '#ff9800',
    'economia politica': '#ffa726',
    'diritto': '#ff7043',
    'diritto ed economia': '#ff7043',
    'diritto e legislazione turistica': '#ff8a65',
    'discipline turistiche e aziendali': '#ffab91',

    'scienze motorie': '#26a69a',
    'scienze motorie e sportive': '#26a69a',
    'ginnastica': '#26a69a',
    'religione': '#fbc02d',
    'religione cattolica e attività alternative': '#fbc02d',
    'religione cattolica o attività alternative': '#fbc02d',

    'tecnologie e rap. grafica': '#3f51b5',
    'tecnologie e rappresentazioni grafiche': '#3f51b5',
};


function formattaNome(subject: string): string {
    return subject.toLowerCase().trim()
        .replace(/\s+/g, ' ')
        .replace(/\./g, '');
}


export function getSubjectColor(subject: string): string {
    if (subject === 'Intervallo' || subject === 'INTERVALLO') {
        return '#bdbdbd';
    }
    if (subject.startsWith('🕐')) {
        return '#e0e0e0';
    }

    const formattata = formattaNome(subject);

    // Cerca nella mappa diretta
    const color = COLORI_MATERIE[formattata];
    if (color) {
        return color;
    }

    // Se non trovato, cerca per parola chiave parziale
    for (const [key, value] of Object.entries(COLORI_MATERIE)) {
        if (formattata.includes(key) || key.includes(formattata)) {
            return value;
        }
    }

    // Colore di default per materie non mappate
    return '#9e9e9e';
}

/**
 * Ottiene tutti i colori utilizzati in un array di materie
 * Utile per debugging e per verificare la distribuzione dei colori
 */
export function prendiColoreMateria(subjects: string[]): Map<string, string> {
    const colorMap = new Map<string, string>();

    for (const subject of subjects) {
        const formattata = formattaNome(subject);
        if (!colorMap.has(formattata)) {
            colorMap.set(subject, getSubjectColor(subject));
        }
    }

    return colorMap;
}
