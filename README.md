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

## 🚀 Quick Start

### Prerequisiti

- Node.js 18+ 
- npm o yarn

### Installazione

```bash
# Clona il repository
git clone <repo-url>
cd orario-standalone

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 📦 Dipendenze Principali

```bash
npm install next@latest react react-dom
npm install -D tailwindcss postcss autoprefixer
npm install -D typescript @types/react @types/node # se usi TypeScript
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
