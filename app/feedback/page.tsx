import styles from './feedback.module.css';
import Link from 'next/link';

export default function FeedbackPage() {
  const mail = 'r.vitale.2756@vallauri.edu';
  const cc = 'z.baravalle.2969@vallauri.edu';
  const subject = 'Orario PWA - Idea/Bug';

  const body = `Ciao,

Tipo segnalazione: [Idea / Bug]
Descrizione: 
Passi per riprodurre (se bug): 
Classe/Docente e Giorno (se utile): 
Dispositivo/SO/Navigatore: 

Grazie!`;

  const mailto = `mailto:${mail}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        {/* Back link */}
        <Link href="/orario" className={styles.backBtn}>
          ← Torna all'orario
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.icon}>💬</div>
          <h1 className={styles.title}>Feedback</h1>
          <p className={styles.subtitle}>
            Hai trovato un bug o hai un'idea per migliorare l'app?
            La mail sarà già precompilata con tutte le informazioni utili.
          </p>
        </div>

        <div className={styles.divider} />

        {/* Info list */}
        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <span className={styles.infoItemIcon}>🐛</span>
            <span>Segnala un bug con i passi per riprodurlo</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoItemIcon}>💡</span>
            <span>Proponi una nuova funzionalità o miglioramento</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoItemIcon}>⚡</span>
            <span>La risposta arriverà entro pochi giorni</span>
          </div>
        </div>

        {/* CTA */}
        <a href={mailto} className={styles.sendBtn}>
          ✉️ Invia feedback via email
        </a>

        <p className={styles.footer}>
          Risponde a: {mail}
        </p>

      </div>
    </div>
  );
}
