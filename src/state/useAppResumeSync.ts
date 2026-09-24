import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { syncRecentDays } from '../services/syncService';
import { useSettingsStore } from './useSettingsStore';

/**
 * Runs a step sync on mount and on every app foreground-resume (v1 is foreground-only,
 * per the sync strategy — a habit app already expects a daily open). Uses refs so the
 * AppState subscription is only set up once, regardless of how often the caller re-renders.
 */
export function useAppResumeSync(onSynced?: () => void): void {
  const settings = useSettingsStore((s) => s.settings);
  const settingsRef = useRef(settings);
  const onSyncedRef = useRef(onSynced);

  useEffect(() => {
    settingsRef.current = settings;
    onSyncedRef.current = onSynced;
  });

  useEffect(() => {
    let cancelled = false;

    function runSync() {
      syncRecentDays(settingsRef.current)
        .then(() => {
          if (!cancelled) onSyncedRef.current?.();
        })
        .catch(() => {
          // Non-fatal; the next open/resume retries.
        });
    }

    runSync();

    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status === 'active') runSync();
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);
}
