# 📅 Orario Standalone

![Version](https://img.shields.io/badge/version-0.3.0-blue)
![Status](https://img.shields.io/badge/status-beta-orange)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![License](https://img.shields.io/badge/license-MIT-green)

> **⚠️ BETA v0.3.0** - Progetto in fase di sviluppo attivo. Potrebbero esserci bug e funzionalità incomplete.

## 📖 Descrizione

Applicazione standalone per la gestione degli orari, estratta dal portfolio principale per funzionare come servizio indipendente su sottodominio.

## ✨ Funzionalità

| Feature              | Stato     | Descrizione                                                                  |
| -------------------- | --------- | ---------------------------------------------------------------------------- |
| 📊 Gestione Orari     | ✅ Beta    | Visualizzazione e gestione base degli orari                                  |
| 🎨 UI Responsiva      | ✅ Beta    | Interfaccia adattiva Tailwind CSS                                            |
| 💾 Storage JSON       | ✅ Beta    | Persistenza dati locale                                                      |
| 🔔 Notifiche Lezioni  | ✅ Beta    | Notifiche push 5 min prima e fine lezione, prompt permessi, gestione timeout |
| 🔄 Cambio Modalità    | ✅ Beta    | Modale dedicata per cambio modalità studente/docente con UI moderna          |
| 🧭 Onboarding Guidato | ✅ Beta    | Tour onboarding aggiornato con tutte le nuove funzionalità                   |
| 🌙 Dark Mode          | ✅ Beta    | Supporto completo per tema scuro                                             |
| 🧭 BottomTabBar       | ✅ New     | Navigazione inferiore con switch studente/docente                            |
| 🔍 BrowseList         | ✅ New     | Esplorazione classi e docenti con filtri anno e settore                      |
| 🤖 Telegram Bot       | ✅ Beta    | Comandi `/oggi` `/domani` + promemoria automatici                            |
| 📱 PWA                | 📋 Planned | Supporto Progressive Web App                                                 |
| 🔄 Import/Export      | 🚧 WIP     | Funzionalità in sviluppo                                                     |

## 🗂️ Struttura del Progetto

```
orario-standalone/
├── app/
│   ├── orario/              # Routes e pages
│   └── components/orario/   # Componenti UI specifici
├── lib/orario/              # Logica business e utilities
├── public/orario/           # Assets statici
└── json/                    # File di configurazione JSON
```


## ⚙️ Novità v0.3.0

- **BottomTabBar** e **BrowseList** per navigazione migliorata
- **Switch entità** (studente ↔ docente) direttamente dalla pagina orario
- **Filtri anno e settore** nella pagina di setup
- **Orari docenti** aggiunti tramite script CSV di parsing
- **Redesign InlineSetup** con layout e responsività migliorati
- **Ottimizzazione mobile** per `AllSchedulesView`, `BlockView` e `LessonCard`
- **Pulizia codebase**: rimossi `SnowfallEffect`, `InstallPrompt`, `NotificationPrompt`, `OnboardingTour`
- **Setup iniziale database** e prima API route

## 🐛 Known Issues (Beta)

- Alcune funzionalità potrebbero non funzionare standalone
- Import path potrebbero richiedere aggiustamenti
- Testing cross-browser limitato

## 🗺️ Roadmap

- [x] **v0.2** - Stabilizzazione core features e onboarding
- [x] **v0.3** - Nuovi componenti navigazione, filtri setup e orari docenti
- [ ] **v0.4** - Import/Export completo e testing
- [ ] **v1.0** - Release stabile

## 🤖 Telegram Bot (MVP)

Il progetto include un bot Telegram con:

- webhook: `POST /api/telegram/webhook`
- preferenze utente (chat_id + entità): `GET/POST/DELETE /api/telegram/preferences`
- reminder schedulati: `GET/POST /api/telegram/reminders`

### 1) Configura variabili ambiente

Copia `.env.example` in `.env.local` e valorizza almeno:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `CRON_SECRET` (consigliato in produzione)

### 2) Registra il webhook Telegram

Usa il tuo dominio deployato (HTTPS obbligatorio):

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url":"https://YOUR_DOMAIN/api/telegram/webhook",
    "secret_token":"YOUR_TELEGRAM_WEBHOOK_SECRET",
    "allowed_updates":["message"]
  }'
```

### 3) Configura l’utente dal sito

In app: `Impostazioni -> Telegram Bot`

- apri il bot Telegram e invia `/start` (mostra il tuo `chat_id`);
- inserisci `chat_id` nel form;
- salva con la classe/docente attualmente selezionato.

### 4) Reminder ogni 5 minuti

`vercel.json` include un cron `*/5 * * * *` verso `/api/telegram/reminders`.

- Se `CRON_SECRET` è impostato, passa il secret tramite query/header (`secret`, `x-cron-secret` o `Authorization: Bearer ...`).
- Se `CRON_SECRET` non è impostato, la route accetta richieste cron Vercel con header `x-vercel-cron`.

### 5) Storage MVP

Le preferenze Telegram e lo stato reminder sono salvati in `.data/` (o in `TELEGRAM_STORAGE_DIR`, su Vercel fallback `/tmp/orario-telegram`).
Per produzione robusta è consigliato migrare su DB persistente.

## 📝 Changelog

Vedi [CHANGELOG.md](./CHANGELOG.md) per la cronologia completa delle modifiche.

## 🤝 Contributing

Questo progetto è in fase beta. Feedback e bug report sono benvenuti!

## 📄 License

MIT License - vedi [LICENSE](./LICENSE) per dettagli.

---

**🔗 Link Utili**
- [Documentazione Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Report Bug](../../issues)
