import { Lesson } from '@/lib/orario/models/lesson';

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve('denied');
  }
  if (Notification.permission === 'granted') return Promise.resolve('granted');
  if (Notification.permission === 'denied') return Promise.resolve('denied');
  return Notification.requestPermission();
}

export function scheduleLessonNotifications(lessons: Lesson[]): void {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') return;
  const now = Date.now();
  lessons.forEach(lesson => {
    const start = new Date(`2000-01-01T${lesson.startTime}:00`).getTime();
    const end = new Date(`2000-01-01T${lesson.endTime}:00`).getTime();
    // Notifica 5 minuti prima dell'inizio
    const notifyAt = start - 5 * 60 * 1000;
    const offset = notifyAt - (new Date().setFullYear(2000,0,1), Date.now());
    if (offset > 0 && offset < 6 * 60 * 60 * 1000) { // entro 6 ore
      setTimeout(() => {
        new Notification('Tra 5 minuti', {
          body: `${lesson.subject} (${lesson.startTime}) aula ${lesson.classroom || '—'}`,
          icon: '/icons/icon-192x192.png'
        });
      }, offset);
    }
    // Notifica fine lezione
    const endOffset = end - Date.now();
    if (endOffset > 0 && endOffset < 6 * 60 * 60 * 1000) {
      setTimeout(() => {
        new Notification('Lezione terminata', {
          body: `${lesson.subject} finita alle ${lesson.endTime}`,
          icon: '/icons/icon-192x192.png'
        });
      }, endOffset);
    }
  });
}
