import { NextResponse } from "next/server";

const CALENDAR_ID = "c_85akbq4jlv6b04u8du4987p40@group.calendar.google.com";
const CALENDAR_TZ = "Europe/Rome";
const ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(
  CALENDAR_ID
)}/public/basic.ics`;
const GOOGLE_CALENDAR_API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;

type ParsedDate = {
  dateKey: string;
  timeLabel: string | null;
  minutes: number;
  isAllDay: boolean;
};

type CalendarApiItem = {
  id: string;
  status?: string;
  summary?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

function formatDateKeyFromDate(date: Date, timeZone: string) {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return formatted.replace(/-/g, "");
}

function formatTimeFromDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getTimeZoneOffsetString(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const tzPart = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = tzPart.match(/GMT([+-]\\d{1,2})(?::(\\d{2}))?/);
  if (!match) return "+00:00";
  const sign = match[1].startsWith("-") ? "-" : "+";
  const hours = Math.abs(Number(match[1])).toString().padStart(2, "0");
  const minutes = (match[2] || "00").padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function formatDateKeyToIso(dateKey: string, time: string, offset: string) {
  return `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(
    6,
    8
  )}T${time}${offset}`;
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: CALENDAR_TZ,
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(new Date());
}

function unfoldLines(text: string) {
  return text.replace(/\r\n[ \t]/g, "").split(/\r?\n/);
}

function cleanValue(value: string) {
  return value
    .replace(/\\n/g, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .trim();
}

function parseIcsDate(value: string, params: Record<string, string | true>) {
  const isDateOnly = params.VALUE === "DATE" || value.length === 8;
  if (isDateOnly) {
    return {
      dateKey: value.slice(0, 8),
      timeLabel: null,
      minutes: 0,
      isAllDay: true,
    } satisfies ParsedDate;
  }

  const dateKey = value.slice(0, 8);
  const timePart = value.split("T")[1] || "";
  const timeRaw = timePart.replace("Z", "").slice(0, 6);
  const hours = Number(timeRaw.slice(0, 2) || "0");
  const minutes = Number(timeRaw.slice(2, 4) || "0");

  if (value.endsWith("Z")) {
    const iso = `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(
      6,
      8
    )}T${timeRaw.slice(0, 2)}:${timeRaw.slice(2, 4)}:${
      timeRaw.slice(4, 6) || "00"
    }Z`;
    const date = new Date(iso);
    const timeLabel = formatTimeFromDate(date, CALENDAR_TZ);
    const parsedMinutes =
      Number(timeLabel.slice(0, 2)) * 60 + Number(timeLabel.slice(3, 5));
    return {
      dateKey: formatDateKeyFromDate(date, CALENDAR_TZ),
      timeLabel,
      minutes: parsedMinutes,
      isAllDay: false,
    } satisfies ParsedDate;
  }

  return {
    dateKey,
    timeLabel: `${timeRaw.slice(0, 2)}:${timeRaw.slice(2, 4)}`,
    minutes: hours * 60 + minutes,
    isAllDay: false,
  } satisfies ParsedDate;
}

async function fetchCalendarApiEvents() {
  if (!GOOGLE_CALENDAR_API_KEY) return null;

  const todayKey = formatDateKeyFromDate(new Date(), CALENDAR_TZ);
  const tomorrowKey = formatDateKeyFromDate(
    new Date(Date.now() + 24 * 60 * 60 * 1000),
    CALENDAR_TZ
  );
  const todayOffset = getTimeZoneOffsetString(new Date(), CALENDAR_TZ);
  const tomorrowOffset = getTimeZoneOffsetString(
    new Date(Date.now() + 24 * 60 * 60 * 1000),
    CALENDAR_TZ
  );

  const timeMin = formatDateKeyToIso(todayKey, "00:00:00", todayOffset);
  const timeMax = formatDateKeyToIso(tomorrowKey, "00:00:00", tomorrowOffset);

  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID
    )}/events`
  );
  url.searchParams.set("key", GOOGLE_CALENDAR_API_KEY);
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("timeZone", CALENDAR_TZ);

  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) return null;
  const data = await response.json();
  const items: CalendarApiItem[] = Array.isArray(data.items)
    ? (data.items as CalendarApiItem[])
    : [];

  const events = items
    .filter((item) => item.status !== "cancelled")
    .map((item) => {
      const startRaw = item.start?.dateTime || item.start?.date;
      const endRaw = item.end?.dateTime || item.end?.date;
      const isAllDay = Boolean(item.start?.date);

      let timeLabel = "Giornata intera";
      let sortIndex = -1;

      if (!isAllDay && startRaw) {
        const startDate = new Date(startRaw);
        const endDate = endRaw ? new Date(endRaw) : null;
        const startLabel = formatTimeFromDate(startDate, CALENDAR_TZ);
        const endLabel = endDate ? formatTimeFromDate(endDate, CALENDAR_TZ) : "";
        timeLabel = endLabel ? `${startLabel} - ${endLabel}` : startLabel;
        sortIndex =
          Number(startLabel.slice(0, 2)) * 60 + Number(startLabel.slice(3, 5));
      }

      return {
        id: item.id,
        summary: item.summary || "Evento",
        timeLabel,
        location: item.location || undefined,
        isAllDay,
        sortIndex,
      };
    });

  events.sort((a, b) => a.sortIndex - b.sortIndex);
  return events;
}

