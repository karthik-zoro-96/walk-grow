import type { PermissionState, StepsProvider } from './types';

/**
 * Fallback provider for platforms without a native health integration (e.g. web). Metro
 * resolves stepsProvider.ios.ts / stepsProvider.android.ts ahead of this file on-device,
 * so this only ever runs where no native step source exists — always manual entry.
 */
const manualFallbackProvider: StepsProvider = {
  async isAvailable() {
    return false;
  },
  async requestPermission(): Promise<PermissionState> {
    return 'manual_fallback';
  },
  async getPermissionState(): Promise<PermissionState> {
    return 'manual_fallback';
  },
  async getStepsForDate() {
    return null;
  },
  async getStepsForDateRange() {
    return {};
  },
};

export const stepsProvider: StepsProvider = manualFallbackProvider;
