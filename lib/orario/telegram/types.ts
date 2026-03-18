import { Lesson } from "@/lib/orario/models/lesson";

export type EntityType = "student" | "teacher";

export interface TelegramPreference {
  chatId: string;
  entityType: EntityType;
  entityName: string;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TelegramCommandInput {
  chatId: string;
  text: string;
  fromFirstName?: string | null;
}

export interface TelegramCommandResponse {
  text: string;
  disableNotification?: boolean;
}

export interface TelegramReminderMessage {
  key: string;
  chatId: string;
  text: string;
}

export interface ScheduleQuery {
  entityType: EntityType;
  entityName: string;
}

export type TelegramLesson = Lesson;
