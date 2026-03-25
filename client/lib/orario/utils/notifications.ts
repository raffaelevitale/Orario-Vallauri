import type { Lesson } from "@/lib/orario/models/lesson";

const scheduledTimeouts = new Set<number>();
const ADVANCE_MINUTES = 5;

function supportsNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

function getNotificationBody(lesson: Lesson) {
  const parts = [lesson.subject];

  if (lesson.classroom) {
    parts.push(lesson.classroom);
  }

  if (lesson.teacher) {
    parts.push(lesson.teacher);
  }

  return parts.join(" · ");
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!supportsNotifications()) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return Notification.requestPermission();
}

export function clearAllNotifications() {
  scheduledTimeouts.forEach((timeoutId) => {
    window.clearTimeout(timeoutId);
  });
  scheduledTimeouts.clear();
}

export function scheduleLessonNotifications(lessons: Lesson[]) {
  if (!supportsNotifications() || Notification.permission !== "granted") {
    return;
  }

  clearAllNotifications();

  const now = Date.now();
  const today = new Date();

  lessons.forEach((lesson) => {
    if (lesson.isBreak) {
      return;
    }

    const [hours, minutes] = lesson.startTime.split(":").map(Number);
    const lessonDate = new Date(today);
    lessonDate.setHours(hours, minutes - ADVANCE_MINUTES, 0, 0);

    const delay = lessonDate.getTime() - now;
    if (delay <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      try {
        new Notification(`Tra ${ADVANCE_MINUTES} min: ${lesson.subject}`, {
          body: getNotificationBody(lesson),
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          tag: `lesson-${lesson.id}`,
        });
      } finally {
        scheduledTimeouts.delete(timeoutId);
      }
    }, delay);

    scheduledTimeouts.add(timeoutId);
  });
}
