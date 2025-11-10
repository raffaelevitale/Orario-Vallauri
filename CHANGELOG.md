# Changelog

All notable changes to this project will be documented in this file.

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
