import { getDb } from './db';
import type { UserSettings } from '../domain/types';

interface SettingsRow {
  id: number;
  daily_step_goal: number;
  rest_days_json: string;
  onboarding_completed: number;
  notifications_enabled: number;
  reminder_time: string | null;
}

const DEFAULT_SETTINGS: UserSettings = {
  dailyStepGoal: 8000,
  restDays: [],
  onboardingCompleted: false,
  notificationsEnabled: false,
  reminderTime: null,
};

function rowToSettings(row: SettingsRow): UserSettings {
  return {
    dailyStepGoal: row.daily_step_goal,
    restDays: JSON.parse(row.rest_days_json) as number[],
    onboardingCompleted: row.onboarding_completed === 1,
    notificationsEnabled: row.notifications_enabled === 1,
    reminderTime: row.reminder_time,
  };
}

export function getSettings(): UserSettings {
  const row = getDb().getFirstSync<SettingsRow>('SELECT * FROM settings WHERE id = 1');
  return row ? rowToSettings(row) : DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  getDb().runSync(
    `INSERT INTO settings (id, daily_step_goal, rest_days_json, onboarding_completed, notifications_enabled, reminder_time)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       daily_step_goal = excluded.daily_step_goal,
       rest_days_json = excluded.rest_days_json,
       onboarding_completed = excluded.onboarding_completed,
       notifications_enabled = excluded.notifications_enabled,
       reminder_time = excluded.reminder_time`,
    [
      settings.dailyStepGoal,
      JSON.stringify(settings.restDays),
      settings.onboardingCompleted ? 1 : 0,
      settings.notificationsEnabled ? 1 : 0,
      settings.reminderTime,
    ],
  );
}
