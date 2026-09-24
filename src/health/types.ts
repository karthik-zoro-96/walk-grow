export type PermissionState =
  | 'unknown'
  | 'checking'
  | 'not_requested'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'manual_fallback';

export interface StepsProvider {
  isAvailable(): Promise<boolean>;
  requestPermission(): Promise<PermissionState>;
  getPermissionState(): Promise<PermissionState>;
  /** Step count for a single device-local calendar date ('YYYY-MM-DD'), or null if no data. */
  getStepsForDate(date: string): Promise<number | null>;
  /** Batch fetch for a date range (inclusive), keyed by date. Missing dates had no data. */
  getStepsForDateRange(startDate: string, endDate: string): Promise<Record<string, number>>;
}
