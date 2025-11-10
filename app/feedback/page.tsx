export default function FeedbackPage() {
  const mail = 'r.vitale.2756@vallauri.edu';
  const subject = 'Orario PWA - Idea/Bug';

  const body = `
Ciao Raffaele,

Tipo segnalazione: [Idea / Bug]
Descrizione: 
Passi per riprodurre (se bug): 
Classe/Docente e Giorno (se utile): 
Dispositivo/SO/Navigatore: 

Grazie!
  `;

  const mailto = `mailto:${mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card" style={{ maxWidth: 480, width: '100%' }}>
        <h1 style={{ marginBottom: 8 }}>Feedback</h1>
        <p style={{ marginBottom: 16 }}>
          Hai un'idea o hai trovato un problema? Scrivimi: la mail sarà già precompilata.
        </p>
        <a
          href={mailto}
          className="badge"
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          ✉️ Invia email
        </a>
      </div>
    </div>
  );
}