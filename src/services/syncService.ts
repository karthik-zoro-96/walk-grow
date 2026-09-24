import { addDaysToKey, dayOfWeekForKey, todayKey } from '../domain/dateUtils';
import { computeGardenState } from '../domain/growth';
import type { GardenState, UserSettings } from '../domain/types';
import { stepsProvider } from '../health/stepsProvider';
import type { PermissionState } from '../health/types';
import { ensureDayRecordExists, getAllDayRecords, updateStepCount } from '../storage/dayRecordsRepo';
import { saveGardenState } from '../storage/gardenStateRepo';

/** How many days back (plus today) to re-check on each sync, to catch data recorded while closed. */
const BACKFILL_DAYS = 2;

function isScheduledRestDay(dateKey: string, settings: UserSettings): boolean {
  return settings.restDays.includes(dayOfWeekForKey(dateKey));
}

function recomputeAndCacheGardenState(): GardenState {
  const state = computeGardenState(getAllDayRecords(), todayKey());
  saveGardenState(state);
  return state;
}

/**
 * Foreground-only sync: ensures today (and a short backfill window) have day_records
 * snapshotted under current settings, pulls step counts from the platform health provider
 * when available, and recomputes garden state. Safe to call repeatedly (e.g. on every
 * app open/resume) — all operations are idempotent.
 */
export async function syncRecentDays(settings: UserSettings): Promise<GardenState> {
  const today = todayKey();
  const dates = Array.from({ length: BACKFILL_DAYS + 1 }, (_, i) => addDaysToKey(today, -i));
  const earliestDate = dates[dates.length - 1];

  for (const date of dates) {
    ensureDayRecordExists({
      date,
      goalSnapshot: settings.dailyStepGoal,
      isRestDaySnapshot: isScheduledRestDay(date, settings),
    });
  }

  try {
    const available = await stepsProvider.isAvailable();
    if (available) {
      const steps = await stepsProvider.getStepsForDateRange(earliestDate, today);
      const syncedAt = new Date().toISOString();
      for (const [date, count] of Object.entries(steps)) {
        updateStepCount(date, count, syncedAt);
      }
    }
  } catch {
    // Health reads are best-effort; a failure here just leaves step_count as-is for this
    // pass (manual entry still works, and the next sync retries).
  }

  return recomputeAndCacheGardenState();
}

export function requestHealthPermission(): Promise<PermissionState> {
  return stepsProvider.requestPermission();
}

export function getHealthPermissionState(): Promise<PermissionState> {
  return stepsProvider.getPermissionState();
}

/** Manual step entry, used when health access is denied/unavailable, or as a correction. */
export function recordManualSteps(
  date: string,
  stepCount: number,
  settings: UserSettings,
): GardenState {
  ensureDayRecordExists({
    date,
    goalSnapshot: settings.dailyStepGoal,
    isRestDaySnapshot: isScheduledRestDay(date, settings),
  });
  updateStepCount(date, stepCount, new Date().toISOString());
  return recomputeAndCacheGardenState();
}
