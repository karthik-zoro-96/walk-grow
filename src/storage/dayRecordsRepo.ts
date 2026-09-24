import { getDb } from './db';
import type { DayRecord } from '../domain/types';

interface DayRecordRow {
  date: string;
  step_count: number | null;
  goal_snapshot: number;
  is_rest_day_snapshot: number;
  last_synced_at: string | null;
}

function rowToDayRecord(row: DayRecordRow): DayRecord {
  return {
    date: row.date,
    stepCount: row.step_count,
    goalSnapshot: row.goal_snapshot,
    isRestDaySnapshot: row.is_rest_day_snapshot === 1,
  };
}

export function getDayRecord(date: string): DayRecord | null {
  const row = getDb().getFirstSync<DayRecordRow>('SELECT * FROM day_records WHERE date = ?', [
    date,
  ]);
  return row ? rowToDayRecord(row) : null;
}

export function getDayRecordsInRange(startDate: string, endDate: string): DayRecord[] {
  const rows = getDb().getAllSync<DayRecordRow>(
    'SELECT * FROM day_records WHERE date BETWEEN ? AND ? ORDER BY date ASC',
    [startDate, endDate],
  );
  return rows.map(rowToDayRecord);
}

export function getAllDayRecords(): DayRecord[] {
  const rows = getDb().getAllSync<DayRecordRow>('SELECT * FROM day_records ORDER BY date ASC');
  return rows.map(rowToDayRecord);
}

/**
 * Creates the row for `date` if it doesn't exist yet, snapshotting the goal/rest-day rules
 * that apply today. A no-op if the row already exists — goalSnapshot and isRestDaySnapshot
 * are earned once and must never be rewritten by a later settings change.
 */
export function ensureDayRecordExists(params: {
  date: string;
  goalSnapshot: number;
  isRestDaySnapshot: boolean;
}): void {
  getDb().runSync(
    `INSERT OR IGNORE INTO day_records (date, step_count, goal_snapshot, is_rest_day_snapshot, last_synced_at)
     VALUES (?, NULL, ?, ?, NULL)`,
    [params.date, params.goalSnapshot, params.isRestDaySnapshot ? 1 : 0],
  );
}

export function updateStepCount(date: string, stepCount: number, syncedAt: string): void {
  getDb().runSync('UPDATE day_records SET step_count = ?, last_synced_at = ? WHERE date = ?', [
    stepCount,
    syncedAt,
    date,
  ]);
}

export function deleteAllDayRecords(): void {
  getDb().runSync('DELETE FROM day_records');
}
