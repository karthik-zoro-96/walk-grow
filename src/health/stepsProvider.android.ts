import {
  aggregateRecord,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  requestPermission as requestHealthConnectPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

import { addDaysToKey, compareDateKeys, startOfLocalDayForKey } from '../domain/dateUtils';
import type { PermissionState, StepsProvider } from './types';

const STEPS_READ_PERMISSION = { accessType: 'read', recordType: 'Steps' } as const;

let initializedPromise: Promise<boolean> | null = null;

function ensureInitialized(): Promise<boolean> {
  if (!initializedPromise) {
    initializedPromise = initialize();
  }
  return initializedPromise;
}

async function checkIsAvailable(): Promise<boolean> {
  const status = await getSdkStatus();
  return status === SdkAvailabilityStatus.SDK_AVAILABLE;
}

async function getStepsCountForDay(dateKey: string): Promise<number | null> {
  const available = await checkIsAvailable();
  if (!available) return null;
  const initialized = await ensureInitialized();
  if (!initialized) return null;

  const startTime = startOfLocalDayForKey(dateKey).toISOString();
  const endTime = startOfLocalDayForKey(addDaysToKey(dateKey, 1)).toISOString();

  const result = await aggregateRecord({
    recordType: 'Steps',
    timeRangeFilter: { operator: 'between', startTime, endTime },
  });

  return result.COUNT_TOTAL;
}

export const stepsProvider: StepsProvider = {
  isAvailable: checkIsAvailable,

  async requestPermission(): Promise<PermissionState> {
    const available = await checkIsAvailable();
    if (!available) return 'unavailable';
    const initialized = await ensureInitialized();
    if (!initialized) return 'unavailable';

    const granted = await requestHealthConnectPermission([STEPS_READ_PERMISSION]);
    const wasGranted = granted.some((p) => p.accessType === 'read' && p.recordType === 'Steps');
    return wasGranted ? 'granted' : 'denied';
  },

  async getPermissionState(): Promise<PermissionState> {
    const available = await checkIsAvailable();
    if (!available) return 'unavailable';
    const initialized = await ensureInitialized();
    if (!initialized) return 'unavailable';

    const granted = await getGrantedPermissions();
    const hasStepsRead = granted.some((p) => p.accessType === 'read' && p.recordType === 'Steps');
    return hasStepsRead ? 'granted' : 'not_requested';
  },

  getStepsForDate: getStepsCountForDay,

  async getStepsForDateRange(
    startDateKey: string,
    endDateKey: string,
  ): Promise<Record<string, number>> {
    const totals: Record<string, number> = {};
    let cursor = startDateKey;
    while (compareDateKeys(cursor, endDateKey) <= 0) {
      const count = await getStepsCountForDay(cursor);
      if (count !== null) totals[cursor] = count;
      cursor = addDaysToKey(cursor, 1);
    }
    return totals;
  },
};
