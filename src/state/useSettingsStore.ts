import { create } from 'zustand';

import type { UserSettings } from '../domain/types';
import { getSettings, saveSettings } from '../storage/settingsRepo';

const DEFAULT_SETTINGS: UserSettings = {
  dailyStepGoal: 8000,
  restDays: [],
  onboardingCompleted: false,
  notificationsEnabled: false,
  reminderTime: null,
};

interface SettingsStore {
  settings: UserSettings;
  hydrated: boolean;
  hydrate: () => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ settings: getSettings(), hydrated: true });
  },
  updateSettings: (partial) => {
    const next = { ...get().settings, ...partial };
    saveSettings(next);
    set({ settings: next });
  },
}));
