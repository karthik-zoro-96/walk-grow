import AppleHealthKit from 'react-native-health';
import type { HealthInputOptions, HealthKitPermissions, HealthValue } from 'react-native-health';

import { addDaysToKey, formatDateKey, startOfLocalDayForKey } from '../domain/dateUtils';
import type { PermissionState, StepsProvider } from './types';

const READ_PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.StepCount],
    write: [],
  },
};

function checkIsAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    AppleHealthKit.isAvailable((err, available) => {
      resolve(!err && available);
    });
  });
}

function initHealthKit(): Promise<boolean> {
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(READ_PERMISSIONS, (err) => {
      resolve(!err);
    });
  });
}

function fetchDailyStepSamples(options: HealthInputOptions): Promise<HealthValue[]> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getDailyStepCountSamples(options, (err, results) => {
      if (err) {
        reject(new Error(err));
        return;
      }
      resolve(results ?? []);
    });
  });
}

function bucketSamplesByLocalDate(samples: HealthValue[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const sample of samples) {
    const key = formatDateKey(new Date(sample.startDate));
    totals[key] = (totals[key] ?? 0) + sample.value;
  }
  return totals;
}

export const stepsProvider: StepsProvider = {
  isAvailable: checkIsAvailable,

  async requestPermission(): Promise<PermissionState> {
    const available = await checkIsAvailable();
    if (!available) return 'unavailable';
    const granted = await initHealthKit();
    return granted ? 'granted' : 'denied';
  },

  async getPermissionState(): Promise<PermissionState> {
    // HealthKit's privacy model gives no reliable way to check read-permission status ahead
    // of a request (see react-native-health's getAuthStatus docs: read always reports
    // authorized). Callers rely on requestPermission()'s result at ask-time, and fall back to
    // manual entry if reads stay empty.
    const available = await checkIsAvailable();
    return available ? 'unknown' : 'unavailable';
  },

  async getStepsForDate(date: string): Promise<number | null> {
    const startDate = startOfLocalDayForKey(date).toISOString();
    const endDate = startOfLocalDayForKey(addDaysToKey(date, 1)).toISOString();
    const samples = await fetchDailyStepSamples({ startDate, endDate });
    if (samples.length === 0) return null;
    const totals = bucketSamplesByLocalDate(samples);
    return totals[date] ?? null;
  },

  async getStepsForDateRange(
    startDateKey: string,
    endDateKey: string,
  ): Promise<Record<string, number>> {
    const startDate = startOfLocalDayForKey(startDateKey).toISOString();
    const endDate = startOfLocalDayForKey(addDaysToKey(endDateKey, 1)).toISOString();
    const samples = await fetchDailyStepSamples({ startDate, endDate });
    return bucketSamplesByLocalDate(samples);
  },
};