async function fetchIcsEvents() {
  const response = await fetch(ICS_URL, { next: { revalidate: 300 } });
  if (!response.ok) return null;
  const ics = await response.text();
  if (!ics.includes("BEGIN:VEVENT")) return null;
  const lines = unfoldLines(ics);
  const todayKey = formatDateKeyFromDate(new Date(), CALENDAR_TZ);

  let currentEvent: {
    summary?: string;
    location?: string;
    description?: string;
    start?: ParsedDate;
    end?: ParsedDate;
  } | null = null;

  const events: Array<{
    id: string;
    summary: string;
    timeLabel: string;
    location?: string;
    isAllDay: boolean;
    sortIndex: number;
  }> = [];

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      currentEvent = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (currentEvent?.summary && currentEvent.start) {
        const start = currentEvent.start;
        const end = currentEvent.end;
        const todayNumber = Number(todayKey);
        const startNumber = Number(start.dateKey);
        const endNumber = end ? Number(end.dateKey) : startNumber;

        const isToday =
          start.dateKey === todayKey ||
          (start.isAllDay &&
            startNumber <= todayNumber &&
            todayNumber < endNumber);

        if (isToday) {
          const timeLabel = start.isAllDay
            ? "Giornata intera"
            : end?.timeLabel
              ? `${start.timeLabel} - ${end.timeLabel}`
              : start.timeLabel || "";
          events.push({
            id: `${start.dateKey}-${currentEvent.summary}-${timeLabel}`,
            summary: currentEvent.summary,
            timeLabel,
            location: currentEvent.location,
            isAllDay: start.isAllDay,
            sortIndex: start.isAllDay ? -1 : start.minutes,
          });
        }
      }
      currentEvent = null;
      continue;
    }

    if (!currentEvent) continue;
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const rawKey = line.slice(0, separatorIndex);
    const rawValue = line.slice(separatorIndex + 1);
    const [key, ...paramParts] = rawKey.split(";");
    const params = paramParts.reduce<Record<string, string | true>>(
      (acc, entry) => {
        const [paramKey, paramValue] = entry.split("=");
        acc[paramKey] = paramValue ?? true;
        return acc;
      },
      {}
    );

    switch (key) {
      case "SUMMARY":
        currentEvent.summary = cleanValue(rawValue);
        break;
      case "LOCATION":
        currentEvent.location = cleanValue(rawValue);
        break;
      case "DESCRIPTION":
        currentEvent.description = cleanValue(rawValue);
        break;
      case "DTSTART":
        currentEvent.start = parseIcsDate(rawValue, params);
        break;
      case "DTEND":
        currentEvent.end = parseIcsDate(rawValue, params);
        break;
      default:
        break;
    }
  }

  events.sort((a, b) => a.sortIndex - b.sortIndex);
  return events;
}

export async function GET() {
  try {
    const apiEvents = await fetchCalendarApiEvents();
    if (apiEvents) {
      return NextResponse.json({
        dateLabel: getTodayLabel(),
        events: apiEvents,
      });
    }

    const icsEvents = await fetchIcsEvents();
    if (icsEvents) {
      return NextResponse.json({
        dateLabel: getTodayLabel(),
        events: icsEvents,
      });
    }

    return NextResponse.json(
      { dateLabel: getTodayLabel(), events: [] },
      { status: 500 }
    );
  } catch {
    return NextResponse.json(
      { dateLabel: getTodayLabel(), events: [] },
      { status: 500 }
    );
  }
}
