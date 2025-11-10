import { Lesson } from '@/lib/orario/models/lesson';

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve('denied');
  }
  if (Notification.permission === 'granted') return Promise.resolve('granted');
  if (Notification.permission === 'denied') return Promise.resolve('denied');
  return Notification.requestPermission();
}

// Mappa per tenere traccia dei timeout attivi
const activeTimeouts = new Map<string, number>();

// Cancella tutti i timeout attivi
export function clearAllNotifications(): void {
  activeTimeouts.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  activeTimeouts.clear();
}

// Converte un orario (HH:MM) nella data di oggi
function getTodayTimeInMs(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const today = new Date();
  today.setHours(hours, minutes, 0, 0);
  return today.getTime();
}

export function scheduleLessonNotifications(lessons: Lesson[]): void {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') return;
  
  // Cancella tutte le notifiche precedenti
  clearAllNotifications();
  
  const now = Date.now();
  
  lessons.forEach(lesson => {
    const startTimeMs = getTodayTimeInMs(lesson.startTime);
    const endTimeMs = getTodayTimeInMs(lesson.endTime);
    
    // Notifica 5 minuti prima dell'inizio
    const notifyBeforeMs = startTimeMs - (5 * 60 * 1000); // 5 minuti prima
    const timeUntilNotifyBefore = notifyBeforeMs - now;
    
    // Pianifica solo se la notifica è nel futuro e entro le prossime 24 ore
    if (timeUntilNotifyBefore > 0 && timeUntilNotifyBefore < 24 * 60 * 60 * 1000) {
      const timeoutId = window.setTimeout(() => {
        new Notification('⏰ Tra 5 minuti', {
          body: `${lesson.subject} inizia alle ${lesson.startTime}${lesson.classroom ? ` in aula ${lesson.classroom}` : ''}${lesson.teacher ? ` - ${lesson.teacher}` : ''}`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: `lesson-start-${lesson.id}`,
          requireInteraction: false,
        });
        activeTimeouts.delete(`before-${lesson.id}`);
      }, timeUntilNotifyBefore);
      
      activeTimeouts.set(`before-${lesson.id}`, timeoutId);
    }
    
    // Notifica alla fine della lezione
    const timeUntilEnd = endTimeMs - now;
    
    if (timeUntilEnd > 0 && timeUntilEnd < 24 * 60 * 60 * 1000) {
      const timeoutId = window.setTimeout(() => {
        new Notification('✅ Lezione terminata', {
          body: `${lesson.subject} è finita alle ${lesson.endTime}`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: `lesson-end-${lesson.id}`,
          requireInteraction: false,
        });
        activeTimeouts.delete(`end-${lesson.id}`);
      }, timeUntilEnd);
      
      activeTimeouts.set(`end-${lesson.id}`, timeoutId);
    }
  });
  
  // Log per debug
  console.log(`📢 Pianificate ${activeTimeouts.size} notifiche per ${lessons.length} lezioni`);
}
