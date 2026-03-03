# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2026-03-03

### ✨ Nuove Funzionalità

#### 🧭 Navigazione
- Aggiunta **BottomTabBar** per navigazione inferiore
- Nuovo componente **BrowseList** per la navigazione tra classi e docenti
- Nuovo pulsante di switch entità (studente ↔ docente) nella pagina orario

#### ⚙️ Setup
- Filtri per anno e settore nella pagina di setup con UI migliorata
- Script CSV per il parsing automatico degli orari dei docenti
- Aggiunti orari di numerosi docenti e classi (tra cui 5A INF, 4A MEC, 4A INF)

#### 🗄️ Backend
- Setup iniziale per database
- Prima API route con risposta GET

### 🎨 Miglioramenti UI/UX
- Redesign del componente `InlineSetup` per layout e responsività migliorati
- Stili aggiornati per `AllSchedulesView`, `BlockView` e `LessonCard` ottimizzati per mobile
- Corretta la UI degli orari per liceo e classi prime
- Migliorato supporto dark theme per `NotificationPrompt`

### 🐛 Bug Fix
- Rimosso `OnboardingTour` dalla pagina orario e dalla pagina di setup
- Corretti vari problemi di visualizzazione su mobile
- Commentata importazione connessione DB in `route.ts`

### 🔧 Miglioramenti Tecnici
- Rimossi componenti inutilizzati: `SnowfallEffect`, `InstallPrompt`, `NotificationPrompt`
- Semplificata la pagina di setup (rimossa modalità festività e icona Babbo Natale)
- Pulizia generale del codice e rimozione file non utilizzati
- Aggiunto `.cursor` al `.gitignore`

---

## [0.2.0] - 2025-11-10 - BETA

### ✨ Nuove Funzionalità

#### 🔔 Sistema Notifiche
- Aggiunto sistema completo di notifiche push per promemoria lezioni
- Notifica automatica 5 minuti prima dell'inizio di ogni lezione
- Notifica di conferma alla fine di ogni lezione
- Componente `NotificationPrompt` user-friendly per richiedere i permessi
- Gestione intelligente dei timeout con cleanup automatico
- Supporto completo per dark theme

#### 🔄 Modale Cambio Modalità
- Nuova UI dedicata per il cambio modalità (studente ↔ docente)
- Componente `ChangeModeModal` con design moderno e accessibile
- Conferma visiva con informazioni chiare su cosa succederà
- Animazioni fluide (fadeIn + slideUp)
- Supporto completo tastiera (ESC per chiudere)
- Design responsive per mobile

#### 🎨 Miglioramenti UI/UX
- Onboarding aggiornato con tutte le nuove funzionalità
- Rimossi dati sample: l'app ora carica solo dati reali
- L'app parte direttamente dalla pagina di setup/onboarding
- Migliorata accessibilità con ARIA labels e focus management
- Design coerente con dark mode per tutti i nuovi componenti

### 🐛 Bug Fix
- Corretto errore Service Worker con richieste POST (cache.put)
- Risolto problema 404 con file JSON delle classi (5ainf.json)
- Rimossi tutti i riferimenti ai dati sample dal codice
- Aggiunto controllo per metodi HTTP non-GET nel Service Worker
- Aggiunto optional chaining per prevenire errori null

### 🔧 Miglioramenti Tecnici
- Sistema di notifiche completamente riscritto con calcolo corretto del tempo
- Funzione `getTodayTimeInMs` per gestire orari della giornata corrente
- Gestione centralizzata dei timeout attivi delle notifiche
- Cleanup automatico delle notifiche quando cambia giorno o componente
- Rimossa dipendenza da `sampleSchedule.ts`
- Package.json ottimizzato per Windows (rimosso NODE_OPTIONS problematico)

### 📚 Documentazione
- Aggiornato onboarding con 8 step (aggiunti: notifiche e cambio modalità)
- CHANGELOG completamente riscritto e aggiornato
- Migliorati i commenti nel codice per manutenibilità

### 🗑️ Rimosso
- File `sampleSchedule.ts` e tutti i dati di esempio
- Fallback ai dati sample in `scheduleService.ts`
- Redirect diretto a `/orario` dalla root

---

## [0.1.0] - 2024-01-XX - BETA

### ✨ Prima Release (Beta)

#### Aggiunte
- Estrazione iniziale dalla sezione orario del portfolio principale
- Struttura base Next.js standalone
- Componenti UI per gestione orario
- Logica di base per orari e JSON

#### ⚠️ Limitazioni Note (Beta)
- Progetto in fase di test
- Possibili bug e comportamenti inattesi
- API e interfacce potrebbero cambiare nelle prossime versioni

#### 📝 Da Completare
- [x] Configurazione completa Tailwind
- [x] Test cross-browser
- [ ] Documentazione API completa
- [ ] Deploy su subdomain
