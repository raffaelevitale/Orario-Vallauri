import { promises as fs } from "node:fs";
import path from "node:path";
import { TelegramPreference } from "@/lib/orario/telegram/types";

interface PreferencesStore {
  version: 1;
  preferences: Record<string, TelegramPreference>;
}

interface RemindersStore {
  version: 1;
  sent: Record<string, string>;
}

const PREFERENCES_FILENAME = "telegram-preferences.json";
const REMINDERS_FILENAME = "telegram-reminders.json";
const REMINDER_RETENTION_DAYS = 7;

let writeQueue: Promise<void> = Promise.resolve();

function getStorageDir(): string {
  const envPath = process.env.TELEGRAM_STORAGE_DIR?.trim();
  if (envPath) return envPath;
  if (process.env.VERCEL) return "/tmp/orario-telegram";
  return path.join(process.cwd(), ".data");
}

function getPreferencesFilePath(): string {
  return path.join(getStorageDir(), PREFERENCES_FILENAME);
}

function getRemindersFilePath(): string {
  return path.join(getStorageDir(), REMINDERS_FILENAME);
}

async function ensureStorageDir(): Promise<void> {
  await fs.mkdir(getStorageDir(), { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    const e = error as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return fallback;
    throw error;
  }
}

function enqueueWrite<T>(writer: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(writer, writer);
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readPreferencesStore(): Promise<PreferencesStore> {
  return readJsonFile<PreferencesStore>(getPreferencesFilePath(), {
    version: 1,
    preferences: {},
  });
}

async function writePreferencesStore(store: PreferencesStore): Promise<void> {
  await ensureStorageDir();
  await fs.writeFile(getPreferencesFilePath(), JSON.stringify(store, null, 2), "utf-8");
}

async function readRemindersStore(): Promise<RemindersStore> {
  const store = await readJsonFile<RemindersStore>(getRemindersFilePath(), {
    version: 1,
    sent: {},
  });
  return cleanupExpiredReminderKeys(store);
}

async function writeRemindersStore(store: RemindersStore): Promise<void> {
  await ensureStorageDir();
  await fs.writeFile(getRemindersFilePath(), JSON.stringify(store, null, 2), "utf-8");
}

function cleanupExpiredReminderKeys(store: RemindersStore): RemindersStore {
  const cutoff = Date.now() - REMINDER_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const next: Record<string, string> = {};

  for (const [key, isoDate] of Object.entries(store.sent)) {
    const parsed = Date.parse(isoDate);
    if (Number.isNaN(parsed)) continue;
    if (parsed >= cutoff) {
      next[key] = isoDate;
    }
  }

  return {
    ...store,
    sent: next,
  };
}

export function isValidChatId(chatId: string): boolean {
  return /^-?\d{4,20}$/.test(chatId.trim());
}

export async function listTelegramPreferences(): Promise<TelegramPreference[]> {
  const store = await readPreferencesStore();
  return Object.values(store.preferences).sort((a, b) => a.chatId.localeCompare(b.chatId));
}

export async function getTelegramPreference(chatId: string): Promise<TelegramPreference | null> {
  const normalizedChatId = chatId.trim();
  if (!normalizedChatId) return null;
  const store = await readPreferencesStore();
  return store.preferences[normalizedChatId] ?? null;
}

export async function upsertTelegramPreference(
  input: Pick<TelegramPreference, "chatId" | "entityType" | "entityName" | "notificationsEnabled">
): Promise<TelegramPreference> {
  const normalizedChatId = input.chatId.trim();
  const normalizedEntityName = input.entityName.trim();
  const now = new Date().toISOString();

  if (!isValidChatId(normalizedChatId)) {
    throw new Error("Invalid chatId format");
  }

  if (!normalizedEntityName) {
    throw new Error("entityName is required");
  }

  return enqueueWrite(async () => {
    const store = await readPreferencesStore();
    const existing = store.preferences[normalizedChatId];
    const next: TelegramPreference = {
      chatId: normalizedChatId,
      entityType: input.entityType,
      entityName: normalizedEntityName,
      notificationsEnabled: input.notificationsEnabled,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    store.preferences[normalizedChatId] = next;
    await writePreferencesStore(store);
    return next;
  });
}

export async function deleteTelegramPreference(chatId: string): Promise<boolean> {
  const normalizedChatId = chatId.trim();
  if (!normalizedChatId) return false;

  return enqueueWrite(async () => {
    const store = await readPreferencesStore();
    if (!store.preferences[normalizedChatId]) return false;
    delete store.preferences[normalizedChatId];
    await writePreferencesStore(store);
    return true;
  });
}

export async function getRecentReminderKeys(): Promise<Set<string>> {
  const store = await readRemindersStore();
  return new Set(Object.keys(store.sent));
}

export async function markReminderAsSent(reminderKey: string): Promise<void> {
  const key = reminderKey.trim();
  if (!key) return;

  await enqueueWrite(async () => {
    const store = await readRemindersStore();
    store.sent[key] = new Date().toISOString();
    await writeRemindersStore(store);
  });
}
