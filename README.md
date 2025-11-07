# 📅 Orario Standalone

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Status](https://img.shields.io/badge/status-beta-orange)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![License](https://img.shields.io/badge/license-MIT-green)

> **⚠️ BETA v0.1.0** - Progetto in fase di sviluppo attivo. Potrebbero esserci bug e funzionalità incomplete.

## 📖 Descrizione

Applicazione standalone per la gestione degli orari, estratta dal portfolio principale per funzionare come servizio indipendente su sottodominio.

## ✨ Funzionalità

| Feature | Stato | Descrizione |
|---------|-------|-------------|
| 📊 Gestione Orari | ✅ Beta | Visualizzazione e gestione base degli orari |
| 🎨 UI Responsiva | ✅ Beta | Interfaccia adattiva Tailwind CSS |
| 💾 Storage JSON | ✅ Beta | Persistenza dati locale |
| 🔄 Import/Export | 🚧 WIP | Funzionalità in sviluppo |
| 📱 PWA | 📋 Planned | Supporto Progressive Web App |

## 🗂️ Struttura del Progetto

Percorsi estratti dal portfolio principale:

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

# Configura Tailwind CSS (se necessario)
npx tailwindcss init -p

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

## ⚙️ Configurazione Post-Estrazione

### 1. Verifica Import Cross-App
- [ ] Controlla import di stili globali (`globals.css`)
- [ ] Verifica temi e variabili CSS condivise
- [ ] Aggiorna path relativi se necessario

### 2. Asset e Risorse
- [ ] Copia `globals.css` o crea versione lightweight
- [ ] Verifica riferimenti a `/public` del progetto principale
- [ ] Controlla font e icone personalizzate

### 3. State Management
- [ ] Se usa Context/Store globali, copiali o re-implementa
- [ ] Verifica dipendenze da store esterni
- [ ] Implementa state locale se necessario

### 4. Configurazione Next.js
- [ ] Aggiorna `next.config.js` per standalone
- [ ] Configura variabili d'ambiente (`.env.local`)
- [ ] Imposta base path se necessario per subdomain

## 🐛 Known Issues (Beta)

- Alcune funzionalità potrebbero non funzionare standalone
- Import path potrebbero richiedere aggiustamenti
- Testing cross-browser limitato

## 🗺️ Roadmap

- [ ] **v0.2** - Stabilizzazione core features
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
