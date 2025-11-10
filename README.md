# 📅 Orario Standalone

![Version](https://img.shields.io/badge/version-0.2.0-blue)
![Status](https://img.shields.io/badge/status-beta-orange)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![License](https://img.shields.io/badge/license-MIT-green)

> **⚠️ BETA v0.2.0** - Progetto in fase di sviluppo attivo. Potrebbero esserci bug e funzionalità incomplete.

## 📖 Descrizione

Applicazione standalone per la gestione degli orari, estratta dal portfolio principale per funzionare come servizio indipendente su sottodominio.

## ✨ Funzionalità

| Feature              | Stato     | Descrizione                                                                  |
| -------------------- | --------- | ---------------------------------------------------------------------------- |
| 📊 Gestione Orari     | ✅ Beta    | Visualizzazione e gestione base degli orari                                  |
| 🎨 UI Responsiva      | ✅ Beta    | Interfaccia adattiva Tailwind CSS                                            |
| 💾 Storage JSON       | ✅ Beta    | Persistenza dati locale                                                      |
| 🔔 Notifiche Lezioni  | ✅ New     | Notifiche push 5 min prima e fine lezione, prompt permessi, gestione timeout |
| 🔄 Cambio Modalità    | ✅ New     | Modale dedicata per cambio modalità studente/docente con UI moderna          |
| 🧭 Onboarding Guidato | ✅ New     | Tour onboarding aggiornato con tutte le nuove funzionalità                   |
| 🌙 Dark Mode          | ✅ Beta    | Supporto completo per tema scuro                                             |
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

## ⚙️ Novità v0.2.0

- **Sistema notifiche push** per promemoria lezioni (5 min prima e fine lezione)
- **Modale cambio modalità** con UI dedicata, animazioni e accessibilità
- **Onboarding guidato** aggiornato con tutte le nuove funzionalità
- **Rimossi dati sample**: l'app parte solo dalla pagina di setup/onboarding
- **Migliorata accessibilità** (ARIA labels, gestione focus, supporto tastiera)
- **Bugfix Service Worker** e gestione file JSON
- **Ottimizzazione Windows** (fix NODE_OPTIONS)
- **Documentazione e CHANGELOG** aggiornati

## 🐛 Known Issues (Beta)

- Alcune funzionalità potrebbero non funzionare standalone
- Import path potrebbero richiedere aggiustamenti
- Testing cross-browser limitato

## 🗺️ Roadmap

- [x] **v0.2** - Stabilizzazione core features e onboarding
- [ ] **v0.3** - Import/Export completo
- [ ] **v0.4** - Testing e bug fixing
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