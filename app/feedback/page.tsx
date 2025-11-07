export default function FeedbackPage() {
  const mail = 'r.vitale.2756@vallauri.edu';
  const subject = encodeURIComponent('Orario PWA - Idea/Bug');
  const bodyTemplate = encodeURIComponent(`Ciao Raffaele,%0D%0A%0D%0A` +
    `Tipo segnalazione: [Idea / Bug]%0D%0A` +
    `Descrizione: %0D%0A` +
    `Passi per riprodurre (se bug): %0D%0A` +
    `Classe/Docente e Giorno (se utile): %0D%0A` +
    `Dispositivo/SO/Navigatore: %0D%0A%0D%0A` +
    `Grazie!`);

  const mailto = `mailto:${mail}?subject=${subject}&body=${bodyTemplate}`;

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div className="card" style={{maxWidth:480,width:'100%'}}>
        <h1 style={{marginBottom:8}}>Feedback</h1>
        <p style={{marginBottom:16}}>Hai un'idea o hai trovato un problema? Scrivimi: la mail sarà già precompilata.</p>
        <a href={mailto} className="badge" style={{textDecoration:'none',display:'inline-block'}}>✉️ Invia email</a>
      </div>
    </div>
  );
}
